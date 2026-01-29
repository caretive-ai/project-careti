/**
 * CARETI MODIFICATION: E2E tests for Hooks system with Claude Code compatibility
 * Tests matcher pattern filtering, new hook events (SessionStart, SessionEnd, Stop)
 */
import { afterEach, beforeEach, describe, it } from "mocha"
import "should"
import fs from "fs/promises"
import os from "os"
import path from "path"
import sinon from "sinon"
import { setDistinctId } from "@/services/logging/distinctId"
import { StateManager } from "../../storage/StateManager"
import { HookFactory } from "../hook-factory"
import { matchesToolPattern, extractMatcherFromFileName } from "../hooks-utils"

describe("Hooks E2E - Claude Code Compatibility", function () {
	this.timeout(30000)

	// Skip on Windows - uniform shell execution pending
	before(function () {
		if (process.platform === "win32") {
			this.skip()
		}
	})

	let tempDir: string
	let sandbox: sinon.SinonSandbox

	const writeHookScript = async (hookPath: string, nodeScript: string): Promise<void> => {
		await fs.writeFile(hookPath, nodeScript)
		await fs.chmod(hookPath, 0o755)
	}

	beforeEach(async () => {
		setDistinctId("e2e-test-id")
		sandbox = sinon.createSandbox()
		tempDir = path.join(os.tmpdir(), `hook-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`)
		await fs.mkdir(tempDir, { recursive: true })

		const hooksDir = path.join(tempDir, ".agents", "hooks")
		await fs.mkdir(hooksDir, { recursive: true })

		sandbox.stub(StateManager, "get").returns({
			getGlobalStateKey: () => [{ path: tempDir }],
		} as any)

		const { HookDiscoveryCache } = await import("../HookDiscoveryCache")
		HookDiscoveryCache.resetForTesting()
	})

	afterEach(async () => {
		sandbox.restore()
		const { HookDiscoveryCache } = await import("../HookDiscoveryCache")
		HookDiscoveryCache.resetForTesting()

		try {
			await fs.rm(tempDir, { recursive: true, force: true })
		} catch {
			// Ignore cleanup errors
		}
	})

	describe("Matcher Pattern Support", () => {
		it("should extract matcher from filename: PreToolUse.Edit_Write", () => {
			const matcher = extractMatcherFromFileName("PreToolUse", "PreToolUse.Edit_Write")
			matcher.should.equal("Edit|Write")
		})

		it("should extract matcher from filename: PostToolUse.Bash", () => {
			const matcher = extractMatcherFromFileName("PostToolUse", "PostToolUse.Bash")
			matcher.should.equal("Bash")
		})

		it("should return empty string for base hook name", () => {
			const matcher = extractMatcherFromFileName("PreToolUse", "PreToolUse")
			matcher.should.equal("")
		})

		it("should match tool patterns correctly", () => {
			// Pattern "Edit|Write" matches Edit or Write
			matchesToolPattern("Edit", "Edit|Write").should.be.true()
			matchesToolPattern("Write", "Edit|Write").should.be.true()
			matchesToolPattern("Read", "Edit|Write").should.be.false()

			// Empty pattern matches all
			matchesToolPattern("AnyTool", "").should.be.true()

			// Exact match
			matchesToolPattern("Bash", "Bash").should.be.true()
			matchesToolPattern("Execute", "Bash").should.be.false()
		})

		it("should only execute hooks matching tool name pattern", async () => {
			// Create hooks with matchers
			const hooksDir = path.join(tempDir, ".agents", "hooks")

			// Hook for Edit|Write only
			const editWriteHook = path.join(hooksDir, "PreToolUse.Edit_Write")
			await writeHookScript(
				editWriteHook,
				`#!/usr/bin/env node
console.log(JSON.stringify({
  cancel: false,
  contextModification: "EDIT_WRITE_HOOK_EXECUTED"
}))`,
			)

			// Hook for Bash only
			const bashHook = path.join(hooksDir, "PreToolUse.Bash")
			await writeHookScript(
				bashHook,
				`#!/usr/bin/env node
console.log(JSON.stringify({
  cancel: false,
  contextModification: "BASH_HOOK_EXECUTED"
}))`,
			)

			// Test with Edit tool - should only trigger Edit|Write hook
			const factory = new HookFactory()
			const editRunner = await factory.createWithStreaming("PreToolUse", () => {}, undefined, "Edit")
			const editResult = await editRunner.run({
				taskId: "test-task",
				preToolUse: { toolName: "Edit", parameters: {} },
			})

			editResult.contextModification!.should.containEql("EDIT_WRITE_HOOK_EXECUTED")
			;(editResult.contextModification || "").should.not.containEql("BASH_HOOK_EXECUTED")

			// Reset cache for next test
			const { HookDiscoveryCache } = await import("../HookDiscoveryCache")
			HookDiscoveryCache.resetForTesting()

			// Test with Bash tool - should only trigger Bash hook
			const bashRunner = await factory.createWithStreaming("PreToolUse", () => {}, undefined, "Bash")
			const bashResult = await bashRunner.run({
				taskId: "test-task",
				preToolUse: { toolName: "Bash", parameters: {} },
			})

			bashResult.contextModification!.should.containEql("BASH_HOOK_EXECUTED")
			;(bashResult.contextModification || "").should.not.containEql("EDIT_WRITE_HOOK_EXECUTED")
		})

		it("should execute hook without matcher for any tool", async () => {
			const hooksDir = path.join(tempDir, ".agents", "hooks")

			// Generic hook without matcher
			const genericHook = path.join(hooksDir, "PreToolUse")
			await writeHookScript(
				genericHook,
				`#!/usr/bin/env node
console.log(JSON.stringify({
  cancel: false,
  contextModification: "GENERIC_HOOK_EXECUTED"
}))`,
			)

			const factory = new HookFactory()

			// Should execute for Read
			const readRunner = await factory.createWithStreaming("PreToolUse", () => {}, undefined, "Read")
			const readResult = await readRunner.run({
				taskId: "test-task",
				preToolUse: { toolName: "Read", parameters: {} },
			})
			readResult.contextModification!.should.containEql("GENERIC_HOOK_EXECUTED")

			// Reset and test for Write
			const { HookDiscoveryCache } = await import("../HookDiscoveryCache")
			HookDiscoveryCache.resetForTesting()

			const writeRunner = await factory.createWithStreaming("PreToolUse", () => {}, undefined, "Write")
			const writeResult = await writeRunner.run({
				taskId: "test-task",
				preToolUse: { toolName: "Write", parameters: {} },
			})
			writeResult.contextModification!.should.containEql("GENERIC_HOOK_EXECUTED")
		})
	})

	describe("SessionStart Hook", () => {
		it("should accept SessionStart hook input", async () => {
			const hooksDir = path.join(tempDir, ".agents", "hooks")
			const hookPath = path.join(hooksDir, "SessionStart")

			await writeHookScript(
				hookPath,
				`#!/usr/bin/env node
const input = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
const hasRequiredFields = input.sessionStart &&
                          input.sessionStart.source &&
                          input.sessionStart.sessionId;
console.log(JSON.stringify({
  cancel: false,
  contextModification: hasRequiredFields ? "SESSION_START_VALID" : "SESSION_START_INVALID"
}))`,
			)

			const factory = new HookFactory()
			const runner = await factory.create("SessionStart")
			const result = await runner.run({
				taskId: "test-task",
				sessionStart: {
					source: "startup",
					sessionId: "test-session-123",
				},
			})

			result.cancel.should.be.false()
			result.contextModification!.should.equal("SESSION_START_VALID")
		})

		it("should support all SessionStart sources", async () => {
			const hooksDir = path.join(tempDir, ".agents", "hooks")
			const hookPath = path.join(hooksDir, "SessionStart")

			await writeHookScript(
				hookPath,
				`#!/usr/bin/env node
const input = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
console.log(JSON.stringify({
  cancel: false,
  contextModification: "SOURCE:" + input.sessionStart.source
}))`,
			)

			const sources = ["startup", "resume", "clear", "compact"]
			for (const source of sources) {
				const { HookDiscoveryCache } = await import("../HookDiscoveryCache")
				HookDiscoveryCache.resetForTesting()

				const factory = new HookFactory()
				const runner = await factory.create("SessionStart")
				const result = await runner.run({
					taskId: "test-task",
					sessionStart: {
						source,
						sessionId: `session-${source}`,
					},
				})

				result.contextModification!.should.equal(`SOURCE:${source}`)
			}
		})
	})

	describe("SessionEnd Hook", () => {
		it("should accept SessionEnd hook input with all fields", async () => {
			const hooksDir = path.join(tempDir, ".agents", "hooks")
			const hookPath = path.join(hooksDir, "SessionEnd")

			await writeHookScript(
				hookPath,
				`#!/usr/bin/env node
const input = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
const d = input.sessionEnd;
const valid = d.reason && d.transcriptPath && d.sessionId &&
              typeof d.durationMs === 'number' && typeof d.apiRequestCount === 'number';
console.log(JSON.stringify({
  cancel: false,
  contextModification: valid ? "SESSION_END_VALID:" + d.reason : "INVALID"
}))`,
			)

			const factory = new HookFactory()
			const runner = await factory.create("SessionEnd")
			const result = await runner.run({
				taskId: "test-task",
				sessionEnd: {
					reason: "exit",
					transcriptPath: "/tmp/transcript.json",
					sessionId: "session-456",
					durationMs: 120000,
					apiRequestCount: 15,
				},
			})

			result.cancel.should.be.false()
			result.contextModification!.should.equal("SESSION_END_VALID:exit")
		})

		it("should support all SessionEnd reasons", async () => {
			const hooksDir = path.join(tempDir, ".agents", "hooks")
			const hookPath = path.join(hooksDir, "SessionEnd")

			await writeHookScript(
				hookPath,
				`#!/usr/bin/env node
const input = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
console.log(JSON.stringify({
  cancel: false,
  contextModification: "REASON:" + input.sessionEnd.reason
}))`,
			)

			const reasons = ["exit", "clear", "logout", "other"]
			for (const reason of reasons) {
				const { HookDiscoveryCache } = await import("../HookDiscoveryCache")
				HookDiscoveryCache.resetForTesting()

				const factory = new HookFactory()
				const runner = await factory.create("SessionEnd")
				const result = await runner.run({
					taskId: "test-task",
					sessionEnd: {
						reason,
						transcriptPath: "/tmp/test.json",
						sessionId: "session-test",
						durationMs: 1000,
						apiRequestCount: 1,
					},
				})

				result.contextModification!.should.equal(`REASON:${reason}`)
			}
		})
	})

	describe("Stop Hook", () => {
		it("should accept Stop hook input", async () => {
			const hooksDir = path.join(tempDir, ".agents", "hooks")
			const hookPath = path.join(hooksDir, "Stop")

			await writeHookScript(
				hookPath,
				`#!/usr/bin/env node
const input = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
const d = input.stop;
console.log(JSON.stringify({
  cancel: false,
  contextModification: "STOP_HOOK:" + d.stopHookActive + ":" + (d.interruptedTool || "none")
}))`,
			)

			const factory = new HookFactory()
			const runner = await factory.create("Stop")
			const result = await runner.run({
				taskId: "test-task",
				stop: {
					stopHookActive: true,
					interruptedTool: "Bash",
				},
			})

			result.cancel.should.be.false()
			result.contextModification!.should.equal("STOP_HOOK:true:Bash")
		})
	})

	describe("Combined Hook Scenarios", () => {
		it("should execute multiple matching hooks and combine results", async () => {
			const hooksDir = path.join(tempDir, ".agents", "hooks")

			// Generic PreToolUse hook
			await writeHookScript(
				path.join(hooksDir, "PreToolUse"),
				`#!/usr/bin/env node
console.log(JSON.stringify({
  cancel: false,
  contextModification: "GENERIC"
}))`,
			)

			// Specific Write hook
			await writeHookScript(
				path.join(hooksDir, "PreToolUse.Write"),
				`#!/usr/bin/env node
console.log(JSON.stringify({
  cancel: false,
  contextModification: "WRITE_SPECIFIC"
}))`,
			)

			const factory = new HookFactory()
			const runner = await factory.createWithStreaming("PreToolUse", () => {}, undefined, "Write")
			const result = await runner.run({
				taskId: "test-task",
				preToolUse: { toolName: "Write", parameters: {} },
			})

			// Both should execute
			result.contextModification!.should.containEql("GENERIC")
			result.contextModification!.should.containEql("WRITE_SPECIFIC")
		})

		it("should block if any matching hook blocks", async () => {
			const hooksDir = path.join(tempDir, ".agents", "hooks")

			// Allowing generic hook
			await writeHookScript(
				path.join(hooksDir, "PreToolUse"),
				`#!/usr/bin/env node
console.log(JSON.stringify({
  cancel: false,
  contextModification: "ALLOWED"
}))`,
			)

			// Blocking Write hook
			await writeHookScript(
				path.join(hooksDir, "PreToolUse.Write"),
				`#!/usr/bin/env node
console.log(JSON.stringify({
  cancel: true,
  errorMessage: "Write blocked by policy"
}))`,
			)

			const factory = new HookFactory()
			const runner = await factory.createWithStreaming("PreToolUse", () => {}, undefined, "Write")
			const result = await runner.run({
				taskId: "test-task",
				preToolUse: { toolName: "Write", parameters: {} },
			})

			result.cancel.should.be.true()
			result.errorMessage!.should.containEql("Write blocked by policy")
		})
	})
})
