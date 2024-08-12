import { defineConfig } from "@theprodev/tsup-config";

export default defineConfig({
  entry: ["src/index.ts"],
  libOptions: {
    startYear: 2024,
  },
  publicDir: "redis",
  outDir: "dist",
  sourcemap: true,
});
