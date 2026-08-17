import { GAME_CONFIG } from "../config.js";
import { moveAndCollide } from "../core/Physics.js";

export class Player {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.width = GAME_CONFIG.player.width;
    this.height = GAME_CONFIG.player.height;
    this.velocityX = 0;
    this.velocityY = 0;
    this.onGround = false;
    this.facing = 1;
    this.speedMultiplier = 1;
    this.groundPoundActive = false;
    this.groundPoundImpact = false;
    this.lives = 3;
    this.invulnerabilityTimer = 0;
    this.hasShield = false;
    this.shieldActive = false;
    this.rushTimer = 0;
    this.timeCrystalTimer = 0;
    this.enemyTimeScale = 1;
    this.hazardTimeScale = 1;
  }

  update(dt, world, input) {
    this.groundPoundImpact = false;
    const direction = Number(input.isDown("ArrowRight", "KeyD")) - Number(input.isDown("ArrowLeft", "KeyA"));
    this.velocityX = direction * GAME_CONFIG.player.moveSpeed * this.speedMultiplier;
    if (direction !== 0) this.facing = direction;

    if (input.wasPressed("ArrowUp", "KeyW", "Space") && this.onGround) {
      this.velocityY = -GAME_CONFIG.player.jumpVelocity;
    }

    if (!this.onGround && input.wasPressed("ArrowDown", "KeyS")) {
      this.groundPoundActive = true;
    }

    this.velocityY += GAME_CONFIG.gravity * dt;
    if (this.groundPoundActive) {
      this.velocityY = Math.max(this.velocityY, GAME_CONFIG.player.groundPoundVelocity);
    }
    moveAndCollide(this, dt, world.getSolidRects());
    if (this.groundPoundActive && this.onGround) {
      this.groundPoundActive = false;
      this.groundPoundImpact = true;
    }
    this.x = Math.max(0, Math.min(this.x, world.width - this.width));
    input.endFrame();
  }

  takeDamage(amount = 1) {
    if (this.invulnerabilityTimer > 0) return false;
    if (this.hasShield || this.shieldActive) {
      this.hasShield = false;
      this.shieldActive = false;
      this.invulnerabilityTimer = 0.35;
      return { absorbed: true };
    }
    this.lives = Math.max(0, this.lives - amount);
    this.invulnerabilityTimer = 0.8;
    return { absorbed: false, lives: this.lives };
  }

  draw(ctx, camera) {
    const position = camera.toScreen(this.x, this.y);
    ctx.fillStyle = GAME_CONFIG.colors.player;
    ctx.fillRect(position.x, position.y, this.width, this.height);
    ctx.fillStyle = GAME_CONFIG.colors.playerAccent;
    ctx.fillRect(position.x + 5, position.y + 7, this.width - 10, 7);
    ctx.fillStyle = "#20243c";
    ctx.fillRect(position.x + (this.facing > 0 ? 18 : 5), position.y + 18, 5, 5);
    if (this.hasShield || this.shieldActive) {
      ctx.strokeStyle = "#55d6be";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(position.x + this.width / 2, position.y + this.height / 2, this.width * 0.72, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
