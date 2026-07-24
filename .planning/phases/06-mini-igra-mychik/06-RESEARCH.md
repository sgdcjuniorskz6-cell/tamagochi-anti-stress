# Phase 6 Research: Мини-игра — мячик

## Technical Approaches

### Ball Animation
- Создать `<span class="ball" id="ball">⚽</span>` в HTML
- CSS-класс `.ball--flying`:
  - @keyframes: translateX(-150px) → translateX(0) + scale
  - Время: ~500ms, ease-in-out
- После анимации: убрать класс, показать результат

### Pet Catch Animation
- Успех: pet показывает новый emoji (😎 гордый)
- Промах: pet 😕 (удивлённый)
- Через 1s возврат к idle emoji (по mood)

### Success Rate
- Базовый шанс: 70% (зависит от mood?)
- Можно сделать +10% если mood > 70
- Или просто 70/30 для простоты

### Sound
- Бросок: короткий свист (high pitch chirp ~1000Hz)
- Ловля: довольный звук
- Промах: разочарованный звук (low descending tone)

### UI
- Кнопка с мячом: `⚽ Бросить мяч`
- Анимация: мяч появляется слева, летит к питомцу
- После ловли/промаха — мяч исчезает
