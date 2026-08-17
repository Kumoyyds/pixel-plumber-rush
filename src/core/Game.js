import { GAME_CONFIG } from "../config.js";
import { Camera } from "./Camera.js";
import { Input } from "./Input.js";
import { overlaps } from "./Physics.js";
import { World } from "../world/World.js";
import { Player } from "../entities/Player.js";
import { Charger, Hopper, Walker } from "../entities/Enemy.js";
import { Coin, MysteryBlock, PowerUp, POWER_UP_TYPES } from "../entities/PowerUp.js";
import { EnemySystem } from "../systems/EnemySystem.js";
import { PowerUpSystem } from "../systems/PowerUpSystem.js";
import { EffectSystem } from "../systems/EffectSystem.js";
import { AudioSystem } from "../systems/AudioSystem.js";
import { HUD } from "../ui/HUD.js";
import { Menu } from "../ui/Menu.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.input = new Input();
    this.camera = new Camera(canvas.width, canvas.height);
    this.world = new World();
    this.player = new Player(120, 300);
    this.state = this.createInitialState();
    this.effectSystem = new EffectSystem();
    this.audioSystem = new AudioSystem();
    this.enemySystem = new EnemySystem(
      [
        new Walker(180, 432),
        new Walker(420, 342, { direction: -1 }),
        new Hopper(790, 282),
        new Charger(1410, 362),
      ],
      {
        onEnemyDefeated: (enemy, method) => {
          this.registerStomp(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            method === "ground-pound" ? 200 : 100,
            method === "ground-pound",
          );
        },
        onPlayerDamaged: (_player, _enemy, result) => this.registerHurt(result),
      },
    );
    this.powerUpSystem = new PowerUpSystem(
      [
        new PowerUp(1080, 410, POWER_UP_TYPES.SHIELD),
        new PowerUp(1550, 340, POWER_UP_TYPES.RUSH),
        new PowerUp(1900, 285, POWER_UP_TYPES.TIME),
      ],
      [
        new Coin(240, 410),
        new Coin(270, 410),
        new Coin(300, 410),
        new Coin(440, 320),
        new Coin(800, 260),
        new Coin(1360, 340),
      ],
      [
        new MysteryBlock(620, 400),
        new MysteryBlock(1140, 400),
        new MysteryBlock(1720, 400),
      ],
    );
    this.hud = new HUD();
    this.menu = new Menu();
    this.lastTime = 0;
    this.running = false;
    this.boundFrame = (time) => this.frame(time);
    this.boundPointerDown = (event) => this.handlePointerDown(event);
  }

  createInitialState() {
    return {
      score: 0,
      coins: 0,
      coinCombo: 1,
      hearts: 3,
      maxHearts: 3,
      timer: 0,
      checkpoint: "START",
      checkpointX: 120,
      checkpointY: 300,
      screen: "title",
    };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.input.attach();
    this.canvas.addEventListener("pointerdown", this.boundPointerDown);
    requestAnimationFrame(this.boundFrame);
  }

  stop() {
    this.running = false;
    this.input.detach();
    this.canvas.removeEventListener("pointerdown", this.boundPointerDown);
  }

  frame(time) {
    if (!this.running) return;

    const rawDelta = this.lastTime === 0 ? 0 : (time - this.lastTime) / 1000;
    const dt = Math.min(rawDelta, GAME_CONFIG.maxDeltaTime);
    this.lastTime = time;

    this.update(dt);
    this.draw();
    requestAnimationFrame(this.boundFrame);
  }

  update(dt) {
    if (this.handleMenuInput()) {
      this.effectSystem.update(dt);
      this.audioSystem.update(dt);
      this.input.endFrame();
      return;
    }

    if (this.state.screen !== "playing") {
      this.effectSystem.update(dt);
      this.audioSystem.update(dt);
      this.input.endFrame();
      return;
    }

    this.state.timer += dt;
    const wasOnGround = this.player.onGround;
    const wasDashing = this.player.dashTimer > 0;
    this.player.update(dt, this.world, this.input);
    this.world.update(dt);

    if (!wasOnGround && this.player.onGround) {
      this.registerLanding(this.player.x + this.player.width / 2, this.player.y + this.player.height);
    }
    if (wasOnGround && !this.player.onGround && this.player.velocityY < 0) {
      this.audioSystem.play("jump");
    }
    if (!wasDashing && this.player.dashTimer > 0) {
      this.registerDash(this.player.x, this.player.y, this.player.facing);
    }
    if (this.player.groundPoundImpact) {
      this.effectSystem.handle({
        type: "stomp",
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height,
        points: 0,
        groundPound: true,
      });
      this.audioSystem.play("stomp");
    }

    this.powerUpSystem.update(dt, this.player, this.world);
    this.enemySystem.update(dt, this.player, this.world);
    this.handleWorldInteractions();
    this.effectSystem.update(dt);
    this.audioSystem.update(dt);
    this.camera.follow(this.player, this.world.width, this.world.height);
  }

  handleWorldInteractions() {
    for (const checkpoint of this.world.getCheckpoints()) {
      if (!overlaps(this.player, checkpoint) || this.state.checkpoint === checkpoint.label) continue;
      this.setCheckpoint(checkpoint.label, checkpoint.x, checkpoint.y);
    }

    for (const hazard of this.world.getHazards()) {
      if (!overlaps(this.player, hazard)) continue;
      const result = this.player.takeDamage(1);
      if (result !== false) {
        this.registerHurt(result);
        if (this.state.screen === "playing" && !result.absorbed) this.respawnPlayer();
      }
      break;
    }

    const finishGate = this.world.getFinishGate();
    if (this.state.screen === "playing" && overlaps(this.player, finishGate)) {
      this.showVictory();
    }
  }

  handleMenuInput() {
    const screen = this.state.screen;
    if (screen === "playing") {
      if (this.input.wasPressed("Escape", "KeyP")) {
        this.state.screen = "pause";
        this.audioSystem.play("checkpoint");
        return true;
      }
      return false;
    }

    if (screen === "title" && this.input.wasPressed("Enter", "Space", "ArrowUp")) {
      this.startRun();
      return true;
    }
    if (screen === "instructions" && this.input.wasPressed("Escape", "Enter", "Space")) {
      this.state.screen = "title";
      return true;
    }
    if (screen === "pause" && this.input.wasPressed("Escape", "KeyP", "Enter", "Space")) {
      this.state.screen = "playing";
      return true;
    }
    if ((screen === "game-over" || screen === "victory") && this.input.wasPressed("KeyR", "Enter", "Space")) {
      this.restartRun();
      return true;
    }
    return false;
  }

  handlePointerDown(event) {
    const bounds = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / bounds.width;
    const scaleY = this.canvas.height / bounds.height;
    const action = this.menu.handlePointer(
      (event.clientX - bounds.left) * scaleX,
      (event.clientY - bounds.top) * scaleY,
    );
    if (action) this.handleMenuAction(action);
  }

  handleMenuAction(action) {
    if (action === "start" || action === "resume") {
      this.startRun();
    } else if (action === "restart") {
      this.restartRun();
    } else if (action === "instructions") {
      this.state.screen = "instructions";
      this.audioSystem.enable();
    } else if (action === "back") {
      this.state.screen = "title";
    }
  }

  startRun() {
    this.audioSystem.enable();
    this.state.screen = "playing";
    this.audioSystem.play("jump");
  }

  restartRun() {
    this.state = this.createInitialState();
    this.state.screen = "playing";
    this.resetPlayer();
    this.camera.x = 0;
    this.camera.y = 0;
    this.audioSystem.enable();
    this.audioSystem.play("checkpoint");
  }

  resetPlayer() {
    this.player.x = this.state.checkpointX;
    this.player.y = this.state.checkpointY;
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    this.player.onGround = false;
    this.player.facing = 1;
    this.player.speedMultiplier = 1;
    this.player.groundPoundActive = false;
    this.player.groundPoundImpact = false;
    this.player.lives = this.state.hearts;
    this.player.invulnerabilityTimer = 0.8;
    this.player.hasShield = false;
    this.player.shieldActive = false;
    this.player.rushTimer = 0;
    this.player.timeCrystalTimer = 0;
    this.player.enemyTimeScale = 1;
    this.player.hazardTimeScale = 1;
    this.player.coyoteTimer = 0;
    this.player.jumpBufferTimer = 0;
    this.player.dashTimer = 0;
    this.player.dashCooldownTimer = 0;
    this.player.groundPoundTimer = 0;
  }

  respawnPlayer() {
    this.resetPlayer();
    this.effectSystem.hitFlash(0.14, "#ff6b6b");
  }

  collectCoin(x, y, value = 100) {
    const multiplier = this.state.coinCombo;
    this.state.coins += 1;
    this.state.coinCombo = Math.min(9, this.state.coinCombo + 1);
    this.state.score += value * multiplier;
    this.effectSystem.handle({ type: "coin", x, y, value: value * multiplier });
    this.audioSystem.play("coin");
  }

  setCheckpoint(label, x, y) {
    this.state.checkpoint = String(label || "CHECKPOINT").toUpperCase();
    this.state.checkpointX = x;
    this.state.checkpointY = y - this.player.height;
    this.effectSystem.handle({ type: "checkpoint", x, y, label: this.state.checkpoint });
    this.audioSystem.play("checkpoint");
  }

  registerLanding(x, y, scale = 1) {
    this.effectSystem.handle({ type: "land", x, y, scale });
  }

  registerDash(x, y, facing = 1) {
    this.effectSystem.handle({ type: "dash", x, y, facing });
  }

  registerStomp(x, y, points = 250, groundPound = false) {
    this.effectSystem.handle({ type: "stomp", x, y, points, groundPound });
    this.audioSystem.play("stomp");
  }

  registerHurt(result = {}) {
    this.state.hearts = this.player.lives;
    this.state.coinCombo = 1;
    this.effectSystem.hitFlash(0.2, "#ff6b6b");
    this.effectSystem.shake(8, 0.28);
    this.audioSystem.play(result.absorbed ? "checkpoint" : "hurt");
    if (this.state.hearts === 0) this.showGameOver();
  }

  showGameOver() {
    this.state.screen = "game-over";
    this.effectSystem.hitFlash(0.18, "#ff6b6b");
  }

  showVictory() {
    if (this.state.screen === "victory") return;
    this.state.screen = "victory";
    this.effectSystem.handle({
      type: "victory",
      width: this.canvas.width,
      height: this.canvas.height,
    });
    this.audioSystem.playVictory();
  }

  draw() {
    const { ctx } = this;
    const offset = this.effectSystem.getCameraOffset();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    this.world.draw(ctx, this.camera);
    this.enemySystem.draw(ctx, this.camera);
    this.powerUpSystem.draw(ctx, this.camera);
    this.effectSystem.draw(ctx, this.camera);
    this.player.draw(ctx, this.camera);
    ctx.restore();
    this.effectSystem.drawOverlay(ctx, this.canvas.width, this.canvas.height);
    const gameState = this.getState();
    this.hud.draw(ctx, gameState);
    this.menu.draw(ctx, gameState);
  }

  getState() {
    const powerUpState = this.powerUpSystem.getState();
    return {
      ...this.state,
      score: powerUpState.score + this.enemySystem.score + this.state.score,
      coins: powerUpState.coins + this.state.coins,
      combo: powerUpState.combo,
      comboMultiplier: powerUpState.comboMultiplier,
      lives: this.player.lives,
      hearts: this.player.lives,
      paused: this.state.screen === "pause",
      player: this.player,
    };
  }
}
