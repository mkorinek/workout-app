// Custom achievement icons — Apple SF Symbol-inspired, clean minimal strokes
// Each icon is a 24x24 SVG with 1.5px stroke, rounded caps/joins

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

function Svg({
  children,
  size = 24,
  className,
  color,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

// ── Milestones ──────────────────────────────────────────────────────

// Century Club — barbell/dumbbell
export function IconCenturyClub(props: IconProps) {
  return (
    <Svg {...props}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <rect x="2" y="9" width="3" height="6" rx="1" />
      <rect x="19" y="9" width="3" height="6" rx="1" />
      <rect x="5" y="7.5" width="2.5" height="9" rx="0.75" />
      <rect x="16.5" y="7.5" width="2.5" height="9" rx="0.75" />
    </Svg>
  );
}

// Iron Will — lightning bolt
export function IconIronWill(props: IconProps) {
  return (
    <Svg {...props}>
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </Svg>
  );
}

// Volume King — crown
export function IconVolumeKing(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 17l3-10 4.5 5L12 4l2.5 8L19 7l3 10H2z" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </Svg>
  );
}

// First Blood — droplet
export function IconFirstBlood(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </Svg>
  );
}

// Fifty Strong — flexed bicep
export function IconFiftyStrong(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 20l1-4c0-1.5.5-3 2-4l2-2c.5-.5 1-1.5 1-2.5V5a2 2 0 0 1 4 0v4" />
      <path d="M17 9c1.5 0 2.5 1 2.5 2.5S18 14 17 14h-1" />
      <path d="M14 14c0 2-1 4-2 5l-1 1" />
      <line x1="4" y1="22" x2="11" y2="22" />
    </Svg>
  );
}

// Heavy Lifter — weight plate
export function IconHeavyLifter(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="2" />
    </Svg>
  );
}

// ── Streaks ──────────────────────────────────────────────────────────

// On Fire — flame
export function IconOnFire(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 22c-4.97 0-7-3.58-7-7 0-4 3-7.5 4.5-9 .3 2.5 2 4 3.5 5 1.5-2.5 2-5.5 1-8 3 1.5 5 5 5 9 0 3.42-2.03 7-7 10z" />
    </Svg>
  );
}

// Machine — gear
export function IconMachine(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </Svg>
  );
}

// Unstoppable — rocket
export function IconUnstoppable(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </Svg>
  );
}

// Weekly Warrior — crossed swords
export function IconWeeklyWarrior(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
      <path d="M9.5 17.5L21 6V3h-3L6.5 14.5" />
      <path d="M11 19l-6-6" />
      <path d="M8 16l-4 4" />
    </Svg>
  );
}

// ── Hidden ──────────────────────────────────────────────────────────

// Night Owl — moon
export function IconNightOwl(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Svg>
  );
}

// Marathon — mountain peak
export function IconMarathon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 21l4.5-12L17 21" />
      <path d="M2 21l6-8 3 3" />
      <path d="M15 14l3-4 4 5" />
      <line x1="2" y1="21" x2="22" y2="21" />
    </Svg>
  );
}

// Minimalist — target/bullseye
export function IconMinimalist(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </Svg>
  );
}

// The Grind — skull
export function IconTheGrind(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="10" r="8" />
      <path d="M9 22v-4" />
      <path d="M15 22v-4" />
      <path d="M8 18h8" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none" />
      <path d="M10 14h4" />
    </Svg>
  );
}

// ── Registry ────────────────────────────────────────────────────────

// Map achievement names to icon components
export const ACHIEVEMENT_ICONS: Record<
  string,
  (props: IconProps) => React.ReactElement
> = {
  "Century Club": IconCenturyClub,
  "Iron Will": IconIronWill,
  "Volume King": IconVolumeKing,
  "First Blood": IconFirstBlood,
  "Fifty Strong": IconFiftyStrong,
  "Heavy Lifter": IconHeavyLifter,
  "On Fire": IconOnFire,
  Machine: IconMachine,
  Unstoppable: IconUnstoppable,
  "Weekly Warrior": IconWeeklyWarrior,
  "Night Owl": IconNightOwl,
  Marathon: IconMarathon,
  Minimalist: IconMinimalist,
  "The Grind": IconTheGrind,
};

// Render achievement icon by name, falls back to the DB icon string
export function AchievementIcon({
  name,
  icon,
  size = 20,
  className,
  color,
}: {
  name: string;
  icon: string;
  size?: number;
  className?: string;
  color?: string;
}) {
  const IconComponent = ACHIEVEMENT_ICONS[name];
  if (IconComponent) {
    return <IconComponent size={size} className={className} color={color} />;
  }
  // Fallback to DB emoji/character
  return (
    <span className={className} style={{ fontSize: size * 0.8, lineHeight: 1 }}>
      {icon}
    </span>
  );
}
