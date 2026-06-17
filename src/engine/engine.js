import {
  hideVictory,
  showScorePopup,
  hideScorePopup,
  showGameOver,
  hideGameOver,
  ensurePauseMenu,
  showPauseMenu,
  hidePauseMenu,
} from "../ui/gameUI.js";
import {
  startTimer,
  stopTimer,
  resetTimer,
  setTimerPaused,
} from "../ui/timer.js";
import { handleCollisions } from "./collision.js";
import {
  INTRO_BRIEFING,
  FINAL_BRIEFING,
  VICTORY_BRIEFING,
  hideStoryScreen,
  showStoryScreen,
  createStoryState,
} from "../levels/story.js";
import { STORY_LEVELS, BOSS_LEVEL_INDEX } from "../levels/levels.js";
import { GAME_STATES } from "./gamestate.js";
import { updateLives } from "../ui/gameHud.js";
import {
  initAudioManager,
  playMenuMusic,
  stopMenuMusic,
  playBackgroundMusic,
  pauseBackgroundMusic,
  resumeBackgroundMusic,
  stopBackgroundMusic,
  playExplosionSound,
} from "../music/audioManager.js";
import { render, toggleAlienFrame } from "./renderer.js";
import { loadWave, handleWaveCleared } from "./waveManager.js";

export class Engine {
  constructor(targetFPS = 60) {
    this.isRunning = false;
    this.isPaused = false;
    this.state = GAME_STATES.IDLE;
    this.rafId = null;
    this.tickCount = 0;
    this.alienFrame = 0;
    this.alienCssFrame = 1;
    this.totalAlienFrames = 8;
    this.alienAnimationSpeed = 8;
    this.spriteFrameWidth = 64;
    this.spriteFrameHeight = 64;
    this.mode = "story";
    this.storyLevelIndex = 0;
    this.infiniteDifficulty = 0;
    this.player = null;
    this.playerBullet = null;
    this.alienSwarm = null;
    this.entities = [];
    this.score = 0;
    this.targetFPS = targetFPS;
    this.fixedTimeStep = 1000 / targetFPS;
    this.lastFrameTime = 0;
    this.accumulator = 0;
    this.loop = this.loop.bind(this);
    this.fps = 0;
    this.frames = 0;
    this.fpsTimer = 0;
    this.loseLine = null;
    this.grid = null;
    this.performanceEl = null;
    this.restartBtn = null;
    this.nextLevelBtn = null;
    this.abortBtn = null;
    this.saveScoreBtn = null;
    this.handleResize = () => {
      this.gridWidth = this.grid?.clientWidth ?? 0;
      this.gridHeight = this.grid?.clientHeight ?? 0;
    };
    this.storyLevels = STORY_LEVELS;
    this.story = createStoryState();
    initAudioManager();
  }

  start(mode = this.mode) {
    if (this.isRunning || this.rafId !== null) return;
    stopMenuMusic();
    playBackgroundMusic();
    this.mode = mode;

    this.grid = document.querySelector(".grid");
    this.performanceEl = document.querySelector(".performance");

    if (!this.grid) return;

    if (this.mode === "story") {
      this.storyLevelIndex = 0;
      this.storyWinShown = false;
    } else {
      this.infiniteDifficulty = 0;
    }

    hideGameOver();
    hideVictory(this);
    hideScorePopup();
    hideStoryScreen(this);

    this.bindButtons();

    this.gridWidth = this.grid.clientWidth;
    this.gridHeight = this.grid.clientHeight;

    window.removeEventListener("resize", this.handleResize);
    window.addEventListener("resize", this.handleResize);

    this.player = null;

    loadWave(this, { resetScore: true });
    updateLives(this.player.lives);

    this.isRunning = true;
    this.state = GAME_STATES.PLAYING;

    resetTimer();
    startTimer();

    this.lastFrameTime = performance.now();

    if (this.mode === "story") {
      showStoryScreen(this, INTRO_BRIEFING);
    }

    this.rafId = requestAnimationFrame(this.loop);
  }

