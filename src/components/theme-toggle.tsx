"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-8 h-8 flex items-center justify-center rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-all active:scale-[0.92]"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
    </button>
  );
}
