import { GAME_CONFIG } from "../config.js";
import { Tile } from "./Tile.js";

const GROUND_Y = 460;
const BLOCK_SIZE = 32;

/**
 * The complete course is intentionally plain data. Geometry factories below
 * make the layout readable while keeping rendering and collision in Tile.
 */
export const LEVEL_DATA = {
  width: 4800,
  height: GAME_CONFIG.canvasHeight,
  sections: [
    { name: "warm-up", start: 0, end: 960 },
    { name: "platform-jumping", start: 960, end: 1980 },
    { name: "moving-platforms", start: 1980, end: 2930 },
    { name: "hazards-and-verticality", start: 2930, end: 3840 },
    { name: "final-run", start: 3840, end: 4800 },
  ],
  terrain: [
    { kind: "ground", x: 0, y: GROUND_Y, width: 1000, height: 80 },
    { kind: "ground", x: 1000, y: GROUND_Y, width: 220, height: 80 },
    { kind: "ground", x: 1320, y: GROUND_Y, width: 290, height: 80 },
    { kind: "ground", x: 1710, y: GROUND_Y, width: 270, height: 80 },
    { kind: "ground", x: 2140, y: GROUND_Y, width: 170, height: 80 },
    { kind: "ground", x: 2420, y: GROUND_Y, width: 180, height: 80 },
    { kind: "ground", x: 2710, y: GROUND_Y, width: 220, height: 80 },
    { kind: "ground", x: 3060, y: GROUND_Y, width: 360, height: 80 },
    { kind: "ground", x: 3520, y: GROUND_Y, width: 200, height: 80 },
    { kind: "ground", x: 3840, y: GROUND_Y, width: 480, height: 80 },
    { kind: "ground", x: 4440, y: GROUND_Y, width: 360, height: 80 },
  ],
  platforms: [
    // Section 1: generous, low stepping stones.
    { x: 300, y: 380, width: 180, height: 22 },
    { x: 560, y: 330, width: 180, height: 22 },
    { x: 800, y: 380, width: 120, height: 22 },
    // Section 2: a staircase over the first pits.
    { x: 1040, y: 360, width: 140, height: 22 },
    { x: 1130, y: 295, width: 120, height: 22 },
    { x: 1320, y: 350, width: 150, height: 22 },
    { x: 1480, y: 300, width: 120, height: 22 },
    { x: 1720, y: 365, width: 130, height: 22 },
    // Section 2 secret loft: a high, optional route with a tight landing.
    { x: 1230, y: 290, width: 150, height: 22, secret: true },
    { x: 1400, y: 245, width: 160, height: 22, secret: true },
    { x: 1570, y: 290, width: 180, height: 22, secret: true },
    // Section 3: landing pads around the moving-platform gauntlet.
    { x: 1960, y: 360, width: 130, height: 22 },
    { x: 2820, y: 340, width: 130, height: 22 },
    // Section 4: increasingly vertical escape route.
    { x: 3090, y: 355, width: 120, height: 22 },
    { x: 3260, y: 285, width: 130, height: 22 },
    { x: 3450, y: 350, width: 130, height: 22 },
    { x: 3620, y: 270, width: 140, height: 22 },
    // Section 5: high-speed alternate line before the finish.
    { x: 3910, y: 365, width: 150, height: 22 },
    { x: 4160, y: 315, width: 130, height: 22 },
    { x: 4370, y: 370, width: 110, height: 22 },
  ],
  bricks: [
    { x: 180, y: 380, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 212, y: 380, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 244, y: 380, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 690, y: 270, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 722, y: 270, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 1780, y: 315, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 1812, y: 315, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 3180, y: 300, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 3212, y: 300, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 4020, y: 300, width: BLOCK_SIZE, height: BLOCK_SIZE },
    { x: 4052, y: 300, width: BLOCK_SIZE, height: BLOCK_SIZE },
  ],
  mysteryBlocks: [
    { x: 520, y: 260, width: BLOCK_SIZE, height: BLOCK_SIZE, reward: "coin" },
    { x: 552, y: 260, width: BLOCK_SIZE, height: BLOCK_SIZE, reward: "coin" },
    { x: 584, y: 260, width: BLOCK_SIZE, height: BLOCK_SIZE, reward: "power-up" },
    { x: 1090, y: 240, width: BLOCK_SIZE, height: BLOCK_SIZE, reward: "coin" },
    { x: 1870, y: 300, width: BLOCK_SIZE, height: BLOCK_SIZE, reward: "coin" },
    { x: 3360, y: 225, width: BLOCK_SIZE, height: BLOCK_SIZE, reward: "coin" },
    { x: 4230, y: 250, width: BLOCK_SIZE, height: BLOCK_SIZE, reward: "coin" },
  ],
  movingPlatforms: [
    { x: 2040, y: 350, width: 150, height: 20, motion: { distanceX: 90, speed: 1.2, phase: 0.4 } },
    { x: 2290, y: 290, width: 130, height: 20, motion: { distanceY: 72, speed: 1.05, phase: 1.5 } },
    { x: 2500, y: 350, width: 150, height: 20, motion: { distanceX: 90, speed: 1.35, phase: 2.1 } },
    { x: 2720, y: 270, width: 140, height: 20, motion: { distanceY: 90, speed: 0.9, phase: 0.8 } },
  ],
  pits: [
    { x: 1220, y: GROUND_Y, width: 100, height: 80 },
    { x: 1610, y: GROUND_Y, width: 100, height: 80 },
    { x: 1980, y: GROUND_Y, width: 160, height: 80 },
    { x: 2310, y: GROUND_Y, width: 110, height: 80 },
    { x: 2600, y: GROUND_Y, width: 110, height: 80 },
    { x: 2930, y: GROUND_Y, width: 130, height: 80 },
    { x: 3420, y: GROUND_Y, width: 100, height: 80 },
    { x: 3720, y: GROUND_Y, width: 120, height: 80 },
    { x: 4320, y: GROUND_Y, width: 120, height: 80 },
  ],
  spikes: [
    { x: 1020, y: 444, width: 52, height: 16 },
    { x: 1450, y: 444, width: 64, height: 16 },
    { x: 1880, y: 444, width: 64, height: 16 },
    { x: 3060, y: 444, width: 80, height: 16 },
    { x: 3150, y: 444, width: 64, height: 16 },
    { x: 3520, y: 444, width: 64, height: 16 },
    { x: 3890, y: 444, width: 80, height: 16 },
    { x: 4050, y: 349, width: 64, height: 16 },
    { x: 4480, y: 444, width: 64, height: 16 },
  ],
  bouncePads: [
    { x: 730, y: 448, width: 48, height: 12 },
    { x: 1850, y: 448, width: 48, height: 12 },
    { x: 2860, y: 328, width: 48, height: 12 },
    { x: 3650, y: 258, width: 48, height: 12 },
  ],
  checkpoints: [
    { x: 930, y: 376, width: 30, height: 84, label: "platforming" },
    { x: 2860, y: 376, width: 30, height: 84, label: "hazards" },
    { x: 3830, y: 376, width: 30, height: 84, label: "final run" },
  ],
  finishGate: { x: 4700, y: 360, width: 96, height: 100, label: "finish" },
  coins: [
    { x: 350, y: 345 }, { x: 610, y: 295 }, { x: 840, y: 345 },
    { x: 1060, y: 325 }, { x: 1165, y: 260 }, { x: 1355, y: 315 },
    { x: 1515, y: 265 }, { x: 1745, y: 330 }, { x: 2025, y: 325 },
    { x: 2180, y: 420 }, { x: 2370, y: 355 }, { x: 2545, y: 310 },
    { x: 2765, y: 225 }, { x: 3100, y: 320 }, { x: 3295, y: 250 },
    { x: 3485, y: 315 }, { x: 3655, y: 235 }, { x: 3945, y: 330 },
    { x: 4200, y: 280 }, { x: 4550, y: 420 }, { x: 4620, y: 420 },
  ],
  secretAreas: [
    {
      id: "pipeworks-loft",
      x: 1210,
      y: 205,
      width: 560,
      height: 110,
      entrance: { x: 1210, y: 290 },
      coins: [
        { x: 1260, y: 255 }, { x: 1295, y: 225 }, { x: 1330, y: 255 },
        { x: 1370, y: 215 }, { x: 1410, y: 210 }, { x: 1450, y: 215 },
        { x: 1490, y: 210 }, { x: 1530, y: 215 }, { x: 1580, y: 255 },
        { x: 1620, y: 225 }, { x: 1660, y: 255 }, { x: 1700, y: 225 },
      ],
      powerUpSpawns: [
        { x: 1470, y: 225, type: "spark", secret: true },
      ],
    },
  ],
};

