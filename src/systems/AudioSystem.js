const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  return window.AudioContext || window.webkitAudioContext || null;
};

export class AudioSystem {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.muted = false;
    this.enabled = false;
  }

  update(_dt) {
    // Effects are scheduled at the moment they happen; no music or downloads are needed.
  }

  enable() {
    const AudioContext = getAudioContext();
    if (!AudioContext) return false;
    if (!this.context) {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.16;
      this.masterGain.connect(this.context.destination);
    }
    if (this.context.state === "suspended") this.context.resume();
    this.enabled = true;
    return true;
  }

  disable() {
    this.muted = true;
  }

  toggle() {
    this.muted = !this.muted;
    return !this.muted;
  }

  playTone(frequency, duration = 0.1, options = {}) {
    if (!this.enabled || this.muted || !this.context || !this.masterGain) return false;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const type = options.type ?? "square";
    const startFrequency = Math.max(30, frequency);
    const endFrequency = Math.max(30, options.endFrequency ?? startFrequency);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(options.volume ?? 0.45, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
    return true;
  }

  playNoise(duration = 0.12, options = {}) {
    if (!this.enabled || this.muted || !this.context || !this.masterGain) return false;
    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, Math.ceil(sampleRate * duration), sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      const fade = 1 - index / data.length;
      data[index] = (Math.random() * 2 - 1) * fade;
    }
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    filter.type = options.filterType ?? "bandpass";
    filter.frequency.value = options.frequency ?? 900;
    filter.Q.value = options.q ?? 0.8;
    gain.gain.setValueAtTime(options.volume ?? 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(now);
    source.stop(now + duration + 0.02);
    return true;
  }

  playJump() {
    this.playTone(430, 0.09, { endFrequency: 720, type: "square", volume: 0.28 });
    this.playTone(860, 0.07, { endFrequency: 980, type: "triangle", volume: 0.11 });
  }

  playCoin() {
    this.playTone(740, 0.07, { endFrequency: 980, type: "square", volume: 0.25 });
    this.playTone(1110, 0.1, { endFrequency: 1320, type: "triangle", volume: 0.2 });
  }

  playStomp() {
    this.playNoise(0.1, { frequency: 180, q: 0.7, volume: 0.35 });
    this.playTone(130, 0.13, { endFrequency: 65, type: "sawtooth", volume: 0.22 });
  }

  playHurt() {
    this.playNoise(0.16, { frequency: 520, q: 1.2, volume: 0.25 });
    this.playTone(240, 0.2, { endFrequency: 90, type: "sawtooth", volume: 0.28 });
  }

  playPowerUp() {
    [0, 1, 2, 3].forEach((step) => {
      this.playTone(420 + step * 120, 0.1, { type: "triangle", volume: 0.18 });
    });
  }

  playCheckpoint() {
    this.playTone(520, 0.12, { endFrequency: 700, type: "triangle", volume: 0.25 });
    this.playTone(780, 0.18, { endFrequency: 1040, type: "square", volume: 0.2 });
  }

  playVictory() {
    [0, 1, 2, 3, 4].forEach((step) => {
      this.playTone(392 * Math.pow(1.18, step), 0.18, { type: "triangle", volume: 0.2 });
    });
  }

  play(name) {
    const method = `play${String(name).charAt(0).toUpperCase()}${String(name).slice(1)}`;
    if (typeof this[method] === "function") this[method]();
  }
}
