import { defineConfig, type UserConfig } from "vitest/config"
import path from "path"

export default defineConfig(async (): Promise<UserConfig> => {
	const tsconfigPaths = (await import("vite-tsconfig-paths")).default
	return {
		plugins: [tsconfigPaths()],
		test: {
			environment: "node",
			globals: true,
			// VSCode 모듈 모킹
			setupFiles: ["./vitest.setup.ts"],
			include: [
				"caret-src/**/*.test.ts",
				"caret-src/__tests__/**/*.test.ts", // CARET MODIFICATION: Add caret-src/__tests__ to include path
				// CARET MODIFICATION: caret-docs 테스트는 별도 실행 (test:all에서 제외)
				// "caret-docs/reports/experiment/**/*.test.js",
			],
			exclude: [
				// 기본 제외 패턴
				"**/node_modules/**",
				"**/dist/**",
				"**/cypress/**",
				"**/.{idea,git,cache,output,temp}/**",
				"**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
				// Cline 원본 테스트 제외
				"src/**/*",
				// 문제가 되는 특정 테스트 파일만 제외
				"caret-src/core/webview/__tests__/CaretProvider.test.ts", // @core/storage/state 모듈 에러
				"caret-src/__tests__/extension.test.ts", // 동일한 이유로 모듈 에러 발생
				"caret-src/__tests__/extension-file-watcher.test.ts", // 동일한 이유로 모듈 에러 발생
				"caret-src/__tests__/caret-system-prompt.test.ts", // 복잡한 종속성으로 인한 임시 제외
			],
			coverage: {
				provider: "v8",
				include: ["caret-src/**/*.ts", "!caret-src/**/*.test.ts", "!caret-src/**/*.d.ts"],
				reportOnFailure: true,
				reporter: ["text", "json", "html"],
			},
			logHeapUsage: false,
			silent: false,
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
				"@caret": path.resolve(__dirname, "./caret-src"),
				"@src": path.resolve(__dirname, "./src"),
				"@core": path.resolve(__dirname, "./src/core"),
				"@shared": path.resolve(__dirname, "./src/shared"),
				"@utils": path.resolve(__dirname, "./src/utils"),
				"@packages": path.resolve(__dirname, "./src/packages"),
				"@services": path.resolve(__dirname, "./src/services"),
				"@api": path.resolve(__dirname, "./src/api"),
				"@integrations": path.resolve(__dirname, "./src/integrations"),
				"@hosts": path.resolve(__dirname, "./src/hosts"), // CARET MODIFICATION: Add @hosts alias for host-bridge-client
				"@generated": path.resolve(__dirname, "./src/generated"), // CARET MODIFICATION: Add @generated alias for nice-grpc
			},
		},
	}
})
