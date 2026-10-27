import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/day/2026-08-17",
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/contact-actions", () => ({
  submitFeedback: vi.fn(async () => ({ success: true })),
  submitProblem: vi.fn(async () => ({ success: true })),
}));
vi.mock("@/lib/now", () => ({
  getNow: vi.fn(() => require("luxon").DateTime.fromISO("2026-08-17T08:30:00")),
}));
vi.mock("@/components/theme-provider", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
  ThemeProvider: ({ children }: any) => <div>{children}</div>,
}));

global.fetch = vi.fn();

describe("Component rendering", () => {
  it("DayLink renders", async () => {
    const { DayLink } = await import("../DayLink");
    render(<DayLink date="2026-08-17" label="Mon" />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
  });

  it("PrefetchAdjacent renders", async () => {
    const { PrefetchAdjacent } = await import("../PrefetchAdjacent");
    render(<PrefetchAdjacent prev="2026-08-16" next="2026-08-18" />);
    expect(document.querySelector('link[rel="prefetch"]')).toBeDefined();
  });

  it("ThemeToggle renders", async () => {
    const { ThemeToggle } = await import("../theme-toggle");
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
