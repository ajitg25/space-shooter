# Space Shooter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pixel-art browser space shooter with wave-based enemies, bosses every 5 waves, pickups, and a high score system.

**Architecture:** Vanilla HTML5 Canvas, ES modules, no dependencies. Pure-logic entities in `src/entities.js` and `src/waves.js` are unit-tested via `tests/test.html` (opened in browser). Rendering in `src/sprites.js`. Game loop and state machine in `src/game.js`.

**Tech Stack:** HTML5 Canvas 2D API, ES Modules, Press Start 2P font (Google Fonts CDN), `localStorage` for high score.

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | Canvas element, font import, module entry |
| `styles.css` | Dark background, centered canvas, pixel rendering |
| `src/input.js` | `KeyboardInput` — tracks held keys via Set |
| `src/entities.js` | `Player`, `Bullet`, `Enemy`, `Boss`, `Pickup`, `Particle` — pure logic, no canvas refs |
| `src/sprites.js` | All draw functions — canvas-only, no state |
| `src/waves.js` | `WAVE_CONFIGS`, `isBossWave()`, `getWaveConfig()`, `spawnWaveEnemies()` |
| `src/game.js` | `Game` class — loop, state machine, collision, HUD, menus |
| `tests/test.html` | Browser unit tests for all pure-logic modules |

---

## Task 1: Scaffold

**Files:**
- Create: `index.html`
- Create: `styles.css`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Space Shooter</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <canvas id="gameCanvas" width="480" height="640"></canvas>
  <script type="module" src="src/game.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `styles.css`**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
}

canvas {
  display: block;
  image-rendering: pixelated;
}
```

- [ ] **Step 3: Create a stub `src/game.js` to verify the scaffold renders**

```js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#0a0a1a';
ctx.fillRect(0, 0, 480, 640);
ctx.fillStyle = '#00e5ff';
ctx.font = '16px monospace';
ctx.textAlign = 'center';
ctx.fillText('scaffold ok', 240, 320);
```

- [ ] **Step 4: Open `index.html` in browser, verify dark canvas with "scaffold ok" text**

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css src/game.js
git commit -m "feat: scaffold canvas and styles"
```

---

## Task 2: Input Handler

**Files:**
- Create: `src/input.js`
- Modify: `tests/test.html` (create it)

- [ ] **Step 1: Write the failing test in `tests/test.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Space Shooter Tests</title>
  <style>
    body { background: #111; color: #fff; font-family: monospace; padding: 20px; }
    .pass { color: #00ff88; }
    .fail { color: #ff4444; }
    h2 { color: #00e5ff; }
    #summary { margin-top: 20px; font-size: 18px; }
  </style>
</head>
<body>
<h2>Space Shooter — Unit Tests</h2>
<div id="output"></div>
<div id="summary"></div>
<script type="module">
  import { KeyboardInput } from '../src/input.js';

  const out = document.getElementById('output');
  let passed = 0, failed = 0;

  function assert(desc, condition) {
    const el = document.createElement('div');
    el.className = condition ? 'pass' : 'fail';
    el.textContent = (condition ? '✓ ' : '✗ ') + desc;
    out.appendChild(el);
    condition ? passed++ : failed++;
  }

  // KeyboardInput tests
  const input = new KeyboardInput();
  assert('key not down initially', !input.isDown('Space'));
  // simulate keydown
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
  assert('key down after keydown event', input.isDown('Space'));
  window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
  assert('key up after keyup event', !input.isDown('Space'));

  const summary = document.getElementById('summary');
  summary.style.color = failed === 0 ? '#00ff88' : '#ff4444';
  summary.textContent = `${passed} passed, ${failed} failed`;
</script>
</body>
</html>
```

- [ ] **Step 2: Open `tests/test.html` in browser, verify it fails with import error (module not found)**

- [ ] **Step 3: Create `src/input.js`**

```js
export class KeyboardInput {
  constructor() {
    this._keys = new Set();
    window.addEventListener('keydown', e => {
      this._keys.add(e.code);
      e.preventDefault();
    });
    window.addEventListener('keyup', e => {
      this._keys.delete(e.code);
    });
  }

  isDown(code) {
    return this._keys.has(code);
  }
}
```

- [ ] **Step 4: Refresh `tests/test.html`, verify 3 passed, 0 failed**

- [ ] **Step 5: Commit**

```bash
git add src/input.js tests/test.html
git commit -m "feat: add keyboard input handler with tests"
```

---

## Task 3: Player and Bullet Entities

**Files:**
- Create: `src/entities.js`
- Modify: `tests/test.html`

- [ ] **Step 1: Add Player and Bullet tests to `tests/test.html`**

Replace the `<script type="module">` block with:

