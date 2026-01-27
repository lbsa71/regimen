import { describe, it, expect } from 'vitest';
import {
  isExerciseEligible,
  getFrequency14Days,
  sortExercises,
  formatDate,
  kgToLbs,
  lbsToKg,
  getLastPerformedDate,
  getLastThreeSessions,
  addExerciseStatus,
  getCategoryOrder,
} from '../utils/exercises';
import { WorkoutSession, ExerciseWithStatus } from '../types';

describe('isExerciseEligible', () => {
  it('returns true for an exercise with no history', () => {
    expect(isExerciseEligible([])).toBe(true);
  });

  it('returns false for an exercise performed yesterday', () => {
    const today = new Date('2024-01-15');
    const history: WorkoutSession[] = [
      { date: '2024-01-14T10:00:00.000Z', weightKg: 50, reps: 10 },
    ];
    expect(isExerciseEligible(history, today)).toBe(false);
  });

  it('returns true for an exercise performed two days ago', () => {
    const today = new Date('2024-01-15');
    const history: WorkoutSession[] = [
      { date: '2024-01-13T10:00:00.000Z', weightKg: 50, reps: 10 },
    ];
    expect(isExerciseEligible(history, today)).toBe(true);
  });

  it('returns true for an exercise performed today (already done today is still eligible)', () => {
    const today = new Date('2024-01-15');
    const history: WorkoutSession[] = [
      { date: '2024-01-15T10:00:00.000Z', weightKg: 50, reps: 10 },
    ];
    expect(isExerciseEligible(history, today)).toBe(true);
  });
});

describe('getFrequency14Days', () => {
  it('returns 0 for an exercise with no history', () => {
    expect(getFrequency14Days([])).toBe(0);
  });

  it('counts sessions within the last 14 days', () => {
    const today = new Date('2024-01-15');
    const history: WorkoutSession[] = [
      { date: '2024-01-14T10:00:00.000Z', weightKg: 50, reps: 10 },
      { date: '2024-01-10T10:00:00.000Z', weightKg: 50, reps: 10 },
      { date: '2024-01-05T10:00:00.000Z', weightKg: 50, reps: 10 },
    ];
    expect(getFrequency14Days(history, today)).toBe(3);
  });

  it('excludes sessions older than 14 days', () => {
    const today = new Date('2024-01-15');
    const history: WorkoutSession[] = [
      { date: '2024-01-14T10:00:00.000Z', weightKg: 50, reps: 10 },
      { date: '2023-12-25T10:00:00.000Z', weightKg: 50, reps: 10 }, // More than 14 days ago
    ];
    expect(getFrequency14Days(history, today)).toBe(1);
  });
});

describe('getLastPerformedDate', () => {
  it('returns null for empty history', () => {
    expect(getLastPerformedDate([])).toBe(null);
  });

  it('returns the most recent date', () => {
    const history: WorkoutSession[] = [
      { date: '2024-01-10T10:00:00.000Z', weightKg: 50, reps: 10 },
      { date: '2024-01-14T10:00:00.000Z', weightKg: 50, reps: 10 },
      { date: '2024-01-05T10:00:00.000Z', weightKg: 50, reps: 10 },
    ];
    const result = getLastPerformedDate(history);
    expect(result?.toISOString()).toBe('2024-01-14T10:00:00.000Z');
  });
});

