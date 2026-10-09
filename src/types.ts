export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Arms' | 'Shoulders' | 'Core';

export type SetType = 'warmup' | 'working' | 'failure' | 'drop';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: SetType;
  weight: number;
  reps: number;
  completed: boolean;
  previousWeight?: number;
  previousReps?: number;
}

export interface ExerciseEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  targetRestSec: number;
  sets: WorkoutSet[];
  notes?: string;
}

export interface ActiveWorkout {
  id: string;
  name: string;
  templateId?: string;
  startedAt: number;
  exercises: ExerciseEntry[];
  unit: 'lbs' | 'kg';
  notes?: string;
  isPaused?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  defaultRestSec: number;
  equipment?: string;
  instructions?: string;
  isCustom?: boolean;
}

export interface RoutineTemplateExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
  targetRestSec: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  muscleFocus: string;
  estimatedMinutes: number;
  exercises: RoutineTemplateExercise[];
  isCustom?: boolean;
}

export interface CompletedWorkout {
  id: string;
  name: string;
  startedAt: number;
  completedAt: number;
  durationSeconds: number;
  unit: 'lbs' | 'kg';
  totalVolume: number;
  totalSets: number;
  exercises: ExerciseEntry[];
  notes?: string;
}

export type TabType = 'tracker' | 'templates' | 'history';
