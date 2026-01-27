import { describe, it, expect } from 'vitest';
import { getExercisesWithStatus, sortExercises } from '../src/services/exercises.js';
import type { UserData, ExerciseWithStatus } from '../src/types.js';
import { EXERCISES } from '../src/exercises.js';

function createUserData(overrides: Partial<UserData> = {}): UserData {
  return {
    googleId: 'test-user',
    exercises: EXERCISES.map((e) => ({
      ...e,
      history: [],
    })),
    ...overrides,
  };
}

describe('Eligibility Rules', () => {
  it('should mark an exercise as eligible if never performed', () => {
    const userData = createUserData();
    const today = new Date('2024-01-15');

    const result = getExercisesWithStatus(userData, today);
    const dips = result.find((e) => e.id === 'dips');

    expect(dips).toBeDefined();
    expect(dips!.eligible).toBe(true);
    expect(dips!.lastPerformed).toBe(null);
  });

  it('should mark an exercise as ineligible if performed today', () => {
    const userData = createUserData();
    const dipsExercise = userData.exercises.find((e) => e.id === 'dips');
    dipsExercise!.history.push({
      date: '2024-01-15T10:00:00Z',
      weightKg: 10,
      reps: 10,
    });

    const today = new Date('2024-01-15');
    const result = getExercisesWithStatus(userData, today);
    const dips = result.find((e) => e.id === 'dips');

    expect(dips!.eligible).toBe(false);
  });

  it('should mark an exercise as ineligible if performed yesterday', () => {
    const userData = createUserData();
    const dipsExercise = userData.exercises.find((e) => e.id === 'dips');
    dipsExercise!.history.push({
      date: '2024-01-14T10:00:00Z',
      weightKg: 10,
      reps: 10,
    });

    const today = new Date('2024-01-15');
    const result = getExercisesWithStatus(userData, today);
    const dips = result.find((e) => e.id === 'dips');

    expect(dips!.eligible).toBe(false);
  });

  it('should mark an exercise as eligible if performed 2 days ago', () => {
    const userData = createUserData();
    const dipsExercise = userData.exercises.find((e) => e.id === 'dips');
    dipsExercise!.history.push({
      date: '2024-01-13T10:00:00Z',
      weightKg: 10,
      reps: 10,
    });

    const today = new Date('2024-01-15');
    const result = getExercisesWithStatus(userData, today);
    const dips = result.find((e) => e.id === 'dips');

    expect(dips!.eligible).toBe(true);
  });
});

describe('Sorting Logic', () => {
  it('should sort by category: Push → Pull → Legs', () => {
    const exercises: ExerciseWithStatus[] = [
      { id: 'ben-press', name: 'Ben Press', category: 'legs', eligible: true, lastPerformed: null, frequencyLast14Days: 0 },
      { id: 'dips', name: 'Dips', category: 'push', eligible: true, lastPerformed: null, frequencyLast14Days: 0 },
      { id: 'rodd', name: 'Rodd', category: 'pull', eligible: true, lastPerformed: null, frequencyLast14Days: 0 },
    ];

    const sorted = sortExercises(exercises);

    expect(sorted[0].category).toBe('push');
    expect(sorted[1].category).toBe('pull');
    expect(sorted[2].category).toBe('legs');
  });

  it('should sort less frequent exercises first within the same category', () => {
    const exercises: ExerciseWithStatus[] = [
      { id: 'dips', name: 'Dips', category: 'push', eligible: true, lastPerformed: null, frequencyLast14Days: 5 },
      { id: 'brost-press', name: 'Bröst Press', category: 'push', eligible: true, lastPerformed: null, frequencyLast14Days: 2 },
      { id: 'axel-press', name: 'Axel Press', category: 'push', eligible: true, lastPerformed: null, frequencyLast14Days: 3 },
    ];

    const sorted = sortExercises(exercises);

    expect(sorted[0].id).toBe('brost-press'); // 2 times
    expect(sorted[1].id).toBe('axel-press');  // 3 times
    expect(sorted[2].id).toBe('dips');        // 5 times
  });

  it('should sort exercises done longest ago higher when frequency is equal', () => {
    const exercises: ExerciseWithStatus[] = [
      { id: 'dips', name: 'Dips', category: 'push', eligible: true, lastPerformed: '2024-01-14T10:00:00Z', frequencyLast14Days: 2 },
      { id: 'brost-press', name: 'Bröst Press', category: 'push', eligible: true, lastPerformed: '2024-01-10T10:00:00Z', frequencyLast14Days: 2 },
      { id: 'axel-press', name: 'Axel Press', category: 'push', eligible: true, lastPerformed: '2024-01-12T10:00:00Z', frequencyLast14Days: 2 },
    ];

    const sorted = sortExercises(exercises);

    expect(sorted[0].id).toBe('brost-press'); // Jan 10 (oldest)
    expect(sorted[1].id).toBe('axel-press');  // Jan 12
    expect(sorted[2].id).toBe('dips');        // Jan 14 (newest)
  });

  it('should sort never-performed exercises before performed ones when frequency is equal', () => {
    const exercises: ExerciseWithStatus[] = [
      { id: 'dips', name: 'Dips', category: 'push', eligible: true, lastPerformed: '2024-01-14T10:00:00Z', frequencyLast14Days: 0 },
      { id: 'brost-press', name: 'Bröst Press', category: 'push', eligible: true, lastPerformed: null, frequencyLast14Days: 0 },
    ];

    const sorted = sortExercises(exercises);

    expect(sorted[0].id).toBe('brost-press'); // never performed
    expect(sorted[1].id).toBe('dips');        // performed
  });
});

describe('Frequency Calculation', () => {
  it('should count exercises in the last 14 days correctly', () => {
    const userData = createUserData();
    const dipsExercise = userData.exercises.find((e) => e.id === 'dips');

    // Add entries: 3 in the last 14 days, 1 older
    dipsExercise!.history = [
      { date: '2024-01-05T10:00:00Z', weightKg: 10, reps: 10 },  // 10 days ago
      { date: '2024-01-10T10:00:00Z', weightKg: 10, reps: 10 },  // 5 days ago
      { date: '2024-01-13T10:00:00Z', weightKg: 10, reps: 10 },  // 2 days ago
      { date: '2023-12-20T10:00:00Z', weightKg: 10, reps: 10 },  // More than 14 days ago
    ];

    const today = new Date('2024-01-15');
    const result = getExercisesWithStatus(userData, today);
    const dips = result.find((e) => e.id === 'dips');

    expect(dips!.frequencyLast14Days).toBe(3);
  });
});
