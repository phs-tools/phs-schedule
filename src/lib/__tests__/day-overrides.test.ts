import { describe, expect, it } from "vitest";
import { messageOverrides } from "../day-overrides";

describe("day-overrides", () => {
  it("messageOverrides contains expected entries", () => {
    expect(messageOverrides["2026-09-07"]).toBe("Labor Day");
    expect(messageOverrides["2026-11-11"]).toBe("Veterans Day");
    expect(messageOverrides["2027-01-18"]).toBe("MLK Day");
    expect(messageOverrides["2027-05-31"]).toBe("Memorial Day");
  });

  it("messageOverrides has entries for holidays", () => {
    const holidays = Object.entries(messageOverrides).filter(([_, msg]) =>
      /day|break|holiday/i.test(msg),
    );
    expect(holidays.length).toBeGreaterThan(0);
  });

  it("all keys are valid date format", () => {
    Object.keys(messageOverrides).forEach((key) => {
      expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
