# บ้านร่มเย็น เรสซิเดนซ์ — ระบบหอพัก + ผู้เช่ารายเดือน

App 10 of a 10-app premium portfolio. A complete dormitory / monthly-rental management
system with a public marketing site, a tenant portal, and a full manager console —
all running on mock data + client state (no backend).

Built with **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript**,
**Tailwind CSS v4**, **zustand** (persisted), **framer-motion**, **recharts**, and
**lucide-react**. UI copy is Thai; code is English.

## Design

- **Mood:** modern, trustworthy property management. Trust teal (`#0F766E`) + professional
  blue accent, cool neutral surfaces. Full light/dark theme via a `.dark` class token swap
  (persisted, applied pre-paint to avoid flash).
- **Type:** Cinzel (Latin brand wordmark) · Noto Serif Thai (headings) · IBM Plex Sans Thai
  (body) — a serif/sans contrast axis with full Thai glyph coverage.
- Tabular figures on every money/data column, purposeful motion with a
  `prefers-reduced-motion` fallback, visible focus rings, ≥44px touch targets.

## Roles (mock auth)

Switch anytime with the **ผู้เช่า / ผู้ดูแล** toggle in the header/sidebar (persisted in the
`session` store). No passwords.

- **tenant** → `/portal`
- **manager** → `/manage`

The tenant portal also has a demo "เข้าใช้เป็น" selector to view the portal as any seeded tenant.

## Routes

**Public + tenant**
- `/` — landing: hero + live availability stats, room-type showcase, amenities, vacant-room
  grid, 3-step how-it-works, location, CTA.
- `/rooms` — room list with filters (type / floor / status / max price / search) + sort.
- `/rooms/[id]` — gallery, size/floor/furnishing, rent + deposit, amenities, **apply-to-rent** modal.
- `/apply` — full application flow (personal info, room pick, move-in date, lease length,
  document filenames via file picker, message) with inline validation.
- `/portal` — tenant dashboard: current room + lease, outstanding balance banner, **rent bills**
  (pay → mock payment → **receipt**), **payment history**, **maintenance** (create + track),
  announcements.

**Manager (`/manage`)**
- `/manage` — dashboard: occupancy %, monthly revenue, outstanding + overdue, open tickets;
  6-month revenue bar chart (billed vs collected) + room-status donut (recharts); overdue and
  pending-application lists.
- `/manage/rooms` — full CRUD (add/edit/delete + status change) with validation & confirm.
- `/manage/tenants` — searchable list + detail (contact, lease, balance, bill history).
- `/manage/billing` — per-month bill generation from **rent + metered water/electric**, summary
  stats, status filter, mark-paid → receipt, overdue highlighting.
- `/manage/maintenance` — queue with assign (technician) / start / resolve (with note).
- `/manage/applications` — review → **approve** (creates a tenant + occupies the room) / reject.

## Key flows

- **Billing:** `total = rent + water(units×18) + electric(units×8) + ค่าส่วนกลาง`. Meter
  readings drive utility units; `generateBills(month)` creates bills only for occupied rooms
  that don't yet have one, synthesising a meter reading from the previous month when needed.
  Overdue is recomputed against today on hydration.
- **Application approval:** `approveApplication(id)` builds a `Tenant` from the application,
  sets the requested room to `occupied`, links `tenantId`, marks the application approved — all
  in one store transaction, reflected immediately across dashboard/rooms/tenants.

## Store design (zustand + persist → localStorage)

- `useDorm` (`dorm-data`) — the domain store: `rooms, tenants, bills, meters, maintenance,
  applications, announcements` + all mutations (room CRUD, `generateBills`, `markBillPaid`,
  `recomputeOverdue`, ticket assign/resolve, `approveApplication`, announcements). Persists so
  every mutation survives reload.
- `useSession` (`dorm-session`) — `role` + `currentTenantId`.
- `useUI` (`dorm-ui`) — `theme` (persisted) + transient toast queue.
- `useHydrated()` — gates store-driven UI behind skeletons until rehydration and runs the
  overdue recomputation once.

Seed data (`lib/data/seed.ts`): 24 rooms across 6 floors (เดี่ยว/คู่/สตูดิโอ), 14 Thai tenants,
3 months of meter readings + bills (with deliberate overdue cases), 5 maintenance tickets,
3 applications, 4 announcements — generated deterministically.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (passes clean)
npm run start
```

> Demo only — no real payments or uploads. Room photos come from picsum.photos.
