"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useUI } from "@/lib/store/useUI";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useUI((s) => s.theme);
  const toggleTheme = useUI((s) => s.toggleTheme);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
      className={cn(
        "grid size-10 cursor-pointer place-items-center rounded-lg border border-border bg-surface text-ink transition-colors hover:bg-surface-2",
        className,
      )}
    >
      {isDark ? (
        <Sun className="size-5" aria-hidden />
      ) : (
        <Moon className="size-5" aria-hidden />
      )}
    </button>
  );
}
