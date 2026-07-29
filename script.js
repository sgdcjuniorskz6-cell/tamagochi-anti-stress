document.addEventListener('DOMContentLoaded', () => {
  const pet = document.getElementById('pet');
  const moodFill = document.getElementById('mood-fill');

  const HAPPY_EMOJI = '😊';
  const FULL_EMOJI = '😋';
  const PURR_EMOJI = '☺️';
  const SAD_EMOJI = '🥺';
  const NEUTRAL_EMOJI = '🐣';
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
  let moodInterval;
  let hungerInterval;
  let energyInterval;
  let audioCtx = null;
  let purrNodes = null;
  let ambientNodes = null;

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
    if (mood > 30) return NEUTRAL_EMOJI;
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

  const applyMood = () => {
    const isSleeping = energy < 20;
    updateMoodBar(mood);
    if (mood > 70) {
      startAmbient();
    } else {
      stopAmbient();
    }
    if (isSleeping) {
      pet.classList.remove('pet--idle');
      pet.classList.add('pet--sleeping');
      pet.textContent = SLEEPING_EMOJI;
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
    if (pet.classList.contains('pet--eating')) return;
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
    clearTimeout(timeout);
    if (playBtn.disabled) return;
    if (energy < 20) wakeUp();
    energy = Math.max(0, energy - 15);
    updateSleepBar();
    hunger = Math.min(100, hunger + 10);
    updateHungerBar();
    playBtn.disabled = true;
    pet.classList.remove('pet--idle', 'pet--happy', 'pet--eating', 'pet--purring');

    playThrowSound();
    ball.classList.add('ball--flying');

    timeout = setTimeout(() => {
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

      timeout = setTimeout(resetAfterThrow, 1200);
    }, 500);
  });
});
