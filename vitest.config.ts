import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environment: "node",
		mockReset: true,
		setupFiles: ["./vitest.setup.ts"],
		// CARET MODIFICATION: Enable caret-src/__tests__/ to run unit tests for Caret-specific features
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/cypress/**",
			"**/.{idea,git,cache,output,temp}/**",
			"**/slexn-codecenter/**/*.test.js",
			"**/caret-scripts/**/*.test.js",
			"**/webview-ui/src/**/*.spec.tsx",
			"**/webview-ui/src/**/*integration.test.tsx",
		],
		deps: {
			// CARET MODIFICATION: Removed external vscode dependency as it is now fully mocked in tests
		},
	},
})
