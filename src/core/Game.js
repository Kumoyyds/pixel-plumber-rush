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
    this.lastTime = 0;
    this.running = false;
    this.boundFrame = (time) => this.frame(time);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.input.attach();
    requestAnimationFrame(this.boundFrame);
  }

  stop() {
    this.running = false;
    this.input.detach();
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
    this.player.update(dt, this.world, this.input);
    this.world.update(dt);
    this.enemySystem.update(dt, this.player, this.world);
    this.powerUpSystem.update(dt, this.player, this.world);
    this.effectSystem.update(dt);
    this.audioSystem.update(dt);
    this.camera.follow(this.player, this.world.width);
  }

  draw() {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.world.draw(ctx, this.camera);
    this.enemySystem.draw(ctx, this.camera);
    this.powerUpSystem.draw(ctx, this.camera);
    this.effectSystem.draw(ctx, this.camera);
    this.player.draw(ctx, this.camera);
    this.hud.draw(ctx, this.getState());
    this.menu.draw(ctx, this.getState());
  }

  getState() {
    return {
      score: 0,
      lives: 3,
      player: this.player,
      paused: false,
    };
  }
}
