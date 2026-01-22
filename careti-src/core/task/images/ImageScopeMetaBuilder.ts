import type { ImageScopeResult } from "./ImageScopeResolver"

export const buildImageScopeMeta = (scope: ImageScopeResult): string | null => {
	if (!scope.applied) {
		return null
	}

	const lines: string[] = []
	lines.push("<image_scope>")

	if (scope.currentImageIds.length > 0) {
		lines.push(`Current attachments: ${scope.currentImageIds.join(", ")}`)
	} else {
		lines.push("Current attachments: (none)")
	}

	const referenced = scope.selectedImageIds.filter((id) => !scope.currentImageIds.includes(id))
	if (referenced.length > 0) {
		lines.push(`Referenced history: ${referenced.join(", ")}`)
	} else {
		lines.push("Referenced history: (none)")
	}

	if (scope.missingImageIds.length > 0) {
		lines.push(`Missing references: ${scope.missingImageIds.join(", ")}`)
	}

	lines.push("Rule: use current attachments only unless explicitly referenced.")
	lines.push("</image_scope>")

	return lines.join("\n")
}
