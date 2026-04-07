"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export const ACCENT_PRESETS = [
  { name: "Blue", value: "#007AFF", dark: "#0A84FF" },
  { name: "Indigo", value: "#5856D6", dark: "#5E5CE6" },
  { name: "Purple", value: "#AF52DE", dark: "#BF5AF2" },
  { name: "Pink", value: "#FF2D55", dark: "#FF375F" },
  { name: "Red", value: "#FF3B30", dark: "#FF453A" },
  { name: "Orange", value: "#FF9500", dark: "#FF9F0A" },
  { name: "Yellow", value: "#FFCC00", dark: "#FFD60A" },
  { name: "Green", value: "#34C759", dark: "#30D158" },
  { name: "Teal", value: "#5AC8FA", dark: "#64D2FF" },
  { name: "Mint", value: "#00C7BE", dark: "#63E6E2" },
] as const;

const DEFAULT_INDEX = 0;

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function applyAccent(index: number, isDark: boolean) {
  const preset = ACCENT_PRESETS[index] ?? ACCENT_PRESETS[DEFAULT_INDEX];
  const color = isDark ? preset.dark : preset.value;
  const { r, g, b } = hexToRgb(color);

  const hoverR = isDark ? Math.min(255, r + 40) : Math.max(0, r - 30);
  const hoverG = isDark ? Math.min(255, g + 40) : Math.max(0, g - 30);
  const hoverB = isDark ? Math.min(255, b + 40) : Math.max(0, b - 30);
  const hover = `#${hoverR.toString(16).padStart(2, "0")}${hoverG.toString(16).padStart(2, "0")}${hoverB.toString(16).padStart(2, "0")}`;

  const alpha = isDark ? 0.15 : 0.1;
  const muted = `rgba(${r}, ${g}, ${b}, ${alpha})`;
  const glow = `0 0 ${isDark ? 24 : 20}px rgba(${r}, ${g}, ${b}, ${isDark ? 0.1 : 0.12})`;

  const root = document.documentElement;
  root.style.setProperty("--color-accent", color);
  root.style.setProperty("--color-accent-hover", hover);
  root.style.setProperty("--color-accent-muted", muted);
  root.style.setProperty("--color-ring", color);
  root.style.setProperty("--glow-accent", glow);
}

type AccentContextValue = {
  accentIndex: number;
  setAccent: (index: number) => void;
};

const AccentContext = createContext<AccentContextValue>({
  accentIndex: DEFAULT_INDEX,
  setAccent: () => {},
});

export function useAccent() {
  return useContext(AccentContext);
}

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accentIndex, setAccentIndex] = useState(DEFAULT_INDEX);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply accent whenever index or theme changes
  useEffect(() => {
    if (!mounted) return;
    const isDark = document.documentElement.classList.contains("dark");
    applyAccent(accentIndex, isDark);

    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      applyAccent(accentIndex, dark);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [accentIndex, mounted]);

  const setAccent = useCallback((index: number) => {
    setAccentIndex(index);
  }, []);

  return (
    <AccentContext value={{ accentIndex, setAccent }}>
      {children}
    </AccentContext>
  );
}

/** Invisible component — seeds accent from server-fetched profile data */
export function AccentSeed({ index }: { index: number }) {
  const { setAccent } = useAccent();

  useEffect(() => {
    if (index >= 0 && index < ACCENT_PRESETS.length) {
      setAccent(index);
    }
  }, [index, setAccent]);

  return null;
}
