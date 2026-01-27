# regimen - Frontend

This is the React/TypeScript frontend for the regimen training tracker.

## Structure

```
frontend/src/
├── components/         # React components
│   ├── ExerciseList.tsx   # Main exercise list view
│   ├── ExerciseRow.tsx    # Individual exercise row with input
│   ├── Header.tsx         # App header with user info
│   ├── SignIn.tsx         # Google OAuth sign-in
│   └── index.ts           # Component exports
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx        # Authentication context and hook
│   ├── useApi.ts          # API communication hook
│   └── index.ts           # Hook exports
├── types/              # TypeScript type definitions
│   └── index.ts           # All type definitions
├── utils/              # Utility functions
│   └── exercises.ts       # Exercise sorting, eligibility, and formatting
├── __tests__/          # Test files
│   └── exercises.test.ts  # Tests for exercise utilities
├── App.tsx             # Main App component
├── App.css             # Application styles
├── main.tsx            # Entry point
└── vite-env.d.ts       # Vite environment types
```

## Key Features

### Google OAuth Authentication

The app uses Google Sign-In for authentication. The client ID must be provided via:
- Environment variable: `VITE_GOOGLE_CLIENT_ID`
- Meta tag: `<meta name="google-client-id" content="...">`

### Exercise Sorting

Exercises are sorted by:
1. Category: Push → Pull → Legs
2. 14-day frequency: Less frequent exercises appear first
3. Recency: Exercises done longest ago appear higher

### Eligibility Rules

An exercise requires one full rest day between sessions. If performed yesterday, it is ineligible today.

### Weight Conversion

Weights can be entered in kg or lbs. The app automatically calculates and displays both units.

## Components

### ExerciseList

Main view displaying all exercises grouped by category. Handles loading, error states, and workout logging.

### ExerciseRow

Individual exercise row showing:
- Exercise name and last performed date
- Last 3 workout sessions
- Weight/reps input (for eligible exercises)
- "Did it today" button

### SignIn

Google OAuth sign-in page with the Google Sign-In button.

### Header

App header with logo, user info, and sign-out button.

## Hooks

### useAuth

Provides authentication context with:
- `user`: Current user object or null
- `token`: JWT token or null
- `isLoading`: Loading state
- `signIn()`: Trigger sign-in flow
- `signOut()`: Sign out and clear token

### useApi

Provides API communication functions:
- `getExercises()`: Fetch all exercises
- `logExercise()`: Log a completed exercise
- `getHistory()`: Get workout history

## Testing

Tests are located in `src/__tests__/` and use Vitest. Run tests with:

```bash
npm test -w frontend
```

## Development

```bash
# Install dependencies (from root)
npm install

# Start development server
npm run dev -w frontend

# Build for production
npm run build -w frontend
```
