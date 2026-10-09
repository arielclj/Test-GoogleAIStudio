import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Square, Plus, Dumbbell, Clock, Flame, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import { ActiveWorkout, ExerciseEntry, Exercise, MuscleGroup } from '../types';
import { StorageService } from '../services/storage';
import { ExerciseCard } from '../components/ExerciseCard';
import { AddExerciseModal } from '../components/AddExerciseModal';
import { FinishWorkoutModal } from '../components/FinishWorkoutModal';
import { RestTimerBar } from '../components/RestTimerBar';

interface TrackerPageProps {
  activeWorkout: ActiveWorkout | null;
  onUpdateWorkout: (workout: ActiveWorkout | null) => void;
  onWorkoutFinished: () => void;
  onNavigateToTemplates: () => void;
}

export const TrackerPage: React.FC<TrackerPageProps> = ({
  activeWorkout,
  onUpdateWorkout,
  onWorkoutFinished,
  onNavigateToTemplates,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [timerTrigger, setTimerTrigger] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const availableExercises = useMemo(() => StorageService.getAllExercises(), []);

  // Map of exercise personal records from previous completed workout history
  const historicalPrMap = useMemo(() => {
    const history = StorageService.getWorkoutHistory();
    const map: Record<string, number> = {};

    history.forEach((w) => {
      w.exercises.forEach((ex) => {
        const keyName = ex.exerciseName.toLowerCase().trim();
        const keyId = ex.exerciseId;

        ex.sets.forEach((s) => {
          if ((s.completed || s.weight > 0) && s.weight > 0) {
            if (!map[keyName] || s.weight > map[keyName]) {
              map[keyName] = s.weight;
            }
            if (keyId && (!map[keyId] || s.weight > map[keyId])) {
              map[keyId] = s.weight;
            }
          }
        });
      });
    });

    return map;
  }, []);

  // Workout duration stopwatch timer
  useEffect(() => {
    if (!activeWorkout) {
      setElapsedSeconds(0);
      return;
    }

    const calcElapsed = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - activeWorkout.startedAt) / 1000);
      setElapsedSeconds(Math.max(0, elapsed));
    };

    calcElapsed();
    const timer = setInterval(calcElapsed, 1000);
    return () => clearInterval(timer);
  }, [activeWorkout]);

  // Real-time calculation of total volume and total sets
  const { totalVolume, totalCompletedSets, totalSetsCount } = useMemo(() => {
    if (!activeWorkout) return { totalVolume: 0, totalCompletedSets: 0, totalSetsCount: 0 };

    let volume = 0;
    let completed = 0;
    let total = 0;

    for (const ex of activeWorkout.exercises) {
      for (const s of ex.sets) {
        total++;
        if (s.completed) {
          completed++;
          volume += (s.weight || 0) * (s.reps || 0);
        }
      }
    }

    return { totalVolume: volume, totalCompletedSets: completed, totalSetsCount: total };
  }, [activeWorkout]);

  // Start a fresh quick workout
  const handleStartQuickWorkout = () => {
    const newWorkout: ActiveWorkout = {
      id: `w-${Date.now()}`,
      name: 'Freestyle Workout',
      startedAt: Date.now(),
      exercises: [],
      unit: StorageService.getUnitPreference(),
    };
    onUpdateWorkout(newWorkout);
    StorageService.saveActiveWorkout(newWorkout);
  };

  const handleToggleUnit = () => {
    if (!activeWorkout) return;
    const nextUnit = activeWorkout.unit === 'lbs' ? 'kg' : 'lbs';
    const updated: ActiveWorkout = { ...activeWorkout, unit: nextUnit };
    onUpdateWorkout(updated);
    StorageService.saveActiveWorkout(updated);
    StorageService.setUnitPreference(nextUnit);
  };

  const handleAddExerciseToWorkout = (exercise: Exercise) => {
    if (!activeWorkout) {
      const newWorkout: ActiveWorkout = {
        id: `w-${Date.now()}`,
        name: 'Gym Session',
        startedAt: Date.now(),
        exercises: [],
        unit: StorageService.getUnitPreference(),
      };
      const entry: ExerciseEntry = {
        id: `entry-${Date.now()}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscleGroup,
        targetRestSec: exercise.defaultRestSec,
        sets: [
          { id: `s1-${Date.now()}`, setNumber: 1, type: 'warmup', weight: 0, reps: 10, completed: false },
          { id: `s2-${Date.now()}`, setNumber: 2, type: 'working', weight: 0, reps: 10, completed: false },
          { id: `s3-${Date.now()}`, setNumber: 3, type: 'working', weight: 0, reps: 10, completed: false },
        ],
      };
      newWorkout.exercises.push(entry);
      onUpdateWorkout(newWorkout);
      StorageService.saveActiveWorkout(newWorkout);
      return;
    }

    const entry: ExerciseEntry = {
      id: `entry-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      targetRestSec: exercise.defaultRestSec,
      sets: [
        { id: `s1-${Date.now()}`, setNumber: 1, type: 'working', weight: 0, reps: 10, completed: false },
        { id: `s2-${Date.now()}`, setNumber: 2, type: 'working', weight: 0, reps: 10, completed: false },
        { id: `s3-${Date.now()}`, setNumber: 3, type: 'working', weight: 0, reps: 10, completed: false },
      ],
    };

    const updated = {
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, entry],
    };
    onUpdateWorkout(updated);
    StorageService.saveActiveWorkout(updated);
  };

  const handleUpdateExercise = (index: number, updatedEntry: ExerciseEntry) => {
    if (!activeWorkout) return;
    const newExercises = [...activeWorkout.exercises];
    newExercises[index] = updatedEntry;
    const updated = { ...activeWorkout, exercises: newExercises };
    onUpdateWorkout(updated);
    StorageService.saveActiveWorkout(updated);
  };

  const handleRemoveExercise = (index: number) => {
    if (!activeWorkout) return;
    const newExercises = activeWorkout.exercises.filter((_, i) => i !== index);
    const updated = { ...activeWorkout, exercises: newExercises };
    onUpdateWorkout(updated);
    StorageService.saveActiveWorkout(updated);
  };

  const handleCreateCustomExercise = (name: string, muscleGroup: MuscleGroup, restSec: number): Exercise => {
    return StorageService.addCustomExercise({
      name,
      muscleGroup,
      defaultRestSec: restSec,
    });
  };

  const handleTriggerRestTimer = () => {
    setTimerTrigger(Date.now());
  };

  const handleSaveWorkout = (name: string, notes: string) => {
    if (!activeWorkout) return;
    const completedAt = Date.now();
    const duration = Math.max(1, Math.floor((completedAt - activeWorkout.startedAt) / 1000));

    StorageService.saveCompletedWorkout({
      id: activeWorkout.id,
      name,
      startedAt: activeWorkout.startedAt,
      completedAt,
      durationSeconds: duration,
      unit: activeWorkout.unit,
      totalVolume,
      totalSets: totalCompletedSets,
      exercises: activeWorkout.exercises,
      notes,
    });

    setIsFinishModalOpen(false);
    onUpdateWorkout(null);
    onWorkoutFinished();
  };

  const handleDiscardWorkout = () => {
    if (window.confirm('Are you sure you want to discard this workout? All progress in this session will be lost.')) {
      setIsFinishModalOpen(false);
      onUpdateWorkout(null);
      StorageService.saveActiveWorkout(null);
    }
  };

  const formatStopwatch = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // If no active workout is running, show the Empty State / Quick Launch Screen
  if (!activeWorkout) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 min-h-[calc(100vh-4rem)] flex flex-col justify-center">
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shadow-xl">
            <Dumbbell className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-zinc-100 tracking-tight">
            Ready to Train?
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-xs mx-auto">
            Log your sets, rest timer, and track your total volume lifted in real-time.
          </p>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={handleStartQuickWorkout}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.99] transition-all min-h-[48px]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Empty Workout</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToTemplates}
              className="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors min-h-[48px]"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Launch from Routine Template</span>
            </button>
          </div>

          <div className="mt-10 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-left">
            <div className="text-xs font-semibold text-zinc-300">Quick Workout Features:</div>
            <ul className="mt-2 text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
              <li>Automatic audio & haptic rest timer countdown</li>
              <li>Live total volume (Weight × Reps) calculation</li>
              <li>Warm-up, Working, and Failure set classifications</li>
              <li>100% saved locally on your phone (no sign-up)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-3 pt-3 pb-32">
      {/* Top Session Header & Live Summary Strip */}
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-md pt-1 pb-3 -mx-3 px-3 border-b border-zinc-800/80">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Workout Title & Unit Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={activeWorkout.name}
              onChange={(e) => {
                const updated = { ...activeWorkout, name: e.target.value };
                onUpdateWorkout(updated);
                StorageService.saveActiveWorkout(updated);
              }}
              className="text-lg font-bold text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 focus:outline-none max-w-[200px] truncate"
              placeholder="Workout Name"
            />
            <button
              type="button"
              onClick={handleToggleUnit}
              className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono-numbers bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-emerald-500 transition-colors"
              title="Toggle lbs / kg"
            >
              {activeWorkout.unit.toUpperCase()}
            </button>
          </div>

          {/* Finish Button */}
          <button
            type="button"
            onClick={() => setIsFinishModalOpen(true)}
            className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all min-h-[38px]"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Finish</span>
          </button>
        </div>

        {/* Real-time Active Summary Bar (Volume, Sets, Duration) */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
          {/* Total Volume */}
          <div className="text-center">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
              Volume
            </div>
            <div className="text-base font-extrabold text-emerald-400 font-mono-numbers leading-tight mt-0.5">
              {totalVolume.toLocaleString()}
            </div>
            <div className="text-[9px] text-zinc-500">{activeWorkout.unit}</div>
          </div>

          {/* Total Sets Completed */}
          <div className="text-center border-x border-zinc-800">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
              Sets
            </div>
            <div className="text-base font-extrabold text-zinc-100 font-mono-numbers leading-tight mt-0.5">
              {totalCompletedSets}
              <span className="text-xs text-zinc-500 font-normal font-mono-numbers">
                /{totalSetsCount}
              </span>
            </div>
            <div className="text-[9px] text-zinc-500">done</div>
          </div>

          {/* Elapsed Time Stopwatch */}
          <div className="text-center">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
              Time
            </div>
            <div className="text-base font-extrabold text-zinc-100 font-mono-numbers leading-tight mt-0.5 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>{formatStopwatch(elapsedSeconds)}</span>
            </div>
            <div className="text-[9px] text-zinc-500">elapsed</div>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="mt-4 space-y-4">
        {activeWorkout.exercises.map((entry, index) => {
          const previousBestWeight =
            historicalPrMap[entry.exerciseId] ||
            historicalPrMap[entry.exerciseName.toLowerCase().trim()] ||
            0;

          return (
            <ExerciseCard
              key={entry.id}
              exercise={entry}
              index={index}
              unit={activeWorkout.unit}
              previousBestWeight={previousBestWeight}
              onUpdateExercise={(updated) => handleUpdateExercise(index, updated)}
              onRemoveExercise={() => handleRemoveExercise(index)}
              onTriggerRestTimer={handleTriggerRestTimer}
            />
          );
        })}

        {activeWorkout.exercises.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800">
            <p className="text-sm text-zinc-400">No exercises added to this workout yet.</p>
            <p className="text-xs text-zinc-500 mt-1">Tap below to pick an exercise and start tracking.</p>
          </div>
        )}

        {/* Big Add Exercise Action Button */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-semibold text-sm flex items-center justify-center gap-2 border border-zinc-800 shadow-sm active:scale-[0.99] transition-all min-h-[48px]"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add Exercise</span>
        </button>
      </div>

      {/* Built-in Rest Timer Bar (Always accessible, auto-triggered on set completion) */}
      <RestTimerBar autoStartTrigger={timerTrigger} />

      {/* Add Exercise Modal */}
      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        availableExercises={availableExercises}
        onSelectExercise={handleAddExerciseToWorkout}
        onCreateCustomExercise={handleCreateCustomExercise}
      />

      {/* Finish Workout Celebration Modal */}
      <FinishWorkoutModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        workout={activeWorkout}
        totalVolume={totalVolume}
        totalSets={totalCompletedSets}
        durationSeconds={elapsedSeconds}
        onSaveWorkout={handleSaveWorkout}
        onDiscardWorkout={handleDiscardWorkout}
      />
    </div>
  );
};
