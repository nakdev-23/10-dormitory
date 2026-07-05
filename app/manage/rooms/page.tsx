"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, DoorOpen, Search } from "lucide-react";
import { useDorm, type NewRoomInput } from "@/lib/store/useDorm";
import { useHydrated } from "@/lib/store/useHydrated";
import { useUI } from "@/lib/store/useUI";
import { roomStatus, roomTypeLabel } from "@/lib/labels";
import type { Room, RoomStatus, RoomType } from "@/lib/types";
import { formatTHB } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { RoomImage } from "@/components/RoomImage";

const empty: NewRoomInput = {
  number: "",
  floor: 1,
  type: "single",
  size: 24,
  rent: 4000,
  deposit: 8000,
  status: "vacant",
  amenities: ["แอร์", "เครื่องทำน้ำอุ่น", "Wi-Fi ไฟเบอร์"],
  description: "",
  furnished: true,
};

export default function ManageRoomsPage() {
  const hydrated = useHydrated();
  const rooms = useDorm((s) => s.rooms);
  const tenants = useDorm((s) => s.tenants);
  const addRoom = useDorm((s) => s.addRoom);
  const updateRoom = useDorm((s) => s.updateRoom);
  const deleteRoom = useDorm((s) => s.deleteRoom);
  const notify = useUI((s) => s.notify);

  const [statusFilter, setStatusFilter] = useState<RoomStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<RoomType | "all">("all");
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [toDelete, setToDelete] = useState<Room | null>(null);

  const filtered = useMemo(
    () =>
      rooms
        .filter((r) => statusFilter === "all" || r.status === statusFilter)
        .filter((r) => typeFilter === "all" || r.type === typeFilter)
        .filter((r) => !q || r.number.includes(q.trim()))
        .sort((a, b) => a.number.localeCompare(b.number)),
    [rooms, statusFilter, typeFilter, q],
  );

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (room: Room) => {
    setEditing(room);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteRoom(toDelete.id);
    notify("ลบห้องแล้ว", "info", `ห้อง ${toDelete.number} ถูกลบออกจากระบบ`);
    setToDelete(null);
  };

  const changeStatus = (room: Room, status: RoomStatus) => {
    updateRoom(room.id, { status });
    notify("อัปเดตสถานะห้องแล้ว", "success");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการห้องพัก"
        description={`ทั้งหมด ${rooms.length} ห้อง · ดูแลข้อมูล ราคา และสถานะการเข้าพัก`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="size-4" aria-hidden />
            เพิ่มห้องพัก
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Segmented
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "ทุกสถานะ" },
            { value: "occupied", label: "มีผู้เช่า" },
            { value: "vacant", label: "ว่าง" },
            { value: "reserved", label: "จอง" },
            { value: "maintenance", label: "ปรับปรุง" },
          ]}
        />
        <div className="flex flex-1 items-center gap-3">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as RoomType | "all")}
            className="h-10 max-w-40"
          >
            <option value="all">ทุกประเภท</option>
            <option value="single">{roomTypeLabel.single}</option>
            <option value="double">{roomTypeLabel.double}</option>
            <option value="studio">{roomTypeLabel.studio}</option>
          </Select>
          <div className="relative flex-1 sm:max-w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาเลขห้อง"
              inputMode="numeric"
              className="h-10 pl-9"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {!hydrated ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="ไม่พบห้องพัก"
          description="ลองปรับตัวกรอง หรือเพิ่มห้องพักใหม่เข้าสู่ระบบ"
          action={
            <Button variant="outline" onClick={openAdd}>
              เพิ่มห้องพัก
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((room) => {
            const st = roomStatus[room.status];
            const tenant = tenants.find((t) => t.id === room.tenantId);
            return (
              <Card key={room.id} className="flex flex-col overflow-hidden">
                <div className="relative">
                  <RoomImage
                    seed={room.photoSeed}
                    alt={`ห้อง ${room.number}`}
                    className="aspect-[16/9]"
                    sizes="(max-width: 640px) 100vw, 360px"
                  />
                  <span className="absolute left-3 top-3">
                    <Badge tone={st.tone} dot className="shadow-sm">
                      {st.label}
                    </Badge>
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-ink">ห้อง {room.number}</h3>
                      <p className="text-xs text-faint">
                        {roomTypeLabel[room.type]} · ชั้น {room.floor} · {room.size} ตร.ม.
                      </p>
                    </div>
                    <p className="tnum text-right font-semibold text-ink">
                      {formatTHB(room.rent)}
                      <span className="block text-xs font-normal text-faint">/เดือน</span>
                    </p>
                  </div>

                  {tenant ? (
                    <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-subtle">
                      ผู้เช่าปัจจุบัน:{" "}
                      <span className="font-medium text-ink">{tenant.name}</span>
                    </p>
                  ) : (
                    <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-faint">
                      ยังไม่มีผู้เช่า
                    </p>
                  )}

                  <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
                    <Select
                      aria-label={`เปลี่ยนสถานะห้อง ${room.number}`}
                      value={room.status}
                      onChange={(e) => changeStatus(room, e.target.value as RoomStatus)}
                      className="h-9 flex-1 text-sm"
                      disabled={room.status === "occupied"}
                    >
                      <option value="vacant">ว่าง</option>
                      <option value="reserved">จองแล้ว</option>
                      <option value="maintenance">ปิดปรับปรุง</option>
                      {room.status === "occupied" && (
                        <option value="occupied">มีผู้เช่า</option>
                      )}
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9"
                      aria-label={`แก้ไขห้อง ${room.number}`}
                      onClick={() => openEdit(room)}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 text-danger"
                      aria-label={`ลบห้อง ${room.number}`}
                      onClick={() => setToDelete(room)}
                      disabled={room.status === "occupied"}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <RoomFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
        onAdd={(input) => {
          addRoom(input);
          notify("เพิ่มห้องพักแล้ว", "success", `ห้อง ${input.number} ถูกเพิ่มเข้าระบบ`);
          setFormOpen(false);
        }}
        onUpdate={(id, patch) => {
          updateRoom(id, patch);
          notify("บันทึกการแก้ไขแล้ว", "success");
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="ยืนยันการลบห้องพัก"
        message={`ต้องการลบห้อง ${toDelete?.number ?? ""} ออกจากระบบใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ลบห้อง"
        destructive
      />
    </div>
  );
}

/* ------------------------------ Room form ------------------------------ */

function RoomFormModal({
  open,
  onClose,
  editing,
  onAdd,
  onUpdate,
}: {
  open: boolean;
  onClose: () => void;
  editing: Room | null;
  onAdd: (input: NewRoomInput) => void;
  onUpdate: (id: string, patch: Partial<Room>) => void;
}) {
  const rooms = useDorm((s) => s.rooms);
  const [form, setForm] = useState<NewRoomInput>(empty);
  const [amenityText, setAmenityText] = useState(empty.amenities.join(", "));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync when opening for edit / add
  const [lastId, setLastId] = useState<string | null>(null);
  const currentId = editing?.id ?? "new";
  if (open && lastId !== currentId) {
    setLastId(currentId);
    if (editing) {
      setForm({
        number: editing.number,
        floor: editing.floor,
        type: editing.type,
        size: editing.size,
        rent: editing.rent,
        deposit: editing.deposit,
        status: editing.status,
        amenities: editing.amenities,
        description: editing.description,
        furnished: editing.furnished,
      });
      setAmenityText(editing.amenities.join(", "));
    } else {
      setForm(empty);
      setAmenityText(empty.amenities.join(", "));
    }
    setErrors({});
  }

  const set = <K extends keyof NewRoomInput>(k: K, v: NewRoomInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.number.trim()) errs.number = "กรุณาระบุเลขห้อง";
    else if (
      rooms.some(
        (r) => r.number === form.number.trim() && r.id !== editing?.id,
      )
    )
      errs.number = "เลขห้องนี้มีอยู่แล้ว";
    if (form.rent <= 0) errs.rent = "ค่าเช่าต้องมากกว่า 0";
    if (form.size <= 0) errs.size = "ขนาดต้องมากกว่า 0";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const amenities = amenityText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = { ...form, number: form.number.trim(), amenities };

    if (editing) onUpdate(editing.id, payload);
    else onAdd(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `แก้ไขห้อง ${editing.number}` : "เพิ่มห้องพักใหม่"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit" form="room-form">
            {editing ? "บันทึกการแก้ไข" : "เพิ่มห้อง"}
          </Button>
        </>
      }
    >
      <form id="room-form" onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="เลขห้อง" htmlFor="rf-num" required error={errors.number}>
            <Input
              id="rf-num"
              value={form.number}
              onChange={(e) => set("number", e.target.value)}
              invalid={!!errors.number}
              placeholder="301"
            />
          </Field>
          <Field label="ชั้น" htmlFor="rf-floor">
            <Input
              id="rf-floor"
              type="number"
              min={1}
              value={form.floor}
              onChange={(e) => set("floor", Number(e.target.value))}
            />
          </Field>
          <Field label="ประเภท" htmlFor="rf-type">
            <Select
              id="rf-type"
              value={form.type}
              onChange={(e) => set("type", e.target.value as RoomType)}
            >
              <option value="single">{roomTypeLabel.single}</option>
              <option value="double">{roomTypeLabel.double}</option>
              <option value="studio">{roomTypeLabel.studio}</option>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="ขนาด (ตร.ม.)" htmlFor="rf-size" error={errors.size}>
            <Input
              id="rf-size"
              type="number"
              min={1}
              value={form.size}
              onChange={(e) => set("size", Number(e.target.value))}
              invalid={!!errors.size}
            />
          </Field>
          <Field label="ค่าเช่า/เดือน" htmlFor="rf-rent" error={errors.rent}>
            <Input
              id="rf-rent"
              type="number"
              min={0}
              value={form.rent}
              onChange={(e) => set("rent", Number(e.target.value))}
              invalid={!!errors.rent}
            />
          </Field>
          <Field label="เงินมัดจำ" htmlFor="rf-dep">
            <Input
              id="rf-dep"
              type="number"
              min={0}
              value={form.deposit}
              onChange={(e) => set("deposit", Number(e.target.value))}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="สถานะ" htmlFor="rf-status">
            <Select
              id="rf-status"
              value={form.status}
              onChange={(e) => set("status", e.target.value as RoomStatus)}
              disabled={editing?.status === "occupied"}
            >
              <option value="vacant">ว่าง</option>
              <option value="reserved">จองแล้ว</option>
              <option value="maintenance">ปิดปรับปรุง</option>
              {editing?.status === "occupied" && (
                <option value="occupied">มีผู้เช่า</option>
              )}
            </Select>
          </Field>
          <Field label="เฟอร์นิเจอร์" htmlFor="rf-furn">
            <Select
              id="rf-furn"
              value={form.furnished ? "yes" : "no"}
              onChange={(e) => set("furnished", e.target.value === "yes")}
            >
              <option value="yes">ครบพร้อมเข้าอยู่</option>
              <option value="no">บางส่วน</option>
            </Select>
          </Field>
        </div>

        <Field
          label="สิ่งอำนวยความสะดวก"
          htmlFor="rf-amen"
          hint="คั่นแต่ละรายการด้วยเครื่องหมายจุลภาค (,)"
        >
          <Input
            id="rf-amen"
            value={amenityText}
            onChange={(e) => setAmenityText(e.target.value)}
            placeholder="แอร์, ตู้เย็น, ระเบียง"
          />
        </Field>

        <Field label="รายละเอียดห้อง" htmlFor="rf-desc">
          <Input
            id="rf-desc"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="คำอธิบายสั้น ๆ เกี่ยวกับห้อง"
          />
        </Field>
      </form>
    </Modal>
  );
}
