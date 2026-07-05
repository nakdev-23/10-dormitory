"use client";

import { useMemo, useState } from "react";
import {
  ReceiptText,
  FilePlus2,
  Wallet,
  CircleAlert,
  CheckCircle2,
  Droplets,
  Zap,
} from "lucide-react";
import { useDorm } from "@/lib/store/useDorm";
import { useHydrated } from "@/lib/store/useHydrated";
import { useUI } from "@/lib/store/useUI";
import { billStatus as billStatusMap, paymentMethod as pmMap } from "@/lib/labels";
import {
  formatTHB,
  formatMonth,
  formatDate,
  currentMonthKey,
  addMonthsToKey,
  formatNumber,
  daysUntil,
} from "@/lib/utils";
import type { Bill, PaymentMethod } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/manage/StatCard";
import { BillBreakdown } from "@/components/BillBreakdown";
import { cn } from "@/lib/utils";

const monthOptions = Array.from({ length: 6 }, (_, i) =>
  addMonthsToKey(currentMonthKey(), -i),
);

export default function ManageBillingPage() {
  const hydrated = useHydrated();
  const bills = useDorm((s) => s.bills);
  const tenants = useDorm((s) => s.tenants);
  const rooms = useDorm((s) => s.rooms);
  const generateBills = useDorm((s) => s.generateBills);
  const markBillPaid = useDorm((s) => s.markBillPaid);
  const notify = useUI((s) => s.notify);

  const [month, setMonth] = useState(currentMonthKey());
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "paid" | "overdue">("all");
  const [payBill, setPayBill] = useState<Bill | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("transfer");

  const monthBills = useMemo(
    () => bills.filter((b) => b.month === month),
    [bills, month],
  );

  const summary = useMemo(() => {
    const billed = monthBills.reduce((s, b) => s + b.total, 0);
    const collected = monthBills
      .filter((b) => b.status === "paid")
      .reduce((s, b) => s + b.total, 0);
    const outstanding = billed - collected;
    const overdue = monthBills.filter((b) => b.status === "overdue").length;
    return { billed, collected, outstanding, overdue };
  }, [monthBills]);

  const filtered = useMemo(
    () =>
      monthBills
        .filter((b) => statusFilter === "all" || b.status === statusFilter)
        .sort((a, b) => {
          const rank = { overdue: 0, unpaid: 1, paid: 2 };
          return rank[a.status] - rank[b.status];
        }),
    [monthBills, statusFilter],
  );

  const occupiedCount = rooms.filter((r) => r.status === "occupied").length;
  const canGenerate = monthBills.length < occupiedCount;

  const handleGenerate = () => {
    const count = generateBills(month);
    if (count > 0)
      notify(
        "ออกบิลเรียบร้อย",
        "success",
        `สร้างบิลใหม่ ${count} รายการสำหรับเดือน${formatMonth(month)}`,
      );
    else notify("ไม่มีบิลใหม่ให้สร้าง", "info", "ทุกห้องที่มีผู้เช่ามีบิลแล้ว");
  };

  const doMarkPaid = () => {
    if (!payBill) return;
    const updated = markBillPaid(payBill.id, method);
    if (updated)
      notify("บันทึกการชำระแล้ว", "success", `ใบเสร็จ ${updated.receiptNo}`);
    setPayBill(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="บิลและการเงิน"
        description="ออกบิลค่าเช่ารายเดือน คำนวณค่าน้ำ-ค่าไฟจากมิเตอร์ และติดตามการชำระ"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-11 w-44"
              aria-label="เลือกเดือน"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                </option>
              ))}
            </Select>
            <Button onClick={handleGenerate} disabled={!canGenerate}>
              <FilePlus2 className="size-4" aria-hidden />
              ออกบิลเดือนนี้
            </Button>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="ยอดออกบิลรวม"
          value={formatTHB(summary.billed)}
          icon={ReceiptText}
          tone="primary"
          sub={`${monthBills.length} รายการ`}
        />
        <StatCard
          label="เก็บได้แล้ว"
          value={formatTHB(summary.collected)}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="ยังค้างชำระ"
          value={formatTHB(summary.outstanding)}
          icon={Wallet}
          tone="warning"
        />
        <StatCard
          label="เกินกำหนด"
          value={formatNumber(summary.overdue)}
          icon={CircleAlert}
          tone={summary.overdue ? "danger" : "info"}
          sub="รายการ"
        />
      </div>

      {canGenerate && hydrated && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 px-5 py-4">
          <p className="text-sm text-ink">
            เดือน{formatMonth(month)} ยังออกบิลไม่ครบ — มีผู้เช่า {occupiedCount} ห้อง
            แต่ออกบิลแล้ว {monthBills.length} รายการ
          </p>
          <Button size="sm" onClick={handleGenerate}>
            ออกบิลส่วนที่เหลือ
          </Button>
        </div>
      )}

      {/* Filter */}
      <Segmented
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { value: "all", label: "ทั้งหมด" },
          { value: "overdue", label: "เกินกำหนด" },
          { value: "unpaid", label: "รอชำระ" },
          { value: "paid", label: "ชำระแล้ว" },
        ]}
      />

      {/* List */}
      {!hydrated ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={monthBills.length === 0 ? "ยังไม่มีบิลสำหรับเดือนนี้" : "ไม่มีรายการตรงตัวกรอง"}
          description={
            monthBills.length === 0
              ? "กด “ออกบิลเดือนนี้” เพื่อสร้างบิลค่าเช่าจากค่าห้องและมิเตอร์"
              : "ลองเปลี่ยนตัวกรองสถานะ"
          }
          action={
            monthBills.length === 0 && canGenerate ? (
              <Button onClick={handleGenerate}>ออกบิลเดือนนี้</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((bill) => {
            const tenant = tenants.find((t) => t.id === bill.tenantId);
            const room = rooms.find((r) => r.id === bill.roomId);
            const bs = billStatusMap[bill.status];
            const overdue = bill.status === "overdue";
            return (
              <Card
                key={bill.id}
                className={cn("p-4", overdue && "border-danger/40 bg-danger-soft/30")}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink">
                        ห้อง {room?.number} · {tenant?.name}
                      </h3>
                      <Badge tone={bs.tone} dot>
                        {bs.label}
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-faint">
                      <span className="inline-flex items-center gap-1">
                        <Droplets className="size-3.5" aria-hidden />
                        น้ำ {formatNumber(bill.waterUnits)} หน่วย
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Zap className="size-3.5" aria-hidden />
                        ไฟ {formatNumber(bill.electricUnits)} หน่วย
                      </span>
                      <span className={overdue ? "text-danger" : ""}>
                        ครบกำหนด {formatDate(bill.dueDate)}
                        {overdue && ` (เกิน ${Math.abs(daysUntil(bill.dueDate))} วัน)`}
                      </span>
                      {bill.status === "paid" && bill.method && (
                        <span>ชำระโดย {pmMap[bill.method]}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 lg:justify-end">
                    <p className="tnum text-lg font-semibold text-ink">
                      {formatTHB(bill.total)}
                    </p>
                    {bill.status === "paid" ? (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
                        <CheckCircle2 className="size-4" aria-hidden />
                        ชำระแล้ว
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant={overdue ? "danger" : "primary"}
                        onClick={() => {
                          setPayBill(bill);
                          setMethod("transfer");
                        }}
                      >
                        บันทึกการชำระ
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Mark paid modal */}
      <Modal
        open={!!payBill}
        onClose={() => setPayBill(null)}
        title="บันทึกการชำระเงิน"
        description={
          payBill ? `เดือน${formatMonth(payBill.month)}` : ""
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setPayBill(null)}>
              ยกเลิก
            </Button>
            <Button onClick={doMarkPaid}>ยืนยันการชำระ</Button>
          </>
        }
      >
        {payBill && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <BillBreakdown bill={payBill} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-ink">ช่องทางที่ชำระ</p>
              <Segmented
                value={method}
                onChange={setMethod}
                options={[
                  { value: "transfer", label: "โอนธนาคาร" },
                  { value: "promptpay", label: "พร้อมเพย์" },
                  { value: "cash", label: "เงินสด" },
                ]}
                className="w-full"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
