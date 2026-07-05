"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Home,
  ReceiptText,
  History,
  Wrench,
  Megaphone,
  CalendarDays,
  Wallet,
  MapPin,
  CircleAlert,
  CheckCircle2,
  Plus,
  Printer,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useDorm } from "@/lib/store/useDorm";
import { useSession } from "@/lib/store/useSession";
import { useHydrated } from "@/lib/store/useHydrated";
import { useUI } from "@/lib/store/useUI";
import {
  billStatus as billStatusMap,
  paymentMethod as paymentMethodMap,
  roomTypeLabel,
  ticketStatus as ticketStatusMap,
  ticketCategory,
} from "@/lib/labels";
import { tenantBalance } from "@/lib/derive";
import {
  formatTHB,
  formatDate,
  formatMonth,
  daysUntil,
  relativeThai,
} from "@/lib/utils";
import type { Bill, PaymentMethod } from "@/lib/types";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { RoomImage } from "@/components/RoomImage";
import { BillBreakdown } from "@/components/BillBreakdown";
import { TicketForm } from "@/components/TicketForm";
import { cn } from "@/lib/utils";

type TabKey = "overview" | "bills" | "history" | "maintenance" | "news";

export default function PortalPage() {
  const hydrated = useHydrated();
  const tenants = useDorm((s) => s.tenants);
  const rooms = useDorm((s) => s.rooms);
  const bills = useDorm((s) => s.bills);
  const maintenance = useDorm((s) => s.maintenance);
  const announcements = useDorm((s) => s.announcements);
  const markBillPaid = useDorm((s) => s.markBillPaid);
  const notify = useUI((s) => s.notify);

  const currentTenantId = useSession((s) => s.currentTenantId);
  const setCurrentTenant = useSession((s) => s.setCurrentTenant);

  const [tab, setTab] = useState<TabKey>("overview");
  const [payBill, setPayBill] = useState<Bill | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("promptpay");
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<Bill | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);

  const tenant =
    tenants.find((t) => t.id === currentTenantId) ?? tenants[0];
  const room = rooms.find((r) => r.id === tenant?.roomId);

  const myBills = useMemo(
    () =>
      bills
        .filter((b) => b.tenantId === tenant?.id)
        .sort((a, b) => b.month.localeCompare(a.month)),
    [bills, tenant?.id],
  );
  const outstanding = myBills.filter((b) => b.status !== "paid");
  const paidBills = myBills.filter((b) => b.status === "paid");
  const myTickets = useMemo(
    () =>
      maintenance
        .filter((t) => t.tenantId === tenant?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [maintenance, tenant?.id],
  );
  const balance = tenant ? tenantBalance(bills, tenant.id) : 0;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-6 h-40 w-full rounded-xl" />
        <Skeleton className="mt-4 h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!tenant || !room) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={Home}
          title="ยังไม่มีข้อมูลผู้เช่า"
          description="กรุณาเลือกผู้เช่าตัวอย่าง หรือให้ผู้ดูแลอนุมัติใบสมัครก่อน"
        />
      </div>
    );
  }

  const doPay = () => {
    if (!payBill) return;
    setPaying(true);
    setTimeout(() => {
      const updated = markBillPaid(payBill.id, method);
      setPaying(false);
      setPayBill(null);
      if (updated) {
        setReceipt(updated);
        notify("ชำระเงินสำเร็จ", "success", `ใบเสร็จเลขที่ ${updated.receiptNo}`);
      }
    }, 900);
  };

  const daysLeft = daysUntil(tenant.leaseEnd);

  const tabs = [
    { key: "overview", label: "ภาพรวม", icon: <Home className="size-4" /> },
    {
      key: "bills",
      label: "บิลค่าเช่า",
      icon: <ReceiptText className="size-4" />,
      count: outstanding.length,
    },
    { key: "history", label: "ประวัติชำระ", icon: <History className="size-4" /> },
    {
      key: "maintenance",
      label: "แจ้งซ่อม",
      icon: <Wrench className="size-4" />,
      count: myTickets.filter((t) => t.status !== "resolved").length,
    },
    { key: "news", label: "ประกาศ", icon: <Megaphone className="size-4" /> },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-subtle">พอร์ทัลผู้เช่า</p>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
            สวัสดี, {tenant.name.split(" ")[0]}
          </h1>
        </div>
        <label className="flex items-center gap-2 text-sm text-subtle">
          <span className="whitespace-nowrap">เข้าใช้เป็น</span>
          <Select
            value={tenant.id}
            onChange={(e) => setCurrentTenant(e.target.value)}
            className="h-10"
            aria-label="เลือกผู้เช่าตัวอย่าง"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · ห้อง {rooms.find((r) => r.id === t.roomId)?.number ?? "-"}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {/* Outstanding banner */}
      {balance > 0 && (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
            <div>
              <p className="font-semibold text-ink">
                คุณมียอดค้างชำระ {outstanding.length} รายการ
              </p>
              <p className="text-sm text-subtle">
                ยอดรวม{" "}
                <span className="tnum font-semibold text-ink">{formatTHB(balance)}</span>{" "}
                กรุณาชำระภายในกำหนดเพื่อหลีกเลี่ยงค่าปรับ
              </p>
            </div>
          </div>
          <Button onClick={() => setTab("bills")} className="shrink-0">
            ไปชำระเงิน
          </Button>
        </div>
      )}

      <div className="mt-6">
        <Tabs items={tabs} active={tab} onChange={(k) => setTab(k as TabKey)} />
      </div>

      <div className="mt-6">
        {/* ---------------- Overview ---------------- */}
        {tab === "overview" && (
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Card className="overflow-hidden">
              <RoomImage
                seed={room.photoSeed}
                alt={`ห้อง ${room.number}`}
                className="aspect-[16/9]"
                sizes="(max-width: 1024px) 100vw, 520px"
                priority
              />
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <Badge tone="primary">{roomTypeLabel[room.type]}</Badge>
                  <Badge tone="success" dot>
                    ห้องของคุณ
                  </Badge>
                </div>
                <h2 className="mt-2 text-xl font-semibold text-ink">
                  ห้อง {room.number}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-subtle">
                  <MapPin className="size-4" aria-hidden />
                  ชั้น {room.floor} · {room.size} ตร.ม.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                  <div>
                    <p className="text-xs text-faint">ค่าเช่า/เดือน</p>
                    <p className="tnum text-lg font-semibold text-ink">
                      {formatTHB(room.rent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-faint">เงินมัดจำ</p>
                    <p className="tnum text-lg font-semibold text-ink">
                      {formatTHB(tenant.deposit)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-5">
              <Card className="p-5">
                <h3 className="flex items-center gap-2 font-semibold text-ink">
                  <CalendarDays className="size-4 text-primary" aria-hidden />
                  ข้อมูลสัญญาเช่า
                </h3>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-subtle">เริ่มสัญญา</dt>
                    <dd className="font-medium text-ink">{formatDate(tenant.leaseStart)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-subtle">สิ้นสุดสัญญา</dt>
                    <dd className="font-medium text-ink">{formatDate(tenant.leaseEnd)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-subtle">คงเหลือ</dt>
                    <dd className={cn("font-medium", daysLeft < 45 ? "text-warning" : "text-ink")}>
                      {daysLeft > 0 ? `อีก ${daysLeft} วัน` : "หมดอายุแล้ว"}
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card className="p-5">
                <h3 className="flex items-center gap-2 font-semibold text-ink">
                  <Wallet className="size-4 text-primary" aria-hidden />
                  สถานะการเงิน
                </h3>
                {balance > 0 ? (
                  <>
                    <p className="mt-3 text-sm text-subtle">ยอดค้างชำระทั้งหมด</p>
                    <p className="tnum text-2xl font-semibold text-danger">
                      {formatTHB(balance)}
                    </p>
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => setTab("bills")}
                    >
                      ชำระเงินตอนนี้
                    </Button>
                  </>
                ) : (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-success-soft px-3 py-3 text-sm text-success">
                    <CheckCircle2 className="size-5" aria-hidden />
                    ไม่มียอดค้างชำระ ขอบคุณค่ะ
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ---------------- Bills ---------------- */}
        {tab === "bills" && (
          <div className="space-y-3">
            {outstanding.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="ไม่มีบิลค้างชำระ"
                description="คุณชำระค่าเช่าครบทุกรายการแล้ว ดูประวัติได้ที่แท็บประวัติชำระ"
              />
            ) : (
              outstanding.map((bill) => (
                <BillRow
                  key={bill.id}
                  bill={bill}
                  onPay={() => {
                    setPayBill(bill);
                    setMethod("promptpay");
                  }}
                />
              ))
            )}
          </div>
        )}

        {/* ---------------- History ---------------- */}
        {tab === "history" && (
          <div className="space-y-3">
            {paidBills.length === 0 ? (
              <EmptyState
                icon={History}
                title="ยังไม่มีประวัติการชำระ"
                description="เมื่อคุณชำระบิลแล้ว รายการจะปรากฏที่นี่พร้อมใบเสร็จ"
              />
            ) : (
              paidBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-success-soft text-success">
                      <CheckCircle2 className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="font-medium text-ink">
                        ค่าเช่าเดือน{formatMonth(bill.month)}
                      </p>
                      <p className="text-xs text-faint">
                        ชำระเมื่อ {bill.paidDate ? formatDate(bill.paidDate) : "-"} ·{" "}
                        {bill.method ? paymentMethodMap[bill.method] : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="tnum font-semibold text-ink">{formatTHB(bill.total)}</p>
                    <button
                      onClick={() => setReceipt(bill)}
                      className="cursor-pointer text-xs font-medium text-primary hover:underline"
                    >
                      ดูใบเสร็จ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ---------------- Maintenance ---------------- */}
        {tab === "maintenance" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-subtle">
                รายการแจ้งซ่อมของห้อง {room.number}
              </p>
              <Button size="sm" onClick={() => setTicketOpen(true)}>
                <Plus className="size-4" aria-hidden />
                แจ้งซ่อมใหม่
              </Button>
            </div>
            {myTickets.length === 0 ? (
              <EmptyState
                icon={Wrench}
                title="ยังไม่มีการแจ้งซ่อม"
                description="เมื่อพบปัญหาภายในห้อง สามารถแจ้งซ่อมได้ตลอด 24 ชั่วโมง"
                action={
                  <Button size="sm" onClick={() => setTicketOpen(true)}>
                    แจ้งซ่อมใหม่
                  </Button>
                }
              />
            ) : (
              myTickets.map((t) => {
                const st = ticketStatusMap[t.status];
                return (
                  <Card key={t.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-ink">{t.title}</h3>
                          <Badge tone={st.tone} dot>
                            {st.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-subtle">{t.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-faint">
                      <span>ประเภท: {ticketCategory[t.category]}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" aria-hidden />
                        แจ้งเมื่อ {relativeThai(t.createdAt)}
                      </span>
                      {t.assignee && <span>ช่างผู้รับผิดชอบ: {t.assignee}</span>}
                    </div>
                    {t.status === "resolved" && t.resolutionNote && (
                      <p className="mt-2 rounded-lg bg-success-soft px-3 py-2 text-xs text-success">
                        {t.resolutionNote}
                      </p>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* ---------------- Announcements ---------------- */}
        {tab === "news" && (
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <EmptyState icon={Megaphone} title="ยังไม่มีประกาศ" />
            ) : (
              [...announcements]
                .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date))
                .map((a) => (
                  <Card key={a.id} className="p-4">
                    <div className="flex items-center gap-2">
                      {a.pinned && <Badge tone="warning">ปักหมุด</Badge>}
                      <h3 className="font-semibold text-ink">{a.title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-subtle">{a.body}</p>
                    <p className="mt-2 text-xs text-faint">{formatDate(a.date)}</p>
                  </Card>
                ))
            )}
          </div>
        )}
      </div>

      {/* Pay modal */}
      <Modal
        open={!!payBill}
        onClose={() => (paying ? null : setPayBill(null))}
        title="ชำระค่าเช่า"
        description={payBill ? `เดือน${formatMonth(payBill.month)}` : ""}
        footer={
          <>
            <Button variant="outline" onClick={() => setPayBill(null)} disabled={paying}>
              ยกเลิก
            </Button>
            <Button onClick={doPay} loading={paying}>
              {paying ? "กำลังดำเนินการ..." : payBill ? `ชำระ ${formatTHB(payBill.total)}` : ""}
            </Button>
          </>
        }
      >
        {payBill && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <BillBreakdown bill={payBill} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-ink">เลือกช่องทางชำระเงิน</p>
              <Segmented
                value={method}
                onChange={setMethod}
                options={[
                  { value: "promptpay", label: "พร้อมเพย์" },
                  { value: "transfer", label: "โอนธนาคาร" },
                  { value: "card", label: "บัตรเครดิต" },
                ]}
                className="w-full"
              />
              <p className="mt-2 text-xs text-faint">
                * ระบบสาธิต — ไม่มีการตัดเงินจริง
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Receipt modal */}
      <ReceiptModal
        bill={receipt}
        tenantName={tenant.name}
        roomNumber={room.number}
        onClose={() => setReceipt(null)}
      />

      {/* Ticket modal */}
      <Modal
        open={ticketOpen}
        onClose={() => setTicketOpen(false)}
        title="แจ้งซ่อมบำรุง"
        description={`ห้อง ${room.number}`}
        size="lg"
      >
        <TicketForm
          roomId={room.id}
          tenantId={tenant.id}
          onSuccess={() => setTicketOpen(false)}
        />
      </Modal>
    </div>
  );
}

/* ------------------------------ Bill row ------------------------------ */

function BillRow({ bill, onPay }: { bill: Bill; onPay: () => void }) {
  const st = billStatusMap[bill.status];
  const overdue = bill.status === "overdue";
  return (
    <div
      className={cn(
        "rounded-xl border bg-surface p-4",
        overdue ? "border-danger/40 bg-danger-soft/40" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-ink">ค่าเช่าเดือน{formatMonth(bill.month)}</h3>
            <Badge tone={st.tone} dot>
              {st.label}
            </Badge>
          </div>
          <p className={cn("mt-1 text-xs", overdue ? "text-danger" : "text-faint")}>
            กำหนดชำระ {formatDate(bill.dueDate)}
            {overdue && ` · เกินกำหนด ${Math.abs(daysUntil(bill.dueDate))} วัน`}
          </p>
        </div>
        <div className="text-right">
          <p className="tnum text-lg font-semibold text-ink">{formatTHB(bill.total)}</p>
        </div>
      </div>
      <div className="mt-3 border-t border-border/70 pt-3">
        <BillBreakdown bill={bill} />
      </div>
      <Button className="mt-4 w-full sm:w-auto" onClick={onPay}>
        ชำระเงิน
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

/* ------------------------------ Receipt ------------------------------ */

function ReceiptModal({
  bill,
  tenantName,
  roomNumber,
  onClose,
}: {
  bill: Bill | null;
  tenantName: string;
  roomNumber: string;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!bill}
      onClose={onClose}
      title="ใบเสร็จรับเงิน"
      size="md"
      footer={
        <Button variant="outline" onClick={onClose}>
          ปิด
        </Button>
      }
    >
      {bill && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-success-soft px-4 py-3">
            <CheckCircle2 className="size-6 text-success" aria-hidden />
            <div>
              <p className="font-semibold text-ink">ชำระเงินเรียบร้อยแล้ว</p>
              <p className="text-xs text-subtle">ขอบคุณที่ชำระตรงเวลา</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-faint">เลขที่ใบเสร็จ</dt>
              <dd className="tnum font-medium text-ink">{bill.receiptNo}</dd>
            </div>
            <div>
              <dt className="text-xs text-faint">วันที่ชำระ</dt>
              <dd className="font-medium text-ink">
                {bill.paidDate ? formatDate(bill.paidDate) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-faint">ผู้เช่า</dt>
              <dd className="font-medium text-ink">{tenantName}</dd>
            </div>
            <div>
              <dt className="text-xs text-faint">ห้อง</dt>
              <dd className="font-medium text-ink">{roomNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-faint">รอบบิล</dt>
              <dd className="font-medium text-ink">{formatMonth(bill.month)}</dd>
            </div>
            <div>
              <dt className="text-xs text-faint">ช่องทาง</dt>
              <dd className="font-medium text-ink">
                {bill.method ? paymentMethodMap[bill.method] : "-"}
              </dd>
            </div>
          </dl>
          <div className="rounded-xl border border-border p-4">
            <BillBreakdown bill={bill} />
          </div>
          <p className="flex items-center justify-center gap-1.5 text-xs text-faint">
            <Printer className="size-3.5" aria-hidden />
            ระบบสาธิต — ใบเสร็จนี้ใช้เพื่อการนำเสนอเท่านั้น
          </p>
        </div>
      )}
    </Modal>
  );
}
