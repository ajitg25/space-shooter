import { Enemy } from './entities.js';

function g(type, cols, rows) {
  return cols.map((col, i) => ({ type, col, row: Array.isArray(rows) ? rows[i] : rows }));
}

const CONFIGS = [
  { enemies: [...g('drone',[0,1,2,3,4,5],0), ...g('drone',[1,2,3,4],1)] },
  { enemies: [...g('drone',[0,1,2,3,4,5],0), ...g('drone',[0,1,2,3,4,5],1)] },
  { enemies: [...g('drone',[0,1,2,3,4,5],0), ...g('fighter',[1,2,3,4],1)] },
  { enemies: [...g('drone',[0,2,3,5],0), ...g('kamikaze',[1,2,3,4],1)] },
  null, // wave 5: boss
  { enemies: [...g('drone',[0,1,2,3,4,5],0), ...g('fighter',[1,2,3,4],1)] },
  { enemies: [...g('fighter',[0,1,2,3,4,5],0), ...g('kamikaze',[1,2,3,4],1)] },
  { enemies: [...g('drone',[0,1,2,3,4,5],0), ...g('fighter',[1,4],1), ...g('kamikaze',[0,2,3,5],2)] },
  { enemies: [...g('fighter',[0,2,4],0), ...g('drone',[1,3,5],0), ...g('kamikaze',[0,1,2,3,4,5],1)] },
  null, // wave 10: boss
];

export const isBossWave = wave => wave % 5 === 0;

export function spawnWaveEnemies(wave, canvasWidth) {
  if (isBossWave(wave)) return [];
  const config = CONFIGS[(wave - 1) % CONFIGS.length] || CONFIGS[CONFIGS.length - 2];
  if (!config) return [];
  const colW = (canvasWidth - 60) / 6;
  return config.enemies.map(({ type, col, row }) =>
    new Enemy(30 + col * colW, -60 - row * 70, type)
  );
}
