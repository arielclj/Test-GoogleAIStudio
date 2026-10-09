import React, { useState } from 'react';
import { Plus, Trash2, Clock, MessageSquare, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { ExerciseEntry, WorkoutSet } from '../types';
import { SetRow } from './SetRow';

interface ExerciseCardProps {
  exercise: ExerciseEntry;
  index: number;
  unit: 'lbs' | 'kg';
  previousBestWeight?: number;
  onUpdateExercise: (updated: ExerciseEntry) => void;
  onRemoveExercise: () => void;
  onTriggerRestTimer: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  unit,
  previousBestWeight = 0,
  onUpdateExercise,
  onRemoveExercise,
  onTriggerRestTimer,
}) => {
  const [showNotes, setShowNotes] = useState(Boolean(exercise.notes));

  const handleAddSet = () => {
    const nextSetNumber = exercise.sets.length + 1;
    // Copy weight & reps from previous set if available
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: WorkoutSet = {
      id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      setNumber: nextSetNumber,
      type: lastSet ? (lastSet.type === 'warmup' ? 'working' : lastSet.type) : 'working',
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 10,
      completed: false,
    };

    onUpdateExercise({
      ...exercise,
      sets: [...exercise.sets, newSet],
    });
  };

  const handleUpdateSet = (updatedSet: WorkoutSet) => {
    const updatedSets = exercise.sets.map((s) => (s.id === updatedSet.id ? updatedSet : s));
    onUpdateExercise({ ...exercise, sets: updatedSets });
  };

  const handleDeleteSet = (setId: string) => {
    const remaining = exercise.sets.filter((s) => s.id !== setId);
    // Renumber remaining sets
    const renumbered = remaining.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    onUpdateExercise({ ...exercise, sets: renumbered });
  };

  const handleNotesChange = (notes: string) => {
    onUpdateExercise({ ...exercise, notes });
  };

  const completedSetsCount = exercise.sets.filter((s) => s.completed).length;
  const totalSetsCount = exercise.sets.length;

  return (
    <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-sm transition-all">
      {/* Exercise Header */}
      <div className="p-3.5 pb-2.5 flex items-start justify-between gap-3 border-b border-zinc-800/60 bg-zinc-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-numbers text-zinc-500 font-semibold">
              #{index + 1}
            </span>
            <h3 className="text-base font-bold text-zinc-100 tracking-tight">
              {exercise.exerciseName}
            </h3>
          </div>

          {/* Clean unboxed metadata with separators (Zero-Pill Discipline) */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 flex-wrap">
            <span>{exercise.muscleGroup}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="flex items-center gap-1 font-mono-numbers">
              <Clock className="w-3 h-3 text-zinc-500" />
              Rest {exercise.targetRestSec || 90}s
            </span>
            {previousBestWeight > 0 && (
              <>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="flex items-center gap-1 font-mono-numbers text-amber-400 font-semibold" title={`Previous Best: ${previousBestWeight} ${unit}`}>
                  <Trophy className="w-3 h-3 fill-amber-400/20" />
                  PR {previousBestWeight} {unit}
                </span>
              </>
            )}
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="font-mono-numbers text-zinc-300 font-medium">
              {completedSetsCount}/{totalSetsCount} sets
            </span>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-lg text-xs transition-colors ${
              exercise.notes || showNotes
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Exercise notes"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onRemoveExercise}
            className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
            title="Remove exercise from session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notes Drawer */}
      {showNotes && (
        <div className="px-3.5 py-2 bg-zinc-950/60 border-b border-zinc-800/50">
          <input
            type="text"
            value={exercise.notes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Form cue (e.g., tuck elbows, 3-sec eccentric)..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {/* Sets Column Header */}
      <div className="px-3.5 pt-2.5 pb-1 grid grid-cols-12 gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
        <div className="col-span-3">Set</div>
        <div className="col-span-4 text-center">{unit}</div>
        <div className="col-span-3 text-center">Reps</div>
        <div className="col-span-2 text-right">Done</div>
      </div>

      {/* Sets List */}
      <div className="px-3.5 pb-3 space-y-2">
        {exercise.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            unit={unit}
            previousBestWeight={previousBestWeight}
            onUpdate={handleUpdateSet}
            onDelete={() => handleDeleteSet(set.id)}
            onSetCompleted={onTriggerRestTimer}
          />
        ))}

        {exercise.sets.length === 0 && (
          <div className="text-center py-4 text-xs text-zinc-500">
            No sets added yet. Tap below to log your first set.
          </div>
        )}

        {/* Quick + Add Set Button (Large touch target) */}
        <button
          type="button"
          onClick={handleAddSet}
          className="w-full mt-2 py-2.5 px-3 rounded-xl bg-zinc-800/70 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-dashed border-zinc-700/80 active:scale-[0.99] transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>+ Add Set</span>
        </button>
      </div>
    </div>
  );
};
