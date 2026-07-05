import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/* ----------------------------- Money ----------------------------- */

const thb = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const thbDecimal = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format an integer THB amount: ฿12,500 */
export function formatTHB(amount: number): string {
  return thb.format(Math.round(amount));
}

/** Format a THB amount keeping satang: ฿12,500.50 */
export function formatTHBDecimal(amount: number): string {
  return thbDecimal.format(amount);
}

/** Plain grouped number: 12,500 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("th-TH").format(n);
}

/* ----------------------------- Dates ----------------------------- */

const dateFmt = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateLongFmt = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const monthFmt = new Intl.DateTimeFormat("th-TH", {
  month: "long",
  year: "numeric",
});

function toDate(input: string | Date): Date {
  return typeof input === "string" ? new Date(input) : input;
}

/** 2 ก.ค. 2569 (Buddhist era via th-TH locale) */
export function formatDate(input: string | Date): string {
  return dateFmt.format(toDate(input));
}

export function formatDateLong(input: string | Date): string {
  return dateLongFmt.format(toDate(input));
}

/** From "2026-06" → "มิถุนายน 2569" */
export function formatMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return monthFmt.format(new Date(y, m - 1, 1));
}

/** Short month label for charts: "มิ.ย." */
export function formatMonthShort(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat("th-TH", { month: "short" }).format(
    new Date(y, m - 1, 1),
  );
}

/** Current YYYY-MM key */
export function currentMonthKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Add months to a YYYY-MM key */
export function addMonthsToKey(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Days between now and a date (negative = past). */
export function daysUntil(input: string | Date): number {
  const target = toDate(input).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86_400_000);
}

/** Relative Thai label for a date (approx). */
export function relativeThai(input: string | Date): string {
  const diff = daysUntil(input);
  if (diff === 0) return "วันนี้";
  if (diff === -1) return "เมื่อวาน";
  if (diff === 1) return "พรุ่งนี้";
  if (diff < 0) return `${Math.abs(diff)} วันที่แล้ว`;
  return `อีก ${diff} วัน`;
}

/* ----------------------------- Misc ----------------------------- */

let idCounter = 0;
/** Stable-ish client id generator for new records. */
export function makeId(prefix = "id"): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Deterministic picsum photo url for a seed. */
export function roomPhoto(seed: string, w = 800, h = 600): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

/** Initials from a Thai / latin name. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] ?? "") + (parts[1][0] ?? "");
}
