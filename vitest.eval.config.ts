import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Evaluations are slower and write result files, so they run separately from unit tests.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: { environment: "node", include: ["evaluation/**/*.eval.ts"] },
});
