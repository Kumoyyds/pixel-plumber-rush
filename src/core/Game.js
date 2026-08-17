import { GAME_CONFIG } from "../config.js";
import { Camera } from "./Camera.js";
import { Input } from "./Input.js";
import { World } from "../world/World.js";
import { Player } from "../entities/Player.js";
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
    this.enemySystem = new EnemySystem();
    this.powerUpSystem = new PowerUpSystem();
    this.effectSystem = new EffectSystem();
    this.audioSystem = new AudioSystem();
    this.hud = new HUD();
    this.menu = new Menu();
    this.state = this.createInitialState();
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
    this.player.update(dt, this.world, this.input);
    this.world.update(dt);
    this.enemySystem.update(dt, this.player, this.world);
    this.powerUpSystem.update(dt, this.player, this.world);
    this.effectSystem.update(dt);
    this.audioSystem.update(dt);
    this.camera.follow(this.player, this.world.width);
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
    this.player.x = 120;
    this.player.y = 300;
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    this.player.onGround = false;
    this.camera.x = 0;
    this.audioSystem.enable();
    this.audioSystem.play("checkpoint");
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
    this.state.score += points;
    this.effectSystem.handle({ type: "stomp", x, y, points, groundPound });
    this.audioSystem.play("stomp");
  }

  registerHurt() {
    this.state.hearts = Math.max(0, this.state.hearts - 1);
    this.state.coinCombo = 1;
    this.effectSystem.hitFlash(0.2, "#ff6b6b");
    this.effectSystem.shake(8, 0.28);
    this.audioSystem.play("hurt");
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
    this.hud.draw(ctx, this.getState());
    this.menu.draw(ctx, this.getState());
  }

  getState() {
    return {
      ...this.state,
      lives: this.state.hearts,
      paused: this.state.screen === "pause",
      player: this.player,
    };
  }
}
