# regimen - Frontend

This is the React/TypeScript frontend for the regimen training tracker.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI framework |
| TypeScript | 5.3 | Language |
| Vite | 5.0 | Build tool and dev server |
| Vitest | 1.1 | Testing framework |
| ESLint | 9.x | Code linting |

## Project Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── ExerciseList.tsx     # Main exercise list view
│   │   ├── ExerciseRow.tsx      # Individual exercise row with input
│   │   ├── Header.tsx           # App header with user info
│   │   ├── SignIn.tsx           # Google OAuth sign-in
│   │   └── index.ts             # Component exports
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.tsx          # Authentication context and hook
│   │   ├── useApi.ts            # API communication hook
│   │   └── index.ts             # Hook exports
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts             # All type definitions
│   ├── utils/                # Utility functions
│   │   └── exercises.ts         # Exercise sorting, eligibility, formatting
│   ├── __tests__/            # Test files
│   │   └── exercises.test.ts    # Tests for exercise utilities
│   ├── App.tsx               # Main App component
│   ├── App.css               # Application styles
│   ├── main.tsx              # Entry point
│   └── vite-env.d.ts         # Vite environment types
├── index.html                # HTML entry point
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
└── eslint.config.js
```

## Components

### ExerciseList

Main view displaying all exercises grouped by category.

**Responsibilities:**
- Fetches exercises from the backend API
- Merges with default exercises for completeness
- Adds eligibility status and sorting
- Groups exercises by category (Push → Pull → Legs)
- Handles loading and error states
- Coordinates exercise logging

**Usage:**
```tsx
<ExerciseList />
```

### ExerciseRow

Individual exercise row with history display and workout logging.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `exercise` | `ExerciseWithStatus` | Exercise with status info |
| `onLogExercise` | `(id, weightKg, reps) => Promise<void>` | Callback to log workout |

**Features:**
- Displays exercise name and last performed date
- Shows last 3 workout sessions (weight/reps)
- Weight input with kg/lbs toggle and conversion display
- Reps input
- "Did it today" submit button
- Ineligible state display ("Rest day - performed yesterday")

### SignIn

Google OAuth sign-in page.

**Features:**
- Renders the Google Sign-In button
- Handles Google OAuth callback
- Displayed when user is not authenticated

### Header

Application header with user profile.

**Features:**
- Displays app logo/title
- Shows user profile picture and name when authenticated
- Provides sign-out button

## Hooks

### useAuth

Authentication context provider and hook for Google OAuth.

**Context Value:**
| Property | Type | Description |
|----------|------|-------------|
| `user` | `GoogleUser \| null` | Current authenticated user |
| `token` | `string \| null` | Google OAuth ID token |
| `isLoading` | `boolean` | Authentication loading state |
| `signIn` | `() => void` | Trigger Google sign-in flow |
| `signOut` | `() => void` | Sign out and clear stored token |

**Usage:**
```tsx
// Wrap app with provider
<AuthProvider clientId="your-google-client-id">
  <App />
</AuthProvider>

// Use in components
const { user, token, isLoading, signIn, signOut } = useAuth();
```

**Implementation Details:**
- Loads Google Sign-In script dynamically
- Parses JWT token to extract user info (googleId, email, name, picture)
- Persists token to localStorage for session persistence
- Validates token expiration on page load
- Clears expired tokens automatically

### useApi

API communication hook for authenticated requests.

**Returns:**
| Function | Signature | Description |
|----------|-----------|-------------|
| `getExercises` | `() => Promise<Exercise[]>` | Fetch all exercises |
| `logExercise` | `(params) => Promise<Exercise>` | Log a workout |
| `getHistory` | `() => Promise<WorkoutSession[]>` | Get workout history |

**Usage:**
```tsx
const { getExercises, logExercise, getHistory } = useApi();

// Fetch exercises
const exercises = await getExercises();

