const DEFAULT_PALETTE = Object.freeze({
  ground: "#3f7540",
  groundTop: "#79c955",
  groundShadow: "#285136",
  platform: "#6e4933",
  platformTop: "#a86b3f",
  brick: "#b9573f",
  brickHighlight: "#e88455",
  brickMortar: "#713b3b",
  mystery: "#e6a83d",
  mysteryHighlight: "#ffe58a",
  mysteryShadow: "#9b5c2d",
  moving: "#5363a8",
  movingHighlight: "#8ca8e6",
  spike: "#e8edf2",
  spikeShadow: "#8290a5",
  bounce: "#45c4a1",
  bounceHighlight: "#b5ffe0",
  pit: "#1e2440",
  flag: "#ffcf4a",
  finish: "#f05c5c",
});

const NON_SOLID_TYPES = new Set(["spike", "pit", "checkpoint", "finish"]);

function color(colors, key) {
  return colors[key] || DEFAULT_PALETTE[key];
}

/**
 * A data-driven piece of level geometry. Tile positions are world-space and
 * may be animated when the tile has a motion descriptor.
 */
export class Tile {
  constructor(x, y, width, height, type = "solid", options = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.solid = options.solid ?? !NON_SOLID_TYPES.has(type);
    this.motion = options.motion || null;
    this.baseX = x;
    this.baseY = y;
    this.elapsed = options.elapsed || 0;
    this.label = options.label || "";
  }

  isSolid() {
    return this.solid;
  }

  update(dt) {
    if (this.type !== "moving" || !this.motion) return;

    this.elapsed += dt;
    const phase = this.motion.phase || 0;
    const wave = Math.sin(this.elapsed * (this.motion.speed || 1) + phase);
    this.x = this.baseX + wave * (this.motion.distanceX || 0);
    this.y = this.baseY + wave * (this.motion.distanceY || 0);
  }

