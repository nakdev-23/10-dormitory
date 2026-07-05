"use client";

import { useMemo, useState } from "react";
import {
  Wrench,
  UserCog,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";
import { useDorm } from "@/lib/store/useDorm";
import { useHydrated } from "@/lib/store/useHydrated";
import { useUI } from "@/lib/store/useUI";
import {
  ticketStatus as ticketStatusMap,
  ticketPriority as ticketPriorityMap,
  ticketCategory,
} from "@/lib/labels";
import { relativeThai } from "@/lib/utils";
import type { MaintenanceTicket, TicketStatus } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

const TECHNICIANS = ["ช่างสมชาย", "ช่างวิรัตน์", "ช่างประเสริฐ", "ทีมแม่บ้าน"];

export default function ManageMaintenancePage() {
  const hydrated = useHydrated();
  const maintenance = useDorm((s) => s.maintenance);
  const rooms = useDorm((s) => s.rooms);
  const tenants = useDorm((s) => s.tenants);
  const assignTicket = useDorm((s) => s.assignTicket);
  const resolveTicket = useDorm((s) => s.resolveTicket);
  const setTicketStatus = useDorm((s) => s.setTicketStatus);
  const notify = useUI((s) => s.notify);

  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  const [assignFor, setAssignFor] = useState<MaintenanceTicket | null>(null);
  const [assignee, setAssignee] = useState(TECHNICIANS[0]);
  const [resolveForTicket, setResolveForTicket] = useState<MaintenanceTicket | null>(null);
  const [note, setNote] = useState("");

  const counts = useMemo(
    () => ({
      all: maintenance.length,
      open: maintenance.filter((t) => t.status === "open").length,
      in_progress: maintenance.filter((t) => t.status === "in_progress").length,
      resolved: maintenance.filter((t) => t.status === "resolved").length,
    }),
    [maintenance],
  );

  const list = useMemo(
    () =>
      maintenance
        .filter((t) => filter === "all" || t.status === filter)
        .sort((a, b) => {
          const rank = { open: 0, in_progress: 1, resolved: 2 };
          const pr = { high: 0, normal: 1, low: 2 };
          return (
            rank[a.status] - rank[b.status] ||
            pr[a.priority] - pr[b.priority] ||
            b.createdAt.localeCompare(a.createdAt)
          );
        }),
    [maintenance, filter],
  );

  const submitAssign = () => {
    if (!assignFor) return;
    assignTicket(assignFor.id, assignee);
    notify("มอบหมายงานแล้ว", "success", `${assignee} รับผิดชอบงานนี้`);
    setAssignFor(null);
  };

  const submitResolve = () => {
    if (!resolveForTicket) return;
    resolveTicket(resolveForTicket.id, note.trim() || "ดำเนินการแก้ไขเรียบร้อย");
    notify("ปิดงานซ่อมแล้ว", "success");
    setResolveForTicket(null);
    setNote("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="งานซ่อมบำรุง"
        description={`คิวงานทั้งหมด ${counts.all} รายการ · รอรับเรื่อง ${counts.open} รายการ`}
      />

      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: `ทั้งหมด (${counts.all})` },
          { value: "open", label: `รอรับเรื่อง (${counts.open})` },
          { value: "in_progress", label: `กำลังทำ (${counts.in_progress})` },
          { value: "resolved", label: `เสร็จแล้ว (${counts.resolved})` },
        ]}
      />

      {!hydrated ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="ไม่มีงานซ่อมในหมวดนี้"
          description="เมื่อผู้เช่าแจ้งซ่อม รายการจะเข้าคิวที่นี่"
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {list.map((t) => {
            const st = ticketStatusMap[t.status];
            const pr = ticketPriorityMap[t.priority];
            const room = rooms.find((r) => r.id === t.roomId);
            const tenant = tenants.find((x) => x.id === t.tenantId);
            return (
              <Card key={t.id} className="flex flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink">{t.title}</h3>
                      <Badge tone={pr.tone}>{pr.label}</Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-faint">
                      <MapPin className="size-3.5" aria-hidden />
                      ห้อง {room?.number} · {tenant?.name ?? "ผู้ดูแลบันทึก"} ·{" "}
                      {ticketCategory[t.category]}
                    </p>
                  </div>
                  <Badge tone={st.tone} dot>
                    {st.label}
                  </Badge>
                </div>

                <p className="mt-3 text-sm text-subtle">{t.description}</p>

                <div className="mt-3 flex items-center gap-2 text-xs text-faint">
                  <Clock className="size-3.5" aria-hidden />
                  แจ้งเมื่อ {relativeThai(t.createdAt)}
                  {t.assignee && (
                    <span className="inline-flex items-center gap-1 text-primary">
                      · <UserCog className="size-3.5" aria-hidden /> {t.assignee}
                    </span>
                  )}
                </div>

                {t.status === "resolved" && t.resolutionNote && (
                  <p className="mt-2 rounded-lg bg-success-soft px-3 py-2 text-xs text-success">
                    {t.resolutionNote}
                  </p>
                )}

                {t.status !== "resolved" && (
                  <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAssignFor(t);
                        setAssignee(t.assignee ?? TECHNICIANS[0]);
                      }}
                    >
                      <UserCog className="size-4" aria-hidden />
                      {t.assignee ? "เปลี่ยนช่าง" : "มอบหมาย"}
                    </Button>
                    {t.status === "open" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setTicketStatus(t.id, "in_progress")}
                      >
                        เริ่มงาน
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="ml-auto"
                      onClick={() => {
                        setResolveForTicket(t);
                        setNote("");
                      }}
                    >
                      <CheckCircle2 className="size-4" aria-hidden />
                      ปิดงาน
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Assign modal */}
      <Modal
        open={!!assignFor}
        onClose={() => setAssignFor(null)}
        title="มอบหมายงานซ่อม"
        description={assignFor?.title}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setAssignFor(null)}>
              ยกเลิก
            </Button>
            <Button onClick={submitAssign}>มอบหมาย</Button>
          </>
        }
      >
        <Field label="เลือกช่างผู้รับผิดชอบ" htmlFor="assignee">
          <Select
            id="assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            {TECHNICIANS.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </Select>
        </Field>
      </Modal>

      {/* Resolve modal */}
      <Modal
        open={!!resolveForTicket}
        onClose={() => setResolveForTicket(null)}
        title="ปิดงานซ่อม"
        description={resolveForTicket?.title}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setResolveForTicket(null)}>
              ยกเลิก
            </Button>
            <Button onClick={submitResolve}>ยืนยันปิดงาน</Button>
          </>
        }
      >
        <Field label="บันทึกการแก้ไข" htmlFor="resolve-note" hint="อธิบายสิ่งที่ดำเนินการ (ไม่บังคับ)">
          <Textarea
            id="resolve-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="เช่น เปลี่ยนคอมเพรสเซอร์แอร์และล้างทำความสะอาดเรียบร้อย"
          />
        </Field>
      </Modal>
    </div>
  );
}
