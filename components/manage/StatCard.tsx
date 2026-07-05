import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "primary",
  className,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    info: "bg-info-soft text-info",
  }[tone];

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-xs",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-subtle">{label}</span>
        <span className={cn("grid size-9 place-items-center rounded-lg", toneMap)}>
          <Icon className="size-[1.15rem]" aria-hidden />
        </span>
      </div>
      <p className="tnum text-2xl font-semibold text-ink sm:text-3xl">{value}</p>
      {sub && <div className="text-xs text-faint">{sub}</div>}
    </div>
  );
}
