export class Bullet {
  constructor(x, y, vx, vy, fromPlayer, homing = false) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.fromPlayer = fromPlayer; this.homing = homing;
    this.width = 4; this.height = fromPlayer ? 12 : 8;
    this.alive = true;
  }
  update(dt, targetX, targetY) {
    if (this.homing) {
      const dx = targetX - this.x, dy = targetY - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.vx += (dx / dist * 150 - this.vx) * dt * 2;
      this.vy += (dy / dist * 150 - this.vy) * dt * 2;
    }
    this.x += this.vx * dt; this.y += this.vy * dt;
  }
}

export class Player {
  constructor(canvasWidth, canvasHeight) {
    this.width = 32; this.height = 32;
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - this.height - 48;
    this.canvasWidth = canvasWidth; this.canvasHeight = canvasHeight;
    this.speed = 250; this.lives = 3; this.score = 0;
    this.invincible = false; this.invincibleTimer = 0;
    this.invincibleDuration = 2; this.blinkTimer = 0; this.visible = true;
    this.shootCooldown = 0; this.shootInterval = 0.25;
    this.spreadActive = false; this.spreadTimer = 0; this.spreadDuration = 10;
    this.multiplierActive = false; this.multiplierTimer = 0;
    this.multiplierDuration = 10; this.multiplier = 1;
  }

  get alive() { return this.lives > 0; }

  update(dt, input) {
    if ((input.isDown('ArrowLeft') || input.isDown('KeyA'))) this.x -= this.speed * dt;
    if ((input.isDown('ArrowRight') || input.isDown('KeyD'))) this.x += this.speed * dt;
    if ((input.isDown('ArrowUp') || input.isDown('KeyW'))) this.y -= this.speed * dt;
    if ((input.isDown('ArrowDown') || input.isDown('KeyS'))) this.y += this.speed * dt;
    this.x = Math.max(0, Math.min(this.canvasWidth - this.width, this.x));
    this.y = Math.max(0, Math.min(this.canvasHeight - this.height, this.y));

    if (this.shootCooldown > 0) this.shootCooldown -= dt;

    if (this.invincible) {
      this.invincibleTimer -= dt;
      this.blinkTimer += dt;
      this.visible = Math.floor(this.blinkTimer / 0.1) % 2 === 0;
      if (this.invincibleTimer <= 0) { this.invincible = false; this.visible = true; }
    }

    if (this.spreadActive && (this.spreadTimer -= dt) <= 0) this.spreadActive = false;
    if (this.multiplierActive && (this.multiplierTimer -= dt) <= 0) {
      this.multiplierActive = false; this.multiplier = 1;
    }
  }

  shoot() {
    if (this.shootCooldown > 0) return [];
    this.shootCooldown = this.spreadActive ? 0.15 : this.shootInterval;
    const cx = this.x + this.width / 2 - 2, cy = this.y;
    if (this.spreadActive) {
      return [-30, 0, 30].map(deg => {
        const r = deg * Math.PI / 180;
        return new Bullet(cx, cy, Math.sin(r) * 500, -Math.cos(r) * 500, true);
      });
    }
    return [new Bullet(cx, cy, 0, -500, true)];
  }

  hit() {
    if (this.invincible) return false;
    this.lives--;
    this.invincible = true; this.invincibleTimer = this.invincibleDuration; this.blinkTimer = 0;
    return true;
  }

  applyPickup(type) {
    if (type === 'shield') this.lives = Math.min(this.lives + 1, 5);
    else if (type === 'spread') { this.spreadActive = true; this.spreadTimer = this.spreadDuration; }
    else if (type === 'life') this.lives++;
    else if (type === 'multiplier') { this.multiplierActive = true; this.multiplierTimer = this.multiplierDuration; this.multiplier = 2; }
  }
}

export class Enemy {
  constructor(x, y, type) {
    this.x = x; this.y = y; this.type = type; this.alive = true;
    this.time = Math.random() * Math.PI * 2;
    this._diving = false; this._diveTargetX = 0; this._diveTargetY = 0; this.vx = 0;
    switch (type) {
      case 'drone':   this.width=28; this.height=20; this.hp=1; this.points=100; this.speed=80;  this.shootInterval=3; break;
      case 'fighter': this.width=32; this.height=28; this.hp=2; this.points=250; this.speed=120; this.shootInterval=2; break;
      case 'kamikaze':this.width=24; this.height=24; this.hp=1; this.points=150; this.speed=180; this.shootInterval=Infinity; break;
    }
    this.baseX = x; this.vy = this.speed;
    this.shootCooldown = this.shootInterval * Math.random();
  }

