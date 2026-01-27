# CLAUDE.md

This file provides context and guidelines for AI assistants working on the regimen codebase.

## Project Overview

**regimen** is a simple, opinionated training regimen tracker that helps users maintain consistent workout habits. It ensures users "do stuff, do it evenly, and not too often."

- **Stack**: React + TypeScript (frontend), Node.js + TypeScript (backend)
- **Deployment**: Single Docker image published to GitHub Container Registry (ghcr.io)
- **Authentication**: Google OAuth
- **Storage**: File-based datastore, per-user (Google ID), mounted volume

## Core Concepts

### Exercise Categories
- **Push** (Bröst, Axlar och Triceps): Dips, Bröst Press, Axel Press, Sidolyft, Plankan
- **Pull** (Rygg och Biceps): Back extensions, Reverse Flye, Latsdrag, Rodd, Bicep curls
- **Legs** (Ben): Ben Press, Leg Curls, Leg extensions, Calf raises, Dead Bugs

### Eligibility Rules
- An exercise requires **one full rest day** between sessions
- If performed yesterday, it is ineligible today

### Sorting Logic (priority order)
1. Category: Push → Pull → Legs
2. 14-day frequency: Less frequent exercises appear first
3. Recency: Exercises done longest ago appear higher

## Architecture Notes

The application is intentionally lightweight:
- No complex programming logic, periodization, or fatigue modeling
- Frontend handles weight unit conversion (kg/lbs) client-side
- Backend stores simple JSON files per user
- Single Docker container serves both frontend and backend

## Development Guidelines

### Code Style
- TypeScript for both frontend and backend
- Keep code simple and focused on the core purpose
- Avoid over-engineering; the app optimizes for simplicity

### Key Design Principles
1. **Simplicity over features**: Resist adding complex workout programming
2. **Consistency over optimization**: The goal is showing up, not maximizing gains
3. **Even distribution**: Encourage balanced training across all muscle groups
4. **Minimum rest enforcement**: Prevent overtraining of specific exercises

### Testing
- Write tests for business logic (eligibility, sorting)
- Frontend components should have basic render tests
- API endpoints need integration tests

### Docker
- Single image contains both frontend and backend
- Requires mounted data directory for persistent storage
- Requires Google OAuth credentials via environment variables

## Common Tasks

### Adding a New Exercise
1. Add to the exercise list in the appropriate category
2. No database migration needed (file-based storage)
3. Existing users will see the new exercise immediately

### Modifying Eligibility Rules
- Current rule: 1 rest day required
- Changes affect sorting and UI display
- Consider backward compatibility with existing user data

### Changing Sort Logic
- Located in `src/client/utils/exercises.ts`
- Test thoroughly as this is core UX
- Tests are in `src/client/__tests__/exercises.test.ts`

## File Structure

```
regimen/
├── frontend/                 # React/Vite workspace (entry point, build config)
│   └── src/                  # Frontend-specific sources
├── backend/                  # Express.js workspace
│   └── src/                  # Backend server code
├── src/
│   └── client/               # Shared React components, hooks, utils
│       ├── components/       # ExerciseList, ExerciseRow, Header, SignIn
│       ├── hooks/            # useAuth, useApi
│       ├── types/            # TypeScript type definitions
│       ├── utils/            # Exercise sorting, eligibility, formatting
│       └── __tests__/        # Frontend tests
├── public/                   # Static assets
├── .github/workflows/        # CI/CD to ghcr.io
├── Dockerfile                # Multi-stage build
├── tsconfig.base.json        # Shared TypeScript config
├── ARCHITECTURE.md           # Detailed architecture documentation
├── CONTRIBUTING.md           # Contribution guidelines
└── README.md                 # Project overview
```

## Environment Variables

Required for deployment:
- Google OAuth client ID and secret
- Data directory mount path

## Notes for AI Assistants

- The app uses Swedish exercise names; maintain this convention
- Weight display shows both kg and lbs; conversion is client-side
- User data is identified by Google ID, stored as individual files
- The philosophy is anti-complexity; push back on feature creep
- Date format is `ddd dd/mm` for display
