import type {
  Announcement,
  Application,
  Bill,
  MaintenanceTicket,
  MeterReading,
  Room,
  RoomType,
  Tenant,
} from "@/lib/types";
import { addMonthsToKey, currentMonthKey } from "@/lib/utils";

/* Utility rates (THB per unit) — typical Thai dorm */
export const WATER_RATE = 18;
export const ELECTRIC_RATE = 8;
export const COMMON_FEE = 300; // ค่าส่วนกลาง/อินเทอร์เน็ต

/* Deterministic tiny PRNG so seed data is stable across renders. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
const rnd = makeRng(20260702);
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
const int = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;

const NOW = currentMonthKey(); // e.g. "2026-07"

/* ----------------------------- Rooms ----------------------------- */

const TYPE_META: Record<
  RoomType,
  { label: string; size: [number, number]; rent: [number, number] }
> = {
  single: { label: "ห้องเดี่ยว", size: [22, 26], rent: [3800, 4600] },
  double: { label: "ห้องคู่", size: [30, 34], rent: [5800, 6800] },
  studio: { label: "สตูดิโอ", size: [38, 46], rent: [7800, 9500] },
};

export const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  single: "ห้องเดี่ยว",
  double: "ห้องคู่",
  studio: "สตูดิโอ",
};

const BASE_AMENITIES = ["แอร์", "เครื่องทำน้ำอุ่น", "Wi-Fi ไฟเบอร์", "ตู้เสื้อผ้า", "เตียง"];
const EXTRA_AMENITIES = [
  "ระเบียง",
  "ครัวในตัว",
  "โซฟา",
  "โต๊ะทำงาน",
  "ทีวี",
  "ตู้เย็น",
  "วิวเมือง",
  "ที่จอดรถ",
];

function roundTo(n: number, step: number) {
  return Math.round(n / step) * step;
}

function buildRooms(): Room[] {
  const rooms: Room[] = [];
  const floors = 6;
  const perFloor = 4;
  let idx = 0;
  for (let floor = 1; floor <= floors; floor++) {
    for (let n = 1; n <= perFloor; n++) {
      idx++;
      // Type by position: studios on higher floors, doubles mid, singles common
      let type: RoomType = "single";
      if (floor >= 5) type = n <= 2 ? "studio" : "double";
      else if (floor === 4) type = n === 1 ? "studio" : n <= 3 ? "double" : "single";
      else type = n === 4 ? "double" : "single";

      const meta = TYPE_META[type];
      const size = int(meta.size[0], meta.size[1]);
      const rent = roundTo(int(meta.rent[0], meta.rent[1]), 100);
      const number = `${floor}${String(n).padStart(2, "0")}`;
      const extras = EXTRA_AMENITIES.filter(() => rnd() > 0.5).slice(0, 4);
      const furnished = type !== "single" || rnd() > 0.3;
      rooms.push({
        id: `room-${number}`,
        number,
        floor,
        type,
        size,
        rent,
        deposit: rent * 2,
        status: "vacant",
        amenities: [...BASE_AMENITIES, ...extras],
        photoSeed: `dorm${number}${idx}`,
        furnished,
        description:
          type === "studio"
            ? "ห้องสตูดิโอกว้างขวาง ครัวในตัว เหมาะสำหรับผู้ที่ต้องการพื้นที่ทำงานและพักผ่อนในที่เดียว"
            : type === "double"
              ? "ห้องคู่ขนาดกำลังดี แยกโซนนอนและนั่งเล่น เหมาะสำหรับคู่รักหรือเพื่อนร่วมห้อง"
              : "ห้องเดี่ยวจัดวางลงตัว เฟอร์นิเจอร์ครบพร้อมเข้าอยู่ คุ้มค่ากับทำเลใจกลางเมือง",
      });
    }
  }
  return rooms;
}

export const seedRooms: Room[] = buildRooms();

/* ----------------------------- Tenants ----------------------------- */

