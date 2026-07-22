# Phase 1 Research: База + Реакция на клик

## Stack Research

- **HTML5**: Semantic structure, single-page app
- **CSS3**: @keyframes animations, transitions, flexbox, custom properties (variables)
- **JS (ES6+)**: DOM manipulation, Event Listeners, requestAnimationFrame for smooth idle

## Technical Approaches

### Emoji Pet Display
- Использовать `font-size` для масштабирования emoji
- Заключить emoji в `<div>` с CSS-классами для анимаций
- Разные emoji для разных состояний: 🐣 (счастливый), 🐥 (грустный), 😊 и т.д.

### Animation Patterns
- **Idle**: `@keyframes breathe` — легкое масштабирование (1.0 → 1.05 → 1.0), 3s duration
- **Click (happy)**: `@keyframes bounce` — прыжок вверх + scale, 400ms
- Использовать CSS classes для переключения состояний
- `transition: transform 200ms ease-out` для гладких переходов

### CSS Architecture
- Custom Properties for theme: `--color-bg`, `--color-pet`, `--transition-speed`
- BEM-like naming: `.pet`, `.pet--happy`, `.pet--idle`
- Gradient background for calming effect

### Color Palette (Anti-stress)
- Background: `#FFF5F5` (warm white) to `#F0E6FF` (soft lavender) gradient
- Pet area: `#FFE4E1` (misty rose) card with `#FFDAB9` (peach) accents
- Shadows: `box-shadow: 0 4px 20px rgba(0,0,0,0.05)`
- Interactive elements: `#FFB6C1` (light pink) hover states

## Pitfalls to Avoid

- ❌ Слишком быстрые анимации (>300ms) — не антистресс
- ❌ Тяжелые библиотеки — нарушают zero-dependency принцип
- ❌ Сложные состояния — проект для релаксации, не для игр
- ❌ Отсутствие `prefers-reduced-motion` — нарушает accessibility

## Best Practices

- `will-change: transform` для анимируемых элементов
- `prefers-reduced-motion: no-preference` для анимаций
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- Файлы: index.html, style.css, script.js (разделение по смыслу)
