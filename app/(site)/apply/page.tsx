"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Clock, FileCheck2, Headphones } from "lucide-react";
import { useHydrated } from "@/lib/store/useHydrated";
import { ApplyForm } from "@/components/ApplyForm";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

function ApplyInner() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const room = params.get("room") ?? undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
          สมัครเช่าห้องพัก
        </h1>
        <p className="mt-2 text-subtle">
          กรอกข้อมูลให้ครบถ้วนเพื่อยื่นใบสมัคร ทีมงานจะตรวจสอบและติดต่อกลับ
          เพื่อนัดหมายเข้าชมห้องและทำสัญญา
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5 sm:p-6">
          {!hydrated ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
              <Skeleton className="h-16" />
              <Skeleton className="h-11" />
            </div>
          ) : (
            <ApplyForm presetRoomId={room} />
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold text-ink">ทำไมต้องเลือกเรา</h2>
            <ul className="mt-4 space-y-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "ปลอดภัยตลอด 24 ชม.",
                  desc: "คีย์การ์ด กล้องวงจรปิด และเจ้าหน้าที่ดูแลตลอดเวลา",
                },
                {
                  icon: Clock,
                  title: "อนุมัติรวดเร็ว",
                  desc: "ตรวจสอบใบสมัครและตอบกลับภายใน 1–2 วันทำการ",
                },
                {
                  icon: FileCheck2,
                  title: "สัญญาโปร่งใส",
                  desc: "ไม่มีค่าใช้จ่ายแอบแฝง แจ้งราคาชัดเจนทุกรายการ",
                },
                {
                  icon: Headphones,
                  title: "ดูแลหลังเข้าอยู่",
                  desc: "แจ้งซ่อมและติดต่อผู้ดูแลได้ผ่านพอร์ทัลออนไลน์",
                },
              ].map((b) => (
                <li key={b.title} className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                    <b.icon className="size-[1.15rem]" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{b.title}</p>
                    <p className="text-xs text-subtle">{b.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-surface-2 p-5">
            <h2 className="text-sm font-semibold text-ink">เอกสารที่ต้องเตรียม</h2>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-subtle">
              <li>สำเนาบัตรประชาชน</li>
              <li>หลักฐานรายได้ / สลิปเงินเดือน</li>
              <li>หนังสือรับรองการทำงาน (ถ้ามี)</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">กำลังโหลด...</div>}
    >
      <ApplyInner />
    </Suspense>
  );
}
