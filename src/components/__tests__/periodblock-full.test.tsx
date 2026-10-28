import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { PeriodBlock } from "../PeriodBlock";

vi.mock("@/lib/now", () => ({
  getNow: vi.fn(() => require("luxon").DateTime.fromISO("2026-08-17T08:30:00")),
}));

describe("PeriodBlock full", () => {
  it("renders instructional", () => {
    const portable = {
      id: "period-1",
      type: "instructional" as const,
      name: "1st Period",
      interval: {
        start: "2026-08-17T08:30:00.000Z",
        end: "2026-08-17T09:15:00.000Z",
      },
    };
    render(<PeriodBlock portablePeriod={portable} />);
  });
  it("renders passing", () => {
    const portable = {
      type: "passing" as const,
      interval: {
        start: "2026-08-17T09:15:00.000Z",
        end: "2026-08-17T09:25:00.000Z",
      },
    };
    render(<PeriodBlock portablePeriod={portable} />);
  });
});
