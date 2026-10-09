import { ActiveWorkout, CompletedWorkout, Exercise, WorkoutTemplate, MuscleGroup } from '../types';

const STORAGE_KEYS = {
  ACTIVE_WORKOUT: 'irontrack_active_workout_v1',
  HISTORY: 'irontrack_workout_history_v1',
  CUSTOM_EXERCISES: 'irontrack_custom_exercises_v1',
  UNIT_PREF: 'irontrack_unit_preference_v1',
};

export const DEFAULT_EXERCISES: Exercise[] = [
  // Chest
  { id: 'ex-bench-press', name: 'Barbell Bench Press', muscleGroup: 'Chest', defaultRestSec: 90, equipment: 'Barbell' },
  { id: 'ex-incline-db-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', defaultRestSec: 90, equipment: 'Dumbbell' },
  { id: 'ex-cable-crossover', name: 'Cable Chest Flye', muscleGroup: 'Chest', defaultRestSec: 60, equipment: 'Cable' },
  { id: 'ex-dips', name: 'Chest Dips', muscleGroup: 'Chest', defaultRestSec: 90, equipment: 'Bodyweight / Belt' },
  { id: 'ex-pushup', name: 'Push-Ups', muscleGroup: 'Chest', defaultRestSec: 60, equipment: 'Bodyweight' },

  // Back
  { id: 'ex-deadlift', name: 'Conventional Deadlift', muscleGroup: 'Back', defaultRestSec: 120, equipment: 'Barbell' },
  { id: 'ex-barbell-row', name: 'Barbell Bent-Over Row', muscleGroup: 'Back', defaultRestSec: 90, equipment: 'Barbell' },
  { id: 'ex-lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'Back', defaultRestSec: 60, equipment: 'Cable' },
  { id: 'ex-pullup', name: 'Pull-Up', muscleGroup: 'Back', defaultRestSec: 90, equipment: 'Bodyweight' },
  { id: 'ex-seated-cable-row', name: 'Seated Cable Row', muscleGroup: 'Back', defaultRestSec: 60, equipment: 'Cable' },

  // Legs
  { id: 'ex-squat', name: 'Barbell Back Squat', muscleGroup: 'Legs', defaultRestSec: 120, equipment: 'Barbell' },
  { id: 'ex-rdl', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', defaultRestSec: 90, equipment: 'Barbell' },
  { id: 'ex-leg-press', name: 'Leg Press', muscleGroup: 'Legs', defaultRestSec: 90, equipment: 'Machine' },
  { id: 'ex-bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', defaultRestSec: 90, equipment: 'Dumbbell' },
  { id: 'ex-leg-curl', name: 'Lying Hamstring Curl', muscleGroup: 'Legs', defaultRestSec: 60, equipment: 'Machine' },
  { id: 'ex-calf-raise', name: 'Standing Calf Raise', muscleGroup: 'Legs', defaultRestSec: 60, equipment: 'Machine' },

  // Shoulders
  { id: 'ex-overhead-press', name: 'Overhead Barbell Press', muscleGroup: 'Shoulders', defaultRestSec: 90, equipment: 'Barbell' },
  { id: 'ex-db-shoulder-press', name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', defaultRestSec: 90, equipment: 'Dumbbell' },
  { id: 'ex-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', defaultRestSec: 60, equipment: 'Dumbbell' },
  { id: 'ex-face-pull', name: 'Cable Face Pull', muscleGroup: 'Shoulders', defaultRestSec: 60, equipment: 'Cable' },

  // Arms
  { id: 'ex-bicep-curl', name: 'Barbell Bicep Curl', muscleGroup: 'Arms', defaultRestSec: 60, equipment: 'Barbell' },
  { id: 'ex-hammer-curl', name: 'Dumbbell Hammer Curl', muscleGroup: 'Arms', defaultRestSec: 60, equipment: 'Dumbbell' },
  { id: 'ex-tricep-pushdown', name: 'Cable Tricep Pushdown', muscleGroup: 'Arms', defaultRestSec: 60, equipment: 'Cable' },
  { id: 'ex-skull-crusher', name: 'EZ-Bar Skull Crusher', muscleGroup: 'Arms', defaultRestSec: 60, equipment: 'Barbell' },

  // Core
  { id: 'ex-hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'Core', defaultRestSec: 60, equipment: 'Bodyweight' },
  { id: 'ex-cable-crunch', name: 'Cable Kneeling Crunch', muscleGroup: 'Core', defaultRestSec: 60, equipment: 'Cable' },
  { id: 'ex-plank', name: 'Weighted Plank', muscleGroup: 'Core', defaultRestSec: 60, equipment: 'Bodyweight / Plate' },
];

export const PREBUILT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'template-push',
    name: 'Push Day (Chest, Shoulders, Triceps)',
    description: 'Classic hypertrophy push routine focusing on heavy horizontal press and shoulder volume.',
    muscleFocus: 'Chest · Shoulders · Arms',
    estimatedMinutes: 55,
    exercises: [
      { exerciseId: 'ex-bench-press', exerciseName: 'Barbell Bench Press', muscleGroup: 'Chest', defaultSets: 4, defaultReps: 8, defaultWeight: 185, targetRestSec: 90 },
      { exerciseId: 'ex-incline-db-press', exerciseName: 'Incline Dumbbell Press', muscleGroup: 'Chest', defaultSets: 3, defaultReps: 10, defaultWeight: 65, targetRestSec: 90 },
      { exerciseId: 'ex-overhead-press', exerciseName: 'Overhead Barbell Press', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 8, defaultWeight: 115, targetRestSec: 90 },
      { exerciseId: 'ex-lateral-raise', exerciseName: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 25, targetRestSec: 60 },
      { exerciseId: 'ex-tricep-pushdown', exerciseName: 'Cable Tricep Pushdown', muscleGroup: 'Arms', defaultSets: 3, defaultReps: 12, defaultWeight: 55, targetRestSec: 60 },
    ],
  },
  {
    id: 'template-pull',
    name: 'Pull Day (Back, Rear Delts, Biceps)',
    description: 'Comprehensive vertical and horizontal pulling session for back thickness and width.',
    muscleFocus: 'Back · Shoulders · Arms',
    estimatedMinutes: 50,
    exercises: [
      { exerciseId: 'ex-deadlift', exerciseName: 'Conventional Deadlift', muscleGroup: 'Back', defaultSets: 3, defaultReps: 5, defaultWeight: 275, targetRestSec: 120 },
      { exerciseId: 'ex-lat-pulldown', exerciseName: 'Lat Pulldown', muscleGroup: 'Back', defaultSets: 4, defaultReps: 10, defaultWeight: 140, targetRestSec: 60 },
      { exerciseId: 'ex-barbell-row', exerciseName: 'Barbell Bent-Over Row', muscleGroup: 'Back', defaultSets: 3, defaultReps: 8, defaultWeight: 155, targetRestSec: 90 },
      { exerciseId: 'ex-face-pull', exerciseName: 'Cable Face Pull', muscleGroup: 'Shoulders', defaultSets: 4, defaultReps: 15, defaultWeight: 45, targetRestSec: 60 },
      { exerciseId: 'ex-hammer-curl', exerciseName: 'Dumbbell Hammer Curl', muscleGroup: 'Arms', defaultSets: 3, defaultReps: 12, defaultWeight: 35, targetRestSec: 60 },
    ],
  },
  {
    id: 'template-legs',
    name: 'Legs & Core (Squat & Hamstrings)',
    description: 'High-power lower body session prioritizing knee flexion, hip hinge, and abdominal stabilization.',
    muscleFocus: 'Legs · Core',
    estimatedMinutes: 60,
    exercises: [
      { exerciseId: 'ex-squat', exerciseName: 'Barbell Back Squat', muscleGroup: 'Legs', defaultSets: 4, defaultReps: 6, defaultWeight: 225, targetRestSec: 120 },
      { exerciseId: 'ex-rdl', exerciseName: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 10, defaultWeight: 185, targetRestSec: 90 },
      { exerciseId: 'ex-leg-press', exerciseName: 'Leg Press', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 12, defaultWeight: 360, targetRestSec: 90 },
      { exerciseId: 'ex-calf-raise', exerciseName: 'Standing Calf Raise', muscleGroup: 'Legs', defaultSets: 4, defaultReps: 15, defaultWeight: 140, targetRestSec: 60 },
      { exerciseId: 'ex-hanging-leg-raise', exerciseName: 'Hanging Leg Raise', muscleGroup: 'Core', defaultSets: 3, defaultReps: 12, defaultWeight: 0, targetRestSec: 60 },
    ],
  },
];

// Helper to seed realistic workout logs so new users have visual chart data on Page 3
function getInitialSeededWorkouts(): CompletedWorkout[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: 'demo-workout-1',
      name: 'Push Day (Hypertrophy)',
      startedAt: now - dayMs * 10 - 52 * 60 * 1000,
      completedAt: now - dayMs * 10,
      durationSeconds: 3120, // 52m
      unit: 'lbs',
      totalVolume: 12240,
      totalSets: 14,
      exercises: [
        {
          id: 'ex-e1',
          exerciseId: 'ex-bench-press',
          exerciseName: 'Barbell Bench Press',
          muscleGroup: 'Chest',
          targetRestSec: 90,
          sets: [
            { id: 's1', setNumber: 1, type: 'warmup', weight: 135, reps: 10, completed: true },
            { id: 's2', setNumber: 2, type: 'working', weight: 185, reps: 8, completed: true },
            { id: 's3', setNumber: 3, type: 'working', weight: 185, reps: 8, completed: true },
            { id: 's4', setNumber: 4, type: 'working', weight: 195, reps: 6, completed: true },
          ],
        },
        {
          id: 'ex-e2',
          exerciseId: 'ex-incline-db-press',
          exerciseName: 'Incline Dumbbell Press',
          muscleGroup: 'Chest',
          targetRestSec: 90,
          sets: [
            { id: 's5', setNumber: 1, type: 'working', weight: 60, reps: 10, completed: true },
            { id: 's6', setNumber: 2, type: 'working', weight: 60, reps: 9, completed: true },
            { id: 's7', setNumber: 3, type: 'failure', weight: 65, reps: 7, completed: true },
          ],
        },
        {
          id: 'ex-e3',
          exerciseId: 'ex-lateral-raise',
          exerciseName: 'Dumbbell Lateral Raise',
          muscleGroup: 'Shoulders',
          targetRestSec: 60,
          sets: [
            { id: 's8', setNumber: 1, type: 'working', weight: 25, reps: 15, completed: true },
            { id: 's9', setNumber: 2, type: 'working', weight: 25, reps: 14, completed: true },
            { id: 's10', setNumber: 3, type: 'working', weight: 25, reps: 12, completed: true },
          ],
        },
      ],
    },
    {
      id: 'demo-workout-2',
      name: 'Legs & Core Session',
      startedAt: now - dayMs * 7 - 58 * 60 * 1000,
      completedAt: now - dayMs * 7,
      durationSeconds: 3480, // 58m
      unit: 'lbs',
      totalVolume: 16420,
      totalSets: 15,
      exercises: [
        {
          id: 'ex-e4',
          exerciseId: 'ex-squat',
          exerciseName: 'Barbell Back Squat',
          muscleGroup: 'Legs',
          targetRestSec: 120,
          sets: [
            { id: 's11', setNumber: 1, type: 'warmup', weight: 135, reps: 10, completed: true },
            { id: 's12', setNumber: 2, type: 'working', weight: 225, reps: 6, completed: true },
            { id: 's13', setNumber: 3, type: 'working', weight: 235, reps: 6, completed: true },
            { id: 's14', setNumber: 4, type: 'working', weight: 245, reps: 5, completed: true },
          ],
        },
        {
          id: 'ex-e5',
          exerciseId: 'ex-rdl',
          exerciseName: 'Romanian Deadlift (RDL)',
          muscleGroup: 'Legs',
          targetRestSec: 90,
          sets: [
            { id: 's15', setNumber: 1, type: 'working', weight: 185, reps: 10, completed: true },
            { id: 's16', setNumber: 2, type: 'working', weight: 195, reps: 8, completed: true },
            { id: 's17', setNumber: 3, type: 'working', weight: 205, reps: 8, completed: true },
          ],
        },
      ],
    },
    {
      id: 'demo-workout-3',
      name: 'Pull Day (Heavy Back)',
      startedAt: now - dayMs * 4 - 49 * 60 * 1000,
      completedAt: now - dayMs * 4,
      durationSeconds: 2940, // 49m
      unit: 'lbs',
      totalVolume: 14890,
      totalSets: 14,
      exercises: [
        {
          id: 'ex-e6',
          exerciseId: 'ex-deadlift',
          exerciseName: 'Conventional Deadlift',
          muscleGroup: 'Back',
          targetRestSec: 120,
          sets: [
            { id: 's18', setNumber: 1, type: 'warmup', weight: 185, reps: 6, completed: true },
            { id: 's19', setNumber: 2, type: 'working', weight: 275, reps: 5, completed: true },
            { id: 's20', setNumber: 3, type: 'working', weight: 295, reps: 4, completed: true },
          ],
        },
        {
          id: 'ex-e7',
          exerciseId: 'ex-lat-pulldown',
          exerciseName: 'Lat Pulldown',
          muscleGroup: 'Back',
          targetRestSec: 60,
          sets: [
            { id: 's21', setNumber: 1, type: 'working', weight: 140, reps: 10, completed: true },
            { id: 's22', setNumber: 2, type: 'working', weight: 145, reps: 10, completed: true },
            { id: 's23', setNumber: 3, type: 'working', weight: 150, reps: 8, completed: true },
          ],
        },
      ],
    },
    {
      id: 'demo-workout-4',
      name: 'Push Day (PR Session)',
      startedAt: now - dayMs * 2 - 47 * 60 * 1000,
      completedAt: now - dayMs * 2,
      durationSeconds: 2820, // 47m
      unit: 'lbs',
      totalVolume: 13680,
      totalSets: 13,
      exercises: [
        {
          id: 'ex-e8',
          exerciseId: 'ex-bench-press',
          exerciseName: 'Barbell Bench Press',
          muscleGroup: 'Chest',
          targetRestSec: 90,
          sets: [
            { id: 's24', setNumber: 1, type: 'warmup', weight: 135, reps: 10, completed: true },
            { id: 's25', setNumber: 2, type: 'working', weight: 195, reps: 8, completed: true },
            { id: 's26', setNumber: 3, type: 'working', weight: 205, reps: 6, completed: true },
            { id: 's27', setNumber: 4, type: 'working', weight: 215, reps: 5, completed: true }, // Bench Press progression!
          ],
        },
        {
          id: 'ex-e9',
          exerciseId: 'ex-incline-db-press',
          exerciseName: 'Incline Dumbbell Press',
          muscleGroup: 'Chest',
          targetRestSec: 90,
          sets: [
            { id: 's28', setNumber: 1, type: 'working', weight: 65, reps: 10, completed: true },
            { id: 's29', setNumber: 2, type: 'working', weight: 70, reps: 8, completed: true },
          ],
        },
      ],
    },
  ];
}

