export class PowerUp {
  constructor(x = 0, y = 0, type = "default") {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.type = type;
    this.active = true;
  }

  update(_dt, _world) {
    // Reserved for power-up animation and behavior.
  }

  draw(ctx, camera) {
    if (!this.active) return;
    const position = camera.toScreen(this.x, this.y);
    ctx.fillStyle = "#ffcf4a";
    ctx.fillRect(position.x, position.y, this.width, this.height);
  }
}
