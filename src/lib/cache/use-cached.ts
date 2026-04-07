"use client";

import { useEffect, useRef } from "react";
import { useAppStore, type CacheKey } from "./app-store";

/**
 * Hook that reads from the Zustand cache, seeds it with initialData from the server,
 * and background-refreshes when stale.
 *
 * Returns initialData synchronously on first render to avoid flicker,
 * then keeps the store in sync for subsequent navigations.
 */
export function useCached<T>(
  key: CacheKey,
  fetcher: () => Promise<T>,
  initialData?: T
): T | null {
  const data = useAppStore((s) => s[key].data) as T | null;
  const setCache = useAppStore((s) => s.set);
  const fetchingRef = useRef(false);
  const seededRef = useRef(false);

  // Seed store with initialData once — deferred to avoid render-during-render
  if (initialData !== undefined && !seededRef.current && !data) {
    seededRef.current = true;
    queueMicrotask(() => setCache(key, initialData as never));
  }

  // Background refresh when stale
  useEffect(() => {
    if (!useAppStore.getState().isStale(key) || fetchingRef.current) return;
    fetchingRef.current = true;
    fetcher()
      .then((fresh) => setCache(key, fresh as never))
      .finally(() => { fetchingRef.current = false; });
  }); // eslint-disable-line react-hooks/exhaustive-deps

  // Return cached data, or initialData for flicker-free first paint
  return data ?? initialData ?? null;
}
