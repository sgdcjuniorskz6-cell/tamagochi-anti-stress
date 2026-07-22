---
wave: 1
phase: 3
name: "Система настроения"
requirements: PET-06, PET-07, PET-14
---

# Plan: Система настроения

## must_haves

### truths
- mood 0–100, starts at 50
- Таймер снижает mood каждые 5s
- Взаимодействия повышают mood
- Mood bar под карточкой питомца
- Emoji питомца зависит от mood

### prohibitions
- Никаких звуков (Phase 4)
- Никаких внешних зависимостей
- Mood не блокирует взаимодействия

---

## Wave 1: Mood system + UI

**files_modified:**
- index.html
- style.css
- script.js

### Задачи

1. **index.html** — добавить `.mood-bar`:
   - `<div class="mood-bar"><div class="mood-fill" id="mood-fill"></div></div>`
   - Между питомцем и подсказкой

2. **style.css** — стили для mood-bar:
   - .mood-bar: width 200px, height 6px, border-radius 8px, фон #E8E0F0
   - .mood-fill: height 100%, border-radius inherit, transition width 0.5s
   - Градиент: от #B8A9C9 (sad) до #FFB6C1 (happy)

3. **script.js** — mood system:
   - mood = 50, MOOD_MAX = 100
   - updateMoodBar(mood): mood-fill width = mood%, bg = lerp(sad, happy)
   - getMoodEmoji(): >70 → 😊, 30-70 → 🐣, <30 → 🥺
   - applyMood(): updateMoodBar + если питомец в idle — сменить emoji
   - setInterval каждые 5s: mood -= 1, applyMood()
   - click +10, feed +15, pet +5 (в mousedown), capped
   - Вызывать applyMood() после каждого взаимодействия

---

## Wave 2: Проверка

**depends_on:** Wave 1

**Задачи:**
1. mood bar виден и меняет ширину
2. Бездействие → mood падает
3. Взаимодействия → mood растёт
4. Emoji меняется на разных уровнях

---

## Verification Checklist

### PET-06 (Система настроения)
- [ ] mood стартует с 50
- [ ] Таймер снижает mood со временем
- [ ] Emoji меняется в зависимости от mood

### PET-07 (Взаимодействие)
- [ ] click +10
- [ ] feed +15
- [ ] pet +5
- [ ] Бездействие → снижение

### PET-14 (Индикатор)
- [ ] Mood bar виден под питомцем
- [ ] Bar отображает текущий уровень
- [ ] Цвет bar меняется от sad к happy
