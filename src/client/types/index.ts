export type Category = 'push' | 'pull' | 'legs';

export interface WorkoutSession {
  date: string; // ISO8601 date string
  weightKg: number;
  reps: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: Category;
  history: WorkoutSession[];
}

export interface UserData {
  googleId: string;
  exercises: Exercise[];
}

export interface ExerciseWithStatus extends Exercise {
  isEligible: boolean;
  lastPerformed: Date | null;
  frequency14Days: number;
}

export interface AuthContextValue {
  user: GoogleUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
}

export interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}
