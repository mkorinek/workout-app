"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { DumbbellIcon, LayoutIcon, ListIcon, ActivityIcon, UserIcon } from "@/components/icons";
import { prefetchRoute } from "@/lib/cache/prefetch";

const NAV_ITEMS = [
  { href: "/workouts", labelKey: "log" as const, icon: DumbbellIcon },
  { href: "/templates", labelKey: "templates" as const, icon: LayoutIcon },
  { href: "/exercises", labelKey: "exercises" as const, icon: ListIcon },
  { href: "/progress", labelKey: "progress" as const, icon: ActivityIcon },
  { href: "/social", labelKey: "social" as const, icon: UserIcon },
];

const ITEM_COUNT = NAV_ITEMS.length;

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const activeIndex = NAV_ITEMS.findIndex((item) => pathname.startsWith(item.href));
  const hasActiveTab = activeIndex >= 0;
  // Keep last known position so blob fades out in place instead of jumping
  const lastIndex = useRef(0);
  if (hasActiveTab) lastIndex.current = activeIndex;
  const safeIndex = hasActiveTab ? activeIndex : lastIndex.current;

  const isFirst = safeIndex === 0;
  const isLast = safeIndex === ITEM_COUNT - 1;
  // Tighter inset on the container edge, normal inset on the inner side
  const edgeGap = 3; // px from container edge
  const innerGap = 4; // px between blob and adjacent items
  const blobLeft = isFirst
    ? `${edgeGap}px`
    : `calc(${(safeIndex / ITEM_COUNT) * 100}% + ${innerGap}px)`;
  const blobWidth = isFirst || isLast
    ? `calc(${100 / ITEM_COUNT}% - ${edgeGap + innerGap}px)`
    : `calc(${100 / ITEM_COUNT}% - ${innerGap * 2}px)`;
  // Radius: match container curve on edge side, smaller on inner side
  const blobRadius = isFirst
    ? "18px 12px 12px 18px"
    : isLast
      ? "12px 18px 18px 12px"
      : "12px";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-3 vt-bottom-nav"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 8px), 8px)" }}
    >
      <div className="relative flex items-stretch max-w-lg mx-auto nav-glass rounded-[22px]">
        {/* Blob indicator — smoothly morphs between tab highlight and full-width border */}
        {mounted && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: hasActiveTab ? `${edgeGap}px` : "0px",
              bottom: hasActiveTab ? `${edgeGap}px` : "0px",
              left: hasActiveTab ? blobLeft : "0px",
              width: hasActiveTab ? blobWidth : "100%",
              borderRadius: hasActiveTab ? blobRadius : "22px",
              background: hasActiveTab
                ? "var(--color-accent-muted)"
                : "transparent",
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
                "relative z-10 flex flex-1 flex-col items-center justify-center py-2.5 px-1 text-[10px] sm:text-[11px] font-medium transition-colors gap-1 rounded-md m-1",
                active
                  ? "text-accent"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <Icon size={22} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
