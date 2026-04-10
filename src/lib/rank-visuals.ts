// Shared rank visual configuration used by RankCard, social cards, and anywhere
// we need rank-based visual intensity.
//
// Each rank has TWO color sets — dark mode (bright on black) and light mode
// (dark/saturated on white). Components should call getRankVisual(rank) which
// returns theme-agnostic colors, then use CSS variables for theme switching.
// For simpler usage, the "colors" tuple is designed to have good contrast on
// BOTH themes by picking mid-range saturated tones.

export interface RankVisual {
  level: number; // 0=none, 1=glow, 2=border, 3=pulse, 4=spin, 5=particles, 6=full
  colors: [string, string]; // gradient pair — primary, secondary
  darkColors: [string, string]; // optimized for dark backgrounds
  lightColors: [string, string]; // optimized for light backgrounds
  label: string; // decorative symbol
}

export const RANK_VISUALS: Record<string, RankVisual> = {
  ROOKIE: {
    level: 0,
    colors: ["#6b7280", "#9ca3af"],
    darkColors: ["#9ca3af", "#d1d5db"],
    lightColors: ["#4b5563", "#6b7280"],
    label: "",
  },
  INITIATE: {
    level: 1,
    colors: ["#16a34a", "#22c55e"],
    darkColors: ["#4ade80", "#86efac"],
    lightColors: ["#15803d", "#16a34a"],
    label: "\u25c7",
  },
  REGULAR: {
    level: 2,
    colors: ["#2563eb", "#3b82f6"],
    darkColors: ["#60a5fa", "#93c5fd"],
    lightColors: ["#1d4ed8", "#2563eb"],
    label: "\u25c6",
  },
  HARDENED: {
    level: 3,
    colors: ["#ca8a04", "#eab308"],
    darkColors: ["#facc15", "#fde047"],
    lightColors: ["#a16207", "#ca8a04"],
    label: "\u25c6\u25c6",
  },
  VETERAN: {
    level: 4,
    colors: ["#ea580c", "#f97316"],
    darkColors: ["#fb923c", "#fdba74"],
    lightColors: ["#c2410c", "#ea580c"],
    label: "\u2726",
  },
  ELITE: {
    level: 5,
    colors: ["#dc2626", "#ef4444"],
    darkColors: ["#f87171", "#fca5a5"],
    lightColors: ["#b91c1c", "#dc2626"],
    label: "\u2726\u2726",
  },
  LEGEND: {
    level: 6,
    colors: ["#9333ea", "#a855f7"],
    darkColors: ["#c084fc", "#d8b4fe"],
    lightColors: ["#7e22ce", "#9333ea"],
    label: "\u2605",
  },
};

export function getRankVisual(rank: string): RankVisual {
  return RANK_VISUALS[rank] || RANK_VISUALS.ROOKIE;
}

// Rank-level thresholds (same order as RANK_VISUALS keys)
export const RANK_THRESHOLDS = [0, 5000, 25000, 100000, 250000, 500000, 1000000];

export function getRankThreshold(rank: string): number {
  const idx = Object.keys(RANK_VISUALS).indexOf(rank);
  return RANK_THRESHOLDS[idx] ?? 0;
}

// Deterministic particle positions for CSS-only animation
export interface ParticleConfig {
  left: string;
  delay: string;
  duration: string;
  drift: string;
  size: string;
}

export function makeParticles(count: number): ParticleConfig[] {
  const particles: ParticleConfig[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      left: `${10 + (i * 73) % 80}%`,
      delay: `${(i * 0.7) % 3}s`,
      duration: `${2 + (i * 0.3) % 1.5}s`,
      drift: `${((i % 2 === 0 ? 1 : -1) * (5 + (i * 7) % 15))}px`,
      size: `${2 + (i % 3)}px`,
    });
  }
  return particles;
}
