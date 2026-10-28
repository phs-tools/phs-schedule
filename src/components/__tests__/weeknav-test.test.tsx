import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { WeekNav } from "../WeekNav";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/week/2026-08-17",
}));
vi.mock("@/lib/now", () => ({
  getNow: vi.fn(() => require("luxon").DateTime.fromISO("2026-08-17T08:30:00")),
}));

describe("WeekNav", () => {
  it("renders", () => {
    render(<WeekNav date="2026-08-17" />);
  });
});
