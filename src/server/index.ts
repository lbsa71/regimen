import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import exercisesRouter from './routes/exercises.js';
import { ensureDataDir } from './services/storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(express.json());

// API routes
app.use('/api/exercises', exercisesRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from the built frontend (in production)
const staticPath = path.join(__dirname, '..', 'client');
app.use(express.static(staticPath));

// Fallback to index.html for SPA routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

async function start() {
  try {
    await ensureDataDir();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export { app };
