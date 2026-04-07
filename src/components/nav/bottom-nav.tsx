"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect, useCallback } from "react";
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

export function BottomNav() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const prevBlobRef = useRef<{ left: number; width: number } | null>(null);
  const [blobStyle, setBlobStyle] = useState<{ left: number; width: number } | null>(null);
  const [isInitial, setIsInitial] = useState(true);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const measureActive = useCallback(() => {
    const activeIndex = NAV_ITEMS.findIndex((item) => pathname.startsWith(item.href));
    const el = itemRefs.current[activeIndex];
    const container = containerRef.current;
    if (!el || !container) return null;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return {
      left: elRect.left - containerRect.left,
      width: elRect.width,
    };
  }, [pathname]);

  // Morph blob on pathname change
  useEffect(() => {
    const target = measureActive();
    if (!target) return;

    const prev = prevBlobRef.current;

    // First render or reduced motion — snap without animation
    if (isInitial || !prev || prefersReducedMotion) {
      setBlobStyle(target);
      prevBlobRef.current = target;
      if (isInitial) {
        requestAnimationFrame(() => setIsInitial(false));
      }
      return;
    }

    // Phase 1: Stretch to cover both old and new positions
    const stretchLeft = Math.min(prev.left, target.left);
    const stretchRight = Math.max(prev.left + prev.width, target.left + target.width);
    setBlobStyle({ left: stretchLeft, width: stretchRight - stretchLeft });

    // Phase 2: Contract to target
    const timer = setTimeout(() => {
      setBlobStyle(target);
      prevBlobRef.current = target;
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, isInitial, prefersReducedMotion, measureActive]);

  // Recalculate on resize without animation
  useEffect(() => {
    const handleResize = () => {
      const target = measureActive();
      if (!target) return;
      setIsInitial(true);
      setBlobStyle(target);
      prevBlobRef.current = target;
      requestAnimationFrame(() => setIsInitial(false));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [measureActive]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
      <div
        ref={containerRef}
        className="relative flex items-center justify-around max-w-lg mx-auto nav-glass rounded-lg"
      >
        {/* Morphing blob indicator */}
        {blobStyle && (
          <div
            className="absolute top-1.5 bottom-1.5 rounded-md bg-accent/10 pointer-events-none"
            style={{
              left: blobStyle.left,
              width: blobStyle.width,
              ...(isInitial
                ? {}
                : {
                    transition:
                      "left 300ms cubic-bezier(0.4, 0, 0.2, 1), width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }),
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
              ref={(el) => { itemRefs.current[index] = el; }}
              onPointerEnter={() => prefetchRoute(item.href)}
              onTouchStart={() => prefetchRoute(item.href)}
              className={cn(
                "relative z-10 flex flex-col items-center py-2.5 px-3 text-[11px] font-medium transition-colors gap-1 rounded-md my-1.5",
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
