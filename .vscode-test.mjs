import { defineConfig } from "@vscode/test-cli"
import path from "path"

export default defineConfig({
	// CARETI MODIFICATION: vitest 기반 테스트 파일들(ESM 전용 vitest import)은 extension-host
	// mocha가 CJS require로 로드하다 크래시하므로 통합 러너에서 제외 (별도 러너 spec에도 미포함 상태)
	files: "{out/**/*.test.js,src/**/*.test.js,!src/test/e2e/**/*.test.js,!out/src/test/e2e/**/*.test.js,!out/src/integrations/cli-subagents/**,!out/careti-src/core/controller/**,!out/careti-src/shared/**,!out/careti-src/__tests__/**}",
	mocha: {
		ui: "bdd",
		timeout: 20000, // Maximum time (in ms) that a test can run before failing
		/** Set up alias path resolution during tests
		 * @See {@link file://./test-setup.js}
		 */
		require: ["./test-setup.js"],
	},
	workspaceFolder: "test-workspace",
	version: "stable",
	extensionDevelopmentPath: path.resolve("./"),
	launchArgs: ["--disable-extensions"],
})
