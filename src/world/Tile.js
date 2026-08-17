export class Tile {
  constructor(x, y, width, height, type = "solid") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
  }

  getSolidRect() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  draw(ctx, camera, colors) {
    const position = camera.toScreen(this.x, this.y);
    ctx.fillStyle = colors.ground;
    ctx.fillRect(position.x, position.y, this.width, this.height);
    ctx.fillStyle = colors.groundTop;
    ctx.fillRect(position.x, position.y, this.width, Math.min(10, this.height));
  }
}
