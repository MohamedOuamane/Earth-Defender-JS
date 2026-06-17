// audio/audioManager.js

const sounds = Object.freeze({
  background: new Audio("../../sounds/backgroundSound.mp3"),
  menu: new Audio("../../sounds/menuSound.mp3"),
  explosion: new Audio("../../sounds/explosion.mp3"),
});

// --------------------------------------------------
// INIT
// --------------------------------------------------

export function initAudioManager() {
  sounds.background.loop = true;
  sounds.background.volume = 0.3;

  sounds.menu.loop = true;
  sounds.menu.volume = 0.3;

  sounds.explosion.volume = 0.5;
}

// --------------------------------------------------
// MENU MUSIC
// --------------------------------------------------

export function playMenuMusic() {
  stopBackgroundMusic();

  const music = sounds.menu;

  music.currentTime = 0;

  music.play().catch((err) => {
    console.warn("Menu music blocked:", err);
  });
}

export function stopMenuMusic() {
  const music = sounds.menu;

  music.pause();
  music.currentTime = 0;
}

// --------------------------------------------------
// BACKGROUND MUSIC
// --------------------------------------------------

export function playBackgroundMusic() {
  stopMenuMusic();

  const music = sounds.background;

  if (music.paused) {
    music.play().catch((err) => {
      console.warn("Background music blocked:", err);
    });
  }
}

export function restartBackgroundMusic() {
  stopMenuMusic();

  const music = sounds.background;

  music.currentTime = 0;

  music.play().catch((err) => {
    console.warn("Background music blocked:", err);
  });
}

export function pauseBackgroundMusic() {
  sounds.background.pause();
}

export function resumeBackgroundMusic() {
  const music = sounds.background;

  if (music.paused) {
    music.play().catch((err) => {
      console.warn("Background music blocked:", err);
    });
  }
}

export function stopBackgroundMusic() {
  const music = sounds.background;

  music.pause();
  music.currentTime = 0;
}

// --------------------------------------------------
// SOUND EFFECTS
// --------------------------------------------------

export function playExplosionSound() {
  const sfx = sounds.explosion.cloneNode();

  sfx.volume = sounds.explosion.volume;

  sfx.play().catch((err) => {
    console.warn("Explosion sound blocked:", err);
  });
}

// --------------------------------------------------
// MASTER CONTROL
// --------------------------------------------------

export function stopAllAudio() {
  Object.values(sounds).forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}
