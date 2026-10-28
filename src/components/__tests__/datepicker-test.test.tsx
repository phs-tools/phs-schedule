import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { DatePickerMenu } from "../DatePickerMenu";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/day/2026-08-17",
}));
vi.mock("@/lib/now", () => ({
  getNow: vi.fn(() => require("luxon").DateTime.fromISO("2026-08-17T08:30:00")),
}));

describe("DatePickerMenu", () => {
  it("renders", () => {
    render(
      <DatePickerMenu
        label="Go to date"
        defaultValue="2026-08-17"
        onSelect={vi.fn()}
      />,
    );
  });
});
