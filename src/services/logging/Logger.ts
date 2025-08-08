// CARET MODIFICATION: Logger.ts를 CaretLogger와 유사한 기능으로 통합하되, Cline의 HostProvider 구조를 따름.
// 개발 모드에서만 DEBUG, TRACE 로그를 출력하도록 필터링 기능을 유지.
import { HostProvider } from "@/hosts/host-provider"
import { ErrorService } from "../error/ErrorService"

/**
 * Simple logging utility for the extension's backend code.
 */
export class Logger {
	static error(message: string, error?: Error) {
		Logger.#output("ERROR", message, error)
		ErrorService.logMessage(message, "error")
		error && ErrorService.logException(error)
	}

	static warn(message: string) {
		Logger.#output("WARN", message)
		ErrorService.logMessage(message, "warning")
	}

	static log(message: string) {
		Logger.#output("LOG", message)
	}

	static debug(message: string) {
		// CARET MODIFICATION: 개발 모드에서만 디버그 로그 출력
		if (process.env.IS_DEV !== "true") {return}
		Logger.#output("DEBUG", message)
	}

	static info(message: string) {
		Logger.#output("INFO", message)
	}

	static trace(message: string) {
		// CARET MODIFICATION: 개발 모드에서만 트레이스 로그 출력
		if (process.env.IS_DEV !== "true") {return}
		Logger.#output("TRACE", message)
	}

	static #output(level: string, message: string, error?: Error) {
		let fullMessage = message
		if (error?.message) {
			fullMessage += ` ${error.message}`
		}
		HostProvider.get().logToChannel(`${level} ${fullMessage}`)
		if (error?.stack) {
			console.log(`Stack trace:\n${error.stack}`)
		}
	}
}
