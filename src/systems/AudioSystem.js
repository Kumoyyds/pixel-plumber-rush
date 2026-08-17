export class AudioSystem {
  constructor() {
    this.context = null;
  }

  update(_dt) {
    // Reserved for music and sound-effect scheduling.
  }

  enable() {
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === "suspended") this.context.resume();
  }

  playTone(_frequency, _duration) {
    // Audio is opt-in until a user gesture enables the Web Audio context.
  }
}
