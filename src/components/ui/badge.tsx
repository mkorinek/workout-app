import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "amber" | "red" | "gray";
  className?: string;
}

export function Badge({ children, variant = "green", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 border",
        variant === "green" && "border-term-green text-term-green",
        variant === "amber" && "border-term-amber text-term-amber",
        variant === "red" && "border-term-red text-term-red",
        variant === "gray" && "border-term-gray text-term-gray-light",
        className
      )}
    >
      {children}
    </span>
  );
}
