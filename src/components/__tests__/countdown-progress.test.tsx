import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PortablePeriod } from "@/lib/schedule";
import { CountdownView } from "../CountdownView";
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

vi.mock("@/lib/now", async () => {
  const { DateTime } = await import("luxon");
  return {
    getNow: () => DateTime.fromISO("2026-08-10T09:00:00.000-07:00"),
  };
});

const periods: PortablePeriod[] = [
  {
    id: "period-1",
    type: "instructional",
    name: "1st Period",
    interval: {
      start: "2026-08-10T08:30:00.000-07:00",
      end: "2026-08-10T09:15:00.000-07:00",
    },
  },
  {
    id: "brunch",
    type: "break",
    name: "Brunch",
    interval: {
      start: "2026-08-10T09:15:00.000-07:00",
      end: "2026-08-10T09:30:00.000-07:00",
    },
  },
  {
    id: "period-2",
    type: "instructional",
    name: "2nd Period",
    interval: {
      start: "2026-08-10T09:30:00.000-07:00",
      end: "2026-08-10T10:15:00.000-07:00",
    },
  },
];

const initialNow = "2026-08-10T09:00:00.000-07:00";

describe("CountdownView", () => {
  it("renders buttons for each countdown target", () => {
    render(
      <CountdownView
        periods={periods}
        date="2026-08-10"
        initialNow={initialNow}
      />,
    );

    expect(
      screen.getByRole("button", { name: /End of 1st Period/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Brunch starts")).toBeInTheDocument();
    expect(screen.getByText("Brunch ends")).toBeInTheDocument();
    expect(screen.getByText("End of week")).toBeInTheDocument();
    expect(screen.getByText("End of month")).toBeInTheDocument();
    expect(screen.getByText("End of second semester")).toBeInTheDocument();
  });

  it("shows the next event in the big countdown", () => {
    render(
      <CountdownView
        periods={periods}
        date="2026-08-10"
        initialNow={initialNow}
      />,
    );

    expect(screen.getAllByText("End of 1st Period")).toHaveLength(2);
  });

  it("counts down to a manually chosen target", async () => {
    const user = userEvent.setup();

    render(
      <CountdownView
        periods={periods}
        date="2026-08-10"
        initialNow={initialNow}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Set target/ }));
    await user.clear(screen.getByLabelText("Target date"));
    await user.type(screen.getByLabelText("Target date"), "2026-08-12");
    await user.clear(screen.getByLabelText("Target time"));
    await user.type(screen.getByLabelText("Target time"), "15:30");
    await user.click(screen.getByRole("button", { name: "Count down" }));

    expect(
      screen.getByText("Custom target", { selector: "p" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Wednesday, August 12 • 3:30 PM"),
    ).toBeInTheDocument();
  });
});

describe("ProgressView", () => {
  it("renders a bar for each scope", () => {
    render(
      <ProgressView
        periods={periods}
        date="2026-08-10"
        initialNow={initialNow}
      />,
    );

    expect(screen.getByText("Current period")).toBeInTheDocument();
    expect(screen.getByText("School day")).toBeInTheDocument();
    expect(screen.getByText("Classes complete")).toBeInTheDocument();
    expect(screen.getByText("End of week")).toBeInTheDocument();
    expect(screen.getByText("End of month")).toBeInTheDocument();
    expect(screen.getByText("Semester")).toBeInTheDocument();
    expect(screen.getByText("School year")).toBeInTheDocument();
    expect(screen.getByText("Today's periods")).toBeInTheDocument();
  });

  it("renders one mini bar per period", () => {
    render(
      <ProgressView
        periods={periods}
        date="2026-08-10"
        initialNow={initialNow}
      />,
    );

    expect(screen.getByText("1st Period")).toBeInTheDocument();
    expect(screen.getByText("2nd Period")).toBeInTheDocument();
  });
});
