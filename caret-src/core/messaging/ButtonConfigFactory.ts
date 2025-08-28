import type { ClineMessage } from "@shared/ExtensionMessage"
import type { Mode } from "@shared/storage/types"
import { CaretButtonConfigHandler } from "./CaretButtonConfigHandler"
import { ClineButtonConfigHandler } from "./ClineButtonConfigHandler"

export interface ButtonConfig {
	sendingDisabled: boolean
	enableButtons: boolean
	primaryText?: string
	secondaryText?: string
	primaryAction?: string
	secondaryAction?: string
}

/**
 * Factory for creating button configurations based on mode system
 * This ensures complete separation between Caret and Cline button logic
 */
export class ButtonConfigFactory {
	/**
	 * Get button configuration based on message and mode system
	 * @param message The current message
	 * @param mode The current mode ('plan' | 'act')
	 * @param modeSystem The mode system ('caret' | 'cline')
	 * @returns ButtonConfig for the message state
	 */
	static getConfig(message: ClineMessage | undefined, mode: Mode, modeSystem: "caret" | "cline"): ButtonConfig {
		if (modeSystem === "caret") {
			return CaretButtonConfigHandler.getConfig(message, mode)
		} else {
			return ClineButtonConfigHandler.getConfig(message, mode)
		}
	}
}
