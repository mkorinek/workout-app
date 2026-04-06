"use client";

import { getStreakColor } from "@/lib/streak";

export function StreakBadge({ streak }: { streak: number }) {
  const color = streak > 0 ? getStreakColor(streak) : "#555";

  return (
    <span
      className="text-xs font-bold tracking-wider ml-3"
      style={{ color }}
    >
      [streak:{streak}w]
    </span>
  );
}
