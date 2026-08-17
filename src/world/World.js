import { GAME_CONFIG } from "../config.js";
import { Level } from "./Level.js";

export class World {
  constructor(level = new Level()) {
    this.level = level;
    this.width = level.width;
    this.height = level.height;
  }

  update(dt) {
    this.level.update(dt);
  }

  draw(ctx, camera) {
    ctx.fillStyle = GAME_CONFIG.colors.sky;
    ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);
    this.drawBackground(ctx, camera);
    this.level.draw(ctx, camera);
  }

  drawBackground(ctx, camera) {
    ctx.fillStyle = GAME_CONFIG.colors.cloud;
    for (const cloud of [{ x: 160, y: 90, width: 120 }, { x: 620, y: 140, width: 180 }, { x: 1250, y: 80, width: 150 }]) {
      const position = camera.toScreen(cloud.x, cloud.y);
      ctx.fillRect(position.x, position.y, cloud.width, 18);
      ctx.fillRect(position.x + 25, position.y - 14, cloud.width / 2, 18);
    }
  }

  getSolidRects() {
    return this.level.getSolidRects();
  }
}
