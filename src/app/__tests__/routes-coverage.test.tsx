import { describe, expect, it, vi } from "vitest";

// Mock everything to avoid side effects
vi.mock("@/lib/schedule", () => ({
  getScheduleForDay: vi.fn(async () => ({ periods: [] })),
  getScheduleForWeek: vi.fn(async () => []),
  schoolYearDates: vi.fn(() => ["2026-08-17"]),
  SCHOOL_YEAR_START: {
    plus: vi.fn(() => ({ toFormat: () => "2026-08-17" })),
    diff: vi.fn(() => ({ days: 0 })),
  },
  SCHOOL_YEAR_END: { plus: vi.fn(), diff: vi.fn(() => ({ days: 0 })) },
}));

vi.mock("@/components/DayNav", () => ({ DayNav: () => null }));
vi.mock("@/components/PeriodBlock", () => ({ PeriodBlock: () => null }));
vi.mock("@/components/PrefetchAdjacent", () => ({
  PrefetchAdjacent: () => null,
}));
vi.mock("@/components/WeekNav", () => ({ WeekNav: () => null }));
vi.mock("@/components/AnimatedSchedule", () => ({
  AnimatedSchedule: () => null,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/day",
}));

describe("routes coverage", () => {
  it("imports day page", async () => {
    const m = await import("../day/page");
    expect(m.default).toBeDefined();
  });
  it("imports week page", async () => {
    const m = await import("../week/page");
    expect(m.default).toBeDefined();
  });
});
