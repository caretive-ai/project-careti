import { defineConfig } from "@playwright/test"

const isCI = !!process?.env?.CI
const isWindow = process?.platform?.startsWith("win")

export default defineConfig({
	workers: 1,
	retries: 1,
	forbidOnly: isCI,
	testDir: "src/test/e2e",
	testMatch: /.*\.test\.ts/,
	// CARETI MODIFICATION: Increased timeout for Careti onboarding flow (welcome → API setup → persona → chat)
	timeout: isCI || isWindow ? 60000 : 40000,
	expect: {
		timeout: isCI || isWindow ? 10000 : 5000,
	},
	fullyParallel: true,
	reporter: isCI ? [["github"], ["list"]] : [["list"]],
	use: {
		video: "retain-on-failure",
	},
	projects: [
		{
			name: "setup test environment",
			testMatch: /global\.setup\.ts/,
		},
		{
			name: "e2e tests",
			dependencies: ["setup test environment"],
		},
	],
})
