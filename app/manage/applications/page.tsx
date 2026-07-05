"use client";

import { useMemo, useState } from "react";
import {
  ClipboardList,
  Phone,
  Mail,
  Briefcase,
  CalendarDays,
  Paperclip,
  DoorOpen,
  Check,
  X,
  CircleAlert,
} from "lucide-react";
import { useDorm } from "@/lib/store/useDorm";
import { useHydrated } from "@/lib/store/useHydrated";
import { useUI } from "@/lib/store/useUI";
import { applicationStatus as appStatusMap, roomTypeLabel } from "@/lib/labels";
import { formatTHB, formatDate, relativeThai } from "@/lib/utils";
import type { Application } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Textarea } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ManageApplicationsPage() {
  const hydrated = useHydrated();
  const applications = useDorm((s) => s.applications);
  const rooms = useDorm((s) => s.rooms);
  const approveApplication = useDorm((s) => s.approveApplication);
  const rejectApplication = useDorm((s) => s.rejectApplication);
  const notify = useUI((s) => s.notify);

  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [approveFor, setApproveFor] = useState<Application | null>(null);
  const [rejectFor, setRejectFor] = useState<Application | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const counts = useMemo(
    () => ({
      pending: applications.filter((a) => a.status === "pending").length,
      approved: applications.filter((a) => a.status === "approved").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
    }),
    [applications],
  );

  const list = useMemo(
    () =>
      applications
        .filter((a) => filter === "all" || a.status === filter)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [applications, filter],
  );

  const confirmApprove = () => {
    if (!approveFor) return;
    const tenant = approveApplication(approveFor.id);
    if (tenant)
      notify(
        "อนุมัติใบสมัครแล้ว",
        "success",
        `${tenant.name} เข้าเป็นผู้เช่าและจัดห้องเรียบร้อย`,
      );
    else notify("ไม่สามารถอนุมัติได้", "error", "ห้องที่เลือกอาจไม่ว่างแล้ว");
    setApproveFor(null);
  };

  const confirmReject = () => {
    if (!rejectFor) return;
    rejectApplication(rejectFor.id, rejectNote.trim() || "ไม่ผ่านการพิจารณา");
    notify("บันทึกการปฏิเสธแล้ว", "info");
    setRejectFor(null);
    setRejectNote("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ใบสมัครเช่า"
        description={`รอพิจารณา ${counts.pending} ใบ · อนุมัติแล้วจะสร้างผู้เช่าและจองห้องอัตโนมัติ`}
      />

      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: "pending", label: `รอพิจารณา (${counts.pending})` },
          { value: "approved", label: `อนุมัติ (${counts.approved})` },
          { value: "rejected", label: `ไม่อนุมัติ (${counts.rejected})` },
          { value: "all", label: "ทั้งหมด" },
        ]}
      />

      {!hydrated ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="ไม่มีใบสมัครในหมวดนี้"
          description="ใบสมัครใหม่จากหน้าเว็บจะปรากฏที่นี่โดยอัตโนมัติ"
        />
      ) : (
        <div className="grid gap-4">
          {list.map((app) => {
            const room = rooms.find((r) => r.id === app.roomId);
            const st = appStatusMap[app.status];
            const roomAvailable = room?.status === "vacant";
            return (
              <Card key={app.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <Avatar name={app.name} size="lg" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-ink">{app.name}</h3>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </div>
                      <p className="text-xs text-faint">
                        ยื่นเมื่อ {relativeThai(app.createdAt)}
                      </p>
                      <div className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                        <Info icon={Phone} text={app.phone} />
                        <Info icon={Mail} text={app.email} />
                        <Info icon={Briefcase} text={app.occupation} />
                        <Info
                          icon={CalendarDays}
                          text={`เข้าอยู่ ${formatDate(app.moveInDate)} · ${app.months} เดือน`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Requested room */}
                  <div className="shrink-0 rounded-xl border border-border bg-surface-2 p-4 lg:w-56">
                    <p className="flex items-center gap-1.5 text-xs text-faint">
                      <DoorOpen className="size-3.5" aria-hidden /> ห้องที่ต้องการ
                    </p>
                    {room ? (
                      <>
                        <p className="mt-1 font-semibold text-ink">
                          ห้อง {room.number}
                        </p>
                        <p className="text-xs text-subtle">
                          {roomTypeLabel[room.type]} · {formatTHB(room.rent)}/เดือน
                        </p>
                        <p className="mt-2">
                          {roomAvailable ? (
                            <Badge tone="success" dot>ห้องว่าง</Badge>
                          ) : (
                            <Badge tone="danger" dot>ห้องไม่ว่างแล้ว</Badge>
                          )}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-danger">ไม่พบห้อง</p>
                    )}
                  </div>
                </div>

                {app.message && (
                  <p className="mt-4 rounded-lg bg-surface-2 px-3 py-2 text-sm text-subtle">
                    “{app.message}”
                  </p>
                )}

                {app.documents.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {app.documents.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-ink"
                      >
                        <Paperclip className="size-3" aria-hidden />
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {app.status === "pending" ? (
                  <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                    {!roomAvailable && (
                      <p className="mr-auto flex items-center gap-1.5 text-xs text-danger">
                        <CircleAlert className="size-4" aria-hidden />
                        ห้องนี้ถูกจองแล้ว ไม่สามารถอนุมัติได้
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className={roomAvailable ? "ml-auto text-danger" : "text-danger"}
                      onClick={() => setRejectFor(app)}
                    >
                      <X className="size-4" aria-hidden />
                      ปฏิเสธ
                    </Button>
                    <Button
                      size="sm"
                      disabled={!roomAvailable}
                      onClick={() => setApproveFor(app)}
                    >
                      <Check className="size-4" aria-hidden />
                      อนุมัติ
                    </Button>
                  </div>
                ) : (
                  app.reviewNote && (
                    <p className="mt-3 border-t border-border pt-3 text-xs text-faint">
                      หมายเหตุ: {app.reviewNote}
                    </p>
                  )
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!approveFor}
        onClose={() => setApproveFor(null)}
        onConfirm={confirmApprove}
        title="ยืนยันการอนุมัติ"
        message={`อนุมัติใบสมัครของ ${approveFor?.name ?? ""}? ระบบจะสร้างบัญชีผู้เช่าและเปลี่ยนสถานะห้องเป็น “มีผู้เช่า” โดยอัตโนมัติ`}
        confirmLabel="อนุมัติและจัดห้อง"
      />

      <Modal
        open={!!rejectFor}
        onClose={() => setRejectFor(null)}
        title="ปฏิเสธใบสมัคร"
        description={rejectFor?.name}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectFor(null)}>
              ยกเลิก
            </Button>
            <Button variant="danger" onClick={confirmReject}>
              ยืนยันการปฏิเสธ
            </Button>
          </>
        }
      >
        <Field label="เหตุผล (ไม่บังคับ)" htmlFor="reject-note">
          <Textarea
            id="reject-note"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="เช่น เอกสารไม่ครบถ้วน หรือห้องถูกจองแล้ว"
          />
        </Field>
      </Modal>
    </div>
  );
}

function Info({ icon: Icon, text }: { icon: typeof Phone; text: string }) {
  return (
    <span className="flex items-center gap-2 text-subtle">
      <Icon className="size-4 shrink-0 text-faint" aria-hidden />
      <span className="truncate text-ink">{text}</span>
    </span>
  );
}
