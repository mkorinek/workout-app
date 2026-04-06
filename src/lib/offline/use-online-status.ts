"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getPendingCount } from "./idb-store";
import { replayMutations } from "./sync-manager";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const syncingRef = useRef(false);

  const updatePendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingSync(count);
    } catch {
      // IndexedDB not available
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      await replayMutations();
      await updatePendingCount();
    } catch {
      // Sync failed
    } finally {
      syncingRef.current = false;
    }
  }, [updatePendingCount]);

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

  return { isOnline, pendingSync, syncing: syncingRef.current };
}