const TENANT_SEED: Array<{
  name: string;
  occupation: string;
  emergencyName: string;
}> = [
  { name: "ณัฐพล ศรีสวัสดิ์", occupation: "วิศวกรซอฟต์แวร์", emergencyName: "สมหญิง ศรีสวัสดิ์" },
  { name: "พิมพ์ชนก ทองดี", occupation: "นักออกแบบกราฟิก", emergencyName: "วิชัย ทองดี" },
  { name: "ธนกร วัฒนพงษ์", occupation: "พนักงานบัญชี", emergencyName: "อรทัย วัฒนพงษ์" },
  { name: "ศิริพร แก้วมณี", occupation: "พยาบาลวิชาชีพ", emergencyName: "ประสิทธิ์ แก้วมณี" },
  { name: "กิตติศักดิ์ ใจดี", occupation: "เจ้าของธุรกิจออนไลน์", emergencyName: "มาลี ใจดี" },
  { name: "อรวรรณ พันธุ์ไพโรจน์", occupation: "ครูสอนภาษาอังกฤษ", emergencyName: "สุชาติ พันธุ์ไพโรจน์" },
  { name: "ภาณุวัฒน์ รัตนกุล", occupation: "นักการตลาดดิจิทัล", emergencyName: "รัตนา รัตนกุล" },
  { name: "จิราภรณ์ สุขเกษม", occupation: "นักศึกษาปริญญาโท", emergencyName: "บุญมี สุขเกษม" },
  { name: "วีระชัย ประเสริฐ", occupation: "ช่างภาพอิสระ", emergencyName: "นงลักษณ์ ประเสริฐ" },
  { name: "ปาริชาต อินทรีย์", occupation: "เภสัชกร", emergencyName: "สมบัติ อินทรีย์" },
  { name: "ธีรเดช มั่นคง", occupation: "วิศวกรโยธา", emergencyName: "พรทิพย์ มั่นคง" },
  { name: "สุนิสา เจริญพร", occupation: "ผู้ช่วยวิจัย", emergencyName: "อนันต์ เจริญพร" },
  { name: "อดิศร บุญเรือง", occupation: "โปรแกรมเมอร์", emergencyName: "จันทนา บุญเรือง" },
  { name: "กมลชนก แซ่ลิ้ม", occupation: "นักบัญชีอิสระ", emergencyName: "สมพร แซ่ลิ้ม" },
];

function phone(): string {
  return `08${int(1, 9)}-${String(int(100, 999))}-${String(int(1000, 9999))}`;
}

function buildTenants(): { tenants: Tenant[]; rooms: Room[] } {
  const rooms = seedRooms.map((r) => ({ ...r }));
  const tenants: Tenant[] = [];

  // Choose 14 rooms to occupy (skip a couple to leave vacancies).
  const occupiable = rooms.filter((_, i) => i % 6 !== 5); // leave every 6th vacant-ish
  const chosen = occupiable.slice(0, TENANT_SEED.length);

  TENANT_SEED.forEach((t, i) => {
    const room = chosen[i];
    const roomRef = rooms.find((r) => r.id === room.id)!;
    const monthsAgo = int(2, 20);
    const start = new Date();
    start.setMonth(start.getMonth() - monthsAgo);
    start.setDate(1);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    const first = t.name.split(" ")[0];
    tenants.push({
      id: `tenant-${i + 1}`,
      name: t.name,
      phone: phone(),
      email: `${["nat", "pim", "thana", "siri", "kit", "orn", "panu", "jira", "wee", "pari", "teera", "sunisa", "adi", "kamon"][i]}${i + 1}@mail.co.th`,
      roomId: room.id,
      leaseStart: start.toISOString().slice(0, 10),
      leaseEnd: end.toISOString().slice(0, 10),
      deposit: roomRef.deposit,
      occupation: t.occupation,
      emergencyName: t.emergencyName,
      emergencyPhone: phone(),
      status: i === 3 || i === 9 ? "notice" : "active",
      avatarSeed: `${first}${i}`,
    });
    roomRef.status = "occupied";
    roomRef.tenantId = `tenant-${i + 1}`;
  });

  // Mark a couple non-occupied rooms as maintenance / reserved for variety.
  const vacant = rooms.filter((r) => r.status === "vacant");
  if (vacant[0]) vacant[0].status = "maintenance";
  if (vacant[1]) vacant[1].status = "reserved";

  return { tenants, rooms };
}

const built = buildTenants();
export const seedTenants: Tenant[] = built.tenants;
// override rooms with occupancy applied
export const seedRoomsOccupied: Room[] = built.rooms;

/* ----------------------------- Meters + Bills ----------------------------- */

