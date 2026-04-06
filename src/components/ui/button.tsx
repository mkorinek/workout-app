import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "uppercase tracking-widest font-bold transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed font-mono",
          size === "sm" && "text-[10px] px-3 py-1.5",
          size === "md" && "text-xs px-4 py-2.5",
          variant === "primary" &&
            "border border-term-green text-term-green hover:bg-term-green hover:text-term-black",
          variant === "ghost" &&
            "text-term-gray-light hover:text-term-white",
          variant === "danger" &&
            "border border-term-red text-term-red hover:bg-term-red hover:text-term-black",
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
