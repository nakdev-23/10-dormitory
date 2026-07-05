"use client";

import { useState } from "react";
import { useDorm } from "@/lib/store/useDorm";
import { useUI } from "@/lib/store/useUI";
import { ticketCategory, ticketPriority } from "@/lib/labels";
import type { TicketCategory, TicketPriority } from "@/lib/types";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function TicketForm({
  roomId,
  tenantId,
  onSuccess,
}: {
  roomId: string;
  tenantId?: string;
  onSuccess?: () => void;
}) {
  const addTicket = useDorm((s) => s.addTicket);
  const notify = useUI((s) => s.notify);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TicketCategory>("aircon");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (title.trim().length < 4) errs.title = "กรุณาระบุหัวข้อให้ชัดเจน";
    if (description.trim().length < 8) errs.description = "อธิบายปัญหาอย่างน้อย 8 ตัวอักษร";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setTimeout(() => {
      addTicket({
        roomId,
        tenantId,
        title: title.trim(),
        category,
        priority,
        description: description.trim(),
      });
      setSubmitting(false);
      notify("ส่งเรื่องแจ้งซ่อมแล้ว", "success", "ทีมช่างจะเข้าดำเนินการโดยเร็ว");
      onSuccess?.();
    }, 500);
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="หัวข้อปัญหา" htmlFor="tk-title" required error={errors.title}>
        <Input
          id="tk-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          invalid={!!errors.title}
          placeholder="เช่น แอร์ไม่เย็น มีน้ำหยด"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ประเภทงาน" htmlFor="tk-cat">
          <Select
            id="tk-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
          >
            {Object.entries(ticketCategory).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="ความเร่งด่วน" htmlFor="tk-pri">
          <Select
            id="tk-pri"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
          >
            {Object.entries(ticketPriority).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field
        label="รายละเอียด"
        htmlFor="tk-desc"
        required
        error={errors.description}
      >
        <Textarea
          id="tk-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          invalid={!!errors.description}
          placeholder="อธิบายอาการหรือปัญหาที่พบ พร้อมตำแหน่งในห้อง"
        />
      </Field>
      <Button type="submit" loading={submitting} className="w-full">
        {submitting ? "กำลังส่ง..." : "ส่งเรื่องแจ้งซ่อม"}
      </Button>
    </form>
  );
}
