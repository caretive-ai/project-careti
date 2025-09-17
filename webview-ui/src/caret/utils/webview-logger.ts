/**
 * CARET MODIFICATION: A simple logger for the webview.
 * This logger wraps the standard console logging methods and prefixes them with a component name.
 * It only outputs logs in development mode to keep the production console clean.
 */
class CaretWebviewLogger {
	private component: string
	private isDev: boolean

	constructor(name: string) {
		this.component = name
		this.isDev = process.env.NODE_ENV === "development"
	}

	private log(level: "debug" | "info" | "warn" | "error", message: string, data?: any): void {
		if (!this.isDev || typeof console === "undefined") {
			return
		}

		try {
			const finalData = data || ""
			const logMessage = `[${this.component}] ${message}`

			switch (level) {
				case "debug":
					console.debug(logMessage, finalData)
					break
				case "info":
					console.info(logMessage, finalData)
					break
				case "warn":
					console.warn(logMessage, finalData)
					break
				case "error":
					console.error(logMessage, finalData)
					break
			}
		} catch (_e) {
			// Silently ignore console errors.
		}
	}

	debug(message: string, data?: any): void {
		this.log("debug", message, data)
	}

	info(message: string, data?: any): void {
		this.log("info", message, data)
	}

	warn(message: string, data?: any): void {
		this.log("warn", message, data)
	}

	error(message: string, data?: any): void {
		this.log("error", message, data)
	}
}

export { CaretWebviewLogger }
export const caretWebviewLogger = new CaretWebviewLogger("CaretWebview")
