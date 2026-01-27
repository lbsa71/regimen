# Backend

Node.js/TypeScript backend server for the regimen training tracker.

## API Endpoints

All endpoints except `/api/health` require authentication via Google OAuth token in the `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/exercises` | List all exercises with eligibility status |
| POST | `/api/exercises/:id/log` | Log a completed exercise |
| GET | `/api/exercises/history` | Get user's exercise history |

## Development

```bash
# From the root directory
npm install
npm run dev -w backend
```

## Testing

```bash
npm run test -w backend
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `DATA_DIR` | Path to user data directory | No (default: /data) |

## Data Storage

User data is stored as JSON files in the data directory, one file per Google ID.

```
/data
  /<google-id-1>.json
  /<google-id-2>.json
  ...
```
