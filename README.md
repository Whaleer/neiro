<h1 align="center">
  <img src="src/assets/layer-mask-01-stroke-rounded.svg" alt="neiro logo" width="32" height="32" />
  neiro
</h1>

<p align="center">
  Guitar fretboard note training for faster visual and auditory recall.
</p>

<p align="center">
  © 2026 bingxil. All rights reserved.
</p>

`neiro` is a front-end guitar fretboard trainer designed to help players memorize note names across the neck through repeated visual and auditory practice.

Instead of presenting music theory as static charts, the app turns the fretboard into an interactive training surface. You identify notes, locate every occurrence of a target note, and build faster recall through immediate feedback.

## What It Does

The app currently includes two practice modes:

- **Identify the note name**: a random fretboard position is highlighted, and you choose the correct note from all 12 note names.
- **Find all note positions**: a target note is given, and you locate every matching position on the fretboard by following the circle of fifths.

The training scope covers:

- 6 strings
- Frets 1-12
- 72 total practice positions

## Features

- **Interactive fretboard UI** that mirrors a real guitar neck layout
- **Systematic note coverage** across the full practice range
- **Circle-of-fifths guided rounds** for structured position recall
- **Instant answer feedback** for both correct and incorrect attempts
- **Per-position guitar note playback** to reinforce ear and hand memory together
- **Bilingual interface** with Chinese and English language support
- **Pure front-end architecture** with no backend dependency

## Tech Stack

- React
- TypeScript
- Vite
- Vitest
- Testing Library
- ESLint

## Audio Assets

The app supports UI feedback sounds and per-position guitar samples.

Expected file paths:

- `/sounds/wrong.mp3`
- `/sounds/celebration.mp3`
- `/sounds/notes/string-{1-6}-fret-{1-12}.mp3`

This allows each fretboard position to trigger a matching guitar note sample during practice.

## Project Structure

```text
src/
  components/   Presentational UI components
  lib/          Pure business logic such as music, audio, and i18n
  test/         Test setup
  types.ts      Shared application types
  App.tsx       Main stateful application component
```

## Design Notes

- Note names use flat notation for accidentals, such as `bB` and `bE`
- Standard tuning is represented as `['E', 'B', 'G', 'D', 'A', 'E']`
- The app uses a lightweight custom i18n implementation instead of a third-party library
- Sound preferences are persisted in `localStorage`

## Testing

The project uses `Vitest + jsdom + @testing-library/react + @testing-library/user-event` for both logic and UI coverage.

Tests are colocated with source files where appropriate, and the app includes mocked audio behavior for stable test runs.

## Purpose

This project is built for focused fretboard note-name training: simple to run, fast to iterate on, and easy to extend as a standalone React application.
