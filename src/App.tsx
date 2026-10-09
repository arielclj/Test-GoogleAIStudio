import React, { useState, useEffect, useCallback } from 'react';
import { TabType, ActiveWorkout, CompletedWorkout, Exercise, ExerciseEntry } from './types';
import { StorageService } from './services/storage';
import { BottomNav } from './components/BottomNav';
import { TrackerPage } from './pages/TrackerPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { HistoryPage } from './pages/HistoryPage';
import { Dumbbell, Plus, Flame } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('tracker');
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(() => {
    return StorageService.getActiveWorkout();
  });
  const [history, setHistory] = useState<CompletedWorkout[]>(() => {
    return StorageService.getWorkoutHistory();
  });

  // Calculate active sets count for bottom nav badge
  const activeCompletedSetsCount = activeWorkout
    ? activeWorkout.exercises.reduce(
        (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
        0
      )
    : 0;

  const handleUpdateActiveWorkout = useCallback((workout: ActiveWorkout | null) => {
    setActiveWorkout(workout);
    StorageService.saveActiveWorkout(workout);
  }, []);

  const handleWorkoutFinished = useCallback(() => {
    const updatedHistory = StorageService.getWorkoutHistory();
    setHistory(updatedHistory);
    setCurrentTab('history');
  }, []);

  const handleLaunchTemplate = useCallback((newWorkout: ActiveWorkout) => {
    setActiveWorkout(newWorkout);
    StorageService.saveActiveWorkout(newWorkout);
    setCurrentTab('tracker');
  }, []);

  const handleAddExerciseToActiveWorkout = useCallback((exercise: Exercise) => {
    if (!activeWorkout) {
      // Create new session with this exercise
      const freshWorkout: ActiveWorkout = {
        id: `w-${Date.now()}`,
        name: `${exercise.muscleGroup} Focus Session`,
        startedAt: Date.now(),
        unit: StorageService.getUnitPreference(),
        exercises: [
          {
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
          },
        ],
      };
      setActiveWorkout(freshWorkout);
      StorageService.saveActiveWorkout(freshWorkout);
    } else {
      // Append to current session
      const entry: ExerciseEntry = {
        id: `entry-${Date.now()}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscleGroup,
        targetRestSec: exercise.defaultRestSec,
        sets: [
          { id: `s1-${Date.now()}`, setNumber: 1, type: 'working' as const, weight: 0, reps: 10, completed: false },
          { id: `s2-${Date.now()}`, setNumber: 2, type: 'working' as const, weight: 0, reps: 10, completed: false },
        ],
      };
      const updated: ActiveWorkout = {
        ...activeWorkout,
        exercises: [...activeWorkout.exercises, entry],
      };
      setActiveWorkout(updated);
      StorageService.saveActiveWorkout(updated);
    }
    setCurrentTab('tracker');
  }, [activeWorkout]);

  const refreshHistory = useCallback(() => {
    setHistory(StorageService.getWorkoutHistory());
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top App Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-zinc-100">
                IronTrack
              </span>
              <span className="hidden xs:inline text-xs text-zinc-500 ml-2">
                Gym Workout Logger
              </span>
            </div>
          </div>

          {/* Header Quick Status / Action */}
          <div className="flex items-center gap-2">
            {activeWorkout ? (
              <button
                type="button"
                onClick={() => setCurrentTab('tracker')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Workout</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const newWorkout: ActiveWorkout = {
                    id: `w-${Date.now()}`,
                    name: 'Quick Workout',
                    startedAt: Date.now(),
                    exercises: [],
                    unit: StorageService.getUnitPreference(),
                  };
                  setActiveWorkout(newWorkout);
                  StorageService.saveActiveWorkout(newWorkout);
                  setCurrentTab('tracker');
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:border-zinc-700 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quick Log</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area (3 Pages) */}
      <main className="flex-1 w-full overflow-x-hidden">
        {currentTab === 'tracker' && (
          <TrackerPage
            activeWorkout={activeWorkout}
            onUpdateWorkout={handleUpdateActiveWorkout}
            onWorkoutFinished={handleWorkoutFinished}
            onNavigateToTemplates={() => setCurrentTab('templates')}
          />
        )}

        {currentTab === 'templates' && (
          <TemplatesPage
            onLaunchTemplate={handleLaunchTemplate}
            onAddExerciseToActiveWorkout={handleAddExerciseToActiveWorkout}
            isWorkoutActive={Boolean(activeWorkout)}
          />
        )}

        {currentTab === 'history' && (
          <HistoryPage
            history={history}
            onRefreshHistory={refreshHistory}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeSetsCount={activeCompletedSetsCount}
        isWorkoutActive={Boolean(activeWorkout)}
      />
    </div>
  );
}
