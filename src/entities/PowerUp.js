export const POWER_UP_TYPES = Object.freeze({
  SHIELD: "shield",
  SHIELD_ORB: "shield",
  RUSH: "rush",
  RUSH_CRYSTAL: "rush",
  TIME: "time",
  TIME_CRYSTAL: "time",
});

export class PowerUp {
  constructor(x = 0, y = 0, type = "default") {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.type = type;
    this.active = true;
    this.baseY = y;
    this.animationTime = 0;
  }

  update(dt, _world, _player) {
    this.animationTime += dt;
    this.y = this.baseY + Math.sin(this.animationTime * 4) * 3;
  }

  draw(ctx, camera) {
    if (!this.active) return;
    const position = camera.toScreen(this.x, this.y);
    ctx.fillStyle = {
      [POWER_UP_TYPES.SHIELD]: "#55d6be",
      [POWER_UP_TYPES.RUSH]: "#ff8c42",
      [POWER_UP_TYPES.TIME]: "#9b7bff",
    }[this.type] ?? "#ffcf4a";
    ctx.beginPath();
    ctx.arc(position.x + this.width / 2, position.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.type === POWER_UP_TYPES.SHIELD ? "S" : this.type === POWER_UP_TYPES.RUSH ? "R" : "T", position.x + this.width / 2, position.y + this.height / 2 + 1);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  }
}

export class Coin {
  constructor(x = 0, y = 0, value = 1) {
    this.x = x;
    this.y = y;
    this.width = 14;
    this.height = 14;
    this.value = value;
    this.active = true;
    this.baseY = y;
    this.animationTime = 0;
  }

  update(dt) {
    this.animationTime += dt;
    this.y = this.baseY + Math.sin(this.animationTime * 5) * 2;
  }

  draw(ctx, camera) {
    if (!this.active) return;
    const position = camera.toScreen(this.x, this.y);
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(position.x + this.width / 2, position.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f39c36";
    ctx.fillRect(position.x + 5, position.y + 2, 3, 10);
  }
}

export class MysteryBlock {
  constructor(x = 0, y = 0, reward = null) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.reward = reward;
    this.revealed = false;
    this.active = true;
    this.bumpTime = 0;
  }

  update(dt) {
    this.bumpTime = Math.max(0, this.bumpTime - dt);
  }

  reveal() {
    if (this.revealed) return false;
    this.revealed = true;
    this.active = false;
    this.bumpTime = 0.12;
    return true;
  }

  draw(ctx, camera) {
    const position = camera.toScreen(this.x, this.y - (this.bumpTime > 0 ? 4 : 0));
    ctx.fillStyle = this.revealed ? "#9b7654" : "#e8a83e";
    ctx.fillRect(position.x, position.y, this.width, this.height);
    ctx.fillStyle = this.revealed ? "#6f5745" : "#fff0a6";
    ctx.font = "bold 22px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.revealed ? "·" : "?", position.x + this.width / 2, position.y + this.height / 2 + 1);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  }
}
