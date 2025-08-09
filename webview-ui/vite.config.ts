/// <reference types="vitest/config" />

import { defineConfig, type ViteDevServer } from "vite"
import react from "@vitejs/plugin-react-swc"
import tailwindcssPlugin from "@tailwindcss/vite"
import { resolve } from "path"
import { writeFileSync } from "node:fs"

// Custom plugin to write the server port to a file
function writePortToFile() {
	return {
		name: "write-port-to-file",
		configureServer(server: ViteDevServer) {
			server.httpServer?.on("listening", () => {
				const address = server.httpServer?.address()
				if (address && typeof address === "object" && address.port) {
					console.log(`Dev server listening on port: ${address.port}`)
					writeFileSync(".vite-port", address.port.toString())
				}
			})
		},
	}
}

export default defineConfig(({ mode }) => {
	console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
	console.log("CURRENT VITE MODE DETECTED:", mode)
	console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

	return {
		base: "./", // CARET MODIFICATION: Use relative paths for assets in webview
		plugins: [react(), tailwindcssPlugin(), writePortToFile()],
		test: {
			environment: "jsdom",
			setupFiles: ["./src/setupTests.ts"],
			include: ["src/caret/**/*.test.{ts,tsx}"],
			coverage: {
				provider: "v8",
				reporter: ["text", "json", "html", "lcov"],
				reportsDirectory: "./coverage/caret-frontend",
				include: ["src/caret/**/*.{ts,tsx}"],
				exclude: ["src/caret/**/*.test.{ts,tsx}", "src/caret/**/*.d.ts", "src/caret/test-utils"],
				all: true,
			},
			globals: true,
		},
		build: {
			outDir: "build",
			reportCompressedSize: false,
			sourcemap: mode === "development", // Ensure sourcemap is set based on mode
			rollupOptions: {
				output: {
					entryFileNames: "assets/[name].js",
					chunkFileNames: "assets/[name].js",
					assetFileNames: (assetInfo) => {
						if (assetInfo.name && assetInfo.name.endsWith(".css")) {
							return "assets/[name][extname]"
						}
						return "assets/[name][extname]"
					},
				},
			},
			chunkSizeWarningLimit: 100000,
		},
		server: {
			port: 5173, // CARET MODIFICATION: Set port to 5173
			strictPort: true, // CARET MODIFICATION: Ensure port is strictly 5173
			hmr: {
				host: "localhost",
				protocol: "ws",
			},
			fs: {
				// CARET MODIFICATION: Reverted to original working fs config
				strict: false,
				allow: ["."],
			},
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
				"Access-Control-Allow-Headers": "*",
			},
		},
		define: {
			"process.env": {
				// CARET MODIFICATION: Ensure correct define structure for IS_DEV
				NODE_ENV: JSON.stringify(mode),
				IS_DEV: JSON.stringify(mode === "development"),
				IS_TEST: JSON.stringify(process.env.IS_TEST),
			},
		},
		resolve: {
			alias: {
				"@": resolve(__dirname, "./src"),
				"@assets": resolve(__dirname, "./src/assets"),
				"@components": resolve(__dirname, "./src/components"),
				"@context": resolve(__dirname, "./src/context"),
				"@hooks": resolve(__dirname, "./src/hooks"),
				"@pages": resolve(__dirname, "./src/pages"),
				"@services": resolve(__dirname, "./src/services"),
				"@styles": resolve(__dirname, "./src/styles"),
				"@utils": resolve(__dirname, "./src/utils"),
				"@caret": resolve(__dirname, "./src/caret"),
				"@vscode-schemas": resolve(__dirname, "../src/vscode-schemas"),
				"@common": resolve(__dirname, "../src/common"),
				"@globals": resolve(__dirname, "../src/globals"),
				"@shared": resolve(__dirname, "../src/shared"),
				// CARET MODIFICATION: caret-assets 디렉토리 별칭 추가
				"@caretAssets": resolve(__dirname, "../caret-assets"),
			},
		},
	}
})
