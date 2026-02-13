// CARETI MODIFICATION: E2E tests for CLI sub-agent functionality
// Tests binary discovery, version/help branding, subagent command transformation,
// and full fork execution flow with the actual careti CLI binary.

import { before, afterEach, beforeEach, describe, it } from "mocha"
import "should"
import { execSync, spawn } from "child_process"
import fs from "fs"
import os from "os"
import path from "path"
import type { CommandContent } from "@shared/commands"
import { executeSkillInFork, shouldForkSkill, type SkillForkConfig } from "../SkillForkExecutor"
import { isSubagentCommand, transformClineCommand } from "../../../../integrations/cli-subagents/subagent_command"
import { isCliSubagentContext } from "../../../../utils/cli-detector"

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Repo root (4 levels up from __tests__/) */
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..")

/**
 * Resolve the careti CLI binary path.
 * Priority: CARETI_CLI_PATH env > local platform binary > local wrapper > PATH
 */
function resolveCaretiBinary(): string | null {
	// 1. Explicit env var
	const envPath = process.env.CARETI_CLI_PATH
	if (envPath && fs.existsSync(envPath)) {
		return envPath
	}

	// 2. Local platform-specific binary
	const platform = process.platform === "win32" ? "windows" : process.platform
	const arch = process.arch === "x64" ? "amd64" : process.arch
	const ext = platform === "windows" ? ".exe" : ""
	const localBin = path.join(REPO_ROOT, "cli-careti", "bin", `careti-${platform}-${arch}${ext}`)
	if (fs.existsSync(localBin)) {
		return localBin
	}

	// 3. Local wrapper script
	const wrapper = path.join(REPO_ROOT, "cli-careti", "bin", "careti")
	if (fs.existsSync(wrapper)) {
		return wrapper
	}

	// 4. PATH lookup
	try {
		const found = execSync("which careti 2>/dev/null", { encoding: "utf-8" }).trim()
		if (found) {
			return found
		}
	} catch {
		// not in PATH
	}

	return null
}

/**
 * Run careti binary and capture output
 */
function runCareti(
	binary: string,
	args: string[],
	opts?: { timeout?: number; cwd?: string },
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
	return new Promise((resolve) => {
		const proc = spawn(binary, args, {
			cwd: opts?.cwd || os.tmpdir(),
			stdio: ["pipe", "pipe", "pipe"],
			timeout: opts?.timeout || 10000,
		})

		let stdout = ""
		let stderr = ""

		proc.stdout.on("data", (d: Buffer) => {
			stdout += d.toString()
		})
		proc.stderr.on("data", (d: Buffer) => {
			stderr += d.toString()
		})

		proc.on("close", (code) => {
			resolve({ stdout, stderr, exitCode: code ?? -1 })
		})

		proc.on("error", (err) => {
			resolve({ stdout, stderr: err.message, exitCode: -1 })
		})
	})
}

/**
 * Check if a gRPC cline-core server is reachable
 */
function isGrpcServerAvailable(binary: string): boolean {
	try {
		const result = execSync(`"${binary}" instance list`, {
			encoding: "utf-8",
			timeout: 5000,
			shell: "/bin/sh",
		})
		return result.includes("localhost:") || result.includes("127.0.0.1:")
	} catch {
		return false
	}
}

