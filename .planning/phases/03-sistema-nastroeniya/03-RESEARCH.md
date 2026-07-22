# Phase 3 Research: Система настроения

## Technical Approaches

### Mood System
- `mood = 50` (0–100)
- `setInterval` каждые 5s: mood -= 1
- cap: Math.max(0, Math.min(100, mood))

### Mood Bar
- HTML: `<div class="mood-bar"><div class="mood-fill"></div></div>`
- CSS: .mood-bar — высота 6px, border-radius, фон #E8E0F0
- .mood-fill — ширина в %, фон gradient от sad (#B8A9C9) до happy (#FFB6C1)
- При каждом изменении mood — обновлять width и цвет

### Emoji by Mood
- mood > 70: 😊 (happy idle)
- mood 30–70: 🐣 (neutral idle)
- mood < 30: 🥺 (sad idle)
- applyMood(): обновить IDLE_EMOJI, если питомец не в активном состоянии

### Interaction Effects
- click: +10
- feed: +15
- pet: +5 (разово при старте, не непрерывно)
- Все capped на 100

### Code Organization
- Новая функция `applyMood()` — обновляет emoji и mood bar
- `updateMoodBar()` — визуал
- Интеграция в существующие обработчики событий
