const TAU = Math.PI * 2;

const randomBetween = (min, max) => min + Math.random() * (max - min);

const normalizePoint = (x, y) => ({
  x: Number.isFinite(x) ? x : 0,
  y: Number.isFinite(y) ? y : 0,
});

class ParticleEffect {
  constructor(particles, options = {}) {
    this.particles = particles;
    this.gravity = options.gravity ?? 0;
    this.drag = options.drag ?? 1;
    this.fade = options.fade ?? true;
    this.finished = false;
  }

  update(dt) {
    let alive = false;
    for (const particle of this.particles) {
      if (particle.life <= 0) continue;
      alive = true;
      particle.life -= dt;
      particle.x += particle.velocityX * dt;
      particle.y += particle.velocityY * dt;
      particle.velocityY += this.gravity * dt;
      particle.velocityX *= Math.pow(this.drag, dt * 60);
      particle.rotation += particle.spin * dt;
    }
    this.finished = !alive;
  }

  draw(ctx, camera) {
    for (const particle of this.particles) {
      if (particle.life <= 0) continue;
      const position = camera.toScreen(particle.x, particle.y);
      const alpha = this.fade ? Math.min(1, particle.life / particle.maxLife) : 1;
      ctx.save();
      ctx.globalAlpha = alpha * (particle.alpha ?? 1);
      ctx.fillStyle = particle.color;
      ctx.translate(position.x, position.y);
      ctx.rotate(particle.rotation);
      if (particle.shape === "diamond") {
        ctx.beginPath();
        ctx.moveTo(0, -particle.size);
        ctx.lineTo(particle.size * 0.7, 0);
        ctx.lineTo(0, particle.size);
        ctx.lineTo(-particle.size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      }
      ctx.restore();
    }
  }
}

class FloatingTextEffect {
  constructor(x, y, text, color = "#fff4a8") {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = 0.85;
    this.maxLife = this.life;
    this.finished = false;
  }

  update(dt) {
    this.life -= dt;
    this.y -= 34 * dt;
    this.finished = this.life <= 0;
  }

  draw(ctx, camera) {
    if (this.finished) return;
    const position = camera.toScreen(this.x, this.y);
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.life / 0.2, (this.maxLife - this.life) / 0.12 + 0.1);
    ctx.font = "900 16px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#20243c";
    ctx.strokeText(this.text, position.x, position.y);
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, position.x, position.y);
    ctx.restore();
  }
}

