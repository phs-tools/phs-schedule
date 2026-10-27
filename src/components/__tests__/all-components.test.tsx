import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock dependencies
vi.mock("@/lib/now", () => ({
  getNow: vi.fn(() => ({ toFormat: () => "2026-08-17" })),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/day/2026-08-17",
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/contact-actions", () => ({
  submitFeedback: vi.fn(async () => ({ success: true })),
  submitProblem: vi.fn(async () => ({ success: true })),
}));

global.fetch = vi.fn();

describe("All components load", () => {
  it("AnimatedSchedule loads", async () => {
    const { AnimatedSchedule } = await import("../AnimatedSchedule");
    expect(AnimatedSchedule).toBeDefined();
  });

  it("DatePickerMenu loads", async () => {
    const { DatePickerMenu } = await import("../DatePickerMenu");
    expect(DatePickerMenu).toBeDefined();
  });

  it("DayLink loads", async () => {
    const { DayLink } = await import("../DayLink");
    expect(DayLink).toBeDefined();
  });

  it("DayNav loads", async () => {
    const { DayNav } = await import("../DayNav");
    expect(DayNav).toBeDefined();
  });

  it("InfoMenu loads", async () => {
    const mod = await import("../InfoMenu");
    expect(mod.default || mod.InfoMenu).toBeDefined();
  });

  it("PeriodBlock loads", async () => {
    const { PeriodBlock } = await import("../PeriodBlock");
    expect(PeriodBlock).toBeDefined();
  });

  it("PrefetchAdjacent loads", async () => {
    const { PrefetchAdjacent } = await import("../PrefetchAdjacent");
    expect(PrefetchAdjacent).toBeDefined();
  });

  it("WeekNav loads", async () => {
    const { WeekNav } = await import("../WeekNav");
    expect(WeekNav).toBeDefined();
  });

  it("about-dialog loads", async () => {
    const mod = await import("../about-dialog");
    expect(mod.AboutDialog || mod.default).toBeDefined();
  });

  it("calendary-sync-dialog loads", async () => {
    const mod = await import("../calendary-sync-dialog");
    expect(mod.CalendarSyncDialog || mod.default).toBeDefined();
  });

  it("feedback-form loads", async () => {
    const mod = await import("../feedback-form");
    expect(mod.FeedbackForm).toBeDefined();
  });

  it("problem-form loads", async () => {
    const mod = await import("../problem-form");
    expect(mod.ProblemForm).toBeDefined();
  });

  it("theme-toggle loads", async () => {
    const ThemeToggle = await import("../theme-toggle");
    expect(ThemeToggle.ThemeToggle).toBeDefined();
  });
});
