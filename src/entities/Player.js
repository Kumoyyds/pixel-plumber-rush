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
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.groundPoundTimer = 0;
    this.groundPoundActive = false;
  }

  update(dt, world, input) {
    const config = GAME_CONFIG.player;
    const wasOnGround = this.onGround;
    const jumpPressed = input.wasPressed("ArrowUp", "KeyW", "Space");
    const jumpHeld = input.isDown("ArrowUp", "KeyW", "Space");
    const downHeld = input.isDown("ArrowDown", "KeyS");
    const downPressed = input.wasPressed("ArrowDown", "KeyS");
    const direction =
      Number(input.isDown("ArrowRight", "KeyD")) -
      Number(input.isDown("ArrowLeft", "KeyA"));

    this.coyoteTimer = wasOnGround
      ? config.coyoteTime
      : Math.max(0, this.coyoteTimer - dt);
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    this.dashCooldownTimer = Math.max(0, this.dashCooldownTimer - dt);
    if (jumpPressed) this.jumpBufferTimer = config.jumpBufferTime;
    if (direction !== 0) this.facing = direction;

    const groundPoundPressed =
      !wasOnGround &&
      ((jumpPressed && downHeld) || (downPressed && jumpHeld));
    if (groundPoundPressed) {
      this.groundPoundActive = true;
      this.groundPoundTimer = config.groundPoundPause;
      this.jumpBufferTimer = 0;
      this.velocityY = 0;
    }

    if (
      !this.groundPoundActive &&
      this.jumpBufferTimer > 0 &&
      (wasOnGround || this.coyoteTimer > 0)
    ) {
      this.velocityY = -config.jumpVelocity;
      this.onGround = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
    }

    const dashPressed = input.wasPressed("ShiftLeft", "ShiftRight");
    if (
      dashPressed &&
      this.dashCooldownTimer <= 0 &&
      !this.groundPoundActive
    ) {
      this.dashTimer = config.dashDuration;
      this.dashCooldownTimer = config.dashCooldown;
      this.velocityX = (direction || this.facing) * config.dashSpeed;
      this.velocityY = 0;
    }

    if (this.dashTimer > 0) {
      this.dashTimer = Math.max(0, this.dashTimer - dt);
      this.velocityX = (direction || this.facing) * config.dashSpeed;
      this.velocityY = 0;
    } else {
      const acceleration = this.onGround
        ? config.groundAcceleration
        : config.airAcceleration;
      const friction = this.onGround ? config.groundFriction : config.airFriction;
      const targetSpeed = direction * config.maxSpeed;
      const rate = direction === 0 ? friction : acceleration;
      this.velocityX = approach(this.velocityX, targetSpeed, rate * dt);

      if (this.groundPoundActive) {
        this.groundPoundTimer = Math.max(0, this.groundPoundTimer - dt);
        if (this.groundPoundTimer === 0) {
          this.groundPoundActive = false;
          this.velocityY = config.groundPoundVelocity;
        } else {
          this.velocityY = 0;
        }
      } else {
        if (!jumpHeld && this.velocityY < -config.jumpCutVelocity) {
          this.velocityY = -config.jumpCutVelocity;
        }
        this.velocityY = Math.min(
          this.velocityY + GAME_CONFIG.gravity * dt,
          config.maxFallSpeed,
        );
      }
    }

    const collision = moveAndCollide(this, dt, world.getSolidRects());
    const maxX = Math.max(0, world.width - this.width);
    this.x = Math.max(0, Math.min(this.x, maxX));
    if ((this.x === 0 && this.velocityX < 0) || (this.x === maxX && this.velocityX > 0)) {
      this.velocityX = 0;
    }

    if (this.y < 0) {
      this.y = 0;
      if (this.velocityY < 0) this.velocityY = 0;
    }
    if (Number.isFinite(world.height)) {
      const maxY = Math.max(0, world.height - this.height);
      if (this.y > maxY) {
        this.y = maxY;
        this.velocityY = 0;
        collision.landed = !wasOnGround;
        this.onGround = true;
      }
    }

    if (this.onGround) this.coyoteTimer = config.coyoteTime;
    if (collision.landed || this.onGround) {
      this.groundPoundActive = false;
      this.groundPoundTimer = 0;
    }

    input.endFrame();
  }

  draw(ctx, camera) {
    const position = camera.toScreen(this.x, this.y);
    ctx.fillStyle = GAME_CONFIG.colors.player;
    ctx.fillRect(position.x, position.y, this.width, this.height);
    ctx.fillStyle = GAME_CONFIG.colors.playerAccent;
    ctx.fillRect(position.x + 5, position.y + 7, this.width - 10, 7);
    ctx.fillStyle = "#20243c";
    ctx.fillRect(position.x + (this.facing > 0 ? 18 : 5), position.y + 18, 5, 5);
  }
}

function approach(value, target, amount) {
  if (value < target) return Math.min(value + amount, target);
  if (value > target) return Math.max(value - amount, target);
  return target;
}