class RingEffect {
  constructor(x, y, color = "#fff4a8", maxRadius = 42) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = 4;
    this.maxRadius = maxRadius;
    this.life = 0.4;
    this.maxLife = this.life;
    this.finished = false;
  }

  update(dt) {
    this.life -= dt;
    this.radius += (this.maxRadius / this.maxLife) * dt;
    this.finished = this.life <= 0;
  }

  draw(ctx, camera) {
    if (this.finished) return;
    const position = camera.toScreen(this.x, this.y);
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(position.x, position.y, this.radius, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
}

export class EffectSystem {
  constructor(effects = []) {
    this.effects = effects;
    this.cameraShakeTime = 0;
    this.cameraShakeStrength = 0;
    this.cameraOffset = { x: 0, y: 0 };
    this.hitFlashTime = 0;
    this.hitFlashColor = "#ffffff";
    this.freezeTime = 0;
    this.slowMotionTime = 0;
    this.slowMotionFactor = 1;
  }

  update(dt) {
    const safeDt = Math.max(0, Math.min(dt || 0, 0.1));
    const visualDt = safeDt * this.getTimeScale();

    if (this.freezeTime > 0) {
      this.freezeTime = Math.max(0, this.freezeTime - safeDt);
    } else {
      for (const effect of this.effects) effect.update?.(visualDt);
      this.effects = this.effects.filter((effect) => !effect.finished);
    }

    this.cameraShakeTime = Math.max(0, this.cameraShakeTime - safeDt);
    this.hitFlashTime = Math.max(0, this.hitFlashTime - safeDt);
    this.slowMotionTime = Math.max(0, this.slowMotionTime - safeDt);
    if (this.cameraShakeTime === 0) {
      this.cameraOffset.x = 0;
      this.cameraOffset.y = 0;
    } else {
      const strength = this.cameraShakeStrength * (this.cameraShakeTime / 0.24);
      this.cameraOffset.x = randomBetween(-strength, strength);
      this.cameraOffset.y = randomBetween(-strength, strength);
    }
  }

  draw(ctx, camera) {
    for (const effect of this.effects) effect.draw?.(ctx, camera);
  }

  drawOverlay(ctx, width, height) {
    if (this.hitFlashTime <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(0.5, this.hitFlashTime * 3.5);
    ctx.fillStyle = this.hitFlashColor;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  getCameraOffset() {
    return { ...this.cameraOffset };
  }

  getTimeScale() {
    return this.slowMotionTime > 0 ? this.slowMotionFactor : 1;
  }

  shake(strength = 5, duration = 0.24) {
    this.cameraShakeStrength = Math.max(this.cameraShakeStrength, strength);
    this.cameraShakeTime = Math.max(this.cameraShakeTime, duration);
  }

  hitFlash(duration = 0.12, color = "#ffffff") {
    this.hitFlashTime = Math.max(this.hitFlashTime, duration);
    this.hitFlashColor = color;
  }

  freezeFrame(duration = 0.07) {
    this.freezeTime = Math.max(this.freezeTime, duration);
  }

  slowMotion(duration = 1.15, factor = 0.35) {
    this.slowMotionTime = Math.max(this.slowMotionTime, duration);
    this.slowMotionFactor = Math.min(this.slowMotionFactor, Math.max(0.1, factor));
  }

  add(effect) {
    if (effect) this.effects.push(effect);
    return effect;
  }

  spawnLandingDust(x, y, scale = 1) {
    const point = normalizePoint(x, y);
    const particles = Array.from({ length: 8 }, () => ({
      x: point.x + randomBetween(-12, 12) * scale,
      y: point.y + randomBetween(-2, 3) * scale,
      velocityX: randomBetween(-90, 90) * scale,
      velocityY: randomBetween(-80, -25) * scale,
      size: randomBetween(3, 7) * scale,
      color: randomBetween(0, 1) > 0.45 ? "#f4d7a1" : "#fff3c4",
      life: randomBetween(0.25, 0.45),
      maxLife: 0.45,
      rotation: randomBetween(0, TAU),
      spin: randomBetween(-4, 4),
      shape: "diamond",
    }));
    this.add(new ParticleEffect(particles, { gravity: 220, drag: 0.86 }));
    this.shake(2.5, 0.12);
  }

  spawnCoinParticles(x, y, value = 100) {
    const point = normalizePoint(x, y);
    const particles = Array.from({ length: 12 }, () => ({
      x: point.x,
      y: point.y,
      velocityX: randomBetween(-100, 100),
      velocityY: randomBetween(-170, -55),
      size: randomBetween(3, 6),
      color: randomBetween(0, 1) > 0.25 ? "#ffe36e" : "#ffffff",
      life: randomBetween(0.45, 0.72),
      maxLife: 0.72,
      rotation: randomBetween(0, TAU),
      spin: randomBetween(-8, 8),
      shape: "diamond",
    }));
    this.add(new ParticleEffect(particles, { gravity: 380, drag: 0.9 }));
    this.add(new RingEffect(point.x, point.y, "#ffe36e", 30));
    this.add(new FloatingTextEffect(point.x, point.y - 16, `+${value}`, "#ffe36e"));
  }

  spawnEnemyStomp(x, y, points = 250, groundPound = false) {
    const point = normalizePoint(x, y);
    const particles = Array.from({ length: groundPound ? 22 : 13 }, () => ({
      x: point.x,
      y: point.y,
      velocityX: randomBetween(-180, 180) * (groundPound ? 1.2 : 1),
      velocityY: randomBetween(-210, -50),
      size: randomBetween(3, 7),
      color: randomBetween(0, 1) > 0.5 ? "#b879ff" : "#fff4a8",
      life: randomBetween(0.35, 0.68),
      maxLife: 0.68,
      rotation: randomBetween(0, TAU),
      spin: randomBetween(-10, 10),
      shape: "diamond",
    }));
    this.add(new ParticleEffect(particles, { gravity: 440, drag: 0.87 }));
    this.add(new RingEffect(point.x, point.y, "#d2a8ff", groundPound ? 70 : 44));
    this.add(new FloatingTextEffect(point.x, point.y - 24, `+${points}`, "#d2a8ff"));
    this.shake(groundPound ? 10 : 5, groundPound ? 0.34 : 0.2);
    this.hitFlash(groundPound ? 0.11 : 0.06, "#e5d4ff");
    this.freezeFrame(groundPound ? 0.16 : 0.07);
  }

  spawnDashTrail(x, y, facing = 1) {
    const point = normalizePoint(x, y);
    const particles = Array.from({ length: 3 }, (_, index) => ({
      x: point.x - facing * (index * 9 + randomBetween(2, 9)),
      y: point.y + randomBetween(5, 32),
      velocityX: -facing * randomBetween(10, 35),
      velocityY: randomBetween(-5, 5),
      size: randomBetween(5, 10),
      color: index === 0 ? "#ffffff" : "#7fe7ff",
      life: 0.18 + index * 0.04,
      maxLife: 0.3,
      rotation: 0,
      spin: 0,
      alpha: 0.7,
    }));
    this.add(new ParticleEffect(particles, { drag: 0.8 }));
  }

  spawnCheckpointBurst(x, y, label = "CHECKPOINT") {
    const point = normalizePoint(x, y);
    const particles = Array.from({ length: 20 }, () => {
      const angle = randomBetween(0, TAU);
      const speed = randomBetween(60, 170);
      return {
        x: point.x,
        y: point.y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size: randomBetween(3, 6),
        color: randomBetween(0, 1) > 0.3 ? "#70f0bb" : "#fff4a8",
        life: randomBetween(0.5, 0.9),
        maxLife: 0.9,
        rotation: randomBetween(0, TAU),
        spin: randomBetween(-6, 6),
        shape: "diamond",
      };
    });
    this.add(new ParticleEffect(particles, { gravity: 180, drag: 0.92 }));
    this.add(new RingEffect(point.x, point.y, "#70f0bb", 62));
    this.add(new FloatingTextEffect(point.x, point.y - 38, label, "#70f0bb"));
    this.shake(3, 0.18);
  }

  spawnVictoryConfetti(width = 960, height = 540) {
    const particles = Array.from({ length: 90 }, () => ({
      x: randomBetween(0, width),
      y: randomBetween(-height * 0.25, 0),
      velocityX: randomBetween(-45, 45),
      velocityY: randomBetween(80, 220),
      size: randomBetween(4, 9),
      color: ["#ff6b6b", "#ffe36e", "#70f0bb", "#7fe7ff", "#c29bff"][Math.floor(randomBetween(0, 5))],
      life: randomBetween(2.2, 3.8),
      maxLife: 3.8,
      rotation: randomBetween(0, TAU),
      spin: randomBetween(-8, 8),
    }));
    this.add(new ParticleEffect(particles, { gravity: 150, drag: 0.995, fade: false }));
    this.slowMotion(1.4, 0.4);
  }

  handle(event = {}) {
    const x = event.x ?? event.position?.x ?? 0;
    const y = event.y ?? event.position?.y ?? 0;
    switch (event.type) {
      case "land":
        this.spawnLandingDust(x, y, event.scale ?? 1);
        break;
      case "coin":
        this.spawnCoinParticles(x, y, event.value ?? 100);
        break;
      case "stomp":
        this.spawnEnemyStomp(x, y, event.points ?? 250, event.groundPound ?? false);
        break;
      case "dash":
        this.spawnDashTrail(x, y, event.facing ?? 1);
        break;
      case "checkpoint":
        this.spawnCheckpointBurst(x, y, event.label ?? "CHECKPOINT");
        break;
      case "victory":
        this.spawnVictoryConfetti(event.width ?? 960, event.height ?? 540);
        break;
      default:
        break;
    }
  }
}
