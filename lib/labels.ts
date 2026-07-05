import type {
  ApplicationStatus,
  BillStatus,
  PaymentMethod,
  RoomStatus,
  RoomType,
  TenantStatus,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/types";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

export const roomTypeLabel: Record<RoomType, string> = {
  single: "ห้องเดี่ยว",
  double: "ห้องคู่",
  studio: "สตูดิโอ",
};

export const roomStatus: Record<RoomStatus, { label: string; tone: Tone }> = {
  vacant: { label: "ว่าง", tone: "success" },
  occupied: { label: "มีผู้เช่า", tone: "primary" },
  reserved: { label: "จองแล้ว", tone: "info" },
  maintenance: { label: "ปิดปรับปรุง", tone: "warning" },
};

export const billStatus: Record<BillStatus, { label: string; tone: Tone }> = {
  paid: { label: "ชำระแล้ว", tone: "success" },
  unpaid: { label: "รอชำระ", tone: "info" },
  overdue: { label: "เกินกำหนด", tone: "danger" },
};

export const tenantStatus: Record<TenantStatus, { label: string; tone: Tone }> = {
  active: { label: "กำลังเช่า", tone: "success" },
  notice: { label: "แจ้งย้ายออก", tone: "warning" },
};

export const ticketStatus: Record<TicketStatus, { label: string; tone: Tone }> = {
  open: { label: "รอรับเรื่อง", tone: "info" },
  in_progress: { label: "กำลังดำเนินการ", tone: "warning" },
  resolved: { label: "เสร็จสิ้น", tone: "success" },
};

export const ticketPriority: Record<TicketPriority, { label: string; tone: Tone }> = {
  low: { label: "ทั่วไป", tone: "neutral" },
  normal: { label: "ปานกลาง", tone: "info" },
  high: { label: "เร่งด่วน", tone: "danger" },
};

export const ticketCategory: Record<TicketCategory, string> = {
  electrical: "ระบบไฟฟ้า",
  plumbing: "ประปา",
  aircon: "เครื่องปรับอากาศ",
  furniture: "เฟอร์นิเจอร์",
  internet: "อินเทอร์เน็ต",
  cleaning: "ทำความสะอาด",
  other: "อื่น ๆ",
};

export const applicationStatus: Record<
  ApplicationStatus,
  { label: string; tone: Tone }
> = {
  pending: { label: "รอพิจารณา", tone: "info" },
  approved: { label: "อนุมัติแล้ว", tone: "success" },
  rejected: { label: "ไม่อนุมัติ", tone: "danger" },
};

export const paymentMethod: Record<PaymentMethod, string> = {
  transfer: "โอนธนาคาร",
  promptpay: "พร้อมเพย์",
  cash: "เงินสด",
  card: "บัตรเครดิต",
};
