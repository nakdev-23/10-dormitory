"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export function Tabs({
  items,
  active,
  onChange,
  className,
}: {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1 overflow-x-auto no-scrollbar border-b border-border",
        className,
      )}
    >
      {items.map((it) => {
        const isActive = it.key === active;
        return (
          <button
            key={it.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(it.key)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 px-3.5 py-2.5 text-sm font-medium cursor-pointer transition-colors",
              isActive ? "text-primary" : "text-subtle hover:text-ink",
            )}
          >
            {it.icon}
            {it.label}
            {typeof it.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[0.68rem] font-semibold tnum",
                  isActive ? "bg-primary/12 text-primary" : "bg-muted text-faint",
                )}
              >
                {it.count}
              </span>
            )}
            {isActive && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* Compact segmented control for filters */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border bg-surface-2 p-0.5",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === o.value
              ? "bg-surface text-ink shadow-xs"
              : "text-subtle hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
