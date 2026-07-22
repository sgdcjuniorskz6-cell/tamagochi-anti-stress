---
wave: 1
phase: 4
name: "Звуки"
requirements: PET-08, PET-09, PET-10, PET-11
---

# Plan: Звуки

## must_haves

### truths
- Web Audio API, zero dependencies
- AudioContext lazy init (первый user gesture)
- Все звуки мягкие, gain ≤ 0.3
- Envelope (gain ramp) на всех звуках — без щелчков

### prohibitions
- Никаких внешних аудиофайлов
- Никаких резких/громких звуков
- Никаких зависимостей

---

## Wave 1: Click + Eating sounds (PET-08, PET-09)

**files_modified:**
- script.js

### Задачи

1. **AudioContext singleton** — getAudioContext():
   - Создаёт AudioContext при первом вызове
   - resume() если suspended

2. **playClickSound()**:
   - Oscillator sine 660→880Hz, 200ms
   - Gain 0.3→0.001 envelope
   - Интегрировать в click handler (после boostMood)

3. **playEatSound()**:
   - Два низких thud: 120Hz + 100Hz через 120ms
   - Gain 0.3→0.001, 80ms каждый
   - Интегрировать в feed handler

---

## Wave 2: Petting + Ambient (PET-10, PET-11)

**depends_on:** Wave 1

**files_modified:**
- script.js

### Задачи

1. **Purr sounds** — startPurrSound() / stopPurrSound():
   - Oscillator 50Hz sine, gain 0.15
   - LFO (4Hz) для модуляции амплитуды (эффект мурлыканья)
   - start: mousedown handler
   - stop: mouseup/mouseleave handler

2. **Ambient mood sound** — updateAmbient(mood):
   - Oscillator sine ~1800Hz, gain 0.05 (очень тихо)
   - Запуск при mood > 70
   - Остановка при mood < 30
   - Интегрировать в applyMood()

---

## Wave 3: Проверка

**depends_on:** Wave 2

**Задачи:**
1. Проверить звук клика (PET-08)
2. Проверить звук кормления (PET-09)
3. Проверить звук поглаживания (PET-10)
4. Проверить фоновый звук от настроения (PET-11)

---

## Verification Checklist

### PET-08 (Звук клика)
- [ ] При клике — короткий мелодичный звук
- [ ] Плавное начало/конец (без щелчков)

### PET-09 (Звук кормления)
- [ ] При кормлении — звук «еды»
- [ ] Не длиннее 300ms

### PET-10 (Звук поглаживания)
- [ ] При mousedown — низкий гул/мурлыканье
- [ ] При mouseup/mouseleave — прекращается

### PET-11 (Фоновый звук)
- [ ] При mood > 70 — мягкий фон
- [ ] При mood < 30 — тишина/минимум
