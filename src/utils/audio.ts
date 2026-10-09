/**
 * Web Audio API synthesizer for rest timer prompts.
 * Generates countdown beeps and a completion bell without relying on external media assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playCountdownBeep(isFinal: boolean = false) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (isFinal) {
      // High pitch double-tone completion chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15); // A6
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);

      // Trigger mobile haptic vibration if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([150, 80, 250]);
      }
    } else {
      // Short tick beep at 3, 2, 1 seconds
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(60);
      }
    }
  } catch (err) {
    console.warn('Audio playback error (browser policy):', err);
  }
}
