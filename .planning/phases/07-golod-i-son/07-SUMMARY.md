# Phase 7 Summary: Голод и Сон

**Status:** Complete

## Delivered

### Files Modified
- `index.html` — две шкалы под mood bar
- `style.css` — .needs-bars, .hunger-fill, .sleep-fill, .pet--sleeping, @keyframes zzz
- `script.js` — полная система голода и сна

### Mechanics

| System | Range | Rate | Effect |
|--------|-------|------|--------|
| Hunger | 0–100 | +1/6s | >70 → 😫 |
| Energy | 100–0 | -1/10s | <30 → 🥱, <10 → 😴💤 |

### Interactions
- Feeding: hunger = 0
- Click / Pet / Play: energy = 100 (wake up)
- While sleeping (energy < 10): mood doesn't decay
- `.pet--sleeping` class: grayscale + zzz pulse animation
- prefers-reduced-motion: disables sleep effects

### Requirements
| Req | Status | Description |
|-----|--------|-------------|
| PET-19 | ✓ | Hunger system with timer and emoji |
| PET-20 | ✓ | Sleep system with tiredness and sleeping |
| PET-21 | ✓ | Wake up on any interaction |
