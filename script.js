document.addEventListener('DOMContentLoaded', () => {
  const pet = document.getElementById('pet');

  const HAPPY_EMOJI = '😊';
  const IDLE_EMOJI = '🐣';
  const ANIMATION_DURATION = 400;

  let timeout;

  pet.classList.add('pet--idle');

  pet.addEventListener('click', () => {
    clearTimeout(timeout);
    pet.classList.remove('pet--idle');
    pet.classList.add('pet--happy');
    pet.textContent = HAPPY_EMOJI;

    timeout = setTimeout(() => {
      pet.classList.remove('pet--happy');
      pet.classList.add('pet--idle');
      pet.textContent = IDLE_EMOJI;
    }, ANIMATION_DURATION);
  });
});
