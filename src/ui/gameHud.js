// ui/game-ui.js

export function updateScore(score) {
  const scoreValue = document.getElementById("scoreValue");

  if (scoreValue) {
    scoreValue.textContent = score;
  }
}

export function updateLives(lives) {
  const livesCount = document.getElementById("livesCount");

  if (livesCount) {
    livesCount.textContent = lives;
  }
}

export function updateTimerDisplay(gameTime) {
  const timer = document.getElementById("timer");

  if (!timer) return;

  const minutes = Math.floor(gameTime / 60);
  const seconds = gameTime % 60;

  timer.textContent =
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`;
}
