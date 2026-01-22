import React from "react"
import { ExtensionState } from "../../../src/shared/ExtensionMessage"

export type CaretExtensionState = ExtensionState & {
	promptSystemMode?: "careti" | "cline"
}

export const ExtensionStateContext = React.createContext<CaretExtensionState | undefined>(undefined)
