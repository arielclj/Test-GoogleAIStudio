import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Flame, ChevronDown, ChevronUp, Trash2, Download, Upload, RotateCcw, TrendingUp, Dumbbell, Award, ArrowUpRight } from 'lucide-react';
import { CompletedWorkout } from '../types';
import { StorageService } from '../services/storage';

interface HistoryPageProps {
  history: CompletedWorkout[];
  onRefreshHistory: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  onRefreshHistory,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(history[0]?.id || null);

  // Collect distinct exercises that appear in history for progression chart
  const availableExerciseNames = useMemo(() => {
    const names = new Set<string>();
    history.forEach((w) => {
      w.exercises.forEach((ex) => {
        if (ex.exerciseName) names.add(ex.exerciseName);
      });
    });
    return Array.from(names);
  }, [history]);

  const [selectedExerciseName, setSelectedExerciseName] = useState<string>(
    availableExerciseNames[0] || 'Barbell Bench Press'
  );

  // If selected exercise is not in list (e.g. after data change), default to first
  const activeExerciseName = availableExerciseNames.includes(selectedExerciseName)
    ? selectedExerciseName
    : availableExerciseNames[0] || '';

  // Extract progression data points for the selected exercise
  const exerciseProgressionData = useMemo(() => {
    if (!activeExerciseName) return [];

    // Chronological order (oldest to newest for the chart)
    const sorted = [...history].sort((a, b) => a.startedAt - b.startedAt);

    const points: {
      date: string;
      rawDate: number;
      maxWeight: number;
      bestReps: number;
      volume: number;
      workoutName: string;
      unit: string;
    }[] = [];

    sorted.forEach((w) => {
      const targetEx = w.exercises.find((e) => e.exerciseName === activeExerciseName);
      if (targetEx && targetEx.sets.length > 0) {
        // Find max completed weight for this exercise in this workout
        const completedSets = targetEx.sets.filter((s) => s.completed || s.weight > 0);
        if (completedSets.length > 0) {
          const maxSet = completedSets.reduce((prev, curr) =>
            curr.weight > prev.weight ? curr : prev
          );
          const totalVol = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);

          const d = new Date(w.startedAt);
          const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

          points.push({
            date: dateStr,
            rawDate: w.startedAt,
            maxWeight: maxSet.weight,
            bestReps: maxSet.reps,
            volume: totalVol,
            workoutName: w.name,
            unit: w.unit,
          });
        }
      }
    });

    return points;
  }, [history, activeExerciseName]);

  // Overall PR for the selected exercise
  const personalRecord = useMemo(() => {
    if (exerciseProgressionData.length === 0) return 0;
    return Math.max(...exerciseProgressionData.map((p) => p.maxWeight));
  }, [exerciseProgressionData]);

  // Initial weight vs latest weight growth calculation
  const growthRate = useMemo(() => {
    if (exerciseProgressionData.length < 2) return null;
    const initial = exerciseProgressionData[0].maxWeight;
    const latest = exerciseProgressionData[exerciseProgressionData.length - 1].maxWeight;
    if (initial === 0) return null;
    const delta = latest - initial;
    const pct = ((delta / initial) * 100).toFixed(1);
    return { delta, pct, isPositive: delta >= 0 };
  }, [exerciseProgressionData]);

  const handleDeleteWorkout = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this workout log?')) {
      StorageService.deleteWorkoutFromHistory(id);
      onRefreshHistory();
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `irontrack-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            localStorage.setItem('irontrack_workout_history_v1', JSON.stringify(parsed));
            onRefreshHistory();
            alert('Workout logs successfully restored!');
          }
        } catch {
          alert('Invalid JSON file format.');
        }
      };
    }
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset workout logs to sample demo workouts?')) {
      StorageService.resetHistoryToSample();
      onRefreshHistory();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // SVG Chart Geometry
  const chartHeight = 150;
  const chartWidth = 320;
  const paddingX = 24;
  const paddingY = 24;

  const minWeight = exerciseProgressionData.length > 0
    ? Math.min(...exerciseProgressionData.map((p) => p.maxWeight))
    : 0;
  const maxWeight = exerciseProgressionData.length > 0
    ? Math.max(...exerciseProgressionData.map((p) => p.maxWeight))
    : 100;
  const weightRange = Math.max(10, maxWeight - minWeight);

  const chartPoints = exerciseProgressionData.map((pt, index) => {
    const x =
      exerciseProgressionData.length === 1
        ? chartWidth / 2
        : paddingX + (index / (exerciseProgressionData.length - 1)) * (chartWidth - paddingX * 2);
    const normalizedY = (pt.maxWeight - (minWeight - 5)) / (weightRange + 10);
    const y = chartHeight - paddingY - normalizedY * (chartHeight - paddingY * 2);
    return { ...pt, x, y };
  });

  const pathD = chartPoints.length > 0
    ? chartPoints.reduce((acc, curr, idx) => {
        return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
      }, '')
    : '';

  const areaD = chartPoints.length > 0
    ? `${pathD} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight - paddingY} L ${chartPoints[0].x} ${chartHeight - paddingY} Z`
    : '';

  return (
    <div className="max-w-md mx-auto px-3 pt-3 pb-24 space-y-5">
      {/* SECTION 1: SIMPLE PROGRESS VISUALS */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800/90 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100 tracking-tight">
              Weight Progression
            </h2>
          </div>

          {/* Exercise Selector */}
          {availableExerciseNames.length > 0 && (
            <select
              value={activeExerciseName}
              onChange={(e) => setSelectedExerciseName(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 max-w-[170px] truncate"
            >
              {availableExerciseNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* PR Stat Card */}
        {exerciseProgressionData.length > 0 ? (
          <div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                  Personal Record
                </div>
                <div className="text-lg font-black text-emerald-400 font-mono-numbers mt-0.5">
                  {personalRecord}
                  <span className="text-xs text-zinc-500 font-normal ml-0.5">
                    {exerciseProgressionData[0]?.unit || 'lbs'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                  Latest Weight
                </div>
                <div className="text-lg font-black text-zinc-100 font-mono-numbers mt-0.5">
                  {exerciseProgressionData[exerciseProgressionData.length - 1]?.maxWeight}
                  <span className="text-xs text-zinc-500 font-normal ml-0.5">
                    {exerciseProgressionData[0]?.unit || 'lbs'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                  Logged
                </div>
                <div className="text-lg font-black text-zinc-100 font-mono-numbers mt-0.5">
                  {exerciseProgressionData.length}
                  <span className="text-xs text-zinc-500 font-normal ml-0.5">times</span>
                </div>
              </div>
            </div>

            {/* SVG Interactive Progression Chart */}
            <div className="relative w-full bg-zinc-950/70 border border-zinc-800/70 rounded-xl p-2 overflow-hidden">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-36 overflow-visible"
              >
                <defs>
                  <linearGradient id="progressionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle Horizontal grid lines */}
                <line
                  x1={paddingX}
                  y1={paddingY}
                  x2={chartWidth - paddingX}
                  y2={paddingY}
                  stroke="#27272a"
                  strokeDasharray="3 3"
                />
                <line
                  x1={paddingX}
                  y1={chartHeight / 2}
                  x2={chartWidth - paddingX}
                  y2={chartHeight / 2}
                  stroke="#27272a"
                  strokeDasharray="3 3"
                />
                <line
                  x1={paddingX}
                  y1={chartHeight - paddingY}
                  x2={chartWidth - paddingX}
                  y2={chartHeight - paddingY}
                  stroke="#27272a"
                />

                {/* Area fill */}
                {areaD && (
                  <path d={areaD} fill="url(#progressionGradient)" />
                )}

                {/* Main line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {chartPoints.map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      className="fill-zinc-950 stroke-emerald-400 stroke-2"
                    />
                    {/* Value label */}
                    <text
                      x={pt.x}
                      y={pt.y - 8}
                      textAnchor="middle"
                      className="text-[10px] fill-zinc-300 font-mono-numbers font-bold"
                    >
                      {pt.maxWeight}
                    </text>
                    {/* Date label */}
                    <text
                      x={pt.x}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      className="text-[9px] fill-zinc-500 font-mono-numbers"
                    >
                      {pt.date}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {growthRate && (
              <div className="mt-2 text-xs text-zinc-400 flex items-center justify-between">
                <span>Total progression:</span>
                <span className={`font-mono-numbers font-semibold ${growthRate.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {growthRate.isPositive ? '+' : ''}{growthRate.delta} lbs ({growthRate.isPositive ? '+' : ''}{growthRate.pct}%)
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-zinc-500">
            No completed history sets for this exercise yet. Complete sets in the tracker to see your chart!
          </div>
        )}
      </div>

      {/* SECTION 2: CHRONOLOGICAL WORKOUT LOGS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100 tracking-tight">
              Workout Logs ({history.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono-numbers">
            Local Storage
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800">
            <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">No workouts logged yet.</p>
            <p className="text-xs text-zinc-500 mt-1">Start a session in Tracker to log your progress.</p>
            <button
              type="button"
              onClick={handleResetSampleData}
              className="mt-3 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium"
            >
              Load Sample Data
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((workout) => {
              const isExpanded = expandedId === workout.id;

              return (
                <div
                  key={workout.id}
                  className="bg-zinc-900/80 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-sm transition-all"
                >
                  {/* Collapsed Header / Click to Expand */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : workout.id)}
                    className="p-3.5 cursor-pointer hover:bg-zinc-900 flex items-center justify-between gap-3 select-none"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-400 font-mono-numbers">
                          {formatDate(workout.startedAt)}
                        </span>
                        <span aria-hidden="true" className="text-zinc-600">·</span>
                        <h3 className="text-sm font-bold text-zinc-100 truncate">
                          {workout.name}
                        </h3>
                      </div>

                      {/* Zero-Pill unboxed metadata */}
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 font-mono-numbers">
                        <span>{formatDuration(workout.durationSeconds)}</span>
                        <span aria-hidden="true" className="text-zinc-600">·</span>
                        <span className="text-zinc-300 font-semibold">
                          {workout.totalVolume.toLocaleString()} {workout.unit}
                        </span>
                        <span aria-hidden="true" className="text-zinc-600">·</span>
                        <span>{workout.totalSets} sets</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteWorkout(workout.id, e)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-zinc-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Drawer */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-zinc-800/60 bg-zinc-950/40 divide-y divide-zinc-800/40">
                      {workout.notes && (
                        <div className="py-2 text-xs text-zinc-400 italic">
                          "{workout.notes}"
                        </div>
                      )}

                      {workout.exercises.map((ex, exIdx) => (
                        <div key={ex.id || exIdx} className="py-2.5">
                          <div className="flex items-center justify-between text-xs font-bold text-zinc-200 mb-1">
                            <span>{ex.exerciseName}</span>
                            <span className="text-zinc-500 font-normal text-[11px]">
                              {ex.muscleGroup}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-xs text-zinc-400 font-mono-numbers">
                            {ex.sets.map((s) => (
                              <div
                                key={s.id}
                                className={`px-2 py-1 rounded-md text-[11px] flex items-center justify-between ${
                                  s.completed
                                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                                    : 'bg-zinc-900/50 text-zinc-500'
                                }`}
                              >
                                <span>Set {s.setNumber}:</span>
                                <span className="font-semibold text-zinc-200">
                                  {s.weight} {workout.unit} × {s.reps}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: LOCAL STORAGE DATA TOOLS */}
      <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-2">
        <div className="text-xs font-bold text-zinc-300">Data & Backup (Local Storage)</div>
        <p className="text-zinc-400 text-[11px]">
          All workout data is stored locally in your browser with zero logins required.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleExportJSON}
            className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <label className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={handleResetSampleData}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Demo Sample Workouts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