// STORAGE API
export const StorageService = {
  // Get all exercises (default + custom)
  getAllExercises(): Exercise[] {
    try {
      const customStr = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
      const custom: Exercise[] = customStr ? JSON.parse(customStr) : [];
      return [...DEFAULT_EXERCISES, ...custom];
    } catch (e) {
      console.error('Error loading exercises:', e);
      return DEFAULT_EXERCISES;
    }
  },

  addCustomExercise(newEx: Omit<Exercise, 'id' | 'isCustom'>): Exercise {
    const customStr = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
    const customList: Exercise[] = customStr ? JSON.parse(customStr) : [];
    const created: Exercise = {
      ...newEx,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      isCustom: true,
    };
    customList.push(created);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(customList));
    return created;
  },

  // Active workout
  getActiveWorkout(): ActiveWorkout | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveActiveWorkout(workout: ActiveWorkout | null): void {
    try {
      if (!workout) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      } else {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
      }
    } catch (err) {
      console.error('Failed to save active workout:', err);
    }
  },

  // Completed workouts history
  getWorkoutHistory(): CompletedWorkout[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!data) {
        const seeded = getInitialSeededWorkouts();
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error fetching history:', e);
      return [];
    }
  },

  saveCompletedWorkout(workout: CompletedWorkout): CompletedWorkout[] {
    const history = this.getWorkoutHistory();
    const updated = [workout, ...history];
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      this.saveActiveWorkout(null);
    } catch (e) {
      console.error('Error saving workout to history:', e);
    }
    return updated;
  },

  deleteWorkoutFromHistory(workoutId: string): CompletedWorkout[] {
    const history = this.getWorkoutHistory();
    const updated = history.filter((w) => w.id !== workoutId);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error deleting workout:', e);
    }
    return updated;
  },

  resetHistoryToSample(): CompletedWorkout[] {
    const seeded = getInitialSeededWorkouts();
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(seeded));
    return seeded;
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_EXERCISES);
  },

  // Preferred unit
  getUnitPreference(): 'lbs' | 'kg' {
    return (localStorage.getItem(STORAGE_KEYS.UNIT_PREF) as 'lbs' | 'kg') || 'lbs';
  },

  setUnitPreference(unit: 'lbs' | 'kg'): void {
    localStorage.setItem(STORAGE_KEYS.UNIT_PREF, unit);
  },
};
