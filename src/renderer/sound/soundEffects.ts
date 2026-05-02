export type SoundEffectKind = 'move' | 'capture' | 'check' | 'brilliant' | 'game-end';

interface SoundOptions {
  enabled: boolean;
  muted: boolean;
  volume: number;
}

interface ToneStep {
  frequency: number;
  durationMs: number;
  gain: number;
}

const SOUND_PATTERNS: Record<SoundEffectKind, ToneStep[]> = {
  move: [
    { frequency: 520, durationMs: 42, gain: 0.08 },
    { frequency: 640, durationMs: 50, gain: 0.06 },
  ],
  capture: [
    { frequency: 340, durationMs: 58, gain: 0.11 },
    { frequency: 240, durationMs: 72, gain: 0.08 },
  ],
  check: [
    { frequency: 760, durationMs: 52, gain: 0.09 },
    { frequency: 980, durationMs: 88, gain: 0.12 },
  ],
  brilliant: [
    { frequency: 660, durationMs: 44, gain: 0.08 },
    { frequency: 880, durationMs: 52, gain: 0.1 },
    { frequency: 1180, durationMs: 96, gain: 0.12 },
  ],
  'game-end': [
    { frequency: 540, durationMs: 84, gain: 0.09 },
    { frequency: 430, durationMs: 84, gain: 0.08 },
    { frequency: 320, durationMs: 110, gain: 0.08 },
  ],
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextCtor();
  }

  return audioContext;
}

export async function playSoundEffect(kind: SoundEffectKind, options: SoundOptions): Promise<void> {
  if (!options.enabled || options.muted || options.volume <= 0) {
    return;
  }

  const context = getAudioContext();
  if (!context) {
    return;
  }

  if (context.state === 'suspended') {
    try {
      await context.resume();
    } catch {
      return;
    }
  }

  const pattern = SOUND_PATTERNS[kind];
  const now = context.currentTime;
  const masterVolume = Math.max(0, Math.min(1, options.volume));
  let offsetSeconds = 0;

  pattern.forEach((step) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const startTime = now + offsetSeconds;
    const durationSeconds = step.durationMs / 1000;

    oscillator.type = kind === 'capture' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(step.frequency, startTime);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, step.gain * masterVolume), startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + durationSeconds + 0.02);

    offsetSeconds += durationSeconds * 0.72;
  });
}
