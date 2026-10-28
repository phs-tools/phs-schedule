import { describe, expect, it } from "vitest";
import { cn } from "../utils";

describe("utils", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe(
      "text-sm font-bold",
    );
  });

  it("merges tailwind conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("handles arrays and objects", () => {
    expect(cn(["flex", "gap-2"], { "items-center": true })).toBe(
      "flex gap-2 items-center",
    );
  });
});
