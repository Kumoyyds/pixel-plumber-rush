export class Enemy {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.width = 28;
    this.height = 28;
    this.velocityX = 0;
    this.velocityY = 0;
  }

  update(_dt, _world) {
    // Reserved for enemy-specific behavior.
  }

  draw(ctx, camera) {
    const position = camera.toScreen(this.x, this.y);
    ctx.fillStyle = "#8d4de8";
    ctx.fillRect(position.x, position.y, this.width, this.height);
  }
}
