"use client";

import type { PortablePeriod } from "@/lib/schedule";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";

type ScheduleData = {
  date: string;
  periods: PortablePeriod[];
  message?: string;
};

type EffectiveSchedule = ScheduleData & {
  loading: boolean;
};

const cache = new Map<string, ScheduleData>();

/**
 * Keeps the displayed schedule in sync with the effective clock. The server
 * renders today's schedule, but the client clock can be overridden through
 * localStorage. When the override lands on another day, fetch that day's
 * schedule so the header, periods, and progress bars all agree.
 */
export function useEffectiveSchedule({
  date,
  periods,
  message,
  now,
}: {
  date: string;
  periods: PortablePeriod[];
  message?: string;
  now: DateTime | null;
}): EffectiveSchedule {
  const [, setVersion] = useState(0);
  const requested = useRef(new Set<string>());
  const nowDate = now?.toFormat("yyyy-LL-dd");
  const effectiveDate = nowDate ?? date;

  useEffect(() => {
    const requestedDates = requested.current;
    if (!nowDate || nowDate === date) return;
    if (cache.has(nowDate) || requestedDates.has(nowDate)) return;

    requestedDates.add(nowDate);
    const controller = new AbortController();

    fetch(`/api/schedule?date=${nowDate}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return (await response.json()) as ScheduleData;
      })
      .then((data) => {
        cache.set(data.date, data);
        setVersion((version) => version + 1);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name === "AbortError") return;

        cache.set(nowDate, {
          date: nowDate,
          periods: [],
          message: "Could not load schedule",
        });
        setVersion((version) => version + 1);
      });

    return () => {
      controller.abort();
      requestedDates.delete(nowDate);
    };
  }, [nowDate, date]);

  if (effectiveDate === date) {
    return { date, periods, message, loading: false };
  }

  const cached = cache.get(effectiveDate);
  if (cached) {
    return { ...cached, loading: false };
  }

  return { date: effectiveDate, periods: [], loading: true };
}
