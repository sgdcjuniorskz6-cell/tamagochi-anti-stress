---
wave: 1
phase: 5
name: "Полировка дизайна"
requirements: PET-12
---

# Plan: Полировка дизайна

## must_haves

### truths
- Все изменения только CSS/HTML (не ломать JS)
- Единый пастельный стиль
- Responsive 375px–1440px
- Микро-анимации для премиального ощущения

### prohibitions
- Никаких новых зависимостей
- Никаких изменений в script.js
- Никаких изменений логики

---

## Wave 1: CSS-полировка + responsive

**files_modified:**
- style.css
- index.html

### Задачи

1. **index.html**:
   - Добавить класс .pet-card--float на карточку

2. **style.css**:
   - Новые CSS variables: --card-border, --card-glow, --pet-soft-shadow
   - Body: добавить radial-gradient overlay для глубины
   - Container: max-width 400px, padding 20px
   - Title: font-weight 300, letter-spacing 0.06em
   - Pet-card: border 1px solid rgba(255,255,255,0.6), box-shadow с glow, backdrop-filter
   - Pet: text-shadow 0 2px 8px rgba(0,0,0,0.1)
   - Mood bar: width 100%, max-width 240px
   - Hint: font-style italic, opacity 0.6
   - @keyframes floatCard: translateY 0→-6px, 4s ease-in-out
   - .pet-card--float: animation floatCard
   - Food-btn hover: border-color +0.2s delay для плавности
   - @media (max-width: 480px): pet font-size 4rem, pet-card padding 24px, food-btn 48px, title font-size 1.2rem
   - @media (min-width: 1024px): pet font-size 6rem, небольшие улучшения

---

## Wave 2: Проверка

**depends_on:** Wave 1

**Задачи:**
1. Проверить PET-12: антистресс-дизайн
2. Проверить responsive 375px–1440px
3. Проверить, что все анимации плавные

---

## Verification Checklist

### PET-12 (Антистресс-дизайн)
- [ ] Пастельные цвета, мягкие тени
- [ ] Единый стиль всех элементов
- [ ] Плавные переходы
- [ ] Микро-анимации
- [ ] Responsive (375px–1440px)
