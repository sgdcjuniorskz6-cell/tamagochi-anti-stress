document.addEventListener('DOMContentLoaded', () => {
  const pet = document.getElementById('pet');

  const IDLE_EMOJI = '🐣';
  const HAPPY_EMOJI = '😊';
  const FULL_EMOJI = '😋';
  const PURR_EMOJI = '☺️';
  const ANIMATION_DURATION = 400;
  const FEED_DURATION = 600;
  const FULL_DURATION = 2000;

  let timeout;

  pet.classList.add('pet--idle');

  pet.addEventListener('click', () => {
    clearTimeout(timeout);
    pet.classList.remove('pet--idle', 'pet--purring');
    pet.classList.add('pet--happy');
    pet.textContent = HAPPY_EMOJI;

    timeout = setTimeout(() => {
      pet.classList.remove('pet--happy');
      pet.classList.add('pet--idle');
      pet.textContent = IDLE_EMOJI;
    }, ANIMATION_DURATION);
  });

  document.querySelectorAll('.food-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      clearTimeout(timeout);
      pet.classList.remove('pet--idle', 'pet--happy', 'pet--purring');
      pet.classList.add('pet--eating');
      pet.textContent = btn.dataset.food;

      timeout = setTimeout(() => {
        pet.classList.remove('pet--eating');
        pet.textContent = FULL_EMOJI;
        pet.classList.add('pet--idle');

        timeout = setTimeout(() => {
          pet.textContent = IDLE_EMOJI;
        }, FULL_DURATION);
      }, FEED_DURATION);
    });
  });

  pet.addEventListener('mousedown', () => {
    clearTimeout(timeout);
    if (pet.classList.contains('pet--eating')) return;
    pet.classList.remove('pet--idle', 'pet--happy');
    pet.classList.add('pet--purring');
    pet.textContent = PURR_EMOJI;
  });

  const stopPetting = () => {
    if (pet.classList.contains('pet--eating')) return;
    pet.classList.remove('pet--purring');
    pet.classList.add('pet--idle');
    pet.textContent = IDLE_EMOJI;
  };

  pet.addEventListener('mouseup', stopPetting);
  pet.addEventListener('mouseleave', stopPetting);
});
