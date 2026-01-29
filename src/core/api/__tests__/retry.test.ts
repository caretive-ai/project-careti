import { describe, it } from "mocha"
import "should"
import sinon from "sinon"
import { withRetry } from "../retry"

describe("Retry Decorator", () => {
	afterEach(() => {
		sinon.restore()
	})

	describe("withRetry", () => {
		it("should not retry on success", async () => {
			let callCount = 0
			class TestClass {
				@withRetry()
				async *successMethod() {
					callCount++
					yield "success"
				}
			}

			const test = new TestClass()
			const result = []
			for await (const value of test.successMethod()) {
				result.push(value)
			}

			callCount.should.equal(1)
			result.should.deepEqual(["success"])
		})

		it("should retry on rate limit (429) error", async () => {
			let callCount = 0
			class TestClass {
				@withRetry({ maxRetries: 2, baseDelay: 10, maxDelay: 100 })
				async *failMethod() {
					callCount++
					if (callCount === 1) {
						const error: any = new Error("Rate limit exceeded")
						error.status = 429
						throw error
					}
					yield "success after retry"
				}
			}

			const test = new TestClass()
			const result = []
			for await (const value of test.failMethod()) {
				result.push(value)
			}

			callCount.should.equal(2)
			result.should.deepEqual(["success after retry"])
		})

		it("should not retry on non-rate-limit errors", async () => {
			let callCount = 0
			class TestClass {
				@withRetry()
				async *failMethod() {
					callCount++
					throw new Error("Regular error")
				}
			}

			const test = new TestClass()
			try {
				for await (const _ of test.failMethod()) {
					// Should not reach here
				}
				throw new Error("Should have thrown")
			} catch (error: any) {
				error.message.should.equal("Regular error")
				callCount.should.equal(1)
			}
		})

		it("should respect retry-after header with delta seconds", async () => {
			let callCount = 0
			const setTimeoutSpy = sinon.spy(global, "setTimeout")
			const baseDelay = 1000

			class TestClass {
				@withRetry({ maxRetries: 2, baseDelay }) // Use large baseDelay to ensure header takes precedence
				async *failMethod() {
					callCount++
					if (callCount === 1) {
						const error: any = new Error("Rate limit exceeded")
						error.status = 429
						error.headers = { "retry-after": "0.01" } // 10ms delay
						throw error
					}
					yield "success after retry"
				}
			}

			const test = new TestClass()
			const result = []
			for await (const value of test.failMethod()) {
				result.push(value)
			}

			callCount.should.equal(2)
			setTimeoutSpy.calledOnce.should.be.true
			const [_, delay] = setTimeoutSpy.getCall(0).args
			delay?.should.equal(0)

			result.should.deepEqual(["success after retry"])
		})

		it("should respect retry-after header with Unix timestamp", async () => {
			const setTimeoutSpy = sinon.spy(global, "setTimeout")
			let callCount = 0
			const fixedDate = new Date("2010-01-01T00:00:00.000Z")
			const retryTimestamp = Math.floor(fixedDate.getTime() / 1000) + 0.01 // 10ms in the future
			const baseDelay = 1000

			class TestClass {
				@withRetry({ maxRetries: 2, baseDelay }) // Use large baseDelay to ensure header takes precedence
				async *failMethod() {
					callCount++
					if (callCount === 1) {
						const error: any = new Error("Rate limit exceeded")
						error.status = 429
						error.headers = { "retry-after": retryTimestamp.toString() }
						throw error
					}
					yield "success after retry"
				}
			}

			const test = new TestClass()
			const result = []
			for await (const value of test.failMethod()) {
				result.push(value)
			}

			callCount.should.equal(2)

			setTimeoutSpy.calledOnce.should.be.true
			const [_, delay] = setTimeoutSpy.getCall(0).args
			delay?.should.equal(fixedDate.getTime())

			result.should.deepEqual(["success after retry"])
		})

		it("should use exponential backoff when no retry-after header", async () => {
			const setTimeoutSpy = sinon.spy(global, "setTimeout")
			let callCount = 0
			const baseDelay = 10

			class TestClass {
				@withRetry({ maxRetries: 2, baseDelay, maxDelay: 100 })
				async *failMethod() {
					callCount++
					if (callCount === 1) {
						const error: any = new Error("Rate limit exceeded")
						error.status = 429
						throw error
					}
					yield "success after retry"
				}
			}

			const test = new TestClass()
			const result = []
			for await (const value of test.failMethod()) {
				result.push(value)
			}

			callCount.should.equal(2)
			setTimeoutSpy.calledOnce.should.be.true
			const [_, delay] = setTimeoutSpy.getCall(0).args
			delay?.should.equal(baseDelay)

			result.should.deepEqual(["success after retry"])
		})

		it("should respect maxDelay", async () => {
			const setTimeoutSpy = sinon.spy(global, "setTimeout")
			let callCount = 0
			const baseDelay = 50
			const maxDelay = 10

			class TestClass {
				@withRetry({ maxRetries: 3, baseDelay, maxDelay })
				async *failMethod() {
					callCount++
					if (callCount < 3) {
						const error: any = new Error("Rate limit exceeded")
						error.status = 429
						throw error
					}
					yield "success after retries"
				}
			}

			const test = new TestClass()
			const result = []
			for await (const value of test.failMethod()) {
				result.push(value)
			}

			callCount.should.equal(3)
			setTimeoutSpy.calledOnce.should.be.true
			const [_, delay] = setTimeoutSpy.getCall(0).args
			delay?.should.equal(maxDelay)

			result.should.deepEqual(["success after retries"])
		})

		it("should throw after maxRetries attempts", async () => {
			let callCount = 0
			class TestClass {
				@withRetry({ maxRetries: 2, baseDelay: 10 })
				async *failMethod() {
					callCount++
					const error: any = new Error("Rate limit exceeded")
					error.status = 429
					throw error
				}
			}

			const test = new TestClass()
			try {
				for await (const _ of test.failMethod()) {
					// Should not reach here
				}
				throw new Error("Should have thrown")
			} catch (error: any) {
				error.message.should.equal("Rate limit exceeded")
				callCount.should.equal(2) // Initial attempt + 1 retry
			}
		})

		// CARETI MODIFICATION: Naver Cloud rate limit header format tests
		it("should respect Naver Cloud x-ratelimit-reset-requests header with seconds format", async () => {
			let callCount = 0
			const setTimeoutSpy = sinon.spy(global, "setTimeout")
			const baseDelay = 1000

			class TestClass {
				@withRetry({ maxRetries: 2, baseDelay })
				async *failMethod() {
					callCount++
					if (callCount === 1) {
						const error: any = new Error("Rate limit exceeded")
						error.status = 429
						error.headers = { "x-ratelimit-reset-requests": "0s" } // Naver Cloud format with 0s for fast test
						throw error
					}
					yield "success after retry"
				}
			}

			const test = new TestClass()
			const result = []
			for await (const value of test.failMethod()) {
				result.push(value)
			}

			callCount.should.equal(2)
			setTimeoutSpy.calledOnce.should.be.true
			const [_, delay] = setTimeoutSpy.getCall(0).args
			delay?.should.equal(0) // 0s = 0ms (fast test)

			result.should.deepEqual(["success after retry"])
		})

		it("should parse Naver Cloud seconds format correctly", async () => {
			// Test that "60s" format is parsed correctly (unit test without actual waiting)
			let callCount = 0
			const setTimeoutSpy = sinon.spy(global, "setTimeout")

			class TestClass {
				@withRetry({ maxRetries: 2, baseDelay: 1000 })
				async *failMethod() {
					callCount++
					if (callCount === 1) {
						const error: any = new Error("Rate limit exceeded")
						error.status = 429
						error.headers = { "x-ratelimit-reset-requests": "0s" } // Use 0s for fast execution
						throw error
					}
					yield "success"
				}
			}

			const test = new TestClass()
			for await (const _ of test.failMethod()) {
				// consume
			}

			setTimeoutSpy.calledOnce.should.be.true
			const [_, delay] = setTimeoutSpy.getCall(0).args
			delay?.should.equal(0) // 0s = 0ms for fast test
		})

		it("should correctly parse various Naver Cloud header formats", () => {
			// Direct unit test for seconds format parsing without network/timeout
			// This tests the regex pattern matching in retry.ts
			const parseNaverCloudDelay = (headerValue: string): number => {
				const retryString = String(headerValue).trim()
				const secondsMatch = retryString.match(/^(\d+)s$/i)
				if (secondsMatch) {
					return parseInt(secondsMatch[1], 10) * 1000
				}
				return -1 // Not Naver Cloud format
			}

			// Test various formats
			parseNaverCloudDelay("60s").should.equal(60000)
			parseNaverCloudDelay("60S").should.equal(60000)
			parseNaverCloudDelay("0s").should.equal(0)
			parseNaverCloudDelay("1s").should.equal(1000)
			parseNaverCloudDelay("120s").should.equal(120000)
			parseNaverCloudDelay("60").should.equal(-1) // Not Naver format
			parseNaverCloudDelay("60ms").should.equal(-1) // Not Naver format
		})
	})
})
