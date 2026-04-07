import { create } from "zustand";
import type { getSessions } from "@/actions/sessions";
import type { getProfile, getStreakData } from "@/actions/profile";
import type { getTemplates } from "@/actions/templates";
import type { getExercises } from "@/actions/exercises";
import type { getPersonalRecords } from "@/actions/records";
import type { getAchievements } from "@/actions/achievements";

// Derive types from server action return types
export type SessionsData = Awaited<ReturnType<typeof getSessions>>;
export type ProfileData = Awaited<ReturnType<typeof getProfile>>;
export type TemplatesData = Awaited<ReturnType<typeof getTemplates>>;
export type ExercisesData = Awaited<ReturnType<typeof getExercises>>;
export type RecordsData = Awaited<ReturnType<typeof getPersonalRecords>>;
export type AchievementsData = Awaited<ReturnType<typeof getAchievements>>;
export type StreakData = Awaited<ReturnType<typeof getStreakData>>;

interface CacheEntry<T> {
  data: T | null;
  updatedAt: number;
}

export type CacheKey =
  | "profile"
  | "sessions"
  | "templates"
  | "exercises"
  | "records"
  | "achievements"
  | "streakData";

// Max age per resource (ms)
export const STALE_TIMES: Record<CacheKey, number> = {
  sessions: 30_000,
  profile: 120_000,
  exercises: 300_000,
  templates: 300_000,
  records: 120_000,
  achievements: 300_000,
  streakData: 120_000,
};

interface AppCacheState {
  profile: CacheEntry<ProfileData>;
  sessions: CacheEntry<SessionsData>;
  templates: CacheEntry<TemplatesData>;
  exercises: CacheEntry<ExercisesData>;
  records: CacheEntry<RecordsData>;
  achievements: CacheEntry<AchievementsData>;
  streakData: CacheEntry<StreakData>;

  set: <K extends CacheKey>(key: K, data: AppCacheState[K]["data"]) => void;
  invalidate: (...keys: CacheKey[]) => void;
  invalidateAll: () => void;
  isStale: (key: CacheKey) => boolean;
}

const empty = { data: null, updatedAt: 0 };

export const useAppStore = create<AppCacheState>((set, get) => ({
  profile: { ...empty },
  sessions: { ...empty },
  templates: { ...empty },
  exercises: { ...empty },
  records: { ...empty },
  achievements: { ...empty },
  streakData: { ...empty },

  set: (key, data) =>
    set({ [key]: { data, updatedAt: Date.now() } }),

  invalidate: (...keys) =>
    set(
      Object.fromEntries(
        keys.map((k) => [k, { data: null, updatedAt: 0 }])
      )
    ),

  invalidateAll: () =>
    set({
      profile: { ...empty },
      sessions: { ...empty },
      templates: { ...empty },
      exercises: { ...empty },
      records: { ...empty },
      achievements: { ...empty },
      streakData: { ...empty },
    }),

  isStale: (key) => {
    const entry = get()[key];
    if (!entry.data || entry.updatedAt === 0) return true;
    return Date.now() - entry.updatedAt > STALE_TIMES[key];
  },
}));
