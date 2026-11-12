import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import type { PortablePeriod } from "@/lib/schedule";
import {
  buildCountdownEvents,
  buildPeriodProgress,
  buildProgressBars,
  formatDurationShort,
  getCountdownParts,
  nextCountdownEvent,
  progressBetween,
} from "@/lib/timeline";

const day = "2026-08-10";

function at(time: string): string {
  return `${day}T${time}:00.000-07:00`;
}

const periods: PortablePeriod[] = [
  {
    id: "period-1",
    type: "instructional",
    name: "1st Period",
    interval: { start: at("08:30"), end: at("09:15") },
  },
  {
    type: "passing",
    interval: { start: at("09:15"), end: at("09:25") },
  },
  {
    id: "brunch",
    type: "break",
    name: "Brunch",
    interval: { start: at("09:25"), end: at("09:40") },
  },
  {
    id: "period-2",
    type: "instructional",
    name: "2nd Period",
    interval: { start: at("09:40"), end: at("10:25") },
  },
];

const referenceDay = DateTime.fromISO(day);

describe("countdown events", () => {
  it("includes the school day, periods, breaks, calendar, and semesters", () => {
    const events = buildCountdownEvents(periods, referenceDay);
    const labels = events.map((event) => event.label);

    expect(labels).toContain("Start of school day");
    expect(labels).toContain("End of school day");
    expect(labels).toContain("End of 1st Period");
    expect(labels).toContain("Brunch starts");
    expect(labels).toContain("Brunch ends");
    expect(labels).toContain("End of week");
    expect(labels).toContain("End of month");
    expect(labels).toContain("End of first semester");
    expect(labels).toContain("End of second semester");
  });

  it("sorts events chronologically", () => {
    const events = buildCountdownEvents(periods, referenceDay);
    const times = events.map((event) => event.when.toMillis());

    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("picks the next upcoming event", () => {
    const events = buildCountdownEvents(periods, referenceDay);
    const now = DateTime.fromISO(at("09:00"));
    const next = nextCountdownEvent(events, now);

    expect(next?.label).toBe("End of 1st Period");
  });

  it("falls back to the last event after everything has passed", () => {
    const events = buildCountdownEvents(periods, referenceDay);
    const now = DateTime.fromISO("2027-07-01T00:00:00.000-07:00");
    const next = nextCountdownEvent(events, now);

    expect(next?.label).toBe("End of second semester");
  });
});

describe("countdown formatting", () => {
  it("splits milliseconds into days, hours, minutes, and seconds", () => {
    const ms =
      2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 4 * 60 * 1000 + 5000;

    expect(getCountdownParts(ms)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    });
  });

  it("clamps negative durations to zero", () => {
    expect(getCountdownParts(-1000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("formats short durations", () => {
    expect(formatDurationShort(0)).toBe("<1m");
    expect(formatDurationShort(90 * 60 * 1000)).toBe("1h 30m");
    expect(formatDurationShort(2 * 24 * 60 * 60 * 1000)).toBe("2d 0h");
  });
});

describe("progress", () => {
  const now = DateTime.fromISO(at("09:00"));

  it("clamps progress between 0 and 1", () => {
    const start = DateTime.fromISO(at("08:30"));
    const end = DateTime.fromISO(at("09:15"));

    expect(progressBetween(start.minus({ hours: 1 }), start, end)).toBe(0);
    expect(progressBetween(end.plus({ hours: 1 }), start, end)).toBe(1);
    expect(progressBetween(now, start, end)).toBeCloseTo(30 / 45);
  });

  it("builds one bar per scope", () => {
    const bars = buildProgressBars(periods, now);
    const ids = bars.map((bar) => bar.id);

    expect(ids).toEqual([
      "current-period",
      "school-day",
      "classes-complete",
      "week",
      "month",
      "semester",
      "school-year",
    ]);
  });

  it("reports the current period", () => {
    const bars = buildProgressBars(periods, now);
    const period = bars.find((bar) => bar.id === "current-period");

    expect(period?.detail).toContain("1st Period");
    expect(period?.progress).toBeCloseTo(30 / 45);
  });

  it("builds per-period progress bars", () => {
    const bars = buildPeriodProgress(periods, now);

    expect(bars).toHaveLength(3);
    expect(bars[0].label).toBe("1st Period");
    expect(bars[0].progress).toBeCloseTo(30 / 45);
  });
});
