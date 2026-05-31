const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#0a0a1a';
ctx.fillRect(0, 0, 480, 640);
ctx.fillStyle = '#00e5ff';
ctx.font = '16px monospace';
ctx.textAlign = 'center';
ctx.fillText('scaffold ok', 240, 320);
