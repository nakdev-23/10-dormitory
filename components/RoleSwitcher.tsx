"use client";

import { useRouter } from "next/navigation";
import { LayoutDashboard, UserRound } from "lucide-react";
import { useSession } from "@/lib/store/useSession";
import { cn } from "@/lib/utils";

/** Segmented tenant / manager view switcher that also navigates. */
export function RoleSwitcher({ className }: { className?: string }) {
  const role = useSession((s) => s.role);
  const setRole = useSession((s) => s.setRole);
  const router = useRouter();

  const go = (r: "tenant" | "manager") => {
    setRole(r);
    router.push(r === "manager" ? "/manage" : "/portal");
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-surface-2 p-0.5",
        className,
      )}
      role="group"
      aria-label="สลับมุมมองผู้ใช้"
    >
      <button
        onClick={() => go("tenant")}
        aria-pressed={role === "tenant"}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
          role === "tenant" ? "bg-surface text-ink shadow-xs" : "text-subtle hover:text-ink",
        )}
      >
        <UserRound className="size-4" aria-hidden />
        ผู้เช่า
      </button>
      <button
        onClick={() => go("manager")}
        aria-pressed={role === "manager"}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
          role === "manager" ? "bg-surface text-ink shadow-xs" : "text-subtle hover:text-ink",
        )}
      >
        <LayoutDashboard className="size-4" aria-hidden />
        ผู้ดูแล
      </button>
    </div>
  );
}
