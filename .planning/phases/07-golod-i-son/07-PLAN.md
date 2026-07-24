---
wave: 1
phase: 7
name: "Голод и Сон"
requirements: PET-19, PET-20, PET-21
---

# Plan: Голод и Сон

## must_haves

### truths
- Голод 0–100 (0 = сыт, 100 = голоден), растёт каждые 6s
- Сон/энергия 0–100 (100 = бодр), падает каждые 10s
- Визуальные шкалы под mood bar
- Emoji меняется от состояния
- Взаимодействие сбрасывает голод/восстанавливает энергию

---

## Wave 1: Hunger + Sleep

**files_modified:**
- index.html — добавить шкалы голода и сна
- style.css — стили шкал, Zzz анимация
- script.js — система голода и сна

### Задачи

1. **index.html** — `.hunger-bar` + `.sleep-bar` под mood-bar

2. **style.css** — стили для .hunger-bar (красноватый), .sleep-bar (голубой), @keyframes zzz

3. **script.js**:
   - hunger (0–100, +1/6s), energy (100–0, -1/10s)
   - Шкалы: ширины в %
   - getHungerEmoji(): >70 → 😫, иначе по mood
   - getSleepEmoji(): <10 → 😴💤, <30 → 🥱, иначе по hunger/mood
   - applySleep(): если energy < 10 → pet спит, mood не падает
   - Взаимодействия: feed → hunger = 0, click/pet/play → energy = 100
   - Zzz анимация: opacity pulse

---

## Verification Checklist

### PET-19 (Голод)
- [ ] Шкала голода видна, растёт со временем
- [ ] Кормление сбрасывает голод
- [ ] При голоде >70 → 😫

### PET-20 (Сон)
- [ ] Шкала энергии падает
- [ ] При energy <30 → 🥱, <10 → 😴💤
- [ ] Во сне mood не падает

### PET-21 (Пробуждение)
- [ ] Клик/кормление/поглаживание/игра будят питомца
- [ ] Energy восстанавливается до 100
