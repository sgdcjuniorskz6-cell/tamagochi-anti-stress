# Интерактивный тамагочи-антистресс

## What This Is

Виртуальный питомец в браузере, который реагирует на клики, кормление и поглаживания анимациями и звуками. Проект на чистом HTML/CSS/JS — никаких зависимостей, открывается в любом современном браузере.

## Core Value

Расслабление и радость от взаимодействия — питомец откликается на заботу живыми реакциями.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **PET-01**: Питомец отображается в браузере (SVG/Emoji) с базовыми состояниями
- [ ] **PET-02**: Реакция на клик (смех/прыжок) с анимацией
- [ ] **PET-03**: Механика кормления — питомец ест с анимацией
- [ ] **PET-04**: Поглаживание (drag/long-click) — питомец мурлычет
- [ ] **PET-05**: Система настроения — питомец меняет состояние со временем
- [ ] **PET-06**: Звуковые эффекты для всех реакций (Web Audio API)
- [ ] **PET-07**: Приятный антистресс-дизайн (мягкие цвета, анимации)

### Out of Scope

- Сохранение состояния (localStorage) — только сессионный опыт
- Мобильное приложение — только веб-версия
- Многопользовательский режим — только соло-опыт
- Прогрессия/уровни — чистый антистресс без геймификации

## Context

- Чистый HTML/CSS/JS — zero dependencies
- Питомец рисуется через SVG/Emoji
- Звуки через Web Audio API (синтезированные, без аудиофайлов)
- Проект для релаксации — никаких штрафов за "смерть" питомца
- Framer Motion установлен для анимаций (опционально)

## Constraints

- **Tech stack**: HTML, CSS, JS — без библиотек и фреймворков
- **Browser**: Современные браузеры (Chrome, Firefox, Safari, Edge)
- **No backend**: Полностью клиентский опыт
- **No dependencies**: Все с нуля на чистом JS

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Emoji/SVG для питомца | Минимум кода, максимум выразительности | — Pending |
| Web Audio API для звуков | Без внешних аудиофайлов | — Pending |
| Чистый HTML/CSS/JS | Zero зависимостей, открывается файлом | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone**:
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-22 after initialization*
