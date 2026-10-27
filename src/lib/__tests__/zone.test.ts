import { describe, expect, it } from "vitest";
import { Settings } from "luxon";

describe("zone", () => {
  it("sets default zone to America/Los_Angeles", async () => {
    await import("../zone");
    expect(Settings.defaultZone?.zoneName || Settings.defaultZone).toBe(
      "America/Los_Angeles",
    );
  });
});
