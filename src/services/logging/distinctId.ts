// CARET MODIFICATION: Removed node-machine-id dependency - use VS Code built-in API instead
import { v4 as uuidv4 } from "uuid"
import * as vscode from "vscode"
import { ExtensionContext } from "vscode"

/*
 * Unique identifier for the current installation.
 */
let _distinctId: string = ""

/**
 * Some environments don't return a value for the machine ID. For these situations we generated
 * a unique ID and store it locally.
 */
export const _GENERATED_MACHINE_ID_KEY = "cline.generatedMachineId"

export async function initializeDistinctId(context: ExtensionContext, uuid: () => string = uuidv4) {
	// Try to read the ID from storage.
	let distinctId = context.globalState.get<string>(_GENERATED_MACHINE_ID_KEY)

	if (!distinctId) {
		// Get the ID from the host environment.
		distinctId = await getMachineId()
	}
	if (!distinctId) {
		// Fallback to generating a unique ID and keeping in global storage.
		console.warn("No machine ID found for telemetry, generating UUID")
		// Add a prefix to the UUID so we can see in the telemetry how many clients are don't have a machine ID.
		distinctId = "cl-" + uuid()
		context.globalState.update(_GENERATED_MACHINE_ID_KEY, distinctId)
	}

	setDistinctId(distinctId)

	console.log("Telemetry distinct ID initialized:", distinctId)
}

/*
 * CARET MODIFICATION: Get machine ID using VS Code built-in API instead of node-machine-id
 * This works in VS Code environment and uses the official API
 */
async function getMachineId(): Promise<string | undefined> {
	try {
		// CARET MODIFICATION: Use VS Code's built-in machineId instead of node-machine-id package
		// This provides a deterministic ID that is unique to the machine
		// Direct vscode.env access is intentional for standalone compatibility
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const id = (vscode as any).env.machineId as string
		return id
	} catch (error) {
		console.log("Failed to get machine ID from VS Code API", error)
		return undefined
	}
}

/*
 * Set the distinct ID for logging and telemetry.
 * This is updated to Cline User ID when authenticated.
 */
export function setDistinctId(newId: string) {
	if (_distinctId && _distinctId !== newId) {
		console.log(`Changing telemetry ID from ${_distinctId} to ${newId}.`)
	}
	_distinctId = newId
}

/*
 * Unique identifier for the current user
 * If authenticated, this will be the Cline User ID.
 * Else, this will be the machine ID, or the anonymous ID as a fallback.
 */
export function getDistinctId() {
	if (!_distinctId) {
		console.error("Telemetry ID is not initialized. Call initializeDistinctId() first.")
	}
	return _distinctId
}
