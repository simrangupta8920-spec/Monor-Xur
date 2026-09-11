// Local persistence for Dynamic Difficulty Adjustment (DDA) shifts and the
// cognitive-stress markers behind them, so caregivers can review them in the
// dashboard. Uses the app storage util (AsyncStorage under the hood) — never
// import AsyncStorage directly.

import { useCallback, useEffect, useState } from "react";

import { storage } from "@/src/utils/storage";
import type { DifficultyAction } from "./difficulty";

const KEY = "patient_dda_logs";
const MAX = 300;

export type StressMarkers = {
  errorCount: number;
  avgLatency: number; // ms
  hesitations: number;
};

export type DDAShift = {
  timestamp: number;
  game: string;
  fromLevel: number;
  toLevel: number;
  action: DifficultyAction;
  markers: StressMarkers;
};

/** Append one DDA shift to the local log. */
export async function logDDAShift(shift: DDAShift): Promise<DDAShift[]> {
  const existing = (await storage.getItem<DDAShift[]>(KEY, [])) ?? [];
  const next = [...existing, shift].slice(-MAX);
  await storage.setItem(KEY, next as any);
  console.log("[dda] shift logged:", shift);
  return next;
}

export async function getDDALogs(): Promise<DDAShift[]> {
  return (await storage.getItem<DDAShift[]>(KEY, [])) ?? [];
}

export async function clearDDALogs(): Promise<void> {
  await storage.removeItem(KEY);
}

/** Reactive read for caregiver dashboards. */
export function useDDALogs() {
  const [logs, setLogs] = useState<DDAShift[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getDDALogs();
    setLogs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { logs, loading, refresh };
}
