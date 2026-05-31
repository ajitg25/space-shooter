# Space Shooter

A browser-based retro arcade game built with vanilla HTML5 Canvas. No dependencies, no build tools — just open and play.

## Demo

<video src="https://github.com/ajitg25/space-shooter/raw/main/space-shooter.mov" controls width="480"></video>

## Gameplay

- **Waves** of enemies with increasing difficulty
- **Boss fight** every 5 waves with 3 phases
- **Pickups** — spread shot, shield, 2x score multiplier, extra life
- **High score** saved locally

## Controls

| Key | Action |
|-----|--------|
| `WASD` / Arrow keys | Move |
| `Space` | Shoot |

## Enemy Types

| Enemy | HP | Points | Behavior |
|-------|----|--------|----------|
| Drone | 1 | 100 | Sinusoidal formation |
| Fighter | 2 | 250 | Swoops toward player |
| Kamikaze | 1 | 150 | Dives directly at you |
| Boss | 30 | 1000 | 3-phase attack patterns |

## Run Locally

```bash
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000).

## Stack

- HTML5 Canvas 2D API
- ES Modules (no bundler)
- `localStorage` for high score
