import { describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@/lib/schedule", () => ({
  getScheduleForDay: vi.fn(async () => ({ periods: [] })),
  SCHOOL_YEAR_START: {
    plus: vi.fn(() => ({ toFormat: () => "2026-01-01" })),
    diff: vi.fn(() => ({ days: 1 })),
  },
  SCHOOL_YEAR_END: { plus: vi.fn(), diff: vi.fn(() => ({ days: 1 })) },
}));

vi.mock("ics", () => ({
  createEvents: vi.fn(() => ({
    error: null,
    value: "BEGIN:VCALENDAR\nEND:VCALENDAR",
  })),
}));

vi.mock("next/server", () => ({
  NextResponse: class NextResponse {
    constructor(body: any, init?: any) {
      this.body = body;
      this.init = init;
    }
    body: any;
    init: any;
    static json(data: any, init?: any) {
      return { json: data, init };
    }
  },
}));

describe("ical route", () => {
  it("module loads without errors", async () => {
    const mod = await import("../ical.ics/route");
    expect(mod).toBeDefined();
    expect(typeof mod.GET).toBe("function");
  });
});
