import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      all: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/**/__tests__/**",
        "src/app/**/page.tsx",
        "src/app/ical.ics/route.ts",
        "src/components/**",
        "src/lib/**",
        "!src/lib/__tests__/**",
        "!src/lib/utils.ts",
        "!src/lib/now.ts",
        "!src/lib/zone.ts",
        "!src/lib/schedule-helpers.ts",
        "!src/lib/schedule-templates.ts",
        "!src/lib/schedule.ts",
        "!src/lib/day-overrides.ts",
        "!src/lib/ics-import.ts",
        "!src/lib/contact-actions.ts",
        "src/app/layout.tsx",
        "src/env.ts",
        "src/proxy.ts",
      ],
      thresholds: {
        lines: 0,
        branches: 0,
        functions: 0,
        statements: 0,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
