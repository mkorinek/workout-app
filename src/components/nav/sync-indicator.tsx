"use client";

import { useOnlineStatus } from "@/lib/offline/use-online-status";

export function SyncIndicator() {
  const { isOnline, pendingSync, syncing } = useOnlineStatus();

  if (isOnline && pendingSync === 0 && !syncing) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      {!isOnline && (
        <span className="text-[10px] text-warning font-medium">
          Offline
        </span>
      )}
      {pendingSync > 0 && (
        <span className="text-[10px] text-warning font-medium">
          {syncing ? "Syncing..." : `${pendingSync} pending`}
        </span>
      )}
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isOnline ? "bg-success" : "bg-warning"
        }`}
      />
    </div>
  );
}
