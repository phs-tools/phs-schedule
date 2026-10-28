import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

global.ResizeObserver =
  global.ResizeObserver ||
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

if (typeof global.requestAnimationFrame === "undefined") {
  global.requestAnimationFrame = (cb: any) => setTimeout(cb, 0) as any;
  global.cancelAnimationFrame = (id: any) => clearTimeout(id);
}

afterEach(() => {
  cleanup();
});
