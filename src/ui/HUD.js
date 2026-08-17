export class HUD {
  draw(ctx, gameState) {
    ctx.save();
    ctx.fillStyle = "#20243c";
    ctx.font = "bold 18px monospace";
    ctx.fillText(`SCORE ${String(gameState.score).padStart(5, "0")}`, 20, 30);
    ctx.fillText(`LIVES ${gameState.lives}`, 20, 54);
    ctx.restore();
  }
}
