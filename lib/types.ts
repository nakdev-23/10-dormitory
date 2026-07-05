/* ----------------------------- Domain types ----------------------------- */

export type RoomType = "single" | "double" | "studio";
export type RoomStatus = "vacant" | "occupied" | "reserved" | "maintenance";

export interface Room {
  id: string;
  number: string; // e.g. "301"
  floor: number;
  type: RoomType;
  size: number; // sqm
  rent: number; // monthly THB
  deposit: number; // THB
  status: RoomStatus;
  tenantId?: string;
  amenities: string[];
  photoSeed: string;
  description: string;
  furnished: boolean;
}

export type TenantStatus = "active" | "notice"; // notice = แจ้งย้ายออก

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomId: string;
  leaseStart: string; // ISO date
  leaseEnd: string; // ISO date
  deposit: number;
  occupation: string;
  emergencyName: string;
  emergencyPhone: string;
  status: TenantStatus;
  avatarSeed: string;
}

export type BillStatus = "unpaid" | "paid" | "overdue";
export type PaymentMethod = "transfer" | "promptpay" | "cash" | "card";

export interface Bill {
  id: string;
  tenantId: string;
  roomId: string;
  month: string; // YYYY-MM (billing period)
  rent: number;
  waterUnits: number;
  waterRate: number;
  electricUnits: number;
  electricRate: number;
  otherFees: number; // parking, internet, fines...
  otherLabel?: string;
  total: number;
  status: BillStatus;
  issuedDate: string; // ISO
  dueDate: string; // ISO
  paidDate?: string;
  method?: PaymentMethod;
  receiptNo?: string;
}

export interface MeterReading {
  id: string;
  roomId: string;
  month: string; // YYYY-MM
  waterPrev: number;
  waterCurr: number;
  electricPrev: number;
  electricCurr: number;
}

export type TicketStatus = "open" | "in_progress" | "resolved";
export type TicketPriority = "low" | "normal" | "high";
export type TicketCategory =
  | "electrical"
  | "plumbing"
  | "aircon"
  | "furniture"
  | "internet"
  | "cleaning"
  | "other";

export interface MaintenanceTicket {
  id: string;
  roomId: string;
  tenantId?: string;
  title: string;
  category: TicketCategory;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string; // ISO
  assignee?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface Application {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomId: string; // requested room
  occupation: string;
  moveInDate: string; // ISO
  months: number; // lease length
  documents: string[]; // filenames
  message: string;
  status: ApplicationStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string; // ISO
  category: "general" | "maintenance" | "billing" | "event";
  pinned: boolean;
}

/* ----------------------------- Session ----------------------------- */

export type Role = "tenant" | "manager";

/* ----------------------------- UI helpers ----------------------------- */

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}