```html
<script type="module">
  import { KeyboardInput } from '../src/input.js';
  import { Player, Bullet } from '../src/entities.js';

  const out = document.getElementById('output');
  let passed = 0, failed = 0;

  function assert(desc, condition) {
    const el = document.createElement('div');
    el.className = condition ? 'pass' : 'fail';
    el.textContent = (condition ? '✓ ' : '✗ ') + desc;
    out.appendChild(el);
    condition ? passed++ : failed++;
  }

  // --- KeyboardInput ---
  const input = new KeyboardInput();
  assert('key not down initially', !input.isDown('Space'));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
  assert('key down after keydown event', input.isDown('Space'));
  window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
  assert('key up after keyup event', !input.isDown('Space'));

  // --- Player ---
  const player = new Player(480, 640);
  assert('player starts with 3 lives', player.lives === 3);
  assert('player starts with score 0', player.score === 0);
  assert('player alive initially', player.alive);
  assert('player centered horizontally', player.x === (480 - 32) / 2);
  assert('player not invincible initially', player.invincible === false);

  const hitResult = player.hit();
  assert('player hit returns true (damage taken)', hitResult === true);
  assert('player hit reduces lives', player.lives === 2);
  assert('player invincible after hit', player.invincible === true);

  const ignoredHit = player.hit();
  assert('player hit during invincibility returns false', ignoredHit === false);
  assert('player lives unchanged during invincibility', player.lives === 2);

  // player shoot returns bullets
  const bullets = player.shoot();
  assert('player shoot returns array', Array.isArray(bullets));
  assert('player single shot returns 1 bullet', bullets.length === 1);
  assert('player bullet travels upward', bullets[0].vy < 0);
  assert('player bullet is fromPlayer', bullets[0].fromPlayer === true);

  // spread shot
  const p2 = new Player(480, 640);
  p2.spreadActive = true;
  const spread = p2.shoot();
  assert('spread shot returns 3 bullets', spread.length === 3);

  // applyPickup
  const p3 = new Player(480, 640);
  p3.lives = 2;
  p3.applyPickup('shield');
  assert('shield pickup adds 1 life', p3.lives === 3);
  p3.applyPickup('spread');
  assert('spread pickup activates spread', p3.spreadActive === true);
  p3.applyPickup('multiplier');
  assert('multiplier pickup sets 2x', p3.multiplier === 2);

  // --- Bullet ---
  const b = new Bullet(100, 100, 0, -500, true);
  assert('bullet alive initially', b.alive === true);
  assert('bullet fromPlayer true', b.fromPlayer === true);
  b.update(0.1, 0, 0);
  assert('bullet moves upward on update', b.y < 100);

  const eb = new Bullet(100, 100, 0, 200, false);
  assert('enemy bullet fromPlayer false', eb.fromPlayer === false);

  // summary
  const summary = document.getElementById('summary');
  summary.style.color = failed === 0 ? '#00ff88' : '#ff4444';
  summary.textContent = `${passed} passed, ${failed} failed`;
</script>
```

- [ ] **Step 2: Refresh `tests/test.html`, verify it fails (entities not yet defined)**

- [ ] **Step 3: Create `src/entities.js` with `Player` and `Bullet`**

```js
export class Bullet {
  constructor(x, y, vx, vy, fromPlayer, homing = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.fromPlayer = fromPlayer;
    this.homing = homing;
    this.width = 4;
    this.height = fromPlayer ? 12 : 8;
    this.alive = true;
  }

  update(dt, targetX, targetY) {
    if (this.homing) {
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.vx += (dx / dist * 150 - this.vx) * dt * 2;
      this.vy += (dy / dist * 150 - this.vy) * dt * 2;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
}

export class Player {
  constructor(canvasWidth, canvasHeight) {
    this.width = 32;
    this.height = 32;
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - this.height - 48;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.speed = 250;
    this.lives = 3;
    this.score = 0;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.invincibleDuration = 2;
    this.blinkTimer = 0;
    this.visible = true;
    this.shootCooldown = 0;
    this.shootInterval = 0.25;
    this.spreadActive = false;
    this.spreadTimer = 0;
    this.spreadDuration = 10;
    this.multiplierActive = false;
    this.multiplierTimer = 0;
    this.multiplierDuration = 10;
    this.multiplier = 1;
  }

  get alive() { return this.lives > 0; }

  update(dt, input) {
    if ((input.isDown('ArrowLeft') || input.isDown('KeyA')) && this.x > 0) {
      this.x -= this.speed * dt;
    }
    if ((input.isDown('ArrowRight') || input.isDown('KeyD')) && this.x + this.width < this.canvasWidth) {
      this.x += this.speed * dt;
    }
    if ((input.isDown('ArrowUp') || input.isDown('KeyW')) && this.y > 0) {
      this.y -= this.speed * dt;
    }
    if ((input.isDown('ArrowDown') || input.isDown('KeyS')) && this.y + this.height < this.canvasHeight) {
      this.y += this.speed * dt;
    }
    this.x = Math.max(0, Math.min(this.canvasWidth - this.width, this.x));
    this.y = Math.max(0, Math.min(this.canvasHeight - this.height, this.y));

    if (this.shootCooldown > 0) this.shootCooldown -= dt;

    if (this.invincible) {
      this.invincibleTimer -= dt;
      this.blinkTimer += dt;
      this.visible = Math.floor(this.blinkTimer / 0.1) % 2 === 0;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
        this.visible = true;
      }
    }

    if (this.spreadActive) {
      this.spreadTimer -= dt;
      if (this.spreadTimer <= 0) this.spreadActive = false;
    }

    if (this.multiplierActive) {
      this.multiplierTimer -= dt;
      if (this.multiplierTimer <= 0) {
        this.multiplierActive = false;
        this.multiplier = 1;
      }
    }
  }

  shoot() {
    if (this.shootCooldown > 0) return [];
    this.shootCooldown = this.spreadActive ? 0.15 : this.shootInterval;
    const cx = this.x + this.width / 2 - 2;
    const cy = this.y;
    if (this.spreadActive) {
      return [-30, 0, 30].map(deg => {
        const rad = deg * Math.PI / 180;
        return new Bullet(cx, cy, Math.sin(rad) * 500, -Math.cos(rad) * 500, true);
      });
    }
    return [new Bullet(cx, cy, 0, -500, true)];
  }

  hit() {
    if (this.invincible) return false;
    this.lives--;
    this.invincible = true;
    this.invincibleTimer = this.invincibleDuration;
    this.blinkTimer = 0;
    return true;
  }

  applyPickup(type) {
    switch (type) {
      case 'shield':
        this.lives = Math.min(this.lives + 1, 5);
        break;
      case 'spread':
        this.spreadActive = true;
        this.spreadTimer = this.spreadDuration;
        break;
      case 'life':
        this.lives++;
        break;
      case 'multiplier':
        this.multiplierActive = true;
        this.multiplierTimer = this.multiplierDuration;
        this.multiplier = 2;
        break;
    }
  }
}
```

