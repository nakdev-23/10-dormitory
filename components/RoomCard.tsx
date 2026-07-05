import Link from "next/link";
import { ArrowRight, Maximize2, Layers } from "lucide-react";
import type { Room } from "@/lib/types";
import { formatTHB } from "@/lib/utils";
import { roomStatus, roomTypeLabel } from "@/lib/labels";
import { Badge } from "@/components/ui/Badge";
import { RoomImage } from "@/components/RoomImage";

export function RoomCard({ room, priority }: { room: Room; priority?: boolean }) {
  const st = roomStatus[room.status];
  return (
    <Link
      href={`/rooms/${room.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="relative">
        <RoomImage
          seed={room.photoSeed}
          alt={`ห้อง ${room.number} ${roomTypeLabel[room.type]}`}
          className="aspect-[4/3]"
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px"
        />
        <div className="absolute left-3 top-3">
          <Badge tone={st.tone} dot className="shadow-sm backdrop-blur">
            {st.label}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {roomTypeLabel[room.type]}
            </p>
            <h3 className="mt-0.5 text-lg font-semibold text-ink">
              ห้อง {room.number}
            </h3>
          </div>
          <div className="flex flex-col gap-1 text-right text-xs text-subtle">
            <span className="inline-flex items-center justify-end gap-1">
              <Layers className="size-3.5" aria-hidden /> ชั้น {room.floor}
            </span>
            <span className="inline-flex items-center justify-end gap-1">
              <Maximize2 className="size-3.5" aria-hidden /> {room.size} ตร.ม.
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-border pt-3">
          <div>
            <p className="tnum text-xl font-semibold text-ink">
              {formatTHB(room.rent)}
            </p>
            <p className="text-xs text-faint">ต่อเดือน</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-transform group-hover:translate-x-0.5">
            รายละเอียด
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
