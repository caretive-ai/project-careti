// CARET MODIFICATION: Added console filtering for cleaner test output. Original backed up as setupTests-ts.cline
import "@testing-library/jest-dom"
import { vi } from "vitest"

// "Official" jest workaround for mocking window.matchMedia()
// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom

// Mock console.log and console.error to reduce noise during tests
const originalConsoleLog = console.log
const originalConsoleError = console.error

// Filter out noisy grpc and postMessage logs
console.log = (...args) => {
	const message = args.join(' ')
	if (
		message.includes('postMessage fallback') ||
		message.includes('[DEBUG] Sent cancellation') ||
		message.includes('grpc_request') ||
		message.includes('Client ID not found')
	) {
		return // Skip noisy logs
	}
	originalConsoleLog(...args)
}

console.error = (...args) => {
	const message = args.join(' ')
	if (
		message.includes('Client ID not found') ||
		message.includes('postMessage fallback')
	) {
		return // Skip noisy errors
	}
	originalConsoleError(...args)
}

Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(), // Deprecated
		removeListener: vi.fn(), // Deprecated
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
})
