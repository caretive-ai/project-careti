import * as vscode from "vscode"
import { Controller as ClineController } from "../../../src/core/controller"

/**
 * CARET MODIFICATION: CaretController extends ClineController
 * Adds Caret-specific functionality while maintaining compatibility with Cline's core features
 */
export class CaretController extends ClineController {
	constructor(
		context: vscode.ExtensionContext,
		postMessage: (message: any) => Thenable<boolean> | undefined,
		clientId: string,
	) {
		// Call parent constructor
		super(context, postMessage, clientId)
	}

	// CARET MODIFICATION: Add Caret-specific methods here
	// This will handle proto/caret/ specific protocols and features

	// TODO: Add Caret-specific overrides and extensions
}

// Export as Controller for backward compatibility
export { CaretController as Controller }

// Re-export types and utilities from Cline Controller if needed
export type {} from "../../../src/core/controller"
