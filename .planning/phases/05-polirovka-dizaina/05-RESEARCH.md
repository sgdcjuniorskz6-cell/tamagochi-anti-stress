# Phase 5 Research: Полировка дизайна

## Current Design Audit

### Что уже хорошо
- Пастельный градиент фона ✓
- border-radius: 24px на карточке ✓
- Мягкие тени ✓
- Food-btn: border-radius: 50% ✓
- Mood bar: скруглённый, с transition ✓

### Что можно улучшить
- Background: добавить subtle radial градиент/текстуру для глубины
- Container: max-width + padding для responsive
- Pet card: border, inner glow, более сложная тень
- Pet emoji: text-shadow для мягкости
- Title: более airy, font-weight 300
- Food buttons: уменьшить на малых экранах
- Hint: italic, opacity
- Добавить float-анимацию для карточки
- Media queries для < 480px

## Technical Plan

### CSS Improvements
1. `:root` — добавить новые CSS variables
2. Body — subtle radial overlay поверх градиента
3. Container — max-width: 400px, padding
4. Title — font-weight 300, letter-spacing больше
5. Pet-card — border: 1px solid rgba(255,255,255,0.5), более complex shadow
6. Pet — text-shadow для мягкости, filter: drop-shadow
7. Mood bar — width: 100%, max-width 240px
8. Food-btn — на малых экранах 48px
9. Hint — font-style: italic, opacity 0.7

### Animations
- @keyframes floatCard — легкое покачивание карточки (translateY 0→-4px)
- .pet-card—float класс для микро-анимации
- Увеличить transition覆盖面

### Responsive
- @media (max-width: 480px): уменьшить padding, font-size, emoji
