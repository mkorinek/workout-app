"use client";

import { useState, useEffect, useCallback } from "react";
import { getPendingCount } from "./idb-store";
import { replayMutations } from "./sync-manager";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const updatePendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingSync(count);
    } catch {
      // IndexedDB not available
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await replayMutations();
      await updatePendingCount();
    } catch {
      // Sync failed
    } finally {
      setSyncing(false);
    }
  }, [syncing, updatePendingCount]);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
      syncNow();
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    updatePendingCount();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncNow, updatePendingCount]);

  return { isOnline, pendingSync, syncing };
}
