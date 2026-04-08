import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "success";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed rounded-md cursor-pointer",
          size === "sm" && "text-xs px-3 py-1.5",
          size === "md" && "text-sm px-4 py-2.5",
          variant === "primary" &&
            "bg-accent text-white hover:bg-accent-hover",
          variant === "ghost" &&
            "text-text-secondary hover:text-text-primary hover:bg-surface-elevated",
          variant === "success" &&
            "bg-success text-white hover:bg-success/80",
          variant === "danger" &&
            "bg-destructive text-white hover:bg-destructive/80",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
