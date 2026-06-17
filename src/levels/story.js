import { GAME_STATES } from "../engine/gamestate.js";
export const INTRO_BRIEFING = `Year 2148.

The invasion began without warning.

Alien warships descended from the sky, destroying cities and cutting off all communication across the planet. Earth's defenses fell within days, and humanity was pushed to the brink of extinction.

Now only one weapon remains.

Deep beneath the ruins of the capital, the last functional combat spaceship has been brought online. Its mission is simple: break through the occupied city, climb through the atmosphere, reach orbit, and destroy the alien mothership directing the invasion.

Humanity's future depends on a single pilot.

You.`;

export const FINAL_BRIEFING = `Against all odds, you made it.

The burning cities are far below. The clouds have vanished beneath you. Earth's blue horizon stretches across the darkness of space.

Ahead looms the alien mothership.

The colossal vessel has coordinated every attack, every bombardment, and every wave of invaders since the beginning of the war. Destroy it, and the alien fleet will be left leaderless.

This is humanity's final chance.

Weapons online.
Engines at maximum thrust.

End the invasion.`;

export const VICTORY_BRIEFING = `MISSION COMPLETE.

Alien Mothership Destroyed.

The enemy flagship erupts in a blinding explosion, sending debris across Earth's orbit. Across the planet, alien forces suddenly lose coordination and begin to retreat.

For the first time since the invasion began, the skies are quiet.

Cities around the world emerge from the darkness. Emergency broadcasts return to the airwaves. Survivors gather in the streets and watch as the remaining alien ships flee into deep space.

Against impossible odds, a single pilot changed the course of history.

Earth is free.

Congratulations, Defender.

Humanity will remember your victory.`;

export function createStoryState() {
  return {
    screen: null,
    textEl: null,
    promptEl: null,
    timer: null,
    keyHandler: null,
  };
}

export function ensureStoryScreen(story) {
  if (story.screen) {
    return story;
  }

  const screen = document.createElement("div");

  screen.className = "story-screen";
  screen.hidden = true;

  screen.innerHTML = `
    <div class="story-screen__panel" role="dialog" aria-modal="true" aria-label="Mission briefing">
      <div class="story-screen__header">
        <span class="story-screen__title">MISSION BRIEFING</span>
        <span class="story-screen__status">SECURE TERMINAL</span>
      </div>

      <pre class="story-screen__text"></pre>

      <p class="story-screen__prompt" hidden>
        PRESS ENTER TO CONTINUE
      </p>
    </div>
  `;

  document.body.appendChild(screen);

  story.screen = screen;
  story.textEl = screen.querySelector(".story-screen__text");
  story.promptEl = screen.querySelector(".story-screen__prompt");

  return story;
}
export function showStoryScreen(
  engine,
  text,
  onComplete = () => {},
  options = {},
) {
  const {
    completionState = GAME_STATES.PLAYING,
    headerStatus = "SECURE TERMINAL",
    headerTitle = "MISSION BRIEFING",
    promptText = "PRESS ENTER TO CONTINUE",
    screenState = GAME_STATES.STORY,
  } = options;

  const story = ensureStoryScreen(engine.story);

  engine.state = screenState;
  engine.isPaused = false;
  engine.resetInput();

  let index = 0;
  const fullText = String(text);

  story.textEl.textContent = "";
  story.promptEl.textContent = promptText;

  story.screen.querySelector(".story-screen__title").textContent = headerTitle;

  story.screen.querySelector(".story-screen__status").textContent =
    headerStatus;

  story.promptEl.hidden = true;
  story.screen.hidden = false;

  story.screen.classList.toggle(
    "story-screen--win",
    screenState === GAME_STATES.WIN,
  );

  const completeTyping = () => {
    index = fullText.length;

    story.textEl.textContent = fullText;
    story.promptEl.hidden = false;

    if (story.timer) {
      clearInterval(story.timer);
      story.timer = null;
    }
  };

  const closeStory = () => {
    hideStoryScreen(engine);

    engine.state = completionState;
    engine.lastFrameTime = performance.now();
    engine.accumulator = 0;
    engine.resetInput();

    onComplete();
  };

  if (story.timer) {
    clearInterval(story.timer);
    story.timer = null;
  }

  if (story.keyHandler) {
    window.removeEventListener("keydown", story.keyHandler, true);

    story.keyHandler = null;
  }

  story.keyHandler = (event) => {
    if (event.code !== "Space" && event.code !== "Enter") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (index < fullText.length) {
      completeTyping();
      return;
    }

    if (event.repeat) {
      return;
    }

    if (event.code === "Enter") {
      closeStory();
    }
  };

  window.addEventListener("keydown", story.keyHandler, true);

  story.timer = setInterval(() => {
    index += 1;

    story.textEl.textContent = fullText.slice(0, index);

    if (index >= fullText.length) {
      completeTyping();
      return;
    }
  }, 30);
}

export function hideStoryScreen(engine) {
  const story = engine.story;

  if (story.timer) {
    clearInterval(story.timer);
    story.timer = null;
  }

  if (story.keyHandler) {
    window.removeEventListener("keydown", story.keyHandler, true);

    story.keyHandler = null;
  }

  if (story.screen) {
    story.screen.hidden = true;
  }
}
