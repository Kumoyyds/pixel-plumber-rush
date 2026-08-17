export const GAME_CONFIG = Object.freeze({
  canvasWidth: 960,
  canvasHeight: 540,
  worldWidth: 2400,
  gravity: 1800,
  maxDeltaTime: 1 / 30,
  player: Object.freeze({
    width: 28,
    height: 40,
    moveSpeed: 260,
    jumpVelocity: 650,
  }),
  colors: Object.freeze({
    sky: "#80c8e8",
    cloud: "#dff6ff",
    ground: "#4b8b42",
    groundTop: "#79c955",
    player: "#e94f37",
    playerAccent: "#f5d04c",
  }),
});
