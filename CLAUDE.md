# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Must use Node v25 via nvm4w (not the default nvm v16)
export PATH="/c/nvm4w/nodejs:$PATH"

npm run dev          # next dev --webpack (Serwist requires webpack, not Turbopack)
npm run build        # next build --webpack
npm start            # production server on port 3000
npm run lint         # eslint
```

The `--webpack` flag is required because `@serwist/next` does not support Turbopack. Serwist is disabled in development mode via `next.config.ts`.

## Architecture

**Stack**: Next.js 16 (App Router) · React 19 · Supabase (Postgres + Google OAuth) · Tailwind CSS v4 · Serwist (PWA) · Recharts · IndexedDB (idb)

**Deployed to**: Vercel at `workout-app-rho-six.vercel.app`

### Data Flow

- **Server Actions** (`src/actions/`) handle all Supabase mutations and queries. Pages call these directly — no API routes.
- **Supabase SSR client** (`src/lib/supabase/server.ts`) is used in server components and actions. **Browser client** (`src/lib/supabase/client.ts`) is used only in the login page for OAuth.
- **Middleware** (`src/middleware.ts`) handles auth: skips `/login`, `/auth/*`, `/offline`; redirects unauthenticated users to `/login` on all other routes. Does NOT use the separate `lib/supabase/middleware.ts` helper — auth logic is inlined in middleware.ts.

### Route Structure

All authenticated pages live under `src/app/(protected)/` which wraps content in a shell with top bar (rank badge + sync indicator), toast provider, and bottom navigation.

- `/workouts` — session list + new workout entry point
- `/workouts/[sessionId]` — SSR page → `client.tsx` handles interactive workout logging (sets, timer, PR detection, achievement checks)
- `/templates` — saved workout templates
- `/progress` — charts (Recharts) + PR board + achievement board
- `/profile` — settings (rest pause, timer notifications)

### Offline System

Three layers in `src/lib/offline/`:
1. **Serwist service worker** (`src/app/sw.ts`) — app shell caching, NetworkFirst for Supabase API
2. **IndexedDB** (`idb-store.ts`) — caches exercises, active session, PRs; stores mutation queue
3. **Sync manager** (`sync-manager.ts`) — replays queued mutations when back online

### Gamification

- **Lifter Rank**: ROOKIE → INITIATE → REGULAR → HARDENED → VETERAN → ELITE → LEGEND. Based on `profiles.total_volume_kg`. Computed in `src/lib/utils.ts` and updated in `finishWorkout` action.
- **Achievements**: 14 seeded in `achievements` table (milestone/streak/hidden). Checked via `checkAchievements` action after workout completion.
- **Personal Records**: Checked per-set via `checkAndUpdatePR` action. Three types: max_weight, max_reps, max_volume.

## Database

Schema lives in `supabase/migrations/00001_initial_schema.sql`. 8 tables with Row Level Security:
`profiles`, `exercises`, `workout_templates`, `workout_sessions`, `workout_sets`, `personal_records`, `achievements`, `user_achievements`.

Key design choice: `workout_sets.exercise_name` is denormalized text (not a FK to exercises) so unsaved exercises and offline-created sets work without a valid exercise UUID.

Requires `pg_trgm` extension for exercise autocomplete fuzzy search.

## Design System

Terminal brutalist aesthetic — all monospace (JetBrains Mono), no border-radius, no shadows. Theme tokens defined in `src/app/globals.css` under `@theme`:
- Background: `#0a0a0a`, text: `#e0e0e0`, accent: `#00ff41` (green), warning: `#ffb000`, error: `#ff3333`
- Buttons are hollow green border, fill on hover, uppercase tracking-widest
- Inputs are bottom-border only
- Scanline overlay via CSS repeating-linear-gradient on body::after

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL     — Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon/public key
```

These must also be set in Vercel project settings for production.
