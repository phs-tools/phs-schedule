import { describe, expect, it, beforeEach, vi } from "vitest";
import { DateTime } from "luxon";
import { getNow } from "../now";

describe("getNow", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  it("returns current time if no override", () => {
    const now = getNow();
    expect(now).toBeInstanceOf(DateTime);
    expect(now.isValid).toBe(true);
  });

  it("returns parsed override from localStorage when valid", () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("phs-schedule-time", "10:15");
    const now = getNow();
    expect(now.hour).toBe(10);
    expect(now.minute).toBe(15);
  });

  it("returns parsed full ISO override", () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("phs-schedule-time", "2026-12-01T08:45:00");
    const now = getNow();
    expect(now.year).toBe(2026);
    expect(now.month).toBe(12);
    expect(now.day).toBe(1);
    expect(now.hour).toBe(8);
    expect(now.minute).toBe(45);
  });

  it("returns current time if override is invalid", () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("phs-schedule-time", "not-a-date");
    const now = getNow();
    expect(now.isValid).toBe(true);
  });
});
