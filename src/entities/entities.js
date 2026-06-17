import { clamp } from "../utils/bounds.js";

export function createPlayer() {
  const shootSound = new Audio("../../sounds/laser.wav");
  return {
    type: "player",
    lives: 3,
    x: 0.5,
    y: 0.9,
    dead: false,
    width: 0.07,
    height: 0.07,

    velocityX: 0.01,
    el: null,
    tick: 0,
    state: "idle", // 'idle', 'left', 'right'

    update(engine) {
      if (!engine.input || engine.isPlayerHit) return;

      this.tick++;

      this.state = "idle";

      if (engine.input.left) {
        this.x -= this.velocityX;
        this.state = "left";
      }
      if (engine.input.right) {
        this.x += this.velocityX;
        this.state = "right";
      }

      if (engine.input?.shoot && engine.playerBullet === null) {
        engine.input.shoot = false;

        const bullet = createBullet(this.x, this.y - 0.04);

        bullet.el = document.createElement("div");
        bullet.el.style.position = "absolute";
        bullet.el.style.width = "10px";
        bullet.el.style.height = "20px";
        bullet.el.classList.add("bullet", "player-bullet");

        engine.grid.appendChild(bullet.el);
        engine.entities.push(bullet);

        engine.playerBullet = bullet;
        shootSound.currentTime = 0;
        shootSound.play();
      }

      this.x = clamp(this.x, this.width / 2, 1 - this.width / 2);
    },
  };
}

// ===============================
// TILEMAP ALIENS
// ===============================
export function createAliensFromTileMap(levelMap, options = {}) {
  const aliens = [];

  if (!levelMap || !Array.isArray(levelMap)) return aliens;

  const {
    leftOffset = 0.09,
    topOffset = 0.1,
    columnSpacing = 0.075,
    rowSpacing = 0.07,
  } = options;

  for (let row = 0; row < levelMap.length; row++) {
    for (let col = 0; col < levelMap[row].length; col++) {
      const tile = levelMap[row][col];
      const x = leftOffset + col * columnSpacing;
      const y = topOffset + row * rowSpacing;
      if (tile == 2) {
        aliens.push({
          id: 151,
          row,
          col,
          type: "boss",
          x: 0.7, // Start horizontally centered
          y: 0.2, // Move it up slightly since it's smaller
          lives: 60,
          width: 0.4, // Smaller width
          height: 0.2, // Smaller height
          speedX: 0.003, // Boss movement speed

          dead: false,
          el: null,
          lastShot: 0,
          fireRate: 80, // Shoots every 80 frames

          lastLaserLives: 60, // Track health for laser phase
          laserPhase: "none", // 'none', 'moving', 'firing'
          laserTimer: 0,
          laserBullet: null,

          update(engine) {
            if (this.dead || engine.isPlayerHit) {
              this.laserPhase = "none";
              this.lastLaserLives = this.lives; // reset threshold
              if (this.laserBullet) {
                this.laserBullet.dead = true;
                this.laserBullet = null;
              }
              return;
            }

            // Check if boss lost 10 health since last laser
            if (
              this.laserPhase === "none" &&
              this.lastLaserLives - this.lives >= 10
            ) {
              this.lastLaserLives = this.lives;
              this.laserPhase = "moving";
            }

            if (this.laserPhase === "moving") {
              const targetX = 0.5;
              const diff = targetX - this.x;
              // Move towards center
              if (Math.abs(diff) > Math.abs(this.speedX)) {
                this.x += Math.sign(diff) * Math.abs(this.speedX);
              } else {
                this.x = targetX;
                this.laserPhase = "firing";
                this.laserTimer = 180; // 3 seconds at 60 FPS

                // Spawn laser bullet
                const laserHeight = 0.8;
                this.laserBullet = {
                  type: "bullet",
                  owner: "boss",
                  isLaser: true, // Special property so it doesn't get destroyed on hit
                  dead: false,
                  x: this.x,
                  y: this.y + this.height / 2 + laserHeight / 2,
                  width: 0.2, // 4x player size (0.05)
                  height: laserHeight, // Spans from boss to bottom
                  velocityY: 0, // Doesn't move vertically
                  el: document.createElement("div"),
                };
                this.laserBullet.el.style.position = "absolute";
                this.laserBullet.el.style.zIndex = "10";
                this.laserBullet.el.classList.add("bullet", "boss-laser");

                engine.grid.appendChild(this.laserBullet.el);
                engine.entities.push(this.laserBullet);
              }
              return; // Skip normal firing/moving while shifting to center or firing
            } else if (this.laserPhase === "firing") {
              this.laserTimer--;
              if (this.laserTimer <= 0) {
                this.laserPhase = "none";
                if (this.laserBullet) {
                  this.laserBullet.dead = true;
                  this.laserBullet = null;
                }
              }
              return; // Skip normal firing/moving while firing laser
            }

            // Move left and right
            this.x += this.speedX;
            if (this.x - this.width / 2 <= 0 || this.x + this.width / 2 >= 1) {
              this.speedX *= -1; // Reverse direction
              this.x = clamp(this.x, this.width / 2, 1 - this.width / 2);
            }

            this.lastShot++;
            if (this.lastShot < this.fireRate) return;
            this.lastShot = 0;

            let positions;
            if (this.lives >= 40) {
              positions = [
                this.x - 0.18, // Far left
                this.x + 0.18, // Far right
              ];
            } else if (this.lives < 40 && this.lives >= 20) {
              positions = [
                this.x - 0.08, // Mid left
                this.x + 0.08, // Mid right
              ];
            } else {
              positions = [
                this.x - 0.18, // Far left
                this.x + 0.18, // Far right
                this.x - 0.08, // Mid left
                this.x + 0.08, // Mid right
              ];
            }

            for (const px of positions) {
              const bullet = createBullet(px, this.y + 0.1, "boss");
              bullet.el = document.createElement("div");
              bullet.el.style.position = "absolute";
              bullet.el.style.width = "10px";
              bullet.el.style.height = "20px";
              bullet.el.classList.add("bullet", "boss-bullet");

              engine.grid.appendChild(bullet.el);
              engine.entities.push(bullet);
            }
          },
        });
      }
      if (tile !== 1) continue;

      aliens.push({
        id: row * 10 + col,
        row,
        col,

        type: "alien",
        x,
        y,

        width: 0.08,
        height: 0.07,

        dead: false,
        el: null,
      });
    }
  }

  const uniqueRows = [
    ...new Set(aliens.filter((a) => a.type === "alien").map((a) => a.row)),
  ].sort((a, b) => a - b);
  const totalRows = uniqueRows.length;

  aliens.forEach((alien) => {
    if (alien.type !== "alien") return;

    const rowIndex = uniqueRows.indexOf(alien.row);
    const group = Math.floor((rowIndex / totalRows) * 3);

    if (group === 0) {
      alien.variant = 3;
      alien.score = 30;
    } else if (group === 1) {
      alien.variant = 2;
      alien.score = 20;
    } else {
      alien.variant = 1;
      alien.score = 10;
    }
  });

  return aliens;
}

