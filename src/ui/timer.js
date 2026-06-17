import { updateTimerDisplay } from "./gameHud.js";
import { GAME_STATES } from "../engine/gamestate.js";

let gameTime = 0;
let intervalId = null;
let isPaused = false;
let isRunning = false;

/**
 * Start the global game timer
 */
export function startTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  isRunning = true;
  isPaused = false;

  updateTimerDisplay(gameTime);

  intervalId = setInterval(() => {
    if (!isRunning || isPaused) return;

    gameTime++;
    updateTimerDisplay(gameTime);
  }, 1000);
}

/**
 * Pause/resume control (used by Engine pause system)
 */
export function setTimerPaused(state) {
  isPaused = state;
}

/**
 * Stop timer completely
 */
export function stopTimer() {
  isRunning = false;
  isPaused = false;

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/**
 * Reset timer to zero
 */
export function resetTimer() {
  gameTime = 0;
  updateTimerDisplay(gameTime);
}

/**
 * Get current time value
 */
export function getGameTime() {
  return gameTime;
}
