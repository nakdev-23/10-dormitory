"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  DoorOpen,
  Users,
  ReceiptText,
  Wrench,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useDorm } from "@/lib/store/useDorm";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/manage", label: "ภาพรวม", icon: LayoutDashboard, exact: true },
  { href: "/manage/rooms", label: "จัดการห้องพัก", icon: DoorOpen },
  { href: "/manage/tenants", label: "ผู้เช่า", icon: Users },
  { href: "/manage/billing", label: "บิลและการเงิน", icon: ReceiptText },
  { href: "/manage/maintenance", label: "งานซ่อมบำรุง", icon: Wrench },
  { href: "/manage/applications", label: "ใบสมัครเช่า", icon: ClipboardList },
];

function useBadges() {
  const bills = useDorm((s) => s.bills);
  const maintenance = useDorm((s) => s.maintenance);
  const applications = useDorm((s) => s.applications);
  return {
    "/manage/billing": bills.filter((b) => b.status !== "paid").length,
    "/manage/maintenance": maintenance.filter((t) => t.status !== "resolved").length,
    "/manage/applications": applications.filter((a) => a.status === "pending").length,
  } as Record<string, number>;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const badges = useBadges();
  return (
    <nav className="flex flex-col gap-1" aria-label="เมนูผู้ดูแล">
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        const badge = badges[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-fg shadow-sm"
                : "text-subtle hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Icon className="size-[1.15rem] shrink-0" aria-hidden />
            <span className="flex-1">{item.label}</span>
            {badge ? (
              <span
                className={cn(
                  "tnum grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[0.68rem] font-bold",
                  active
                    ? "bg-primary-fg/20 text-primary-fg"
                    : "bg-danger-soft text-danger",
                )}
              >
                {badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function ManageShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo href="/manage" />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <div className="space-y-3 border-t border-border p-4">
          <p className="text-xs text-faint">มุมมองปัจจุบัน</p>
          <RoleSwitcher className="w-full justify-center" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border glass px-4 sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              className="grid size-10 cursor-pointer place-items-center rounded-lg border border-border bg-surface text-ink"
              onClick={() => setOpen(true)}
              aria-label="เปิดเมนู"
            >
              <Menu className="size-5" />
            </button>
            <Logo href="/manage" compact />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-ink">ระบบจัดการหอพัก</p>
            <p className="text-xs text-faint">แผงควบคุมสำหรับผู้ดูแล</p>
          </div>
          <div className="flex items-center gap-2">
            <RoleSwitcher className="lg:hidden" />
            <ThemeToggle />
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-surface"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-5">
                <Logo href="/manage" />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="ปิดเมนู"
                  className="grid size-9 cursor-pointer place-items-center rounded-lg text-subtle hover:bg-surface-2"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
