---
wave: 1
phase: 2
name: "Кормление + Поглаживание"
requirements: PET-04, PET-05, PET-13
---

# Plan: Кормление + Поглаживание

## must_haves

### truths
- Кнопки еды под питомцем, 3+ варианта (🍎 🍕 🍰)
- Клик по еде → питомец ест (emoji меняется, анимация)
- При поглаживании (mousedown) питомец реагирует
- Все анимации плавные, антистресс
- Код расширяет script.js, не ломает Phase 1

### prohibitions
- Никаких внешних зависимостей
- Никаких звуков (Phase 4)
- Никаких агрессивных анимаций

---

## Wave 1: UI кормления + логика

**read_first:** 02-RESEARCH.md

**files_modified:**
- index.html
- style.css
- script.js

### Задачи Wave 1

1. **index.html** — добавить контейнер `.food` с кнопками:
   - data-food="🍎", data-food="🍕", data-food="🍰", data-food="🍩"

2. **style.css** — стили для .food-menu и .food-btn:
   - Горизонтальный ряд с gap 12px
   - .food-btn: border-radius 50%, размер 56px, фон #FFE4E1
   - hover/focus: scale(1.1), тень
   - @keyframes eat: scale 1→0.9→1.1→1, 300ms
   - .pet--eating класс

3. **script.js** — добавить:
   - food константы
   - Функция feed(foodEmoji):
     - emoji питомца → foodEmoji на 600ms
     - Добавить .pet--eating
     - Через 600ms: вернуть 🐣, убрать класс
     - После еды: показать 😋 на 2s, затем 🐣

**Acceptance criteria:**
- 4 кнопки еды под питомцем
- Клик → питомец «ест» (emoji еды + анимация)
- После еды — сытый emoji (😋) на 2s
- Возврат в idle

---

## Wave 2: Поглаживание

**depends_on:** Wave 1

**files_modified:**
- style.css
- script.js

### Задачи Wave 2

1. **style.css** — @keyframes pet-purr: scale(1) → scale(1.03), 200ms
   - .pet--purring: анимация pet-purr, 200ms ease-in-out

2. **script.js** — добавить обработчики:
   - mousedown на питомце:
     - emoji → ☺️
     - добавить .pet--purring
   - mouseup/mouseleave:
     - убрать .pet--purring
     - emoji → 🐣
   - Предотвратить мешанину с click из Phase 1 (не кликать при поглаживании)

**Acceptance criteria:**
- Зажатие мыши на питомце → emoji ☺️ + пульсация
- Отпускание → возврат в idle
- Поглаживание не конфликтует с кликом

---

## Wave 3: Проверка

**depends_on:** Wave 2

**Задачи:**
1. Проверить PET-04: выбор еды, анимация кормления
2. Проверить PET-13: кнопки UI для еды
3. Проверить PET-05: поглаживание mousedown/mouseup
4. Проверить, что Phase 1 (клик/idle) не сломана

---

## Verification Checklist

### PET-04 (Кормление)
- [ ] 3+ кнопки еды отображаются
- [ ] Клик по еде → анимация + смена emoji
- [ ] Возврат в idle после еды

### PET-13 (UI кормления)
- [ ] Кнопки под питомцем, стилизованные
- [ ] Визуально приятные, hover-эффекты

### PET-05 (Поглаживание)
- [ ] mousedown → ☺️ + анимация
- [ ] mouseup/mouseleave → возврат в idle
- [ ] Не конфликтует с click
