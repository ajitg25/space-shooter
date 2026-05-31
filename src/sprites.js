export function drawPlayer(ctx, x, y) {
  ctx.fillStyle = '#00e5ff';
  ctx.fillRect(x+12, y+8, 8, 20); ctx.fillRect(x+4, y+16, 8, 12); ctx.fillRect(x+20, y+16, 8, 12); ctx.fillRect(x+14, y+2, 4, 8);
  ctx.fillStyle = '#ff6600'; ctx.fillRect(x+13, y+28, 6, 4);
  ctx.fillStyle = '#ffcc00'; ctx.fillRect(x+14, y+30, 4, 3);
}

export function drawDrone(ctx, x, y) {
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(x+6, y+4, 16, 12); ctx.fillRect(x+2, y+8, 24, 6);
  ctx.fillStyle = '#ff8888'; ctx.fillRect(x+11, y+2, 6, 6);
}

export function drawFighter(ctx, x, y) {
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(x+12, y+2, 8, 20); ctx.fillRect(x+2, y+10, 10, 14); ctx.fillRect(x+20, y+10, 10, 14);
  ctx.fillStyle = '#ffaa44'; ctx.fillRect(x+14, y, 4, 6);
}

export function drawKamikaze(ctx, x, y) {
  ctx.fillStyle = '#ff00ff';
  ctx.fillRect(x+8, y+2, 8, 18); ctx.fillRect(x+2, y+8, 6, 10); ctx.fillRect(x+16, y+8, 6, 10);
  ctx.fillStyle = '#ff88ff'; ctx.fillRect(x+10, y, 4, 4);
}

export function drawBoss(ctx, x, y, phase) {
  ctx.fillStyle = ['#ff2222','#ff7700','#aa00ff'][phase-1];
  ctx.fillRect(x+20, y+10, 40, 40); ctx.fillRect(x, y+20, 20, 24); ctx.fillRect(x+60, y+20, 20, 24);
  ctx.fillStyle = '#ffff00'; ctx.fillRect(x+32, y+4, 16, 12);
  ctx.fillStyle = '#888'; ctx.fillRect(x+10, y+36, 6, 14); ctx.fillRect(x+64, y+36, 6, 14);
}

export function drawBullet(ctx, x, y, fromPlayer) {
  ctx.fillStyle = fromPlayer ? '#00ffff' : '#ff4444';
  ctx.fillRect(x, y, 4, fromPlayer ? 12 : 8);
}

export function drawPickup(ctx, x, y, type) {
  ctx.fillStyle = {shield:'#00ff88',spread:'#ffff00',life:'#ff88ff',multiplier:'#ff8800'}[type]||'#fff';
  ctx.fillRect(x, y, 16, 16);
  ctx.fillStyle = '#000'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
  ctx.fillText({shield:'S',spread:'W',life:'♥',multiplier:'2x'}[type]||'?', x+8, y+11);
}

export function drawParticle(ctx, x, y, size, color, alpha) {
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.fillStyle = color; ctx.fillRect(x-size/2, y-size/2, size, size);
  ctx.globalAlpha = 1;
}

export function drawStars(ctx, stars) {
  for (const s of stars) {
    ctx.globalAlpha = s.alpha; ctx.fillStyle = '#fff'; ctx.fillRect(s.x, s.y, s.size, s.size);
  }
  ctx.globalAlpha = 1;
}

export function drawHeart(ctx, x, y) {
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(x+2,y,4,4); ctx.fillRect(x+6,y,4,4); ctx.fillRect(x,y+2,10,6);
  ctx.fillRect(x+2,y+8,6,2); ctx.fillRect(x+4,y+10,2,2);
}
