import { GAME_CONFIG } from "../config.js";
import { Level } from "./Level.js";

const BACKDROP_CLOUDS = [
  { x: 140, y: 92, width: 120, scale: 1 },
  { x: 640, y: 138, width: 180, scale: 1.25 },
  { x: 1240, y: 76, width: 150, scale: 0.9 },
  { x: 1900, y: 120, width: 170, scale: 1.1 },
  { x: 2580, y: 70, width: 130, scale: 0.8 },
  { x: 3260, y: 145, width: 190, scale: 1.3 },
  { x: 4020, y: 92, width: 160, scale: 1 },
  { x: 4610, y: 148, width: 130, scale: 0.85 },
];

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
    ctx.fillStyle = "rgba(67, 133, 148, 0.16)";
    for (let x = -camera.x * 0.12; x < camera.viewportWidth + 180; x += 180) {
      ctx.fillRect(x, 355, 110, 105);
      ctx.fillRect(x + 35, 320, 70, 140);
    }

    ctx.fillStyle = GAME_CONFIG.colors.cloud;
    for (const cloud of BACKDROP_CLOUDS) {
      const position = camera.toScreen(cloud.x, cloud.y);
      const width = cloud.width * cloud.scale;
      ctx.fillRect(position.x, position.y, width, 18);
      ctx.fillRect(position.x + 25 * cloud.scale, position.y - 14, width / 2, 18);
      ctx.fillRect(position.x + width * 0.6, position.y + 6, width * 0.28, 12);
    }
  }

  // Stable collision contract used by Player and any future physics actors.
  getSolidRects() {
    return this.level.getSolidRects();
  }

  getHazards() {
    return this.level.getHazards();
  }

  getCoins() {
    return this.level.getCoins();
  }

  getPowerUpSpawns() {
    return this.level.getPowerUpSpawns();
  }

  getMovingPlatforms() {
    return this.level.getMovingPlatforms();
  }

  getBouncePads() {
    return this.level.getBouncePads();
  }

  getCheckpoints() {
    return this.level.getCheckpoints();
  }

  getFinishGate() {
    return this.level.getFinishGate();
  }
}
