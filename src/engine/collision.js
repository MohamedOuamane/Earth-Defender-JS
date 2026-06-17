import { updateScore, updateLives } from "../ui/gameHud.js";
export function handleCollisions(engine) {
  const entities = engine.entities;

  // BULLET COLLISIONS
  for (const bullet of entities) {
    if (!bullet) continue;

    if (bullet.dead) continue;

    if (bullet.type !== "bullet") continue;

    for (const target of entities) {
      if (!target) continue;

      if (target.dead) continue;

      if (target === bullet) continue;

      if (target.type === "alienSwarm") continue;

      if (!canBulletHit(bullet, target)) continue;

      if (!intersects(bullet, target)) continue;

      if (target.type === "bullet") {
        if (!bullet.isLaser && bullet.owner !== "boss") {
          bullet.dead = true;
        }
        if (!target.isLaser && target.owner !== "boss") {
          target.dead = true;
        }
      } else {
        if (!bullet.isLaser) {
          bullet.dead = true;
        }

        if (target.type === "player") {
          if (engine.isPlayerHit) continue;

          engine.playerDeathSequence();
        } else if (target.type === "boss") {
          target.lives -= 1;
          if (target.lives <= 0) {
            target.dead = true;
            if (target.laserBullet) {
              target.laserBullet.dead = true;
            }
            engine.score += 500; // Add boss score
            if (typeof engine.spawnExplosion === "function") {
              engine.spawnExplosion(target.x, target.y);
            }
            if (typeof engine.handleBossDefeated === "function") {
              engine.handleBossDefeated();
              return;
            }
          }
        } else {
          if (!target.isLaser) {
            target.dead = true;
          }

          if (
            target.type === "alien" &&
            typeof engine.spawnExplosion === "function"
          ) {
            engine.spawnExplosion(target.x, target.y);
          }
        }
      }

      if (bullet === engine.playerBullet && bullet.dead) {
        engine.playerBullet = null;
      }

      if (target.type === "alien") {
        engine.score += target.score;
        updateScore(engine.score);
      }

      break;
    }
  }

  // LOSE CONDITION
  for (const entity of entities) {
    if (!entity) continue;

    if (entity.dead) continue;

    if (entity.type !== "alien") continue;

    if (entity.y >= engine.loseLine) {
      engine.showGameOver();

      engine.stop();

      break;
    }
  }
}
function canBulletHit(bullet, target) {
  if (target.type === "alienSwarm") return false;

  // bullet vs bullet
  if (target.type === "bullet") {
    return true;
  }

  // player bullets hit aliens or boss
  if (
    bullet.owner === "player" &&
    (target.type === "alien" || target.type === "boss")
  ) {
    return true;
  }

  // alien and boss bullets hit player
  if (
    (bullet.owner === "alien" || bullet.owner === "boss") &&
    target.type === "player"
  ) {
    return true;
  }

  return false;
}

function intersects(a, b) {
  if (!a.width || !a.height || !b.width || !b.height) {
    return false;
  }

  const aLeft = a.x - a.width / 2;
  const aRight = a.x + a.width / 2;
  const aTop = a.y - a.height / 2;
  const aBottom = a.y + a.height / 2;

  const bLeft = b.x - b.width / 2;
  const bRight = b.x + b.width / 2;
  const bTop = b.y - b.height / 2;
  const bBottom = b.y + b.height / 2;

  return !(
    aRight < bLeft ||
    aLeft > bRight ||
    aBottom < bTop ||
    aTop > bBottom
  );
}
