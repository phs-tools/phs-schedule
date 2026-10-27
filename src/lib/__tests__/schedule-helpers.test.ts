import { describe, expect, it } from "vitest";
import {
  instructionalPeriod,
  finalPeriod,
  academyPeriod,
  DEFAULT_ACADEMY_NAME,
  ACADEMY_HOMEROOM_NAME,
  homeroomPeriod,
  lunchPeriod,
  brunchPeriod,
  passingPeriod,
  vacation,
} from "../schedule-helpers";
import { emptyDay } from "../schedule-templates";

describe("schedule-helpers", () => {
  it("instructionalPeriod creates correct period", () => {
    const p = instructionalPeriod(1, "08:30:00", "09:15:00") as any;
    expect(p.id).toBe("period-1");
    expect(p.type).toBe("instructional");
    expect(p.name).toBe("1st Period");
    expect(p.interval.start?.hour).toBe(8);
    expect(p.interval.end?.hour).toBe(9);
  });

  it("instructionalPeriod formats ordinals correctly", () => {
    expect((instructionalPeriod(1, "08:30:00", "09:15:00") as any).name).toBe("1st Period");
    expect((instructionalPeriod(2, "08:30:00", "09:15:00") as any).name).toBe("2nd Period");
    expect((instructionalPeriod(3, "08:30:00", "09:15:00") as any).name).toBe("3rd Period");
    expect((instructionalPeriod(4, "08:30:00", "09:15:00") as any).name).toBe("4th Period");
    expect((instructionalPeriod(11, "08:30:00", "09:15:00") as any).name).toBe("11st Period");
    expect((instructionalPeriod(12, "08:30:00", "09:15:00") as any).name).toBe("12nd Period");
    expect((instructionalPeriod(13, "08:30:00", "09:15:00") as any).name).toBe("13rd Period");
  });

  it("finalPeriod creates correct period", () => {
    const p = finalPeriod(1, "08:30:00", "10:00:00") as any;
    expect(p.id).toBe("final-1");
    expect(p.type).toBe("instructional");
    expect(p.name).toBe("Final Exam 1");
  });

  it("academyPeriod creates default academy period", () => {
    const p = academyPeriod("10:15:00", "11:00:00") as any;
    expect(p.id).toBe("academy");
    expect(p.type).toBe("homeroom");
    expect(p.name).toBe(DEFAULT_ACADEMY_NAME);
    expect(p.subheading).toBeUndefined();
  });

  it("academyPeriod with custom name and subheading", () => {
    const p = academyPeriod(
      "10:15:00",
      "11:00:00",
      "Academy - Homeroom",
      "Consent",
    ) as any;
    expect(p.name).toBe("Academy - Homeroom");
    expect(p.subheading).toBe("Consent");
  });

  it("homeroomPeriod creates period with transformed id", () => {
    const p = homeroomPeriod("Rally Schedule", "10:15:00", "11:00:00") as any;
    expect(p.id).toBe("rally-schedule");
    expect(p.type).toBe("homeroom");
    expect(p.name).toBe("Rally Schedule");
  });

  it("homeroomPeriod with displayName and subheading", () => {
    const p = homeroomPeriod("Testing", "10:15:00", "11:00:00", {
      displayName: ACADEMY_HOMEROOM_NAME,
      subheading: "STAR Testing",
    }) as any;
    expect(p.name).toBe(ACADEMY_HOMEROOM_NAME);
    expect(p.subheading).toBe("STAR Testing");
  });

  it("lunchPeriod creates break period", () => {
    const p = lunchPeriod("13:05:00", "13:45:00") as any;
    expect(p.id).toBe("lunch");
    expect(p.type).toBe("break");
    expect(p.name).toBe("Lunch");
  });

  it("brunchPeriod creates break period", () => {
    const p = brunchPeriod("10:10:00", "10:25:00") as any;
    expect(p.id).toBe("brunch");
    expect(p.type).toBe("break");
    expect(p.name).toBe("Brunch");
  });

  it("passingPeriod creates passing period with default duration", () => {
    const p = passingPeriod("09:15:00") as any;
    expect(p.type).toBe("passing");
    expect(p.interval.length("minutes")).toBe(10);
  });

  it("passingPeriod creates passing period with custom end", () => {
    const p = passingPeriod("09:15:00", "09:25:00") as any;
    expect(p.interval.length("minutes")).toBe(10);
  });

  it("vacation creates schedules for weekdays in range", () => {
    const result: any = vacation("2026-12-21", "2026-12-25", "Winter Break");
    // Dec 21 2026 is a Monday
    expect(result["2026-12-21"]).toBeDefined();
    expect(result["2026-12-21"].message).toBe("Winter Break");
    expect(result["2026-12-21"].periods).toEqual([]);
    // Should not include weekends
    expect(result["2026-12-26"]).toBeUndefined();
  });
});
