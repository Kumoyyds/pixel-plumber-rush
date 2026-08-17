# Pixel Plumber Rush

Pixel Plumber Rush is an original, browser-native platformer built with HTML5 Canvas, vanilla JavaScript ES modules, and the Web Audio API. Race through a colorful pipeline course, collect coins, stomp enemies, use power-ups, and reach the finish gate before the hazards stop you.

## How to play

Start the game by clicking **START RUN** or pressing `Enter`, `Space`, or `↑` on the title screen.

| Action | Keyboard |
| --- | --- |
| Move | `A` / `D` or `←` / `→` |
| Jump | `W`, `↑`, or `Space` |
| Ground pound | Press `S` while falling, or press `S` + jump |
| Dash | `Shift` |
| Pause / resume | `Esc` or `P` |
| Restart after game over or victory | `R`, `Enter`, or `Space` |

Collect coins to build your score and combo multiplier. Stomp enemies from above or use a ground pound to defeat them. Power-ups provide temporary abilities such as a shield, a speed rush, or slowed enemy time.

Avoid spikes and pits. Checkpoint flags save your restart position. Reach the red finish gate at the end of the course to win. You have three hearts; taking damage temporarily grants invulnerability.

## Run locally

The project has no build step and no external dependencies. Serve the repository from a local HTTP server so the browser can load JavaScript modules:

```sh
python3 -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173) in a browser.

## Project structure

- `index.html` — Canvas host page and game entry point.
- `styles/game.css` — Page and canvas styling.
- `src/core/` — Game loop, input, camera, and physics.
- `src/entities/` — Player, enemies, and power-ups.
- `src/world/` — Level data, tiles, collision geometry, and rendering.
- `src/systems/` — Enemy, power-up, effect, and audio orchestration.
- `src/ui/` — HUD and menu presentation.

See [AGENTS.md](AGENTS.md) for architecture contracts and contribution boundaries.
