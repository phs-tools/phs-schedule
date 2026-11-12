"use client";

import { getNow } from "@/lib/now";
import { SCHOOL_ZONE } from "@/lib/zone";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

/**
 * A ticking clock for client views. When the server passes its render time,
 * the first client render uses the same instant, so hydration matches and the
 * countdown isn't blank for a frame.
 */
export function useNow(
  intervalMs = 1000,
  initialNow?: string,
): DateTime | null {
  const [now, setNow] = useState<DateTime | null>(() => {
    if (!initialNow) return null;
    const parsed = DateTime.fromISO(initialNow);
    return parsed.isValid ? parsed.setZone(SCHOOL_ZONE) : null;
  });

  useEffect(() => {
    const tick = () => setNow(getNow().setZone(SCHOOL_ZONE));

    tick();
    const interval = setInterval(tick, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return now;
}
