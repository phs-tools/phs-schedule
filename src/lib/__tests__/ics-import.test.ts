import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("ical.js", () => ({
  default: {
    parse: vi.fn(),
    Component: vi.fn(),
    Event: vi.fn(),
  },
}));

vi.mock("crypto", () => ({
  default: {
    createHash: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn(() => "mockhash"),
    })),
  },
}));

global.fetch = vi.fn();

describe("ics-import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("module loads without errors", async () => {
    const mod = await import("../ics-import");
    expect(mod).toBeDefined();
    expect(typeof mod.generateDayOverrides).toBe("function");
    expect(typeof mod.getFoodMenus).toBe("function");
  });
});
