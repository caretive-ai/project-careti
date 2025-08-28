const isDev = process.env.NODE_ENV === "development"

const log = (level: "debug" | "info" | "warn" | "error", ...args: any[]) => {
	if (isDev) {
		console[level]("[CARET-UI]", ...args)
	}
}

export const logger = {
	debug: (...args: any[]) => log("debug", ...args),
	info: (...args: any[]) => log("info", ...args),
	warn: (...args: any[]) => log("warn", ...args),
	error: (...args: any[]) => log("error", ...args),
}
