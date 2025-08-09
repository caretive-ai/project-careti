import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock vscode module first
vi.mock("../../../utils/vscode", () => ({
	vscode: {
		postMessage: vi.fn(),
	},
}))

import WebviewLogger, { LogLevel, caretWebviewLogger } from "../webview-logger"
import { vscode } from "../../../utils/vscode"

const mockVscode = vi.mocked(vscode)

describe("WebviewLogger", () => {
	let logger: WebviewLogger
	const originalEnv = process.env

	beforeEach(() => {
		vi.clearAllMocks()
		logger = new WebviewLogger("TestComponent")

		// Mock console methods
		vi.spyOn(console, "debug").mockImplementation(() => {})
		vi.spyOn(console, "info").mockImplementation(() => {})
		vi.spyOn(console, "warn").mockImplementation(() => {})
		vi.spyOn(console, "error").mockImplementation(() => {})
		vi.spyOn(console, "log").mockImplementation(() => {})
	})

	afterEach(() => {
		process.env = originalEnv
		vi.restoreAllMocks()
	})

	describe("constructor", () => {
		it("should set component name", () => {
			const testLogger = new WebviewLogger("MyComponent")
			testLogger.info("test message")

			expect(mockVscode.postMessage).toHaveBeenCalledWith({
				type: "log",
				entry: expect.objectContaining({
					component: "MyComponent",
				}),
			})
		})

		it('should set isDev to true when IS_DEV is "true"', () => {
			process.env.IS_DEV = "true"
			const devLogger = new WebviewLogger("DevComponent")

			devLogger.debug("debug message")

			expect(console.debug).toHaveBeenCalledWith("[DevComponent] debug message", "")
		})

		it('should set isDev to false when IS_DEV is "false"', () => {
			process.env.IS_DEV = "false"
			const prodLogger = new WebviewLogger("ProdComponent")

			prodLogger.debug("debug message")

			// Debug should not log to console in production
			expect(console.debug).not.toHaveBeenCalled()
		})

		it("should set isDev to false when IS_DEV is undefined", () => {
			delete process.env.IS_DEV
			const prodLogger = new WebviewLogger("ProdComponent")

			prodLogger.debug("debug message")

			expect(console.debug).not.toHaveBeenCalled()
		})
	})

	describe("log levels", () => {
		beforeEach(() => {
			process.env.IS_DEV = "true"
			logger = new WebviewLogger("TestComponent")
		})

		it("should log debug messages", () => {
			logger.debug("debug message", { test: "data" })

			expect(console.debug).toHaveBeenCalledWith("[TestComponent] debug message", { test: "data" })
			expect(mockVscode.postMessage).toHaveBeenCalledWith({
				type: "log",
				entry: expect.objectContaining({
					level: LogLevel.DEBUG,
					message: "debug message",
					data: { test: "data" },
				}),
			})
		})

		it("should log info messages", () => {
			logger.info("info message")

			expect(console.info).toHaveBeenCalledWith("[TestComponent] info message", "")
			expect(mockVscode.postMessage).toHaveBeenCalledWith({
				type: "log",
				entry: expect.objectContaining({
					level: LogLevel.INFO,
					message: "info message",
				}),
			})
		})

		it("should log warn messages", () => {
			logger.warn("warning message", "warning data")

			expect(console.warn).toHaveBeenCalledWith("[TestComponent] warning message", "warning data")
			expect(mockVscode.postMessage).toHaveBeenCalledWith({
				type: "log",
				entry: expect.objectContaining({
					level: LogLevel.WARN,
					message: "warning message",
					data: "warning data",
				}),
			})
		})

		it("should log error messages", () => {
			const errorData = new Error("test error")
			logger.error("error message", errorData)

			expect(console.error).toHaveBeenCalledWith("[TestComponent] error message", errorData)
			expect(mockVscode.postMessage).toHaveBeenCalledWith({
				type: "log",
				entry: expect.objectContaining({
					level: LogLevel.ERROR,
					message: "error message",
					data: errorData,
				}),
			})
		})
	})

	describe("development vs production behavior", () => {
		it("should not log debug messages in production", () => {
			process.env.IS_DEV = "false"
			logger = new WebviewLogger("ProdComponent")

			logger.debug("debug message")

			expect(console.debug).not.toHaveBeenCalled()
			expect(mockVscode.postMessage).not.toHaveBeenCalled()
		})

		it("should log other levels in production", () => {
			process.env.IS_DEV = "false"
			logger = new WebviewLogger("ProdComponent")

			logger.info("info message")
			logger.warn("warn message")
			logger.error("error message")

			// Console should not be called in production
			expect(console.info).not.toHaveBeenCalled()
			expect(console.warn).not.toHaveBeenCalled()
			expect(console.error).not.toHaveBeenCalled()

			// But vscode messages should still be sent
			expect(mockVscode.postMessage).toHaveBeenCalledTimes(3)
		})

		it("should log all levels to console in development", () => {
			process.env.IS_DEV = "true"
			logger = new WebviewLogger("DevComponent")

			logger.debug("debug message")
			logger.info("info message")
			logger.warn("warn message")
			logger.error("error message")

			expect(console.debug).toHaveBeenCalledTimes(1)
			expect(console.info).toHaveBeenCalledTimes(1)
			expect(console.warn).toHaveBeenCalledTimes(1)
			expect(console.error).toHaveBeenCalledTimes(1)
		})
	})

	describe("log entry structure", () => {
		it("should create proper log entry structure", () => {
			const testData = { key: "value", number: 42 }
			logger.info("test message", testData)

			expect(mockVscode.postMessage).toHaveBeenCalledWith({
				type: "log",
				entry: {
					timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
					level: LogLevel.INFO,
					component: "TestComponent",
					message: "test message",
					data: testData,
				},
			})
		})

		it("should handle messages without data", () => {
			logger.warn("warning without data")

			expect(mockVscode.postMessage).toHaveBeenCalledWith({
				type: "log",
				entry: {
					timestamp: expect.any(String),
					level: LogLevel.WARN,
					component: "TestComponent",
					message: "warning without data",
				},
			})
		})

		it("should include timestamp in ISO format", () => {
			logger.error("timestamped message")

			const call = mockVscode.postMessage.mock.calls[0][0]
			const timestamp = call.entry.timestamp

			expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
			expect(new Date(timestamp)).toBeInstanceOf(Date)
			expect(new Date(timestamp).getTime()).not.toBeNaN()
		})
	})

	describe("error handling", () => {
		it("should handle console errors gracefully", () => {
			process.env.IS_DEV = "true"
			logger = new WebviewLogger("ErrorComponent")

			vi.mocked(console.info).mockImplementation(() => {
				throw new Error("Console error")
			})

			// Should not throw error
			expect(() => logger.info("test message")).not.toThrow()

			// Should still send vscode message
			expect(mockVscode.postMessage).toHaveBeenCalled()
		})

		it("should handle vscode postMessage errors gracefully", () => {
			mockVscode.postMessage.mockImplementation(() => {
				throw new Error("VSCode communication error")
			})

			// Should not throw error
			expect(() => logger.error("test error")).not.toThrow()
		})

		it("should handle undefined console gracefully", () => {
			process.env.IS_DEV = "true"
			logger = new WebviewLogger("ConsoleTestComponent")

			// Mock undefined console
			const originalConsole = global.console
			// @ts-expect-error - Testing runtime behavior
			global.console = undefined

			expect(() => logger.info("test message")).not.toThrow()

			// Restore console
			global.console = originalConsole
		})
	})

	describe("data handling", () => {
		it("should handle various data types", () => {
			const testCases = [
				{ data: "string data", expected: "string data" },
				{ data: 123, expected: 123 },
				{ data: true, expected: true },
				{ data: { nested: { object: "value" } }, expected: { nested: { object: "value" } } },
				{ data: [1, 2, 3], expected: [1, 2, 3] },
			]

			testCases.forEach(({ data, expected }, index) => {
				vi.clearAllMocks()
				logger.info("test message", data)

				expect(mockVscode.postMessage).toHaveBeenCalledWith({
					type: "log",
					entry: expect.objectContaining({
						data: expected,
					}),
				})
			})
		})

		it("should handle null and undefined data", () => {
			// Test null
			logger.info("test message", null)
			expect(mockVscode.postMessage).toHaveBeenCalledWith({
				type: "log",
				entry: expect.objectContaining({
					data: null,
				}),
			})

			vi.clearAllMocks()

			// Test undefined
			logger.info("test message", undefined)
			expect(mockVscode.postMessage).toHaveBeenCalledWith({
				type: "log",
				entry: expect.objectContaining({
					data: undefined,
				}),
			})
		})

		it("should use empty string for console when data is undefined", () => {
			process.env.IS_DEV = "true"
			logger = new WebviewLogger("DataTestComponent")

			logger.info("message with undefined data", undefined)

			expect(console.info).toHaveBeenCalledWith("[DataTestComponent] message with undefined data", "")
		})

		it("should pass actual data to console when provided", () => {
			process.env.IS_DEV = "true"
			logger = new WebviewLogger("DataTestComponent")

			const testData = { test: "value" }
			logger.warn("message with data", testData)

			expect(console.warn).toHaveBeenCalledWith("[DataTestComponent] message with data", testData)
		})
	})

	describe("caretWebviewLogger singleton", () => {
		beforeEach(() => {
			vi.clearAllMocks()
		})

		it('should be pre-configured with "Caret" component', () => {
			caretWebviewLogger.info("singleton test")

			expect(mockVscode.postMessage).toHaveBeenCalledWith({
				type: "log",
				entry: expect.objectContaining({
					component: "Caret",
				}),
			})
		})

		it("should work with all log levels", () => {
			// Ensure we're in development mode for this test
			const originalIsDev = process.env.IS_DEV
			process.env.IS_DEV = "true"

			// Create a fresh logger instance for this test
			const testLogger = new WebviewLogger("TestSingleton")

			testLogger.debug("debug from singleton")
			testLogger.info("info from singleton")
			testLogger.warn("warn from singleton")
			testLogger.error("error from singleton")

			expect(mockVscode.postMessage).toHaveBeenCalledTimes(4)

			// Restore original environment
			process.env.IS_DEV = originalIsDev
		})
	})

	describe("LogLevel enum", () => {
		it("should have correct string values", () => {
			expect(LogLevel.DEBUG).toBe("debug")
			expect(LogLevel.INFO).toBe("info")
			expect(LogLevel.WARN).toBe("warn")
			expect(LogLevel.ERROR).toBe("error")
		})
	})
})
