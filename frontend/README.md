# Frontend

Vite/React workspace that serves as the entry point and build configuration for the regimen frontend.

## Architecture

The frontend is split between two directories:

```
frontend/                  # Build configuration and entry point
├── src/
│   ├── main.tsx          # Application entry point
│   └── App.tsx           # Root component (minimal wrapper)
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── package.json          # Frontend workspace config
└── tsconfig.json         # TypeScript config

src/client/               # Shared components, hooks, and utilities
├── components/           # ExerciseList, ExerciseRow, Header, SignIn
├── hooks/                # useAuth, useApi
├── types/                # TypeScript type definitions
├── utils/                # Exercise sorting, eligibility, formatting
└── __tests__/            # Frontend tests
```

### Why This Structure?

The `frontend/` directory contains only the Vite build configuration and minimal entry point code. The actual React components, hooks, and utilities live in `src/client/` because:

- **Shared code**: Components can be imported from a consistent location
- **Separation of concerns**: Build tooling is separate from application logic
- **Workspace isolation**: The `frontend` workspace handles only Vite-specific configuration

## Entry Point Structure

1. **index.html** - HTML template with `<div id="root">` and module script entry
2. **src/main.tsx** - React 18 `createRoot()` initialization with StrictMode
3. **src/App.tsx** - Root component that imports from `src/client/`

The entry point renders the React app into the `#root` element defined in `index.html`.

## Development Server

### Configuration

The Vite dev server is configured in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### API Proxy

During development, API requests to `/api/*` are proxied to the backend server at `http://localhost:3001`. This allows:

- Frontend and backend to run on different ports during development
- Same-origin API calls in the browser (avoiding CORS issues)
- Seamless transition to production where both are served from the same container

### Running the Dev Server

```bash
# From the root directory (starts both frontend and backend)
npm run dev

# Or just the frontend
npm run dev -w frontend
```

The frontend dev server runs at `http://localhost:3000` with hot module replacement (HMR) enabled.

## Build Process

### Commands

```bash
# Build for production
npm run build -w frontend

# Preview production build
npm run preview -w frontend
```

### Build Steps

1. **TypeScript compilation** (`tsc -b`) - Type checking without emitting (uses `noEmit: true`)
2. **Vite build** - Bundles the application with Rollup
3. **Output** - Production assets written to `frontend/dist/`

### Production Output

The build generates:
- `dist/index.html` - Entry HTML with hashed asset references
- `dist/assets/` - JavaScript and CSS bundles with content hashes
- Source maps (enabled via `sourcemap: true`)

In production, the built frontend is served by the backend's Express static middleware from `backend/public/`.

## TypeScript Configuration

The frontend extends `tsconfig.base.json` with frontend-specific settings:

- **Target**: ES2020
- **Module**: ESNext with bundler resolution
- **JSX**: react-jsx (automatic runtime)
- **noEmit**: true (Vite handles bundling)

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start Vite dev server with HMR |
| `build` | Type check and build for production |
| `preview` | Preview production build locally |
| `test` | Run Vitest tests |
| `test:watch` | Run Vitest in watch mode |
| `lint` | Run ESLint on src directory |
| `clean` | Remove dist directory |

## Dependencies

### Runtime
- `react` - UI library
- `react-dom` - React DOM renderer

### Development
- `vite` - Build tool and dev server
- `@vitejs/plugin-react` - React support for Vite
- `typescript` - Type checking
- `vitest` - Test runner

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

The React components are located in `src/client/components/`:

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

Custom hooks are in `src/client/hooks/`:

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

Tests for frontend code live in `src/client/__tests__/`. Run tests with:

```bash
npm run test -w frontend
```

See the [src/client/README.md](../src/client/README.md) for details on component and utility testing.
