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

export function getRankFromVolume(totalVolumeKg: number): string {
  if (totalVolumeKg >= 1_000_000) return "LEGEND";
  if (totalVolumeKg >= 500_000) return "ELITE";
  if (totalVolumeKg >= 250_000) return "VETERAN";
  if (totalVolumeKg >= 100_000) return "HARDENED";
  if (totalVolumeKg >= 25_000) return "REGULAR";
  if (totalVolumeKg >= 5_000) return "INITIATE";
  return "ROOKIE";
}

export function getNextRank(currentRank: string): { name: string; volumeNeeded: number } | null {
  const ranks: [string, number][] = [
    ["INITIATE", 5_000],
    ["REGULAR", 25_000],
    ["HARDENED", 100_000],
    ["VETERAN", 250_000],
    ["ELITE", 500_000],
    ["LEGEND", 1_000_000],
  ];
  const idx = ranks.findIndex(([name]) => name === currentRank);
  if (idx === -1 && currentRank === "ROOKIE") return { name: "INITIATE", volumeNeeded: 5_000 };
  if (idx >= 0 && idx < ranks.length - 1) return { name: ranks[idx + 1][0], volumeNeeded: ranks[idx + 1][1] };
  return null;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
