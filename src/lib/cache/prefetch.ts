import { useAppStore } from "./app-store";
import { getSessions } from "@/actions/sessions";
import { getTemplates } from "@/actions/templates";
import { getExercises } from "@/actions/exercises";
import { getPersonalRecords } from "@/actions/records";
import { getAchievements } from "@/actions/achievements";
import { getProfile, getStreakData } from "@/actions/profile";

const { isStale, set } = useAppStore.getState();

function prefetchIfStale(key: Parameters<typeof isStale>[0], fetcher: () => Promise<unknown>) {
  if (!isStale(key)) return;
  fetcher().then((data) => set(key, data as never));
}

const ROUTE_PREFETCHERS: Record<string, () => void> = {
  "/workouts": () => {
    prefetchIfStale("sessions", getSessions);
  },
  "/templates": () => {
    prefetchIfStale("templates", getTemplates);
  },
  "/exercises": () => {
    prefetchIfStale("exercises", getExercises);
  },
  "/progress": () => {
    prefetchIfStale("records", getPersonalRecords);
    prefetchIfStale("achievements", getAchievements);
    prefetchIfStale("exercises", getExercises);
    prefetchIfStale("streakData", getStreakData);
    prefetchIfStale("profile", getProfile);
  },
  "/profile": () => {
    prefetchIfStale("profile", getProfile);
  },
};

/** Prefetch data for a route (call on pointer enter / touch start) */
export function prefetchRoute(href: string) {
  ROUTE_PREFETCHERS[href]?.();
}
