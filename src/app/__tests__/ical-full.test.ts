import { describe, expect, it, vi } from "vitest";
import { GET } from "../ical.ics/route";
import * as schedule from "@/lib/schedule";

vi.mock("@/lib/schedule", () => ({
  getScheduleForDay: vi.fn(async () => ({ periods: [] })),
  SCHOOL_YEAR_START: { diff: vi.fn(() => ({ days: 0 })), plus: vi.fn(() => ({})) },
  SCHOOL_YEAR_END: { diff: vi.fn(() => ({ days: 0 })), plus: vi.fn(() => ({})) },
}));

vi.mock("ics", () => ({
  createEvents: vi.fn(() => ({ error: null, value: "BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n" })),
}));

describe("ical route full", () => {
  it("handles request", async () => {
    const req = new Request("http://localhost/ical.ics?periods=true&one=Math&two=Hist");
    const res = await GET(req);
    expect(res).toBeDefined();
  });
});
