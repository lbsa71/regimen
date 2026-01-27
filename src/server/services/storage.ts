import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { UserData, ExerciseHistory, WorkoutEntry } from '../../shared/types.js';
import { EXERCISES } from '../../shared/exercises.js';

const DATA_DIR = process.env.DATA_DIR || '/data';

function getUserFilePath(googleId: string): string {
  // Sanitize googleId to prevent path traversal
  const sanitizedId = googleId.replace(/[^a-zA-Z0-9]/g, '_');
  return path.join(DATA_DIR, `${sanitizedId}.json`);
}

function createDefaultUserData(googleId: string): UserData {
  return {
    googleId,
    exercises: EXERCISES.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      history: [],
    })),
  };
}

export async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory already exists or permission issue (handled at startup)
  }
}

export async function getUserData(googleId: string): Promise<UserData> {
  const filePath = getUserFilePath(googleId);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const userData = JSON.parse(data) as UserData;

    // Ensure all exercises exist (in case new exercises were added)
    const existingIds = new Set(userData.exercises.map((e) => e.id));
    for (const exercise of EXERCISES) {
      if (!existingIds.has(exercise.id)) {
        userData.exercises.push({
          id: exercise.id,
          name: exercise.name,
          category: exercise.category,
          history: [],
        });
      }
    }

    return userData;
  } catch {
    // File doesn't exist, create default user data
    return createDefaultUserData(googleId);
  }
}

export async function saveUserData(userData: UserData): Promise<void> {
  const filePath = getUserFilePath(userData.googleId);
  await fs.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf-8');
}

export async function logWorkout(
  googleId: string,
  exerciseId: string,
  entry: WorkoutEntry
): Promise<ExerciseHistory | null> {
  const userData = await getUserData(googleId);
  const exercise = userData.exercises.find((e) => e.id === exerciseId);

  if (!exercise) {
    return null;
  }

  exercise.history.push(entry);
  await saveUserData(userData);

  return exercise;
}

export async function getExerciseHistory(
  googleId: string,
  exerciseId: string
): Promise<ExerciseHistory | null> {
  const userData = await getUserData(googleId);
  return userData.exercises.find((e) => e.id === exerciseId) || null;
}
