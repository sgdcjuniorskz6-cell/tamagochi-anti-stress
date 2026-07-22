# Phase 2 Research: Кормление + Поглаживание

## Technical Approaches

### Food UI
- Ряд emoji-кнопок под карточкой питомца
- Каждая кнопка: food emoji + CSS (border-radius, hover)
- При клике: pet.textContent = food emoji, затем возврат
- Анимация: scale + translateY (как bounce, но короче)

### Eating Animation
- Быстрая смена emoji: питомец → еда → питомец
- CSS-класс `.pet--eating` с @keyframes (scale 1→0.9→1, 300ms)
- После анимации питомец меняет emoji на сытый (😋)

### Petting Mechanic
- mousedown → добавить класс `.pet--petting`, сменить emoji (☺️)
- mousemove (на питомце) → поддерживать состояние
- mouseup/mouseleave → убрать `.pet--petting`, вернуть idle
- Длительность анимации: 200ms для отзывчивости

### Emoji States
- 🐣 — обычный (idle)
- 😋 — сытый (после еды на 2s)
- ☺️ — довольный (при поглаживании)

### Code Organization
- Новые функции в script.js: `feed(foodEmoji)`, `startPetting()`, `stopPetting()`
- Константы для emoji в начале файла

## Pitfalls to Avoid
- ❌ Слишком много кнопок еды — 3-4 достаточно
- ❌ Поглаживание через click — только mousedown/mouseup
- ❌ Забыть mouseleave — питомец зависнет в состоянии поглаживания
