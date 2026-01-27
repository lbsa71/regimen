export type Category = 'push' | 'pull' | 'legs';

export interface Exercise {
  id: string;
  name: string;
  category: Category;
}

export interface WorkoutEntry {
  date: string; // ISO8601 format
  weightKg: number;
  reps: number;
}

export interface ExerciseHistory {
  id: string;
  name: string;
  category: Category;
  history: WorkoutEntry[];
}

export interface UserData {
  googleId: string;
  exercises: ExerciseHistory[];
}

export interface ExerciseWithStatus extends Exercise {
  eligible: boolean;
  lastPerformed: string | null; // ISO8601 format or null if never
  frequencyLast14Days: number;
}
