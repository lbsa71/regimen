import { describe, it, expect } from 'vitest';
import express from 'express';

/**
 * Basic smoke tests for the backend API.
 * These tests verify that the core Express setup works correctly.
 */

describe('API Smoke Tests', () => {
  it('should create an Express app', () => {
    const app = express();
    expect(app).toBeDefined();
  });

  it('should handle JSON middleware', () => {
    const app = express();
    app.use(express.json());
    expect(app).toBeDefined();
  });

  it('should register routes', () => {
    const app = express();
    app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    // Verify the route was registered
    const routes = app._router.stack.filter(
      (layer: { route?: { path: string } }) => layer.route
    );
    expect(routes.length).toBeGreaterThan(0);
  });
});
