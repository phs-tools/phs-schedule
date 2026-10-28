import { describe, expect, it, vi } from "vitest";
import { onSubmitFeedback, onReportProblem } from "../contact-actions";

vi.mock("@/env", () => ({ env: { NOTIFICATION_EMAIL: "test@test.com" } }));
vi.mock("@/lib/resend", () => ({
  resend: {
    emails: {
      send: vi.fn(async () => ({ data: {}, error: null })),
    },
  },
}));
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Map([["user-agent", "test"]]) as any),
}));

describe("contact actions full", () => {
  it("submits feedback", async () => {
    await onSubmitFeedback({
      email: "test@test.com",
      message: "hi",
    } as any);
  });
  it("submits problem", async () => {
    await onReportProblem({
      email: "test@test.com",
      description: "bug",
    } as any);
  });
});