function tileFrom(definition, type, options = {}) {
  return new Tile(
    definition.x,
    definition.y,
    definition.width,
    definition.height,
    type,
    { ...options, ...definition },
  );
}

export function createGround(definition) {
  return tileFrom(definition, definition.kind || "ground");
}

export function createFloatingPlatform(definition) {
  return tileFrom(definition, "platform");
}

export function createMovingPlatform(definition) {
  return tileFrom(definition, "moving", { motion: definition.motion });
}

export function createSpikeHazard(definition) {
  return tileFrom(definition, "spike", { solid: false });
}

export function createPit(definition) {
  return tileFrom(definition, "pit", { solid: false });
}

export function createBouncePad(definition) {
  return tileFrom(definition, "bounce");
}

export function createCheckpointFlag(definition) {
  return tileFrom(definition, "checkpoint", { solid: false });
}

export function createFinishGate(definition) {
  return tileFrom(definition, "finish", { solid: false });
}

export function createBrickBlock(definition) {
  return tileFrom(definition, "brick");
}

export function createMysteryBlock(definition) {
  return tileFrom(definition, "mystery");
}

export class Level {
  constructor(data = LEVEL_DATA) {
    this.data = data;
    this.width = data.width;
    this.height = data.height;
    this.elapsed = 0;
    this.tiles = [
      ...data.terrain.map(createGround),
      ...data.platforms.map(createFloatingPlatform),
      ...data.bricks.map(createBrickBlock),
      ...data.mysteryBlocks.map(createMysteryBlock),
      ...data.movingPlatforms.map(createMovingPlatform),
      ...data.pits.map(createPit),
      ...data.spikes.map(createSpikeHazard),
      ...data.bouncePads.map(createBouncePad),
      ...data.checkpoints.map(createCheckpointFlag),
      createFinishGate(data.finishGate),
    ];
    this.coins = [
      ...data.coins,
      ...data.secretAreas.flatMap((area) =>
        area.coins.map((coin) => ({ ...coin, secret: true, areaId: area.id })),
      ),
    ];
    this.powerUpSpawns = data.secretAreas.flatMap((area) =>
      area.powerUpSpawns.map((spawn) => ({ ...spawn, areaId: area.id })),
    );
    this.checkpoints = data.checkpoints.map((checkpoint) => ({ ...checkpoint }));
    this.finishGate = { ...data.finishGate };
  }

