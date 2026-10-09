import React, { useState, useMemo } from 'react';
import { Search, Play, Plus, BookOpen, Layers, Clock, Dumbbell, ChevronRight, Check } from 'lucide-react';
import { WorkoutTemplate, Exercise, MuscleGroup, ActiveWorkout, ExerciseEntry } from '../types';
import { PREBUILT_TEMPLATES, StorageService } from '../services/storage';

interface TemplatesPageProps {
  onLaunchTemplate: (workout: ActiveWorkout) => void;
  onAddExerciseToActiveWorkout: (exercise: Exercise) => void;
  isWorkoutActive: boolean;
}

const MUSCLE_GROUPS: (MuscleGroup | 'All')[] = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core'];

export const TemplatesPage: React.FC<TemplatesPageProps> = ({
  onLaunchTemplate,
  onAddExerciseToActiveWorkout,
  isWorkoutActive,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'library'>('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');

  // Custom Exercise Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('Chest');
  const [customRest, setCustomRest] = useState<number>(90);
  const [customEquipment, setCustomEquipment] = useState('Dumbbell');
  const [allExercises, setAllExercises] = useState<Exercise[]>(() => StorageService.getAllExercises());

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
      const matchSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchMuscle && matchSearch;
    });
  }, [allExercises, selectedMuscle, searchTerm]);

  // Launch a template
  const handleLaunchRoutine = (template: WorkoutTemplate) => {
    const unit = StorageService.getUnitPreference();
    const newWorkout: ActiveWorkout = {
      id: `w-${Date.now()}`,
      name: template.name,
      templateId: template.id,
      startedAt: Date.now(),
      unit,
      exercises: template.exercises.map((tEx, idx) => {
        const sets = [];
        for (let i = 1; i <= tEx.defaultSets; i++) {
          sets.push({
            id: `s-${Date.now()}-${idx}-${i}`,
            setNumber: i,
            type: i === 1 ? ('warmup' as const) : ('working' as const),
            weight: tEx.defaultWeight,
            reps: tEx.defaultReps,
            completed: false,
          });
        }
        return {
          id: `entry-${Date.now()}-${idx}`,
          exerciseId: tEx.exerciseId,
          exerciseName: tEx.exerciseName,
          muscleGroup: tEx.muscleGroup,
          targetRestSec: tEx.targetRestSec,
          sets,
        };
      }),
    };

    onLaunchTemplate(newWorkout);
    StorageService.saveActiveWorkout(newWorkout);
  };

  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const created = StorageService.addCustomExercise({
      name: customName.trim(),
      muscleGroup: customMuscle,
      defaultRestSec: customRest,
      equipment: customEquipment,
    });

    setAllExercises((prev) => [...prev, created]);
    setCustomName('');
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-md mx-auto px-3 pt-3 pb-24">
      {/* Top Segmented Control (Templates vs Exercise Library) */}
      <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all min-h-[40px] flex items-center justify-center gap-1.5 ${
            activeTab === 'templates'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Routine Templates (3)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all min-h-[40px] flex items-center justify-center gap-1.5 ${
            activeTab === 'library'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Exercise Library ({allExercises.length})</span>
        </button>
      </div>

      {/* Tab 1: Pre-built Routine Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-base font-bold text-zinc-100 tracking-tight">
              Pre-built Workout Templates
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select a routine to auto-fill the Active Workout Tracker.
            </p>
          </div>

          {PREBUILT_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-zinc-900/80 rounded-2xl border border-zinc-800/90 overflow-hidden shadow-sm hover:border-zinc-700 transition-all"
            >
              <div className="p-4 border-b border-zinc-800/60 bg-zinc-900/40">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">{tmpl.name}</h3>
                    {/* Zero-pill metadata */}
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                      <span>{tmpl.muscleFocus}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono-numbers">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        ~{tmpl.estimatedMinutes} min
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-numbers">{tmpl.exercises.length} exercises</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                  {tmpl.description}
                </p>
              </div>

              {/* Routine Exercises Preview */}
              <div className="p-3 bg-zinc-950/40 divide-y divide-zinc-800/40 text-xs">
                {tmpl.exercises.map((ex, i) => (
                  <div key={i} className="py-2 flex items-center justify-between text-zinc-300">
                    <span className="truncate pr-2">
                      <span className="text-zinc-500 font-mono-numbers mr-1.5">{i + 1}.</span>
                      {ex.exerciseName}
                    </span>
                    <span className="text-zinc-400 font-mono-numbers text-[11px] whitespace-nowrap">
                      {ex.defaultSets} × {ex.defaultReps} reps
                    </span>
                  </div>
                ))}
              </div>

              {/* Launch Button */}
              <div className="p-3 border-t border-zinc-800 bg-zinc-900/80">
                <button
                  type="button"
                  onClick={() => handleLaunchRoutine(tmpl)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-[0.99] transition-all min-h-[44px]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start This Workout in Tracker</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Categorized Exercise Library & Custom Creator */}
      {activeTab === 'library' && (
        <div className="space-y-3.5">
          {/* Search & Actions Bar */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search exercise..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 font-semibold text-xs flex items-center gap-1 min-h-[40px] whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Custom</span>
              </button>
            </div>

            {/* Muscle Group Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {MUSCLE_GROUPS.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setSelectedMuscle(group)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    selectedMuscle === group
                      ? 'bg-zinc-100 text-zinc-900 font-semibold shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises List */}
          <div className="space-y-2">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
              >
                <div>
                  <div className="text-sm font-bold text-zinc-100">{ex.name}</div>
                  {/* Zero-Pill unboxed metadata */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <span>{ex.muscleGroup}</span>
                    {ex.equipment && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{ex.equipment}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-numbers">Rest {ex.defaultRestSec}s</span>
                    {ex.isCustom && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400">Custom</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAddExerciseToActiveWorkout(ex)}
                  className="py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors min-h-[36px]"
                  title="Add to active session"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isWorkoutActive ? 'Add' : 'Log'}</span>
                </button>
              </div>
            ))}

            {filteredExercises.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
                <p className="text-sm text-zinc-400">No exercises matching "{searchTerm}"</p>
                <button
                  type="button"
                  onClick={() => {
                    setCustomName(searchTerm);
                    setShowCreateModal(true);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add "{searchTerm}" as custom exercise
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Custom Exercise Creator */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-100">Add Custom Exercise</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateCustomExercise} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Exercise Name
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Bulgarian Split Squat"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Target Muscle Group
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core'] as MuscleGroup[]).map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setCustomMuscle(group)}
                      className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                        customMuscle === group
                          ? 'bg-emerald-500 text-black font-semibold border-emerald-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Equipment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell'].map((eq) => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => setCustomEquipment(eq)}
                      className={`py-2 px-2 text-xs font-medium rounded-xl border transition-all ${
                        customEquipment === eq
                          ? 'bg-zinc-100 text-zinc-900 font-semibold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Default Rest Timer Recommendation
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[60, 90, 120, 180].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setCustomRest(sec)}
                      className={`py-2 px-2 text-xs font-medium font-mono-numbers rounded-xl border transition-all ${
                        customRest === sec
                          ? 'bg-emerald-500 text-black font-semibold border-emerald-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
