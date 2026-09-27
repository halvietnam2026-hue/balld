// ─── Âm thanh synth bằng WebAudio (không cần file ngoài) ───
let ctx: AudioContext | null = null;
let soundOn = true;
let musicOn = true;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let musicStep = 0;

export function setSoundOn(v: boolean) { soundOn = v; }
export function getSoundOn() { return soundOn; }

// Quiet, original generative ambient loop: slow minor-key piano and a soft sustained pad.
// The loop is synthesized locally and needs no external audio stream or copyrighted track.
export function setMusicOn(value: boolean) {
  musicOn = value;
  if (!value && musicTimer) { clearInterval(musicTimer); musicTimer = null; }
}

function musicNote(freq: number, duration: number, when: number, volume: number, wave: OscillatorType) {
  const c = ctx;
  if (!c || !musicOn) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 1200;
  osc.type = wave;
  osc.frequency.value = freq;
  const t = c.currentTime + when;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.18);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(filter).connect(gain).connect(c.destination);
  osc.start(t); osc.stop(t + duration + 0.02);
}

export function startMusic() {
  if (!musicOn || musicTimer) return;
  // Called in response to a gesture so browsers permit audio playback.
  const c = acMusic();
  if (!c) return;
  const chords = [
    [220, 261.63, 329.63], [196, 246.94, 293.66],
    [174.61, 220, 261.63], [196, 246.94, 293.66],
  ];
  const tick = () => {
    if (!musicOn) return;
    const chord = chords[Math.floor(musicStep / 4) % chords.length];
    const note = chord[[0, 1, 2, 1][musicStep % 4]] * 2;
    musicNote(note, 2.2, 0, 0.018, 'sine');
    if (musicStep % 4 === 0) chord.forEach((f) => musicNote(f, 4.5, 0, 0.007, 'triangle'));
    musicStep++;
  };
  tick();
  musicTimer = setInterval(tick, 1100);
}

function acMusic(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch { return null; }
}

function ac(): AudioContext | null {
  if (!soundOn) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur = 0.12, type: OscillatorType = 'sine', vol = 0.22, when = 0, slideTo?: number) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  click() { tone(620, 0.07, 'triangle', 0.18); },
  pick() { tone(440, 0.1, 'sine', 0.22, 0, 660); },
  drop() { tone(520, 0.12, 'sine', 0.24, 0, 340); tone(780, 0.1, 'triangle', 0.1, 0.02); },
  error() { tone(180, 0.16, 'sawtooth', 0.12, 0, 120); },
  undo() { tone(500, 0.09, 'sine', 0.18, 0, 300); },
  complete() {
    tone(660, 0.12, 'triangle', 0.2);
    tone(880, 0.14, 'triangle', 0.2, 0.09);
  },
  win() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((f, i) => tone(f, 0.22, 'triangle', 0.22, i * 0.11));
  },
  star(i: number) { tone(700 + i * 250, 0.18, 'sine', 0.2); },
};
