import { overlaps } from "../core/Physics.js";

export class EnemySystem {
  constructor(enemies = [], options = {}) {
    this.enemies = enemies;
    this.score = 0;
    this.onEnemyDefeated = options.onEnemyDefeated ?? null;
    this.onPlayerDamaged = options.onPlayerDamaged ?? null;
  }

  update(dt, player, world) {
    const timeScale = player.enemyTimeScale ?? player.hazardTimeScale ?? 1;
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      enemy.update(dt, world, player, timeScale);
      this.resolvePlayerCollision(enemy, player);
    }
    this.enemies = this.enemies.filter((enemy) => enemy.active);
  }

  add(enemy) {
    this.enemies.push(enemy);
    return enemy;
  }

  resolvePlayerCollision(enemy, player) {
    if (!overlaps(enemy, player)) return;

    const groundPound = player.groundPoundActive || player.groundPoundImpact || player.isGroundPounding;
    if (groundPound && enemy.isNormal !== false) {
      this.defeat(enemy, "ground-pound");
      return;
    }

    const playerIsFalling = player.velocityY >= 0;
    const playerBottom = player.y + player.height;
    const enemyTopHalf = enemy.y + enemy.height * 0.55;
    if (playerIsFalling && playerBottom <= enemyTopHalf) {
      this.defeat(enemy, "stomp");
      player.velocityY = -Math.max(260, Math.abs(player.velocityY) * 0.45);
      player.onGround = false;
      return;
    }

    this.damagePlayer(player, enemy);
  }

  defeat(enemy, method = "stomp") {
    if (!enemy.defeat()) return false;
    this.score += method === "ground-pound" ? 200 : 100;
    this.onEnemyDefeated?.(enemy, method);
    return true;
  }

  damagePlayer(player, enemy) {
    if ((player.invulnerabilityTimer ?? 0) > 0) return false;
    const result = typeof player.takeDamage === "function"
      ? player.takeDamage(1)
      : this.applyFallbackDamage(player);
    if (result !== false) this.onPlayerDamaged?.(player, enemy, result);
    return result !== false;
  }

  applyFallbackDamage(player) {
    if (player.hasShield || player.shieldActive) {
      player.hasShield = false;
      player.shieldActive = false;
      return { absorbed: true };
    }
    player.lives = Math.max(0, (player.lives ?? 3) - 1);
    player.invulnerabilityTimer = 0.8;
    return { absorbed: false };
  }

  draw(ctx, camera) {
    for (const enemy of this.enemies) enemy.draw(ctx, camera);
  }
}
