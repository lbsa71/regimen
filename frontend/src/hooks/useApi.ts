import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { Exercise, WorkoutSession } from '../types';

interface LogExerciseParams {
  exerciseId: string;
  weightKg: number;
  reps: number;
}

interface ApiHook {
  getExercises: () => Promise<Exercise[]>;
  logExercise: (params: LogExerciseParams) => Promise<Exercise>;
  getHistory: () => Promise<WorkoutSession[]>;
}

export function useApi(): ApiHook {
  const { token } = useAuth();

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      return response.json();
    },
    [token]
  );

  const getExercises = useCallback(async (): Promise<Exercise[]> => {
    return fetchWithAuth('/api/exercises');
  }, [fetchWithAuth]);

  const logExercise = useCallback(
    async ({ exerciseId, weightKg, reps }: LogExerciseParams): Promise<Exercise> => {
      return fetchWithAuth(`/api/exercises/${exerciseId}/log`, {
        method: 'POST',
        body: JSON.stringify({ weightKg, reps }),
      });
    },
    [fetchWithAuth]
  );

  const getHistory = useCallback(async (): Promise<WorkoutSession[]> => {
    return fetchWithAuth('/api/history');
  }, [fetchWithAuth]);

  return {
    getExercises,
    logExercise,
    getHistory,
  };
}
