"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, DoorClosed } from "lucide-react";
import { useDorm } from "@/lib/store/useDorm";
import { useHydrated } from "@/lib/store/useHydrated";
import { roomTypeLabel } from "@/lib/labels";
import type { RoomStatus, RoomType } from "@/lib/types";
import { RoomCard } from "@/components/RoomCard";
import { Field, Input, Select } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

type SortKey = "price-asc" | "price-desc" | "floor";

function RoomsInner() {
  const hydrated = useHydrated();
  const rooms = useDorm((s) => s.rooms);
  const params = useSearchParams();

  const [type, setType] = useState<RoomType | "all">(
    (params.get("type") as RoomType) || "all",
  );
  const [floor, setFloor] = useState<string>("all");
  const [status, setStatus] = useState<RoomStatus | "all">("all");
  const [maxPrice, setMaxPrice] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("price-asc");

  const floors = useMemo(
    () => [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b),
    [rooms],
  );

  const filtered = useMemo(() => {
    let list = rooms.filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      if (floor !== "all" && r.floor !== Number(floor)) return false;
      if (status !== "all" && r.status !== status) return false;
      if (maxPrice !== "all" && r.rent > Number(maxPrice)) return false;
      if (query && !r.number.includes(query.trim())) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.rent - b.rent;
      if (sort === "price-desc") return b.rent - a.rent;
      return a.floor - b.floor || a.number.localeCompare(b.number);
    });
    return list;
  }, [rooms, type, floor, status, maxPrice, query, sort]);

  const reset = () => {
    setType("all");
    setFloor("all");
    setStatus("all");
    setMaxPrice("all");
    setQuery("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">ห้องพักทั้งหมด</h1>
        <p className="mt-2 text-subtle">
          เลือกดูห้องพักตามประเภท ชั้น และงบประมาณที่ต้องการ
          ทุกห้องพร้อมเฟอร์นิเจอร์และสิ่งอำนวยความสะดวกครบครัน
        </p>
      </div>

      {/* Type quick filter */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Segmented
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: "ทั้งหมด" },
            { value: "single", label: roomTypeLabel.single },
            { value: "double", label: roomTypeLabel.double },
            { value: "studio", label: roomTypeLabel.studio },
          ]}
        />
      </div>

      {/* Filter bar */}
      <div className="mt-4 grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="ค้นหาเลขห้อง" htmlFor="q">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint"
              aria-hidden
            />
            <Input
              id="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="เช่น 301"
              inputMode="numeric"
              className="pl-9"
            />
          </div>
        </Field>
        <Field label="ชั้น" htmlFor="floor">
          <Select
            id="floor"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          >
            <option value="all">ทุกชั้น</option>
            {floors.map((f) => (
              <option key={f} value={f}>
                ชั้น {f}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="สถานะ" htmlFor="status">
          <Select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as RoomStatus | "all")}
          >
            <option value="all">ทุกสถานะ</option>
            <option value="vacant">ว่าง</option>
            <option value="occupied">มีผู้เช่า</option>
            <option value="reserved">จองแล้ว</option>
            <option value="maintenance">ปิดปรับปรุง</option>
          </Select>
        </Field>
        <Field label="งบประมาณสูงสุด" htmlFor="price">
          <Select
            id="price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          >
            <option value="all">ไม่จำกัด</option>
            <option value="4500">ไม่เกิน 4,500</option>
            <option value="6000">ไม่เกิน 6,000</option>
            <option value="8000">ไม่เกิน 8,000</option>
            <option value="10000">ไม่เกิน 10,000</option>
          </Select>
        </Field>
      </div>

      {/* Result meta + sort */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-subtle">
          {hydrated ? (
            <>
              พบ <span className="font-semibold text-ink">{filtered.length}</span> ห้อง
            </>
          ) : (
            "กำลังโหลด..."
          )}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="flex items-center gap-1.5 text-sm text-subtle">
            <SlidersHorizontal className="size-4" aria-hidden />
            เรียงตาม
          </label>
          <Select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 w-auto py-0 text-sm"
          >
            <option value="price-asc">ราคาต่ำ → สูง</option>
            <option value="price-desc">ราคาสูง → ต่ำ</option>
            <option value="floor">ชั้น</option>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {!hydrated ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border">
              <Skeleton className="aspect-[4/3] rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={DoorClosed}
          title="ไม่พบห้องที่ตรงกับเงื่อนไข"
          description="ลองปรับตัวกรองหรือดูห้องทั้งหมดอีกครั้ง"
          action={
            <Button variant="outline" onClick={reset}>
              ล้างตัวกรอง
            </Button>
          }
        />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room, i) => (
            <RoomCard key={room.id} room={room} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">กำลังโหลด...</div>}
    >
      <RoomsInner />
    </Suspense>
  );
}
