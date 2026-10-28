import { describe, expect, it } from "vitest";
import {
  mondayPeriods,
  oddPeriods,
  evenPeriods,
  emptyDay,
  defaultSchedule,
} from "../schedule-templates";

describe("schedule-templates", () => {
  it("mondayPeriods has correct structure", () => {
    expect(mondayPeriods.length).toBeGreaterThan(0);
    const instructional = mondayPeriods.filter(
      (p) => p.type === "instructional",
    );
    expect(instructional.length).toBe(7);
    const breaks = mondayPeriods.filter((p) => p.type === "break");
    expect(breaks.length).toBe(2);
  });

  it("oddPeriods has correct structure", () => {
    expect(oddPeriods.length).toBeGreaterThan(0);
    const instructional = oddPeriods.filter((p) => p.type === "instructional");
    expect(instructional.length).toBe(4);
  });

  it("evenPeriods has correct structure", () => {
    expect(evenPeriods.length).toBeGreaterThan(0);
    const instructional = evenPeriods.filter((p) => p.type === "instructional");
    expect(instructional.length).toBe(3);
    const academy = evenPeriods.filter((p) => p.type === "homeroom");
    expect(academy.length).toBe(1);
  });

  it("emptyDay has no periods", () => {
    expect(emptyDay.periods).toEqual([]);
  });

  it("defaultSchedule maps weekdays correctly", () => {
    expect(defaultSchedule[1]).toEqual({ periods: mondayPeriods });
    expect(defaultSchedule[2]).toEqual({ periods: oddPeriods });
    expect(defaultSchedule[3]).toEqual({ periods: evenPeriods });
    expect(defaultSchedule[4]).toEqual({ periods: oddPeriods });
    expect(defaultSchedule[5]).toEqual({ periods: evenPeriods });
    expect(defaultSchedule[6]).toEqual(emptyDay);
    expect(defaultSchedule[7]).toEqual(emptyDay);
  });
});
