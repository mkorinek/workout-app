export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const RANK_THRESHOLDS: [string, number][] = [
  ["ROOKIE", 0],
  ["INITIATE", 5_000],
  ["REGULAR", 25_000],
  ["HARDENED", 100_000],
  ["VETERAN", 250_000],
  ["ELITE", 500_000],
  ["LEGEND", 1_000_000],
];

export function getRankColor(rank: string): string {
  switch (rank) {
    case "ROOKIE":
      return "var(--color-text-muted)";
    case "INITIATE":
      return "var(--color-green-500)";
    case "REGULAR":
      return "var(--color-blue-500)";
    case "HARDENED":
      return "var(--color-yellow-500)";
    case "VETERAN":
      return "var(--color-orange-500)";
    case "ELITE":
      return "var(--color-red-500)";
    case "LEGEND":
      return "var(--color-purple-500)";
    default:
      return "var(--color-text-muted)";
  }
}

export function getRankFromVolume(totalVolumeKg: number): string {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalVolumeKg >= RANK_THRESHOLDS[i][1]) return RANK_THRESHOLDS[i][0];
  }
  return "ROOKIE";
}

export function getNextRank(currentRank: string): { name: string; volumeNeeded: number } | null {
  const idx = RANK_THRESHOLDS.findIndex(([name]) => name === currentRank);
  if (idx >= 0 && idx < RANK_THRESHOLDS.length - 1) {
    return { name: RANK_THRESHOLDS[idx + 1][0], volumeNeeded: RANK_THRESHOLDS[idx + 1][1] };
  }
  return null;
}

export function calculateVolume(sets: { weight_kg: number; reps: number; completed: boolean }[]): number {
  return sets
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + Number(s.weight_kg) * s.reps, 0);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
