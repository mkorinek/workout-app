import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-[10px] text-term-gray-light uppercase tracking-widest">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "bg-transparent border-b border-term-gray text-term-white font-mono text-sm py-1.5 px-0 focus:border-term-green outline-none transition-colors placeholder:text-term-gray",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
