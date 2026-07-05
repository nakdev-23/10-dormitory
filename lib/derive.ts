import type { Bill, Room, Tenant, MaintenanceTicket } from "@/lib/types";
import { addMonthsToKey, currentMonthKey } from "@/lib/utils";

/** True if a bill counts as outstanding (unpaid or overdue). */
export function isOutstanding(b: Bill): boolean {
  return b.status !== "paid";
}

export function occupancyStats(rooms: Room[]) {
  const total = rooms.length;
  const occupied = rooms.filter((r) => r.status === "occupied").length;
  const vacant = rooms.filter((r) => r.status === "vacant").length;
  const reserved = rooms.filter((r) => r.status === "reserved").length;
  const maintenance = rooms.filter((r) => r.status === "maintenance").length;
  const rate = total ? Math.round((occupied / total) * 100) : 0;
  return { total, occupied, vacant, reserved, maintenance, rate };
}

/** Sum of a tenant's outstanding bills. */
export function tenantBalance(bills: Bill[], tenantId: string): number {
  return bills
    .filter((b) => b.tenantId === tenantId && isOutstanding(b))
    .reduce((sum, b) => sum + b.total, 0);
}

/** Revenue actually collected in a given month (by paidDate). */
export function collectedInMonth(bills: Bill[], monthKey: string): number {
  return bills
    .filter((b) => b.status === "paid" && b.paidDate?.startsWith(monthKey))
    .reduce((sum, b) => sum + b.total, 0);
}

/** Total billed for a month (issued). */
export function billedInMonth(bills: Bill[], monthKey: string): number {
  return bills
    .filter((b) => b.month === monthKey)
    .reduce((sum, b) => sum + b.total, 0);
}

/** Series of the last `n` months of collected revenue. */
export function revenueSeries(bills: Bill[], n = 6) {
  const now = currentMonthKey();
  const out: { month: string; collected: number; billed: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const key = addMonthsToKey(now, -i);
    out.push({
      month: key,
      collected: collectedInMonth(bills, key),
      billed: billedInMonth(bills, key),
    });
  }
  return out;
}

export function outstandingTotal(bills: Bill[]): number {
  return bills.filter(isOutstanding).reduce((s, b) => s + b.total, 0);
}

export function overdueBills(bills: Bill[]): Bill[] {
  return bills.filter((b) => b.status === "overdue");
}

export function openTickets(tickets: MaintenanceTicket[]): MaintenanceTicket[] {
  return tickets.filter((t) => t.status !== "resolved");
}

/** Roll-up used by the occupancy donut chart. */
export function occupancyBreakdown(rooms: Room[]) {
  const s = occupancyStats(rooms);
  return [
    { name: "มีผู้เช่า", value: s.occupied, key: "occupied" },
    { name: "ว่าง", value: s.vacant, key: "vacant" },
    { name: "จอง", value: s.reserved, key: "reserved" },
    { name: "ปรับปรุง", value: s.maintenance, key: "maintenance" },
  ].filter((x) => x.value > 0);
}

export function roomOfTenant(rooms: Room[], tenant?: Tenant): Room | undefined {
  if (!tenant) return undefined;
  return rooms.find((r) => r.id === tenant.roomId);
}
