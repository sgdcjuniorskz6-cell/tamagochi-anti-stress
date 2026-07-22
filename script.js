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

  let mood = MOOD_INITIAL;
  let timeout;
  let moodInterval;

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

  const getIdleEmoji = () => {
    if (mood > 70) return HAPPY_EMOJI;
    if (mood > 30) return NEUTRAL_EMOJI;
    return SAD_EMOJI;
  };

  const updateMoodBar = (value) => {
    const pct = (value / MOOD_MAX) * 100;
    moodFill.style.width = pct + '%';
    moodFill.style.background = lerpColor(SAD_COLOR, HAPPY_COLOR, value / MOOD_MAX);
  };

  const applyMood = () => {
    updateMoodBar(mood);
    const isIdle = pet.classList.contains('pet--idle');
    const isAnimating = pet.classList.contains('pet--happy') || pet.classList.contains('pet--eating') || pet.classList.contains('pet--purring');
    if (isIdle && !isAnimating) {
      pet.textContent = getIdleEmoji();
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
      mood = Math.max(MOOD_MIN, mood - 1);
      applyMood();
    }, MOOD_DECAY_INTERVAL);
  };

  pet.classList.add('pet--idle');
  updateMoodBar(mood);
  startMoodDecay();

  pet.addEventListener('click', () => {
    clearTimeout(timeout);
    boostMood(MOOD_CLICK_BOOST);
    pet.classList.remove('pet--idle', 'pet--purring');
    pet.classList.add('pet--happy');
    pet.textContent = HAPPY_EMOJI;

    timeout = setTimeout(() => {
      pet.classList.remove('pet--happy');
      pet.classList.add('pet--idle');
      pet.textContent = getIdleEmoji();
    }, ANIMATION_DURATION);
  });

  document.querySelectorAll('.food-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      clearTimeout(timeout);
      boostMood(MOOD_FEED_BOOST);
      pet.classList.remove('pet--idle', 'pet--happy', 'pet--purring');
      pet.classList.add('pet--eating');
      pet.textContent = btn.dataset.food;

      timeout = setTimeout(() => {
        pet.classList.remove('pet--eating');
        pet.textContent = FULL_EMOJI;
        pet.classList.add('pet--idle');

        timeout = setTimeout(() => {
          pet.textContent = getIdleEmoji();
        }, FULL_DURATION);
      }, FEED_DURATION);
    });
  });

  pet.addEventListener('mousedown', () => {
    clearTimeout(timeout);
    if (pet.classList.contains('pet--eating')) return;
    boostMood(MOOD_PET_BOOST);
    pet.classList.remove('pet--idle', 'pet--happy');
    pet.classList.add('pet--purring');
    pet.textContent = PURR_EMOJI;
  });

  const stopPetting = () => {
    if (pet.classList.contains('pet--eating')) return;
    pet.classList.remove('pet--purring');
    pet.classList.add('pet--idle');
    pet.textContent = getIdleEmoji();
  };

  pet.addEventListener('mouseup', stopPetting);
  pet.addEventListener('mouseleave', stopPetting);
});
