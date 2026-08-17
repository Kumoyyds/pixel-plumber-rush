# Pixel Plumber Rush agent guide

## Architecture

Pixel Plumber Rush is a browser-native HTML5 Canvas game using JavaScript ES modules. `src/main.js` is the browser entry point. `Game` owns the requestAnimationFrame loop and coordinates input, world updates, systems, camera tracking, and rendering. The project intentionally has no build step or runtime dependencies.

The game loop follows this order:

1. Read input and update entities/world systems.
2. Update camera and other presentation state.
3. Draw the world, systems, entities, and UI in that order.

## Module responsibilities

- `src/config.js`: shared constants and tunable game configuration.
- `src/core/Game.js`: application composition root and main animation loop.
- `src/core/Input.js`: keyboard state and frame-based `wasPressed` events.
- `src/core/Camera.js`: world-to-screen camera translation and following.
- `src/core/Physics.js`: reusable axis-aligned solid-rectangle movement/collision helpers.
- `src/entities/`: entity state plus entity-local update/draw behavior.
- `src/world/World.js`: world facade and background rendering.
- `src/world/Level.js`: level data and tile collection.
- `src/world/Tile.js`: solid tile geometry and tile rendering.
- `src/systems/`: collections and cross-entity orchestration for enemies, power-ups, effects, and audio.
- `src/ui/`: HUD and menu presentation; UI should consume game state rather than own gameplay rules.
- `styles/game.css`: page and canvas presentation only.

Stable interfaces include `Player.update(dt, world, input)`, `Player.draw(ctx, camera)`, `World.update(dt)`, `World.draw(ctx, camera)`, `World.getSolidRects()`, `EnemySystem.update(dt, player, world)`, `EnemySystem.draw(ctx, camera)`, `EffectSystem.update(dt)`, `EffectSystem.draw(ctx, camera)`, and `HUD.draw(ctx, gameState)`.

## Coordinate system

The game uses 2D canvas coordinates: the origin is at the top-left, `x` increases to the right, and `y` increases downward. World coordinates are in CSS pixels and are independent of the camera. Entity positions represent the top-left corner of their axis-aligned bounding box. Positive vertical velocity moves downward; jumps set a negative vertical velocity. `Camera.toScreen(x, y)` converts world coordinates to canvas coordinates.

## Coding conventions

- Use ES module `import`/`export` with explicit `.js` extensions.
- Use 2 spaces for indentation, semicolons, and double-quoted strings.
- Prefer small classes with explicit public methods and straightforward data flow.
- Keep gameplay constants in `src/config.js` instead of scattering magic numbers.
- Keep rendering side effects inside `draw` methods and simulation side effects inside `update` methods.
- Use `requestAnimationFrame` for the main loop and delta time in seconds for simulation.
- Keep browser-only setup at the entry point or in the owning module.

## Parallel agent boundaries

Agents should avoid modifying files outside their assigned scope. Coordinate changes to shared interfaces before editing consumers. In particular, treat `Game.js`, `config.js`, and the public methods listed above as shared contracts: update them deliberately and keep compatibility when possible. Prefer one focused change per worktree, and verify imports and the basic browser entry point before handing work back.
