"use client";

import { useMemo, useRef, useState } from "react";
import { Paperclip, X, Upload } from "lucide-react";
import { useDorm } from "@/lib/store/useDorm";
import { useUI } from "@/lib/store/useUI";
import { roomTypeLabel } from "@/lib/labels";
import { formatTHB } from "@/lib/utils";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

interface Errors {
  [k: string]: string | undefined;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^0\d[\d-]{7,}$/;

export function ApplyForm({
  presetRoomId,
  onSuccess,
  compact,
}: {
  presetRoomId?: string;
  onSuccess?: () => void;
  compact?: boolean;
}) {
  const rooms = useDorm((s) => s.rooms);
  const addApplication = useDorm((s) => s.addApplication);
  const notify = useUI((s) => s.notify);

  const availableRooms = useMemo(
    () =>
      rooms
        .filter((r) => r.status === "vacant" || r.id === presetRoomId)
        .sort((a, b) => a.number.localeCompare(b.number)),
    [rooms, presetRoomId],
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState(presetRoomId ?? availableRooms[0]?.id ?? "");
  const [occupation, setOccupation] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [months, setMonths] = useState("12");
  const [docs, setDocs] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().slice(0, 10);
  const selectedRoom = rooms.find((r) => r.id === roomId);

  const validate = (): boolean => {
    const e: Errors = {};
    if (name.trim().length < 3) e.name = "กรุณากรอกชื่อ-นามสกุลให้ครบถ้วน";
    if (!phoneRe.test(phone.trim()))
      e.phone = "เบอร์โทรไม่ถูกต้อง (เช่น 081-234-5678)";
    if (!emailRe.test(email.trim())) e.email = "อีเมลไม่ถูกต้อง";
    if (!roomId) e.roomId = "กรุณาเลือกห้องที่ต้องการเช่า";
    if (!occupation.trim()) e.occupation = "กรุณาระบุอาชีพ";
    if (!moveInDate) e.moveInDate = "กรุณาเลือกวันที่ต้องการเข้าอยู่";
    else if (moveInDate < today) e.moveInDate = "วันเข้าอยู่ต้องไม่ก่อนวันนี้";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setDocs((prev) => [...new Set([...prev, ...names])]);
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // simulate a brief network round-trip
    setTimeout(() => {
      addApplication({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        roomId,
        occupation: occupation.trim(),
        moveInDate,
        months: Number(months),
        documents: docs,
        message: message.trim(),
      });
      setSubmitting(false);
      notify(
        "ส่งใบสมัครเรียบร้อย",
        "success",
        "ทีมงานจะตรวจสอบและติดต่อกลับภายใน 1–2 วันทำการ",
      );
      onSuccess?.();
      // reset
      setName("");
      setPhone("");
      setEmail("");
      setOccupation("");
      setMoveInDate("");
      setDocs([]);
      setMessage("");
    }, 650);
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <Field label="ชื่อ-นามสกุล" htmlFor="ap-name" required error={errors.name}>
          <Input
            id="ap-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            invalid={!!errors.name}
            placeholder="เช่น สมชาย ใจดี"
            autoComplete="name"
          />
        </Field>
        <Field label="อาชีพ" htmlFor="ap-occ" required error={errors.occupation}>
          <Input
            id="ap-occ"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            invalid={!!errors.occupation}
            placeholder="เช่น พนักงานบริษัท"
          />
        </Field>
        <Field label="เบอร์โทรศัพท์" htmlFor="ap-phone" required error={errors.phone}>
          <Input
            id="ap-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            invalid={!!errors.phone}
            placeholder="081-234-5678"
            inputMode="tel"
            autoComplete="tel"
          />
        </Field>
        <Field label="อีเมล" htmlFor="ap-email" required error={errors.email}>
          <Input
            id="ap-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={!!errors.email}
            placeholder="you@email.com"
            autoComplete="email"
          />
        </Field>
      </div>

      <Field label="ห้องที่ต้องการเช่า" htmlFor="ap-room" required error={errors.roomId}>
        <Select
          id="ap-room"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          invalid={!!errors.roomId}
        >
          {availableRooms.length === 0 && <option value="">ไม่มีห้องว่าง</option>}
          {availableRooms.map((r) => (
            <option key={r.id} value={r.id}>
              ห้อง {r.number} · {roomTypeLabel[r.type]} · {formatTHB(r.rent)}/เดือน
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="วันที่ต้องการเข้าอยู่"
          htmlFor="ap-date"
          required
          error={errors.moveInDate}
        >
          <Input
            id="ap-date"
            type="date"
            min={today}
            value={moveInDate}
            onChange={(e) => setMoveInDate(e.target.value)}
            invalid={!!errors.moveInDate}
          />
        </Field>
        <Field label="ระยะเวลาสัญญา" htmlFor="ap-months">
          <Select
            id="ap-months"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
          >
            <option value="6">6 เดือน</option>
            <option value="12">12 เดือน</option>
            <option value="24">24 เดือน</option>
          </Select>
        </Field>
      </div>

      {selectedRoom && (
        <div className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3 text-sm">
          <span className="text-subtle">เงินมัดจำโดยประมาณ (2 เดือน)</span>
          <span className="tnum font-semibold text-ink">
            {formatTHB(selectedRoom.deposit)}
          </span>
        </div>
      )}

      <Field label="เอกสารประกอบ (แนบชื่อไฟล์)" htmlFor="ap-docs" hint="เช่น สำเนาบัตรประชาชน, สลิปเงินเดือน">
        <div>
          <input
            ref={fileRef}
            id="ap-docs"
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => onFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-4" aria-hidden />
            เลือกไฟล์
          </Button>
          {docs.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {docs.map((d) => (
                <li
                  key={d}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-ink"
                >
                  <Paperclip className="size-3" aria-hidden />
                  {d}
                  <button
                    type="button"
                    onClick={() => setDocs(docs.filter((x) => x !== d))}
                    aria-label={`ลบ ${d}`}
                    className="cursor-pointer text-faint hover:text-danger"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Field>

      <Field label="ข้อความถึงผู้ดูแล" htmlFor="ap-msg">
        <Textarea
          id="ap-msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="ระบุความต้องการเพิ่มเติม เช่น มีสัตว์เลี้ยง หรือต้องการห้องเงียบ"
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        loading={submitting}
        className="w-full"
        disabled={availableRooms.length === 0}
      >
        {submitting ? "กำลังส่งใบสมัคร..." : "ส่งใบสมัครเช่า"}
      </Button>
    </form>
  );
}
