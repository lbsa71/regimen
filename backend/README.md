# Backend

Node.js/TypeScript backend server for the regimen training tracker.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | Runtime |
| TypeScript | 5.3 | Language |
| Express.js | 4.18 | Web framework |
| google-auth-library | 9.x | OAuth token validation |
| Vitest | 1.1 | Testing |
| tsx | 4.x | Development server |

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express server entry point
│   ├── exercises.ts          # Exercise definitions (Push/Pull/Legs)
│   ├── types.ts              # TypeScript type definitions
│   ├── middleware/
│   │   └── auth.ts           # Google OAuth token validation
│   ├── routes/
│   │   └── exercises.ts      # Exercise API endpoints
│   └── services/
│       ├── exercises.ts      # Exercise eligibility & sorting logic
│       └── storage.ts        # File-based user data persistence
├── tests/
│   └── exercises.test.ts     # Exercise business logic tests
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## API Endpoints

All endpoints except `/api/health` require authentication via Google OAuth token in the `Authorization: Bearer <token>` header.

### Health Check

```
GET /api/health
```

Returns server health status. No authentication required.

**Response:**
```json
{ "status": "ok" }
```

### List Exercises

```
GET /api/exercises
```

Returns all exercises with eligibility status, sorted by category, frequency, and recency.

**Response:**
```json
[
  {
    "id": "dips",
    "name": "Dips",
    "category": "push",
    "eligible": true,
    "lastPerformed": "2024-01-13T10:00:00Z",
    "frequencyLast14Days": 2
  }
]
```

### Log Exercise

```
POST /api/exercises/:id/log
```

Log a completed exercise session.

**Request Body:**
```json
{
  "weightKg": 10,
  "reps": 12,
  "date": "2024-01-15T10:00:00Z"  // Optional, defaults to now
}
```

**Response (201):**
```json
{
  "message": "Workout logged successfully",
  "exercise": {
    "id": "dips",
    "name": "Dips",
    "category": "push",
    "history": [...]
  }
}
```

**Error Responses:**
- `400` - Invalid weightKg or reps
- `404` - Exercise not found
- `401` - Unauthorized

### Get Exercise History

```
GET /api/exercises/history
```

Returns all exercises with workout history for the authenticated user.

**Response:**
```json
[
  {
    "id": "dips",
    "name": "Dips",
    "category": "push",
    "history": [
      {
        "date": "2024-01-15T10:00:00Z",
        "weightKg": 10,
        "reps": 12
      }
    ]
  }
]
```

## Authentication Middleware

The backend validates Google OAuth ID tokens using the `google-auth-library`.

### How It Works

1. Client sends request with `Authorization: Bearer <id_token>` header
2. Middleware extracts the token from the header
3. Token is verified against Google's OAuth API using the configured `GOOGLE_CLIENT_ID`
4. On success, the user's Google ID (`sub` claim) and email are attached to the request
5. User data is stored/retrieved using the Google ID as the unique identifier

### Implementation

Located in `src/middleware/auth.ts`:

```typescript
interface AuthenticatedRequest extends Request {
  googleId?: string;
  userEmail?: string;
}
```

The `requireAuth` middleware:
- Returns `401` if Authorization header is missing or malformed
- Returns `401` if token verification fails
- Attaches `googleId` and `userEmail` to the request on success

## File-Based Storage

User data is persisted as JSON files, one per Google ID.

### Storage Location

```
/data
  /<google-id-1>.json
  /<google-id-2>.json
  ...
```

The data directory is configurable via the `DATA_DIR` environment variable (default: `/data`).

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
          "date": "ISO8601 string",
          "weightKg": "number",
          "reps": "number"
        }
      ]
    }
  ]
}
```

### Storage Behavior

- **New users**: Default data is created with all exercises and empty history
- **New exercises**: When exercises are added to the codebase, they are automatically added to existing users' data on next load
- **Path sanitization**: Google IDs are sanitized to prevent path traversal attacks
- **Atomic writes**: Data is written as complete JSON files (no partial updates)

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID for token validation | Yes | - |
| `DATA_DIR` | Path to user data directory | No | `/data` |
| `NODE_ENV` | Environment mode (`production` enables static file serving) | No | - |

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# From the root directory
npm install

# Set required environment variables
export GOOGLE_CLIENT_ID=your-client-id
export DATA_DIR=./data

# Run in development mode with hot reload
npm run dev -w backend
```

The development server uses `tsx watch` for automatic reloading on file changes.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev -w backend` | Start dev server with hot reload |
| `npm run build -w backend` | Compile TypeScript to `dist/` |
| `npm run start -w backend` | Run compiled server |
| `npm run test -w backend` | Run tests once |
| `npm run test:watch -w backend` | Run tests in watch mode |
| `npm run lint -w backend` | Run ESLint |
| `npm run clean -w backend` | Remove `dist/` directory |

## Testing

Tests use Vitest and are located in the `tests/` directory.

### Running Tests

```bash
# Run all backend tests
npm run test -w backend

# Run tests in watch mode
npm run test:watch -w backend
```

### Test Coverage

The tests cover:

- **Eligibility rules**: Exercises require one full rest day between sessions
- **Sorting logic**: Category (Push → Pull → Legs), 14-day frequency, recency
- **Frequency calculation**: Accurate count of sessions in the last 14 days

### Writing Tests

Test files should be placed in `tests/` or co-located with source files as `*.test.ts`.

Example test structure:
```typescript
import { describe, it, expect } from 'vitest';
import { getExercisesWithStatus } from '../src/services/exercises.js';

describe('Eligibility Rules', () => {
  it('should mark an exercise as eligible if never performed', () => {
    // ...
  });
});
```

## Production Deployment

In production mode (`NODE_ENV=production`), the server also serves the frontend static files from the `public/` directory and handles client-side routing by serving `index.html` for non-API routes.

See the root [ARCHITECTURE.md](../ARCHITECTURE.md) for Docker deployment instructions.
