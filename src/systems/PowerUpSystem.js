export class PowerUpSystem {
  constructor(powerUps = []) {
    this.powerUps = powerUps;
  }

  update(dt, player, world) {
    for (const powerUp of this.powerUps) powerUp.update(dt, world, player);
  }

  draw(ctx, camera) {
    for (const powerUp of this.powerUps) powerUp.draw(ctx, camera);
  }
}
