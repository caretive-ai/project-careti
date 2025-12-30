#!/usr/bin/env node

const { spawnSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const { createRequire } = require("module")

const distDir = path.join(__dirname, "dist-standalone")
const distPackageJson = path.join(distDir, "package.json")
const moduleDir = path.join(distDir, "node_modules", "better-sqlite3")

if (!fs.existsSync(distDir) || !fs.existsSync(distPackageJson)) {
	console.log("[caret-cli] dist-standalone not found; skipping sqlite setup")
	process.exit(0)
}

const npmExecPath = process.env.npm_execpath
const command = npmExecPath ? process.execPath : "npm"

const requireFromDist = createRequire(distPackageJson)
const getSqliteVersion = () => {
	try {
		const pkg = JSON.parse(fs.readFileSync(distPackageJson, "utf8"))
		return pkg.dependencies?.["better-sqlite3"]
	} catch (error) {
		console.warn(`[caret-cli] Failed to read dist package.json: ${error?.message ?? error}`)
		return undefined
	}
}

const tryLoadSqlite = () => {
	try {
		requireFromDist("better-sqlite3")
		return true
	} catch (error) {
		console.warn(`[caret-cli] better-sqlite3 load failed: ${error?.message ?? error}`)
		return false
	}
}

if (moduleDir && fs.existsSync(moduleDir) && tryLoadSqlite()) {
	process.exit(0)
}

const sqliteVersion = getSqliteVersion()
if (!sqliteVersion) {
	console.warn("[caret-cli] better-sqlite3 version not found; skipping rebuild")
	process.exit(0)
}

if (fs.existsSync(moduleDir)) {
	try {
		fs.rmSync(moduleDir, { recursive: true, force: true })
	} catch (error) {
		console.warn(`[caret-cli] Failed to remove old better-sqlite3: ${error?.message ?? error}`)
	}
}

const installArgs = npmExecPath
	? [npmExecPath, "install", "--no-save", `better-sqlite3@${sqliteVersion}`]
	: ["install", "--no-save", `better-sqlite3@${sqliteVersion}`]

console.log(`[caret-cli] Installing better-sqlite3@${sqliteVersion} for local Node.js...`)
let result = spawnSync(command, installArgs, { cwd: distDir, stdio: "inherit" })

if (result.status !== 0) {
	console.warn("[caret-cli] Install failed; attempting source rebuild...")
	const rebuildArgs = npmExecPath
		? [npmExecPath, "rebuild", "better-sqlite3", "--build-from-source", "--unsafe-perm"]
		: ["rebuild", "better-sqlite3", "--build-from-source", "--unsafe-perm"]
	result = spawnSync(command, rebuildArgs, { cwd: distDir, stdio: "inherit" })
}

if (result.status !== 0) {
	process.exit(result.status ?? 1)
}

if (!tryLoadSqlite()) {
	console.error("[caret-cli] Failed to load better-sqlite3 after install. Ensure build tools are available or try Node 20.")
	process.exit(1)
}
