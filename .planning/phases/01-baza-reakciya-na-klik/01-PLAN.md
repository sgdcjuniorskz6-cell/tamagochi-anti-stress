---
wave: 1
phase: 1
name: "База + Реакция на клик"
requirements: PET-01, PET-02, PET-03
---

# Plan: База + Реакция на клик

## must_haves

### truths
- Питомец (Emoji) отображается по центру экрана
- При клике на питомца происходит анимация (прыжок/смех)
- В простое питомец имеет легкую idle-анимацию (покачивание/дыхание)
- Дизайн выполнен в пастельных тонах, антистресс-стиль
- Все анимации плавные (200-400ms) с transition или @keyframes
- Разделение на HTML/CSS/JS в отдельных файлах
- Уважение prefers-reduced-motion

### prohibitions
- Никаких внешних зависимостей (CDN, библиотеки, npm)
- Никаких агрессивных анимаций (быстрее 150ms)
- Никаких звуков в этой фазе (звуки — Phase 4)

---

## Wave 1: HTML-структура и CSS-дизайн

**read_first:** 01-RESEARCH.md

**files_modified:**
- index.html
- style.css

### Задачи Wave 1

1. **Создать index.html**:
   - DOCTYPE html, charset UTF-8, viewport
   - Подключить style.css и script.js
   - Центрированный контейнер для питомца
   - Emoji питомца: `<span class="pet" id="pet">🐣</span>`
   - Легкий заголовок сверху

2. **Создать style.css**:
   - CSS Custom Properties: --bg-start, --bg-end, --pet-shadow, --transition-speed
   - Body: высота 100vh, flexbox центрирование
   - Фон: пастельный градиент (warm white → lavender)
   - Карточка питомца: border-radius: 24px, box-shadow, padding 40px
   - @keyframes breathe: scale 1.0-1.05, 3s ease-in-out
   - @keyframes bounce: translateY(-40px) + scale(1.2), 400ms
   - Классы: .pet--idle, .pet--happy
   - prefers-reduced-motion: отключить анимации
   - will-change: transform на питомце

**Acceptance criteria:**
- index.html открывается в браузере
- В центре страницы emoji-питомец с idle-анимацией
- Фон с пастельным градиентом
- Карточка питомца с мягкой тенью

---

## Wave 2: Логика реакций

**depends_on:** Wave 1
**read_first:** 01-RESEARCH.md

**files_modified:**
- script.js

### Задачи Wave 2

1. **Создать script.js**:
   - DOMContentLoaded — инициализация
   - Получить элемент #pet
   - Добавить класс .pet--idle по умолчанию
   - Обработчик click:
     - Удалить .pet--idle, добавить .pet--happy
     - setTimeout 400ms → удалить .pet--happy, добавить .pet--idle
   - Смена emoji при клике: &#x1F423; → &#x1F60A; (счастливый)
   - После анимации вернуть исходный emoji

**Acceptance criteria:**
- Питомец реагирует на клик анимацией (.pet--happy)
- После 400ms возвращается в idle (.pet--idle)
- Idle-анимация работает непрерывно
- Emoji меняется на счастливый при клике

---

## Wave 3: Проверка

**depends_on:** Wave 2

### Задачи Wave 3

1. **Проверить все требования**:
   - Открыть index.html в браузере
   - Проверить отображение питомца
   - Проверить idle-анимацию
   - Проверить реакцию на клик
   - Проверить возврат в idle

**Acceptance criteria:**
- Все три требования фазы (PET-01, PET-02, PET-03) выполнены
- Визуал приятный, пастельные тона
- Анимации плавные, не дерганые

---

## Verification Checklist

### PET-01 (Отображение питомца)
- [ ] Питомец (🐣) виден при загрузке страницы
- [ ] Emoji меняется при клике на счастливый (😊)

### PET-02 (Idle-анимация)
- [ ] Idle-анимация (легкое покачивание/дыхание) активна
- [ ] Анимация плавная, длительность ~3s

### PET-03 (Реакция на клик)
- [ ] Клик — анимация прыжка/смеха (bounce)
- [ ] После 400ms возврат в idle
- [ ] Анимация не прерывается и не ломается при быстрых кликах
