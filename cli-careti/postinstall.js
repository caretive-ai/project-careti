#!/usr/bin/env node

const { spawnSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const { createRequire } = require("module")

const packageRoot = __dirname
const distDir = path.join(packageRoot, "dist-standalone")
const rootPackageJson = path.join(packageRoot, "package.json")
const distPackageJson = path.join(distDir, "package.json")
const rootModuleDir = path.join(packageRoot, "node_modules", "better-sqlite3")
const distModuleDir = path.join(distDir, "node_modules", "better-sqlite3")

const npmExecPath = process.env.npm_execpath
const command = npmExecPath ? process.execPath : "npm"

const requireFromRoot = createRequire(rootPackageJson)
const requireFromDist = fs.existsSync(distPackageJson) ? createRequire(distPackageJson) : null
const getSqlitePackage = () => {
	const readPackage = (packagePath, label) => {
		try {
			const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"))
			const version = pkg.dependencies?.["better-sqlite3"]
			if (version) {
				return { version, baseDir: label === "root" ? packageRoot : distDir }
			}
			return null
		} catch (error) {
			console.warn(`[careti-cli] Failed to read ${label} package.json: ${error?.message ?? error}`)
			return null
		}
	}

	return readPackage(rootPackageJson, "root") ?? (fs.existsSync(distPackageJson) ? readPackage(distPackageJson, "dist") : null)
}

const tryLoadSqlite = () => {
	if (fs.existsSync(rootModuleDir)) {
		try {
			requireFromRoot("better-sqlite3")
			return "root"
		} catch (error) {
			console.warn(`[careti-cli] better-sqlite3 load failed (root): ${error?.message ?? error}`)
		}
	}
	if (requireFromDist && fs.existsSync(distModuleDir)) {
		try {
			requireFromDist("better-sqlite3")
			return "dist"
		} catch (error) {
			console.warn(`[careti-cli] better-sqlite3 load failed (dist): ${error?.message ?? error}`)
		}
	}
	return ""
}

const getRipgrepPlatform = () => {
	if (process.platform === "darwin") {
		return process.arch === "arm64" ? "darwin-arm64" : "darwin-x64"
	}
	if (process.platform === "win32") {
		return "win-x64"
	}
	if (process.platform === "linux") {
		return process.arch === "arm64" ? "linux-arm64" : "linux-x64"
	}
	return ""
}

const ensureRipgrep = () => {
	if (!fs.existsSync(distDir)) {
		return
	}
	const platformDir = getRipgrepPlatform()
	if (!platformDir) {
		return
	}
	const binaryName = process.platform === "win32" ? "rg.exe" : "rg"
		const targetPath = path.join(distDir, binaryName)
		const sourcePath = path.join(distDir, "ripgrep-binaries", platformDir, binaryName)
	if (fs.existsSync(sourcePath)) {
		try {
			fs.copyFileSync(sourcePath, targetPath)
			if (process.platform !== "win32") {
				fs.chmodSync(targetPath, 0o755)
			}
		} catch (error) {
			console.warn(`[careti-cli] Failed to setup ripgrep: ${error?.message ?? error}`)
		}
	} else if (!fs.existsSync(targetPath)) {
		console.warn(`[careti-cli] ripgrep binary not found for ${platformDir}; file search may fail`)
	}
}

ensureRipgrep()

const loadedFrom = tryLoadSqlite()
if (loadedFrom) {
	process.exit(0)
}

const sqlitePackage = getSqlitePackage()
if (!sqlitePackage?.version) {
	console.warn("[careti-cli] better-sqlite3 version not found; skipping rebuild")
	process.exit(0)
}

const sqliteModuleDir = path.join(sqlitePackage.baseDir, "node_modules", "better-sqlite3")
if (fs.existsSync(sqliteModuleDir)) {
	try {
		fs.rmSync(sqliteModuleDir, { recursive: true, force: true })
	} catch (error) {
		console.warn(`[careti-cli] Failed to remove old better-sqlite3: ${error?.message ?? error}`)
	}
}

const installArgs = npmExecPath
	? [npmExecPath, "install", "--no-save", `better-sqlite3@${sqlitePackage.version}`]
	: ["install", "--no-save", `better-sqlite3@${sqlitePackage.version}`]

console.log(`[careti-cli] Installing better-sqlite3@${sqlitePackage.version} for local Node.js...`)
let result = spawnSync(command, installArgs, { cwd: sqlitePackage.baseDir, stdio: "inherit" })

if (result.status !== 0) {
	console.warn("[careti-cli] Install failed; attempting source rebuild...")
	const rebuildArgs = npmExecPath
		? [npmExecPath, "rebuild", "better-sqlite3", "--build-from-source", "--unsafe-perm"]
		: ["rebuild", "better-sqlite3", "--build-from-source", "--unsafe-perm"]
	result = spawnSync(command, rebuildArgs, { cwd: sqlitePackage.baseDir, stdio: "inherit" })
}

if (result.status !== 0) {
	process.exit(result.status ?? 1)
}

if (!tryLoadSqlite()) {
	console.error("[careti-cli] Failed to load better-sqlite3 after install. Ensure build tools are available or try Node 20.")
	process.exit(1)
}
