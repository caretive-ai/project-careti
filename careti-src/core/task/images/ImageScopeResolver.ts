import { normalizeImageId } from "@careti/shared/images/image-id"
import type { ImageAttachmentSet, ImageRegistry } from "./ImageRegistry"

const IMAGE_ID_REGEX = /\bimg-[0-9a-f]{6,16}\b/gi

const PREVIOUS_IMAGE_KEYWORDS = [
	"이전 이미지",
	"지난번 이미지",
	"직전 이미지",
	"방금 만든 이미지",
	"이전에 만든 이미지",
	"previous image",
	"last image",
	"earlier image",
]

export type ImageScopeResult = {
	applied: boolean
	currentImageIds: string[]
	selectedImageIds: string[]
	explicitImageIds: string[]
	previousSetId?: string
	missingImageIds: string[]
}

export class ImageScopeResolver {
	constructor(private registry: ImageRegistry) {}

	private extractExplicitIds(text: string): string[] {
		const matches = text.match(IMAGE_ID_REGEX) ?? []
		return matches.map((value) => normalizeImageId(value))
	}

	private wantsPreviousImages(text: string): boolean {
		const normalized = text.toLowerCase()
		return PREVIOUS_IMAGE_KEYWORDS.some((keyword) => normalized.includes(keyword))
	}

	resolve(params: { userText: string; currentImageIds: string[]; currentSetId?: string }): ImageScopeResult {
		const { userText, currentImageIds, currentSetId } = params
		const explicitImageIds = this.extractExplicitIds(userText)
		const wantsPrevious = this.wantsPreviousImages(userText)

		const resolvedExplicit = explicitImageIds.filter((id) => this.registry.getImage(id))
		const missingImageIds = explicitImageIds.filter((id) => !this.registry.getImage(id))

		let previousSet: ImageAttachmentSet | undefined
		if (wantsPrevious) {
			previousSet = this.registry.getLatestAttachmentSet("user", currentSetId)
		}

		const selected = new Set<string>()
		for (const id of currentImageIds) {
			selected.add(id)
		}
		for (const id of resolvedExplicit) {
			selected.add(id)
		}
		for (const id of previousSet?.imageIds ?? []) {
			selected.add(id)
		}

		const applied = currentImageIds.length > 0 || explicitImageIds.length > 0 || wantsPrevious

		return {
			applied,
			currentImageIds,
			selectedImageIds: Array.from(selected),
			explicitImageIds: resolvedExplicit,
			previousSetId: previousSet?.id,
			missingImageIds,
		}
	}
}
