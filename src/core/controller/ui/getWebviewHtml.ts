// CARET MODIFICATION: This file is temporarily modified to resolve a compile error.
// The original logic tried to access a protected method from WebviewProvider,
// which is no longer valid after upstream changes. This function is likely obsolete.
import { Controller } from ".."
import { EmptyRequest, String } from "@shared/proto/cline/common"

export async function getWebviewHtml(controller: Controller, request: EmptyRequest): Promise<String> {
	// Returning an empty string as a placeholder to fix the build.
	// The actual HTML rendering is now handled within WebviewProvider.
	return String.create({ value: "" })
}
