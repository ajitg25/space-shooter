# Space Shooter — Game Design Spec

**Date:** 2026-05-31  
**Stack:** Vanilla HTML5 Canvas, no dependencies

---

## Architecture

Single-page browser game. No build tools, no framework.

```
interactive-game/
  index.html   — shell, canvas element, script tags
  game.js      — game loop, state machine, entity management, input
  sprites.js   — all pixel art drawn via Canvas 2D API
  styles.css   — dark background, HUD font, fullscreen canvas
```

---

## Game States

```
MENU → PLAYING → WAVE_CLEAR → BOSS → PLAYING
                      ↓
                  GAME_OVER → MENU
```

- **MENU:** title screen, high score display, press Enter to start
- **PLAYING:** active gameplay loop
- **WAVE_CLEAR:** brief pause between waves, score tally shown
- **BOSS:** boss encounter (triggered every 5 waves)
- **GAME_OVER:** score + wave reached, restart prompt

---

## Player

- Movement: Arrow keys or WASD (clamped to canvas bounds)
- Shoot: Spacebar (auto-fire held)
- Lives: 3 (extra life pickup available)
- Hit: blink invincibility for 2s
- Weapon default: single shot
- Weapon upgrade: spread shot (3-way) available via pickup only (temporary, 10s)

---

## Enemies

| Type      | HP | Points | Behavior                        |
|-----------|----|--------|---------------------------------|
| Drone     | 1  | 100    | Moves in formation, shoots slow |
| Fighter   | 2  | 250    | Swoops toward player            |
| Kamikaze  | 1  | 150    | Dives directly at player        |
| Boss      | 30+| 1000   | Multi-phase, unique attack patterns |

---

## Wave Structure

| Waves  | Content                                      |
|--------|----------------------------------------------|
| 1–4    | Drones only, simple V/grid formations        |
| 5      | Boss #1 — slow, 3 HP phases, spread shots    |
| 6–9    | Drones + Fighters, denser bullet patterns    |
| 10     | Boss #2 — faster, homing missiles            |
| 11+    | All types, randomized formations, faster     |

Wave difficulty scales: enemy speed +5%, fire rate +10% per wave after 10.

---

## Pickups

Dropped randomly from destroyed enemies (10% chance):

| Pickup          | Effect                        |
|-----------------|-------------------------------|
| Shield restore  | Restore 1 life                |
| Spread shot     | 3-way fire for 10s            |
| Extra life      | +1 life (rare, 3% chance)     |
| Score multiplier| 2× points for 10s             |

---

## Scoring

- Drone: 100 pts | Fighter: 250 pts | Kamikaze: 150 pts | Boss: 1000 pts
- Wave clear bonus: `wave × 500 pts`
- Score multiplier pickup: 2× for 10 seconds
- High score persisted via `localStorage`

---

## Visuals

- **Background:** 3-layer parallax scrolling star field (slow/mid/fast)
- **Sprites:** Pixel art drawn with Canvas 2D `fillRect` patterns (no external images)
- **Explosions:** Particle system — 8–12 colored squares expand and fade
- **Font:** Press Start 2P (Google Fonts) for all HUD and menu text
- **Color palette:** Dark space (#0a0a1a bg), cyan player, red enemies, yellow pickups

---

## HUD

- Top-left: Score
- Top-center: Wave number
- Top-right: Lives (ship icons)
- Bottom: Active weapon indicator + multiplier timer (when active)

---

## Error Handling

- Canvas unavailable: show fallback message in HTML
- `localStorage` unavailable: high score silently disabled (no crash)

---

## Out of Scope

- Multiplayer
- Mobile/touch controls
- Sound (can be added later as a separate pass)
- Level editor
