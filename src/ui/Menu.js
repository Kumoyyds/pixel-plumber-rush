const roundedRect = (ctx, x, y, width, height, radius = 12) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

const normalizeScreen = (state = {}) => {
  if (state.screen) return String(state.screen).toLowerCase();
  if (state.victory) return "victory";
  if (state.gameOver) return "game-over";
  if (state.paused) return "pause";
  return null;
};

export class Menu {
  constructor() {
    this.lastScreen = null;
    this.buttons = [];
  }

  draw(ctx, gameState = {}) {
    const screen = normalizeScreen(gameState);
    this.buttons = [];
    if (!screen || screen === "playing") return;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.save();
    ctx.fillStyle = screen === "title" ? "rgba(10, 14, 35, 0.2)" : "rgba(10, 14, 35, 0.78)";
    ctx.fillRect(0, 0, width, height);

    if (screen === "title") this.drawTitle(ctx, width, height);
    if (screen === "instructions") this.drawInstructions(ctx, width, height);
    if (screen === "pause") this.drawPause(ctx, width, height);
    if (screen === "game-over") this.drawGameOver(ctx, width, height, gameState);
    if (screen === "victory") this.drawVictory(ctx, width, height, gameState);
    ctx.restore();
    this.lastScreen = screen;
  }

  drawTitle(ctx, width, height) {
    this.drawCard(ctx, width / 2 - 250, 92, 500, 352);
    this.drawLogo(ctx, width / 2, 160);
    this.drawText(ctx, "RACE THE PIPELINE. OWN THE FLOW.", width / 2, 216, 13, "#9da8d3");
    this.drawButton(ctx, "START RUN", width / 2 - 112, 270, 224, 48, "start");
    this.drawButton(ctx, "HOW TO PLAY", width / 2 - 112, 328, 224, 42, "instructions", "secondary");
    this.drawText(ctx, "CLICK OR PRESS ENTER TO START", width / 2, 414, 10, "#7fe7ff");
  }

  drawInstructions(ctx, width, height) {
    this.drawCard(ctx, width / 2 - 270, 70, 540, 400);
    this.drawText(ctx, "HOW TO PLAY", width / 2, 116, 25, "#ffe36e");
    const rows = [
      ["MOVE", "A / D  or  ← / →"],
      ["JUMP", "W / ↑ / SPACE"],
      ["STOMP", "LAND ON ENEMIES"],
      ["COLLECT", "COINS BUILD YOUR COMBO"],
      ["RUSH", "REACH THE FINISH GATE"],
    ];
    rows.forEach(([label, detail], index) => {
      const y = 168 + index * 39;
      ctx.fillStyle = "#70f0bb";
      ctx.fillRect(width / 2 - 205, y - 8, 7, 7);
      this.drawText(ctx, label, width / 2 - 184, y, 12, "#ffffff", "left");
      this.drawText(ctx, detail, width / 2 - 68, y, 12, "#9da8d3", "left");
    });
    this.drawButton(ctx, "BACK", width / 2 - 100, 386, 200, 44, "back", "secondary");
  }

  drawPause(ctx, width, height) {
    this.drawCard(ctx, width / 2 - 210, 128, 420, 286);
    this.drawText(ctx, "RUN PAUSED", width / 2, 188, 28, "#ffffff");
    this.drawText(ctx, "THE PIPELINE CAN WAIT.", width / 2, 224, 12, "#9da8d3");
    this.drawButton(ctx, "RESUME", width / 2 - 100, 260, 200, 44, "resume");
    this.drawButton(ctx, "RESTART RUN", width / 2 - 100, 314, 200, 42, "restart", "secondary");
    this.drawText(ctx, "ESC / P TO RESUME", width / 2, 386, 10, "#7fe7ff");
  }

  drawGameOver(ctx, width, height, gameState) {
    this.drawCard(ctx, width / 2 - 235, 102, 470, 336);
    this.drawText(ctx, "PIPELINE JAMMED", width / 2, 164, 28, "#ff6b6b");
    this.drawText(ctx, "SCORE", width / 2 - 90, 220, 11, "#9da8d3");
    this.drawText(ctx, String(gameState.score ?? 0).padStart(6, "0"), width / 2 - 90, 248, 22, "#ffffff");
    this.drawText(ctx, "KEEP MOVING, PLUMBER.", width / 2, 286, 12, "#9da8d3");
    this.drawButton(ctx, "RESTART RUN", width / 2 - 112, 326, 224, 48, "restart");
    this.drawText(ctx, "PRESS R OR CLICK TO RETRY", width / 2, 408, 10, "#7fe7ff");
  }

  drawVictory(ctx, width, height, gameState) {
    this.drawCard(ctx, width / 2 - 250, 92, 500, 352);
    this.drawLogo(ctx, width / 2, 150, "FLOW COMPLETE!");
    this.drawText(ctx, `SCORE  ${String(gameState.score ?? 0).padStart(6, "0")}`, width / 2, 236, 15, "#ffe36e");
    this.drawText(ctx, "THE CITY IS DRY. NICE WORK.", width / 2, 270, 12, "#9da8d3");
    this.drawButton(ctx, "RUN IT BACK", width / 2 - 112, 312, 224, 48, "restart");
    this.drawText(ctx, "PRESS R OR CLICK TO RESTART", width / 2, 410, 10, "#7fe7ff");
  }

  drawCard(ctx, x, y, width, height) {
    ctx.save();
    ctx.fillStyle = "rgba(22, 28, 60, 0.96)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 24;
    roundedRect(ctx, x, y, width, height, 14);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();
    ctx.restore();
  }

  drawLogo(ctx, x, y, text = "PIXEL PLUMBER") {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 36px monospace";
    ctx.lineJoin = "round";
    ctx.lineWidth = 7;
    ctx.strokeStyle = "#20243c";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = "#ffe36e";
    ctx.fillText(text, x, y);
    ctx.font = "900 14px monospace";
    ctx.fillStyle = "#ff6b6b";
    ctx.fillText("RUSH", x, y + 38);
    ctx.restore();
  }

  drawText(ctx, text, x, y, size, color, align = "center") {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `900 ${size}px monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  drawButton(ctx, label, x, y, width, height, action, variant = "primary") {
    this.buttons.push({ action, x, y, width, height });
    ctx.save();
    ctx.fillStyle = variant === "secondary" ? "rgba(77, 87, 127, 0.55)" : "#70f0bb";
    ctx.strokeStyle = variant === "secondary" ? "#7180ad" : "#c6ffe8";
    ctx.lineWidth = 2;
    roundedRect(ctx, x, y, width, height, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = variant === "secondary" ? "#ffffff" : "#17203f";
    ctx.font = "900 14px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + width / 2, y + height / 2 + 1);
    ctx.restore();
  }

  getActionAt(x, y) {
    return this.buttons.find((button) => (
      x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height
    ))?.action ?? null;
  }

  handlePointer(x, y) {
    return this.getActionAt(x, y);
  }
}
