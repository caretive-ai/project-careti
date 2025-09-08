import react from "@vitejs/plugin-react"
import path from "path"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	resolve: {
		alias: {
			"@shared": path.resolve(__dirname, "../src/shared"),
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
		// you might want to disable it, if you don't have tests that rely on CSS
		// since parsing CSS is slow
		css: true,
		include: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}", "src/**/*.e2e.test.{ts,tsx}"],
	},
})
