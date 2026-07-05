import { cn, initials } from "@/lib/utils";

const palette = [
  "bg-teal-100 text-teal-800",
  "bg-sky-100 text-sky-800",
  "bg-emerald-100 text-emerald-800",
  "bg-cyan-100 text-cyan-800",
  "bg-indigo-100 text-indigo-800",
];

export function Avatar({
  name,
  seed,
  size = "md",
  className,
}: {
  name: string;
  seed?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const s = size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-14 text-lg" : "size-10 text-sm";
  const key = (seed ?? name).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = palette[key % palette.length];
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold uppercase",
        s,
        color,
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
