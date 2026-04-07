"use client";

import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/icons";

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
        "w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all active:scale-[0.92] shrink-0",
        checked
          ? "bg-accent border-accent text-white"
          : "border-border hover:border-accent/50",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {checked && <CheckIcon size={14} />}
    </button>
  );
}
