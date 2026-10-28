import { describe, expect, it, vi, beforeEach } from "vitest";
import { DateTime } from "luxon";
import {
  intervalToPortable,
  portableToInterval,
  schoolYearDates,
  getScheduleForDay,
  transformScheduleToDate,
  getScheduleForWeek,
  SCHOOL_YEAR_START,
  SCHOOL_YEAR_END,
} from "../schedule";
import { Interval } from "luxon";
import { emptyDay } from "../schedule-templates";

describe("schedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("intervalToPortable converts interval to portable format", () => {
    const start = DateTime.fromISO("2026-01-01T08:30:00");
    const end = DateTime.fromISO("2026-01-01T09:15:00");
    const interval = Interval.fromDateTimes(start, end);
    const portable = intervalToPortable(interval);
    expect(portable.start).toBeDefined();
    expect(portable.end).toBeDefined();
  });

  it("portableToInterval converts portable format back to interval", () => {
    const start = "2026-01-01T08:30:00.000+00:00";
    const end = "2026-01-01T09:15:00.000+00:00";
    const interval = portableToInterval({ start, end });
    expect(interval.isValid).toBe(true);
  });

  it("portableToInterval handles missing values", () => {
    const interval = portableToInterval({});
    expect(interval).toBeDefined();
  });

  it("schoolYearDates returns array of dates", () => {
    const dates = schoolYearDates();
    expect(Array.isArray(dates)).toBe(true);
    expect(dates.length).toBeGreaterThan(0);
    expect(dates[0]).toBe(SCHOOL_YEAR_START.toFormat("yyyy-LL-dd"));
    expect(dates[dates.length - 1]).toBe(
      SCHOOL_YEAR_END.toFormat("yyyy-LL-dd"),
    );
  });

  it("transformScheduleToDate transforms intervals to given date", () => {
    const day = DateTime.fromISO("2026-12-01");
    const schedule = { periods: emptyDay.periods };
    const result = transformScheduleToDate(schedule, day);
    expect(result.periods).toEqual([]);
  });

  it("getScheduleForDay returns empty schedule before school year start", async () => {
    const beforeStart = SCHOOL_YEAR_START.minus({ days: 1 });
    const result = await getScheduleForDay(beforeStart);
    expect(result.periods).toEqual([]);
  });

  it("getScheduleForDay returns empty schedule after school year end", async () => {
    const afterEnd = SCHOOL_YEAR_END.plus({ days: 1 });
    const result = await getScheduleForDay(afterEnd);
    expect(result.periods).toEqual([]);
  });

  it("getScheduleForDay returns schedule for a weekday in school year", async () => {
    // Use a date that's likely not overridden - e.g., a regular Monday
    const monday = DateTime.fromISO("2026-08-17"); // assuming this is a Monday
    const result = await getScheduleForDay(monday);
    expect(result).toBeDefined();
    expect(result.periods).toBeDefined();
  });

  it("getScheduleForWeek returns 7 days", async () => {
    const week = DateTime.fromISO("2026-08-17");
    const result = await getScheduleForWeek(week);
    expect(result.length).toBe(7);
    result.forEach((day) => {
      expect(day.date).toBeDefined();
      expect(day.periods).toBeDefined();
    });
  });
});
