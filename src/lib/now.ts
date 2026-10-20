import { DateTime } from "luxon";

/*
 * Lets you fake "now" from the browser console (Inspect > Console) without any
 * debug UI in the app:
 *
 *   localStorage.setItem("phs-schedule-time", "10:15")           // today at 10:15
 *   localStorage.setItem("phs-schedule-time", "2026-12-01 8:45") // that date
 *   localStorage.removeItem("phs-schedule-time")                 // back to real time
 *
 * The PeriodBlock clock re-reads this every second, so changes show up on the
 * next tick. A bare time is interpreted as today's date.
 */
const TIME_OVERRIDE_KEY = "phs-schedule-time";

export function getNow(): DateTime {
  if (typeof window !== "undefined") {
    const override = window.localStorage.getItem(TIME_OVERRIDE_KEY);
    if (override) {
      const parsed = DateTime.fromISO(override);
      if (parsed.isValid) return parsed;
    }
  }
  return DateTime.now();
}
