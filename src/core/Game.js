import { GAME_CONFIG } from "../config.js";
import { Camera } from "./Camera.js";
import { Input } from "./Input.js";
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
    this.enemySystem = new EnemySystem([
      new Walker(180, 432),
      new Walker(420, 342, { direction: -1 }),
      new Hopper(790, 282),
      new Charger(1410, 362),
    ]);
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
    this.powerUpSystem.update(dt, this.player, this.world);
    this.enemySystem.update(dt, this.player, this.world);
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
    const powerUpState = this.powerUpSystem.getState();
    return {
      score: powerUpState.score + this.enemySystem.score,
      coins: powerUpState.coins,
      combo: powerUpState.combo,
      comboMultiplier: powerUpState.comboMultiplier,
      lives: this.player.lives,
      player: this.player,
      paused: false,
    };
  }
}