  update(dt) {
    this.elapsed += dt;
    for (const tile of this.tiles) tile.update(dt);
  }

  getSolidRects() {
    return this.tiles.filter((tile) => tile.isSolid()).map((tile) => tile.getSolidRect());
  }

  getHazards() {
    return this.tiles.filter((tile) => tile.type === "spike" || tile.type === "pit").map((tile) => tile.getHazardRect());
  }

  getCoins() {
    return this.coins.map((coin) => ({ ...coin }));
  }

  getPowerUpSpawns() {
    return this.powerUpSpawns.map((spawn) => ({ ...spawn }));
  }

  getMovingPlatforms() {
    return this.tiles
      .filter((tile) => tile.type === "moving")
      .map((tile) => ({ ...tile.getSolidRect(), motion: tile.motion }));
  }

  getBouncePads() {
    return this.tiles.filter((tile) => tile.type === "bounce").map((tile) => tile.getSolidRect());
  }

  getCheckpoints() {
    return this.checkpoints.map((checkpoint) => ({ ...checkpoint }));
  }

  getFinishGate() {
    return { ...this.finishGate };
  }

  draw(ctx, camera) {
    this.drawSecretBackdrops(ctx, camera);
    for (const tile of this.tiles) tile.draw(ctx, camera, GAME_CONFIG.colors);
    this.drawCoins(ctx, camera);
    this.drawPowerUpSpawns(ctx, camera);
  }

  drawSecretBackdrops(ctx, camera) {
    for (const area of this.data.secretAreas) {
      const position = camera.toScreen(area.x, area.y);
      if (position.x + area.width < 0 || position.x > camera.viewportWidth) continue;
      ctx.fillStyle = "rgba(42, 55, 91, 0.2)";
      ctx.fillRect(position.x, position.y, area.width, area.height);
      ctx.fillStyle = "#5669a0";
      ctx.fillRect(position.x + 12, position.y + 12, area.width - 24, 4);
      ctx.fillRect(position.x + 12, position.y + area.height - 12, area.width - 24, 4);
    }
  }

  drawCoins(ctx, camera) {
    for (const coin of this.coins) {
      const position = camera.toScreen(coin.x, coin.y + Math.sin(this.elapsed * 4 + coin.x) * 2);
      if (position.x < -16 || position.x > camera.viewportWidth + 16) continue;
      ctx.fillStyle = "#fff0a2";
      ctx.fillRect(position.x + 5, position.y, 6, 4);
      ctx.fillStyle = "#f4bf3b";
      ctx.fillRect(position.x + 2, position.y + 4, 12, 12);
      ctx.fillStyle = "#c98227";
      ctx.fillRect(position.x + 5, position.y + 6, 3, 8);
      ctx.fillRect(position.x + 10, position.y + 6, 3, 8);
    }
  }

  drawPowerUpSpawns(ctx, camera) {
    for (const spawn of this.powerUpSpawns) {
      const position = camera.toScreen(spawn.x, spawn.y + Math.sin(this.elapsed * 3) * 3);
      if (position.x < -24 || position.x > camera.viewportWidth + 24) continue;
      ctx.fillStyle = "#d8fff2";
      ctx.fillRect(position.x + 5, position.y, 10, 4);
      ctx.fillStyle = "#45c4a1";
      ctx.fillRect(position.x + 2, position.y + 4, 16, 16);
      ctx.fillStyle = "#173f57";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("P", position.x + 10, position.y + 12);
    }
  }
}