- [ ] **Step 4: Refresh `tests/test.html`, verify all tests pass**

- [ ] **Step 5: Commit**

```bash
git add src/entities.js tests/test.html
git commit -m "feat: add Player and Bullet entities with tests"
```

---

## Task 4: Enemy, Boss, Pickup, Particle Entities

**Files:**
- Modify: `src/entities.js` (append)
- Modify: `tests/test.html` (append tests)

- [ ] **Step 1: Append the remaining entity tests to `tests/test.html`**

Add these assertions before the summary block in the `<script>`:

```js
  import { Player, Bullet, Enemy, Boss, Pickup, Particle } from '../src/entities.js';
  // (update the import at the top to include Enemy, Boss, Pickup, Particle)

  // --- Enemy ---
  const drone = new Enemy(100, 100, 'drone');
  assert('drone hp is 1', drone.hp === 1);
  assert('drone points are 100', drone.points === 100);
  assert('drone alive initially', drone.alive);
  assert('drone hit kills it (1 hp)', (() => { drone.hit(); return !drone.alive; })());

  const fighter = new Enemy(100, 100, 'fighter');
  assert('fighter hp is 2', fighter.hp === 2);
  assert('fighter survives first hit', (() => { fighter.hit(); return fighter.alive; })());
  assert('fighter dies on second hit', (() => { fighter.hit(); return !fighter.alive; })());

  const kamikaze = new Enemy(100, 100, 'kamikaze');
  assert('kamikaze shootInterval is Infinity', kamikaze.shootInterval === Infinity);
  assert('kamikaze shoot returns null', kamikaze.shoot(200, 300) === null);

  // --- Boss ---
  const boss = new Boss(480);
  assert('boss starts with 30 hp', boss.hp === 30);
  assert('boss phase 1 when hp > 20', boss.phase === 1);
  boss.hp = 20;
  assert('boss phase 2 when hp = 20', boss.phase === 2);
  boss.hp = 10;
  assert('boss phase 3 when hp = 10', boss.phase === 3);
  boss.hp = 1; boss.hit();
  assert('boss dies when hp reaches 0', !boss.alive);

  // --- Pickup ---
  const pickup = new Pickup(100, 100, 'spread');
  assert('pickup alive initially', pickup.alive);
  assert('pickup type correct', pickup.type === 'spread');
  pickup.update(100, 640);
  assert('pickup falls off screen and dies', !pickup.alive);

  // --- Particle ---
  const particle = new Particle(100, 100, '#ff0000');
  assert('particle alive initially', particle.alive);
  particle.life = 0.001;
  particle.update(0.1);
  assert('particle dies when life depleted', !particle.alive);
```

Also update the import line at the top to:
```js
  import { Player, Bullet, Enemy, Boss, Pickup, Particle } from '../src/entities.js';
```

- [ ] **Step 2: Refresh `tests/test.html`, verify new tests fail (Enemy etc. not exported yet)**

- [ ] **Step 3: Append to `src/entities.js`**

