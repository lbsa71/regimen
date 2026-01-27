import { Category, Exercise, ExerciseWithStatus, WorkoutSession } from '../types';

// Default exercises as defined in the specification
export const DEFAULT_EXERCISES: Omit<Exercise, 'history'>[] = [
  // Push (Bröst, Axlar och Triceps)
  { id: 'dips', name: 'Dips', category: 'push' },
  { id: 'brost-press', name: 'Bröst Press', category: 'push' },
  { id: 'axel-press', name: 'Axel Press', category: 'push' },
  { id: 'sidolyft', name: 'Sidolyft', category: 'push' },
  { id: 'plankan', name: 'Plankan', category: 'push' },

  // Pull (Rygg och Biceps)
  { id: 'back-extensions', name: 'Back extensions', category: 'pull' },
  { id: 'reverse-flye', name: 'Reverse Flye', category: 'pull' },
  { id: 'latsdrag', name: 'Latsdrag', category: 'pull' },
  { id: 'rodd', name: 'Rodd', category: 'pull' },
  { id: 'bicep-curls', name: 'Bicep curls', category: 'pull' },

  // Legs (Ben)
  { id: 'ben-press', name: 'Ben Press', category: 'legs' },
  { id: 'leg-curls', name: 'Leg Curls', category: 'legs' },
  { id: 'leg-extensions', name: 'Leg extensions', category: 'legs' },
  { id: 'calf-raises', name: 'Calf raises', category: 'legs' },
  { id: 'dead-bugs', name: 'Dead Bugs', category: 'legs' },
];

/**
 * Returns the order priority for a category (lower is higher priority)
 */
export function getCategoryOrder(category: Category): number {
  switch (category) {
    case 'push':
      return 0;
    case 'pull':
      return 1;
    case 'legs':
      return 2;
  }
}

/**
 * Returns the display name for a category
 */
export function getCategoryDisplayName(category: Category): string {
  switch (category) {
    case 'push':
      return 'Bröst, Axlar och Triceps';
    case 'pull':
      return 'Rygg och Biceps';
    case 'legs':
      return 'Ben';
  }
}

/**
 * Get the most recent workout date for an exercise
 */
export function getLastPerformedDate(history: WorkoutSession[]): Date | null {
  if (history.length === 0) return null;
  return new Date(
    history.reduce((latest, session) => {
      return new Date(session.date) > new Date(latest.date) ? session : latest;
    }).date
  );
}

/**
 * Check if an exercise is eligible (not performed yesterday)
 */
export function isExerciseEligible(history: WorkoutSession[], today: Date = new Date()): boolean {
  if (history.length === 0) return true;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  return !history.some((session) => session.date.split('T')[0] === yesterdayStr);
}

/**
 * Count how many times an exercise was performed in the last 14 days
 */
export function getFrequency14Days(history: WorkoutSession[], today: Date = new Date()): number {
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  return history.filter((session) => new Date(session.date) >= fourteenDaysAgo).length;
}

/**
 * Add status information to exercises
 */
export function addExerciseStatus(
  exercises: Exercise[],
  today: Date = new Date()
): ExerciseWithStatus[] {
  return exercises.map((exercise) => ({
    ...exercise,
    isEligible: isExerciseEligible(exercise.history, today),
    lastPerformed: getLastPerformedDate(exercise.history),
    frequency14Days: getFrequency14Days(exercise.history, today),
  }));
}

/**
 * Sort exercises according to the specification:
 * 1. Category: Push → Pull → Legs
 * 2. 14-day frequency: Less frequent exercises appear first
 * 3. Recency: Exercises done longest ago appear higher
 */
export function sortExercises(exercises: ExerciseWithStatus[]): ExerciseWithStatus[] {
  return [...exercises].sort((a, b) => {
    // 1. Sort by category
    const categoryDiff = getCategoryOrder(a.category) - getCategoryOrder(b.category);
    if (categoryDiff !== 0) return categoryDiff;

    // 2. Sort by 14-day frequency (less frequent first)
    const frequencyDiff = a.frequency14Days - b.frequency14Days;
    if (frequencyDiff !== 0) return frequencyDiff;

    // 3. Sort by recency (longest ago first)
    // Exercises never performed should appear at the top
    if (a.lastPerformed === null && b.lastPerformed === null) return 0;
    if (a.lastPerformed === null) return -1;
    if (b.lastPerformed === null) return 1;

    return a.lastPerformed.getTime() - b.lastPerformed.getTime();
  });
}

/**
 * Format date as "ddd dd/mm" (e.g., "Mon 25/01")
 */
export function formatDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = days[date.getDay()];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${day} ${dd}/${mm}`;
}

/**
 * Convert kg to lbs
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

/**
 * Convert lbs to kg
 */
export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

/**
 * Get the last 3 workout sessions for an exercise
 */
export function getLastThreeSessions(history: WorkoutSession[]): WorkoutSession[] {
  return [...history]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
}