describe('sortExercises', () => {
  it('sorts by category first (push -> pull -> legs)', () => {
    const exercises: ExerciseWithStatus[] = [
      {
        id: 'legs-1',
        name: 'Legs Exercise',
        category: 'legs',
        history: [],
        isEligible: true,
        lastPerformed: null,
        frequency14Days: 0,
      },
      {
        id: 'pull-1',
        name: 'Pull Exercise',
        category: 'pull',
        history: [],
        isEligible: true,
        lastPerformed: null,
        frequency14Days: 0,
      },
      {
        id: 'push-1',
        name: 'Push Exercise',
        category: 'push',
        history: [],
        isEligible: true,
        lastPerformed: null,
        frequency14Days: 0,
      },
    ];

    const sorted = sortExercises(exercises);
    expect(sorted[0]?.category).toBe('push');
    expect(sorted[1]?.category).toBe('pull');
    expect(sorted[2]?.category).toBe('legs');
  });

  it('sorts by 14-day frequency within same category (less frequent first)', () => {
    const exercises: ExerciseWithStatus[] = [
      {
        id: 'push-1',
        name: 'Frequent Exercise',
        category: 'push',
        history: [],
        isEligible: true,
        lastPerformed: null,
        frequency14Days: 5,
      },
      {
        id: 'push-2',
        name: 'Infrequent Exercise',
        category: 'push',
        history: [],
        isEligible: true,
        lastPerformed: null,
        frequency14Days: 1,
      },
    ];

    const sorted = sortExercises(exercises);
    expect(sorted[0]?.id).toBe('push-2'); // Less frequent first
    expect(sorted[1]?.id).toBe('push-1');
  });

  it('sorts by recency within same category and frequency (longest ago first)', () => {
    const exercises: ExerciseWithStatus[] = [
      {
        id: 'push-1',
        name: 'Recent Exercise',
        category: 'push',
        history: [],
        isEligible: true,
        lastPerformed: new Date('2024-01-14'),
        frequency14Days: 2,
      },
      {
        id: 'push-2',
        name: 'Old Exercise',
        category: 'push',
        history: [],
        isEligible: true,
        lastPerformed: new Date('2024-01-10'),
        frequency14Days: 2,
      },
    ];

    const sorted = sortExercises(exercises);
    expect(sorted[0]?.id).toBe('push-2'); // Longest ago first
    expect(sorted[1]?.id).toBe('push-1');
  });

  it('puts never-performed exercises at the top', () => {
    const exercises: ExerciseWithStatus[] = [
      {
        id: 'push-1',
        name: 'Performed Exercise',
        category: 'push',
        history: [],
        isEligible: true,
        lastPerformed: new Date('2024-01-10'),
        frequency14Days: 0,
      },
      {
        id: 'push-2',
        name: 'Never Performed',
        category: 'push',
        history: [],
        isEligible: true,
        lastPerformed: null,
        frequency14Days: 0,
      },
    ];

    const sorted = sortExercises(exercises);
    expect(sorted[0]?.id).toBe('push-2'); // Never performed first
    expect(sorted[1]?.id).toBe('push-1');
  });
});

describe('formatDate', () => {
  it('formats date as "ddd dd/mm"', () => {
    const date = new Date('2024-01-15'); // Monday
    expect(formatDate(date)).toBe('Mon 15/01');
  });

  it('pads single-digit days and months', () => {
    const date = new Date('2024-01-05'); // Friday
    expect(formatDate(date)).toBe('Fri 05/01');
  });
});

describe('weight conversion', () => {
  it('converts kg to lbs', () => {
    expect(kgToLbs(100)).toBe(220.5);
  });

  it('converts lbs to kg', () => {
    expect(lbsToKg(220)).toBe(99.8);
  });

  it('round-trips approximately', () => {
    const kg = 50;
    const lbs = kgToLbs(kg);
    const backToKg = lbsToKg(lbs);
    expect(Math.abs(backToKg - kg)).toBeLessThan(0.5);
  });
});

describe('getLastThreeSessions', () => {
  it('returns empty array for no history', () => {
    expect(getLastThreeSessions([])).toEqual([]);
  });

  it('returns all sessions if less than 3', () => {
    const history: WorkoutSession[] = [
      { date: '2024-01-10T10:00:00.000Z', weightKg: 50, reps: 10 },
      { date: '2024-01-12T10:00:00.000Z', weightKg: 52, reps: 8 },
    ];
    expect(getLastThreeSessions(history)).toHaveLength(2);
  });

  it('returns the 3 most recent sessions, sorted newest first', () => {
    const history: WorkoutSession[] = [
      { date: '2024-01-10T10:00:00.000Z', weightKg: 50, reps: 10 },
      { date: '2024-01-14T10:00:00.000Z', weightKg: 55, reps: 6 },
      { date: '2024-01-12T10:00:00.000Z', weightKg: 52, reps: 8 },
      { date: '2024-01-05T10:00:00.000Z', weightKg: 48, reps: 12 },
    ];
    const result = getLastThreeSessions(history);
    expect(result).toHaveLength(3);
    expect(result[0]?.date).toBe('2024-01-14T10:00:00.000Z');
    expect(result[1]?.date).toBe('2024-01-12T10:00:00.000Z');
    expect(result[2]?.date).toBe('2024-01-10T10:00:00.000Z');
  });
});

describe('getCategoryOrder', () => {
  it('returns 0 for push', () => {
    expect(getCategoryOrder('push')).toBe(0);
  });

  it('returns 1 for pull', () => {
    expect(getCategoryOrder('pull')).toBe(1);
  });

  it('returns 2 for legs', () => {
    expect(getCategoryOrder('legs')).toBe(2);
  });
});

describe('addExerciseStatus', () => {
  it('adds status fields to exercises', () => {
    const today = new Date('2024-01-15');
    const exercises = [
      {
        id: 'test',
        name: 'Test Exercise',
        category: 'push' as const,
        history: [{ date: '2024-01-13T10:00:00.000Z', weightKg: 50, reps: 10 }],
      },
    ];

    const result = addExerciseStatus(exercises, today);

    expect(result).toHaveLength(1);
    expect(result[0]?.isEligible).toBe(true);
    expect(result[0]?.frequency14Days).toBe(1);
    expect(result[0]?.lastPerformed).toEqual(new Date('2024-01-13T10:00:00.000Z'));
  });
});
