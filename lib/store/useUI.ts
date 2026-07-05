"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Toast, ToastVariant } from "@/lib/types";
import { makeId } from "@/lib/utils";

type Theme = "light" | "dark";

interface UIState {
  theme: Theme;
  toasts: Toast[];
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  toast: (t: Omit<Toast, "id">) => void;
  notify: (title: string, variant?: ToastVariant, description?: string) => void;
  dismiss: (id: string) => void;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "light",
      toasts: [],
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },
      toast: (t) => {
        const id = makeId("toast");
        set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
        setTimeout(() => get().dismiss(id), 4200);
      },
      notify: (title, variant = "success", description) => {
        get().toast({ title, description, variant });
      },
      dismiss: (id) =>
        set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
    }),
    {
      name: "dorm-ui",
      partialize: (s) => ({ theme: s.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);