function buildMetersAndBills(): { meters: MeterReading[]; bills: Bill[] } {
  const meters: MeterReading[] = [];
  const bills: Bill[] = [];
  const months = [addMonthsToKey(NOW, -2), addMonthsToKey(NOW, -1), NOW];

  seedTenants.forEach((tenant) => {
    const room = seedRoomsOccupied.find((r) => r.id === tenant.roomId)!;
    // Running meter baselines
    let waterBase = int(120, 260);
    let elecBase = int(1400, 2600);

    months.forEach((month, mi) => {
      const waterUse = int(6, 16);
      const elecUse = int(90, 260);
      const waterPrev = waterBase;
      const waterCurr = waterBase + waterUse;
      const elecPrev = elecBase;
      const elecCurr = elecBase + elecUse;
      waterBase = waterCurr;
      elecBase = elecCurr;

      meters.push({
        id: `meter-${room.number}-${month}`,
        roomId: room.id,
        month,
        waterPrev,
        waterCurr,
        electricPrev: elecPrev,
        electricCurr: elecCurr,
      });

      const [y, m] = month.split("-").map(Number);
      const issued = new Date(y, m - 1, 1).toISOString().slice(0, 10);
      const due = new Date(y, m - 1, 5).toISOString().slice(0, 10);
      const water = waterUse * WATER_RATE;
      const electric = elecUse * ELECTRIC_RATE;
      const total = room.rent + water + electric + COMMON_FEE;

      // Payment behaviour: older months mostly paid; a few remain unpaid → overdue.
      const isCurrent = mi === months.length - 1;
      let paid = true;
      if (isCurrent) paid = false; // current month always outstanding
      else if (mi === months.length - 2 && (tenant.id === "tenant-3" || tenant.id === "tenant-8"))
        paid = false; // deliberate overdue cases
      else paid = rnd() > 0.08;

      const paidDate = paid
        ? new Date(y, m - 1, int(2, 6)).toISOString().slice(0, 10)
        : undefined;

      bills.push({
        id: `bill-${room.number}-${month}`,
        tenantId: tenant.id,
        roomId: room.id,
        month,
        rent: room.rent,
        waterUnits: waterUse,
        waterRate: WATER_RATE,
        electricUnits: elecUse,
        electricRate: ELECTRIC_RATE,
        otherFees: COMMON_FEE,
        otherLabel: "ค่าส่วนกลาง",
        total,
        status: paid ? "paid" : "unpaid",
        issuedDate: issued,
        dueDate: due,
        paidDate,
        method: paid ? pick(["transfer", "promptpay", "cash"]) : undefined,
        receiptNo: paid ? `RC${month.replace("-", "")}${room.number}` : undefined,
      });
    });
  });

  return { meters, bills };
}

const mb = buildMetersAndBills();
export const seedMeters: MeterReading[] = mb.meters;
export const seedBills: Bill[] = mb.bills;

/* ----------------------------- Maintenance ----------------------------- */

export const seedMaintenance: MaintenanceTicket[] = [
  {
    id: "tk-1",
    roomId: seedTenants[0].roomId,
    tenantId: seedTenants[0].id,
    title: "แอร์ไม่เย็น มีน้ำหยด",
    category: "aircon",
    description: "แอร์เปิดแล้วลมออกไม่เย็น และมีน้ำหยดจากตัวเครื่องบริเวณด้านซ้าย",
    priority: "high",
    status: "open",
    createdAt: daysAgoISO(1),
  },
  {
    id: "tk-2",
    roomId: seedTenants[2].roomId,
    tenantId: seedTenants[2].id,
    title: "ก๊อกน้ำในห้องน้ำรั่ว",
    category: "plumbing",
    description: "น้ำหยดตลอดเวลาแม้ปิดสนิท ทำให้เสียงดังตอนกลางคืน",
    priority: "normal",
    status: "in_progress",
    createdAt: daysAgoISO(4),
    assignee: "ช่างสมชาย",
  },
  {
    id: "tk-3",
    roomId: seedTenants[4].roomId,
    tenantId: seedTenants[4].id,
    title: "หลอดไฟระเบียงขาด",
    category: "electrical",
    description: "หลอดไฟบริเวณระเบียงไม่ติด เปลี่ยนหลอดแล้วยังไม่ติด",
    priority: "low",
    status: "resolved",
    createdAt: daysAgoISO(12),
    assignee: "ช่างวิรัตน์",
    resolvedAt: daysAgoISO(10),
    resolutionNote: "เปลี่ยนขั้วหลอดและหลอดไฟใหม่เรียบร้อย",
  },
  {
    id: "tk-4",
    roomId: seedTenants[6].roomId,
    tenantId: seedTenants[6].id,
    title: "อินเทอร์เน็ตหลุดบ่อย",
    category: "internet",
    description: "Wi-Fi หลุดเป็นช่วง ๆ โดยเฉพาะช่วงเย็น",
    priority: "normal",
    status: "open",
    createdAt: daysAgoISO(2),
  },
  {
    id: "tk-5",
    roomId: seedTenants[1].roomId,
    tenantId: seedTenants[1].id,
    title: "บานพับตู้เสื้อผ้าหลวม",
    category: "furniture",
    description: "ประตูตู้เสื้อผ้าปิดไม่สนิท บานพับด้านบนหลวม",
    priority: "low",
    status: "in_progress",
    createdAt: daysAgoISO(6),
    assignee: "ช่างสมชาย",
  },
];

