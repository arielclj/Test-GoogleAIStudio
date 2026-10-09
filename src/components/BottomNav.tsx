import React from 'react';
import { Dumbbell, BookOpen, TrendingUp } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  activeSetsCount?: number;
  isWorkoutActive?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  activeSetsCount = 0,
  isWorkoutActive = false,
}) => {
  return (
    <nav 
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 pb-safe"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 h-16 items-center">
        {/* Tab 1: Active Workout Tracker */}
        <button
          type="button"
          onClick={() => onTabChange('tracker')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 transition-colors relative ${
            currentTab === 'tracker'
              ? 'text-emerald-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-current={currentTab === 'tracker' ? 'page' : undefined}
        >
          <div className="relative">
            <Dumbbell className={`w-5 h-5 transition-transform ${currentTab === 'tracker' ? 'scale-110' : ''}`} />
            {isWorkoutActive && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black font-mono-numbers">
                {activeSetsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap">
            Tracker
          </span>
          {currentTab === 'tracker' && (
            <span className="absolute bottom-1 w-5 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>

        {/* Tab 2: Exercise Library & Templates */}
        <button
          type="button"
          onClick={() => onTabChange('templates')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 transition-colors relative ${
            currentTab === 'templates'
              ? 'text-emerald-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-current={currentTab === 'templates' ? 'page' : undefined}
        >
          <BookOpen className={`w-5 h-5 transition-transform ${currentTab === 'templates' ? 'scale-110' : ''}`} />
          <span className="text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap">
            Templates
          </span>
          {currentTab === 'templates' && (
            <span className="absolute bottom-1 w-5 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>

        {/* Tab 3: History & Progress */}
        <button
          type="button"
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 transition-colors relative ${
            currentTab === 'history'
              ? 'text-emerald-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-current={currentTab === 'history' ? 'page' : undefined}
        >
          <TrendingUp className={`w-5 h-5 transition-transform ${currentTab === 'history' ? 'scale-110' : ''}`} />
          <span className="text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap">
            History
          </span>
          {currentTab === 'history' && (
            <span className="absolute bottom-1 w-5 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>
      </div>
    </nav>
  );
};
