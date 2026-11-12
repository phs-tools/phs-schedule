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
  const [schedule, setSchedule] = useState<EffectiveSchedule>(() => ({
    date,
    periods,
    message,
    loading: false,
  }));
  const activeDate = useRef(date);
  const nowDate = now?.toFormat("yyyy-LL-dd");

  useEffect(() => {
    if (!nowDate || nowDate === activeDate.current) return;

    const cached = cache.get(nowDate);
    if (cached) {
      activeDate.current = nowDate;
      setSchedule({ ...cached, loading: false });
      return;
    }

    activeDate.current = nowDate;
    setSchedule({ date: nowDate, periods: [], loading: true });

    const controller = new AbortController();
    fetch(`/api/schedule?date=${nowDate}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return (await response.json()) as ScheduleData;
      })
      .then((data) => {
        cache.set(data.date, data);
        if (activeDate.current !== data.date) return;
        setSchedule({ ...data, loading: false });
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name === "AbortError") return;
        if (activeDate.current !== nowDate) return;

        setSchedule({
          date: nowDate,
          periods: [],
          message: "Could not load schedule",
          loading: false,
        });
      });

    return () => controller.abort();
  }, [nowDate]);

  return schedule;
}