```js
export class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.alive = true;
    this.time = Math.random() * Math.PI * 2;
    this._diving = false;
    this._diveTargetX = null;
    this._diveTargetY = null;
    this.vx = 0;

    switch (type) {
      case 'drone':
        this.width = 28; this.height = 20;
        this.hp = 1; this.points = 100; this.speed = 80;
        this.shootInterval = 3;
        break;
      case 'fighter':
        this.width = 32; this.height = 28;
        this.hp = 2; this.points = 250; this.speed = 120;
        this.shootInterval = 2;
        break;
      case 'kamikaze':
        this.width = 24; this.height = 24;
        this.hp = 1; this.points = 150; this.speed = 180;
        this.shootInterval = Infinity;
        break;
    }
    this.baseX = x;
    this.vy = this.speed;
    this.shootCooldown = this.shootInterval * Math.random();
  }

  update(dt, playerX, playerY, canvasHeight) {
    this.time += dt;
    this.shootCooldown -= dt;

    switch (this.type) {
      case 'drone':
        this.x = this.baseX + Math.sin(this.time * 1.5) * 60;
        this.y += this.speed * dt;
        break;
      case 'fighter':
        if (!this._diving && this.y > 80) {
          this._diving = true;
          this._diveTargetX = playerX;
          this._diveTargetY = playerY;
        }
        if (this._diving) {
          const dx = this._diveTargetX - this.x;
          const dy = this._diveTargetY - this.y;
          const dist = Math.hypot(dx, dy) || 1;
          this.x += (dx / dist) * this.speed * dt;
          this.y += (dy / dist) * this.speed * dt;
          if (Math.abs(this._diveTargetY - this.y) < 5) {
            this._diving = false;
            this.vy = this.speed * 0.5;
          }
        } else {
          this.y += this.vy * dt;
        }
        break;
      case 'kamikaze':
        if (!this._diving && this.y > 50) {
          this._diving = true;
          const dx = playerX - this.x;
          const dy = playerY - this.y;
          const dist = Math.hypot(dx, dy) || 1;
          this.vx = (dx / dist) * this.speed;
          this.vy = (dy / dist) * this.speed;
        }
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        break;
    }

    if (this.y > canvasHeight + 60) this.alive = false;
  }

  shoot(playerX, playerY) {
    if (this.shootCooldown > 0 || this.type === 'kamikaze') return null;
    this.shootCooldown = this.shootInterval;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height;
    const dx = playerX - cx;
    const dy = playerY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    return new Bullet(cx - 2, cy, (dx / dist) * 200, (dy / dist) * 200, false);
  }

  hit() {
    this.hp--;
    if (this.hp <= 0) this.alive = false;
    return !this.alive;
  }
}

export class Boss {
  constructor(canvasWidth) {
    this.width = 80;
    this.height = 60;
    this.x = (canvasWidth - this.width) / 2;
    this.y = -this.height;
    this.canvasWidth = canvasWidth;
    this.hp = 30;
    this.maxHp = 30;
    this.points = 1000;
    this.alive = true;
    this.entered = false;
    this.targetY = 80;
    this.vxDir = 1;
    this.shootCooldown = 2;
    this.time = 0;
  }

  get phase() {
    if (this.hp > 20) return 1;
    if (this.hp > 10) return 2;
    return 3;
  }

  get shootInterval() {
    return [null, 2, 1.5, 1][this.phase];
  }

  update(dt, canvasWidth) {
    this.time += dt;

    if (!this.entered) {
      this.y += 100 * dt;
      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.entered = true;
      }
      return;
    }

    const speed = [null, 100, 150, 220][this.phase];
    this.x += this.vxDir * speed * dt;
    if (this.x + this.width >= canvasWidth) {
      this.vxDir = -1;
      this.x = canvasWidth - this.width;
    }
    if (this.x <= 0) {
      this.vxDir = 1;
      this.x = 0;
    }

    this.shootCooldown -= dt;
  }

  shoot(playerX, playerY) {
    if (!this.entered || this.shootCooldown > 0) return [];
    this.shootCooldown = this.shootInterval;
    const cx = this.x + this.width / 2 - 2;
    const cy = this.y + this.height;

    if (this.phase === 1) {
      return [-30, 0, 30].map(deg => {
        const rad = deg * Math.PI / 180;
        return new Bullet(cx, cy, Math.sin(rad) * 200, Math.cos(rad) * 200, false);
      });
    }
    if (this.phase === 2) {
      return [-60, -30, 0, 30, 60].map(deg => {
        const rad = deg * Math.PI / 180;
        return new Bullet(cx, cy, Math.sin(rad) * 220, Math.cos(rad) * 220, false);
      });
    }
    // phase 3: homing missile
    const dx = playerX - cx;
    const dy = playerY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    return [new Bullet(cx, cy, (dx / dist) * 150, (dy / dist) * 150, false, true)];
  }

  hit() {
    this.hp--;
    if (this.hp <= 0) this.alive = false;
    return !this.alive;
  }
}

export class Pickup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 16;
    this.height = 16;
    this.vy = 60;
    this.alive = true;
  }

  update(dt, canvasHeight) {
    this.y += this.vy * dt;
    if (this.y > canvasHeight) this.alive = false;
  }
}

export class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = 3 + Math.random() * 4;
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 150;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 0.4 + Math.random() * 0.4;
    this.maxLife = this.life;
    this.alive = true;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.size *= 0.95;
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
  }
}
```

- [ ] **Step 4: Refresh `tests/test.html`, verify all tests pass**

- [ ] **Step 5: Commit**

```bash
git add src/entities.js tests/test.html
git commit -m "feat: add Enemy, Boss, Pickup, Particle entities with tests"
```

---

## Task 5: Sprites

**Files:**
- Create: `src/sprites.js`

No unit tests — visual verification in browser.

- [ ] **Step 1: Create `src/sprites.js`**

