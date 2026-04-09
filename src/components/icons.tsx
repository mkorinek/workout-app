interface IconProps {
  className?: string;
  size?: number;
}

function iconProps({ className, size = 20 }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
}

export function EditIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

export function DumbbellIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M6.5 6.5h11M6.5 17.5h11" />
      <rect x="2" y="6" width="4.5" height="12" rx="1" />
      <rect x="17.5" y="6" width="4.5" height="12" rx="1" />
      <line x1="12" y1="6.5" x2="12" y2="17.5" />
    </svg>
  );
}

export function LayoutIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="9" x2="9" y2="21" />
    </svg>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ActivityIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function ChevronUpIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 22V8a2 2 0 0 0-2-2H6v6a6 6 0 0 0 12 0V6h-2a2 2 0 0 0-2 2v14" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