  update(dt, playerX, playerY, canvasHeight) {
    this.time += dt; this.shootCooldown -= dt;
    if (this.type === 'drone') {
      this.x = this.baseX + Math.sin(this.time * 1.5) * 60;
      this.y += this.speed * dt;
    } else if (this.type === 'fighter') {
      if (!this._diving && this.y > 80) {
        this._diving = true; this._diveTargetX = playerX; this._diveTargetY = playerY;
      }
      if (this._diving) {
        const dx = this._diveTargetX - this.x, dy = this._diveTargetY - this.y;
        const dist = Math.hypot(dx, dy) || 1;
        this.x += dx / dist * this.speed * dt; this.y += dy / dist * this.speed * dt;
        if (Math.abs(this._diveTargetY - this.y) < 5) { this._diving = false; this.vy = this.speed * 0.5; }
      } else { this.y += this.vy * dt; }
    } else if (this.type === 'kamikaze') {
      if (!this._diving && this.y > 50) {
        this._diving = true;
        const dx = playerX - this.x, dy = playerY - this.y, dist = Math.hypot(dx, dy) || 1;
        this.vx = dx / dist * this.speed; this.vy = dy / dist * this.speed;
      }
      this.x += this.vx * dt; this.y += this.vy * dt;
    }
    if (this.y > canvasHeight + 60) this.alive = false;
  }

  shoot(playerX, playerY) {
    if (this.shootCooldown > 0 || this.type === 'kamikaze') return null;
    this.shootCooldown = this.shootInterval;
    const cx = this.x + this.width / 2, cy = this.y + this.height;
    const dx = playerX - cx, dy = playerY - cy, dist = Math.hypot(dx, dy) || 1;
    return new Bullet(cx - 2, cy, dx / dist * 200, dy / dist * 200, false);
  }

  hit() { this.hp--; if (this.hp <= 0) this.alive = false; return !this.alive; }
}

export class Boss {
  constructor(canvasWidth) {
    this.width = 80; this.height = 60;
    this.x = (canvasWidth - this.width) / 2; this.y = -this.height;
    this.canvasWidth = canvasWidth; this.hp = 30; this.maxHp = 30;
    this.points = 1000; this.alive = true; this.entered = false;
    this.targetY = 80; this.vxDir = 1; this.shootCooldown = 2;
  }
  get phase() { return this.hp > 20 ? 1 : this.hp > 10 ? 2 : 3; }
  get shootInterval() { return [null, 2, 1.5, 1][this.phase]; }

  update(dt, canvasWidth) {
    if (!this.entered) {
      this.y += 100 * dt;
      if (this.y >= this.targetY) { this.y = this.targetY; this.entered = true; }
      return;
    }
    const speed = [null, 100, 150, 220][this.phase];
    this.x += this.vxDir * speed * dt;
    if (this.x + this.width >= canvasWidth) { this.vxDir = -1; this.x = canvasWidth - this.width; }
    if (this.x <= 0) { this.vxDir = 1; this.x = 0; }
    this.shootCooldown -= dt;
  }

  shoot(playerX, playerY) {
    if (!this.entered || this.shootCooldown > 0) return [];
    this.shootCooldown = this.shootInterval;
    const cx = this.x + this.width / 2 - 2, cy = this.y + this.height;
    if (this.phase === 1) return [-30,0,30].map(d => { const r=d*Math.PI/180; return new Bullet(cx,cy,Math.sin(r)*200,Math.cos(r)*200,false); });
    if (this.phase === 2) return [-60,-30,0,30,60].map(d => { const r=d*Math.PI/180; return new Bullet(cx,cy,Math.sin(r)*220,Math.cos(r)*220,false); });
    const dx=playerX-cx, dy=playerY-cy, dist=Math.hypot(dx,dy)||1;
    return [new Bullet(cx, cy, dx/dist*150, dy/dist*150, false, true)];
  }

  hit() { this.hp--; if (this.hp <= 0) this.alive = false; return !this.alive; }
}

export class Pickup {
  constructor(x, y, type) {
    this.x=x; this.y=y; this.type=type; this.width=16; this.height=16; this.vy=60; this.alive=true;
  }
  update(dt, canvasHeight) { this.y += this.vy * dt; if (this.y > canvasHeight) this.alive = false; }
}

export class Particle {
  constructor(x, y, color) {
    this.x=x; this.y=y; this.color=color;
    this.size = 3 + Math.random() * 4;
    const a = Math.random() * Math.PI * 2, s = 50 + Math.random() * 150;
    this.vx = Math.cos(a)*s; this.vy = Math.sin(a)*s;
    this.life = 0.4 + Math.random()*0.4; this.maxLife = this.life; this.alive = true;
  }
  update(dt) {
    this.x += this.vx*dt; this.y += this.vy*dt;
    this.size *= 0.95; this.life -= dt;
    if (this.life <= 0) this.alive = false;
  }
}
