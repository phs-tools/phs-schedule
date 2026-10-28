import { describe, expect, it, vi } from "vitest";
vi.mock("@/env", () => ({ env: { RESEND_KEY: "test" } }));
vi.mock("resend", () => ({ Resend: vi.fn(() => ({})) }));
describe("resend", () => {
  it("loads", async () => {
    const m = await import("../resend");
    expect(m.resend).toBeDefined();
  });
});
