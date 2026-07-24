---
wave: 1
phase: 6
name: "Мини-игра — мячик"
requirements: PET-16
---

# Plan: Мини-игра — мячик

## must_haves

### truths
- Кнопка броска под food-menu
- Мяч летит к питомцу с CSS-анимацией
- Рандом: 70% ловит, 30% мимо
- Питомец реагирует на результат
- Mood boost за ловлю

### prohibitions
- Никаких зависимостей
- Анимация не быстрее 300ms
- Не ломать существующие механики

---

## Wave 1: Mini-game UI + logic + sound

**files_modified:**
- index.html
- style.css
- script.js

### Задачи

1. **index.html**:
   - Кнопка `.play-btn` с ⚽ под food-menu
   - Спрятанный `.ball` элемент

2. **style.css**:
   - .play-btn: стиль как food-btn, но шире (auto, px padding)
   - .ball: position fixed, left 0, bottom 50%, font-size 2rem
   - @keyframes throwBall: translateX(-150px) → translateX(0), 500ms
   - .ball--flying: animation throwBall
   - @keyframes catchReaction: scale(1.3) 200ms

3. **script.js**:
   - playBtn click handler
   - Создать/показать мяч, запустить анимацию
   - Через 500ms: проверить catch/miss
   - Успех: +10 mood, emoji 😎, звук, мяч скрыть
   - Промах: emoji 😕, звук, мяч скрыть
   - Через 1s: возврат к idle
   - playThrowSound(), playCatchSound(), playMissSound()

---

## Wave 2: Проверка

**depends_on:** Wave 1

### Verification Checklist

### PET-16 (Мини-игра)
- [ ] Кнопка броска отображается
- [ ] Мяч летит к питомцу
- [ ] Питомец ловит/пропускает
- [ ] Разные реакции на успех/промах
- [ ] Sound effects
