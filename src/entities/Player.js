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
  }

  update(dt, world, input) {
    const direction = Number(input.isDown("ArrowRight", "KeyD")) - Number(input.isDown("ArrowLeft", "KeyA"));
    this.velocityX = direction * GAME_CONFIG.player.moveSpeed;
    if (direction !== 0) this.facing = direction;

    if (input.wasPressed("ArrowUp", "KeyW", "Space") && this.onGround) {
      this.velocityY = -GAME_CONFIG.player.jumpVelocity;
    }

    this.velocityY += GAME_CONFIG.gravity * dt;
    moveAndCollide(this, dt, world.getSolidRects());
    this.x = Math.max(0, Math.min(this.x, world.width - this.width));
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
