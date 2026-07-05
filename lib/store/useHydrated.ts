"use client";

import { useEffect, useState } from "react";
import { useDorm } from "./useDorm";

/**
 * Returns true once the persisted zustand store has rehydrated on the client.
 * Also runs the overdue recomputation once, so bill statuses reflect "today".
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  const recomputeOverdue = useDorm((s) => s.recomputeOverdue);

  useEffect(() => {
    // persist may already be hydrated by the time this runs
    const unsub = useDorm.persist.onFinishHydration(() => {
      recomputeOverdue();
      setHydrated(true);
    });
    if (useDorm.persist.hasHydrated()) {
      recomputeOverdue();
      setHydrated(true);
    }
    return unsub;
  }, [recomputeOverdue]);

  return hydrated;
}
