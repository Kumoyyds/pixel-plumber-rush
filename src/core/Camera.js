export class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  follow(target, worldWidth) {
    const targetCenter = target.x + target.width / 2;
    const maxX = Math.max(0, worldWidth - this.viewportWidth);
    this.x = Math.max(0, Math.min(targetCenter - this.viewportWidth / 2, maxX));
  }

  toScreen(x, y) {
    return { x: x - this.x, y: y - this.y };
  }
}
