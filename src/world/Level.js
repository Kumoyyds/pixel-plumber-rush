import { GAME_CONFIG } from "../config.js";
import { Tile } from "./Tile.js";

export class Level {
  constructor() {
    this.width = GAME_CONFIG.worldWidth;
    this.height = GAME_CONFIG.canvasHeight;
    this.tiles = [
      new Tile(0, 460, this.width, 80),
      new Tile(360, 370, 180, 24),
      new Tile(760, 310, 220, 24),
      new Tile(1320, 390, 260, 24),
      new Tile(1800, 335, 220, 24),
    ];
  }

  update(_dt) {
    // Reserved for level-wide animation and scripted events.
  }

  getSolidRects() {
    return this.tiles.filter((tile) => tile.type === "solid").map((tile) => tile.getSolidRect());
  }

  draw(ctx, camera) {
    for (const tile of this.tiles) tile.draw(ctx, camera, GAME_CONFIG.colors);
  }
}
