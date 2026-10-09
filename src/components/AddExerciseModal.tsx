import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Dumbbell } from 'lucide-react';
import { Exercise, MuscleGroup } from '../types';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableExercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
  onCreateCustomExercise: (name: string, muscleGroup: MuscleGroup, restSec: number) => Exercise;
}

const MUSCLE_GROUPS: (MuscleGroup | 'All')[] = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core'];

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  availableExercises,
  onSelectExercise,
  onCreateCustomExercise,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>('Chest');
  const [newExRest, setNewExRest] = useState<number>(90);

  const filteredExercises = useMemo(() => {
    return availableExercises.filter((ex) => {
      const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesMuscle && matchesSearch;
    });
  }, [availableExercises, selectedMuscle, searchTerm]);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    const created = onCreateCustomExercise(newExName.trim(), newExMuscle, newExRest);
    onSelectExercise(created);
    setIsCreatingNew(false);
    setNewExName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100">
              {isCreatingNew ? 'Create Custom Exercise' : 'Select Exercise'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCreatingNew ? (
          /* Form to create custom exercise */
          <form onSubmit={handleCreateSubmit} className="p-4 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Exercise Name
              </label>
              <input
                type="text"
                required
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                placeholder="e.g., Incline Dumbbell Curl"
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
                    onClick={() => setNewExMuscle(group)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                      newExMuscle === group
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
                Default Recommended Rest
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[60, 90, 120, 180].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setNewExRest(sec)}
                    className={`py-2 px-2 text-xs font-medium font-mono-numbers rounded-xl border transition-all ${
                      newExRest === sec
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
                onClick={() => setIsCreatingNew(false)}
                className="w-1/2 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20"
              >
                Add & Log
              </button>
            </div>
          </form>
        ) : (
          /* Exercise Search and List */
          <>
            <div className="p-3 border-b border-zinc-800/80 space-y-2.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
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
                        : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[50vh]">
              {filteredExercises.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    onSelectExercise(ex);
                    onClose();
                  }}
                  className="w-full p-3 rounded-xl bg-zinc-950/40 hover:bg-zinc-800/80 border border-zinc-800/60 hover:border-zinc-700 text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                      {ex.name}
                    </div>
                    {/* Zero-Pill unboxed metadata with separators */}
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
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-800/60 group-hover:bg-emerald-500 group-hover:text-black text-zinc-400 transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </button>
              ))}

              {filteredExercises.length === 0 && (
                <div className="py-8 text-center px-4">
                  <p className="text-sm text-zinc-400">No exercise found for "{searchTerm}"</p>
                  <button
                    type="button"
                    onClick={() => {
                      setNewExName(searchTerm);
                      setIsCreatingNew(true);
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create "{searchTerm}" as custom
                  </button>
                </div>
              )}
            </div>

            {/* Bottom bar to create custom */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-950/60">
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Custom Exercise</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
