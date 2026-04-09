# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
npm run dev          # next dev --webpack (Serwist requires webpack, not Turbopack)
npm run build        # next build --webpack
npm start            # production server on port 3000
npm run lint         # eslint
```

Requires Node v25+.

The `--webpack` flag is required because `@serwist/next` does not support Turbopack. Serwist is disabled in development mode via `next.config.ts`.

## Architecture

**Stack**: Next.js 16 (App Router) · React 19 · Supabase (Postgres + Google OAuth) · Tailwind CSS v4 · Serwist (PWA) · Recharts · IndexedDB (idb)

**Deployed to**: Vercel at `workout-app-rho-six.vercel.app`

### Data Flow

- **Server Actions** (`src/actions/`) handle all Supabase mutations and queries. Pages call these directly — no API routes.
- **Read functions** (`getProfile`, `getSessions`, etc.) are wrapped with React `cache()` for per-request deduplication — if the same function is called in both layout and page during SSR, Supabase is hit only once.
- **Supabase SSR client** (`src/lib/supabase/server.ts`) is used in server components and actions. **Browser client** (`src/lib/supabase/client.ts`) is used only in the login page for OAuth.
- **Middleware** (`src/middleware.ts`) handles auth via `getUser()`: skips `/login`, `/auth/*`, `/offline`; redirects unauthenticated users to `/login` on all other routes.
- **Protected layout** (`src/app/(protected)/layout.tsx`) uses `getSession()` (not `getUser()`) to avoid a redundant HTTP round-trip — middleware already verified auth.

**Important**: `unstable_cache` cannot be used with Supabase's cookie-based auth (`cookies()` is a dynamic data source blocked inside `unstable_cache`). Use React `cache()` for request-level dedup instead. Cross-navigation caching is handled by the client-side Zustand cache layer.

### Route Structure

All authenticated pages live under `src/app/(protected)/` which wraps content in a shell with top bar (rank badge + sync indicator), toast provider, and bottom navigation.

- `/workouts` — session list + new workout entry point
- `/workouts/[sessionId]` — SSR page → `client.tsx` handles interactive workout logging (sets, timer, PR detection, achievement checks)
- `/workouts/[sessionId]/summary` — post-workout summary (PRs, achievements, stats)
- `/workouts/new` — blank workout or start from template (batch set insert via `addSets()`)
- `/templates` — saved workout templates
- `/templates/[templateId]` — edit template
- `/exercises` — saved exercise list (client component, uses `useCached`)
- `/progress` — charts (Recharts) + PR board + achievement board
- `/social` — follow/unfollow users, view followed profiles
- `/profile` — settings (rest pause, timer notifications, weekly workout goal, week start day, accent color)

All routes have `loading.tsx` skeleton screens for instant perceived navigation.

### Client-Side Cache

Zustand store in `src/lib/cache/app-store.ts` with configurable stale times (30s–300s per resource). Key pieces:
- **`useCached(key, fetcher)`** — hook that returns cached data, triggers background refresh when stale
- **`withInvalidation(action, ...keys)`** — wrapper that invalidates cache keys after mutations
- **`prefetchRoute(href)`** — prefetches data for a route on nav hover/focus
- **`CacheSeed`** — invisible component that hydrates Zustand cache from server-fetched data
- **`Skeleton`** (`src/components/ui/skeleton.tsx`) — shared pulse animation component used by all `loading.tsx` files

### Offline System

Three layers in `src/lib/offline/`:
1. **Serwist service worker** (`src/app/sw.ts`) — app shell caching, NetworkFirst for Supabase API
2. **IndexedDB** (`idb-store.ts`) — caches exercises, active session, PRs; stores mutation queue
3. **Sync manager** (`sync-manager.ts`) — replays queued mutations when back online

### Gamification

- **Lifter Rank**: ROOKIE → INITIATE → REGULAR → HARDENED → VETERAN → ELITE → LEGEND. Based on `profiles.total_volume_kg`. Computed in `src/lib/utils.ts` and updated in `finishWorkout` action.
- **Achievements**: 14 seeded in `achievements` table (milestone/streak/hidden). Checked via `checkAchievements` action after workout completion.
- **Personal Records**: Checked per-set via `checkAndUpdatePR` action. Three types: max_weight, max_reps, max_volume.
- **Weekly Streak**: User sets a weekly workout goal in profile. Completing that many workouts in a calendar week builds the streak. Missing a week resets to 0. Configurable week start day (Mon/Sun). Streak badge in top bar, progress section on `/progress`. Color milestones: blue (0w) → violet (4w) → purple (12w) → pink (26w) → gold (52w). Logic in `src/lib/streak.ts`, DB columns on `profiles`.

### Social

Follow/unfollow system via `follows` table. Server actions in `src/actions/social.ts` (`getFollowedProfiles`, `getFollowing`, `followUser`, `unfollowUser`). Profiles have public read access (migration `00006`) to support viewing other users.

## Database

Schema lives in `supabase/migrations/` (8 migrations: initial schema, weekly streak, set notes, admin flag, accent color, profiles public read, follows, achievement count). All tables have Row Level Security:
`profiles`, `exercises`, `workout_templates`, `workout_sessions`, `workout_sets`, `personal_records`, `achievements`, `user_achievements`, `follows`.

Key design choice: `workout_sets.exercise_name` is denormalized text (not a FK to exercises) so unsaved exercises and offline-created sets work without a valid exercise UUID.

Requires `pg_trgm` extension for exercise autocomplete fuzzy search.

## Design System

iOS-inspired minimalist aesthetic with dark/light mode (via `next-themes`, default dark). Font: Plus Jakarta Sans (via `next/font/google`). Theme tokens defined as CSS custom properties in `src/app/globals.css` with `:root` (light) and `.dark` blocks, bridged to Tailwind via `@theme`:
- Dark: background `#000000`, surface `#1C1C1E`, surface-elevated `#2C2C2E`, accent `#0A84FF` (system blue)
- Light: background `#F2F2F7`, surface `#ffffff`, accent `#007AFF` (system blue)
- Semantic tokens: `bg-bg`, `bg-surface`, `bg-surface-elevated`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `bg-accent`, `border-border`, `border-border-subtle`, etc.
- Rounded corners (6-14px radii), subtle shadows, filled accent buttons, full-border rounded inputs
- **Accent colors**: 10 presets (Blue, Indigo, Purple, Pink, Red, Orange, Yellow, Green, Teal, Mint) stored as integer index in `profiles.accent_color`. `AccentProvider` (`src/components/accent-provider.tsx`) dynamically overrides `--color-accent`, `--color-accent-hover`, `--color-accent-muted`, `--glow-accent` CSS variables at runtime. `AccentSeed` component hydrates from server-fetched profile data in the protected layout.
- SVG icons in `src/components/icons.tsx`, theme toggle in header
- Nav: glass-morphism bottom bar with morphing blob indicator (`nav-glass` class)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL     — Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon/public key
```

These must also be set in Vercel project settings for production.

## Skills (`.claude/skills/`)

- `/commit` — Conventional commits with preview, approval, and push flow
- `/deploy` — Build check + `npx vercel --prod`
- `/sync-knowledge` — Update CLAUDE.md and memory files