  bindButtons() {
    this.restartBtn = document.getElementById("restartBtn");
    this.nextLevelBtn = document.getElementById("nextLevelBtn");
    this.abortBtn = document.getElementById("abortBtn");
    this.saveScoreBtn = document.getElementById("saveScoreBtn");

    if (this.restartBtn) {
      this.restartBtn.onclick = () => {
        this.restartGame();
      };
    }

    if (this.nextLevelBtn) {
      this.nextLevelBtn.onclick = () => {
        this.nextLevel();
      };
    }

    if (this.abortBtn) {
      this.abortBtn.onclick = () => {
        this.abortSystem();
      };
    }

    if (this.saveScoreBtn) {
      this.saveScoreBtn.onclick = () => {
        this.saveScore();
      };
    }

    const playerNameInput = document.getElementById("playerName");

    if (playerNameInput) {
      playerNameInput.onkeydown = (event) => {
        if (event.key === "Enter") {
          this.saveScore();
        }
      };
    }
  }

  loop(time) {
    if (!this.isRunning) return;

    this.frames++;

    if (!this.fpsTimer) {
      this.fpsTimer = time;
    }

    if (time - this.fpsTimer >= 1000) {
      this.fps = this.frames;
      this.frames = 0;
      this.fpsTimer = time;
    }

    const dt = time - this.lastFrameTime;
    this.lastFrameTime = time;

    this.accumulator += dt;

    while (this.accumulator >= this.fixedTimeStep) {
      if (!this.isPaused && this.state === GAME_STATES.PLAYING) {
        this.update();
      }

      this.accumulator -= this.fixedTimeStep;
    }

    render(this);

    if (this.isRunning) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  update() {
    this.tickCount++;

    if (this.tickCount % 8 === 0) {
      this.alienFrame = (this.alienFrame + 1) % 8;
    }

    for (const entity of this.entities) {
      if (!entity || entity.dead) continue;

      if (typeof entity.update === "function") {
        entity.update(this);
      }

      if (entity.type === "bullet") {
        entity.y -= entity.velocityY;
      }
    }

    handleCollisions(this);

    this.entities = this.entities.filter((entity) => {
      if (!entity) return false;

      if (entity.dead) {
        entity.el?.remove();

        if (entity === this.playerBullet) {
          this.playerBullet = null;
        }

        return false;
      }

      if (entity.type === "bullet" && (entity.y < 0 || entity.y > 1)) {
        entity.el?.remove();

        if (entity === this.playerBullet) {
          this.playerBullet = null;
        }

        return false;
      }

      return true;
    });

    const remainingAliens = this.entities.some(
      (entity) =>
        (entity?.type === "alien" || entity?.type === "boss") && !entity.dead,
    );

    if (!remainingAliens) {
      handleWaveCleared(this);
      return;
    }

    if (this.tickCount % 30 === 0) {
      toggleAlienFrame(this);
    }
  }

  playerDeathSequence() {
    if (!this.player) return;

    this.isPlayerHit = true;

    playExplosionSound();
    this.spawnExplosion(this.player.x, this.player.y);

    if (this.player.el) {
      this.player.el.style.opacity = "0";
    }

    if (this.alienSwarm) {
      this.alienSwarm.paused = true;
    }

    this.player.lives -= 1;
    updateLives(this.player.lives);

    if (this.deathTimeout) {
      clearTimeout(this.deathTimeout);
    }

    if (this.player.lives <= 0) {
      this.player.dead = true;
      this.showGameOver();

      this.deathTimeout = setTimeout(() => this.stop(), 2000);

      return;
    }

    this.deathTimeout = setTimeout(() => {
      this.player.x = 0.5;
      this.player.y = 0.9;
      this.player.dead = false;

      if (this.player.el) {
        this.player.el.style.opacity = "1";
      }

      if (this.alienSwarm) {
        this.alienSwarm.paused = false;
      }

      this.isPlayerHit = false;
    }, 2000);
  }

  togglePause() {
    if (
      !this.isRunning ||
      (this.state !== GAME_STATES.PLAYING && this.state !== GAME_STATES.PAUSED)
    ) {
      return;
    }

    if (this.state === GAME_STATES.PAUSED) {
      this.isPaused = false;
      this.state = GAME_STATES.PLAYING;

      setTimerPaused(false);
      resumeBackgroundMusic();

      hidePauseMenu();
      this.resetInput();

      this.lastFrameTime = performance.now();
      this.accumulator = 0;

      return;
    }

    this.isPaused = true;
    this.state = GAME_STATES.PAUSED;

    setTimerPaused(true);
    pauseBackgroundMusic();
    this.resetInput();

    ensurePauseMenu({
      onResume: () => this.togglePause(),
      onRestart: () => this.restartGame(),
      onAbort: () => this.abortSystem(),
    });

    showPauseMenu();
  }

  isInputLocked() {
    return (
      this.state === GAME_STATES.STORY ||
      this.state === GAME_STATES.WIN ||
      this.state === GAME_STATES.PAUSED ||
      !this.isRunning
    );
  }

  stop({ playMenu = true } = {}) {
    stopTimer();
    resetTimer();

    stopBackgroundMusic();

    if (playMenu) {
      playMenuMusic();
    }

    window.removeEventListener("resize", this.handleResize);

    this.isRunning = false;
    this.isPaused = false;
    this.state = GAME_STATES.IDLE;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    hidePauseMenu();
    hideStoryScreen(this);
  }

  restartGame() {
    this.stop();

    hideGameOver();
    hideVictory(this);
    hideScorePopup();
    hideStoryScreen(this);

    this.start(this.mode);
  }

  nextLevel() {
    if (this.mode !== "story") {
      return;
    }

    resumeBackgroundMusic();

    if (this.storyLevelIndex >= BOSS_LEVEL_INDEX) {
      this.restartGame();
      return;
    }

    const preservedLives = this.player?.lives ?? null;

    const preservedPosition = this.player
      ? {
          x: this.player.x,
          y: this.player.y,
        }
      : null;

    this.storyLevelIndex += 1;

    hideVictory(this);

    this.isPaused = false;
    this.isRunning = true;
    this.state = GAME_STATES.PLAYING;

    loadWave(this, {
      carryLives: preservedLives,
      carryPosition: preservedPosition,
    });

    if (this.storyLevelIndex === BOSS_LEVEL_INDEX) {
      showStoryScreen(this, FINAL_BRIEFING);
    }

    this.lastFrameTime = performance.now();
    this.accumulator = 0;
  }

  spawnExplosion(x, y) {
    const explosion = {
      type: "explosion",
      x,
      y,
      width: 0.05,
      height: 0.05,
      dead: false,
      tick: 0,
      lifespan: 3,
      el: document.createElement("div"),
      update(engine) {
        this.tick++;
        if (this.tick >= this.lifespan) {
          this.dead = true;
        }
      },
    };

    explosion.el.classList.add("explosion");
    explosion.el.style.position = "absolute";

    if (this.grid) {
      this.grid.appendChild(explosion.el);
    }

    this.entities.push(explosion);
  }

  showGameOver() {
    if (this.mode === "infinite") {
      showScorePopup();
      return;
    }

    showGameOver(this.score);
  }

  handleBossDefeated() {
    if (this.mode !== "story" || this.storyLevelIndex !== BOSS_LEVEL_INDEX) {
      return;
    }

    this.showGameWin();
  }

  showGameWin() {
    if (this.storyWinShown) return;

    this.storyWinShown = true;
    this.isRunning = true;
    this.isPaused = false;
    this.state = GAME_STATES.WIN;
    this.resetInput();

    this.entities = this.entities.filter((entity) => {
      if (entity?.type === "explosion") return true;

      entity?.el?.remove();
      return false;
    });

    this.player = null;
    this.playerBullet = null;
    this.alienSwarm = null;

    showStoryScreen(
      this,
      VICTORY_BRIEFING,
      () => {
        window.dispatchEvent(new CustomEvent("earth-defender:return-to-menu"));
      },
      {
        completionState: GAME_STATES.IDLE,
        headerStatus: "EARTH LIBERATED",
        headerTitle: "MISSION COMPLETE",
        promptText: "PRESS ENTER TO RETURN TO MENU",
        screenState: GAME_STATES.WIN,
      },
    );
  }

  resetInput() {
    if (!this.input) return;

    this.input.left = false;
    this.input.right = false;
    this.input.shoot = false;
  }

	async saveScore() {
		const input = document.getElementById("playerName");
		const saveButton = document.getElementById("saveScoreBtn");
		const name = (input?.value || "").trim().toUpperCase();

		if (name.length < 3) {
			input?.focus();
			return;
		}

		if (saveButton) {
			saveButton.disabled = true;
		}

		try {
			const { addScore } = await import("../api/scores.js");
			addScore(name, this.score);

			hideScorePopup();
			showGameOver(this.score);
		} catch (err) {
			console.error(err);
			input?.focus();
		} finally {
			if (saveButton) {
				saveButton.disabled = false;
			}
		}
	}

  abortSystem() {
    this.stop();

    hideVictory(this);
    hideGameOver();
    hideScorePopup();

    this.entities = [];
    this.player = null;
    this.playerBullet = null;
    this.alienSwarm = null;

    if (this.grid) {
      this.grid.innerHTML = "";
    }

    location.reload();
  }
}
