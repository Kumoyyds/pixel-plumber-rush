export class EnemySystem {
  constructor(enemies = []) {
    this.enemies = enemies;
  }

  update(dt, player, world) {
    for (const enemy of this.enemies) enemy.update(dt, world, player);
  }

  draw(ctx, camera) {
    for (const enemy of this.enemies) enemy.draw(ctx, camera);
  }
}
