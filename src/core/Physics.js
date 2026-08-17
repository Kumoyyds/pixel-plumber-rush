export function moveAndCollide(body, dt, solidRects) {
  body.onGround = false;

  body.x += body.velocityX * dt;
  for (const rect of solidRects) {
    if (!overlaps(body, rect)) continue;
    if (body.velocityX > 0) body.x = rect.x - body.width;
    if (body.velocityX < 0) body.x = rect.x + rect.width;
    body.velocityX = 0;
  }

  body.y += body.velocityY * dt;
  for (const rect of solidRects) {
    if (!overlaps(body, rect)) continue;
    if (body.velocityY > 0) {
      body.y = rect.y - body.height;
      body.onGround = true;
    } else if (body.velocityY < 0) {
      body.y = rect.y + rect.height;
    }
    body.velocityY = 0;
  }
}

export function overlaps(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
