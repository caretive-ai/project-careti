// CARETI MODIFICATION: Unit tests for AsyncQueue
import { describe, it, expect, beforeEach } from "vitest"
import { AsyncQueue } from "../../utils/async-queue"

describe("AsyncQueue", () => {
	let queue: AsyncQueue<string>

	beforeEach(() => {
		queue = new AsyncQueue<string>()
	})

	describe("push and next", () => {
		it("should return pushed items in order", async () => {
			queue.push("a")
			queue.push("b")
			queue.push("c")

			expect(await queue.next()).toBe("a")
			expect(await queue.next()).toBe("b")
			expect(await queue.next()).toBe("c")
		})

		it("should wait for items when queue is empty", async () => {
			const promise = queue.next()

			// Push after a delay
			setTimeout(() => queue.push("delayed"), 10)

			const result = await promise
			expect(result).toBe("delayed")
		})

		it("should resolve waiting consumers immediately when item is pushed", async () => {
			const results: string[] = []

			// Start waiting
			const p1 = queue.next().then((v) => {
				results.push(v!)
			})
			const p2 = queue.next().then((v) => {
				results.push(v!)
			})

			// Push items
			queue.push("first")
			queue.push("second")

			await Promise.all([p1, p2])

			expect(results).toContain("first")
			expect(results).toContain("second")
		})
	})

	describe("close", () => {
		it("should return null after close", async () => {
			queue.push("item")
			queue.close()

			expect(await queue.next()).toBe("item") // existing item
			expect(await queue.next()).toBe(null) // closed
		})

		it("should resolve waiting consumers with null on close", async () => {
			const promise = queue.next()

			queue.close()

			expect(await promise).toBe(null)
		})

		it("should ignore pushes after close", async () => {
			queue.close()
			queue.push("ignored")

			expect(queue.length).toBe(0)
		})

		it("should report closed state correctly", () => {
			expect(queue.isClosed()).toBe(false)
			queue.close()
			expect(queue.isClosed()).toBe(true)
		})
	})

	describe("length and pendingConsumers", () => {
		it("should track queue length", () => {
			expect(queue.length).toBe(0)
			queue.push("a")
			expect(queue.length).toBe(1)
			queue.push("b")
			expect(queue.length).toBe(2)
		})

		it("should track pending consumers", async () => {
			expect(queue.pendingConsumers).toBe(0)

			const p1 = queue.next()
			expect(queue.pendingConsumers).toBe(1)

			const p2 = queue.next()
			expect(queue.pendingConsumers).toBe(2)

			queue.push("a")
			queue.push("b")

			await Promise.all([p1, p2])
			expect(queue.pendingConsumers).toBe(0)
		})
	})

	describe("clear", () => {
		it("should remove all items from queue", () => {
			queue.push("a")
			queue.push("b")
			expect(queue.length).toBe(2)

			queue.clear()
			expect(queue.length).toBe(0)
		})

		it("should not close the queue", () => {
			queue.push("a")
			queue.clear()
			expect(queue.isClosed()).toBe(false)

			queue.push("b")
			expect(queue.length).toBe(1)
		})
	})

	describe("async iteration", () => {
		it("should iterate over all items until closed", async () => {
			const items: string[] = []

			// Push some items and then close
			setTimeout(() => {
				queue.push("a")
				queue.push("b")
				queue.push("c")
				queue.close()
			}, 10)

			for await (const item of queue) {
				items.push(item)
			}

			expect(items).toEqual(["a", "b", "c"])
		})

		it("should handle interleaved push and consume", async () => {
			const items: string[] = []

			setTimeout(() => queue.push("1"), 10)
			setTimeout(() => queue.push("2"), 20)
			setTimeout(() => queue.push("3"), 30)
			setTimeout(() => queue.close(), 40)

			for await (const item of queue) {
				items.push(item)
			}

			expect(items).toEqual(["1", "2", "3"])
		})
	})
})
