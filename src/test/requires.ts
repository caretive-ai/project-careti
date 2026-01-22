const Module = require("module")
const pathModule = require("path")
const originalRequire = Module.prototype.require

// CARETI MODIFICATION: Signal hook runner to use file-capture fallback during tests.
process.env.CARET_TEST_HOOK_FALLBACK = "true"

// CARETI MODIFICATION: stub ESM-only posthog-node to prevent ts-node translator errors
try {
	;(require as any).cache[require.resolve("posthog-node")] = {
		id: "posthog-node-stub",
		filename: "posthog-node-stub",
		path: pathModule.dirname("posthog-node-stub"),
		loaded: true,
		parent: undefined,
		children: [],
		paths: [],
		require: require,
		exports: {
			PostHog: class {
				capture() {}
				shutdown() {
					return Promise.resolve()
				}
			},
		},
	} as any
} catch {
	// ignore if module is not resolvable
}

// Polyfill String.prototype.toPosix for tests
const pathUtils = {
	toPosix: (p: string) => {
		const isExtendedLengthPath = p.startsWith("\\\\?\\")
		if (isExtendedLengthPath) {
			return p
		}
		return p.replace(/\\/g, "/")
	},
}

if (!(String.prototype as any).toPosix) {
	;(String.prototype as any).toPosix = function (this: string): string {
		return pathUtils.toPosix(this)
	}
}

// Single require hook for tests
Module.prototype.require = function (path: string) {
	// VS Code mocks
	if (path === "vscode") {
		return require("./vscode-mock.cjs") // CARETI MODIFICATION: Node/ts-node 환경에서 ESM 변환 충돌을 피하기 위해 CJS mock을 사용
	}
	if (path === "@integrations/checkpoints") {
		return {}
	}
	if (path === "@integrations/checkpoints/MultiRootCheckpointManager") {
		return { MultiRootCheckpointManager: class {} }
	}
	if (path === "@core/workspace") {
		return {
			workspaceResolver: {
				resolveWorkspacePath: (cwd: string, relPath: string) => {
					const pathMod = require("path")
					return pathMod.resolve(cwd, relPath)
				},
				getBasename: (p: string) => {
					const pathMod = require("path")
					return pathMod.basename(p)
				},
			},
		}
	}

	// Telemetry/provider stubs
	if (path.includes("PostHogErrorProvider")) {
		return {
			PostHogErrorProvider: class {
				private errorSettings = { enabled: false, hostEnabled: false, level: "off" }
				private readonly isSharedClient = false
				constructor(..._args: any[]) {}
				initialize() {
					return Promise.resolve(this)
				}
				logException() {}
				logMessage() {}
				isEnabled() {
					return false
				}
				getSettings() {
					return { ...this.errorSettings }
				}
				dispose() {
					return Promise.resolve()
				}
			},
		}
	}
	if (path.includes("PostHogTelemetryProvider") || path.includes("telemetry/providers/posthog")) {
		return {
			PostHogTelemetryProvider: class {
				async initialize() {
					return this
				}
				track() {}
				flush() {
					return Promise.resolve()
				}
			},
		}
	}
	if (path.includes("OpenTelemetryTelemetryProvider") || path.includes("telemetry/providers/opentelemetry")) {
		return {
			OpenTelemetryTelemetryProvider: class {
				async initialize() {
					return this
				}
				track() {}
				flush() {
					return Promise.resolve()
				}
			},
		}
	}
	if (path.includes("utils/shell")) {
		return {
			getShellPath: async () => "/bin/sh",
			getUserShell: () => "/bin/sh",
			getDefaultShell: () => "/bin/sh",
			getEnvVariables: () => ({}),
			getWindowsHomeDrive: () => "C:",
			getWindowsHomePath: () => "C:\\Users\\test",
			getUserHomeDir: () => "/tmp",
			getWorkspaceHomeDir: () => "/tmp",
			formatWindowsPath: (p: string) => p,
			formatWSLPath: (p: string) => p,
			isWindows: false,
			isMac: false,
			isLinux: true,
			ensureShellPath: () => "/bin/sh",
		}
	}
	if (path.includes("src/utils/shell")) {
		return {
			getShellPath: async () => "/bin/sh",
			getUserShell: () => "/bin/sh",
			getDefaultShell: () => "/bin/sh",
			getEnvVariables: () => ({}),
			getWindowsHomeDrive: () => "C:",
			getWindowsHomePath: () => "C:\\Users\\test",
			getUserHomeDir: () => "/tmp",
			getWorkspaceHomeDir: () => "/tmp",
			formatWindowsPath: (p: string) => p,
			formatWSLPath: (p: string) => p,
			isWindows: false,
			isMac: false,
			isLinux: true,
			ensureShellPath: () => "/bin/sh",
		}
	}
	if (path === "posthog-node" || path.startsWith("posthog-node/")) {
		return {
			PostHog: class {
				capture() {}
				shutdown() {
					return Promise.resolve()
				}
			},
		}
	}

	// Aliases
	const projectRoot = pathModule.resolve(__dirname, "../..")
	if (path.startsWith("@/")) {
		const relativePart = path.substring(2)
		const compiledPath = pathModule.join(projectRoot, "out/src", relativePart)
		try {
			return originalRequire.call(this, compiledPath)
		} catch {
			const sourcePath = pathModule.join(projectRoot, "src", relativePart)
			return originalRequire.call(this, sourcePath)
		}
	}
	if (path.startsWith("@careti/")) {
		const relativePart = path.substring(7)
		const compiledPath = pathModule.join(projectRoot, "out/careti-src", relativePart)
		try {
			return originalRequire.call(this, compiledPath)
		} catch {
			const sourcePath = pathModule.join(projectRoot, "careti-src", relativePart)
			return originalRequire.call(this, sourcePath)
		}
	}

	return originalRequire.call(this, path)
}