/* ----------------------------- Applications ----------------------------- */

function vacantRoomId(offset = 0): string {
  const vac = seedRoomsOccupied.filter((r) => r.status === "vacant");
  return (vac[offset] ?? vac[0]).id;
}

export const seedApplications: Application[] = [
  {
    id: "app-1",
    name: "ชลิตา วงศ์อารีย์",
    phone: "089-221-4477",
    email: "chalita.w@mail.co.th",
    roomId: vacantRoomId(0),
    occupation: "นักออกแบบผลิตภัณฑ์",
    moveInDate: daysFromNowISO(10),
    months: 12,
    documents: ["บัตรประชาชน.pdf", "สลิปเงินเดือน.pdf"],
    message: "สนใจห้องวิวเมือง ต้องการเข้าอยู่ต้นเดือนหน้า มีสัตว์เลี้ยงเป็นแมว 1 ตัว",
    status: "pending",
    createdAt: daysAgoISO(1),
  },
  {
    id: "app-2",
    name: "ปรเมศวร์ ตั้งใจ",
    phone: "081-556-9032",
    email: "poramet.t@mail.co.th",
    roomId: vacantRoomId(1),
    occupation: "เทรดเดอร์",
    moveInDate: daysFromNowISO(20),
    months: 12,
    documents: ["บัตรประชาชน.pdf"],
    message: "ต้องการห้องเงียบ ทำงานที่บ้านเป็นหลัก",
    status: "pending",
    createdAt: daysAgoISO(3),
  },
  {
    id: "app-3",
    name: "ญาดา คีรีวงศ์",
    phone: "092-778-1120",
    email: "yada.k@mail.co.th",
    roomId: vacantRoomId(2),
    occupation: "แพทย์ประจำบ้าน",
    moveInDate: daysFromNowISO(5),
    months: 12,
    documents: ["บัตรประชาชน.pdf", "หนังสือรับรองการทำงาน.pdf", "สลิปเงินเดือน.pdf"],
    message: "เวรดึกบ่อย ต้องการห้องใกล้ลิฟต์",
    status: "approved",
    createdAt: daysAgoISO(14),
    reviewedAt: daysAgoISO(12),
    reviewNote: "เอกสารครบถ้วน อนุมัติเข้าอยู่",
  },
];

/* ----------------------------- Announcements ----------------------------- */

export const seedAnnouncements: Announcement[] = [
  {
    id: "an-1",
    title: "แจ้งกำหนดชำระค่าเช่าประจำเดือน",
    body: "ขอความร่วมมือผู้เช่าทุกท่านชำระค่าเช่าและค่าสาธารณูปโภคภายในวันที่ 5 ของทุกเดือน สามารถชำระผ่านระบบพอร์ทัลได้ทันที",
    date: daysAgoISO(2),
    category: "billing",
    pinned: true,
  },
  {
    id: "an-2",
    title: "ตรวจสอบระบบดับเพลิงประจำปี",
    body: "ทีมช่างจะเข้าตรวจสอบถังดับเพลิงและสัญญาณเตือนภัยในวันที่ 15 เวลา 10:00–15:00 น. ขออภัยในความไม่สะดวก",
    date: daysAgoISO(5),
    category: "maintenance",
    pinned: false,
  },
  {
    id: "an-3",
    title: "กิจกรรมทำความสะอาดพื้นที่ส่วนกลาง",
    body: "เชิญชวนผู้เช่าร่วมกิจกรรม Big Cleaning Day บริเวณดาดฟ้าและล็อบบี้ พร้อมรับของที่ระลึก",
    date: daysAgoISO(9),
    category: "event",
    pinned: false,
  },
  {
    id: "an-4",
    title: "ปรับปรุงความเร็วอินเทอร์เน็ตไฟเบอร์",
    body: "อัปเกรดแพ็กเกจอินเทอร์เน็ตส่วนกลางเป็น 1 Gbps ทุกห้องแล้ว โดยไม่มีค่าใช้จ่ายเพิ่มเติม",
    date: daysAgoISO(16),
    category: "general",
    pinned: false,
  },
];

/* ----------------------------- date helpers ----------------------------- */

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
function daysFromNowISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
