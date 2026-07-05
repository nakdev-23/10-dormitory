"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Wifi,
  Wind,
  Car,
  Dumbbell,
  Sparkles,
  Train,
  MapPin,
  Clock,
  CreditCard,
  Wrench,
  KeyRound,
  FileCheck2,
  DoorOpen,
} from "lucide-react";
import { useDorm } from "@/lib/store/useDorm";
import { useHydrated } from "@/lib/store/useHydrated";
import { roomTypeLabel } from "@/lib/labels";
import { formatTHB } from "@/lib/utils";
import type { RoomType } from "@/lib/types";
import { RoomImage } from "@/components/RoomImage";
import { RoomCard } from "@/components/RoomCard";
import { Skeleton } from "@/components/ui/Skeleton";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const hydrated = useHydrated();
  const rooms = useDorm((s) => s.rooms);

  const vacant = rooms.filter((r) => r.status === "vacant");
  const totalRooms = rooms.length;
  const startingPrice = rooms.length
    ? Math.min(...rooms.map((r) => r.rent))
    : 0;

  const typeStats = (["single", "double", "studio"] as RoomType[]).map((type) => {
    const list = rooms.filter((r) => r.type === type);
    const from = list.length ? Math.min(...list.map((r) => r.rent)) : 0;
    const size = list.length
      ? Math.round(list.reduce((a, r) => a + r.size, 0) / list.length)
      : 0;
    const available = list.filter((r) => r.status === "vacant").length;
    const seed = list[0]?.photoSeed ?? type;
    return { type, from, size, available, seed, count: list.length };
  });

  return (
    <>
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 top-0 size-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-16 top-40 size-80 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-primary"
            >
              <ShieldCheck className="size-3.5" aria-hidden />
              หอพักปลอดภัย ดูแล 24 ชั่วโมง
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="mt-4 text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl"
            >
              บ้านหลังใหม่ใจกลางเมือง
              <br />
              ที่พร้อมให้คุณ<span className="text-primary">พักผ่อนอย่างสบายใจ</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-md text-base leading-relaxed text-subtle"
            >
              ห้องพักครบเฟอร์นิเจอร์ เดินทางสะดวกใกล้รถไฟฟ้า พร้อมระบบจ่ายค่าเช่า
              แจ้งซ่อม และดูแลผู้เช่าออนไลน์ในที่เดียว
            </motion.p>
            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/rooms"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-7 text-base font-medium text-primary-fg shadow-sm shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                ดูห้องว่าง
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/apply"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-border-strong px-7 text-base font-medium text-ink transition-colors hover:bg-surface-2"
              >
                สมัครเช่า
              </Link>
            </motion.div>

            <motion.dl
              variants={fadeUp}
              className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6"
            >
              <div>
                <dt className="text-xs text-faint">เริ่มต้นเพียง</dt>
                <dd className="tnum mt-1 text-xl font-semibold text-ink">
                  {hydrated ? formatTHB(startingPrice) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-faint">ห้องทั้งหมด</dt>
                <dd className="tnum mt-1 text-xl font-semibold text-ink">
                  {hydrated ? totalRooms : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-faint">ห้องว่างตอนนี้</dt>
                <dd className="tnum mt-1 text-xl font-semibold text-primary">
                  {hydrated ? vacant.length : "—"}
                </dd>
              </div>
            </motion.dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-3">
              <RoomImage
                seed={typeStats[2].seed}
                alt="ตัวอย่างห้องสตูดิโอ"
                priority
                className="col-span-2 aspect-[16/10] rounded-2xl shadow-lg"
                sizes="(max-width: 768px) 100vw, 480px"
              />
              <RoomImage
                seed={typeStats[0].seed}
                alt="ตัวอย่างห้องเดี่ยว"
                className="aspect-square rounded-2xl shadow-md"
                sizes="(max-width: 768px) 50vw, 240px"
              />
              <RoomImage
                seed={typeStats[1].seed}
                alt="ตัวอย่างห้องคู่"
                className="aspect-square rounded-2xl shadow-md"
                sizes="(max-width: 768px) 50vw, 240px"
              />
            </div>
            <div className="absolute -bottom-4 left-4 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg">
              <span className="grid size-10 place-items-center rounded-lg bg-success-soft text-success">
                <Train className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">ใกล้ BTS 350 ม.</p>
                <p className="text-xs text-faint">เดินถึงใน 5 นาที</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --------------------------- ROOM TYPES --------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
            เลือกห้องที่ใช่สำหรับไลฟ์สไตล์คุณ
          </h2>
          <p className="mt-2 text-subtle">
            สามแบบห้องให้เลือก ตั้งแต่ห้องเดี่ยวกะทัดรัดไปจนถึงสตูดิโอกว้างขวาง
            ทุกห้องพร้อมเฟอร์นิเจอร์และสิ่งอำนวยความสะดวกครบครัน
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {typeStats.map((t, i) => (
            <Link
              key={t.type}
              href={`/rooms?type=${t.type}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xs transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <RoomImage
                seed={t.seed}
                alt={roomTypeLabel[t.type]}
                className="aspect-[5/3]"
                sizes="(max-width: 768px) 100vw, 360px"
                priority={i === 0}
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold text-ink">
                    {roomTypeLabel[t.type]}
                  </h3>
                  <span className="text-xs text-faint">~{t.size} ตร.ม.</span>
                </div>
                <p className="mt-2 text-sm text-subtle">
                  {t.type === "single"
                    ? "เหมาะสำหรับคนโสดหรือนักศึกษา จัดวางลงตัวในราคาคุ้มค่า"
                    : t.type === "double"
                      ? "พื้นที่กว้างขึ้น แยกโซนนอนและนั่งเล่นชัดเจน"
                      : "ห้องใหญ่พร้อมครัวในตัว เหมาะกับ Work from Home"}
                </p>
                <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-xs text-faint">เริ่มต้น</p>
                    <p className="tnum text-lg font-semibold text-ink">
                      {hydrated ? formatTHB(t.from) : "—"}
                      <span className="text-xs font-normal text-faint">/เดือน</span>
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {hydrated ? `ว่าง ${t.available} ห้อง` : "—"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --------------------------- AMENITIES --------------------------- */}
      <section className="border-y border-border bg-surface-2/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
              สิ่งอำนวยความสะดวกครบ พร้อมเข้าอยู่
            </h2>
            <p className="mt-3 text-subtle">
              เราออกแบบทุกพื้นที่ให้ตอบโจทย์การใช้ชีวิตประจำวัน
              ตั้งแต่ความปลอดภัยไปจนถึงความสะดวกสบายในทุกวัน
            </p>
            <Link
              href="/rooms"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2"
            >
              ดูรายละเอียดห้องพัก
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {[
              { icon: Wifi, label: "Wi-Fi ไฟเบอร์ 1 Gbps" },
              { icon: Wind, label: "เครื่องปรับอากาศทุกห้อง" },
              { icon: ShieldCheck, label: "คีย์การ์ด + CCTV 24 ชม." },
              { icon: Car, label: "ที่จอดรถส่วนตัว" },
              { icon: Dumbbell, label: "ฟิตเนสและพื้นที่ส่วนกลาง" },
              { icon: Sparkles, label: "แม่บ้านทำความสะอาด" },
            ].map((a) => (
              <li key={a.label} className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-primary shadow-xs">
                  <a.icon className="size-[1.15rem]" aria-hidden />
                </span>
                <span className="pt-1.5 text-sm text-ink">{a.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --------------------------- AVAILABILITY --------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
              ห้องว่างพร้อมเข้าอยู่
            </h2>
            <p className="mt-2 text-subtle">
              จองห้องที่ถูกใจได้ทันที ก่อนจะเต็ม
            </p>
          </div>
          <Link
            href="/rooms"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2"
          >
            ดูทั้งหมด
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {!hydrated
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-border">
                  <Skeleton className="aspect-[4/3] rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
              ))
            : vacant
                .slice(0, 4)
                .map((room, i) => (
                  <RoomCard key={room.id} room={room} priority={i < 2} />
                ))}
        </div>
      </section>

      {/* --------------------------- HOW IT WORKS --------------------------- */}
      <section className="border-y border-border bg-surface-2/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
            เข้าอยู่ง่ายใน 3 ขั้นตอน
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: DoorOpen,
                title: "เลือกห้องที่ใช่",
                desc: "เรียกดูห้องว่าง พร้อมรายละเอียดขนาด ราคา และสิ่งอำนวยความสะดวก",
              },
              {
                icon: FileCheck2,
                title: "ยื่นใบสมัคร",
                desc: "กรอกข้อมูลและแนบเอกสารออนไลน์ ทีมงานตรวจสอบและติดต่อกลับอย่างรวดเร็ว",
              },
              {
                icon: KeyRound,
                title: "รับกุญแจเข้าอยู่",
                desc: "เซ็นสัญญา ชำระเงินมัดจำ และเข้าอยู่ได้ตามวันที่คุณสะดวก",
              },
            ].map((step, i) => (
              <li key={step.title} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-fg shadow-sm">
                    <step.icon className="size-5" aria-hidden />
                  </span>
                  {i < 2 && (
                    <span className="mt-2 hidden h-full w-px bg-border md:block" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-xs font-semibold text-primary">
                    ขั้นที่ {i + 1}
                  </p>
                  <h3 className="mt-0.5 font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm text-subtle">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --------------------------- LOCATION --------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
              ทำเลใจกลางเมือง เดินทางสะดวก
            </h2>
            <p className="mt-3 text-subtle">
              ตั้งอยู่บนถนนสุขุมวิท ใกล้รถไฟฟ้า ห้างสรรพสินค้า โรงพยาบาล และร้านอาหาร
              ครบครันทุกความต้องการในชีวิตประจำวัน
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                { icon: Train, label: "BTS อโศก", meta: "350 ม. · เดิน 5 นาที" },
                { icon: MapPin, label: "ห้างเทอร์มินอล 21", meta: "600 ม. · เดิน 8 นาที" },
                { icon: Clock, label: "ทางด่วนพระราม 9", meta: "1.2 กม. · ขับ 4 นาที" },
              ].map((p) => (
                <li key={p.label} className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-muted text-primary">
                    <p.icon className="size-[1.15rem]" aria-hidden />
                  </span>
                  <span className="flex-1 font-medium text-ink">{p.label}</span>
                  <span className="text-xs text-faint">{p.meta}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-2">
            {/* Stylised map panel (no external map dependency) */}
            <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_30%_30%,var(--color-primary)_0,transparent_40%),radial-gradient(circle_at_70%_60%,var(--color-accent)_0,transparent_35%)]" />
            <svg className="absolute inset-0 size-full text-border" aria-hidden>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-fg shadow-lg">
                <MapPin className="size-6" aria-hidden />
              </span>
              <span className="mt-2 rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink shadow-sm">
                บ้านร่มเย็น เรสซิเดนซ์
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- CTA --------------------------- */}
      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="overflow-hidden rounded-2xl bg-primary px-6 py-12 text-center text-primary-fg sm:px-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            พร้อมย้ายเข้าบ้านหลังใหม่แล้วหรือยัง?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-fg/85">
            เริ่มต้นด้วยการเลือกห้องที่ถูกใจ หรือทดลองใช้พอร์ทัลผู้เช่าและระบบผู้ดูแลได้ทันที
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/rooms"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-7 font-medium text-primary shadow-sm transition-transform hover:scale-[1.02]"
            >
              เลือกห้องพัก
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/portal"
              className="inline-flex h-12 items-center rounded-lg border border-white/40 px-7 font-medium text-primary-fg transition-colors hover:bg-white/10"
            >
              เข้าสู่พอร์ทัลผู้เช่า
            </Link>
          </div>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-primary-fg/80">
            <span className="inline-flex items-center gap-1.5">
              <CreditCard className="size-4" aria-hidden /> จ่ายค่าเช่าออนไลน์
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Wrench className="size-4" aria-hidden /> แจ้งซ่อมได้ทุกเวลา
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
