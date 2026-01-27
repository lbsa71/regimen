import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExerciseWithStatus, Category } from '../types';
import { ExerciseRow } from './ExerciseRow';
import {
  addExerciseStatus,
  sortExercises,
  getCategoryDisplayName,
  DEFAULT_EXERCISES,
} from '../utils/exercises';
import { useApi } from '../hooks/useApi';

export function ExerciseList(): React.ReactElement {
  const [exercises, setExercises] = useState<ExerciseWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getExercises, logExercise } = useApi();

  const loadExercises = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getExercises();

      // Merge with default exercises in case some are missing
      const exerciseMap = new Map(data.map((e) => [e.id, e]));
      const mergedExercises: Exercise[] = DEFAULT_EXERCISES.map((defaultEx) => {
        const existing = exerciseMap.get(defaultEx.id);
        return existing || { ...defaultEx, history: [] };
      });

      const withStatus = addExerciseStatus(mergedExercises);
      const sorted = sortExercises(withStatus);
      setExercises(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    } finally {
      setIsLoading(false);
    }
  }, [getExercises]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const handleLogExercise = async (
    exerciseId: string,
    weightKg: number,
    reps: number
  ): Promise<void> => {
    await logExercise({ exerciseId, weightKg, reps });
    // Reload exercises to get updated data
    await loadExercises();
  };

  if (isLoading) {
    return <div className="exercise-list__loading">Loading exercises...</div>;
  }

  if (error) {
    return (
      <div className="exercise-list__error">
        <p>{error}</p>
        <button onClick={loadExercises} className="exercise-list__retry-btn">
          Retry
        </button>
      </div>
    );
  }

  // Group exercises by category
  const groupedExercises = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = [];
    }
    acc[exercise.category].push(exercise);
    return acc;
  }, {} as Record<Category, ExerciseWithStatus[]>);

  const categoryOrder: Category[] = ['push', 'pull', 'legs'];

  return (
    <div className="exercise-list">
      {categoryOrder.map((category) => {
        const categoryExercises = groupedExercises[category] || [];
        if (categoryExercises.length === 0) return null;

        return (
          <div key={category} className="exercise-list__category">
            <h2 className="exercise-list__category-title">
              {getCategoryDisplayName(category)}
            </h2>
            <div className="exercise-list__exercises">
              {categoryExercises.map((exercise) => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  onLogExercise={handleLogExercise}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
