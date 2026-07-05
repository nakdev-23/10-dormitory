"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "หน้าแรก" },
  { href: "/rooms", label: "ห้องพัก" },
  { href: "/apply", label: "สมัครเช่า" },
  { href: "/portal", label: "พอร์ทัลผู้เช่า" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-border glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="หลัก">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(l.href)
                  ? "bg-primary/10 text-primary"
                  : "text-subtle hover:bg-surface-2 hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <RoleSwitcher className="hidden sm:inline-flex" />
          <ThemeToggle />
          <button
            className="grid size-10 cursor-pointer place-items-center rounded-lg border border-border bg-surface text-ink md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-surface md:hidden"
          >
            <nav className="flex flex-col gap-1 p-4" aria-label="เมนูมือถือ">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive(l.href)
                      ? "bg-primary/10 text-primary"
                      : "text-subtle hover:bg-surface-2",
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-3">
                <span className="text-xs text-faint">สลับมุมมอง</span>
                <RoleSwitcher />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-subtle">
            หอพักคุณภาพใจกลางเมือง จัดการค่าเช่า แจ้งซ่อม และดูแลผู้เช่าครบวงจร
            ในระบบเดียวที่ออกแบบมาเพื่อความสบายใจของทุกฝ่าย
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink">เมนู</h3>
          <ul className="mt-3 space-y-2 text-sm text-subtle">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink">ติดต่อ</h3>
          <ul className="mt-3 space-y-2 text-sm text-subtle">
            <li>88 ถ.สุขุมวิท กรุงเทพฯ 10110</li>
            <li>โทร. 02-123-4567</li>
            <li>hello@romyen.co.th</li>
            <li>เปิดสำนักงานทุกวัน 08:00–20:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-faint">
        © {new Date().getFullYear()} บ้านร่มเย็น เรสซิเดนซ์ · ระบบสาธิตเพื่อการนำเสนอผลงาน
      </div>
    </footer>
  );
}