```js
export function drawPlayer(ctx, x, y) {
  ctx.fillStyle = '#00e5ff';
  ctx.fillRect(x + 12, y + 8, 8, 20);
  ctx.fillRect(x + 4, y + 16, 8, 12);
  ctx.fillRect(x + 20, y + 16, 8, 12);
  ctx.fillRect(x + 14, y + 2, 4, 8);
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(x + 13, y + 28, 6, 4);
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(x + 14, y + 30, 4, 3);
}

export function drawDrone(ctx, x, y) {
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(x + 6, y + 4, 16, 12);
  ctx.fillRect(x + 2, y + 8, 24, 6);
  ctx.fillStyle = '#ff8888';
  ctx.fillRect(x + 11, y + 2, 6, 6);
}

export function drawFighter(ctx, x, y) {
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(x + 12, y + 2, 8, 20);
  ctx.fillRect(x + 2, y + 10, 10, 14);
  ctx.fillRect(x + 20, y + 10, 10, 14);
  ctx.fillStyle = '#ffaa44';
  ctx.fillRect(x + 14, y, 4, 6);
}

export function drawKamikaze(ctx, x, y) {
  ctx.fillStyle = '#ff00ff';
  ctx.fillRect(x + 8, y + 2, 8, 18);
  ctx.fillRect(x + 2, y + 8, 6, 10);
  ctx.fillRect(x + 16, y + 8, 6, 10);
  ctx.fillStyle = '#ff88ff';
  ctx.fillRect(x + 10, y, 4, 4);
}

export function drawBoss(ctx, x, y, phase) {
  const colors = ['#ff2222', '#ff7700', '#aa00ff'];
  ctx.fillStyle = colors[phase - 1];
  ctx.fillRect(x + 20, y + 10, 40, 40);
  ctx.fillRect(x, y + 20, 20, 24);
  ctx.fillRect(x + 60, y + 20, 20, 24);
  ctx.fillStyle = '#ffff00';
  ctx.fillRect(x + 32, y + 4, 16, 12);
  ctx.fillStyle = '#888888';
  ctx.fillRect(x + 10, y + 36, 6, 14);
  ctx.fillRect(x + 64, y + 36, 6, 14);
}

export function drawBullet(ctx, x, y, fromPlayer) {
  ctx.fillStyle = fromPlayer ? '#00ffff' : '#ff4444';
  ctx.fillRect(x, y, 4, fromPlayer ? 12 : 8);
}

export function drawPickup(ctx, x, y, type) {
  const colors = { shield: '#00ff88', spread: '#ffff00', life: '#ff88ff', multiplier: '#ff8800' };
  const labels = { shield: 'S', spread: 'W', life: '♥', multiplier: '2x' };
  ctx.fillStyle = colors[type] || '#ffffff';
  ctx.fillRect(x, y, 16, 16);
  ctx.fillStyle = '#000000';
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(labels[type] || '?', x + 8, y + 11);
}

export function drawParticle(ctx, x, y, size, color, alpha) {
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.fillStyle = color;
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
  ctx.globalAlpha = 1;
}

export function drawStars(ctx, stars) {
  for (const star of stars) {
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
  ctx.globalAlpha = 1;
}

export function drawHeart(ctx, x, y) {
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(x + 2, y, 4, 4);
  ctx.fillRect(x + 6, y, 4, 4);
  ctx.fillRect(x, y + 2, 10, 6);
  ctx.fillRect(x + 2, y + 8, 6, 2);
  ctx.fillRect(x + 4, y + 10, 2, 2);
}
```

- [ ] **Step 2: Update `src/game.js` stub to visual-test sprites**

Replace `src/game.js` contents entirely with:

```js
import { drawPlayer, drawDrone, drawFighter, drawKamikaze, drawBoss, drawBullet, drawPickup, drawParticle, drawStars, drawHeart } from './sprites.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#0a0a1a';
ctx.fillRect(0, 0, 480, 640);

drawPlayer(ctx, 224, 560);
drawDrone(ctx, 60, 80);
drawFighter(ctx, 160, 80);
drawKamikaze(ctx, 260, 80);
drawBoss(ctx, 200, 160, 1);
drawBullet(ctx, 240, 300, true);
drawBullet(ctx, 260, 300, false);
drawPickup(ctx, 40, 300, 'shield');
drawPickup(ctx, 70, 300, 'spread');
drawPickup(ctx, 100, 300, 'life');
drawPickup(ctx, 130, 300, 'multiplier');
for (let i = 0; i < 3; i++) drawHeart(ctx, 450 - i * 18, 10);
ctx.fillStyle = '#fff';
ctx.font = '8px monospace';
ctx.textAlign = 'left';
ctx.fillText('sprite test', 10, 440);
```

- [ ] **Step 3: Open `index.html` in browser, verify all sprites are visible and correctly shaped**

- [ ] **Step 4: Commit**

```bash
git add src/sprites.js src/game.js
git commit -m "feat: add pixel art sprites"
```

---

## Task 6: Wave Manager

**Files:**
- Create: `src/waves.js`
- Modify: `tests/test.html` (append wave tests)

- [ ] **Step 1: Append wave tests to `tests/test.html`**

Add to the import at top:
```js
  import { isBossWave, getWaveConfig, spawnWaveEnemies } from '../src/waves.js';
```

Add before the summary block:
```js
  // --- Waves ---
  assert('wave 5 is boss wave', isBossWave(5));
  assert('wave 10 is boss wave', isBossWave(10));
  assert('wave 15 is boss wave', isBossWave(15));
  assert('wave 1 is not boss wave', !isBossWave(1));
  assert('wave 4 is not boss wave', !isBossWave(4));
  assert('wave 6 is not boss wave', !isBossWave(6));

  assert('getWaveConfig returns null for boss wave', getWaveConfig(5) === null);
  assert('getWaveConfig(1) returns enemies array', Array.isArray(getWaveConfig(1).enemies));
  assert('wave 1 has enemies', getWaveConfig(1).enemies.length > 0);

  const waveEnemies = spawnWaveEnemies(1, 480);
  assert('spawnWaveEnemies returns array', Array.isArray(waveEnemies));
  assert('wave 1 spawns enemies', waveEnemies.length > 0);
  assert('all spawned enemies are alive', waveEnemies.every(e => e.alive));
  assert('all spawned enemies start above canvas', waveEnemies.every(e => e.y < 0));
```

- [ ] **Step 2: Refresh `tests/test.html`, verify wave tests fail (module not found)**

- [ ] **Step 3: Create `src/waves.js`**

