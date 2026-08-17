import { GAME_CONFIG } from "../config.js";
import { moveAndCollide } from "../core/Physics.js";

function isSupportedAt(body, x, solidRects) {
  const footY = body.y + body.height;
  return solidRects.some((rect) => {
    const horizontalOverlap = x + 1 < rect.x + rect.width && x + body.width - 1 > rect.x;
    const verticalOverlap = footY >= rect.y - 3 && footY <= rect.y + 6;
    return horizontalOverlap && verticalOverlap;
  });
}

export class Enemy {
  constructor(x = 0, y = 0, options = {}) {
    this.x = x;
    this.y = y;
    this.width = options.width ?? GAME_CONFIG.enemies.width;
    this.height = options.height ?? GAME_CONFIG.enemies.height;
    this.velocityX = 0;
    this.velocityY = 0;
    this.direction = options.direction ?? 1;
    this.facing = this.direction;
    this.onGround = false;
    this.active = true;
    this.defeated = false;
    this.type = options.type ?? "normal";
    this.isNormal = true;
  }

  update(dt, world, _player, timeScale = 1) {
    this.velocityY += GAME_CONFIG.enemies.gravity * dt * timeScale;
    moveAndCollide(this, dt * timeScale, world.getSolidRects());
  }

  defeat() {
    if (!this.active) return false;
    this.active = false;
    this.defeated = true;
    return true;
  }

  draw(ctx, camera) {
    if (!this.active) return;
    const position = camera.toScreen(this.x, this.y);
    ctx.fillStyle = "#8d4de8";
    ctx.fillRect(position.x, position.y, this.width, this.height);
  }
}

export class Walker extends Enemy {
  constructor(x = 0, y = 0, options = {}) {
    super(x, y, { ...options, type: "walker" });
    this.speed = options.speed ?? GAME_CONFIG.enemies.walkerSpeed;
  }

  update(dt, world, _player, timeScale = 1) {
    const solidRects = world.getSolidRects();
    const previousDirection = this.direction;
    this.velocityX = this.direction * this.speed;
    this.velocityY += GAME_CONFIG.enemies.gravity * dt * timeScale;
    moveAndCollide(this, dt * timeScale, solidRects);

    const hitWall = this.velocityX === 0 && this.onGround;
    const hasNextStep = isSupportedAt(
      this,
      this.x + this.direction * Math.max(2, this.width * 0.35),
      solidRects,
    );
    if (hitWall || (this.onGround && !hasNextStep)) this.direction *= -1;
    if (previousDirection !== this.direction || hitWall) this.facing = this.direction;
  }

  draw(ctx, camera) {
    if (!this.active) return;
    const position = camera.toScreen(this.x, this.y);
    ctx.fillStyle = "#d9564f";
    ctx.fillRect(position.x, position.y, this.width, this.height);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(position.x + 5, position.y + 6, 7, 7);
    ctx.fillRect(position.x + 16, position.y + 6, 7, 7);
  }
}

export class Hopper extends Enemy {
  constructor(x = 0, y = 0, options = {}) {
    super(x, y, { ...options, type: "hopper" });
    this.speed = options.speed ?? GAME_CONFIG.enemies.hopperSpeed;
    this.jumpVelocity = options.jumpVelocity ?? GAME_CONFIG.enemies.hopperJumpVelocity;
    this.jumpInterval = options.jumpInterval ?? GAME_CONFIG.enemies.hopperJumpInterval;
    this.jumpTimer = options.jumpTimer ?? this.jumpInterval;
  }

  update(dt, world, player, timeScale = 1) {
    const scaledDt = dt * timeScale;
    this.jumpTimer -= scaledDt;
    if (this.onGround && this.jumpTimer <= 0) {
      const target = player ? player.x + player.width / 2 : this.x + this.direction;
      this.direction = target >= this.x + this.width / 2 ? 1 : -1;
      this.facing = this.direction;
      this.velocityY = -this.jumpVelocity;
      this.jumpTimer = this.jumpInterval;
    }

    this.velocityX = this.direction * this.speed;
    this.velocityY += GAME_CONFIG.enemies.gravity * scaledDt;
    moveAndCollide(this, scaledDt, world.getSolidRects());
  }

  draw(ctx, camera) {
    if (!this.active) return;
    const position = camera.toScreen(this.x, this.y);
    ctx.fillStyle = "#46a6a8";
    ctx.fillRect(position.x, position.y, this.width, this.height);
    ctx.fillStyle = "#e9ff70";
    ctx.fillRect(position.x + 5, position.y + 5, 18, 6);
  }
}

export class Charger extends Enemy {
  constructor(x = 0, y = 0, options = {}) {
    super(x, y, { ...options, type: "charger" });
    this.speed = options.speed ?? GAME_CONFIG.enemies.chargerSpeed;
    this.activationRange = options.activationRange ?? GAME_CONFIG.enemies.chargerActivationRange;
    this.awake = false;
  }

  update(dt, world, player, timeScale = 1) {
    const scaledDt = dt * timeScale;
    const playerCenter = player ? player.x + player.width / 2 : this.x;
    const distance = Math.abs(playerCenter - (this.x + this.width / 2));
    if (!this.awake && distance <= this.activationRange) this.awake = true;

    this.velocityX = this.awake ? this.direction * this.speed : 0;
    this.velocityY += GAME_CONFIG.enemies.gravity * scaledDt;
    moveAndCollide(this, scaledDt, world.getSolidRects());
    if (this.awake && this.velocityX === 0) {
      this.direction *= -1;
      this.facing = this.direction;
    }
  }

  draw(ctx, camera) {
    if (!this.active) return;
    const position = camera.toScreen(this.x, this.y);
    ctx.fillStyle = this.awake ? "#ef8f3b" : "#786b62";
    ctx.fillRect(position.x, position.y, this.width, this.height);
    ctx.fillStyle = this.awake ? "#fff2a6" : "#b6aaa0";
    ctx.fillRect(position.x + 5, position.y + 7, 18, 6);
  }
}
