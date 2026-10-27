import { describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@/lib/resend", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(
    () =>
      new Map([
        ["user-agent", "test"],
        ["x-forwarded-for", "127.0.0.1"],
      ]),
  ),
}));

describe("contact-actions", () => {
  it("module loads without errors", async () => {
    const module = await import("../contact-actions");
    expect(module).toBeDefined();
  });
});
