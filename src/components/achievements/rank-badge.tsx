"use client";

import { getRankColor } from "@/lib/utils";

export function RankBadge({ rank }: { rank: string }) {
  return (
    <span className="text-xs font-bold text-white inline-block px-2 py-0.5 rounded-sm" style={{backgroundColor : getRankColor(rank)}}>
      {rank}
    </span>
  );
}
