import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vitest/config"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	define: {
		// CARET MODIFICATION: Vitest 환경에서 compile-time 플랫폼 상수를 제공
		__PLATFORM__: JSON.stringify(process.env.PLATFORM || "vscode"),
	},
	resolve: {
		alias: {
			"@shared": path.resolve(__dirname, "../src/shared"),
			"@": path.resolve(__dirname, "src"),
			"@caret": path.resolve(__dirname, "src/caret"),
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
