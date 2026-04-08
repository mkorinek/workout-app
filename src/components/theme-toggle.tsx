"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggle = useCallback(() => {
    document.documentElement.classList.add("theme-transition");
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 350);
  }, [theme, setTheme]);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        className={`border px-3 py-1.5 text-sm rounded-sm transition-colors ${
          theme === "dark"
            ? "border-accent text-accent bg-accent-muted"
            : "border-border text-text-muted hover:border-accent/50"
        }`}
        aria-label="Toggle theme"
      >
        Dark
      </button>
      <button
        onClick={toggle}
        className={`border px-3 py-1.5 text-sm rounded-sm transition-colors ${
          theme === "light"
            ? "border-accent text-accent bg-accent-muted"
            : "border-border text-text-muted hover:border-accent/50"
        }`}
        aria-label="Toggle theme"
      >
        Light
      </button>
    </div>
  );
}
