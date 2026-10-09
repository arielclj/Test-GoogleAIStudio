import React from 'react';
import { Check, Trash2, ArrowUp, ArrowDown, Trophy } from 'lucide-react';
import { WorkoutSet, SetType } from '../types';

interface SetRowProps {
  set: WorkoutSet;
  unit: 'lbs' | 'kg';
  previousBestWeight?: number;
  onUpdate: (updated: WorkoutSet) => void;
  onDelete: () => void;
  onSetCompleted?: () => void;
}

const SET_TYPE_LABELS: Record<SetType, { label: string; badge: string; color: string }> = {
  warmup: { label: 'Warm-up', badge: 'W', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  working: { label: 'Working', badge: '1', color: 'text-zinc-300 bg-zinc-800 border-zinc-700' },
  failure: { label: 'Failure', badge: 'F', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
  drop: { label: 'Drop Set', badge: 'D', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
};

export const SetRow: React.FC<SetRowProps> = ({
  set,
  unit,
  previousBestWeight = 0,
  onUpdate,
  onDelete,
  onSetCompleted,
}) => {
  const stepWeight = unit === 'lbs' ? 5 : 2.5;
  const isPr = Boolean(previousBestWeight > 0 && set.weight > previousBestWeight);

  const handleWeightChange = (newVal: number) => {
    onUpdate({ ...set, weight: Math.max(0, newVal) });
  };

  const handleRepsChange = (newVal: number) => {
    onUpdate({ ...set, reps: Math.max(0, newVal) });
  };

  const cycleSetType = () => {
    const types: SetType[] = ['working', 'warmup', 'failure', 'drop'];
    const currentIndex = types.indexOf(set.type);
    const nextType = types[(currentIndex + 1) % types.length];
    onUpdate({ ...set, type: nextType });
  };

  const toggleComplete = () => {
    const nextState = !set.completed;
    onUpdate({ ...set, completed: nextState });
    if (nextState && onSetCompleted) {
      onSetCompleted();
    }
  };

  const typeConfig = SET_TYPE_LABELS[set.type] || SET_TYPE_LABELS.working;

  return (
    <div
      className={`relative grid grid-cols-12 gap-1.5 items-center p-2 rounded-xl transition-all duration-200 ${
        set.completed
          ? 'bg-emerald-950/25 border border-emerald-500/30'
          : 'bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700'
      }`}
    >
      {/* Set # & Type Switcher (Touch friendly) */}
      <div className="col-span-3 flex items-center gap-1.5">
        <button
          type="button"
          onClick={cycleSetType}
          title={`Type: ${typeConfig.label} (Tap to change)`}
          className={`flex items-center justify-center min-w-[34px] h-[34px] rounded-lg text-xs font-bold border transition-colors ${typeConfig.color}`}
        >
          {set.type === 'working' ? set.setNumber : typeConfig.badge}
        </button>
        <span className="text-[11px] text-zinc-400 truncate hidden xs:inline">
          {typeConfig.label}
        </span>
      </div>

      {/* Weight Input + Stepper with PR Badge */}
      <div className="col-span-4 flex items-center">
        <div
          className={`relative flex items-center w-full bg-zinc-950 rounded-lg border transition-all ${
            isPr
              ? 'border-amber-400 ring-1 ring-amber-400/40 shadow-sm shadow-amber-500/20'
              : 'border-zinc-800 focus-within:border-emerald-500'
          }`}
        >
          {/* Personal Record Badge */}
          {isPr && (
            <span
              title={`Personal Record! Exceeds previous history of ${previousBestWeight} ${unit}`}
              className="absolute -top-2.5 right-1 z-10 px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider bg-amber-400 text-black rounded-md shadow-md shadow-amber-950 flex items-center gap-0.5 animate-pulse select-none"
            >
              <Trophy className="w-2.5 h-2.5 fill-black stroke-black" />
              <span>PR</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => handleWeightChange(set.weight - stepWeight)}
            className="flex items-center justify-center min-w-[28px] h-[36px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-l-lg transition-colors"
            title={`-${stepWeight} ${unit}`}
          >
            <ArrowDown className="w-3 h-3" />
          </button>

          <input
            type="number"
            inputMode="decimal"
            value={set.weight === 0 ? '' : set.weight}
            placeholder="0"
            onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
            className={`w-full text-center bg-transparent py-1 text-sm font-semibold font-mono-numbers focus:outline-none ${
              isPr ? 'text-amber-300 font-bold' : 'text-zinc-100'
            }`}
          />

          <button
            type="button"
            onClick={() => handleWeightChange(set.weight + stepWeight)}
            className="flex items-center justify-center min-w-[28px] h-[36px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-r-lg transition-colors"
            title={`+${stepWeight} ${unit}`}
          >
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Reps Input + Stepper */}
      <div className="col-span-3 flex items-center">
        <div className="relative flex items-center w-full bg-zinc-950 rounded-lg border border-zinc-800 focus-within:border-emerald-500">
          <button
            type="button"
            onClick={() => handleRepsChange(set.reps - 1)}
            className="flex items-center justify-center min-w-[24px] h-[36px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-l-lg transition-colors"
            title="-1 rep"
          >
            -
          </button>

          <input
            type="number"
            inputMode="numeric"
            value={set.reps === 0 ? '' : set.reps}
            placeholder="0"
            onChange={(e) => handleRepsChange(parseInt(e.target.value, 10) || 0)}
            className="w-full text-center bg-transparent py-1 text-sm font-semibold text-zinc-100 font-mono-numbers focus:outline-none"
          />

          <button
            type="button"
            onClick={() => handleRepsChange(set.reps + 1)}
            className="flex items-center justify-center min-w-[24px] h-[36px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-r-lg transition-colors"
            title="+1 rep"
          >
            +
          </button>
        </div>
      </div>

      {/* Checkbox (Complete) & Delete Button */}
      <div className="col-span-2 flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={toggleComplete}
          className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-95 shadow-sm ${
            set.completed
              ? 'bg-emerald-500 text-black shadow-emerald-500/20 font-bold'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
          }`}
          title={set.completed ? 'Mark incomplete' : 'Mark complete (starts rest timer)'}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
          title="Delete set"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
