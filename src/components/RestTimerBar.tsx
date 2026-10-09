import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Plus, Minus, ChevronUp, ChevronDown, Bell } from 'lucide-react';
import { playCountdownBeep } from '../utils/audio';

interface RestTimerBarProps {
  initialSeconds?: number;
  autoStartTrigger?: number; // changes whenever a completed set triggers timer
  onClose?: () => void;
}

export const RestTimerBar: React.FC<RestTimerBarProps> = ({
  initialSeconds = 90,
  autoStartTrigger,
}) => {
  const [totalTime, setTotalTime] = useState(initialSeconds);
  const [remainingTime, setRemainingTime] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);

  const prevTriggerRef = useRef(autoStartTrigger);
  const intervalRef = useRef<number | null>(null);

  // Trigger when a set is completed
  useEffect(() => {
    if (autoStartTrigger && autoStartTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = autoStartTrigger;
      setRemainingTime(totalTime);
      setIsRunning(true);
      setIsAlerting(false);
    }
  }, [autoStartTrigger, totalTime]);

  const handleTick = useCallback(() => {
    setRemainingTime((prev) => {
      if (prev <= 1) {
        setIsRunning(false);
        setIsAlerting(true);
        if (soundEnabled) {
          playCountdownBeep(true);
        }
        setTimeout(() => setIsAlerting(false), 3500);
        return 0;
      }

      // Warning beeps for last 3 seconds
      if (soundEnabled && (prev === 4 || prev === 3 || prev === 2)) {
        playCountdownBeep(false);
      }

      return prev - 1;
    });
  }, [soundEnabled]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(handleTick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleTick]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStartPreset = (secs: number) => {
    setTotalTime(secs);
    setRemainingTime(secs);
    setIsRunning(true);
    setIsAlerting(false);
  };

  const adjustTime = (delta: number) => {
    setRemainingTime((prev) => {
      const next = Math.max(0, prev + delta);
      if (next > totalTime) setTotalTime(next);
      return next;
    });
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingTime(totalTime);
    setIsAlerting(false);
  };

  const progressPercent = totalTime > 0 ? ((totalTime - remainingTime) / totalTime) * 100 : 0;

  return (
    <div
      className={`fixed bottom-16 left-0 right-0 z-30 px-3 pb-2 transition-all duration-300 ${
        isAlerting ? 'animate-bounce' : ''
      }`}
    >
      <div className={`max-w-md mx-auto rounded-2xl border transition-colors shadow-2xl backdrop-blur-xl ${
        isAlerting
          ? 'bg-amber-500/20 border-amber-400/80 shadow-amber-500/20'
          : isRunning
          ? 'bg-zinc-900/95 border-emerald-500/40 shadow-emerald-950/40'
          : 'bg-zinc-900/90 border-zinc-800 shadow-black/50'
      }`}>
        {/* Top Progress bar indicator */}
        <div className="h-1.5 w-full bg-zinc-800 rounded-t-2xl overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              isAlerting ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Compact Bar (Always Visible) */}
        <div className="px-3 py-2 flex items-center justify-between gap-2">
          {/* Left: Timer Display */}
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              isAlerting
                ? 'bg-amber-400 text-black animate-pulse'
                : isRunning
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              {isAlerting ? <Bell className="w-4 h-4" /> : <span className="text-[10px]">REST</span>}
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-bold font-mono-numbers tracking-tight ${
                  isAlerting
                    ? 'text-amber-400'
                    : isRunning
                    ? 'text-emerald-400'
                    : 'text-zinc-200'
                }`}>
                  {formatTime(remainingTime)}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono-numbers">
                  / {formatTime(totalTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons (Compact) */}
          <div className="hidden sm:flex items-center gap-1">
            {[60, 90, 120].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => handleStartPreset(sec)}
                className={`px-2 py-1 text-xs rounded-lg font-mono-numbers transition-colors ${
                  totalTime === sec && isRunning
                    ? 'bg-emerald-500 text-black font-semibold'
                    : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => adjustTime(30)}
              title="+30s"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors text-xs font-mono-numbers"
            >
              +30s
            </button>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => {
                if (remainingTime === 0) {
                  setRemainingTime(totalTime);
                  setIsRunning(true);
                } else {
                  setIsRunning(!isRunning);
                }
              }}
              className={`p-2 rounded-xl transition-transform active:scale-95 flex items-center justify-center min-w-[38px] min-h-[38px] ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Expand / Collapse toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse rest timer' : 'Expand rest timer'}
              className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Drawer Options */}
        {isExpanded && (
          <div className="px-3 pb-3 pt-1 border-t border-zinc-800/80 mt-1 space-y-2.5">
            {/* Presets Row */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Quick Timer Presets:</span>
              <div className="flex items-center gap-1.5">
                {[30, 60, 90, 120, 180].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => handleStartPreset(sec)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-mono-numbers font-medium transition-colors ${
                      totalTime === sec && isRunning
                        ? 'bg-emerald-400 text-black font-bold'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Micro Controls: Reset, Adjust, Sound */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetTimer}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => adjustTime(-15)}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors font-mono-numbers"
                >
                  <Minus className="w-3 h-3" /> 15s
                </button>
                <button
                  type="button"
                  onClick={() => adjustTime(30)}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors font-mono-numbers"
                >
                  <Plus className="w-3 h-3" /> 30s
                </button>
              </div>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  soundEnabled
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-zinc-500 bg-zinc-800/80'
                }`}
                title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
