import {
  PLAYER_FRAMES,
  ALIEN_FRAMES,
  BOSS_FRAMES_1,
  BOSS_FRAMES_2,
  BOSS_FRAMES_3,
  EXPLOSION_FRAMES,
} from "../entities/frames.js";

const SHEET_W = 1536;
const SHEET_H = 1024;

function renderEntitySizePosition(e, w, h) {
  const widthPx = (e.width || 0.05) * w;
  const heightPx = (e.height || 0.05) * h;

  if (e._widthPx !== widthPx || e._heightPx !== heightPx) {
    e.el.style.width = `${widthPx}px`;
    e.el.style.height = `${heightPx}px`;
    e._widthPx = widthPx;
    e._heightPx = heightPx;
  }

  const pxX = (e.x ?? 0) * w - widthPx / 2;
  const pxY = (e.y ?? 0) * h - heightPx / 2;

  e.el.style.left = "0px";
  e.el.style.top = "0px";
  e.el.style.transform = `translate3d(${pxX}px, ${pxY}px, 0)`;

  return { widthPx, heightPx };
}

function setSprite(el, f, scaleX, scaleY) {
  el.style.setProperty("--bgW", SHEET_W * scaleX);
  el.style.setProperty("--bgH", SHEET_H * scaleY);
  el.style.setProperty("--x", f.x * scaleX);
  el.style.setProperty("--y", f.y * scaleY);
  el.style.backgroundRepeat = "no-repeat";
}

function renderAlien(e, alienFrame, { widthPx, heightPx }) {
  const frames = ALIEN_FRAMES?.[e.variant];
  if (!frames) return;
  const f = frames[alienFrame % frames.length];
  setSprite(e.el, f, widthPx / f.w, heightPx / f.h);
}

function renderBoss(e, tickCount, { widthPx, heightPx }) {
  const frames =
    e.lives >= 40
      ? BOSS_FRAMES_1
      : e.lives >= 20
        ? BOSS_FRAMES_2
        : BOSS_FRAMES_3;

  if (!frames?.length) return;

  const f = frames[Math.floor(tickCount / 24) % frames.length];

  setSprite(e.el, f, widthPx / f.w, heightPx / f.h);
}

function renderExplosion(e, { widthPx, heightPx }) {
  const frames = EXPLOSION_FRAMES;
  const frameIndex = Math.min(
    Math.floor((e.tick / e.lifespan) * frames.length),
    frames.length - 1,
  );

  const f = frames[frameIndex];

  setSprite(e.el, f, widthPx / f.w, heightPx / f.h);
}

function renderPlayer(e, { widthPx, heightPx }) {
  const stateFrames = PLAYER_FRAMES?.[e.state] || PLAYER_FRAMES.idle;
  const f = stateFrames[Math.floor(e.tick / 8) % stateFrames.length];

  setSprite(e.el, f, widthPx / f.w, heightPx / f.h);
}

export function toggleAlienFrame(engine) {
  if (!engine.grid) return;

  engine.alienCssFrame = engine.alienCssFrame === 1 ? 2 : 1;

  engine.grid.classList.remove("aliens-frame-1", "aliens-frame-2");
  engine.grid.classList.add(`aliens-frame-${engine.alienCssFrame}`);
}

export function render(engine) {
  if (!engine.grid) return;

  const w = engine.gridWidth ?? engine.grid.clientWidth;
  const h = engine.gridHeight ?? engine.grid.clientHeight;

  for (const e of engine.entities) {
    if (!e?.el) continue;

    const dims = renderEntitySizePosition(e, w, h);

    if (e.type === "alien") {
      renderAlien(e, engine.alienFrame, dims);
    } else if (e.type === "boss") {
      renderBoss(e, engine.tickCount, dims);
    } else if (e.type === "explosion") {
      renderExplosion(e, dims);
    } else if (e.type === "player") {
      renderPlayer(e, dims);
    }
  }
}
