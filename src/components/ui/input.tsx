import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "bg-surface border border-border shadow-sm rounded-sm text-text-primary text-sm py-2 px-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors placeholder:text-text-muted",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
