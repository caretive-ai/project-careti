import React from "react"
import { ExtensionState } from "../../../src/shared/ExtensionMessage"

export type CaretExtensionState = ExtensionState & {
	promptSystemMode?: "caret" | "cline"
}

export const ExtensionStateContext = React.createContext<CaretExtensionState | undefined>(undefined)