```js
import { Enemy } from './entities.js';

const WAVE_CONFIGS = [
  // Wave 1: 8 drones, 2 rows
  { enemies: [...grid('drone', [0,1,2,3,4,5], [0]), ...grid('drone', [1,2,3,4], [1])] },
  // Wave 2: 10 drones, V formation
  { enemies: grid('drone', [0,1,2,3,4,5,1,2,3,4], [0,0,0,0,0,0,1,1,1,1]) },
  // Wave 3: 6 drones + 2 fighters
  { enemies: [...grid('drone', [0,1,2,3], [0]), ...grid('fighter', [1,4], [1])] },
  // Wave 4: 4 drones + 4 kamikazes
  { enemies: [...grid('drone', [0,2,3,5], [0]), ...grid('kamikaze', [1,2,3,4], [1])] },
  // Wave 5: BOSS — represented by null
  null,
  // Wave 6: 8 drones + 4 fighters
  { enemies: [...grid('drone', [0,1,2,3,4,5], [0]), ...grid('fighter', [1,2,3,4], [1])] },
  // Wave 7: 6 fighters + 4 kamikazes
  { enemies: [...grid('fighter', [0,2,4], [0]), ...grid('fighter', [1,3,5], [0]), ...grid('kamikaze', [1,2,3,4], [1])] },
  // Wave 8: 10 drones + 2 fighters + 4 kamikazes
  { enemies: [...grid('drone', [0,1,2,3,4,5], [0]), ...grid('fighter', [1,4], [1]), ...grid('kamikaze', [0,2,3,5], [2])] },
  // Wave 9: mixed heavy
  { enemies: [...grid('drone', [0,2,4], [0]), ...grid('fighter', [1,3,5], [0]), ...grid('kamikaze', [0,1,2,3,4,5], [1])] },
  // Wave 10: BOSS
  null,
];

function grid(type, cols, rows) {
  return cols.map((col, i) => ({ type, col, row: Array.isArray(rows) ? rows[i] : rows }));
}

export function isBossWave(wave) {
  return wave % 5 === 0;
}

export function getWaveConfig(wave) {
  if (isBossWave(wave)) return null;
  const idx = (wave - 1) % WAVE_CONFIGS.length;
  return WAVE_CONFIGS[idx] || WAVE_CONFIGS[WAVE_CONFIGS.length - 1];
}

export function spawnWaveEnemies(wave, canvasWidth) {
  const config = getWaveConfig(wave);
  if (!config) return [];
  const colWidth = (canvasWidth - 60) / 6;
  const baseX = 30;
  return config.enemies.map(({ type, col, row }) => {
    const x = baseX + col * colWidth;
    const y = -60 - row * 70;
    return new Enemy(x, y, type);
  });
}
```

- [ ] **Step 4: Refresh `tests/test.html`, verify all tests pass**

- [ ] **Step 5: Commit**

```bash
git add src/waves.js tests/test.html
git commit -m "feat: add wave manager with tests"
```

---

## Task 7: Game Core — Loop, State Machine, Background, Collision

**Files:**
- Modify: `src/game.js` (replace entirely)

- [ ] **Step 1: Replace `src/game.js` with the full game**

