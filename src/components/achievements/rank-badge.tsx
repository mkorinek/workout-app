"use client";

export function RankBadge({ rank }: { rank: string }) {
  return (
    <span className="text-xs font-bold text-accent">
      {rank}
    </span>
  );
}
