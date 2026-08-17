const roundedRect = (ctx, x, y, width, height, radius = 8) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

const formatTimer = (value) => {
  if (typeof value === "string") return value;
  const totalSeconds = Math.max(0, Math.floor(Number(value) || 0));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const drawHeart = (ctx, x, y, filled) => {
  ctx.save();
  ctx.fillStyle = filled ? "#ff6b6b" : "#4b526f";
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 15);
  ctx.lineTo(x - 1, y + 6);
  ctx.arc(x + 3, y + 5, 4, Math.PI, 0);
  ctx.arc(x + 13, y + 5, 4, Math.PI, 0);
  ctx.lineTo(x + 8, y + 15);
  ctx.fill();
  ctx.restore();
};

export class HUD {
  draw(ctx, gameState = {}) {
    const width = ctx.canvas.width;
    const hearts = Math.max(0, Number(gameState.hearts ?? gameState.lives ?? 0));
    const maxHearts = Math.max(hearts, Number(gameState.maxHearts ?? 3));
    const score = Math.max(0, Number(gameState.score) || 0);
    const coins = Math.max(0, Number(gameState.coins) || 0);
    const combo = Math.max(
      1,
      Number(gameState.comboMultiplier ?? gameState.coinCombo ?? gameState.multiplier ?? 1),
    );
    const checkpoint = gameState.checkpoint ?? "START";

    ctx.save();
    ctx.textBaseline = "middle";
    ctx.font = "900 15px monospace";
    ctx.lineJoin = "round";

    this.drawPanel(ctx, 16, 16, 220, 58);
    this.drawLabel(ctx, "SCORE", 28, 32, "#9da8d3");
    this.drawValue(ctx, score.toString().padStart(6, "0"), 28, 54, "#ffffff");

    this.drawPanel(ctx, 246, 16, 150, 58);
    this.drawCoinIcon(ctx, 262, 45);
    this.drawValue(ctx, coins.toString().padStart(2, "0"), 282, 42, "#ffe36e");
    if (combo > 1) this.drawPill(ctx, `x${combo}`, 326, 27, "#ff9c66");
    this.drawLabel(ctx, "COINS", 282, 62, "#9da8d3");

    this.drawPanel(ctx, width - 226, 16, 210, 58);
    this.drawLabel(ctx, "TIME", width - 211, 32, "#9da8d3");
    this.drawValue(ctx, formatTimer(gameState.timer), width - 211, 54, "#ffffff");
    this.drawLabel(ctx, "CHECKPOINT", width - 114, 32, "#9da8d3");
    this.drawValue(ctx, String(checkpoint).toUpperCase(), width - 114, 54, "#70f0bb");

    this.drawPanel(ctx, 16, 84, 122, 34);
    this.drawLabel(ctx, "HEARTS", 28, 101, "#9da8d3");
    for (let index = 0; index < maxHearts; index += 1) {
      drawHeart(ctx, 84 + index * 13, 92, index < hearts);
    }
    ctx.restore();
  }

  drawPanel(ctx, x, y, width, height) {
    ctx.save();
    ctx.fillStyle = "rgba(22, 28, 60, 0.88)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 2;
    roundedRect(ctx, x, y, width, height, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawLabel(ctx, text, x, y, color) {
    ctx.save();
    ctx.font = "700 10px monospace";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  drawValue(ctx, text, x, y, color) {
    ctx.save();
    ctx.font = "900 16px monospace";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  drawPill(ctx, text, x, y, color) {
    ctx.save();
    ctx.font = "900 11px monospace";
    const width = ctx.measureText(text).width + 10;
    ctx.fillStyle = color;
    roundedRect(ctx, x, y, width, 18, 6);
    ctx.fill();
    ctx.fillStyle = "#20243c";
    ctx.fillText(text, x + 5, y + 9);
    ctx.restore();
  }

  drawCoinIcon(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = "#ffe36e";
    ctx.strokeStyle = "#a6632a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff4a8";
    ctx.fillRect(x - 1, y - 5, 2, 10);
    ctx.restore();
  }
}

export { formatTimer };