```js
import { KeyboardInput } from './input.js';
import { Player, Bullet, Enemy, Boss, Pickup, Particle } from './entities.js';
import { isBossWave, spawnWaveEnemies } from './waves.js';
import {
  drawPlayer, drawDrone, drawFighter, drawKamikaze,
  drawBoss, drawBullet, drawPickup, drawParticle, drawStars, drawHeart
} from './sprites.js';

const W = 480;
const H = 640;

function createStars() {
  const layers = [
    { count: 40, speed: 20, size: 1, alpha: 0.4 },
    { count: 25, speed: 50, size: 1, alpha: 0.7 },
    { count: 15, speed: 100, size: 2, alpha: 1.0 },
  ];
  return layers.flatMap(({ count, speed, size, alpha }) =>
    Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      speed, size, alpha
    }))
  );
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function randomPickupType() {
  const r = Math.random();
  if (r < 0.03) return 'life';
  if (r < 0.30) return 'spread';
  if (r < 0.60) return 'shield';
  return 'multiplier';
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new KeyboardInput();
    this.state = 'menu';
    this.stars = createStars();
    this.highScore = parseInt(localStorage.getItem('spaceShooterHighScore') || '0', 10);
    this._lastTime = null;
    this._waveClearTimer = 0;
    this._waveClearBonus = 0;
    this._enterHeld = false;
    this.wave = 1;
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.pickups = [];
    this.particles = [];
    this.boss = null;
  }

  _startGame() {
    this.wave = 1;
    this.player = new Player(W, H);
    this.enemies = [];
    this.bullets = [];
    this.pickups = [];
    this.particles = [];
    this.boss = null;
    this._beginWave();
  }

  _beginWave() {
    this.bullets = [];
    this.pickups = [];
    this.enemies = spawnWaveEnemies(this.wave, W);
    this.boss = isBossWave(this.wave) ? new Boss(W) : null;
    this.state = isBossWave(this.wave) ? 'boss' : 'playing';
  }

  _createExplosion(x, y, color) {
    for (let i = 0; i < 10; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  _checkCollisions() {
    const player = this.player;

    // Player bullets hit enemies
    for (const bullet of this.bullets) {
      if (!bullet.alive || !bullet.fromPlayer) continue;

      for (const enemy of this.enemies) {
        if (!enemy.alive || !rectsOverlap(bullet, enemy)) continue;
        bullet.alive = false;
        const killed = enemy.hit();
        if (killed) {
          this._createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff4444');
          if (Math.random() < 0.10) {
            this.pickups.push(new Pickup(enemy.x, enemy.y, randomPickupType()));
          }
          player.score += enemy.points * player.multiplier;
        }
      }

      if (this.boss && this.boss.alive && rectsOverlap(bullet, this.boss)) {
        bullet.alive = false;
        const killed = this.boss.hit();
        if (killed) {
          this._createExplosion(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, '#ff8800');
          player.score += this.boss.points * player.multiplier;
        }
      }
    }

    // Enemy bullets and bodies hit player
    for (const bullet of this.bullets) {
      if (!bullet.alive || bullet.fromPlayer || !rectsOverlap(bullet, player)) continue;
      bullet.alive = false;
      player.hit();
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive || !rectsOverlap(enemy, player)) continue;
      enemy.alive = false;
      this._createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff4444');
      player.hit();
    }

    // Pickups hit player
    for (const pickup of this.pickups) {
      if (!pickup.alive || !rectsOverlap(pickup, player)) continue;
      pickup.alive = false;
      player.applyPickup(pickup.type);
    }
  }

  _updateStars(dt) {
    for (const star of this.stars) {
      star.y += star.speed * dt;
      if (star.y > H) {
        star.y = 0;
        star.x = Math.random() * W;
      }
    }
  }

  update(dt) {
    this._updateStars(dt);

    const enterNow = this.input.isDown('Enter') || this.input.isDown('Space');

    if (this.state === 'menu') {
      if (enterNow && !this._enterHeld) {
        this._enterHeld = true;
        this._startGame();
      }
      if (!enterNow) this._enterHeld = false;
      return;
    }

    if (this.state === 'gameOver') {
      if (enterNow && !this._enterHeld) {
        this._enterHeld = true;
        this.state = 'menu';
      }
      if (!enterNow) this._enterHeld = false;
      return;
    }

    if (this.state === 'waveClear') {
      this._waveClearTimer -= dt;
      if (this._waveClearTimer <= 0) {
        this.wave++;
        this._beginWave();
      }
      return;
    }

    // playing / boss
    const player = this.player;
    player.update(dt, this.input);

    if (this.input.isDown('Space')) {
      this.bullets.push(...player.shoot());
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      enemy.update(dt, player.x + player.width / 2, player.y + player.height / 2, H);
      const shot = enemy.shoot(player.x + player.width / 2, player.y);
      if (shot) this.bullets.push(shot);
    }

    if (this.boss && this.boss.alive) {
      this.boss.update(dt, W);
      const shots = this.boss.shoot(player.x + player.width / 2, player.y + player.height / 2);
      this.bullets.push(...shots);
    }

    for (const bullet of this.bullets) {
      bullet.update(dt, player.x + player.width / 2, player.y + player.height / 2);
    }

    for (const pickup of this.pickups) pickup.update(dt, H);
    for (const p of this.particles) p.update(dt);

    this._checkCollisions();

    this.bullets = this.bullets.filter(b => b.alive && b.y > -20 && b.y < H + 20 && b.x > -10 && b.x < W + 10);
    this.enemies = this.enemies.filter(e => e.alive);
    this.pickups = this.pickups.filter(p => p.alive);
    this.particles = this.particles.filter(p => p.alive);

    if (!player.alive) {
      if (player.score > this.highScore) {
        this.highScore = player.score;
        localStorage.setItem('spaceShooterHighScore', String(this.highScore));
      }
      this.state = 'gameOver';
      return;
    }

    const bossDefeated = (this.state === 'boss') && this.boss && !this.boss.alive;
    const waveCleared = (this.state === 'playing') && this.enemies.length === 0;
    if (bossDefeated || waveCleared) {
      this._waveClearBonus = this.wave * 500;
      player.score += this._waveClearBonus;
      this._waveClearTimer = 2.5;
      this.state = 'waveClear';
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);
    drawStars(ctx, this.stars);

    if (this.state === 'menu') { this._renderMenu(); return; }
    if (this.state === 'gameOver') { this._renderGameOver(); return; }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      if (enemy.type === 'drone') drawDrone(ctx, enemy.x, enemy.y);
      else if (enemy.type === 'fighter') drawFighter(ctx, enemy.x, enemy.y);
      else if (enemy.type === 'kamikaze') drawKamikaze(ctx, enemy.x, enemy.y);
    }

    if (this.boss && this.boss.alive) {
      drawBoss(ctx, this.boss.x, this.boss.y, this.boss.phase);
      this._renderBossBar();
    }

    for (const bullet of this.bullets) drawBullet(ctx, bullet.x, bullet.y, bullet.fromPlayer);
    for (const pickup of this.pickups) drawPickup(ctx, pickup.x, pickup.y, pickup.type);

    for (const p of this.particles) {
      if (!p.alive) continue;
      drawParticle(ctx, p.x, p.y, p.size, p.color, p.life / p.maxLife);
    }

    if (this.player.visible) drawPlayer(ctx, this.player.x, this.player.y);

    this._renderHUD();
    if (this.state === 'waveClear') this._renderWaveClear();
  }

  _renderMenu() {
    const ctx = this.ctx;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00e5ff';
    ctx.font = '22px "Press Start 2P"';
    ctx.fillText('SPACE SHOOTER', W / 2, 200);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText('PRESS SPACE TO START', W / 2, 300);
    ctx.fillStyle = '#ffcc00';
    ctx.fillText(`HI-SCORE: ${this.highScore}`, W / 2, 360);
    ctx.fillStyle = '#888888';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText('ARROWS / WASD: MOVE', W / 2, 450);
    ctx.fillText('SPACE: SHOOT', W / 2, 472);
  }

  _renderGameOver() {
    const ctx = this.ctx;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4444';
    ctx.font = '28px "Press Start 2P"';
    ctx.fillText('GAME OVER', W / 2, 240);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText(`SCORE: ${this.player.score}`, W / 2, 310);
    ctx.fillText(`WAVE: ${this.wave}`, W / 2, 340);
    if (this.player.score > 0 && this.player.score >= this.highScore) {
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('NEW HIGH SCORE!', W / 2, 380);
    }
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '9px "Press Start 2P"';
    ctx.fillText('PRESS SPACE TO RETRY', W / 2, 450);
  }

  _renderWaveClear() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, H / 2 - 60, W, 110);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ff88';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText(`WAVE ${this.wave} CLEAR!`, W / 2, H / 2 - 10);
    ctx.fillStyle = '#ffff00';
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText(`+${this._waveClearBonus} BONUS`, W / 2, H / 2 + 24);
  }

  _renderHUD() {
    const ctx = this.ctx;
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(this.player.score), 10, 24);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`WAVE ${this.wave}`, W / 2, 24);

    for (let i = 0; i < this.player.lives; i++) drawHeart(ctx, W - 20 - i * 18, 10);

    if (this.player.spreadActive) {
      ctx.fillStyle = '#ffff00';
      ctx.font = '8px "Press Start 2P"';
      ctx.textAlign = 'left';
      ctx.fillText(`SPREAD ${Math.ceil(this.player.spreadTimer)}s`, 10, H - 10);
    }
    if (this.player.multiplierActive) {
      ctx.fillStyle = '#ff8800';
      ctx.font = '8px "Press Start 2P"';
      ctx.textAlign = 'right';
      ctx.fillText(`2x ${Math.ceil(this.player.multiplierTimer)}s`, W - 10, H - 10);
    }
  }

  _renderBossBar() {
    const ctx = this.ctx;
    const barW = 200, barH = 10;
    const bx = (W - barW) / 2, by = H - 30;
    ctx.fillStyle = '#333333';
    ctx.fillRect(bx, by, barW, barH);
    const pct = this.boss.hp / this.boss.maxHp;
    ctx.fillStyle = pct > 0.66 ? '#00ff00' : pct > 0.33 ? '#ffff00' : '#ff0000';
    ctx.fillRect(bx, by, barW * pct, barH);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS', W / 2, by - 4);
  }

  _loop(timestamp) {
    if (this._lastTime === null) this._lastTime = timestamp;
    const dt = Math.min((timestamp - this._lastTime) / 1000, 0.05);
    this._lastTime = timestamp;
    this.update(dt);
    this.render();
    requestAnimationFrame(ts => this._loop(ts));
  }

  run() {
    requestAnimationFrame(ts => this._loop(ts));
  }
}

const canvas = document.getElementById('gameCanvas');
if (!canvas) {
  document.body.innerHTML = '<p style="color:white;padding:20px;font-family:monospace">Error: canvas element not found.</p>';
} else {
  const game = new Game(canvas);
  game.run();
}
```

