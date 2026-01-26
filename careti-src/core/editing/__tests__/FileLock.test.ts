/**
 * FileLock unit tests
 * CARETI MODIFICATION: Tests for file locking system
 */

import { expect } from "chai"
import { describe, it, beforeEach } from "mocha"
import { withLock, isLocked, getLockedCount, acquireLock, releaseLock } from "../FileLock"

describe("FileLock", () => {
	const testPath = "/test/file.ts"
	const testPath2 = "/test/file2.ts"

	beforeEach(() => {
		// Clean up any leftover locks
		releaseLock(testPath)
		releaseLock(testPath2)
	})

	describe("withLock", () => {
		it("should execute function while holding lock", async () => {
			let executed = false
			await withLock(testPath, async () => {
				executed = true
				expect(isLocked(testPath)).to.be.true
			})
			expect(executed).to.be.true
			expect(isLocked(testPath)).to.be.false
		})

		it("should release lock even if function throws", async () => {
			try {
				await withLock(testPath, async () => {
					throw new Error("Test error")
				})
			} catch {
				// Expected
			}
			expect(isLocked(testPath)).to.be.false
		})

		it("should wait for existing lock before executing", async () => {
			const executionOrder: number[] = []

			// First lock
			const promise1 = withLock(testPath, async () => {
				executionOrder.push(1)
				await new Promise((resolve) => setTimeout(resolve, 50))
				executionOrder.push(2)
			})

			// Second lock should wait
			const promise2 = withLock(testPath, async () => {
				executionOrder.push(3)
			})

			await Promise.all([promise1, promise2])
			expect(executionOrder).to.deep.equal([1, 2, 3])
		})

		it("should allow parallel locks on different files", async () => {
			const results: string[] = []

			await Promise.all([
				withLock(testPath, async () => {
					results.push("file1-start")
					await new Promise((resolve) => setTimeout(resolve, 10))
					results.push("file1-end")
				}),
				withLock(testPath2, async () => {
					results.push("file2-start")
					await new Promise((resolve) => setTimeout(resolve, 10))
					results.push("file2-end")
				}),
			])

			// Both should start before either ends (parallel execution)
			expect(results.indexOf("file1-start")).to.be.lessThan(results.indexOf("file1-end"))
			expect(results.indexOf("file2-start")).to.be.lessThan(results.indexOf("file2-end"))
		})
	})

	describe("acquireLock/releaseLock", () => {
		it("should acquire and release lock", async () => {
			expect(isLocked(testPath)).to.be.false

			await acquireLock(testPath)
			expect(isLocked(testPath)).to.be.true

			releaseLock(testPath)
			expect(isLocked(testPath)).to.be.false
		})

		it("should wait for existing lock", async () => {
			const executionOrder: number[] = []

			await acquireLock(testPath)
			executionOrder.push(1)

			// This should wait until we release
			const waitPromise = acquireLock(testPath).then(() => {
				executionOrder.push(3)
			})

			// Small delay to ensure waitPromise is waiting
			await new Promise((resolve) => setTimeout(resolve, 10))
			executionOrder.push(2)

			releaseLock(testPath)
			await waitPromise

			expect(executionOrder).to.deep.equal([1, 2, 3])
			releaseLock(testPath) // Clean up
		})

		it("should handle multiple release calls gracefully", async () => {
			await acquireLock(testPath)
			expect(isLocked(testPath)).to.be.true

			releaseLock(testPath)
			expect(isLocked(testPath)).to.be.false

			// Second release should not throw
			releaseLock(testPath)
			expect(isLocked(testPath)).to.be.false
		})

		it("should work with DiffViewProvider-like flow", async () => {
			// Simulate: open() -> update() -> saveChanges() -> reset()
			const operations: string[] = []

			// First edit session
			await acquireLock(testPath)
			operations.push("open1")

			// Simulate update (lock held)
			expect(isLocked(testPath)).to.be.true
			operations.push("update1")

			// Simulate saveChanges (lock still held)
			operations.push("save1")

			// Simulate reset (releases lock)
			releaseLock(testPath)
			operations.push("reset1")

			// Second edit session should start immediately
			await acquireLock(testPath)
			operations.push("open2")
			releaseLock(testPath)
			operations.push("reset2")

			expect(operations).to.deep.equal(["open1", "update1", "save1", "reset1", "open2", "reset2"])
		})

		it("should block concurrent edit sessions on same file", async () => {
			const operations: string[] = []

			// First session acquires lock
			await acquireLock(testPath)
			operations.push("session1-start")

			// Second session tries to acquire (should wait)
			const session2Promise = acquireLock(testPath).then(() => {
				operations.push("session2-start")
			})

			// Give session2 time to block
			await new Promise((resolve) => setTimeout(resolve, 20))

			// Session 1 completes
			operations.push("session1-end")
			releaseLock(testPath)

			// Session 2 should now proceed
			await session2Promise

			expect(operations).to.deep.equal(["session1-start", "session1-end", "session2-start"])
			releaseLock(testPath) // Clean up
		})
	})

	describe("isLocked", () => {
		it("should return false for unlocked file", () => {
			expect(isLocked("/nonexistent/file.ts")).to.be.false
		})

		it("should return true for locked file", async () => {
			await acquireLock(testPath)
			expect(isLocked(testPath)).to.be.true
			releaseLock(testPath)
		})
	})

	describe("getLockedCount", () => {
		it("should return 0 when no locks", () => {
			expect(getLockedCount()).to.equal(0)
		})

		it("should count active locks", async () => {
			await acquireLock(testPath)
			expect(getLockedCount()).to.equal(1)

			await acquireLock(testPath2)
			expect(getLockedCount()).to.equal(2)

			releaseLock(testPath)
			expect(getLockedCount()).to.equal(1)

			releaseLock(testPath2)
			expect(getLockedCount()).to.equal(0)
		})
	})
})
