# regimen

> A simple, opinionated training regimen tracker that helps you **do stuff**, do it **evenly**, and **not too often**.

No programs. No percentages. No periodization. Just consistency.

## Quick Start

```bash
docker run -d \
  -p 3000:3000 \
  -v ./data:/data \
  -e GOOGLE_CLIENT_ID=your-client-id \
  -e GOOGLE_CLIENT_SECRET=your-client-secret \
  ghcr.io/<owner>/regimen:latest
```

Then open http://localhost:3000 and sign in with Google.

## What It Does

**regimen** decides *what to train today* so you don't have to overthink it:

- Shows only **eligible** exercises (not done yesterday)
- Nudges you toward **balanced** training (push / pull / legs)
- Surfaces **neglected** exercises at the top

Each exercise requires one full rest day between sessions. That's the only rule.

## How It Works

### Sorting Priority

1. **Category**: Push, Pull, Legs in order of 'urgency' (See below)
2. **14-day frequency**: Less frequent exercises appear first
3. **Recency**: Exercises done longest ago rank higher

### Category Urgency
'urgency' is calculated by taking the total sum of recorded exercises in that category the last 14 days and divide it by the number of excercises - i.e. the fewer recorded exercises, the higher up the list the category should rank.

### Exercise Categories

| Push | Pull | Legs |
|------|------|------|
| Dips | Back extensions | Ben Press |
| Bröst Press | Reverse Flye | Leg Curls |
| Axel Press | Latsdrag | Leg extensions |
| Sidolyft | Rodd | Calf raises |
| Plankan | Bicep curls | Dead Bugs |

## Development

### Prerequisites

- Node.js 20+
- Google OAuth credentials

### Local Setup

```bash
git clone https://github.com/<owner>/regimen.git
cd regimen
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`, backend at `http://localhost:3001`.

### Docker Build

```bash
docker build -t regimen:local .
docker run -p 3000:3000 -v ./data:/data \
  -e GOOGLE_CLIENT_ID=... \
  -e GOOGLE_CLIENT_SECRET=... \
  regimen:local
```

## Architecture

| Component | Stack |
|-----------|-------|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Storage | File-based JSON (per user) |
| Auth | Google OAuth |
| Deployment | Single Docker image → ghcr.io |

See [ARCHITECTURE.md](ARCHITECTURE.md) for details.

## Philosophy

This app intentionally avoids complexity. No fatigue modeling, no PR chasing, no auto-adjustment. If you train consistently, the app is doing its job.

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture and deployment
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines
- [CLAUDE.md](CLAUDE.md) - AI assistant context

## License

Personal project. Use, fork, and adapt as you like.
