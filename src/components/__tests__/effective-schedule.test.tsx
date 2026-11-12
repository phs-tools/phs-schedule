import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DateTime } from "luxon";
import type { PortablePeriod } from "@/lib/schedule";
import { ProgressView } from "../ProgressView";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mocks = vi.hoisted(() => ({
  getNow: vi.fn(),
}));

vi.mock("@/lib/now", () => ({
  getNow: mocks.getNow,
}));

const fetchedPeriods: PortablePeriod[] = [
  {
    id: "period-1",
    type: "instructional",
    name: "1st Period",
    interval: {
      start: "2026-12-01T08:30:00.000-08:00",
      end: "2026-12-01T09:15:00.000-08:00",
    },
  },
];

describe("useEffectiveSchedule", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mocks.getNow.mockReset();
  });

  it("loads the schedule for the overridden date", async () => {
    mocks.getNow.mockReturnValue(
      DateTime.fromISO("2026-12-01T10:00:00.000-08:00"),
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        date: "2026-12-01",
        periods: fetchedPeriods,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ProgressView
        periods={[]}
        date="2026-11-11"
        message="Veterans Day"
        initialNow="2026-11-11T10:00:00.000-08:00"
      />,
    );

    expect(await screen.findByText(/Tuesday, December 1/)).toBeTruthy();
    expect(await screen.findByText("1st Period")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/schedule?date=2026-12-01",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
