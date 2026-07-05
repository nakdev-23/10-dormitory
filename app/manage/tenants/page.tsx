"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Users,
  Phone,
  Mail,
  Briefcase,
  ShieldAlert,
  CalendarDays,
  Home,
  ChevronRight,
} from "lucide-react";
import { useDorm } from "@/lib/store/useDorm";
import { useHydrated } from "@/lib/store/useHydrated";
import { tenantStatus as tenantStatusMap, billStatus as billStatusMap } from "@/lib/labels";
import { tenantBalance } from "@/lib/derive";
import { formatTHB, formatDate, formatMonth, daysUntil } from "@/lib/utils";
import type { Tenant } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Segmented } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ManageTenantsPage() {
  const hydrated = useHydrated();
  const tenants = useDorm((s) => s.tenants);
  const rooms = useDorm((s) => s.rooms);
  const bills = useDorm((s) => s.bills);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "notice" | "debt">("all");
  const [selected, setSelected] = useState<Tenant | null>(null);

  const rows = useMemo(
    () =>
      tenants
        .map((t) => ({
          tenant: t,
          room: rooms.find((r) => r.id === t.roomId),
          balance: tenantBalance(bills, t.id),
        }))
        .filter(({ tenant, balance }) => {
          if (filter === "active" && tenant.status !== "active") return false;
          if (filter === "notice" && tenant.status !== "notice") return false;
          if (filter === "debt" && balance <= 0) return false;
          if (q) {
            const needle = q.trim().toLowerCase();
            return (
              tenant.name.toLowerCase().includes(needle) ||
              tenant.phone.includes(needle)
            );
          }
          return true;
        })
        .sort((a, b) => a.room?.number.localeCompare(b.room?.number ?? "") ?? 0),
    [tenants, rooms, bills, q, filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="ผู้เช่า"
        description={`ทั้งหมด ${tenants.length} ราย · ดูข้อมูลสัญญา การติดต่อ และยอดค้างชำระ`}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "ทั้งหมด" },
            { value: "active", label: "กำลังเช่า" },
            { value: "notice", label: "แจ้งย้ายออก" },
            { value: "debt", label: "มียอดค้าง" },
          ]}
        />
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาชื่อหรือเบอร์โทร"
            className="h-10 pl-9"
          />
        </div>
      </div>

      {!hydrated ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="ไม่พบผู้เช่า"
          description="ลองปรับตัวกรองหรือคำค้นหาใหม่"
        />
      ) : (
        <div className="grid gap-3">
          {rows.map(({ tenant, room, balance }) => {
            const st = tenantStatusMap[tenant.status];
            return (
              <button
                key={tenant.id}
                onClick={() => setSelected(tenant)}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Avatar name={tenant.name} seed={tenant.avatarSeed} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{tenant.name}</p>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-faint">
                    ห้อง {room?.number ?? "-"} · {tenant.phone}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-faint">ยอดค้างชำระ</p>
                  <p
                    className={`tnum font-semibold ${balance > 0 ? "text-danger" : "text-success"}`}
                  >
                    {balance > 0 ? formatTHB(balance) : "ไม่มี"}
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-faint" aria-hidden />
              </button>
            );
          })}
        </div>
      )}

      <TenantDetailModal
        tenant={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function TenantDetailModal({
  tenant,
  onClose,
}: {
  tenant: Tenant | null;
  onClose: () => void;
}) {
  const rooms = useDorm((s) => s.rooms);
  const bills = useDorm((s) => s.bills);
  const maintenance = useDorm((s) => s.maintenance);

  if (!tenant) return <Modal open={false} onClose={onClose} title="" >{null}</Modal>;

  const room = rooms.find((r) => r.id === tenant.roomId);
  const myBills = bills
    .filter((b) => b.tenantId === tenant.id)
    .sort((a, b) => b.month.localeCompare(a.month));
  const balance = tenantBalance(bills, tenant.id);
  const openTix = maintenance.filter(
    (t) => t.tenantId === tenant.id && t.status !== "resolved",
  ).length;
  const daysLeft = daysUntil(tenant.leaseEnd);
  const st = tenantStatusMap[tenant.status];

  return (
    <Modal open={!!tenant} onClose={onClose} title="ข้อมูลผู้เช่า" size="lg">
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar name={tenant.name} seed={tenant.avatarSeed} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-ink">{tenant.name}</h3>
              <Badge tone={st.tone}>{st.label}</Badge>
            </div>
            <p className="text-sm text-faint">
              ห้อง {room?.number} · ชั้น {room?.floor}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow icon={Phone} label="โทรศัพท์" value={tenant.phone} />
          <InfoRow icon={Mail} label="อีเมล" value={tenant.email} />
          <InfoRow icon={Briefcase} label="อาชีพ" value={tenant.occupation} />
          <InfoRow icon={Home} label="ห้องพัก" value={`ห้อง ${room?.number ?? "-"}`} />
          <InfoRow
            icon={CalendarDays}
            label="ระยะสัญญา"
            value={`${formatDate(tenant.leaseStart)} – ${formatDate(tenant.leaseEnd)}`}
          />
          <InfoRow
            icon={ShieldAlert}
            label="ผู้ติดต่อฉุกเฉิน"
            value={`${tenant.emergencyName} · ${tenant.emergencyPhone}`}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="ยอดค้างชำระ" value={balance > 0 ? formatTHB(balance) : "ไม่มี"} tone={balance > 0 ? "danger" : "success"} />
          <Stat label="เงินมัดจำ" value={formatTHB(tenant.deposit)} />
          <Stat
            label="สัญญาเหลือ"
            value={daysLeft > 0 ? `${daysLeft} วัน` : "หมดอายุ"}
            tone={daysLeft < 45 ? "warning" : "default"}
          />
        </div>

        {openTix > 0 && (
          <p className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">
            มีงานแจ้งซ่อมที่ยังไม่เสร็จ {openTix} รายการ
          </p>
        )}

        <div>
          <h4 className="mb-2 text-sm font-semibold text-ink">ประวัติบิลล่าสุด</h4>
          <div className="space-y-1.5">
            {myBills.slice(0, 5).map((b) => {
              const bs = billStatusMap[b.status];
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="text-subtle">ค่าเช่าเดือน{formatMonth(b.month)}</span>
                  <div className="flex items-center gap-3">
                    <span className="tnum font-medium text-ink">{formatTHB(b.total)}</span>
                    <Badge tone={bs.tone}>{bs.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-faint">{label}</p>
        <p className="truncate text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger" | "success" | "warning";
}) {
  const color = {
    default: "text-ink",
    danger: "text-danger",
    success: "text-success",
    warning: "text-warning",
  }[tone];
  return (
    <div className="rounded-lg bg-surface-2 p-3 text-center">
      <p className="text-xs text-faint">{label}</p>
      <p className={`tnum mt-0.5 font-semibold ${color}`}>{value}</p>
    </div>
  );
}