// ===============================
// BULLET
// ===============================
export function createBullet(x, y, owner = "player") {
  return {
    type: "bullet",
    dead: false,
    owner,

    x,
    y,

    velocityY: owner === "player" ? 0.015 : -0.01,

    width: 0.008,
    height: 0.02,

    el: null,
  };
}

// ===============================
// SWARM CONTROLLER
// ===============================
export function createAlienSwarmController() {
  return {
    type: "alienSwarm",
    dirX: 1,
    speedX: 0.0014,
    baseSpeedX: 0.0014,
    dropY: 0.015,
    margin: 0,
    fireRate: 90,
    baseFireRate: 90,
    lastShot: 0,
    paused: false,

    update(engine) {
      if (this.paused) return;

      const aliens = [];

      for (const e of engine.entities) {
        if (e?.type === "alien" && !e.dead) {
          aliens.push(e);
        }
      }

      if (!aliens.length) return;

      let minLeft = Infinity;
      let maxRight = -Infinity;

      for (const a of aliens) {
        const left = a.x - a.width / 2;
        const right = a.x + a.width / 2;

        minLeft = Math.min(minLeft, left);
        maxRight = Math.max(maxRight, right);
      }

      const dx = this.dirX * this.speedX;

      if (minLeft + dx <= 0 || maxRight + dx >= 1) {
        this.dirX *= -1;

        for (const a of aliens) {
          a.y += this.dropY;
        }

        return;
      }

      for (const a of aliens) {
        a.x += dx;
      }

      this.lastShot++;

      if (this.lastShot < this.fireRate) return;

      this.lastShot = 0;

      const shooters = [];

      let maxCol = 10;
      for (const a of aliens) {
        if (a.col >= maxCol) {
          maxCol = a.col + 1;
        }
      }

      for (let col = 0; col < maxCol; col++) {
        let lowest = null;

        for (const a of aliens) {
          if (a.col !== col) continue;
          if (!lowest || a.y > lowest.y) lowest = a;
        }

        if (lowest) shooters.push(lowest);
      }

      if (!shooters.length) return;

      const shooter = shooters[Math.floor(Math.random() * shooters.length)];

      const bullet = createBullet(shooter.x, shooter.y + 0.03, "alien");

      bullet.el = document.createElement("div");
      bullet.el.style.position = "absolute";
      bullet.el.classList.add("bullet", "alien-bullet");

      engine.grid.appendChild(bullet.el);
      engine.entities.push(bullet);
    },
  };
}
