import type { Exercise, Category } from './types.js';

export const EXERCISES: Exercise[] = [
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

export const CATEGORY_ORDER: Category[] = ['push', 'pull', 'legs'];

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
