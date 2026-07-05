import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  compact,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      aria-label="บ้านร่มเย็น เรสซิเดนซ์ หน้าแรก"
    >
      <span className="relative grid size-9 place-items-center rounded-lg bg-primary text-primary-fg shadow-sm">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
          <path
            d="M4 11.5 12 5l8 6.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 10.5V19h12v-8.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="10.4" y="13.5" width="3.2" height="5.5" rx="0.5" fill="currentColor" opacity="0.7" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[0.95rem] font-semibold text-ink">บ้านร่มเย็น</span>
          <span className="font-brand text-[0.62rem] font-medium tracking-[0.18em] text-faint">
            ROM YEN RESIDENCE
          </span>
        </span>
      )}
    </Link>
  );
}
