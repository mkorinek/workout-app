"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DumbbellIcon, LayoutIcon, ListIcon, ActivityIcon, UserIcon } from "@/components/icons";
import { prefetchRoute } from "@/lib/cache/prefetch";

const NAV_ITEMS = [
  { href: "/workouts", label: "Log", icon: DumbbellIcon },
  { href: "/templates", label: "Templates", icon: LayoutIcon },
  { href: "/exercises", label: "Exercises", icon: ListIcon },
  { href: "/progress", label: "Progress", icon: ActivityIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

const ITEM_COUNT = NAV_ITEMS.length;

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const prevIndex = useRef(-1);

  const activeIndex = NAV_ITEMS.findIndex((item) => pathname.startsWith(item.href));
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate only after mount AND after the first position is established
  const shouldAnimate = mounted && prevIndex.current >= 0;
  prevIndex.current = safeIndex;

  // Percentage-based positioning: each item is 1/ITEM_COUNT of the container
  // Blob sits inside with margin matching the item margin (6px = 0.375rem = m-1.5)
  const blobLeft = `calc(${(safeIndex / ITEM_COUNT) * 100}% + 6px)`;
  const blobWidth = `calc(${100 / ITEM_COUNT}% - 12px)`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
      <div className="relative flex items-stretch max-w-lg mx-auto nav-glass rounded-lg">
        {/* Blob indicator — client-only to avoid hydration mismatch */}
        {mounted && (
          <div
            className="absolute top-1.5 bottom-1.5 rounded-md bg-accent/10 pointer-events-none will-change-transform"
            style={{
              left: blobLeft,
              width: blobWidth,
              transition: shouldAnimate
                ? "left 250ms cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
            }}
          />
        )}
        {NAV_ITEMS.map((item, index) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onPointerEnter={() => prefetchRoute(item.href)}
              onTouchStart={() => prefetchRoute(item.href)}
              className={cn(
                "relative z-10 flex flex-1 flex-col items-center justify-center p-2.5 text-[11px] font-medium transition-colors gap-1 rounded-md m-1.5",
                active
                  ? "text-accent"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
