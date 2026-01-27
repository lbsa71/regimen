import type { ExerciseWithStatus, UserData, ExerciseHistory } from '../../shared/types.js';
import { EXERCISES, CATEGORY_ORDER } from '../../shared/exercises.js';
import { getUserData } from './storage.js';

function getStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(date1: Date, date2: Date): number {
  const d1 = getStartOfDay(date1);
  const d2 = getStartOfDay(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function isYesterday(dateString: string, today: Date): boolean {
  const date = new Date(dateString);
  return daysBetween(date, today) === 1;
}

function isToday(dateString: string, today: Date): boolean {
  const date = new Date(dateString);
  return daysBetween(date, today) === 0;
}

function getLastPerformed(history: ExerciseHistory): string | null {
  if (history.history.length === 0) {
    return null;
  }
  // Sort by date descending and get the most recent
  const sorted = [...history.history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sorted[0].date;
}

function countFrequencyLast14Days(history: ExerciseHistory, today: Date): number {
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  return history.history.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= fourteenDaysAgo && entryDate <= today;
  }).length;
}

function isEligible(lastPerformed: string | null, today: Date): boolean {
  if (!lastPerformed) {
    return true; // Never performed, so eligible
  }

  // An exercise requires one full rest day between sessions
  // If performed today or yesterday, it is ineligible
  if (isToday(lastPerformed, today) || isYesterday(lastPerformed, today)) {
    return false;
  }

  return true;
}

export function getExercisesWithStatus(
  userData: UserData,
  today: Date = new Date()
): ExerciseWithStatus[] {
  const exercises: ExerciseWithStatus[] = EXERCISES.map((exercise) => {
    const history = userData.exercises.find((e) => e.id === exercise.id);
    const lastPerformed = history ? getLastPerformed(history) : null;
    const frequencyLast14Days = history ? countFrequencyLast14Days(history, today) : 0;

    return {
      ...exercise,
      eligible: isEligible(lastPerformed, today),
      lastPerformed,
      frequencyLast14Days,
    };
  });

  return sortExercises(exercises);
}

export function sortExercises(exercises: ExerciseWithStatus[]): ExerciseWithStatus[] {
  return [...exercises].sort((a, b) => {
    // 1. Category: Push → Pull → Legs
    const categoryDiff =
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (categoryDiff !== 0) {
      return categoryDiff;
    }

    // 2. 14-day frequency: Less frequent exercises appear first
    if (a.frequencyLast14Days !== b.frequencyLast14Days) {
      return a.frequencyLast14Days - b.frequencyLast14Days;
    }

    // 3. Recency: Exercises done longest ago appear higher
    // null (never done) should come first
    if (a.lastPerformed === null && b.lastPerformed !== null) {
      return -1;
    }
    if (a.lastPerformed !== null && b.lastPerformed === null) {
      return 1;
    }
    if (a.lastPerformed && b.lastPerformed) {
      return new Date(a.lastPerformed).getTime() - new Date(b.lastPerformed).getTime();
    }

    return 0;
  });
}

export async function listExercises(googleId: string): Promise<ExerciseWithStatus[]> {
  const userData = await getUserData(googleId);
  return getExercisesWithStatus(userData);
}
