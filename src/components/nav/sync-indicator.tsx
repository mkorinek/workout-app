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
        <span className="text-[10px] text-term-amber uppercase tracking-widest">
          offline
        </span>
      )}
      {pendingSync > 0 && (
        <span className="text-[10px] text-term-amber uppercase tracking-widest">
          {syncing ? "syncing..." : `${pendingSync} pending`}
        </span>
      )}
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isOnline ? "bg-term-green" : "bg-term-amber"
        }`}
      />
    </div>
  );
}
