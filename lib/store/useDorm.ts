"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Announcement,
  Application,
  Bill,
  MaintenanceTicket,
  MeterReading,
  PaymentMethod,
  Room,
  RoomStatus,
  Tenant,
  TicketStatus,
} from "@/lib/types";
import {
  seedAnnouncements,
  seedApplications,
  seedBills,
  seedMaintenance,
  seedMeters,
  seedRoomsOccupied,
  seedTenants,
  COMMON_FEE,
  ELECTRIC_RATE,
  WATER_RATE,
} from "@/lib/data/seed";
import { addMonthsToKey, makeId } from "@/lib/utils";

export interface NewRoomInput {
  number: string;
  floor: number;
  type: Room["type"];
  size: number;
  rent: number;
  deposit: number;
  status: RoomStatus;
  amenities: string[];
  description: string;
  furnished: boolean;
}

interface DormState {
  rooms: Room[];
  tenants: Tenant[];
  bills: Bill[];
  meters: MeterReading[];
  maintenance: MaintenanceTicket[];
  applications: Application[];
  announcements: Announcement[];

  /* Rooms */
  addRoom: (input: NewRoomInput) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

  /* Tenants */
  updateTenant: (id: string, patch: Partial<Tenant>) => void;

  /* Meters + Billing */
  upsertMeter: (reading: MeterReading) => void;
  generateBills: (month: string) => number; // returns count created
  markBillPaid: (id: string, method: PaymentMethod) => Bill | undefined;
  recomputeOverdue: () => void;

  /* Maintenance */
  addTicket: (
    input: Pick<
      MaintenanceTicket,
      "roomId" | "tenantId" | "title" | "category" | "description" | "priority"
    >,
  ) => void;
  setTicketStatus: (id: string, status: TicketStatus) => void;
  assignTicket: (id: string, assignee: string) => void;
  resolveTicket: (id: string, note: string) => void;

  /* Applications */
  addApplication: (
    input: Omit<Application, "id" | "status" | "createdAt">,
  ) => void;
  approveApplication: (id: string) => Tenant | undefined;
  rejectApplication: (id: string, note: string) => void;

  /* Announcements */
  addAnnouncement: (
    input: Omit<Announcement, "id" | "date" | "pinned"> & { pinned?: boolean },
  ) => void;
  deleteAnnouncement: (id: string) => void;
}

function isPast(dueISO: string): boolean {
  return new Date(dueISO).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
}

function billTotal(b: {
  rent: number;
  waterUnits: number;
  waterRate: number;
  electricUnits: number;
  electricRate: number;
  otherFees: number;
}): number {
  return (
    b.rent +
    b.waterUnits * b.waterRate +
    b.electricUnits * b.electricRate +
    b.otherFees
  );
}

