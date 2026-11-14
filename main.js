import './style.css';
import { Game } from './core/Game.js';
import { Hud } from './ui/Hud.js';
import { Save } from './survival/Save.js';
import { TOTAL_NIGHTS } from './survival/Progression.js';

const $ = (id) => document.getElementById(id);

function showError(message) {
  const el = $('error');
  el.textContent = message;
  el.classList.remove('hidden');
  $('play-btn').disabled = true;
  $('new-btn').classList.add('hidden');
}

function init() {
  const overlay = $('overlay');
  const playBtn = $('play-btn');
  const newBtn = $('new-btn');
  const msg = $('overlay-msg');
  const tutorial = $('tutorial');
  const tutorialTitle = $('tutorial-title');
  const tutorialDescription = $('tutorial-description');
  const tutorialIcon = $('tutorial-icon');
  const tutorialKeys = $('tutorial-keys');
  const tutorialCount = $('tutorial-step-count');
  const tutorialProgress = $('tutorial-progress-fill');
  const tutorialNext = $('tutorial-next');
  const tutorialSkip = $('tutorial-skip');

  const tutorialSlides = [
    {
      icon: '🎮', title: 'Welcome to the Island',
      description: 'Your goal is to survive all 150 nights. Explore the island, collect supplies, and prepare before darkness falls.',
      keys: [['W A S D', 'Move your character'], ['Mouse', 'Look around and aim'], ['Shift', 'Sprint (uses stamina)'], ['Space', 'Jump']]
    },
    {
      icon: '❤️', title: 'Watch Your Survival Stats',
      description: 'Keep every bar above zero. If health runs out, your run ends. Sprinting uses stamina, while heat and cold make survival harder.',
      keys: [['HEALTH', 'Your life. Avoid monster attacks'], ['HUNGER', 'Eat berries or meat with Q'], ['THIRST', 'Drink at the lake with E'], ['STAMINA', 'Rest when it gets low']]
    },
    {
      icon: '🪵', title: 'Gather Food and Materials',
      description: 'Walk close to objects and press E when the on-screen prompt appears. Collect wood, stone, and berries. Find the lake to drink water.',
      keys: [['E', 'Collect nearby resources'], ['E at lake', 'Drink water'], ['Q', 'Eat berries or raw meat'], ['I', 'Open or close inventory']]
    },
    {
      icon: '🌙', title: 'Prepare for the Night',
      description: 'The forest becomes dangerous after dark. A creature can appear from Night 2. Use your flashlight and stay alert.',
      keys: [['F', 'Turn flashlight on or off'], ['Aim flashlight', 'Point it at the creature to push it back'], ['Esc', 'Pause the game'], ['Objective', 'Check the task shown at the top']]
    },
    {
      icon: '🗡️', title: 'Craft and Fight',
      description: 'Collect enough materials before crafting. Face the monster and get close before attacking with your spear.',
      keys: [['G', 'Craft spear: 3 wood + 2 stone'], ['V', 'Attack with spear'], ['E near deer', 'Hunt deer (requires a spear)'], ['Q', 'Eat raw meat to restore hunger']]
    },
    {
      icon: '🔥', title: 'Build Your Safe Place',
      description: 'A campfire helps you recover health. A shelter protects you from monster attacks when you stay close to it.',
      keys: [['C', 'Build campfire: 5 wood + 3 stone'], ['B', 'Build shelter: 10 wood + 6 stone'], ['Campfire', 'Stay nearby to slowly restore health'], ['Shelter', 'Stay inside its safe area at night']]
    },
    {
      icon: '❄️', title: 'Weather and Your Final Goal',
      description: 'Weather changes as you progress: heat, rain, fog, snow, and storms. Survive each night, improve your supplies, and face the Night King on Night 150.',
      keys: [['Weather', 'Changes automatically with your level'], ['Night 150', 'Defeat the final boss'], ['Tip', 'Collect resources during the day and prepare before night'], ['Ready?', 'Good luck, survivor!']]
    }
  ];
  let tutorialIndex = 0;

  function renderTutorial() {
    const slide = tutorialSlides[tutorialIndex];
    tutorialIcon.textContent = slide.icon;
    tutorialTitle.textContent = slide.title;
    tutorialDescription.textContent = slide.description;
    tutorialCount.textContent = (tutorialIndex + 1) + ' / ' + tutorialSlides.length;
    tutorialProgress.style.width = ((tutorialIndex + 1) / tutorialSlides.length * 100) + '%';
    tutorialKeys.textContent = '';
    const isTouchDevice = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const lessonKeys = isTouchDevice && tutorialIndex === 0
      ? [['Joystick', 'Move your character'], ['Drag right side', 'Look around and aim'], ['Run button', 'Sprint (uses stamina)'], ['Jump button', 'Jump over obstacles']]
      : slide.keys;
    for (const [key, description] of lessonKeys) {
      const row = document.createElement('div');
      row.className = 'tutorial-key-row';
      const strong = document.createElement('strong');
      strong.textContent = key;
      const span = document.createElement('span');
      span.textContent = description;
      row.append(strong, span);
      tutorialKeys.appendChild(row);
    }
    tutorialNext.textContent = tutorialIndex === tutorialSlides.length - 1 ? 'Start Survival' : 'Next';
    tutorialSkip.textContent = 'Skip tutorial';
  }

  function beginGame() {
    tutorial.classList.add('hidden');
    try { localStorage.setItem('stickman99_tutorial_seen', 'yes'); } catch {}
    game.input.start();
  }

  function showTutorial() {
    tutorialIndex = 0;
    renderTutorial();
    tutorial.classList.remove('hidden');
  }

  tutorialNext.addEventListener('click', () => {
    if (tutorialIndex < tutorialSlides.length - 1) {
      tutorialIndex++;
      renderTutorial();
    } else {
      beginGame();
    }
  });
  tutorialSkip.addEventListener('click', beginGame);
  const hud = new Hud();

  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    $('touch-note').classList.remove('hidden');
    $('touch-note').textContent = 'Mobile: use the on-screen joystick and buttons. Drag the right side to look around.';
  }

  let game;
  try {
    game = new Game({ canvas: $('game'), hud });
  } catch (err) {
    console.error(err);
    showError('Could not start the 3D engine. Please use a browser with WebGL enabled and try again.');
    return;
  }

  // Touch controls: virtual joystick on the left, camera drag on the right.
  const mobileControls = $('mobile-controls');
  const joystick = $('joystick');
  const joystickKnob = $('joystick-knob');
  let joystickPointer = null;
  function updateJoystick(e) {
    const r = joystick.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const max = r.width * 0.34;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const scale = dist > max ? max / dist : 1;
    const x = dx * scale;
    const y = dy * scale;
    joystickKnob.style.left = `calc(50% + ${x}px)`;
    joystickKnob.style.top = `calc(50% + ${y}px)`;
    game.input.setTouchMove(x / max, -y / max);
  }
  function resetJoystick() {
    joystickPointer = null;
    joystickKnob.style.left = '50%';
    joystickKnob.style.top = '50%';
    game.input.setTouchMove(0, 0);
  }
  joystick.addEventListener('pointerdown', (e) => {
    if (!game.input.active) return;
    joystickPointer = e.pointerId;
    try { joystick.setPointerCapture(e.pointerId); } catch {}
    updateJoystick(e);
    e.preventDefault();
  });
  joystick.addEventListener('pointermove', (e) => {
    if (e.pointerId === joystickPointer) { updateJoystick(e); e.preventDefault(); }
  });
  joystick.addEventListener('pointerup', (e) => { if (e.pointerId === joystickPointer) resetJoystick(); });
  joystick.addEventListener('pointercancel', resetJoystick);
  mobileControls.querySelectorAll('[data-key]').forEach((btn) => {
    const code = btn.dataset.key;
    const hold = btn.dataset.hold === 'true' || code === 'Space';
    const down = (e) => {
      if (!game.input.active) return;
      game.input.touchAction(code, true);
      btn.classList.add('pressed');
      if (!hold) game.input.touchAction(code, false);
      e.preventDefault();
    };
    const up = () => { game.input.touchAction(code, false); btn.classList.remove('pressed'); };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('lostpointercapture', up);
  });
  $('mobile-pause').addEventListener('click', () => game.input.stop());

  let started = false; // has the player pressed Play this session
  let dead = false;
  let won = false;

  const saved = Save.load();
  if (saved) game.applyState(saved);

  function renderMenu() {
    if (won) {
      msg.textContent = 'You survived all ' + TOTAL_NIGHTS + ' nights and escaped the island!';
      playBtn.textContent = 'Play again';
      newBtn.classList.add('hidden');
    } else if (dead) {
      msg.textContent = 'You did not survive. You reached day ' + game.dayNumber + '.';
      playBtn.textContent = 'Try again';
      newBtn.classList.add('hidden');
    } else if (started) {
      msg.textContent = 'Paused';
      playBtn.textContent = 'Resume';
      newBtn.classList.remove('hidden');
    } else if (Save.exists()) {
      msg.textContent = 'Welcome back, survivor.';
      playBtn.textContent = 'Continue';
      newBtn.classList.remove('hidden');
    } else {
      msg.textContent = 'Survive the island. Gather, drink, eat, and stay alive.';
      playBtn.textContent = 'Play';
      newBtn.classList.add('hidden');
    }
  }

  game.input.onActiveChange = (active) => {
    game.setPaused(!active);
    hud.show(active);
    mobileControls.classList.toggle('hidden', !active || !(window.matchMedia && window.matchMedia('(pointer: coarse)').matches));
    overlay.classList.toggle('hidden', active);
    if (active) {
      started = true;
    } else {
      game.saveNow();
      renderMenu();
    }
  };

  game.onDeath = () => {
    dead = true;
    game.input.stop(); // shows the menu with the "You did not survive" message
  };

  game.onVictory = () => {
    won = true;
    game.input.stop();
  };

  playBtn.addEventListener('click', () => {
    if (dead || won) {
      game.newGame();
      dead = false;
      won = false;
    }
    let tutorialSeen = false;
    try { tutorialSeen = localStorage.getItem('stickman99_tutorial_seen') === 'yes'; } catch {}
    if (!tutorialSeen) showTutorial();
    else game.input.start();
  });

  newBtn.addEventListener('click', () => {
    game.newGame();
    dead = false;
    won = false;
    let tutorialSeen = false;
    try { tutorialSeen = localStorage.getItem('stickman99_tutorial_seen') === 'yes'; } catch {}
    if (!tutorialSeen) showTutorial();
    else game.input.start();
  });

  window.addEventListener('pagehide', () => {
    if (!game.paused) game.saveNow();
  });

  renderMenu();
  game.start();
}

try {
  init();
} catch (err) {
  console.error(err);
  showError('Something went wrong while loading the game: ' + (err && err.message ? err.message : err));
}
