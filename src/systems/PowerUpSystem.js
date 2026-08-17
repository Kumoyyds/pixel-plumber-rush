import { GAME_CONFIG } from "../config.js";
import { overlaps } from "../core/Physics.js";
import { Coin, PowerUp, POWER_UP_TYPES } from "../entities/PowerUp.js";

export class PowerUpSystem {
  constructor(powerUps = [], coins = [], mysteryBlocks = [], options = {}) {
    if (!Array.isArray(coins)) {
      options = coins ?? {};
      coins = [];
      mysteryBlocks = [];
    }
    if (!Array.isArray(mysteryBlocks)) {
      options = mysteryBlocks ?? {};
      mysteryBlocks = [];
    }
    this.powerUps = powerUps;
    this.coins = coins;
    this.mysteryBlocks = mysteryBlocks;
    this.score = 0;
    this.coinCount = 0;
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    this.random = options.random ?? Math.random;
  }

  update(dt, player, world) {
    this.updateTimers(dt, player);
    for (const powerUp of this.powerUps) {
      if (powerUp.active) powerUp.update(dt, world, player);
    }
    for (const coin of this.coins) {
      if (coin.active) coin.update(dt, world, player);
    }
    for (const block of this.mysteryBlocks) {
      if (!block.revealed) block.update(dt, world, player);
    }

    this.collectCoins(player);
    this.collectPowerUps(player);
    this.openMysteryBlocks(player);
    this.powerUps = this.powerUps.filter((powerUp) => powerUp.active);
    this.coins = this.coins.filter((coin) => coin.active);
  }

  updateTimers(dt, player) {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.resetCombo();
    }

    if (player.rushTimer > 0) {
      player.rushTimer = Math.max(0, player.rushTimer - dt);
      if (player.rushTimer === 0) player.speedMultiplier = 1;
    }
    if (player.timeCrystalTimer > 0) {
      player.timeCrystalTimer = Math.max(0, player.timeCrystalTimer - dt);
      if (player.timeCrystalTimer === 0) {
        player.enemyTimeScale = 1;
        player.hazardTimeScale = 1;
      }
    }
    if (player.invulnerabilityTimer > 0) {
      player.invulnerabilityTimer = Math.max(0, player.invulnerabilityTimer - dt);
    }
  }

  collectCoins(player) {
    for (const coin of this.coins) {
      if (!coin.active || !overlaps(player, coin)) continue;
      coin.active = false;
      this.collectCoin(coin);
    }
  }

  collectCoin(coin = new Coin()) {
    this.coinCount += 1;
    this.comboCount = this.comboTimer > 0 ? this.comboCount + 1 : 1;
    this.comboMultiplier = 2 ** Math.min(this.comboCount - 1, 3);
    this.comboTimer = GAME_CONFIG.powerUps.comboWindow;
    this.score += coin.value * this.comboMultiplier;
  }

  resetCombo() {
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
  }

  collectPowerUps(player) {
    for (const powerUp of this.powerUps) {
      if (!powerUp.active || !overlaps(player, powerUp)) continue;
      powerUp.active = false;
      this.applyPowerUp(powerUp.type, player);
    }
  }

  applyPowerUp(type, player) {
    if (type === POWER_UP_TYPES.SHIELD) {
      player.hasShield = true;
      player.shieldActive = true;
    } else if (type === POWER_UP_TYPES.RUSH) {
      player.rushTimer = Math.max(player.rushTimer ?? 0, GAME_CONFIG.powerUps.rushDuration);
      player.speedMultiplier = GAME_CONFIG.powerUps.rushSpeedMultiplier;
    } else if (type === POWER_UP_TYPES.TIME) {
      player.timeCrystalTimer = Math.max(player.timeCrystalTimer ?? 0, GAME_CONFIG.powerUps.timeCrystalDuration);
      player.enemyTimeScale = GAME_CONFIG.powerUps.timeCrystalScale;
      player.hazardTimeScale = GAME_CONFIG.powerUps.timeCrystalScale;
    }
  }

  openMysteryBlocks(player) {
    for (const block of this.mysteryBlocks) {
      if (!block.active || !overlaps(player, block)) continue;
      if (!block.reveal()) continue;
      const reward = block.reward ?? this.randomReward();
      if (reward === "coin") {
        this.coins.push(new Coin(block.x + 8, block.y - 20));
      } else {
        const type = reward === "power-up" ? this.randomPowerUpType() : reward;
        this.powerUps.push(new PowerUp(block.x + 5, block.y - 24, type));
      }
    }
  }

  randomReward() {
    return this.random() < 0.5 ? "coin" : "power-up";
  }

  randomPowerUpType() {
    const types = [POWER_UP_TYPES.SHIELD, POWER_UP_TYPES.RUSH, POWER_UP_TYPES.TIME];
    return types[Math.floor(this.random() * types.length)];
  }

  addCoin(coin) {
    this.coins.push(coin);
    return coin;
  }

  addPowerUp(powerUp) {
    this.powerUps.push(powerUp);
    return powerUp;
  }

  addMysteryBlock(block) {
    this.mysteryBlocks.push(block);
    return block;
  }

  draw(ctx, camera) {
    for (const block of this.mysteryBlocks) block.draw(ctx, camera);
    for (const coin of this.coins) coin.draw(ctx, camera);
    for (const powerUp of this.powerUps) powerUp.draw(ctx, camera);
  }

  getState() {
    return {
      score: this.score,
      coins: this.coinCount,
      combo: this.comboCount,
      comboMultiplier: this.comboMultiplier,
      comboTimer: Math.max(0, this.comboTimer),
    };
  }
}
