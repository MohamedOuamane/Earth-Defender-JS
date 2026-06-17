let engine = null;
import { playMenuMusic } from "./music/audioManager.js";
function wireInput(engineInstance) {
  engineInstance.input = { left: false, right: false, shoot: false };

  window.addEventListener("keydown", (e) => {
    if (
      engineInstance.isInputLocked?.() &&
      ["ArrowLeft", "ArrowRight", "Space"].includes(e.code)
    ) {
      e.preventDefault();
      return;
    }

    if (e.code === "Escape") {
      e.preventDefault();
      engineInstance.togglePause();
    }
    if (e.code === "ArrowLeft") engineInstance.input.left = true;
    if (e.code === "ArrowRight") engineInstance.input.right = true;
    if (e.code === "Space") {
      engineInstance.input.shoot = true;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft") engineInstance.input.left = false;
    if (e.code === "ArrowRight") engineInstance.input.right = false;
    if (e.code === "Space") engineInstance.input.shoot = false;
  });
}

function showGameUI() {
  document.getElementById("game")?.removeAttribute("hidden");
  document.getElementById("landing")?.setAttribute("hidden", "");
  document.querySelector(".actions")?.setAttribute("hidden", "");
  document.querySelector(".footer")?.setAttribute("hidden", "");
  document.getElementById("hud")?.removeAttribute("hidden");
}
function showMenu() {
  // stop engine
  if (engine) {
    engine.stop();

    engine.storyLevelIndex = 0;
    engine.storyWinShown = false;
    engine.score = 0;
    engine.gameTime = 0;
  }

  // cache le jeu
  document.getElementById("game")?.setAttribute("hidden", "");

  // cache le HUD
  document.getElementById("hud")?.setAttribute("hidden", "");

  // remet menu
  document.getElementById("landing")?.removeAttribute("hidden");
  document.querySelector(".actions")?.removeAttribute("hidden");
  document.querySelector(".footer")?.removeAttribute("hidden");

  // cache les popups
  document.getElementById("gameOverScreen").style.display = "none";
  document.getElementById("victoryScreen").style.display = "none";
  document.getElementById("scorePopup").style.display = "none";

  // nettoie la grille
  const grid = document.querySelector(".grid");

  if (grid) {
    grid.innerHTML = "";
  }
}

let enginePromise = null;

async function ensureEngine() {
  if (engine) return engine;
  if (enginePromise) return enginePromise;

  enginePromise = import("./engine/engine.js").then(({ Engine }) => {
    engine = new Engine(60);
    wireInput(engine);
    playMenuMusic();
    return engine;
  });

  return enginePromise;
}

async function startMode(mode) {
  const engineInstance = await ensureEngine();

  showGameUI();
  engineInstance.start(mode);
}

document
  .getElementById("startStoryBtn")
  ?.addEventListener("click", () => startMode("story"));

document
  .getElementById("startInfiniteBtn")
  ?.addEventListener("click", () => startMode("infinite"));

let pressedControl = null;

document.addEventListener("mousedown", (event) => {
  const control = event.target.closest("button, a");

  if (!control) return;

  pressedControl = control;
  control.style.transform = "scale(0.95) skewX(-2deg)";
});

function clearPressedControl() {
  if (!pressedControl) return;

  pressedControl.style.transform = "";
  pressedControl = null;
}

document.addEventListener("mouseup", clearPressedControl);
window.addEventListener("blur", clearPressedControl);

// titre EARTH DEFENDER
document.getElementById("homeBtn")?.addEventListener("click", showMenu);

document.querySelector(".menu")?.addEventListener("click", () => {
  if (engine?.isRunning) {
    engine.togglePause();
  }
});

// bouton HOME du game over
document.getElementById("gameOverHomeBtn")?.addEventListener("click", showMenu);

window.addEventListener("earth-defender:return-to-menu", showMenu);

async function showLeaderboard() {
  let popup = document.getElementById("leaderboardScreen");

  // create popup dynamically if missing
  if (!popup) {
    popup = document.createElement("div");

    popup.id = "leaderboardScreen";
    popup.className = "game-over-overlay";

    popup.innerHTML = `
  <div class="game-over-popup">
    <h1>🏆 LEADERBOARD</h1>

    <ol id="leaderboardList"></ol>

    <div class="leaderboard-actions">
      <button id="prevPageBtn" class="btn btn--primary">
        <span class="btn__text">◀ PREV</span>
      </button>

      <span id="pageIndicator">
        PAGE 1
      </span>

      <button id="nextPageBtn" class="btn btn--primary">
        <span class="btn__text">NEXT ▶</span>
      </button>
    </div>

    <div class="leaderboard-actions">
      <button id="closeLeaderboardBtn" class="btn btn--primary">
        <span class="btn__text">CLOSE</span>
      </button>
    </div>
  </div>
`;

    document.body.appendChild(popup);
  }

  popup.style.display = "flex";

  const list = document.getElementById("leaderboardList");

  list.innerHTML = `
    <li>LOADING...</li>
  `;

  leaderboardPage = 1;

  await loadLeaderboardPage(leaderboardPage);

  document.getElementById("prevPageBtn").onclick = () => {
    if (leaderboardPage > 1) {
      loadLeaderboardPage(leaderboardPage - 1);
    }
  };

  document.getElementById("nextPageBtn").onclick = () => {
    if (leaderboardPage < leaderboardTotalPages) {
      loadLeaderboardPage(leaderboardPage + 1);
    }
  };

  const closeBtn = document.getElementById("closeLeaderboardBtn");

  closeBtn.onclick = () => {
    popup.style.display = "none";
  };
}

window.showLeaderboard = showLeaderboard;

let leaderboardPage = 1;
let leaderboardTotalPages = 1;

async function loadLeaderboardPage(page) {
  const list = document.getElementById("leaderboardList");

  try {
    const { initScores, getScores } = await import("./api/scores.js");
    initScores();
    const data = getScores(page, 10);

    leaderboardPage = data.page;
    leaderboardTotalPages = data.totalPages;

    const pageIndicator = document.getElementById("pageIndicator");

    pageIndicator.textContent = `PAGE ${leaderboardPage} / ${leaderboardTotalPages}`;

    list.innerHTML = "";

    if (!data.scores.length) {
      list.innerHTML = "<li>NO SCORES</li>";
      return;
    }

    data.scores.forEach((entry, index) => {
      const li = document.createElement("li");

      const rank = (leaderboardPage - 1) * 10 + index + 1;

      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.gap = "40px";
      li.style.marginBottom = "10px";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = `#${rank} ${entry.name}`;

      const scoreStrong = document.createElement("strong");
      scoreStrong.textContent = entry.score;

      li.appendChild(nameSpan);
      li.appendChild(scoreStrong);
      list.appendChild(li);
    });

    document.getElementById("prevPageBtn").disabled = leaderboardPage <= 1;

    document.getElementById("nextPageBtn").disabled =
      leaderboardPage >= leaderboardTotalPages;
  } catch (err) {
    console.error(err);

    list.innerHTML = `
      <li>API ERROR</li>
    `;
  }
}

document
  .getElementById("leaderboardBtn")
  ?.addEventListener("click", showLeaderboard);

document.addEventListener(
  "click",
  () => {
    ensureEngine();
  },
  { once: true },
);
