"use client";

import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, disabled, className }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-5 h-5 border flex items-center justify-center transition-colors font-mono text-xs shrink-0",
        checked
          ? "border-term-green bg-term-green text-term-black"
          : "border-term-gray text-transparent hover:border-term-green-dim",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {checked ? "x" : "\u00A0"}
    </button>
  );
}
