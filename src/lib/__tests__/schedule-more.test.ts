import { describe, expect, it, vi, beforeEach } from "vitest";
import { DateTime } from "luxon";
import { getScheduleForDay, getScheduleForWeek } from "../schedule";
import * as ics from "../ics-import";

vi.mock("../ics-import", () => ({
  generateDayOverrides: vi.fn(async () => ({})),
  getFoodMenus: vi.fn(async () => ({})),
}));

describe("schedule more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses default schedule for weekday", async () => {
    const result = await getScheduleForDay(DateTime.fromISO("2026-08-18")); // Tuesday
    expect(result.periods.length).toBeGreaterThan(0);
  });

  it("uses empty day for weekend", async () => {
    const result = await getScheduleForDay(DateTime.fromISO("2026-08-22")); // Saturday
    expect(result.periods).toEqual([]);
  });
});
