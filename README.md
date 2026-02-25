# MiraiGo Frontend

MiraiGo Frontend is the learner-facing web application for the MiraiGo Japanese learning platform.  
It is built for daily study workflows: clear navigation, low-friction practice, and responsive lesson delivery.

## Product Scope

- Lesson viewer with embedded video and PDF materials
- Grammar and vocabulary study pages
- Kanji map and Kanji detail exploration
- AI practice chat (text + voice interaction)
- Theme system (light/dark) with persistent user preference

## Tech Stack

- **Next.js 16 (App Router)**
- **TypeScript (strict)**
- **Tailwind CSS + Material UI**
- **TanStack Query** for server-state and caching
- **Zustand** for client-state
- **Zod** for runtime validation
- **ESLint + Prettier + Husky + lint-staged**

## Architecture Principles

- Feature-first modules under `src/features/*`
- Shared UI and layout primitives under `src/shared/*`
- App-wide config and constants under `src/core/*`
- API routes under `src/app/api/*`
- Strong type contracts for all domain models

## Core Folders

```text
src/
  app/                # App Router pages and API routes
  core/               # Theme, constants, app-level config
  features/           # Domain features (courses, practice, kanji, ...)
  lib/                # API/env utilities
  shared/             # Reusable UI, layout, hooks
```

## Brand

This application is branded as **MiraiGo** across UI copy, navigation, and learner-facing experiences.
