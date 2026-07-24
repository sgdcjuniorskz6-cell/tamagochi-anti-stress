# Phase 6 Summary: Мини-игра — мячик

**Status:** Complete

## Delivered

### Files Modified
- `index.html` — кнопка ⚽ Бросить мяч, элемент .ball
- `style.css` — .play-btn, .ball, @keyframes throwBall/catchReaction, responsive
- `script.js` — throw logic, random catch/miss, sounds

### Game Mechanics
- Bаton click → ball flies left-to-right (500ms, CSS animation)
- 70% catch / 30% miss (Math.random)
- Catch: emoji 😎 + catchReaction animation + mood +10 + sound
- Miss: emoji 😕 + descending tone sound
- Button disabled during animation
- 1.2s cooldown before next throw

### Sounds
- Throw: pitch sweep 800→1200→400Hz (whistle)
- Catch: ascending 3-tone (600→800→1000Hz)
- Miss: descending 300→200Hz

### Requirements
| Req | Status | Description |
|-----|--------|-------------|
| PET-16 | ✓ | Mini-game: ball throw, fly animation, catch/miss, sounds |
