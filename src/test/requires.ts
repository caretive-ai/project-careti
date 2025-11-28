const Module = require("module")
const originalRequire = Module.prototype.require

/**
 * VSCode is not available during unit tests
 * @see {@link file://./vscode-mock.ts}
 */
Module.prototype.require = function (path: string) {
	if (path === "vscode") {
		return require("./vscode-mock")
	}
	// Avoid pulling in VSCode-integrated checkpoint/editor code during unit tests
	if (path === "@integrations/checkpoints") {
		return {}
	}
	if (path === "@integrations/checkpoints/MultiRootCheckpointManager") {
		return { MultiRootCheckpointManager: class {} }
	}
	if (path === "@core/workspace") {
		// Mock workspaceResolver for tests
		return {
			workspaceResolver: {
				resolveWorkspacePath: (cwd: string, relPath: string) => {
					const path = require("path")
					return path.resolve(cwd, relPath)
				},
				getBasename: (p: string) => {
					const path = require("path")
					return path.basename(p)
				},
			},
		}
	}
	if (path.startsWith("@/")) {
		// Resolve alias paths for tests
		const resolvedPath = path.replace("@/", "../../out/caret-src/")
		return originalRequire.call(this, resolvedPath)
	}

	return originalRequire.call(this, path)
}

// Required to have access to String.prototype.toPosix
// Using require since this is a test setup file and we need CJS compatibility
// Manually register module for String.prototype.toPosix
const pathUtils = {
	toPosix: (p: string) => {
		const isExtendedLengthPath = p.startsWith("\\\\?\\")
		if (isExtendedLengthPath) {
			return p
		}
		return p.replace(/\\/g, "/")
	},
}

// Polyfill String.prototype.toPosix directly in test setup
// This bypasses module resolution issues for this simple utility
if (!String.prototype.toPosix) {
	String.prototype.toPosix = function (this: string): string {
		return pathUtils.toPosix(this)
	}
}

// Mock @/ imports since we are running in compiled mode where tsconfig-paths might not work as expected
// This overrides the originalRequire behavior for internal module resolution
Module.prototype.require = function (path: string) {
	if (path === "vscode") {
		return require("./vscode-mock")
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
					const path = require("path")
					return path.resolve(cwd, relPath)
				},
				getBasename: (p: string) => {
					const path = require("path")
					return path.basename(p)
				},
			},
		}
	}
	const pathModule = require("path")
	const projectRoot = pathModule.resolve(__dirname, "../..")

	// Handle @/ aliases by mapping to absolute paths
	if (path.startsWith("@/")) {
		const relativePart = path.substring(2)
		// Try out/caret-src first (compiled)
		const compiledPath = pathModule.join(projectRoot, "out/caret-src", relativePart)
		try {
			return originalRequire.call(this, compiledPath)
		} catch (e) {
			// Fallback to src (source)
			const sourcePath = pathModule.join(projectRoot, "src", relativePart)
			return originalRequire.call(this, sourcePath)
		}
	}

	// Handle @caret/ aliases by mapping to absolute paths
	if (path.startsWith("@caret/")) {
		const relativePart = path.substring(7) // Remove "@caret/"
		// Try out/caret-src first (compiled)
		const compiledPath = pathModule.join(projectRoot, "out/caret-src", relativePart)
		try {
			return originalRequire.call(this, compiledPath)
		} catch (e) {
			// Fallback to caret-src (source)
			const sourcePath = pathModule.join(projectRoot, "caret-src", relativePart)
			return originalRequire.call(this, sourcePath)
		}
	}

	return originalRequire.call(this, path)
}
