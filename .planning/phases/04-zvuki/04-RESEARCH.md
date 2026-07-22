# Phase 4 Research: Звуки (Web Audio API)

## Technical Approaches

### AudioContext Singleton
- Создать один AudioContext при первом взаимодействии (из-за autoplay policy)
- Все функции звука используют единый контекст
- resume() при первом вызове

### Click Sound (PET-08)
```js
function playClickSound() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(660, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}
```

### Eating Sound (PET-09)
- Короткий шумовой burst (AudioBuffer с random samples)
- Или два низких колебания (120Hz → 80Hz, sine)
```js
function playEatSound() {
  // Two quick low thuds
  playTone(120, 0.3, 0.08, ctx.currentTime);
  playTone(100, 0.3, 0.08, ctx.currentTime + 0.12);
}
```

### Petting Sound (PET-10)
- Непрерывный низкочастотный осциллятор (40-60Hz)
- Модуляция амплитуды для эффекта мурлыканья
- Запуск на mousedown, остановка на mouseup
```js
function startPurr() { /* oscillator + LFO modulation */ }
function stopPurr() { /* fade out + stop */ }
```

### Ambient Mood Sound (PET-11)
- Высокое настроение: gentle high-frequency pad (sine ~2000Hz, очень тихо)
- Низкое настроение: тишина
- Обновлять при изменении mood
```js
function updateAmbient(mood) {
  if (mood > 70) startAmbient();
  else stopAmbient();
}
```

### Sound Function Map
| Interaction | Sound | Duration |
|-------------|-------|----------|
| click | Rising chirp (660→880Hz) | 200ms |
| feed | Low double-thud (120→80Hz) | 300ms |
| pet (start) | Low purr (40Hz modulated) | continuous |
| pet (stop) | Fade out | 200ms |
| mood > 70 | Soft pad (2000Hz, -40dB) | continuous |
| mood < 30 | Silence | — |

## Pitfalls to Avoid
- ❌ AudioContext не создаётся до user gesture (autoplay policy)
- ❌ Слишком громкие звуки — gain не выше 0.3
- ❌ Утечка осцилляторов — всегда вызывать stop()
- ❌ Щелчки в начале/конце — использовать envelope (gain ramp)
