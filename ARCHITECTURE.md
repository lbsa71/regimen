# Architecture

This document describes the technical architecture of **regimen**, a training regimen tracker application.

---

## Overview

Regimen is a full-stack web application with a simple, single-container deployment model. The architecture prioritizes simplicity and maintainability over scalability.

```
+-------------------+
|   Docker Image    |
|  +-------------+  |
|  |   React     |  |
|  |  Frontend   |  |
|  +------+------+  |
|         |         |
|  +------v------+  |
|  |   Node.js   |  |
|  |   Backend   |  |
|  +------+------+  |
+---------|----------+
          |
  +-------v-------+
  |  File-based   |
  |   Storage     |
  | (host mount)  |
  +---------------+
```

---

## Project Structure

The project uses npm workspaces to manage the monorepo:

```
regimen/
├── frontend/                 # React/Vite workspace
│   ├── src/
│   │   ├── App.tsx          # Root component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                  # Express.js workspace
│   ├── src/
│   │   └── index.ts         # Express server
│   ├── package.json
│   └── tsconfig.json
│
├── src/
│   └── client/              # Shared React components
│       ├── components/
│       │   ├── ExerciseList.tsx
│       │   ├── ExerciseRow.tsx
│       │   ├── Header.tsx
│       │   └── SignIn.tsx
│       ├── hooks/
│       │   ├── useAuth.tsx
│       │   └── useApi.ts
│       ├── types/
│       │   └── index.ts
│       ├── utils/
│       │   └── exercises.ts
│       └── __tests__/
│           └── exercises.test.ts
│
├── public/                   # Static assets
│   └── index.html
│
├── .github/
│   └── workflows/
│       └── docker-build.yml  # CI/CD pipeline
│
├── Dockerfile                # Multi-stage build
├── package.json              # Root workspace config
├── tsconfig.base.json        # Shared TypeScript config
├── ARCHITECTURE.md
├── CLAUDE.md
├── CONTRIBUTING.md
└── README.md
```

---

## Frontend

### Technology Stack

- **Framework**: React 18.2
- **Language**: TypeScript 5.3
- **Build Tool**: Vite 5.0
- **Testing**: Vitest 1.1

### Responsibilities

- Render the exercise list with eligibility status
- Handle user input for weight and reps
- Perform client-side unit conversion (kg/lbs)
- Manage Google OAuth authentication flow
- Communicate with backend via REST API

### Key Components

| Component | Purpose |
|-----------|---------|
| `ExerciseList` | Main view displaying sorted, grouped exercises |
| `ExerciseRow` | Individual exercise with input fields and history |
| `Header` | Navigation bar with user profile |
| `SignIn` | Google OAuth login page |

### Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Google OAuth context, token management, sign in/out |
| `useApi` | Authenticated API requests to backend |

### Business Logic (utils/exercises.ts)

- **Eligibility**: Exercise is eligible if not performed yesterday
- **Sorting**: Category (Push → Pull → Legs), then 14-day frequency, then recency
- **Formatting**: Date display as `ddd dd/mm`, weight conversion between kg/lbs

---

## Backend

### Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3
- **Framework**: Express.js 4.18
- **Testing**: Vitest 1.1

### Responsibilities

- Serve the built frontend static files (in production)
- Provide REST API endpoints for exercise data
- Validate Google OAuth tokens
- Read/write user data to file storage

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/exercises` | List all exercises with history |
| POST | `/api/exercises/:id/log` | Log a completed exercise |
| GET | `/api/history` | Get user's exercise history |

### Authentication

- All API endpoints (except `/api/health`) require a valid Google OAuth token
- Token is passed via `Authorization: Bearer <token>` header
- Backend validates token with Google's OAuth API
- User is identified by their Google ID extracted from the token

---

## Data Storage

### Strategy

File-based storage with one JSON file per user (Google ID).

### Structure

```
/data
  /<google-id-1>.json
  /<google-id-2>.json
  ...
