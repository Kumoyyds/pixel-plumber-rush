export class EffectSystem {
  constructor(effects = []) {
    this.effects = effects;
  }

  update(dt) {
    for (const effect of this.effects) effect.update?.(dt);
    this.effects = this.effects.filter((effect) => !effect.finished);
  }

  draw(ctx, camera) {
    for (const effect of this.effects) effect.draw?.(ctx, camera);
  }
}
