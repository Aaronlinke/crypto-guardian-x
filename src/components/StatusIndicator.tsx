import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "active" | "warning" | "critical" | "inactive";
  label: string;
  className?: string;
}

export const StatusIndicator = ({ status, label, className }: StatusIndicatorProps) => {
  const statusStyles = {
    active: "bg-primary pulse-green",
    warning: "bg-warning pulse-amber",
    critical: "bg-destructive pulse-red",
    inactive: "bg-muted",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-2 h-2 rounded-full", statusStyles[status])} />
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
};
