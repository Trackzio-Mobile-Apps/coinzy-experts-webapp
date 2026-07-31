import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: false,
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/expert/**/*.ts"],
      exclude: [
        "src/lib/expert/**/*.test.ts",
        "src/lib/expert/reportMapStore.server.ts",
        "src/lib/expert/evaluationReportExport.ts",
        "src/lib/expert/apiClient.ts",
        "src/lib/expert/useExpertQueuePolling.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
