"use client";

import { getStreakColor } from "@/lib/streak";
import { FlameIcon } from "@/components/icons";

export function StreakBadge({ streak }: { streak: number }) {
  const color = streak > 0 ? getStreakColor(streak) : "var(--color-text-muted)";

  return (
    <span
      className="text-xs font-semibold inline-flex items-center gap-1"
      style={{ color }}
    >
      <FlameIcon size={14} />
      {streak}w
    </span>
  );
}
