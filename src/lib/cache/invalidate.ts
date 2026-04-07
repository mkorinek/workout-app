import { useAppStore, type CacheKey } from "./app-store";

/**
 * Wraps a server action call: runs the action, then invalidates the given cache keys.
 * Returns the action's result.
 */
export async function withInvalidation<T>(
  action: () => Promise<T>,
  ...keys: CacheKey[]
): Promise<T> {
  const result = await action();
  // Only invalidate if action didn't return an error
  const isError =
    result && typeof result === "object" && "error" in result;
  if (!isError) {
    useAppStore.getState().invalidate(...keys);
  }
  return result;
}

/** Invalidate everything (e.g. after deleteAllHistory) */
export function invalidateAll() {
  useAppStore.getState().invalidateAll();
}