  getSolidRect() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  getHazardRect() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      type: this.type,
    };
  }

  draw(ctx, camera, colors = DEFAULT_PALETTE) {
    const position = camera.toScreen(this.x, this.y);
    if (
      position.x + this.width < 0 ||
      position.x > camera.viewportWidth ||
      position.y + this.height < 0 ||
      position.y > camera.viewportHeight
    ) {
      return;
    }

    switch (this.type) {
      case "ground":
      case "solid":
        this.drawGround(ctx, position, colors);
        break;
      case "platform":
        this.drawPlatform(ctx, position, colors);
        break;
      case "brick":
        this.drawBrick(ctx, position, colors);
        break;
      case "mystery":
        this.drawMystery(ctx, position, colors);
        break;
      case "moving":
        this.drawMoving(ctx, position, colors);
        break;
      case "spike":
        this.drawSpikes(ctx, position, colors);
        break;
      case "pit":
        this.drawPit(ctx, position, colors);
        break;
      case "bounce":
        this.drawBounce(ctx, position, colors);
        break;
      case "checkpoint":
        this.drawCheckpoint(ctx, position, colors);
        break;
      case "finish":
        this.drawFinish(ctx, position, colors);
        break;
      default:
        this.drawGround(ctx, position, colors);
    }
  }

  drawGround(ctx, position, colors) {
    ctx.fillStyle = color(colors, "ground");
    ctx.fillRect(position.x, position.y, this.width, this.height);
    ctx.fillStyle = color(colors, "groundTop");
    ctx.fillRect(position.x, position.y, this.width, Math.min(10, this.height));

    if (this.height > 24) {
      ctx.fillStyle = color(colors, "groundShadow");
      for (let x = 12; x < this.width; x += 38) {
        ctx.fillRect(position.x + x, position.y + 18, 12, 5);
        ctx.fillRect(position.x + x - 7, position.y + 35, 8, 5);
      }
    }
  }

  drawPlatform(ctx, position, colors) {
    ctx.fillStyle = color(colors, "platform");
    ctx.fillRect(position.x, position.y + 5, this.width, Math.max(0, this.height - 5));
    ctx.fillStyle = color(colors, "platformTop");
    ctx.fillRect(position.x, position.y, this.width, 7);
    ctx.fillStyle = color(colors, "groundTop");
    ctx.fillRect(position.x + 4, position.y - 3, Math.max(0, this.width - 8), 4);
  }

  drawBrick(ctx, position, colors) {
    ctx.fillStyle = color(colors, "brick");
    ctx.fillRect(position.x, position.y, this.width, this.height);
    ctx.fillStyle = color(colors, "brickHighlight");
    ctx.fillRect(position.x + 3, position.y + 3, Math.max(0, this.width - 6), 3);
    ctx.strokeStyle = color(colors, "brickMortar");
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(position.x, position.y + this.height / 2);
    ctx.lineTo(position.x + this.width, position.y + this.height / 2);
    ctx.moveTo(position.x + this.width / 2, position.y);
    ctx.lineTo(position.x + this.width / 2, position.y + this.height / 2);
    ctx.moveTo(position.x + this.width / 4, position.y + this.height / 2);
    ctx.lineTo(position.x + this.width / 4, position.y + this.height);
    ctx.moveTo(position.x + (this.width * 3) / 4, position.y + this.height / 2);
    ctx.lineTo(position.x + (this.width * 3) / 4, position.y + this.height);
    ctx.stroke();
  }

  drawMystery(ctx, position, colors) {
    ctx.fillStyle = color(colors, "mysteryShadow");
    ctx.fillRect(position.x, position.y, this.width, this.height);
    ctx.fillStyle = color(colors, "mystery");
    ctx.fillRect(position.x + 2, position.y + 2, Math.max(0, this.width - 4), Math.max(0, this.height - 4));
    ctx.fillStyle = color(colors, "mysteryHighlight");
    ctx.fillRect(position.x + 5, position.y + 5, 4, 4);
    ctx.fillRect(position.x + this.width - 9, position.y + 5, 4, 4);
    ctx.fillRect(position.x + 5, position.y + this.height - 9, 4, 4);
    ctx.fillRect(position.x + this.width - 9, position.y + this.height - 9, 4, 4);
    ctx.fillStyle = "#fff2b8";
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", position.x + this.width / 2, position.y + this.height / 2 + 1);
  }

  drawMoving(ctx, position, colors) {
    ctx.fillStyle = color(colors, "moving");
    ctx.fillRect(position.x, position.y + 4, this.width, Math.max(0, this.height - 4));
    ctx.fillStyle = color(colors, "movingHighlight");
    ctx.fillRect(position.x, position.y, this.width, 6);
    ctx.fillRect(position.x + 10, position.y + 10, 8, 4);
    ctx.fillRect(position.x + this.width - 18, position.y + 10, 8, 4);
  }

  drawSpikes(ctx, position, colors) {
    const count = Math.max(1, Math.floor(this.width / 16));
    const spikeWidth = this.width / count;
    ctx.fillStyle = color(colors, "spike");
    ctx.beginPath();
    for (let index = 0; index < count; index += 1) {
      const left = position.x + index * spikeWidth;
      ctx.moveTo(left, position.y + this.height);
      ctx.lineTo(left + spikeWidth / 2, position.y);
      ctx.lineTo(left + spikeWidth, position.y + this.height);
    }
    ctx.fill();
    ctx.fillStyle = color(colors, "spikeShadow");
    ctx.fillRect(position.x, position.y + this.height - 4, this.width, 4);
  }

  drawPit(ctx, position, colors) {
    ctx.fillStyle = color(colors, "pit");
    ctx.fillRect(position.x, position.y, this.width, this.height);
    ctx.fillStyle = "#3d426b";
    for (let x = 8; x < this.width; x += 22) {
      ctx.fillRect(position.x + x, position.y + 14 + ((x / 22) % 2) * 9, 6, 12);
    }
  }

  drawBounce(ctx, position, colors) {
    ctx.fillStyle = color(colors, "groundShadow");
    ctx.fillRect(position.x, position.y + 5, this.width, Math.max(0, this.height - 5));
    ctx.fillStyle = color(colors, "bounce");
    ctx.fillRect(position.x + 2, position.y, Math.max(0, this.width - 4), 8);
    ctx.fillStyle = color(colors, "bounceHighlight");
    ctx.fillRect(position.x + 7, position.y + 2, Math.max(0, this.width - 14), 3);
  }

  drawCheckpoint(ctx, position, colors) {
    ctx.fillStyle = color(colors, "groundShadow");
    ctx.fillRect(position.x + 8, position.y, 4, this.height);
    ctx.fillStyle = color(colors, "flag");
    ctx.beginPath();
    ctx.moveTo(position.x + 12, position.y + 4);
    ctx.lineTo(position.x + this.width, position.y + 12);
    ctx.lineTo(position.x + 12, position.y + 24);
    ctx.fill();
    ctx.fillStyle = color(colors, "groundTop");
    ctx.fillRect(position.x + 2, position.y + this.height - 4, this.width + 6, 4);
  }

  drawFinish(ctx, position, colors) {
    ctx.fillStyle = color(colors, "finish");
    ctx.fillRect(position.x, position.y + 18, 10, this.height - 18);
    ctx.fillRect(position.x + this.width - 10, position.y + 18, 10, this.height - 18);
    ctx.fillRect(position.x, position.y + 8, this.width, 10);
    ctx.fillStyle = color(colors, "flag");
    ctx.fillRect(position.x + 12, position.y + 25, this.width - 24, 7);
    ctx.fillStyle = "#fff3ce";
    ctx.fillRect(position.x + 18, position.y + 36, 5, 5);
    ctx.fillRect(position.x + this.width - 23, position.y + 36, 5, 5);
  }
}
