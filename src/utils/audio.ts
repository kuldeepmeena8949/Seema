let audioCtx: AudioContext | null = null;
let isMuted = false;

try {
  isMuted = localStorage.getItem('parkit-mute') === '1';
} catch {
  isMuted = false;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioCtxClass();
    } catch {
      return null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(
  freq: number,
  delay: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  endFreq?: number
) {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = ctx.currentTime + (delay || 0);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), startTime + duration);
    }

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.03);
  } catch {
    // Ignore audio glitches if browser policy throttles
  }
}

export const SoundEngine = {
  isMuted(): boolean {
    return isMuted;
  },

  setMuted(muted: boolean) {
    isMuted = muted;
    try {
      localStorage.setItem('parkit-mute', muted ? '1' : '0');
    } catch {
      // ignore
    }
  },

  toggleMute(): boolean {
    this.setMuted(!isMuted);
    if (!isMuted) {
      this.pick();
    }
    return isMuted;
  },

  pick() {
    playTone(520, 0, 0.06, 'triangle', 0.08);
  },

  slide() {
    playTone(140, 0, 0.12, 'sine', 0.22, 70);
    playTone(320, 0, 0.04, 'square', 0.03);
  },

  bump() {
    playTone(90, 0, 0.1, 'square', 0.12, 50);
  },

  undo() {
    playTone(400, 0, 0.12, 'triangle', 0.1, 240);
  },

  hint() {
    playTone(880, 0, 0.12, 'sine', 0.12);
    playTone(1320, 0.12, 0.18, 'sine', 0.1);
  },

  rev() {
    playTone(70, 0, 0.7, 'sawtooth', 0.12, 280);
    playTone(110, 0.05, 0.65, 'triangle', 0.08, 320);
  },

  star(n: number) {
    playTone(660 * Math.pow(1.26, n), 0, 0.25, 'triangle', 0.15);
  },

  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      playTone(freq, idx * 0.09, 0.32, 'triangle', 0.14);
    });
  },

  click() {
    playTone(600, 0, 0.04, 'sine', 0.05);
  },
};