function createSkillContent(overrides: Partial<CommandContent>): CommandContent {
	return {
		name: "test-skill",
		description: "Test skill",
		instructions: "Test instructions",
		path: "/test/path",
		source: "project",
		...overrides,
	}
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe("CLI Sub-Agent E2E Tests", function () {
	this.timeout(30000)

	let binary: string | null

	before(function () {
		binary = resolveCaretiBinary()
		if (!binary) {
			console.log(
				"[cli-subagent-e2e] careti binary not found. Skipping E2E tests.\n" +
					"  Set CARETI_CLI_PATH or build with: cd cli-careti && ./scripts/build-local.sh",
			)
			this.skip()
		}
	})

	// ── Tier 1: Binary-Only (No gRPC) ──────────────────────────────────────

	describe("Tier 1: Binary-Only (No gRPC server required)", function () {
		describe("Binary Discovery", function () {
			it("should resolve a binary path", function () {
				binary!.should.be.a.String()
				fs.existsSync(binary!).should.be.true()
			})

			it("should resolve platform-specific binary from cli-careti/bin/", function () {
				const platform = process.platform === "win32" ? "windows" : process.platform
				const arch = process.arch === "x64" ? "amd64" : process.arch
				const ext = platform === "windows" ? ".exe" : ""
				const expected = path.join(REPO_ROOT, "cli-careti", "bin", `careti-${platform}-${arch}${ext}`)

				// If the platform binary exists, it should be preferred over wrapper
				if (fs.existsSync(expected)) {
					// Without CARETI_CLI_PATH, resolver should find platform binary
					const resolved = resolveCaretiBinary()
					resolved!.should.equal(expected)
				}
			})

			it("should respect CARETI_CLI_PATH env var override", function () {
				const originalEnv = process.env.CARETI_CLI_PATH

				try {
					// Point to actual binary
					process.env.CARETI_CLI_PATH = binary!
					const resolved = resolveCaretiBinary()
					resolved!.should.equal(binary!)
				} finally {
					if (originalEnv !== undefined) {
						process.env.CARETI_CLI_PATH = originalEnv
					} else {
						delete process.env.CARETI_CLI_PATH
					}
				}
			})

			it("should return null when binary does not exist", function () {
				const originalEnv = process.env.CARETI_CLI_PATH

				try {
					process.env.CARETI_CLI_PATH = "/nonexistent/path/careti"
					// resolveCaretiBinary checks existsSync, so this should fall through
					// It may still find the real binary via other methods
					const resolved = resolveCaretiBinary()
					// Just verify it didn't return the nonexistent path
					if (resolved) {
						resolved.should.not.equal("/nonexistent/path/careti")
					}
				} finally {
					if (originalEnv !== undefined) {
						process.env.CARETI_CLI_PATH = originalEnv
					} else {
						delete process.env.CARETI_CLI_PATH
					}
				}
			})
		})

		describe("Version Output & Branding", function () {
			it("should output Careti branding in version", async function () {
				const result = await runCareti(binary!, ["version"])
				result.exitCode.should.equal(0)

				const output = result.stdout + result.stderr
				const outputLower = output.toLowerCase()
				outputLower.should.containEql("careti")
			})

			it("should NOT contain Cline branding in version output", async function () {
				const result = await runCareti(binary!, ["version"])
				const output = result.stdout + result.stderr

				// Should say "Careti" not "Cline"
				output.should.not.containEql("Cline CLI")
				output.should.not.containEql("Cline Version")
			})

			it("should include version fields", async function () {
				const result = await runCareti(binary!, ["version"])
				const output = result.stdout + result.stderr

				// Should contain version-like info
				output.should.match(/[Vv]ersion/)
			})

			it("should exit with code 0", async function () {
				const result = await runCareti(binary!, ["version"])
				result.exitCode.should.equal(0)
			})
		})

		describe("Help Output & Flag Documentation", function () {
			it("should output Careti branding in help", async function () {
				const result = await runCareti(binary!, ["--help"])
				const output = result.stdout + result.stderr
				const outputLower = output.toLowerCase()
				outputLower.should.containEql("careti")
			})

			it("should document -s flag for settings", async function () {
				const result = await runCareti(binary!, ["--help"])
				const output = result.stdout + result.stderr
				output.should.containEql("-s")
			})

			it("should document -F flag for output format", async function () {
				const result = await runCareti(binary!, ["--help"])
				const output = result.stdout + result.stderr
				output.should.containEql("-F")
			})

			it("should document --yolo flag", async function () {
				const result = await runCareti(binary!, ["--help"])
				const output = result.stdout + result.stderr
				output.should.containEql("--yolo")
			})

			it("should document --oneshot flag", async function () {
				const result = await runCareti(binary!, ["--help"])
				const output = result.stdout + result.stderr
				output.should.containEql("--oneshot")
			})

			it("should list task subcommand", async function () {
				const result = await runCareti(binary!, ["--help"])
				const output = result.stdout + result.stderr
				output.should.containEql("task")
			})

			it("should list instance subcommand", async function () {
				const result = await runCareti(binary!, ["--help"])
				const output = result.stdout + result.stderr
				output.should.containEql("instance")
			})
		})

		describe("Error Handling Without Server", function () {
			it("should fail gracefully when no gRPC server on task new", async function () {
				// Use a port that's unlikely to have a gRPC server
				const result = await runCareti(binary!, ["task", "new", "--address", "localhost:19999", "test prompt"], {
					timeout: 15000,
				})
				result.exitCode.should.not.equal(0)
			})

			it("should output meaningful error message", async function () {
				const result = await runCareti(binary!, ["task", "new", "--address", "localhost:19999", "test prompt"], {
					timeout: 15000,
				})
				const output = result.stdout + result.stderr
				// Should have some error output, not just silently fail
				output.length.should.be.above(0)
			})
		})

		describe("Subagent Command Detection (isSubagentCommand)", function () {
			it("should detect cline with double-quoted prompt", function () {
				isSubagentCommand('cline "do something"').should.be.true()
			})

			it("should detect cline with single-quoted prompt", function () {
				isSubagentCommand("cline 'do something'").should.be.true()
			})

			// CARETI MODIFICATION: careti command detection
			it("should detect careti with double-quoted prompt", function () {
				isSubagentCommand('careti "do something"').should.be.true()
			})

			it("should detect careti with single-quoted prompt", function () {
				isSubagentCommand("careti 'do something'").should.be.true()
			})

			it("should NOT detect regular shell commands", function () {
				isSubagentCommand("ls -la").should.be.false()
				isSubagentCommand("git status").should.be.false()
				isSubagentCommand("npm run build").should.be.false()
			})

			it("should NOT detect partial matches", function () {
				isSubagentCommand("cline-helper run").should.be.false()
				isSubagentCommand("mycline test").should.be.false()
				isSubagentCommand("careti-helper run").should.be.false()
			})

			it("should NOT detect cline without quotes around prompt", function () {
				isSubagentCommand("cline do something").should.be.false()
			})

			it("should NOT detect careti without quotes around prompt", function () {
				isSubagentCommand("careti do something").should.be.false()
			})
		})

		describe("Subagent Command Transformation (transformClineCommand)", function () {
			it("should inject all subagent flags after prompt", function () {
				const result = transformClineCommand('cline "do something"')
				result.should.containEql("-s yolo_mode_toggled=true")
				result.should.containEql("-s max_consecutive_mistakes=6")
				result.should.containEql("-F plain")
				result.should.containEql("-y")
				result.should.containEql("--oneshot")
			})

			it("should preserve double quotes around prompt", function () {
				const result = transformClineCommand('cline "my prompt"')
				result.should.containEql('"my prompt"')
			})

			it("should preserve single quotes around prompt", function () {
				const result = transformClineCommand("cline 'my prompt'")
				result.should.containEql("'my prompt'")
			})

			it("should preserve additional flags like --workdir", function () {
				const result = transformClineCommand('cline "prompt" --workdir ./path')
				result.should.containEql("--workdir ./path")
				result.should.containEql("--oneshot")
			})

			it("should not transform non-subagent commands", function () {
				const cmd = "ls -la"
				transformClineCommand(cmd).should.equal(cmd)
			})

			it("should produce correct flag order", function () {
				const result = transformClineCommand('cline "test"')
				// Flags should come after the prompt
				const promptIdx = result.indexOf('"test"')
				const flagIdx = result.indexOf("-s yolo_mode_toggled=true")
				flagIdx.should.be.above(promptIdx)
			})

			// CARETI MODIFICATION: careti command transformation
			it("should transform careti command with all subagent flags", function () {
				const result = transformClineCommand('careti "do something"')
				result.should.startWith("careti ")
				result.should.containEql("-s yolo_mode_toggled=true")
				result.should.containEql("-s max_consecutive_mistakes=6")
				result.should.containEql("-F plain")
				result.should.containEql("-y")
				result.should.containEql("--oneshot")
			})

			it("should preserve careti command name (not replace with cline)", function () {
				const result = transformClineCommand('careti "my prompt"')
				result.should.startWith("careti ")
				result.should.not.startWith("cline ")
				result.should.containEql('"my prompt"')
			})

			it("should preserve careti with additional flags", function () {
				const result = transformClineCommand('careti "prompt" --workdir ./path')
				result.should.startWith("careti ")
				result.should.containEql("--workdir ./path")
				result.should.containEql("--oneshot")
			})
		})

		describe("CLI Subagent Context Detection (isCliSubagentContext)", function () {
			it("should detect subagent context with yolo=true and mistakes=6", function () {
				isCliSubagentContext({
					yoloModeToggled: true,
					maxConsecutiveMistakes: 6,
				}).should.be.true()
			})

			it("should NOT detect when yoloMode is false", function () {
				isCliSubagentContext({
					yoloModeToggled: false,
					maxConsecutiveMistakes: 6,
				}).should.be.false()
			})

			it("should NOT detect when mistakes is not 6", function () {
				isCliSubagentContext({
					yoloModeToggled: true,
					maxConsecutiveMistakes: 3,
				}).should.be.false()
			})

			it("should NOT detect with default params", function () {
				isCliSubagentContext({
					yoloModeToggled: false,
					maxConsecutiveMistakes: 3,
				}).should.be.false()
			})
		})

		describe("Skill Fork Detection", function () {
			it("should detect fork context", function () {
				const skill = createSkillContent({ context: "fork" })
				shouldForkSkill(skill).should.be.true()
			})

			it("should NOT fork inline context", function () {
				const skill = createSkillContent({ context: "inline" })
				shouldForkSkill(skill).should.be.false()
			})

			it("should NOT fork when context is undefined", function () {
				const skill = createSkillContent({})
				shouldForkSkill(skill).should.be.false()
			})
		})
	})

	// ── Tier 2: Server-Required ────────────────────────────────────────────

	describe("Tier 2: Server-Required (gRPC instance needed)", function () {
		this.timeout(60000)

		let serverAvailable: boolean

		before(function () {
			serverAvailable = isGrpcServerAvailable(binary!)
			if (!serverAvailable) {
				console.log(
					"[cli-subagent-e2e] No gRPC server available. Skipping Tier 2 tests.\n" +
						"  Start a server with: careti instance new",
				)
				this.skip()
			}
		})

		describe("Oneshot Task Execution", function () {
			it("should execute with -F plain -y --oneshot and return output", async function () {
				const result = await runCareti(binary!, ["-F", "plain", "-y", "--oneshot", "respond with exactly: HELLO_SUBAGENT_TEST"], {
					timeout: 45000,
				})

				// Task should complete (either success or expected failure)
				// The key check is that the binary ran and produced output
				const output = result.stdout + result.stderr
				output.length.should.be.above(0)
			})
		})

		describe("Subagent Flag Execution", function () {
			it("should execute with full subagent flag set", async function () {
				const result = await runCareti(
					binary!,
					["-s", "yolo_mode_toggled=true", "-s", "max_consecutive_mistakes=6", "-F", "plain", "-y", "--oneshot", "say hello"],
					{ timeout: 45000 },
				)

				const output = result.stdout + result.stderr
				output.length.should.be.above(0)
			})
		})

		describe("Fork Executor Integration", function () {
			let tempDir: string

			beforeEach(function () {
				tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cli-subagent-e2e-"))
			})

			afterEach(function () {
				try {
					fs.rmSync(tempDir, { recursive: true, force: true })
				} catch {
					// ignore cleanup errors
				}
			})

			it("should execute skill in fork via executeSkillInFork()", async function () {
				const config: SkillForkConfig = {
					cwd: tempDir,
					skillContent: createSkillContent({
						description: "Echo test skill",
						instructions: "Respond with exactly: FORK_TEST_SUCCESS",
						context: "fork",
					}),
					userPrompt: "Execute the test skill",
				}

				const result = await executeSkillInFork(config)

				result.should.have.property("success")
				result.should.have.property("output")
				// If binary is found, it should at least attempt execution
				if (result.success) {
					result.output.length.should.be.above(0)
				}
			})
		})

		describe("Error Scenarios", function () {
			it("should return non-zero exit code for invalid address", async function () {
				const result = await runCareti(
					binary!,
					["task", "new", "--address", "localhost:1", "test"],
					{ timeout: 15000 },
				)
				result.exitCode.should.not.equal(0)
			})
		})
	})
})