```

### User Data Schema

```json
{
  "googleId": "string",
  "exercises": [
    {
      "id": "string",
      "name": "string",
      "category": "push | pull | legs",
      "history": [
        {
          "date": "ISO8601",
          "weightKg": "number",
          "reps": "number"
        }
      ]
    }
  ]
}
```

### Persistence

- Data directory is mounted from the Docker host
- Path: `/data` inside the container
- Host path: configurable via Docker volume mount

---

## Docker Deployment

### Build Strategy

The application is packaged as a single Docker image using a multi-stage build:

1. **Build stage**: Install dependencies, compile TypeScript, build React frontend
2. **Production stage**: Copy built artifacts, install production dependencies only

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files for workspace setup
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install all dependencies
RUN npm ci

# Copy source files
COPY tsconfig.base.json ./
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build backend and frontend
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

# Install production dependencies only
RUN npm ci --workspace=backend --omit=dev

# Copy built backend
COPY --from=builder /app/backend/dist ./backend/dist

# Copy built frontend to backend's public directory
COPY --from=builder /app/frontend/dist ./backend/public

# Create data directory
RUN mkdir -p /data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

EXPOSE 3000
CMD ["node", "backend/dist/index.js"]
```

### Runtime Configuration

| Environment Variable | Description | Required |
|---------------------|-------------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `NODE_ENV` | Environment mode | No (default: `production`) |
| `DATA_DIR` | Path to data directory | No (default: `/data`) |
| `PORT` | Server port | No (default: `3000`) |

### Volume Mounts

| Container Path | Purpose |
|----------------|---------|
| `/data` | Persistent user data storage |

### Running the Container

```bash
docker run -d \
  -p 3000:3000 \
  -v /path/to/data:/data \
  -e GOOGLE_CLIENT_ID=your-client-id \
  -e GOOGLE_CLIENT_SECRET=your-client-secret \
  ghcr.io/<owner>/regimen:latest
```

### Docker Compose Example

```yaml
services:
  regimen:
    image: ghcr.io/<owner>/regimen:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
    environment:
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    restart: unless-stopped
```

---

## CI/CD Pipeline

### Platform

GitHub Actions

### Trigger

Push to `main` branch

### Workflow Steps

1. **Checkout** - Clone repository
2. **Setup Node.js** - Configure Node 20 with npm caching
3. **Install dependencies** - `npm ci`
4. **Lint** - Run linting (non-blocking)
5. **Test** - Run tests (non-blocking)
6. **Setup Docker Buildx** - Enable advanced Docker features
7. **Login to GHCR** - Authenticate with GitHub Container Registry
8. **Extract metadata** - Generate image tags
9. **Build and push** - Build image with layer caching, push to registry

### Image Tagging

| Tag | Description |
|-----|-------------|
| `latest` | Most recent build from `main` |
| `sha-<commit>` | Specific commit hash |

### Registry

- **Registry**: ghcr.io
- **Image**: `ghcr.io/<owner>/regimen`

### Workflow File

Located at `.github/workflows/docker-build.yml`:

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint
        continue-on-error: true

      - name: Test
        run: npm test
        continue-on-error: true

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=raw,value=latest,enable={{is_default_branch}}
            type=sha,prefix=sha-

      - name: Build and push Docker image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## Development

### Prerequisites

- Node.js 20+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Run both frontend and backend in dev mode
npm run dev

# Frontend: http://localhost:3000 (proxies API to backend)
# Backend: http://localhost:3001
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend and backend with hot reload |
| `npm run build` | Build both frontend and backend |
| `npm test` | Run tests for both workspaces |
| `npm run lint` | Lint both workspaces |
| `npm run clean` | Remove dist directories |

---

## Security Considerations

- Google OAuth tokens are validated server-side
- User data is isolated by Google ID
- No sensitive data stored in the frontend
- HTTPS should be terminated at a reverse proxy in production
- Environment variables used for secrets (never committed)
- File storage on mounted volume (not in container)
