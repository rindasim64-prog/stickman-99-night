# STICKMAN: 99 NIGHTS (Stage 2 + 150-night progression)

Three.js + Vite. Requires Node.js 18+ (20+ recommended).

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # headless tests (weather, progression, inventory, survival stats)
npm run build    # production build in dist/ (relative paths, ready for HTML5 hosting)
```

## Controls
WASD move, mouse look, Shift sprint, Space jump, E collect/drink, Q eat berry, F flashlight, I inventory, C craft campfire (5 wood + 3 stone), Esc pause.
If the browser refuses Pointer Lock (some iframes), hold the left mouse button and drag to look.

## Structure
```
index.html
vite.config.js
src/
  main.js                    menu/overlay wiring, error handling
  style.css
  core/Game.js               renderer, scene, lights, main loop
  core/Input.js              keyboard + mouse (pointer lock with drag fallback)
  core/random.js             seeded RNG, hash, clamp
  world/terrain.js           pure height/walkability maths (shared with future AI)
  world/colliders.js         2D circle/box collision (pure)
  world/Island.js            terrain mesh, ocean, lake, forest, rocks, ruin
  world/Sky.js               stars + moon
  player/Stickman.js         procedural animated model
  player/PlayerController.js movement, jump, sprint stamina (pure)
  player/ThirdPersonCamera.js orbit camera with ground avoidance
tests/prototype.test.mjs
```

## Stage 2 adds
Health, hunger, thirst; wood/stone/berries to collect (respawn); drinking at the lake;
inventory; flashlight; day/night cycle with night counter; auto save/continue (localStorage);
game-over with Try again. New files: src/survival/*, src/world/Resources.js, src/ui/Hud.js.

## 150 nights
src/survival/Progression.js defines all 150 nights (TOTAL_NIGHTS). Each night has an objective
(collect / drink / survive) and a monster profile (speed, sight, hearing, search time, ambush
chance) that gets harder every single night, plus faster hunger/thirst drain. Every 10th night
is a "survive the long night" night. Surviving night 150 shows the victory screen.
The monster profile is data only until the monster AI is added.

## Not done yet (later stages)
Monster AI, crafting, shelter building, night objectives and the 3-night progression,
tutorial, caves, sound, weather, mobile controls, settings, victory screen, Playgama Bridge.


## Level-based weather
Weather changes automatically with the survival level: clear (1-10), heat (11-20), rain (21-30), fog (31-40), snow (41-50), storms (51-60), then increasingly harsh weather phases through level 150. Heat increases thirst/hunger drain and cold/storm conditions increase survival drain. Weather is shown in the HUD.

## Added survival gameplay (early implementation)
- A forest creature appears from night 2 onward, follows the player during the night, and attacks at close range. Aim the flashlight at it to push it back.
- Press C to craft one campfire using 5 wood and 3 stone. Stay within 4.5 metres to slowly recover health.
- These are first gameplay implementations and still need balancing, save persistence, and full playtesting.

## Added survival features
- Press G to craft a wooden spear (3 wood + 2 stone); press V to attack a monster while facing it.
- Deer wander around the island; approach and press E with a spear to collect raw meat. Eat food with Q.
- Press B to build a shelter (10 wood + 6 stone). Staying near its centre protects you from monster damage.
- Night 150 spawns the Night King boss with 350 health. Defeat it with spear attacks.

## First-time player tutorial
The first time a player presses Play in a browser, an English step-by-step tutorial explains movement, survival stats, gathering, night safety, crafting, combat, shelter, weather, and the Night 150 boss. Players can move through the guide, skip it, or start survival after the final page. The browser remembers that the tutorial has been completed.


## Mobile controls
- Left virtual joystick: move.
- Drag the right side of the screen: look around.
- On-screen buttons: collect, jump, attack, run, flashlight, eat, craft spear, campfire, shelter, inventory, and pause.
- Best played in landscape orientation on a modern Android browser with WebGL support.


## Branding update

The game title is **STICKMAN 99 NIGHTS**. The branded title-screen artwork and app icon are in `public/assets/`. The browser tab title and favicon use the same game branding.
