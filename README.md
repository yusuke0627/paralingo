# ParaLingo

## Description
ParaLingo is a Mac-first reading support app for English learners.

It translates clipboard English text and presents:
- sentence-by-sentence Japanese translations
- POS color highlighting
- review workflow for sentences to revisit later

The app uses Electron for desktop integration and React Native Web + Tamagui for UI.

## How To

### Run (development)
```bash
npm install
npm run start
```

### Build
```bash
npm run build
```

### Test
```bash
npm test -- --run
```

## Tech Stack
- Electron
- React 19
- React Native Web
- Tamagui
- TypeScript
- Vite
- Vitest
- SQLite3
- Gemini API (`@google/generative-ai`)
- OpenAI Chat Completions API
