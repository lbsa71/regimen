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

## Frontend

### Technology Stack

- **Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite (recommended) or Create React App

### Responsibilities

- Render the exercise list with eligibility status
- Handle user input for weight and reps
- Perform client-side unit conversion (kg/lbs)
- Manage Google OAuth authentication flow
- Communicate with backend via REST API

### Key Components

| Component | Purpose |
|-----------|---------|
| ExerciseList | Main view displaying sorted exercises |
| ExerciseRow | Individual exercise with input fields |
| AuthProvider | Google OAuth context and token management |
| WeightConverter | Real-time kg/lbs conversion |

---

## Backend

### Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js (recommended)

### Responsibilities

- Serve the built frontend static files
- Provide REST API endpoints for exercise data
- Validate Google OAuth tokens
- Read/write user data to file storage
- Apply eligibility and sorting logic

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exercises` | List all exercises with status |
| POST | `/api/exercises/:id/log` | Log a completed exercise |
| GET | `/api/history` | Get user's exercise history |

### Authentication

- All API endpoints require a valid Google OAuth token
- Token is passed via `Authorization: Bearer <token>` header
- Backend validates token with Google's OAuth API
- User is identified by their Google ID extracted from the token

---

## Data Storage

### Strategy

File-based storage with one file per user (Google ID).

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

## Single Docker Image

### Build Strategy

The application is packaged as a single Docker image containing both frontend and backend:

1. **Build stage**: Compile TypeScript and build React frontend
2. **Runtime stage**: Node.js serving static files and API

### Dockerfile Structure

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Runtime Configuration

| Environment Variable | Description | Required |
|---------------------|-------------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `DATA_DIR` | Path to data directory | No (default: `/data`) |
| `PORT` | Server port | No (default: `3000`) |

### Volume Mounts

| Container Path | Purpose |
|----------------|---------|
| `/data` | Persistent user data storage |

---

## CI/CD Pipeline

### Platform

GitHub Actions

### Trigger

- Push to `main` branch

### Workflow Steps

1. Checkout code
2. Set up Node.js
3. Install dependencies
4. Run linting
5. Run tests
6. Build Docker image
7. Push to GitHub Container Registry (ghcr.io)

### Image Tagging

| Tag | Description |
|-----|-------------|
| `latest` | Most recent build from `main` |
| `sha-<commit>` | Specific commit hash |

### Registry

- **Registry**: ghcr.io
- **Image**: `ghcr.io/<owner>/regimen`

### Workflow Example

```yaml
name: Build and Push

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
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:sha-${{ github.sha }}
```

---

## Deployment

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
version: '3.8'

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

## Project Structure

```
regimen/
├── src/
│   ├── client/           # React frontend
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── App.tsx
│   └── server/           # Node.js backend
│       ├── routes/
│       ├── services/
│       ├── middleware/
│       └── index.ts
├── public/               # Static assets
├── tests/               # Test files
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Security Considerations

- Google OAuth tokens are validated server-side
- User data is isolated by Google ID
- No sensitive data stored in the frontend
- HTTPS should be terminated at a reverse proxy in production
- Environment variables used for secrets (never committed)
