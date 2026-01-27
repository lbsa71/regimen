import { Router, type Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { listExercises } from '../services/exercises.js';
import { logWorkout, getUserData } from '../services/storage.js';
import { getExerciseById } from '../exercises.js';
import type { WorkoutEntry } from '../types.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/exercises - List all exercises with status
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const googleId = req.googleId!;
    const exercises = await listExercises(googleId);
    res.json(exercises);
  } catch (error) {
    console.error('Error listing exercises:', error);
    res.status(500).json({ error: 'Failed to list exercises' });
  }
});

// POST /api/exercises/:id/log - Log a completed exercise
router.post('/:id/log', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const googleId = req.googleId!;
    const exerciseId = req.params['id'] as string;

    // Validate exercise exists
    const exercise = getExerciseById(exerciseId);
    if (!exercise) {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }

    // Validate request body
    const { weightKg, reps, date } = req.body;

    if (typeof weightKg !== 'number' || weightKg < 0) {
      res.status(400).json({ error: 'Invalid weightKg: must be a non-negative number' });
      return;
    }

    if (typeof reps !== 'number' || reps < 0 || !Number.isInteger(reps)) {
      res.status(400).json({ error: 'Invalid reps: must be a non-negative integer' });
      return;
    }

    const entry: WorkoutEntry = {
      date: date || new Date().toISOString(),
      weightKg,
      reps,
    };

    const result = await logWorkout(googleId, exerciseId, entry);

    if (!result) {
      res.status(500).json({ error: 'Failed to log workout' });
      return;
    }

    res.status(201).json({
      message: 'Workout logged successfully',
      exercise: result,
    });
  } catch (error) {
    console.error('Error logging workout:', error);
    res.status(500).json({ error: 'Failed to log workout' });
  }
});

// GET /api/exercises/history - Get user's exercise history
router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const googleId = req.googleId!;
    const userData = await getUserData(googleId);

    // Return only exercises with history
    const exercisesWithHistory = userData.exercises.filter((e) => e.history.length > 0);

    res.json(exercisesWithHistory);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

export default router;
