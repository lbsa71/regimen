import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import exercisesRouter from './routes/exercises.js';
import { ensureDataDir } from './services/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env['PORT'] ?? 3000;

app.use(express.json());

// API routes
app.use('/api/exercises', exercisesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// In production, serve the frontend static files
if (process.env['NODE_ENV'] === 'production') {
  const staticPath = path.join(__dirname, '..', 'public');
  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

async function start() {
  await ensureDataDir();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
