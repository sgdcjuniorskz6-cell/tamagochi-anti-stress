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
  let isWalking = false;
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

  const loadProgress = () => {
    const saved = storage.get('save', null);
    if (saved && saved.v === 1 && typeof saved.mood === 'number') {
      const elapsed = Math.max(0, (Date.now() - saved.t) / 1000);
      const capped = Math.min(elapsed, 1800);
      mood = Math.max(MOOD_MIN, saved.mood - Math.floor(capped / 5));
      hunger = Math.min(100, saved.hunger + Math.floor(capped / 6));
      energy = Math.max(0, saved.energy - Math.floor(capped / 10));
    }
  };
  const saveProgress = () => {
    storage.set('save', { v: 1, t: Date.now(), mood, hunger, energy });
  };
  loadProgress();

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
  const EVOLUTION = {
    '🐣': ['🐣', '🐥', '🐔'],
    '🐱': ['🐱', '🐈'],
    '🐶': ['🐶', '🐕'],
    '🐰': ['🐰', '🐇'],
    '🐼': ['🐼', '🐻']
  };
  const EVOLUTION_FEEDS = [10, 30];
  const getStageIndex = () => {
    const chain = EVOLUTION[petEmoji] || [petEmoji];
    const feeds = storage.get('stats', {}).feeds || 0;
    let idx = 0;
    EVOLUTION_FEEDS.forEach((f, i) => { if (feeds >= f) idx = i + 1; });
    return Math.min(idx, chain.length - 1);
  };
  const getStageEmoji = () => {
    const chain = EVOLUTION[petEmoji] || [petEmoji];
    return chain[getStageIndex()];
  };
  petEmoji = storage.get('pet', '🐣');
  const selectPet = (emoji) => {
    if (!PETS.includes(emoji)) return;
    petEmoji = emoji;
    storage.set('pet', emoji);
    petOptions.forEach(o => o.classList.toggle('pet-option--active', o.dataset.pet === emoji));
    clearTimeout(timeout);
    pet.classList.remove('pet--happy', 'pet--eating', 'pet--purring', 'pet--catch');
    pet.classList.add('pet--idle');
    pet.textContent = getStageEmoji();
  };
  petOptions.forEach(o => o.addEventListener('click', () => {
    if (isSleepBlocked || isGameActive || isWalking) return;
    selectPet(o.dataset.pet);
    playClickSound();
  }));
  selectPet(petEmoji);

  const checkEvolution = () => {
    const idx = getStageIndex();
    const prevIdx = storage.get('stageIdx', 0);
    if (idx > prevIdx) {
      storage.set('stageIdx', idx);
      const emoji = getStageEmoji();
      if (pet.classList.contains('pet--idle')) {
        pet.textContent = emoji;
      }
      showToast('⭐', 'Эволюция!', ` ${petEmoji} вырос до ${emoji}`);
      playWinSound();
      boostMood(5);
    }
  };
  storage.set('stageIdx', getStageIndex());

  const statsEls = {
    clicks: document.getElementById('stat-clicks'),
    feeds: document.getElementById('stat-feeds'),
    pets: document.getElementById('stat-pets'),
    plays: document.getElementById('stat-plays'),
    games: document.getElementById('stat-games'),
    sleeps: document.getElementById('stat-sleeps'),
    walks: document.getElementById('stat-walks')
  };
  let stats = storage.get('stats', {});
  const incrementStat = (key) => {
    stats[key] = (stats[key] || 0) + 1;
    storage.set('stats', stats);
    checkAchievements();
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

  const coinsEl = document.getElementById('coins');
  let coins = storage.get('coins', 15);
  const updateCoins = () => {
    coinsEl.textContent = '🪙 ' + coins;
  };
  const awardCoins = (amount) => {
    coins += amount;
    storage.set('coins', coins);
    updateCoins();
    checkAchievements();
  };
  updateCoins();

  const ACHIEVEMENTS = [
    { id: 'click10', emoji: '👆', title: 'Первые клики', desc: '10 кликов по питомцу', check: s => s.clicks >= 10 },
    { id: 'click100', emoji: '🌟', title: 'Орлиный палец', desc: '100 кликов по питомцу', check: s => s.clicks >= 100 },
    { id: 'feed1', emoji: '🍎', title: 'Первый обед', desc: 'Накормить питомца 1 раз', check: s => s.feeds >= 1 },
    { id: 'feed25', emoji: '🍰', title: 'Шеф-повар', desc: 'Накормить питомца 25 раз', check: s => s.feeds >= 25 },
    { id: 'pet10', emoji: '🤗', title: 'Ласковый хозяин', desc: '10 поглаживаний', check: s => s.pets >= 10 },
    { id: 'play5', emoji: '⚽', title: 'Игрок', desc: '5 игр в мяч', check: s => s.plays >= 5 },
    { id: 'games3', emoji: '🎮', title: 'Геймер', desc: 'Сыграть 3 мини-игры', check: s => s.games >= 3 },
    { id: 'sleep1', emoji: '😴', title: 'Крепкий сон', desc: 'Проснуться после сна', check: s => s.sleeps >= 1 },
    { id: 'coins50', emoji: '🪙', title: 'Копилка', desc: 'Накопить 50 монет', check: (s, ctx) => ctx.coins >= 50 },
    { id: 'mood100', emoji: '💖', title: 'Счастливчик', desc: 'Достичь настроения 100', check: (s, ctx) => ctx.mood >= 100 }
  ];
  let achievements = storage.get('achievements', []);
  const achvPanel = document.getElementById('achv-panel');
  const achvBadge = document.getElementById('achv-badge');
  const updateAchievementBadge = () => {
    achvBadge.textContent = achievements.length + '/' + ACHIEVEMENTS.length;
    achvBadge.hidden = achievements.length === 0;
  };
  const showToast = (emoji, title, desc) => {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `<span>${emoji}</span><div><strong>${title}</strong>${desc}</div>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('achievement-toast--show'));
    setTimeout(() => {
      toast.classList.remove('achievement-toast--show');
      setTimeout(() => toast.remove(), 450);
    }, 2500);
  };
  const showAchievementToast = (a) => {
    showToast(a.emoji, 'Достижение!', ` ${a.title} — ${a.desc}`);
  };
  const checkAchievements = () => {
    const ctx = { mood, coins };
    let unlockedAny = false;
    ACHIEVEMENTS.forEach(a => {
      if (achievements.includes(a.id)) return;
      if (a.check(stats, ctx)) {
        achievements.push(a.id);
        storage.set('achievements', achievements);
        unlockedAny = true;
        showAchievementToast(a);
      }
    });
    if (unlockedAny) {
      updateAchievementBadge();
      boostMood(5);
    }
  };
  const renderAchievements = () => {
    document.getElementById('achv-list').innerHTML = ACHIEVEMENTS.map(a => {
      const unlocked = achievements.includes(a.id);
      return `<div class="achievement-item${unlocked ? '' : ' achievement-item--locked'}">
        <span class="achv-emoji">${a.emoji}</span>
        <div><strong>${a.title}</strong><br><span class="achv-desc">${a.desc}</span></div>
        <span class="achv-state">${unlocked ? '✅' : '🔒'}</span>
      </div>`;
    }).join('');
  };
  document.getElementById('achv-btn').addEventListener('click', () => {
    if (isGameActive) return;
    renderAchievements();
    achvPanel.classList.add('stats-panel--open');
  });
  document.getElementById('achv-close').addEventListener('click', () => achvPanel.classList.remove('stats-panel--open'));
  achvPanel.addEventListener('click', (e) => {
    if (e.target === achvPanel) achvPanel.classList.remove('stats-panel--open');
  });
  updateAchievementBadge();

  // ========== ACCESSORIES SHOP ==========
  const ACCESSORIES = [
    { id: 'hat', emoji: '🎩', name: 'Шляпа', price: 15 },
    { id: 'glasses', emoji: '👓', name: 'Очки', price: 20 },
    { id: 'bow', emoji: '🎀', name: 'Бантик', price: 10 },
    { id: 'crown', emoji: '👑', name: 'Корона', price: 40 }
  ];
  let ownedAccessories = storage.get('accessories', []);
  let equippedAccessory = storage.get('equipped', null);
  const accessoryEl = document.getElementById('accessory');
  const shopPanel = document.getElementById('shop-panel');

  const updateAccessory = () => {
    if (equippedAccessory && ownedAccessories.includes(equippedAccessory)) {
      const item = ACCESSORIES.find(a => a.id === equippedAccessory);
      accessoryEl.textContent = item ? item.emoji : '';
      accessoryEl.hidden = false;
    } else {
      accessoryEl.hidden = true;
    }
  };

  const renderShop = () => {
    document.getElementById('shop-balance').textContent = '🪙 ' + coins;
    document.getElementById('shop-list').innerHTML = ACCESSORIES.map(item => {
      const owned = ownedAccessories.includes(item.id);
      const equipped = equippedAccessory === item.id;
      return `<div class="shop-item" data-id="${item.id}">
        <span class="shop-emoji">${item.emoji}</span>
        <div class="shop-info"><strong>${item.name}</strong><br><span class="shop-desc">${owned ? 'Куплено' : '🪙' + item.price}</span></div>
        <button class="shop-buy">${owned ? (equipped ? 'Надето' : 'Надеть') : 'Купить'}</button>
      </div>`;
    }).join('');
  };

  document.getElementById('shop-btn').addEventListener('click', () => {
    if (isGameActive) return;
    renderShop();
    shopPanel.classList.add('stats-panel--open');
  });
  document.getElementById('shop-close').addEventListener('click', () => shopPanel.classList.remove('stats-panel--open'));
  shopPanel.addEventListener('click', (e) => {
    if (e.target === shopPanel) shopPanel.classList.remove('stats-panel--open');
    const buyBtn = e.target.closest('.shop-buy');
    if (!buyBtn) return;
    const item = ACCESSORIES.find(a => a.id === buyBtn.closest('.shop-item').dataset.id);
    if (!item) return;
    if (!ownedAccessories.includes(item.id)) {
      if (coins < item.price) {
        buyBtn.classList.add('shop-buy--poor');
        setTimeout(() => buyBtn.classList.remove('shop-buy--poor'), 450);
        playWrongSound();
        return;
      }
      coins -= item.price;
      storage.set('coins', coins);
      updateCoins();
      ownedAccessories.push(item.id);
      storage.set('accessories', ownedAccessories);
      playCorrectSound();
    }
    equippedAccessory = equippedAccessory === item.id ? null : item.id;
    storage.set('equipped', equippedAccessory);
    updateAccessory();
    renderShop();
  });
  updateAccessory();

  // ========== DAILY REWARDS ==========
  const dateKey = () => {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  };
  const checkDailyReward = () => {
    const today = dateKey();
    const saved = storage.get('daily', null);
    if (saved && saved.date === today) return;
    let streak = 1;
    if (saved) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1) + '-' + yesterday.getDate();
      streak = saved.date === yKey ? saved.streak + 1 : 1;
    }
    const bonus = Math.min(streak, 7);
    const reward = 5 + bonus;
    storage.set('daily', { date: today, streak });
    awardCoins(reward);
    showToast('🎁', 'Ежедневная награда!', ` Серия: ${streak} · 🪙 +${reward}`);
  };
  checkDailyReward();

  // ========== WALK ==========
  const walkBtn = document.getElementById('walk-btn');
  const WALK_DURATION = 4000;
  const startWalk = () => {
    if (isSleepBlocked || isGameActive || isWalking) return;
    isWalking = true;
    walkBtn.disabled = true;
    clearTimeout(timeout);
    clearTimeout(playTimeout);
    pet.classList.remove('pet--idle', 'pet--happy', 'pet--eating', 'pet--purring');
    pet.classList.add('pet--walking');
    pet.textContent = '🐾';
    playThrowSound();
    incrementStat('walks');

    setTimeout(() => {
      pet.classList.remove('pet--walking');
      isWalking = false;
      walkBtn.disabled = false;
      if (!isSleepBlocked) {
        pet.classList.add('pet--idle');
        pet.textContent = getStateEmoji();
      }
      if (Math.random() < 0.5) {
        const found = 1 + Math.floor(Math.random() * 4);
        awardCoins(found);
        showToast('💎', 'Находка!', ` Питомец принёс 🪙 ${found}`);
        playCorrectSound();
      }
    }, WALK_DURATION);
  };
  walkBtn.addEventListener('click', startWalk);

  // ========== RESET ==========
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (isGameActive || isWalking) return;
    if (confirm('Точно сбросить игру? Весь прогресс будет удалён.')) {
      Object.keys(localStorage).forEach(k => { if (k.startsWith('tg_')) localStorage.removeItem(k); });
      location.reload();
    }
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
    gain.gain.linearRampToValueAtTime(0.01, now + 1);

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
    if (mood > 30) return getStageEmoji();
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
    document.getElementById('walk-btn').disabled = true;

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
    saveProgress();

    document.getElementById('sleep-timer').textContent = '';
    pet.classList.remove('pet--sleeping');
    pet.classList.add('pet--idle');
    pet.textContent = getStateEmoji();

    document.querySelectorAll('.food-btn').forEach(b => b.disabled = false);
    document.getElementById('play-btn').disabled = false;
    document.getElementById('walk-btn').disabled = false;
  };

  const applyMood = () => {
    const isSleeping = energy < 20;
    updateMoodBar(mood);
    if (mood > 70 && hunger <= 70) {
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
    saveProgress();
    checkAchievements();
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
    if (isSleepBlocked || isGameActive || isWalking) return;
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
    const price = parseInt(btn.dataset.price, 10) || 0;
    btn.addEventListener('click', () => {
      clearTimeout(timeout);
      if (isSleepBlocked || isGameActive || isWalking) return;
      if (coins < price) {
        btn.classList.add('food-btn--poor');
        setTimeout(() => btn.classList.remove('food-btn--poor'), 450);
        playWrongSound();
        return;
      }
      coins -= price;
      updateCoins();
      incrementStat('feeds');
      checkEvolution();
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
    if (isSleepBlocked || isGameActive || isWalking) return;
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
  document.addEventListener('mouseup', stopPetting);

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
    if (isSleepBlocked || isGameActive || isWalking) return;
    if (energy < 20) wakeUp();
    incrementStat('plays');
    energy = Math.max(0, energy - 15);
    updateSleepBar();
    hunger = Math.min(100, hunger + 10);
    updateHungerBar();
    saveProgress();
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
  let currentGameCleanup = null;

  const stopGame = () => {
    isGameActive = false;
    clearTimeout(gameTimer);
    if (currentGameCleanup) {
      currentGameCleanup();
      currentGameCleanup = null;
    }
    gameIntervals.forEach(clearInterval);
    gameIntervals = [];
    gameArena.innerHTML = '';
    gameArena.classList.remove('game-arena--active', 'game-arena--tall');
    gameBtns.forEach(b => b.disabled = false);
    applyMood();
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
      awardCoins(score);
      playWinSound();
      gameArena.innerHTML = `<div class="game-result">🫧 +${score} очков! Настроение +${boost} · 🪙 +${score}</div>`;
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
        awardCoins(correct);
        playWinSound();
        gameArena.innerHTML = `<div class="game-result">🔢 ${correct}/${total}. Настроение +${boost} · 🪙 +${correct}</div>`;
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
      awardCoins(score);
      playWinSound();
      gameArena.innerHTML = `<div class="game-result">🍎 +${score} поймано! Настроение +${boost} · 🪙 +${score}</div>`;
      setTimeout(stopGame, 2000);
    }, 15000);
  };

  // === SNAKE ===
  const startSnake = () => {
    gameArena.classList.add('game-arena--active', 'game-arena--tall');
    gameBtns.forEach(b => b.disabled = true);
    const size = 12;
    const cell = Math.floor(220 / size);
    let snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
    let dir = { x: 1, y: 0 };
    let nextDir = dir;
    let food = null;
    let score = 0;
    let alive = true;
    let interval;
    const startTime = Date.now();
    const DURATION = 20000;

    gameArena.innerHTML = `
      <div class="game-hud"><span>🐍 Змейка!</span><span class="game-score">0</span><button class="game-close">✕</button></div>
      <div class="snake-grid" style="--cols:${size};--cells:${cell}px"></div>
      <div class="snake-controls">
        <button class="snake-btn" data-dir="up">⬆</button>
        <button class="snake-btn" data-dir="left">⬅</button>
        <button class="snake-btn" data-dir="right">➡</button>
        <button class="snake-btn" data-dir="down">⬇</button>
      </div>
    `;

    const gridEl = gameArena.querySelector('.snake-grid');
    const render = () => {
      gridEl.innerHTML = '';
      const f = document.createElement('div');
      f.className = 'snake-cell snake-cell--food';
      f.style.gridArea = `${food.y + 1} / ${food.x + 1}`;
      gridEl.appendChild(f);
      snake.forEach((seg, i) => {
        const c = document.createElement('div');
        c.className = 'snake-cell' + (i === 0 ? ' snake-cell--head' : '');
        c.style.gridArea = `${seg.y + 1} / ${seg.x + 1}`;
        gridEl.appendChild(c);
      });
    };

    const spawnFood = () => {
      const cells = [];
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (!snake.some(s => s.x === x && s.y === y)) cells.push({ x, y });
        }
      }
      if (!cells.length) { endGame(); return; }
      food = cells[Math.floor(Math.random() * cells.length)];
    };

    const endGame = () => {
      if (!alive) return;
      alive = false;
      clearInterval(interval);
      const boost = Math.min(30, Math.floor(score / 2));
      const coinReward = Math.floor(score / 2);
      boostMood(boost);
      awardCoins(coinReward);
      playWinSound();
      gameArena.innerHTML = `<div class="game-result">🐍 ${score} очков! Настроение +${boost} · 🪙 +${coinReward}</div>`;
      setTimeout(stopGame, 2000);
    };

    const step = () => {
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= size || head.y < 0 || head.y >= size || snake.some(s => s.x === head.x && s.y === head.y)) {
        endGame();
        return;
      }
      snake.unshift(head);
      if (food && head.x === food.x && head.y === food.y) {
        score += 10;
        playCorrectSound();
        gameArena.querySelector('.game-score').textContent = score;
        spawnFood();
      } else {
        snake.pop();
      }
      render();
      if (Date.now() - startTime >= DURATION) endGame();
    };

    const setDir = (d) => {
      if (!alive) return;
      if (d === 'up' && dir.y !== 1) nextDir = { x: 0, y: -1 };
      if (d === 'down' && dir.y !== -1) nextDir = { x: 0, y: 1 };
      if (d === 'left' && dir.x !== 1) nextDir = { x: -1, y: 0 };
      if (d === 'right' && dir.x !== -1) nextDir = { x: 1, y: 0 };
    };
    const onKey = (e) => {
      const k = e.key.replace('Arrow', '').toLowerCase();
      if (['up', 'down', 'left', 'right'].includes(k)) setDir(k);
    };
    window.addEventListener('keydown', onKey);
    currentGameCleanup = () => window.removeEventListener('keydown', onKey);

    gameArena.querySelectorAll('.snake-btn').forEach(b => {
      b.addEventListener('click', () => setDir(b.dataset.dir));
      b.addEventListener('touchstart', (e) => { e.preventDefault(); setDir(b.dataset.dir); });
    });
    spawnFood();
    render();
    interval = setInterval(step, 150);
    gameIntervals.push(interval);
  };

  // === PONG ===
  const startPong = () => {
    gameArena.classList.add('game-arena--active', 'game-arena--tall');
    gameBtns.forEach(b => b.disabled = true);
    const W = 300;
    const H = 230;
    let score = 0;
    let lives = 3;
    let paddle = { x: W / 2 - 30, y: H - 20, w: 60, h: 10 };
    let ball = { x: W / 2, y: 30, vx: (Math.random() < 0.5 ? -1 : 1) * 2, vy: 2, r: 6 };
    let raf;
    let last = performance.now();
    let running = true;

    gameArena.innerHTML = `
      <div class="game-hud"><span>🏓 Пинг-понг!</span><span class="game-score">0</span><button class="game-close">✕</button></div>
      <canvas class="pong-canvas" width="${W}" height="${H}"></canvas>
    `;

    const canvas = gameArena.querySelector('.pong-canvas');
    const ctx = canvas.getContext('2d');

    const movePaddle = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      paddle.x = clientX - rect.left - paddle.w / 2;
      paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
    };
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      movePaddle(e.touches[0].clientX);
    }, { passive: false });
    canvas.addEventListener('pointermove', (e) => movePaddle(e.clientX));

    const loop = (now) => {
      if (!running) return;
      const dt = Math.min(50, now - last);
      last = now;
      const k = dt / 16.67;
      ball.x += ball.vx * k;
      ball.y += ball.vy * k;
      if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = -ball.vx; }
      if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx = -ball.vx; }
      if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = -ball.vy; }
      if (ball.vy > 0 && ball.y + ball.r >= paddle.y && ball.y + ball.r <= paddle.y + paddle.h && ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
        ball.vy = -ball.vy;
        score++;
        playPopSound();
        gameArena.querySelector('.game-score').textContent = score;
        const sp = Math.hypot(ball.vx, ball.vy);
        ball.vx *= (sp + 0.25) / sp;
        ball.vy *= (sp + 0.25) / sp;
      }
      if (ball.y - ball.r > H) {
        lives--;
        if (lives <= 0) { endPong(); return; }
        ball = { x: W / 2, y: 30, vx: (Math.random() < 0.5 ? -1 : 1) * 2, vy: 2, r: 6 };
      }
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#FFB6C1';
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fillStyle = '#A0C4E8';
      ctx.fill();
      ctx.fillStyle = '#B8A9C9';
      ctx.font = '12px sans-serif';
      ctx.fillText('❤️'.repeat(lives), 8, 16);
      raf = requestAnimationFrame(loop);
    };

    const endPong = () => {
      running = false;
      cancelAnimationFrame(raf);
      const boost = Math.min(30, Math.floor(score / 3));
      const coinReward = Math.floor(score / 3);
      boostMood(boost);
      awardCoins(coinReward);
      playWinSound();
      gameArena.innerHTML = `<div class="game-result">🏓 ${score} отбиваний! Настроение +${boost} · 🪙 +${coinReward}</div>`;
      setTimeout(stopGame, 2000);
    };

    currentGameCleanup = () => { running = false; cancelAnimationFrame(raf); };
    raf = requestAnimationFrame(loop);
  };

  gameArena.addEventListener('click', (e) => {
    if (e.target.classList.contains('game-close')) {
      clearTimeout(gameTimer);
      stopGame();
    }
  });

  gameBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isGameActive || isSleepBlocked || isWalking) return;
      stopAmbient();
      stopGame();
      isGameActive = true;
      incrementStat('games');
      const game = btn.dataset.game;
      if (game === 'bubbles') startBubbles();
      else if (game === 'math') startMath();
      else if (game === 'catch') startCatch();
      else if (game === 'snake') startSnake();
      else if (game === 'pong') startPong();
    });
  });

  requestAnimationFrame(() => {
    document.body.classList.add('page-loaded');
  });
  const petCard = document.getElementById('pet-card');
  petCard.classList.add('pet-enter');
  petCard.addEventListener('animationend', () => petCard.classList.remove('pet-enter'), { once: true });

  setInterval(saveProgress, 10000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveProgress();
  });
});
