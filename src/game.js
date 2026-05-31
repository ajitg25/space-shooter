import { KeyboardInput } from './input.js';
import { Player, Bullet, Enemy, Boss, Pickup, Particle } from './entities.js';
import { isBossWave, spawnWaveEnemies } from './waves.js';
import { drawPlayer, drawDrone, drawFighter, drawKamikaze, drawBoss, drawBullet, drawPickup, drawParticle, drawStars, drawHeart } from './sprites.js';

const W = 480, H = 640;

function makeStars() {
  return [
    ...Array.from({length:40}, () => ({ x:Math.random()*W, y:Math.random()*H, speed:20, size:1, alpha:0.4 })),
    ...Array.from({length:25}, () => ({ x:Math.random()*W, y:Math.random()*H, speed:50, size:1, alpha:0.7 })),
    ...Array.from({length:15}, () => ({ x:Math.random()*W, y:Math.random()*H, speed:100, size:2, alpha:1.0 })),
  ];
}

function overlap(a, b) {
  return a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y;
}

function pickupType() {
  const r = Math.random();
  return r < 0.03 ? 'life' : r < 0.30 ? 'spread' : r < 0.60 ? 'shield' : 'multiplier';
}

class Game {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.input = new KeyboardInput();
    this.state = 'menu';
    this.stars = makeStars();
    this.highScore = parseInt(localStorage.getItem('ss_hi') || '0', 10);
    this._last = null; this._enterHeld = false;
    this._clearTimer = 0; this._clearBonus = 0;
    this.wave = 1; this.player = null;
    this.enemies = []; this.bullets = []; this.pickups = []; this.particles = []; this.boss = null;
  }

  _newGame() {
    this.wave = 1; this.player = new Player(W, H);
    this.bullets = []; this.pickups = []; this.particles = [];
    this._beginWave();
  }

  _beginWave() {
    this.bullets = []; this.pickups = [];
    this.enemies = spawnWaveEnemies(this.wave, W);
    this.boss = isBossWave(this.wave) ? new Boss(W) : null;
    this.state = isBossWave(this.wave) ? 'boss' : 'playing';
  }

  _explode(x, y, color) {
    for (let i = 0; i < 10; i++) this.particles.push(new Particle(x, y, color));
  }

  _collide() {
    const pl = this.player;
    for (const b of this.bullets) {
      if (!b.alive || !b.fromPlayer) continue;
      for (const e of this.enemies) {
        if (!e.alive || !overlap(b, e)) continue;
        b.alive = false;
        if (e.hit()) {
          this._explode(e.x+e.width/2, e.y+e.height/2, '#ff4444');
          if (Math.random() < 0.10) this.pickups.push(new Pickup(e.x, e.y, pickupType()));
          pl.score += e.points * pl.multiplier;
        }
      }
      if (this.boss?.alive && overlap(b, this.boss)) {
        b.alive = false;
        if (this.boss.hit()) { this._explode(this.boss.x+40, this.boss.y+30, '#ff8800'); pl.score += this.boss.points * pl.multiplier; }
      }
    }
    for (const b of this.bullets) {
      if (!b.alive || b.fromPlayer || !overlap(b, pl)) continue;
      b.alive = false; pl.hit();
    }
    for (const e of this.enemies) {
      if (!e.alive || !overlap(e, pl)) continue;
      e.alive = false; this._explode(e.x+e.width/2, e.y+e.height/2, '#ff4444'); pl.hit();
    }
    for (const pk of this.pickups) {
      if (!pk.alive || !overlap(pk, pl)) continue;
      pk.alive = false; pl.applyPickup(pk.type);
    }
  }

  update(dt) {
    for (const s of this.stars) { s.y += s.speed*dt; if (s.y > H) { s.y=0; s.x=Math.random()*W; } }

    const fire = this.input.isDown('Enter') || this.input.isDown('Space');
    if (this.state === 'menu') {
      if (fire && !this._enterHeld) { this._enterHeld = true; this._newGame(); }
      if (!fire) this._enterHeld = false;
      return;
    }
    if (this.state === 'gameOver') {
      if (fire && !this._enterHeld) { this._enterHeld = true; this.state = 'menu'; }
      if (!fire) this._enterHeld = false;
      return;
    }
    if (this.state === 'waveClear') {
      if ((this._clearTimer -= dt) <= 0) { this.wave++; this._beginWave(); }
      return;
    }

    const pl = this.player;
    pl.update(dt, this.input);
    if (this.input.isDown('Space')) this.bullets.push(...pl.shoot());

    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.update(dt, pl.x+16, pl.y+16, H);
      const s = e.shoot(pl.x+16, pl.y); if (s) this.bullets.push(s);
    }
    if (this.boss?.alive) {
      this.boss.update(dt, W);
      this.bullets.push(...this.boss.shoot(pl.x+16, pl.y+16));
    }
    for (const b of this.bullets) b.update(dt, pl.x+16, pl.y+16);
    for (const pk of this.pickups) pk.update(dt, H);
    for (const p of this.particles) p.update(dt);

    this._collide();

    this.bullets   = this.bullets.filter(b => b.alive && b.y>-20 && b.y<H+20 && b.x>-10 && b.x<W+10);
    this.enemies   = this.enemies.filter(e => e.alive);
    this.pickups   = this.pickups.filter(p => p.alive);
    this.particles = this.particles.filter(p => p.alive);

    if (!pl.alive) {
      if (pl.score > this.highScore) { this.highScore = pl.score; localStorage.setItem('ss_hi', String(this.highScore)); }
      this.state = 'gameOver'; return;
    }
    const won = (this.state==='boss' && this.boss && !this.boss.alive) || (this.state==='playing' && this.enemies.length===0);
    if (won) { this._clearBonus = this.wave*500; pl.score += this._clearBonus; this._clearTimer = 2.5; this.state = 'waveClear'; }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, W, H);
    drawStars(ctx, this.stars);

    if (this.state === 'menu') { this._menu(); return; }
    if (this.state === 'gameOver') { this._over(); return; }

    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.type==='drone') drawDrone(ctx,e.x,e.y);
      else if (e.type==='fighter') drawFighter(ctx,e.x,e.y);
      else drawKamikaze(ctx,e.x,e.y);
    }
    if (this.boss?.alive) { drawBoss(ctx,this.boss.x,this.boss.y,this.boss.phase); this._bossBar(); }
    for (const b of this.bullets) drawBullet(ctx,b.x,b.y,b.fromPlayer);
    for (const pk of this.pickups) drawPickup(ctx,pk.x,pk.y,pk.type);
    for (const p of this.particles) { if (p.alive) drawParticle(ctx,p.x,p.y,p.size,p.color,p.life/p.maxLife); }
    if (this.player.visible) drawPlayer(ctx,this.player.x,this.player.y);

    this._hud();
    if (this.state === 'waveClear') this._clearScreen();
  }

  _menu() {
    const ctx = this.ctx; ctx.textAlign = 'center';
    ctx.fillStyle = '#00e5ff'; ctx.font = '22px "Press Start 2P"'; ctx.fillText('SPACE SHOOTER', W/2, 200);
    ctx.fillStyle = '#fff'; ctx.font = '10px "Press Start 2P"'; ctx.fillText('PRESS SPACE TO START', W/2, 300);
    ctx.fillStyle = '#ffcc00'; ctx.fillText(`HI-SCORE: ${this.highScore}`, W/2, 360);
    ctx.fillStyle = '#888'; ctx.font = '8px "Press Start 2P"';
    ctx.fillText('ARROWS/WASD: MOVE', W/2, 450); ctx.fillText('SPACE: SHOOT', W/2, 472);
  }

  _over() {
    const ctx = this.ctx; ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4444'; ctx.font = '28px "Press Start 2P"'; ctx.fillText('GAME OVER', W/2, 240);
    ctx.fillStyle = '#fff'; ctx.font = '10px "Press Start 2P"';
    ctx.fillText(`SCORE: ${this.player.score}`, W/2, 310); ctx.fillText(`WAVE: ${this.wave}`, W/2, 340);
    if (this.player.score > 0 && this.player.score >= this.highScore) {
      ctx.fillStyle = '#ffcc00'; ctx.fillText('NEW HIGH SCORE!', W/2, 380);
    }
    ctx.fillStyle = '#aaa'; ctx.font = '9px "Press Start 2P"'; ctx.fillText('PRESS SPACE TO RETRY', W/2, 450);
  }

  _clearScreen() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, H/2-60, W, 110);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ff88'; ctx.font = '16px "Press Start 2P"'; ctx.fillText(`WAVE ${this.wave} CLEAR!`, W/2, H/2-10);
    ctx.fillStyle = '#ffff00'; ctx.font = '10px "Press Start 2P"'; ctx.fillText(`+${this._clearBonus} BONUS`, W/2, H/2+24);
  }

  _hud() {
    const ctx = this.ctx;
    ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
    ctx.fillText(String(this.player.score), 10, 24);
    ctx.textAlign = 'center'; ctx.fillStyle = '#aaa'; ctx.fillText(`WAVE ${this.wave}`, W/2, 24);
    for (let i=0; i<this.player.lives; i++) drawHeart(ctx, W-20-i*18, 10);
    if (this.player.spreadActive) {
      ctx.fillStyle='#ffff00'; ctx.font='8px "Press Start 2P"'; ctx.textAlign='left';
      ctx.fillText(`SPREAD ${Math.ceil(this.player.spreadTimer)}s`, 10, H-10);
    }
    if (this.player.multiplierActive) {
      ctx.fillStyle='#ff8800'; ctx.font='8px "Press Start 2P"'; ctx.textAlign='right';
      ctx.fillText(`2x ${Math.ceil(this.player.multiplierTimer)}s`, W-10, H-10);
    }
  }

  _bossBar() {
    const ctx = this.ctx, bw=200, bh=10, bx=(W-bw)/2, by=H-30;
    ctx.fillStyle='#333'; ctx.fillRect(bx,by,bw,bh);
    const pct = this.boss.hp/this.boss.maxHp;
    ctx.fillStyle = pct>0.66?'#0f0':pct>0.33?'#ff0':'#f00';
    ctx.fillRect(bx,by,bw*pct,bh);
    ctx.fillStyle='#fff'; ctx.font='8px "Press Start 2P"'; ctx.textAlign='center';
    ctx.fillText('BOSS', W/2, by-4);
  }

  _loop(ts) {
    if (!this._last) this._last = ts;
    const dt = Math.min((ts - this._last) / 1000, 0.05);
    this._last = ts;
    this.update(dt); this.render();
    requestAnimationFrame(t => this._loop(t));
  }

  run() { requestAnimationFrame(t => this._loop(t)); }
}

const canvas = document.getElementById('gameCanvas');
if (!canvas) {
  document.body.innerHTML = '<p style="color:#fff;font-family:monospace;padding:20px">Error: canvas not found.</p>';
} else {
  new Game(canvas).run();
}
