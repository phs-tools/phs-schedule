import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock dependencies
vi.mock("@/lib/schedule", () => ({
  getScheduleForDay: vi.fn(async () => ({ periods: [], message: undefined })),
  getScheduleForWeek: vi.fn(async () => []),
  schoolYearDates: vi.fn(() => ["2026-08-17"]),
}));
vi.mock("@/lib/resend", () => ({ resend: {} }));
vi.mock("@/env", () => ({ env: {} }));

vi.mock("@/components/DayNav", () => ({ DayNav: () => <div>DayNav</div> }));
vi.mock("@/components/PeriodBlock", () => ({
  PeriodBlock: () => <div>PeriodBlock</div>,
}));
vi.mock("@/components/PrefetchAdjacent", () => ({
  PrefetchAdjacent: () => <div>Prefetch</div>,
}));
vi.mock("@/components/WeekNav", () => ({ WeekNav: () => <div>WeekNav</div> }));
vi.mock("@/components/AnimatedSchedule", () => ({
  AnimatedSchedule: () => <div>AnimatedSchedule</div>,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/day/2026-08-17",
}));

describe("App pages", () => {
  it("day page module loads", async () => {
    const module = await import("../day/page");
    expect(module).toBeDefined();
  });

  it("day [date] page module loads", async () => {
    const module = await import("../day/[date]/page");
    expect(module).toBeDefined();
    expect(typeof module.generateStaticParams).toBe("function");
    expect(typeof module.default).toBe("function");
  });

  it("week page module loads", async () => {
    const module = await import("../week/page");
    expect(module).toBeDefined();
  });

  it("week [date] page module loads", async () => {
    const module = await import("../week/[date]/page");
    expect(module).toBeDefined();
    expect(typeof module.generateStaticParams).toBe("function");
    expect(typeof module.default).toBe("function");
  });
});
