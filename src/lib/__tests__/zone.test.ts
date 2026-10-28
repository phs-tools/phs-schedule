import { describe, expect, it } from "vitest";
import { Settings } from "luxon";

describe("zone", () => {
  it("sets default zone to America/Los_Angeles", async () => {
    await import("../zone");
    const zone: any = Settings.defaultZone;
    expect(zone?.zoneName || zone).toBe("America/Los_Angeles");
  });
});
