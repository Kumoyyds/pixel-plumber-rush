import { GAME_CONFIG } from "../config.js";

export class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  follow(target, worldWidth, worldHeight = this.viewportHeight) {
    const deadZoneWidth = Math.min(GAME_CONFIG.camera.deadZoneWidth, this.viewportWidth);
    const deadZoneHeight = Math.min(GAME_CONFIG.camera.deadZoneHeight, this.viewportHeight);
    const horizontalMargin = (this.viewportWidth - deadZoneWidth) / 2;
    const verticalMargin = (this.viewportHeight - deadZoneHeight) / 2;
    const maxX = Math.max(0, worldWidth - this.viewportWidth);
    const maxY = Math.max(0, worldHeight - this.viewportHeight);
    const targetCenterX = target.x + target.width / 2;
    const targetCenterY = target.y + target.height / 2;

    if (targetCenterX < this.x + horizontalMargin) {
      this.x = targetCenterX - horizontalMargin;
    } else if (targetCenterX > this.x + this.viewportWidth - horizontalMargin) {
      this.x = targetCenterX - (this.viewportWidth - horizontalMargin);
    }

    if (targetCenterY < this.y + verticalMargin) {
      this.y = targetCenterY - verticalMargin;
    } else if (targetCenterY > this.y + this.viewportHeight - verticalMargin) {
      this.y = targetCenterY - (this.viewportHeight - verticalMargin);
    }

    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.max(0, Math.min(this.y, maxY));
  }

  toScreen(x, y) {
    return { x: x - this.x, y: y - this.y };
  }
}