export const useDorm = create<DormState>()(
  persist(
    (set, get) => ({
      rooms: seedRoomsOccupied,
      tenants: seedTenants,
      bills: seedBills,
      meters: seedMeters,
      maintenance: seedMaintenance,
      applications: seedApplications,
      announcements: seedAnnouncements,

      /* ---------------- Rooms ---------------- */
      addRoom: (input) =>
        set((s) => ({
          rooms: [
            ...s.rooms,
            {
              ...input,
              id: makeId("room"),
              photoSeed: `room${input.number}${Math.floor(Math.random() * 999)}`,
            },
          ],
        })),

      updateRoom: (id, patch) =>
        set((s) => ({
          rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      deleteRoom: (id) =>
        set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),

      /* ---------------- Tenants ---------------- */
      updateTenant: (id, patch) =>
        set((s) => ({
          tenants: s.tenants.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      /* ---------------- Meters + Billing ---------------- */
      upsertMeter: (reading) =>
        set((s) => {
          const exists = s.meters.some(
            (m) => m.roomId === reading.roomId && m.month === reading.month,
          );
          return {
            meters: exists
              ? s.meters.map((m) =>
                  m.roomId === reading.roomId && m.month === reading.month
                    ? reading
                    : m,
                )
              : [...s.meters, reading],
          };
        }),

      generateBills: (month) => {
        const state = get();
        const occupied = state.rooms.filter(
          (r) => r.status === "occupied" && r.tenantId,
        );
        const newBills: Bill[] = [];
        const newMeters: MeterReading[] = [];
        const [y, m] = month.split("-").map(Number);

        occupied.forEach((room) => {
          const already = state.bills.some(
            (b) => b.roomId === room.id && b.month === month,
          );
          if (already) return;

          // Find or synthesise meter reading for the month.
          let meter = state.meters.find(
            (mm) => mm.roomId === room.id && mm.month === month,
          );
          if (!meter) {
            const prevKey = addMonthsToKey(month, -1);
            const prev = state.meters.find(
              (mm) => mm.roomId === room.id && mm.month === prevKey,
            );
            const waterPrev = prev?.waterCurr ?? 150;
            const elecPrev = prev?.electricCurr ?? 1800;
            const waterUse = 6 + Math.floor(Math.random() * 11);
            const elecUse = 90 + Math.floor(Math.random() * 170);
            meter = {
              id: `meter-${room.number}-${month}`,
              roomId: room.id,
              month,
              waterPrev,
              waterCurr: waterPrev + waterUse,
              electricPrev: elecPrev,
              electricCurr: elecPrev + elecUse,
            };
            newMeters.push(meter);
          }

          const waterUnits = meter.waterCurr - meter.waterPrev;
          const electricUnits = meter.electricCurr - meter.electricPrev;
          const total = billTotal({
            rent: room.rent,
            waterUnits,
            waterRate: WATER_RATE,
            electricUnits,
            electricRate: ELECTRIC_RATE,
            otherFees: COMMON_FEE,
          });

          newBills.push({
            id: `bill-${room.number}-${month}`,
            tenantId: room.tenantId!,
            roomId: room.id,
            month,
            rent: room.rent,
            waterUnits,
            waterRate: WATER_RATE,
            electricUnits,
            electricRate: ELECTRIC_RATE,
            otherFees: COMMON_FEE,
            otherLabel: "ค่าส่วนกลาง",
            total,
            status: "unpaid",
            issuedDate: new Date(y, m - 1, 1).toISOString().slice(0, 10),
            dueDate: new Date(y, m - 1, 5).toISOString().slice(0, 10),
          });
        });

        if (newBills.length) {
          set((s) => ({
            bills: [...s.bills, ...newBills],
            meters: [...s.meters, ...newMeters],
          }));
        }
        return newBills.length;
      },

      markBillPaid: (id, method) => {
        let updated: Bill | undefined;
        set((s) => ({
          bills: s.bills.map((b) => {
            if (b.id !== id) return b;
            updated = {
              ...b,
              status: "paid",
              method,
              paidDate: new Date().toISOString().slice(0, 10),
              receiptNo:
                b.receiptNo ?? `RC${b.month.replace("-", "")}${b.roomId.replace(/\D/g, "")}`,
            };
            return updated;
          }),
        }));
        return updated;
      },

      recomputeOverdue: () =>
        set((s) => ({
          bills: s.bills.map((b) => {
            if (b.status === "unpaid" && isPast(b.dueDate))
              return { ...b, status: "overdue" };
            return b;
          }),
        })),

      /* ---------------- Maintenance ---------------- */
      addTicket: (input) =>
        set((s) => ({
          maintenance: [
            {
              ...input,
              id: makeId("tk"),
              status: "open",
              createdAt: new Date().toISOString(),
            },
            ...s.maintenance,
          ],
        })),

      setTicketStatus: (id, status) =>
        set((s) => ({
          maintenance: s.maintenance.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  resolvedAt:
                    status === "resolved"
                      ? new Date().toISOString()
                      : undefined,
                }
              : t,
          ),
        })),

      assignTicket: (id, assignee) =>
        set((s) => ({
          maintenance: s.maintenance.map((t) =>
            t.id === id
              ? {
                  ...t,
                  assignee,
                  status: t.status === "open" ? "in_progress" : t.status,
                }
              : t,
          ),
        })),

      resolveTicket: (id, note) =>
        set((s) => ({
          maintenance: s.maintenance.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "resolved",
                  resolvedAt: new Date().toISOString(),
                  resolutionNote: note,
                }
              : t,
          ),
        })),

      /* ---------------- Applications ---------------- */
      addApplication: (input) =>
        set((s) => ({
          applications: [
            {
              ...input,
              id: makeId("app"),
              status: "pending",
              createdAt: new Date().toISOString(),
            },
            ...s.applications,
          ],
        })),

      approveApplication: (id) => {
        const state = get();
        const app = state.applications.find((a) => a.id === id);
        if (!app) return undefined;
        const room = state.rooms.find((r) => r.id === app.roomId);
        if (!room) return undefined;

        const start = new Date(app.moveInDate);
        const end = new Date(start);
        end.setMonth(end.getMonth() + app.months);

        const tenant: Tenant = {
          id: makeId("tenant"),
          name: app.name,
          phone: app.phone,
          email: app.email,
          roomId: room.id,
          leaseStart: app.moveInDate,
          leaseEnd: end.toISOString().slice(0, 10),
          deposit: room.deposit,
          occupation: app.occupation,
          emergencyName: "-",
          emergencyPhone: "-",
          status: "active",
          avatarSeed: `${app.name}${Date.now()}`,
        };

        set((s) => ({
          tenants: [...s.tenants, tenant],
          rooms: s.rooms.map((r) =>
            r.id === room.id
              ? { ...r, status: "occupied", tenantId: tenant.id }
              : r,
          ),
          applications: s.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: "approved",
                  reviewedAt: new Date().toISOString(),
                  reviewNote: "อนุมัติและจัดห้องเรียบร้อย",
                }
              : a,
          ),
        }));
        return tenant;
      },

      rejectApplication: (id, note) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: "rejected",
                  reviewedAt: new Date().toISOString(),
                  reviewNote: note,
                }
              : a,
          ),
        })),

      /* ---------------- Announcements ---------------- */
      addAnnouncement: (input) =>
        set((s) => ({
          announcements: [
            {
              ...input,
              id: makeId("an"),
              date: new Date().toISOString(),
              pinned: input.pinned ?? false,
            },
            ...s.announcements,
          ],
        })),

      deleteAnnouncement: (id) =>
        set((s) => ({
          announcements: s.announcements.filter((a) => a.id !== id),
        })),
    }),
    {
      name: "dorm-data",
      version: 1,
    },
  ),
);
