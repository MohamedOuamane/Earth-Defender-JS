# 🚀 Earth Defender

A clone of the classic **Space Invaders** arcade game developed in **Vanilla JavaScript**.

## 📖 Description

The player controls a spaceship and must destroy waves of invading enemies while avoiding their attacks. The game includes:

- Spaceship movement
- Projectile shooting
- Collision detection system
- Multiple levels
- Sound effects and background music
- High-score persistence via browser localStorage

---

## 🛠️ Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript

---

## 📂 Project Structure

```text
MAKE-YOUR-GAME/
│
├── docs/
│   ├── CODE_ANNOTATIONS.md
│   ├── CODE_WALKTHROUGH.md
│   ├── engine.md
│   ├── README.md
│   └── tasks.md
│
├── sounds/
│   ├── backgroundSound.mp3
│   ├── explosion.mp3
│   ├── laser.wav
│   └── menuSound.mp3
│
├── src/
│   ├── api/
│   │   ├── scores.js
│   │   └── scores.json
│   │
│   ├── engine/
│   │   ├── collision.js
│   │   ├── engine.js
│   │   ├── gamestate.js
│   │   ├── renderer.js
│   │   └── waveManager.js
│   │
│   ├── entities/
│   │   ├── entities.js
│   │   └── frames.js
│   │
│   ├── levels/
│   │   ├── levels.js
│   │   └── story.js
│   │
│   ├── music/
│   │   └── audioManager.js
│   │
│   ├── ui/
│   │   ├── gameHud.js
│   │   ├── gameUI.js
│   │   └── timer.js
│   │
│   ├── utils/
│   │   └── bounds.js
│   │
│   └── main.js
│
├── STATIC/
│   ├── assets/
│   │   ├── LEVEL BOSS.png
│   │   ├── LEVEL1.jpg
│   │   ├── LEVEL2.png
│   │   ├── LEVEL3.png
│   │   ├── LEVEL4.png
│   │   ├── Untitled design.png
│   │   ├── bossSprite3.png
│   │   ├── laserBlue.png
│   │   ├── laserGreen.png
│   │   ├── laserRed.png
│   │   ├── lives.png
│   │   └── spriteSheet1.png
│   │
│   ├── fonts/
│   │   ├── MaterialSymbolsOutlined.woff2
│   │   ├── JetBrains_Mono/
│   │   └── Space_Mono/
│   │
│   └── index.css
│
├── index.html
└── README.md
```

---

## ▶️ Running the Project

Simply open `index.html` in your browser, or serve the project root with any static file server:

```bash
# Python
python -m http.server 8000

# or Node.js (npx)
npx serve .
```

Then open `http://localhost:8000` in your browser.

---

## 🎮 Controls

| Action     | Key   |
| ---------- | ----- |
| Move Left  | ←     |
| Move Right | →     |
| Shoot      | Space |
| Pause      | Esc   |

---

## 🏆 Score System

Scores are saved in the browser's **localStorage** under the key `earth-defender-scores`. The initial leaderboard data is seeded from `src/api/scores.json`. Scores persist across page reloads but will be cleared if the user clears their browser data.

---

## 🔊 Audio Resources

The `sounds/` directory contains:

- Background music
- Laser sound effects
- Explosion sound effects
- Menu music

---
## Disclaimer
All art in this game was AI generated
## 📈 Features

- [x] Player movement
- [x] Laser shooting
- [x] Animated enemies
- [x] Collision detection
- [x] Multiple levels
- [x] Sound effects and music
- [x] High-score saving system
