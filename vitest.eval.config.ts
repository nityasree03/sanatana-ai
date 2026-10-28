import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Evaluations are slower and write result files, so they run separately from unit tests.
// Variables from .env.local (e.g. GEMINI_API_KEY) are loaded so `npm run eval:chat` works locally.
export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["evaluation/**/*.eval.ts"],
    env: loadEnv(mode, process.cwd(), ""),
  },
}));
