import {
  createPlayer,
  createAlienSwarmController,
  createAliensFromTileMap,
} from "../entities/entities.js";
import { GAME_STATES } from "./gamestate.js";
import { showVictory } from "../ui/gameUI.js";
import { updateLives, updateScore } from "../ui/gameHud.js";
import { STORY_LEVELS, LEVEL_INFINITE, BOSS_LEVEL_INDEX } from "../levels/levels.js";
import { pauseBackgroundMusic } from "../music/audioManager.js";

export function getCurrentLevelMap(engine) {
  if (engine.mode === "story") {
    return STORY_LEVELS[engine.storyLevelIndex] ?? STORY_LEVELS[0];
  }

  return LEVEL_INFINITE;
}

export function getCurrentLevelOptions(engine) {
  if (engine.mode !== "infinite") return {};

  const d = engine.infiniteDifficulty;

  return {
    leftOffset: Math.max(0.04, 0.1 - d * 0.003),

    topOffset: Math.min(0.28, 0.1 + d * 0.012),

    columnSpacing: Math.max(0.045, 0.07 - d * 0.0015),

    rowSpacing: Math.max(0.04, 0.07 - d * 0.002),
  };
}

export function configureSwarm(swarm, engine) {
  swarm.baseSpeedX = swarm.baseSpeedX ?? swarm.speedX;

  swarm.baseFireRate = swarm.baseFireRate ?? swarm.fireRate;

  const MAX_SPEED_X = 0.025;

  if (engine.mode === "story") {
    swarm.speedX = Math.min(
      MAX_SPEED_X,
      swarm.baseSpeedX + engine.storyLevelIndex * 0.00035,
    );

    swarm.fireRate = Math.max(
      30,
      swarm.baseFireRate - engine.storyLevelIndex * 8,
    );

    return;
  }

  swarm.speedX = Math.min(
    MAX_SPEED_X,
    swarm.baseSpeedX + engine.infiniteDifficulty * 0.00045,
  );

  swarm.fireRate = Math.max(
    20,
    swarm.baseFireRate - engine.infiniteDifficulty * 6,
  );
}

export function updateBackground(engine) {
  if (!engine.grid) return;

  let bgUrl = "url('./STATIC/assets/LEVEL1.jpg')";

  if (engine.mode === "story") {
    const bgs = [
      "url('./STATIC/assets/LEVEL1.jpg')",
      "url('./STATIC/assets/LEVEL2.png')",
      "url('./STATIC/assets/LEVEL3.png')",
      "url('./STATIC/assets/LEVEL4.png')",
      "url('./STATIC/assets/LEVEL BOSS.png')",
    ];

    bgUrl = bgs[engine.storyLevelIndex] ?? bgs[0];
  }

  engine.grid.style.background = `linear-gradient(rgba(124, 117, 117, 0.6), rgba(0, 0, 0, 0.6)), ${bgUrl}`;
  engine.grid.style.backgroundSize = "cover";
  engine.grid.style.backgroundPosition = "center";
  engine.grid.style.backgroundRepeat = "no-repeat";
}

export function loadWave(
  engine,
  { resetScore = false, carryLives = null, carryPosition = null } = {},
) {
  const preservedLives = carryLives ?? engine.player?.lives ?? null;

  const preservedPosition =
    carryPosition ??
    (engine.player
      ? {
          x: engine.player.x,
          y: engine.player.y,
        }
      : null);

  if (resetScore) {
    engine.score = 0;
    updateScore(engine.score);
  }

  engine.tickCount = 0;
  engine.accumulator = 0;
  engine.lastFrameTime = performance.now();

  engine.alienFrame = 0;

  engine.entities = [];

  engine.player = null;
  engine.playerBullet = null;
  engine.alienSwarm = null;
  engine.isPlayerHit = false;

  if (engine.deathTimeout) {
    clearTimeout(engine.deathTimeout);
    engine.deathTimeout = null;
  }

  if (engine.grid) {
    engine.grid.innerHTML = "";
  }

  engine.player = createPlayer();

  if (preservedLives !== null) {
    engine.player.lives = preservedLives;
    updateLives(preservedLives);
  }

  if (preservedPosition) {
    engine.player.x = preservedPosition.x;
    engine.player.y = preservedPosition.y;
  }

  engine.player.el = document.createElement("div");

  engine.player.el.classList.add("player");
  engine.player.el.style.position = "absolute";

  engine.entities.push(engine.player);

  engine.grid.appendChild(engine.player.el);

  engine.loseLine = engine.player.y - (engine.player.height || 0.05) / 2;

  const levelMap = getCurrentLevelMap(engine);

  const levelOptions = getCurrentLevelOptions(engine);

  const aliens = createAliensFromTileMap(levelMap, levelOptions);

  for (const entity of aliens) {
    entity.el = document.createElement("div");

    entity.el.style.position = "absolute";

    if (entity.type === "boss") {
      entity.el.classList.add("boss");
    } else {
      entity.el.classList.add("alien");

      if (entity.variant === 1) {
        entity.el.classList.add("alien-type-1");
      }

      if (entity.variant === 2) {
        entity.el.classList.add("alien-type-2");
      }

      if (entity.variant === 3) {
        entity.el.classList.add("alien-type-3");
      }
    }

    engine.grid.appendChild(entity.el);

    engine.entities.push(entity);
  }

  const swarm = createAlienSwarmController();

  configureSwarm(swarm, engine);

  engine.alienSwarm = swarm;

  engine.entities.push(swarm);

  updateBackground(engine);

  updateScore(engine.score);
}

export function handleWaveCleared(engine) {
  if (engine.mode === "story") {
    if (engine.storyLevelIndex === BOSS_LEVEL_INDEX) {
      engine.showGameWin();

      return;
    }

    engine.isPaused = true;
    engine.state = GAME_STATES.PAUSED;

    pauseBackgroundMusic();

    showVictory(engine);

    return;
  }

  const boostedLives = (engine.player?.lives ?? 0) + 1;

  updateLives(boostedLives);

  const preservedPosition = engine.player
    ? {
        x: engine.player.x,
        y: engine.player.y,
      }
    : null;

  engine.infiniteDifficulty += 1;

  loadWave(engine, {
    carryLives: boostedLives,
    carryPosition: preservedPosition,
  });
}
