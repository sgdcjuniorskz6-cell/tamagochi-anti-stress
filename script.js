document.addEventListener('DOMContentLoaded', () => {
  const pet = document.getElementById('pet');
  const moodFill = document.getElementById('mood-fill');

  const HAPPY_EMOJI = '😊';
  const FULL_EMOJI = '😋';
  const PURR_EMOJI = '☺️';
  const SAD_EMOJI = '🥺';
  let petEmoji = '🐣';
  const ANIMATION_DURATION = 400;
  const FEED_DURATION = 600;
  const FULL_DURATION = 2000;
  const MOOD_MAX = 100;
  const MOOD_MIN = 0;
  const MOOD_INITIAL = 50;
  const MOOD_DECAY_INTERVAL = 5000;
  const MOOD_CLICK_BOOST = 10;
  const MOOD_FEED_BOOST = 15;
  const MOOD_PET_BOOST = 5;

  const hungerFill = document.getElementById('hunger-fill');
  const sleepFill = document.getElementById('sleep-fill');

  let mood = MOOD_INITIAL;
  let hunger = 0;
  let energy = 100;
  let timeout;
  let playTimeout;
  let isSleepBlocked = false;
  let sleepTimeout;
  let sleepCountdown;
  const SLEEP_DURATION = 15000;
  let moodInterval;
  let hungerInterval;
  let energyInterval;
  let audioCtx = null;
  let purrNodes = null;
  let ambientNodes = null;

  const storage = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem('tg_' + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem('tg_' + key, JSON.stringify(value));
      } catch (e) {}
    }
  };

  const themeBtn = document.getElementById('theme-btn');
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  };
  let theme = storage.get('theme', 'light');
  applyTheme(theme);
  themeBtn.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    storage.set('theme', theme);
    applyTheme(theme);
  });

  const petOptions = document.querySelectorAll('.pet-option');
  const PETS = ['🐣', '🐱', '🐶', '🐰', '🐼'];
  petEmoji = storage.get('pet', '🐣');
  const selectPet = (emoji) => {
    if (!PETS.includes(emoji)) return;
    petEmoji = emoji;
    storage.set('pet', emoji);
    petOptions.forEach(o => o.classList.toggle('pet-option--active', o.dataset.pet === emoji));
    clearTimeout(timeout);
    pet.classList.remove('pet--happy', 'pet--eating', 'pet--purring', 'pet--catch');
    pet.classList.add('pet--idle');
    pet.textContent = emoji;
  };
  petOptions.forEach(o => o.addEventListener('click', () => {
    if (isSleepBlocked || isGameActive) return;
    selectPet(o.dataset.pet);
    playClickSound();
  }));
  selectPet(petEmoji);

  const statsEls = {
    clicks: document.getElementById('stat-clicks'),
    feeds: document.getElementById('stat-feeds'),
    pets: document.getElementById('stat-pets'),
    plays: document.getElementById('stat-plays'),
    games: document.getElementById('stat-games'),
    sleeps: document.getElementById('stat-sleeps')
  };
  let stats = storage.get('stats', {});
  const incrementStat = (key) => {
    stats[key] = (stats[key] || 0) + 1;
    storage.set('stats', stats);
  };
  const renderStats = () => {
    Object.keys(statsEls).forEach(k => {
      statsEls[k].textContent = stats[k] || 0;
    });
  };
  const statsPanel = document.getElementById('stats-panel');
  document.getElementById('stats-btn').addEventListener('click', () => {
    if (isGameActive) return;
    renderStats();
    statsPanel.classList.add('stats-panel--open');
  });
  document.getElementById('stats-close').addEventListener('click', () => statsPanel.classList.remove('stats-panel--open'));
  statsPanel.addEventListener('click', (e) => {
    if (e.target === statsPanel) statsPanel.classList.remove('stats-panel--open');
  });

  const getAudioContext = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  };

  const playTone = (freq, gainVal, duration, startTime) => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const playClickSound = () => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  };

  const playEatSound = () => {
    const now = getAudioContext().currentTime;
    playTone(120, 0.3, 0.08, now);
    playTone(100, 0.25, 0.08, now + 0.12);
  };

  const startPurrSound = () => {
    if (purrNodes) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(50, now);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(70, now);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5, now);
    lfoGain.gain.setValueAtTime(0.08, now);

    gain.gain.setValueAtTime(0.15, now);

    lfo.connect(lfoGain).connect(gain.gain);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);

    purrNodes = { osc1, osc2, gain, lfo, lfoGain };
  };

  const stopPurrSound = () => {
    if (!purrNodes) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    purrNodes.gain.gain.setValueAtTime(purrNodes.gain.gain.value, now);
    purrNodes.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    purrNodes.osc1.stop(now + 0.2);
    purrNodes.osc2.stop(now + 0.2);
    purrNodes.lfo.stop(now + 0.2);
    purrNodes = null;
  };

  const startAmbient = () => {
    if (ambientNodes) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1800, now);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2200, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 1);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);

    ambientNodes = { osc1, osc2, gain };
  };

  const stopAmbient = () => {
    if (!ambientNodes) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    ambientNodes.gain.gain.setValueAtTime(ambientNodes.gain.gain.value, now);
    ambientNodes.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    ambientNodes.osc1.stop(now + 0.5);
    ambientNodes.osc2.stop(now + 0.5);
    ambientNodes = null;
  };

  const lerpColor = (a, b, t) => {
    const ah = parseInt(a.slice(1), 16), ar = ah >> 16, ag = (ah >> 8) & 255, ab = ah & 255;
    const bh = parseInt(b.slice(1), 16), br = bh >> 16, bg = (bh >> 8) & 255, bb = bh & 255;
    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);
    return `rgb(${rr},${rg},${rb})`;
  };

  const SAD_COLOR = '#B8A9C9';
  const HAPPY_COLOR = '#FFB6C1';

  const HUNGRY_EMOJI = '😫';
  const SLEEPY_EMOJI = '🥱';
  const SLEEPING_EMOJI = '😴';

  const getIdleEmoji = () => {
    if (mood > 70) return HAPPY_EMOJI;
    if (mood > 30) return petEmoji;
    return SAD_EMOJI;
  };

  const getStateEmoji = () => {
    if (energy < 20) return SLEEPING_EMOJI;
    if (energy < 40) return SLEEPY_EMOJI;
    if (hunger > 70) return HUNGRY_EMOJI;
    return getIdleEmoji();
  };

  const updateMoodBar = (value) => {
    const pct = (value / MOOD_MAX) * 100;
    moodFill.style.width = pct + '%';
    moodFill.style.background = lerpColor(SAD_COLOR, HAPPY_COLOR, value / MOOD_MAX);
  };

  const updateHungerBar = () => {
    hungerFill.style.width = hunger + '%';
  };

  const updateSleepBar = () => {
    sleepFill.style.width = (energy) + '%';
  };

  const wakeUp = () => {
    energy = 100;
    updateSleepBar();
    pet.classList.remove('pet--sleeping');
  };

  const goToSleep = () => {
    if (isSleepBlocked) return;
    isSleepBlocked = true;
    clearTimeout(timeout);
    clearTimeout(playTimeout);

    pet.classList.remove('pet--idle', 'pet--happy', 'pet--eating', 'pet--purring');
    pet.classList.add('pet--sleeping');
    pet.textContent = SLEEPING_EMOJI;

    document.querySelectorAll('.food-btn').forEach(b => b.disabled = true);
    document.getElementById('play-btn').disabled = true;

    const timerEl = document.getElementById('sleep-timer');
    let remaining = SLEEP_DURATION / 1000;
    const tick = () => {
      remaining--;
      timerEl.textContent = remaining > 0 ? `😴 ${remaining}s` : '';
    };
    sleepCountdown = setInterval(tick, 1000);

    sleepTimeout = setTimeout(() => {
      clearInterval(sleepCountdown);
      wakeUpFromSleep();
    }, SLEEP_DURATION);
  };

  const wakeUpFromSleep = () => {
    clearTimeout(sleepTimeout);
    clearInterval(sleepCountdown);
    if (!isSleepBlocked) return;
    isSleepBlocked = false;
    energy = 100;
    updateSleepBar();
    incrementStat('sleeps');

    document.getElementById('sleep-timer').textContent = '';
    pet.classList.remove('pet--sleeping');
    pet.classList.add('pet--idle');
    pet.textContent = getStateEmoji();

    document.querySelectorAll('.food-btn').forEach(b => b.disabled = false);
    document.getElementById('play-btn').disabled = false;
  };

  const applyMood = () => {
    const isSleeping = energy < 20;
    updateMoodBar(mood);
    if (mood > 70) {
      startAmbient();
    } else {
      stopAmbient();
    }
    if (isSleeping) {
      goToSleep();
      return;
    }
    const isIdle = pet.classList.contains('pet--idle');
    const isAnimating = pet.classList.contains('pet--happy') || pet.classList.contains('pet--eating') || pet.classList.contains('pet--purring');
    if (isIdle && !isAnimating) {
      pet.textContent = getStateEmoji();
    }
  };

  const boostMood = (amount) => {
    clearInterval(moodInterval);
    mood = Math.min(MOOD_MAX, mood + amount);
    applyMood();
    startMoodDecay();
  };

  const startMoodDecay = () => {
    clearInterval(moodInterval);
    moodInterval = setInterval(() => {
      if (energy < 20) return;
      mood = Math.max(MOOD_MIN, mood - 1);
      applyMood();
    }, MOOD_DECAY_INTERVAL);
  };

  const startHungerTimer = () => {
    hungerInterval = setInterval(() => {
      hunger = Math.min(100, hunger + 1);
      updateHungerBar();
      if (hunger > 70 && document.querySelector('.pet--idle')) {
        pet.textContent = getStateEmoji();
      }
    }, 6000);
  };

  const startEnergyTimer = () => {
    energyInterval = setInterval(() => {
      energy = Math.max(0, energy - 1);
      updateSleepBar();
      applyMood();
    }, 10000);
  };

  pet.classList.add('pet--idle');
  updateMoodBar(mood);
  updateHungerBar();
  updateSleepBar();
  startMoodDecay();
  startHungerTimer();
  startEnergyTimer();

  pet.addEventListener('click', () => {
    clearTimeout(timeout);
    if (isSleepBlocked || isGameActive) return;
    incrementStat('clicks');
    wakeUp();
    playClickSound();
    boostMood(MOOD_CLICK_BOOST);
    pet.classList.remove('pet--idle', 'pet--purring');
    pet.classList.add('pet--happy');
    pet.textContent = HAPPY_EMOJI;

    timeout = setTimeout(() => {
      pet.classList.remove('pet--happy');
      pet.classList.add('pet--idle');
      pet.textContent = getStateEmoji();
    }, ANIMATION_DURATION);
  });

  document.querySelectorAll('.food-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      clearTimeout(timeout);
      if (isSleepBlocked || isGameActive) return;
      incrementStat('feeds');
      wakeUp();
      hunger = 0;
      updateHungerBar();
      playEatSound();
      boostMood(MOOD_FEED_BOOST);
      pet.classList.remove('pet--idle', 'pet--happy', 'pet--purring');
      pet.classList.add('pet--eating');
      pet.textContent = btn.dataset.food;

      timeout = setTimeout(() => {
        pet.classList.remove('pet--eating');
        pet.textContent = FULL_EMOJI;
        pet.classList.add('pet--idle');

        timeout = setTimeout(() => {
          pet.textContent = getStateEmoji();
        }, FULL_DURATION);
      }, FEED_DURATION);
    });
  });

  pet.addEventListener('mousedown', () => {
    clearTimeout(timeout);
    if (isSleepBlocked || isGameActive) return;
    if (pet.classList.contains('pet--eating')) return;
    incrementStat('pets');
    wakeUp();
    startPurrSound();
    boostMood(MOOD_PET_BOOST);
    pet.classList.remove('pet--idle', 'pet--happy');
    pet.classList.add('pet--purring');
    pet.textContent = PURR_EMOJI;
  });

  const stopPetting = () => {
    if (pet.classList.contains('pet--eating')) return;
    stopPurrSound();
    pet.classList.remove('pet--purring');
    pet.classList.add('pet--idle');
    pet.textContent = getStateEmoji();
  };

  pet.addEventListener('mouseup', stopPetting);
  pet.addEventListener('mouseleave', stopPetting);

  const ball = document.getElementById('ball');
  const playBtn = document.getElementById('play-btn');
  const PROUD_EMOJI = '😎';
  const SURPRISED_EMOJI = '😕';
  const MOOD_PLAY_BOOST = 10;

  const playThrowSound = () => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  };

  const playCatchSound = () => {
    const now = getAudioContext().currentTime;
    playTone(600, 0.2, 0.08, now);
    playTone(800, 0.2, 0.08, now + 0.1);
    playTone(1000, 0.2, 0.08, now + 0.2);
  };

  const playMissSound = () => {
    const now = getAudioContext().currentTime;
    playTone(300, 0.15, 0.15, now);
    playTone(200, 0.1, 0.2, now + 0.15);
  };

  const resetAfterThrow = () => {
    pet.classList.remove('pet--catch');
    pet.classList.add('pet--idle');
    pet.textContent = getStateEmoji();
    playBtn.disabled = false;
  };

  playBtn.addEventListener('click', () => {
    clearTimeout(playTimeout);
    if (playBtn.disabled) return;
    if (isSleepBlocked || isGameActive) return;
    if (energy < 20) wakeUp();
    incrementStat('plays');
    energy = Math.max(0, energy - 15);
    updateSleepBar();
    hunger = Math.min(100, hunger + 10);
    updateHungerBar();
    playBtn.disabled = true;
    pet.classList.remove('pet--idle', 'pet--happy', 'pet--eating', 'pet--purring');

    playThrowSound();
    ball.classList.add('ball--flying');

    playTimeout = setTimeout(() => {
      ball.classList.remove('ball--flying');
      const caught = Math.random() < 0.7;

      if (caught) {
        boostMood(MOOD_PLAY_BOOST);
        pet.classList.add('pet--catch');
        pet.textContent = PROUD_EMOJI;
        playCatchSound();
      } else {
        pet.textContent = SURPRISED_EMOJI;
        playMissSound();
      }

      playTimeout = setTimeout(resetAfterThrow, 1200);
    }, 500);
  });

  // ========== MINI-GAMES ==========
  const gameArena = document.getElementById('game-arena');
  const gameBtns = document.querySelectorAll('.game-btn');
  let isGameActive = false;
  let gameTimer = null;
  let gameIntervals = [];

  const stopGame = () => {
    isGameActive = false;
    clearTimeout(gameTimer);
    gameIntervals.forEach(clearInterval);
    gameIntervals = [];
    gameArena.innerHTML = '';
    gameArena.classList.remove('game-arena--active');
    gameBtns.forEach(b => b.disabled = false);
  };

  const playPopSound = () => {
    const now = getAudioContext().currentTime;
    playTone(800, 0.12, 0.05, now);
    playTone(1000, 0.08, 0.04, now + 0.04);
  };

  const playCorrectSound = () => {
    const now = getAudioContext().currentTime;
    playTone(660, 0.15, 0.08, now);
    playTone(880, 0.15, 0.08, now + 0.08);
  };

  const playWrongSound = () => {
    const now = getAudioContext().currentTime;
    playTone(200, 0.12, 0.2, now);
  };

  const playWinSound = () => {
    const now = getAudioContext().currentTime;
    playTone(523, 0.15, 0.1, now);
    playTone(659, 0.15, 0.1, now + 0.1);
    playTone(784, 0.15, 0.15, now + 0.2);
  };

  // === BUBBLES ===
  const startBubbles = () => {
    gameArena.classList.add('game-arena--active');
    gameBtns.forEach(b => b.disabled = true);
    gameArena.innerHTML = '<div class="game-hud"><span>🫧 Лопай пузырьки!</span><span class="game-score">0</span><button class="game-close">✕</button></div>';
    let score = 0;
    const maxBubbles = 8;
    let spawnInterval;

    const popBubble = (el) => {
      if (!el.parentNode) return;
      score++;
      const scoreEl = gameArena.querySelector('.game-score');
      if (scoreEl) scoreEl.textContent = score;
      playPopSound();
      el.style.animation = 'bubblePop 300ms ease-out forwards';
      setTimeout(() => el.remove(), 300);
    };

    const spawnBubble = () => {
      const arena = gameArena;
      if (!arena.classList.contains('game-arena--active')) return;
      if (arena.querySelectorAll('.bubble').length >= maxBubbles) return;
      const el = document.createElement('div');
      el.className = 'bubble';
      const size = 1.5 + Math.random() * 1.5;
      el.style.fontSize = size + 'rem';
      el.style.left = (5 + Math.random() * 75) + '%';
      el.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
      el.style.animationDuration = (2.5 + Math.random() * 2) + 's';
      const emojis = ['🫧', '💎', '🌟', '✨', '💫'];
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.addEventListener('click', () => popBubble(el));
      arena.appendChild(el);
      el.addEventListener('animationend', () => { if (el.parentNode) el.remove(); });
    };

    for (let i = 0; i < 5; i++) spawnBubble();
    spawnInterval = setInterval(spawnBubble, 1000);
    gameIntervals.push(spawnInterval);

    gameTimer = setTimeout(() => {
      clearInterval(spawnInterval);
      gameArena.querySelectorAll('.bubble').forEach(el => el.remove());
      const boost = Math.min(30, score * 2);
      boostMood(boost);
      playWinSound();
      gameArena.innerHTML = `<div class="game-result">🫧 +${score} очков! Настроение +${boost}</div>`;
      setTimeout(stopGame, 2000);
    }, 15000);
  };

  // === MATH ===
  const startMath = () => {
    gameArena.classList.add('game-arena--active');
    gameBtns.forEach(b => b.disabled = true);
    let qIndex = 0;
    let correct = 0;
    const total = 10;

    const showQuestion = () => {
      if (qIndex >= total) {
        const boost = Math.max(0, Math.min(50, correct * 5 - (total - correct) * 2));
        boostMood(boost);
        playWinSound();
        gameArena.innerHTML = `<div class="game-result">🔢 ${correct}/${total}. Настроение +${boost}</div>`;
        setTimeout(stopGame, 2000);
        return;
      }
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const op = Math.random() > 0.5 ? '+' : '-';
      const ans = op === '+' ? a + b : a - b;
      const opts = [ans];
      let attempts = 0;
      while (opts.length < 4 && attempts < 50) {
        attempts++;
        const fake = ans + Math.floor(Math.random() * 12) - 6;
        if (!opts.includes(fake) && fake >= 0 && fake <= 20) opts.push(fake);
      }
      opts.sort(() => Math.random() - 0.5);

      gameArena.innerHTML = `
        <div class="game-hud"><span>🔢 Вопрос ${qIndex+1}/${total}</span><button class="game-close">✕</button></div>
        <div class="math-question">${a} ${op} ${b} = ?</div>
        <div class="math-options">
          ${opts.map(o => `<button class="math-btn">${o}</button>`).join('')}
        </div>
      `;

      let answered = false;
      gameArena.querySelectorAll('.math-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          const isCorrect = parseInt(btn.textContent) === ans;
          if (isCorrect) { correct++; playCorrectSound(); }
          else playWrongSound();
          btn.classList.add(isCorrect ? 'math-btn--correct' : 'math-btn--wrong');
          gameArena.querySelectorAll('.math-btn').forEach(b => b.disabled = true);
          qIndex++;
          setTimeout(showQuestion, 800);
        });
      });
    };
    showQuestion();
  };

  // === CATCH FOOD ===
  const startCatch = () => {
    gameArena.classList.add('game-arena--active');
    gameBtns.forEach(b => b.disabled = true);
    gameArena.innerHTML = '<div class="game-hud"><span>🍎 Лови еду!</span><span class="game-score">0</span><button class="game-close">✕</button></div>';
    let score = 0;
    let speed = 2200;
    let spawnInterval;
    const foods = ['🍎', '🍕', '🍰', '🍩', '🍇', '🍓'];

    const spawnFood = () => {
      const arena = gameArena;
      if (!arena.classList.contains('game-arena--active')) return;
      const el = document.createElement('div');
      el.className = 'falling-food';
      el.textContent = foods[Math.floor(Math.random() * foods.length)];
      el.style.left = (5 + Math.random() * 75) + '%';
      el.style.animationDuration = (speed / 1000) + 's';
      el.addEventListener('click', () => {
        if (!el.parentNode) return;
        score++;
        const scoreEl = gameArena.querySelector('.game-score');
        if (scoreEl) scoreEl.textContent = score;
        playPopSound();
        el.style.animation = 'none';
        el.textContent = '💥';
        el.style.fontSize = '1.2rem';
        el.style.top = el.offsetTop + 'px';
        setTimeout(() => el.remove(), 300);
      });
      el.addEventListener('animationend', () => { if (el.parentNode) el.remove(); });
      arena.appendChild(el);
    };

    spawnFood();
    spawnInterval = setInterval(() => {
      spawnFood();
      speed = Math.max(600, speed - 80);
    }, 1000);
    gameIntervals.push(spawnInterval);

    gameTimer = setTimeout(() => {
      clearInterval(spawnInterval);
      gameArena.querySelectorAll('.falling-food').forEach(el => el.remove());
      const boost = Math.min(30, score * 3);
      boostMood(boost);
      playWinSound();
      gameArena.innerHTML = `<div class="game-result">🍎 +${score} поймано! Настроение +${boost}</div>`;
      setTimeout(stopGame, 2000);
    }, 15000);
  };

  gameArena.addEventListener('click', (e) => {
    if (e.target.classList.contains('game-close')) {
      clearTimeout(gameTimer);
      stopGame();
    }
  });

  gameBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isGameActive || isSleepBlocked) return;
      stopGame();
      isGameActive = true;
      incrementStat('games');
      const game = btn.dataset.game;
      if (game === 'bubbles') startBubbles();
      else if (game === 'math') startMath();
      else if (game === 'catch') startCatch();
    });
  });

  requestAnimationFrame(() => {
    document.body.classList.add('page-loaded');
  });
  const petCard = document.getElementById('pet-card');
  petCard.classList.add('pet-enter');
  petCard.addEventListener('animationend', () => petCard.classList.remove('pet-enter'), { once: true });
});
