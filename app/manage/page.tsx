"use client";

import Link from "next/link";
import {
  Building2,
  Wallet,
  CircleAlert,
  Wrench,
  ArrowRight,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDorm } from "@/lib/store/useDorm";
import { useHydrated } from "@/lib/store/useHydrated";
import {
  occupancyStats,
  occupancyBreakdown,
  revenueSeries,
  collectedInMonth,
  outstandingTotal,
  overdueBills,
} from "@/lib/derive";
import {
  formatTHB,
  formatMonthShort,
  formatMonth,
  currentMonthKey,
  formatDate,
  formatNumber,
} from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/manage/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Progress } from "@/components/ui/Progress";

const SLICE_COLOR: Record<string, string> = {
  occupied: "var(--color-primary)",
  vacant: "var(--color-success)",
  reserved: "var(--color-info)",
  maintenance: "var(--color-warning)",
};

export default function ManageDashboard() {
  const hydrated = useHydrated();
  const rooms = useDorm((s) => s.rooms);
  const bills = useDorm((s) => s.bills);
  const tenants = useDorm((s) => s.tenants);
  const maintenance = useDorm((s) => s.maintenance);
  const applications = useDorm((s) => s.applications);

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  const occ = occupancyStats(rooms);
  const now = currentMonthKey();
  const revenue = collectedInMonth(bills, now);
  const outstanding = outstandingTotal(bills);
  const overdue = overdueBills(bills);
  const openTix = maintenance.filter((t) => t.status !== "resolved");
  const pendingApps = applications.filter((a) => a.status === "pending");
  const series = revenueSeries(bills, 6);
  const breakdown = occupancyBreakdown(rooms);
  const maxRevenue = Math.max(...series.map((s) => s.billed), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ภาพรวมหอพัก"
        description={`สรุปข้อมูล ณ เดือน${formatMonth(now)}`}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="อัตราการเข้าพัก"
          value={`${occ.rate}%`}
          icon={Building2}
          tone="primary"
          sub={
            <div className="space-y-1.5">
              <Progress value={occ.rate} />
              <span>
                {occ.occupied} จาก {occ.total} ห้องมีผู้เช่า
              </span>
            </div>
          }
        />
        <StatCard
          label="รายรับเดือนนี้"
          value={formatTHB(revenue)}
          icon={Wallet}
          tone="success"
          sub={`เก็บได้จริงในเดือน${formatMonthShort(now)}`}
        />
        <StatCard
          label="ยอดค้างชำระ"
          value={formatTHB(outstanding)}
          icon={CircleAlert}
          tone={overdue.length ? "danger" : "warning"}
          sub={`เกินกำหนด ${overdue.length} รายการ`}
        />
        <StatCard
          label="งานซ่อมค้าง"
          value={formatNumber(openTix.length)}
          icon={Wrench}
          tone="info"
          sub={`รอรับเรื่อง ${maintenance.filter((t) => t.status === "open").length} รายการ`}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-ink">
                <TrendingUp className="size-4 text-primary" aria-hidden />
                รายรับย้อนหลัง 6 เดือน
              </h2>
              <p className="text-xs text-faint">เปรียบเทียบยอดออกบิลกับยอดเก็บได้จริง</p>
            </div>
            <div className="hidden items-center gap-3 text-xs text-subtle sm:flex">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-primary" /> เก็บได้
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-border-strong" /> ออกบิล
              </span>
            </div>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} barGap={4} margin={{ left: -12, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonthShort}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
                  formatter={(v, name) => [
                    formatTHB(Number(v)),
                    name === "collected" ? "เก็บได้" : "ออกบิล",
                  ]}
                  labelFormatter={(l) => formatMonth(String(l))}
                />
                <Bar dataKey="billed" fill="var(--color-border-strong)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-ink">สัดส่วนสถานะห้อง</h2>
          <p className="text-xs text-faint">ทั้งหมด {occ.total} ห้อง</p>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {breakdown.map((entry) => (
                    <Cell key={entry.key} fill={SLICE_COLOR[entry.key]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${Number(v)} ห้อง`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {breakdown.map((b) => (
              <li key={b.key} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: SLICE_COLOR[b.key] }}
                />
                <span className="text-subtle">{b.name}</span>
                <span className="tnum ml-auto font-medium text-ink">{b.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
              <CircleAlert className="size-4 text-danger" aria-hidden />
              บิลเกินกำหนด
            </h2>
            <Link
              href="/manage/billing"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-1.5"
            >
              จัดการบิล <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {overdue.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="ไม่มีบิลเกินกำหนด"
                description="ผู้เช่าชำระเงินครบตามกำหนดทุกราย"
                className="py-8"
              />
            ) : (
              overdue.slice(0, 5).map((b) => {
                const tenant = tenants.find((t) => t.id === b.tenantId);
                const room = rooms.find((r) => r.id === b.roomId);
                return (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger-soft/40 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {tenant?.name ?? "-"} · ห้อง {room?.number}
                      </p>
                      <p className="text-xs text-danger">
                        ครบกำหนด {formatDate(b.dueDate)}
                      </p>
                    </div>
                    <span className="tnum shrink-0 font-semibold text-ink">
                      {formatTHB(b.total)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
              <ClipboardList className="size-4 text-primary" aria-hidden />
              ใบสมัครรอพิจารณา
            </h2>
            <Link
              href="/manage/applications"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-1.5"
            >
              ดูทั้งหมด <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {pendingApps.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="ไม่มีใบสมัครใหม่"
                className="py-8"
              />
            ) : (
              pendingApps.slice(0, 5).map((a) => {
                const room = rooms.find((r) => r.id === a.roomId);
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{a.name}</p>
                      <p className="text-xs text-faint">
                        สนใจห้อง {room?.number ?? "-"} · เข้าอยู่ {formatDate(a.moveInDate)}
                      </p>
                    </div>
                    <Badge tone="info">รอพิจารณา</Badge>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Recent tickets strip */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-ink">
            <Wrench className="size-4 text-primary" aria-hidden />
            งานซ่อมล่าสุด
          </h2>
          <Link
            href="/manage/maintenance"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-1.5"
          >
            คิวงานซ่อม <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {maintenance.slice(0, 6).map((t) => {
            const room = rooms.find((r) => r.id === t.roomId);
            return (
              <div key={t.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-ink">{t.title}</p>
                </div>
                <p className="mt-1 text-xs text-faint">ห้อง {room?.number}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
