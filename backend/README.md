# regimen - Backend

This is the Node.js/TypeScript backend server for the regimen training tracker.

## Structure

```
backend/
├── src/
│   ├── index.ts              # Express server entry point
│   ├── exercises.ts          # Exercise definitions and constants
│   ├── types.ts              # TypeScript type definitions
│   ├── middleware/
│   │   └── auth.ts           # Google OAuth authentication middleware
│   ├── routes/
│   │   └── exercises.ts      # Exercise API route handlers
│   └── services/
│       ├── exercises.ts      # Exercise business logic (eligibility, sorting)
│       └── storage.ts        # File-based data persistence
├── tests/
│   └── exercises.test.ts     # Exercise service tests
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## API Endpoints

All endpoints except `/api/health` require authentication via Google OAuth token in the `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/exercises` | List all exercises with eligibility status |
| POST | `/api/exercises/:id/log` | Log a completed exercise |
| GET | `/api/exercises/history` | Get user's exercise history |

### Request/Response Examples

#### GET /api/exercises

Returns exercises sorted by category, 14-day frequency, and recency.

```json
[
  {
    "id": "dips",
    "name": "Dips",
    "category": "push",
    "eligible": true,
    "lastPerformed": "2024-01-15T10:30:00.000Z",
    "frequencyLast14Days": 2
  }
]
```

#### POST /api/exercises/:id/log

Request body:
```json
{
  "weightKg": 50,
  "reps": 10,
  "date": "2024-01-17T10:30:00.000Z"  // optional, defaults to now
}
```

Response:
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

## Authentication Flow

The backend uses Google OAuth for authentication:

1. **Client sends request** with `Authorization: Bearer <google-id-token>` header
2. **Middleware validates token** using Google's OAuth2 library (`google-auth-library`)
3. **Token is verified** against the configured `GOOGLE_CLIENT_ID`
4. **User identity extracted** from token payload (`sub` field = Google ID)
5. **Request enriched** with `googleId` and `userEmail` for downstream handlers

Unauthenticated requests receive a `401 Unauthorized` response.

## Modules

### index.ts

Express server setup:
- Configures JSON body parsing
- Mounts API routes at `/api/exercises`
- Serves static frontend files in production
- Handles client-side routing fallback

### exercises.ts

Defines the fixed list of exercises with their categories:
- **Push**: Dips, Bröst Press, Axel Press, Sidolyft, Plankan
- **Pull**: Back extensions, Reverse Flye, Latsdrag, Rodd, Bicep curls
- **Legs**: Ben Press, Leg Curls, Leg extensions, Calf raises, Dead Bugs

Also exports `CATEGORY_ORDER` for sorting and `getExerciseById()` lookup function.

### middleware/auth.ts

Google OAuth middleware:
- Extracts Bearer token from Authorization header
- Verifies token with Google OAuth2Client
- Attaches `googleId` and `userEmail` to request object
- Returns 401 for invalid/missing tokens

### routes/exercises.ts

API route handlers:
- `GET /` - List exercises with eligibility status
- `POST /:id/log` - Log a workout (validates exercise ID, weight, reps)
- `GET /history` - Return exercises that have workout history

### services/exercises.ts

Business logic for exercise status:
- **Eligibility check**: Exercise is eligible if not done today or yesterday
- **Sorting**: Category order → 14-day frequency (ascending) → recency (oldest first)
- **Frequency counting**: Counts workouts in the last 14 days

### services/storage.ts

File-based persistence layer:
- Each user has a JSON file named by their sanitized Google ID
- Creates default user data for new users (all exercises, empty history)
- Auto-adds new exercises if the exercise list has been updated
- Path traversal protection via ID sanitization

## Type Definitions

```typescript
type Category = 'push' | 'pull' | 'legs';

interface Exercise {
  id: string;
  name: string;
  category: Category;
}

interface WorkoutEntry {
  date: string;      // ISO8601 format
  weightKg: number;
  reps: number;
}

interface ExerciseHistory {
  id: string;
  name: string;
  category: Category;
  history: WorkoutEntry[];
}

interface UserData {
  googleId: string;
  exercises: ExerciseHistory[];
}

interface ExerciseWithStatus extends Exercise {
  eligible: boolean;
  lastPerformed: string | null;
  frequencyLast14Days: number;
}
```

## Data Storage

User data is stored as JSON files in the data directory, one file per Google ID.

```
/data
  /<google-id-1>.json
  /<google-id-2>.json
  ...
```

### User Data File Format

```json
{
  "googleId": "123456789",
  "exercises": [
    {
      "id": "dips",
      "name": "Dips",
      "category": "push",
      "history": [
        {
          "date": "2024-01-15T10:30:00.000Z",
          "weightKg": 50,
          "reps": 10
        }
      ]
    }
  ]
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `DATA_DIR` | Path to user data directory | No (default: /data) |
| `NODE_ENV` | Environment mode (production enables static file serving) | No |

## Development

```bash
# From the root directory
npm install

# Start backend in development mode
npm run dev -w backend

# Or run both frontend and backend together
npm run dev
```

## Testing

Tests are located in `tests/` and use Vitest. Run tests with:

```bash
npm run test -w backend
```

## Building

```bash
# Build the backend
npm run build -w backend

# Output is in backend/dist/
```
