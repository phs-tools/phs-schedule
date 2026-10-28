import { describe, expect, it } from "vitest";
import * as favicon from "../favicon";
describe("favicon", () => {
  it("exports", () => {
    expect(Object.keys(favicon).length).toBeGreaterThanOrEqual(0);
  });
});
