import { Game } from "./core/Game.js";

const canvas = document.querySelector("#game-canvas");

if (!canvas) {
  throw new Error("Pixel Plumber Rush requires a canvas with id=game-canvas.");
}

const game = new Game(canvas);
game.start();
