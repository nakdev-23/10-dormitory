"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/lib/types";

interface SessionState {
  role: Role;
  /** The tenant currently "logged in" to the portal. */
  currentTenantId: string;
  setRole: (r: Role) => void;
  setCurrentTenant: (id: string) => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      role: "tenant",
      currentTenantId: "tenant-1",
      setRole: (role) => set({ role }),
      setCurrentTenant: (currentTenantId) => set({ currentTenantId }),
    }),
    { name: "dorm-session" },
  ),
);
