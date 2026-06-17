export function showVictory(engine) {
  const popup = document.getElementById("victoryScreen");
  const score = document.getElementById("victoryScore");

  if (score) {
    score.textContent = engine.score;
  }

  if (engine.nextLevelBtn) {
    engine.nextLevelBtn.textContent =
      engine.mode === "story" &&
      engine.storyLevelIndex >= engine.storyLevels.length - 1
        ? "PLAY AGAIN"
        : "NEXT LEVEL";
  }

  if (popup) {
    popup.style.display = "flex";
  }
}

export function hideVictory() {
  const popup = document.getElementById("victoryScreen");

  if (popup) {
    popup.style.display = "none";
  }
}

// ui/scoreUI.js

export function showScorePopup() {
  const popup = document.getElementById("scorePopup");
  const input = document.getElementById("playerName");

  if (input) {
    input.value = "";
  }

  if (popup) {
    popup.style.display = "flex";
  }

  input?.focus();
}

export function hideScorePopup() {
  const popup = document.getElementById("scorePopup");

  if (popup) {
    popup.style.display = "none";
  }
}
export function showGameOver(score) {
  const popup = document.getElementById("gameOverScreen");
  const finalScore = document.getElementById("finalScore");

  if (finalScore) {
    finalScore.textContent = score;
  }

  if (popup) {
    popup.style.display = "flex";
  }
}

export function hideGameOver() {
  const popup = document.getElementById("gameOverScreen");

  if (popup) {
    popup.style.display = "none";
  }
}
let pauseScreen = null;

export function ensurePauseMenu({ onResume, onRestart, onAbort }) {
  if (pauseScreen) return pauseScreen;

  pauseScreen = document.createElement("div");

  pauseScreen.id = "pauseScreen";
  pauseScreen.className = "game-over-overlay pause-overlay";

  pauseScreen.innerHTML = `
      <div class="pause-popup" role="dialog" aria-modal="true" aria-label="Pause menu">
        <h1>Paused</h1>

        <p class="pause-popup__copy">Mission control is waiting.</p>

        <div class="pause-actions">
          <button id="resumeBtn" type="button" class="btn btn--primary glitch">
            <span class="icon icon--fill icon--xl">play_arrow</span>
            <span class="btn__text">RESUME</span>
            <span class="icon icon--xl">chevron_right</span>
          </button>
          <button id="restartPauseBtn" type="button" class="btn btn--primary glitch">
            <span class="icon icon--fill icon--xl">restart_alt</span>
            <span class="btn__text">RESTART</span>
            <span class="icon icon--xl">chevron_right</span>
          </button>
          <button id="abortPauseBtn" type="button" class="btn btn--primary glitch">
            <span class="icon icon--fill icon--xl">close</span>
            <span class="btn__text">ABORT MISSION</span>
            <span class="icon icon--xl">chevron_right</span>
          </button>
        </div>
      </div>
    `;

  document.body.appendChild(pauseScreen);

  pauseScreen.querySelector("#resumeBtn").onclick = onResume;
  pauseScreen.querySelector("#restartPauseBtn").onclick = onRestart;
  pauseScreen.querySelector("#abortPauseBtn").onclick = onAbort;

  return pauseScreen;
}

export function showPauseMenu() {
  pauseScreen.style.display = "flex";
}

export function hidePauseMenu() {
  if (pauseScreen) {
    pauseScreen.style.display = "none";
  }
}
