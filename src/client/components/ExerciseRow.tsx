import React, { useState, useEffect } from 'react';
import { ExerciseWithStatus, WorkoutSession } from '../types';
import {
  formatDate,
  kgToLbs,
  lbsToKg,
  getLastThreeSessions,
} from '../utils/exercises';

interface ExerciseRowProps {
  exercise: ExerciseWithStatus;
  onLogExercise: (exerciseId: string, weightKg: number, reps: number) => Promise<void>;
}

export function ExerciseRow({ exercise, onLogExercise }: ExerciseRowProps): React.ReactElement {
  const lastSessions = getLastThreeSessions(exercise.history);
  const lastSession = lastSessions[0];

  const [weightKg, setWeightKg] = useState<string>(
    lastSession ? String(lastSession.weightKg) : ''
  );
  const [reps, setReps] = useState<string>(
    lastSession ? String(lastSession.reps) : ''
  );
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update weight display when switching units
  useEffect(() => {
    if (weightKg && !isNaN(parseFloat(weightKg))) {
      // No conversion needed here; we store in kg internally
    }
  }, [weightUnit, weightKg]);

  const getDisplayWeight = (): string => {
    if (!weightKg || isNaN(parseFloat(weightKg))) return '';
    const kgValue = parseFloat(weightKg);
    if (weightUnit === 'lbs') {
      return String(kgToLbs(kgValue));
    }
    return weightKg;
  };

  const handleWeightChange = (value: string) => {
    if (value === '' || !isNaN(parseFloat(value))) {
      if (weightUnit === 'lbs' && value !== '') {
        setWeightKg(String(lbsToKg(parseFloat(value))));
      } else {
        setWeightKg(value);
      }
    }
  };

  const getAlternateWeight = (): string => {
    if (!weightKg || isNaN(parseFloat(weightKg))) return '';
    const kgValue = parseFloat(weightKg);
    if (weightUnit === 'kg') {
      return `${kgToLbs(kgValue)} lbs`;
    }
    return `${kgValue} kg`;
  };

  const handleSubmit = async () => {
    if (!weightKg || !reps) {
      setError('Please enter weight and reps');
      return;
    }

    const weight = parseFloat(weightKg);
    const repCount = parseInt(reps, 10);

    if (isNaN(weight) || weight <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    if (isNaN(repCount) || repCount <= 0) {
      setError('Please enter valid reps');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onLogExercise(exercise.id, weight, repCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSessionWeight = (session: WorkoutSession): string => {
    return `${session.weightKg}kg/${kgToLbs(session.weightKg)}lbs × ${session.reps}`;
  };

  return (
    <div
      className={`exercise-row ${!exercise.isEligible ? 'exercise-row--ineligible' : ''}`}
      data-category={exercise.category}
    >
      <div className="exercise-row__info">
        <h3 className="exercise-row__name">{exercise.name}</h3>
        <div className="exercise-row__last-performed">
          {exercise.lastPerformed
            ? `Last: ${formatDate(exercise.lastPerformed)}`
            : 'Never performed'}
        </div>
      </div>

      <div className="exercise-row__history">
        {lastSessions.length > 0 ? (
          <ul className="exercise-row__sessions">
            {lastSessions.map((session, index) => (
              <li key={index} className="exercise-row__session">
                {formatSessionWeight(session)}
              </li>
            ))}
          </ul>
        ) : (
          <span className="exercise-row__no-history">No history</span>
        )}
      </div>

      {exercise.isEligible ? (
        <div className="exercise-row__input">
          <div className="exercise-row__weight-input">
            <input
              type="number"
              value={getDisplayWeight()}
              onChange={(e) => handleWeightChange(e.target.value)}
              placeholder="Weight"
              min="0"
              step="0.5"
              disabled={isSubmitting}
              className="exercise-row__input-field"
            />
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
              disabled={isSubmitting}
              className="exercise-row__unit-select"
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
            <span className="exercise-row__alternate-weight">{getAlternateWeight()}</span>
          </div>

          <div className="exercise-row__reps-input">
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="Reps"
              min="1"
              disabled={isSubmitting}
              className="exercise-row__input-field"
            />
            <span className="exercise-row__reps-label">reps</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="exercise-row__submit-btn"
          >
            {isSubmitting ? 'Saving...' : 'Did it today'}
          </button>

          {error && <div className="exercise-row__error">{error}</div>}
        </div>
      ) : (
        <div className="exercise-row__ineligible-notice">
          Rest day - performed yesterday
        </div>
      )}
    </div>
  );
}
