import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "accent" | "success" | "warning" | "destructive" | "muted";
  className?: string;
}

export function Badge({ children, variant = "accent", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center",
        variant === "accent" && "bg-accent-muted text-accent",
        variant === "success" && "bg-success-muted text-success",
        variant === "warning" && "bg-warning-muted text-warning",
        variant === "destructive" && "bg-destructive-muted text-destructive",
        variant === "muted" && "bg-surface-elevated text-text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
