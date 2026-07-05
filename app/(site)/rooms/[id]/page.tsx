"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Maximize2,
  Layers,
  BedDouble,
  Wallet,
  CheckCircle2,
  DoorClosed,
  CalendarClock,
} from "lucide-react";
import { useDorm } from "@/lib/store/useDorm";
import { useHydrated } from "@/lib/store/useHydrated";
import { roomStatus, roomTypeLabel } from "@/lib/labels";
import { formatTHB } from "@/lib/utils";
import { RoomImage } from "@/components/RoomImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApplyForm } from "@/components/ApplyForm";

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const room = useDorm((s) => s.rooms.find((r) => r.id === id));
  const [active, setActive] = useState(0);
  const [applyOpen, setApplyOpen] = useState(false);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Skeleton className="h-6 w-40" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Skeleton className="aspect-[16/10] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={DoorClosed}
          title="ไม่พบห้องพักนี้"
          description="ห้องที่คุณค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ"
          action={
            <Link href="/rooms">
              <Button variant="outline">กลับไปหน้าห้องพัก</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const st = roomStatus[room.status];
  const canApply = room.status === "vacant";
  const gallery = [room.photoSeed, `${room.photoSeed}b`, `${room.photoSeed}c`, `${room.photoSeed}d`];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/rooms"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-subtle transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        กลับไปหน้าห้องพัก
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Gallery */}
        <div>
          <RoomImage
            key={active}
            seed={gallery[active]}
            alt={`ห้อง ${room.number} มุมที่ ${active + 1}`}
            priority
            className="aspect-[16/10] rounded-2xl shadow-md"
            sizes="(max-width: 1024px) 100vw, 640px"
            width={1000}
            height={640}
          />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {gallery.map((seed, i) => (
              <button
                key={seed}
                onClick={() => setActive(i)}
                aria-label={`ดูรูปที่ ${i + 1}`}
                aria-pressed={active === i}
                className={`relative overflow-hidden rounded-lg ring-offset-2 ring-offset-bg transition-all ${
                  active === i ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                }`}
              >
                <RoomImage
                  seed={seed}
                  alt=""
                  className="aspect-[4/3]"
                  sizes="120px"
                  width={200}
                  height={150}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="primary">{roomTypeLabel[room.type]}</Badge>
            <Badge tone={st.tone} dot>
              {st.label}
            </Badge>
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-ink">ห้อง {room.number}</h1>
          <p className="mt-2 leading-relaxed text-subtle">{room.description}</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { icon: Layers, label: "ชั้น", value: `${room.floor}` },
              { icon: Maximize2, label: "ขนาด", value: `${room.size} ตร.ม.` },
              {
                icon: BedDouble,
                label: "เฟอร์นิเจอร์",
                value: room.furnished ? "ครบ" : "บางส่วน",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-surface p-3 text-center"
              >
                <s.icon className="mx-auto size-5 text-primary" aria-hidden />
                <p className="mt-1.5 text-xs text-faint">{s.label}</p>
                <p className="text-sm font-semibold text-ink">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-border bg-surface p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-faint">ค่าเช่ารายเดือน</p>
                <p className="tnum text-3xl font-semibold text-ink">
                  {formatTHB(room.rent)}
                </p>
              </div>
              <div className="text-right">
                <p className="inline-flex items-center gap-1 text-xs text-faint">
                  <Wallet className="size-3.5" aria-hidden /> เงินมัดจำ
                </p>
                <p className="tnum text-lg font-semibold text-ink">
                  {formatTHB(room.deposit)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                size="lg"
                disabled={!canApply}
                onClick={() => setApplyOpen(true)}
              >
                {canApply ? "สมัครเช่าห้องนี้" : "ห้องนี้ไม่ว่าง"}
              </Button>
              {!canApply && (
                <Link href="/rooms" className="text-center text-sm text-primary hover:underline">
                  ดูห้องว่างอื่น ๆ
                </Link>
              )}
              <p className="flex items-center justify-center gap-1.5 text-xs text-faint">
                <CalendarClock className="size-3.5" aria-hidden />
                ตอบกลับภายใน 1–2 วันทำการ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-ink">สิ่งอำนวยความสะดวกในห้อง</h2>
        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
          {room.amenities.map((a) => (
            <li key={a} className="flex items-center gap-2 text-sm text-ink">
              <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
              {a}
            </li>
          ))}
        </ul>
      </div>

      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title={`สมัครเช่าห้อง ${room.number}`}
        description="กรอกข้อมูลเพื่อยื่นใบสมัคร ทีมงานจะติดต่อกลับโดยเร็ว"
        size="lg"
      >
        <ApplyForm
          presetRoomId={room.id}
          compact
          onSuccess={() => setApplyOpen(false)}
        />
      </Modal>
    </div>
  );
}
