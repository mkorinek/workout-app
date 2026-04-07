# Performance Overhaul Plan

## Context
Every page load was slow because: (1) double auth call per request, (2) no request-level dedup on data fetches, (3) no loading skeletons so users see blank pages, (4) layout over-fetches profile data, (5) sequential DB calls when starting from template, (6) nav links don't prefetch RSC payload.

---

## What was done

### Phase 1: Layout quick wins
**File:** `src/app/(protected)/layout.tsx`
- Replaced `supabase.auth.getUser()` with `supabase.auth.getSession()` — reads JWT from cookie, no HTTP round-trip. Middleware already verified auth via `getUser()`.
- Narrowed `select("*")` to only the 6 fields the layout actually uses: `lifter_rank, weekly_workout_goal, current_week_streak, streak_last_completed_week, week_start_day, display_name`.
- Updated `CacheSeed` to accept partial profile data.

### Phase 2: Batch set insert
**File:** `src/actions/sessions.ts` — Added `addSets()` batch server action (single `INSERT`).
**File:** `src/app/(protected)/workouts/new/page.tsx` — Replaced sequential `addSet()` loop (N round-trips) with single `addSets()` call.

### Phase 3: Request-level dedup with React `cache()`
**Files:** All action files (`sessions.ts`, `profile.ts`, `exercises.ts`, `records.ts`, `achievements.ts`, `templates.ts`)

Wrapped all read functions with React `cache()` to deduplicate within the same server request. This means if `getProfile()` is called in both layout and page during SSR, Supabase is only hit once.

> Note: `unstable_cache` was initially planned but can't be used with Supabase's cookie-based auth (`cookies()` is a dynamic data source not allowed inside `unstable_cache`). React `cache()` provides request-level dedup, and the existing client-side Zustand cache handles cross-navigation caching.

Cached functions:
| File | Function | Dedup scope |
|------|----------|-------------|
| `exercises.ts` | `getExercises` | Per-request |
| `templates.ts` | `getTemplates` | Per-request |
| `achievements.ts` | `getAchievements` | Per-request |
| `profile.ts` | `getProfile` | Per-request |
| `profile.ts` | `getStreakData` | Per-request |
| `sessions.ts` | `getSessions` | Per-request |
| `records.ts` | `getPersonalRecords` | Per-request |

### Phase 4: Loading skeletons
**Created:** `src/components/ui/skeleton.tsx` — shared pulse animation component.
**Created 7 `loading.tsx` files** for all protected routes:
- `/workouts`, `/workouts/[sessionId]`, `/workouts/new`
- `/progress`, `/templates`, `/profile`, `/exercises`

All use design tokens (`bg-surface-elevated`, `border-border-subtle`) and work in both dark/light themes.

### Phase 5: Nav prefetch
**File:** `src/components/nav/bottom-nav.tsx`
- Added `prefetch={true}` to `<Link>` elements so Next.js prefetches RSC payload on viewport intersection (not just on hover).

---

## Performance improvements summary
1. **-1 HTTP round-trip per page** — removed redundant `getUser()` in layout
2. **-N DB calls on template start** — batch insert instead of sequential loop
3. **Request-level dedup** — same data fetched once per SSR, not multiple times
4. **Instant perceived navigation** — loading skeletons shown immediately
5. **Slimmer layout query** — 6 columns instead of 20+
6. **Eager RSC prefetch** — nav links prefetch on viewport intersection
