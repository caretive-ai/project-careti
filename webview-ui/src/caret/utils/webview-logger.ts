import { vscode } from "../../utils/vscode"

/**
 * Represents a log entry.
 */
interface LogEntry {
	timestamp: string
	level: LogLevel
	component: string
	message: string
	data?: any
}

/**
 * Defines the log levels.
 */
export enum LogLevel {
	DEBUG = "debug",
	INFO = "info",
	WARN = "warn",
	ERROR = "error",
}

/**
 * Logger for the webview.
 * Sends log messages to the extension host and also logs to the browser console in development mode.
 * CARET MODIFICATION: Added safety checks to prevent webview loading failures
 */
class WebviewLogger {
	private component: string
	private isDev: boolean

	constructor(component: string) {
		this.component = component

		// CARET MODIFICATION: Use IS_DEV defined by Vite config (string 'true' or 'false')
		// this.isDev = typeof process !== 'undefined' && process.env?.NODE_ENV !== "production"; // Old logic
		this.isDev = process.env.IS_DEV === "true" // Vite injects IS_DEV as a string 'true' or 'false'
	}

	private log(level: LogLevel, message: string, data?: any): void {
		// Only log debug messages in development mode
		if (level === LogLevel.DEBUG && !this.isDev) {
			return
		}

		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			component: this.component,
			message,
			data,
		}

		// CARET MODIFICATION: Safe console logging (development only)
		if (this.isDev && typeof console !== "undefined") {
			try {
				switch (level) {
					case LogLevel.DEBUG:
						console.debug(`[${this.component}] ${message}`, data || "")
						break
					case LogLevel.INFO:
						console.info(`[${this.component}] ${message}`, data || "")
						break
					case LogLevel.WARN:
						console.warn(`[${this.component}] ${message}`, data || "")
						break
					case LogLevel.ERROR:
						console.error(`[${this.component}] ${message}`, data || "")
						break
					default:
						console.log(`[${this.component}] ${message}`, data || "")
				}
			} catch (consoleError) {
				// Silently ignore console errors to prevent webview loading issues
			}
		}

		// CARET MODIFICATION: Console-only logging (removed deprecated WebviewMessage 'log' type)
		// Note: Previously sent logs to Extension Host via vscode.postMessage, but this was
		// removed in Cline v3.17.13+ due to architecture simplification. Console logging only.
	}

	debug(message: string, data?: any): void {
		this.log(LogLevel.DEBUG, message, data)
	}

	info(message: string, data?: any): void {
		this.log(LogLevel.INFO, message, data)
	}

	warn(message: string, data?: any): void {
		this.log(LogLevel.WARN, message, data)
	}

	error(message: string, data?: any): void {
		this.log(LogLevel.ERROR, message, data)
	}
}

export default WebviewLogger

// Named export for convenience
export const caretWebviewLogger = new WebviewLogger("Caret")
