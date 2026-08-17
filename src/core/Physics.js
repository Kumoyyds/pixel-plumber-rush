export function moveAndCollide(body, dt, solidRects) {
  const wasOnGround = Boolean(body.onGround);
  const result = {
    landed: false,
    hitCeiling: false,
    hitWall: false,
  };

  body.onGround = false;

  const startX = body.x;
  const deltaX = body.velocityX * dt;
  body.x += deltaX;
  for (const rect of solidRects) {
    const crossesRight =
      deltaX > 0 &&
      startX + body.width <= rect.x &&
      body.x + body.width >= rect.x &&
      body.y < rect.y + rect.height &&
      body.y + body.height > rect.y;
    const crossesLeft =
      deltaX < 0 &&
      startX >= rect.x + rect.width &&
      body.x <= rect.x + rect.width &&
      body.y < rect.y + rect.height &&
      body.y + body.height > rect.y;

    if (!overlaps(body, rect) && !crossesRight && !crossesLeft) continue;
    if (body.velocityX > 0) body.x = rect.x - body.width;
    if (body.velocityX < 0) body.x = rect.x + rect.width;
    body.velocityX = 0;
    result.hitWall = true;
  }

  const startY = body.y;
  const deltaY = body.velocityY * dt;
  body.y += deltaY;
  for (const rect of solidRects) {
    const crossesTop =
      deltaY > 0 &&
      startY + body.height <= rect.y &&
      body.y + body.height >= rect.y &&
      body.x < rect.x + rect.width &&
      body.x + body.width > rect.x;
    const crossesBottom =
      deltaY < 0 &&
      startY >= rect.y + rect.height &&
      body.y <= rect.y + rect.height &&
      body.x < rect.x + rect.width &&
      body.x + body.width > rect.x;

    if (!overlaps(body, rect) && !crossesTop && !crossesBottom) continue;
    if (body.velocityY > 0) {
      body.y = rect.y - body.height;
      body.onGround = true;
      result.landed = !wasOnGround;
    } else if (body.velocityY < 0) {
      body.y = rect.y + rect.height;
      result.hitCeiling = true;
    }
    body.velocityY = 0;
  }

  return result;
}

export function overlaps(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