// Log a workout
await logExercise({ exerciseId: 'dips', weightKg: 10, reps: 12 });
```

**Implementation Details:**
- Automatically includes Bearer token from useAuth
- Sets Content-Type to application/json
- Throws error if not authenticated
- Parses error messages from API responses

## Utility Functions

Located in `src/utils/exercises.ts`.

### Exercise Definitions

```typescript
DEFAULT_EXERCISES: Omit<Exercise, 'history'>[]
```

Predefined list of all exercises with their categories:

**Push (Bröst, Axlar och Triceps):**
- Dips, Bröst Press, Axel Press, Sidolyft, Plankan

**Pull (Rygg och Biceps):**
- Back extensions, Reverse Flye, Latsdrag, Rodd, Bicep curls

**Legs (Ben):**
- Ben Press, Leg Curls, Leg extensions, Calf raises, Dead Bugs

### Eligibility Functions

```typescript
isExerciseEligible(history: WorkoutSession[], today?: Date): boolean
```

Checks if an exercise can be performed. Returns `true` if the exercise was **not** performed yesterday.

**Rule:** One full rest day required between sessions.

### Frequency Functions

```typescript
getFrequency14Days(history: WorkoutSession[], today?: Date): number
```

Counts how many times an exercise was performed in the last 14 days.

### Sorting Functions

```typescript
sortExercises(exercises: ExerciseWithStatus[]): ExerciseWithStatus[]
```

Sorts exercises according to the priority:

1. **Category**: Push → Pull → Legs
2. **14-day frequency**: Less frequent exercises first
3. **Recency**: Exercises done longest ago first (never-performed at top)

### Status Functions

```typescript
addExerciseStatus(exercises: Exercise[], today?: Date): ExerciseWithStatus[]
```

Enriches exercises with computed status fields:
- `isEligible`: Can be performed today
- `lastPerformed`: Date of most recent workout
- `frequency14Days`: Count of workouts in last 14 days

### Formatting Functions

```typescript
formatDate(date: Date): string
```

Formats date as "ddd dd/mm" (e.g., "Mon 25/01").

```typescript
getLastThreeSessions(history: WorkoutSession[]): WorkoutSession[]
```

Returns the 3 most recent workout sessions, sorted newest first.

### Weight Conversion Functions

```typescript
kgToLbs(kg: number): number
lbsToKg(lbs: number): number
```

Convert between kg and lbs with one decimal precision.

```typescript
// Examples
kgToLbs(100)  // → 220.5
lbsToKg(220)  // → 99.8
```

### Category Functions

```typescript
getCategoryOrder(category: Category): number
```

Returns sort priority (0 = push, 1 = pull, 2 = legs).

```typescript
getCategoryDisplayName(category: Category): string
```

Returns Swedish display name:
- `push` → "Bröst, Axlar och Triceps"
- `pull` → "Rygg och Biceps"
- `legs` → "Ben"

## Type Definitions

Located in `src/types/index.ts`.

```typescript
type Category = 'push' | 'pull' | 'legs';

interface WorkoutSession {
  date: string;      // ISO8601 format
  weightKg: number;
  reps: number;
}

interface Exercise {
  id: string;
  name: string;
  category: Category;
  history: WorkoutSession[];
}

interface ExerciseWithStatus extends Exercise {
  isEligible: boolean;
  lastPerformed: Date | null;
  frequency14Days: number;
}

interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextValue {
  user: GoogleUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
}
```

## Environment Variables

The frontend uses environment variables for configuration:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |

Alternatively, the client ID can be provided via a meta tag in `index.html`:
```html
<meta name="google-client-id" content="your-client-id">
```

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# From the root directory
npm install

# Set required environment variables
export VITE_GOOGLE_CLIENT_ID=your-client-id

# Start development server
npm run dev -w frontend
```

The dev server runs on `http://localhost:3000` and proxies `/api` requests to the backend at `http://localhost:3001`.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev -w frontend` | Start dev server with hot reload |
| `npm run build -w frontend` | Type-check and build for production |
| `npm run preview -w frontend` | Preview production build |
| `npm run test -w frontend` | Run tests once |
| `npm run test:watch -w frontend` | Run tests in watch mode |
| `npm run lint -w frontend` | Run ESLint |
| `npm run clean -w frontend` | Remove `dist/` directory |

### Vite Configuration

The frontend uses Vite with the following configuration:

- **Dev server port**: 3000
- **API proxy**: `/api` → `http://localhost:3001`
- **Build output**: `dist/`
- **Source maps**: Enabled

## Testing

Tests use Vitest and are located in `src/__tests__/`.

### Running Tests

```bash
# Run all frontend tests
npm run test -w frontend

# Run tests in watch mode
npm run test:watch -w frontend
```

### Test Coverage

The tests cover:

- **Eligibility rules**: Exercises require one full rest day between sessions
- **Frequency calculation**: Accurate count of sessions in the last 14 days
- **Sorting logic**: Category (Push → Pull → Legs), 14-day frequency, recency
- **Date formatting**: "ddd dd/mm" format
- **Weight conversion**: kg ↔ lbs with rounding
- **Session retrieval**: Last 3 sessions sorted by date

### Writing Tests

Test files should be placed in `src/__tests__/` or co-located with source files as `*.test.ts(x)`.

Example test structure:
```typescript
import { describe, it, expect } from 'vitest';
import { isExerciseEligible } from '../utils/exercises';

describe('isExerciseEligible', () => {
  it('returns true for an exercise with no history', () => {
    expect(isExerciseEligible([])).toBe(true);
  });
});
```

## Build for Production

```bash
# Build the frontend
npm run build -w frontend

# Output is in frontend/dist/
```

The production build:
- Type-checks with TypeScript
- Bundles with Vite (Rollup)
- Outputs to `dist/` directory
- Generates source maps

In the Docker deployment, the frontend build is served by the backend as static files.

See the root [ARCHITECTURE.md](../ARCHITECTURE.md) for deployment details.
