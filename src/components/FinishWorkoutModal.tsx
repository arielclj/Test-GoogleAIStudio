import React, { useState } from 'react';
import { Trophy, Clock, Dumbbell, CheckCircle2, X } from 'lucide-react';
import { ActiveWorkout } from '../types';

interface FinishWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: ActiveWorkout;
  totalVolume: number;
  totalSets: number;
  durationSeconds: number;
  onSaveWorkout: (workoutName: string, notes: string) => void;
  onDiscardWorkout: () => void;
}

export const FinishWorkoutModal: React.FC<FinishWorkoutModalProps> = ({
  isOpen,
  onClose,
  workout,
  totalVolume,
  totalSets,
  durationSeconds,
  onSaveWorkout,
  onDiscardWorkout,
}) => {
  const [workoutName, setWorkoutName] = useState(workout.name || 'Workout Session');
  const [notes, setNotes] = useState(workout.notes || '');

  if (!isOpen) return null;

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Celebration Header */}
        <div className="relative p-6 text-center border-b border-zinc-800 bg-gradient-to-b from-emerald-950/40 to-transparent">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950">
            <Trophy className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight">
            Workout Completed!
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Phenomenal effort today. Here is your session summary.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-zinc-950/50 border-b border-zinc-800/80">
          <div className="text-center p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/60">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
              Volume
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono-numbers mt-0.5">
              {totalVolume.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-500">{workout.unit}</div>
          </div>

          <div className="text-center p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/60">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
              Duration
            </div>
            <div className="text-lg font-bold text-zinc-100 font-mono-numbers mt-0.5">
              {minutes}:{seconds < 10 ? '0' : ''}{seconds}
            </div>
            <div className="text-[10px] text-zinc-500">min:sec</div>
          </div>

          <div className="text-center p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/60">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
              Completed
            </div>
            <div className="text-lg font-bold text-zinc-100 font-mono-numbers mt-0.5">
              {totalSets}
            </div>
            <div className="text-[10px] text-zinc-500">sets</div>
          </div>
        </div>

        {/* Details Form */}
        <div className="p-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Workout Title
            </label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Session Notes & Reflection
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Felt strong on bench, increased weight on second set..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => onSaveWorkout(workoutName, notes)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all min-h-[48px]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Save & Log Workout</span>
            </button>

            <button
              type="button"
              onClick={onDiscardWorkout}
              className="w-full py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl transition-colors font-medium"
            >
              Discard this session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
