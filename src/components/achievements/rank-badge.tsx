"use client";

export function RankBadge({ rank }: { rank: string }) {
  return (
    <span className="text-term-green text-xs font-bold tracking-wider">
      [{rank}@gym]$
    </span>
  );
}
