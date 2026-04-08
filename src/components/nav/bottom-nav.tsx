"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { DumbbellIcon, LayoutIcon, ListIcon, ActivityIcon, UserIcon } from "@/components/icons";
import { prefetchRoute } from "@/lib/cache/prefetch";

const NAV_ITEMS = [
  { href: "/workouts", label: "Log", icon: DumbbellIcon },
  { href: "/templates", label: "Templates", icon: LayoutIcon },
  { href: "/exercises", label: "Exercises", icon: ListIcon },
  { href: "/progress", label: "Progress", icon: ActivityIcon },
  { href: "/social", label: "Social", icon: UserIcon },
];

const ITEM_COUNT = NAV_ITEMS.length;

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function BottomNav() {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const activeIndex = NAV_ITEMS.findIndex((item) => pathname.startsWith(item.href));
  const hasActiveTab = activeIndex >= 0;
  const safeIndex = hasActiveTab ? activeIndex : 0;

  const blobLeft = `calc(${(safeIndex / ITEM_COUNT) * 100}% + 6px)`;
  const blobWidth = `calc(${100 / ITEM_COUNT}% - 12px)`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
      <div className="relative flex items-stretch max-w-lg mx-auto nav-glass rounded-2xl">
        {/* Blob indicator — smoothly morphs between tab highlight and full-width border */}
        {mounted && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: hasActiveTab ? "6px" : "0px",
              bottom: hasActiveTab ? "6px" : "0px",
              left: hasActiveTab ? blobLeft : "0px",
              width: hasActiveTab ? blobWidth : "100%",
              borderRadius: hasActiveTab ? "8px" : "16px",
              background: hasActiveTab
                ? "var(--color-accent-muted)"
                : "var(--color-surface)",
              border: hasActiveTab
                ? "1px solid transparent"
                : "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
              transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        )}
        {NAV_ITEMS.map((item) => {
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