- [ ] **Step 2: Open `index.html` in browser. Expected: dark canvas with scrolling stars and "SPACE SHOOTER" title. Press Space — game should start with enemies entering from the top.**

- [ ] **Step 3: Verify each game state works:**
  - Menu screen shows title, HI-SCORE, controls
  - Pressing Space starts wave 1 with drone enemies
  - Player moves with WASD/arrows
  - Space shoots cyan bullets
  - Killing all enemies shows WAVE CLEAR screen with bonus
  - Wave 5 spawns the boss with HP bar
  - Dying shows GAME OVER with score/wave
  - Pressing Space on GAME OVER returns to menu
  - High score persists after page refresh

- [ ] **Step 4: Commit**

```bash
git add src/game.js
git commit -m "feat: complete game loop, state machine, HUD, and menus"
```

---

## Task 8: Final Integration Test and .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Create `.gitignore`**

```
.superpowers/
```

- [ ] **Step 2: Run all unit tests — open `tests/test.html`, verify all pass (0 failed)**

- [ ] **Step 3: Play the full game golden path:**
  - Start game → survive wave 1 → wave clear → wave 2 → ... → wave 5 boss → defeat boss → continue
  - Pick up a spread shot powerup and verify 3-way fire
  - Pick up a multiplier and verify 2x score display
  - Die → verify GAME OVER screen shows correct score and wave
  - Refresh page → verify HI-SCORE shows the saved score

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "feat: add gitignore, game complete"
```

---

## Self-Review Notes

- **Spec coverage:** All entities covered (Player, Drone, Fighter, Kamikaze, Boss, Pickup, Particle). Wave structure (waves 1–4 normal, wave 5 boss, waves 6+). All pickup types. All game states. HUD elements. High score. Canvas error fallback.
- **Type consistency:** `rectsOverlap` used consistently in `_checkCollisions`. `isBossWave`/`spawnWaveEnemies` used in both `_startGame` and `_beginWave`. All entity method names consistent between tasks.
- **Placeholders:** None.
