const CONTROL_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowDown",
  "ArrowUp",
  "KeyA",
  "KeyD",
  "KeyS",
  "KeyW",
  "Space",
  "ShiftLeft",
  "ShiftRight",
  "Enter",
  "Escape",
  "KeyP",
  "KeyR",
]);

export class Input {
  constructor() {
    this.keys = new Set();
    this.justPressed = new Set();
    this.onKeyDown = (event) => {
      if (CONTROL_KEYS.has(event.code)) event.preventDefault();
      if (!event.repeat) this.justPressed.add(event.code);
      this.keys.add(event.code);
    };
    this.onKeyUp = (event) => this.keys.delete(event.code);
  }

  attach() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  detach() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  isDown(...codes) {
    return codes.some((code) => this.keys.has(code));
  }

  wasPressed(...codes) {
    return codes.some((code) => this.justPressed.has(code));
  }

  endFrame() {
    this.justPressed.clear();
  }
}
