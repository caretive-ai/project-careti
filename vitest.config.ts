import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environment: "node",
		mockReset: true,
		setupFiles: ["./vitest.setup.ts"],
	},
})
