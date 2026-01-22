import { Controller } from "@core/controller"
import { PersonaProfile } from "@shared/proto/careti/persona"
import { writeFile } from "@utils/fs"
import * as fs from "fs/promises"
import * as path from "path"
import { ensureRulesDirectoryExists, GlobalFileNames } from "@/core/storage/disk"
import { Logger } from "@/services/logging/Logger"
import { SimplePersona, SimplePersonaImages } from "./simple-persona"

// CARETI MODIFICATION: Constants for persona image filenames and directory
const PERSONA_CONSTANTS = {
	IMAGES_DIR: "personas",
	PROFILE_IMAGE: "agent_profile.webp",
	THINKING_IMAGE: "agent_thinking.webp",
	LEGACY_PROFILE_IMAGE: "agent_profile.png",
	LEGACY_THINKING_IMAGE: "agent_thinking.png",
} as const

// CARETI MODIFICATION: Helpers for safely handling image buffers/data URLs across png/webp.
export const detectImageMimeType = (buffer: Buffer): string => {
	// WebP: RIFF....WEBP
	if (
		buffer.length >= 12 &&
		buffer.toString("ascii", 0, 4) === "RIFF" &&
		buffer.toString("ascii", 8, 12) === "WEBP"
	) {
		return "image/webp"
	}
	// PNG: 89 50 4E 47 0D 0A 1A 0A
	if (
		buffer.length >= 8 &&
		buffer[0] === 0x89 &&
		buffer[1] === 0x50 &&
		buffer[2] === 0x4e &&
		buffer[3] === 0x47 &&
		buffer[4] === 0x0d &&
		buffer[5] === 0x0a &&
		buffer[6] === 0x1a &&
		buffer[7] === 0x0a
	) {
		return "image/png"
	}
	// JPEG: FF D8 FF
	if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
		return "image/jpeg"
	}
	// GIF: GIF87a / GIF89a
	if (buffer.length >= 6 && buffer.toString("ascii", 0, 3) === "GIF") {
		return "image/gif"
	}
	return "image/png"
}

export const bufferToDataUrl = (buffer: Buffer): string => {
	const mimeType = detectImageMimeType(buffer)
	return `data:${mimeType};base64,${buffer.toString("base64")}`
}

export const decodeBase64ImageDataUrl = (dataUrl: string): Buffer | undefined => {
	if (!dataUrl.startsWith("data:image/")) {
		return undefined
	}
	const base64Marker = ";base64,"
	const markerIndex = dataUrl.indexOf(base64Marker)
	if (markerIndex === -1) {
		return undefined
	}
	const base64Part = dataUrl.slice(markerIndex + base64Marker.length)
	if (!base64Part) {
		return undefined
	}
	return Buffer.from(base64Part, "base64")
}

export class PersonaStorage {
	public async getPersona(_controller: Controller): Promise<SimplePersona> {
		const rulesDir = await ensureRulesDirectoryExists()
		const personaMdPath = path.join(rulesDir, GlobalFileNames.persona)
		let name = "Default"
		let description = "Default Persona"
		let customInstruction = "{}"

		try {
			const content = await fs.readFile(personaMdPath, "utf-8")
			const parsedContent = JSON.parse(content)
			name = parsedContent?.persona?.name || name
			description = parsedContent?.persona?.description || description
			customInstruction = content
		} catch (error) {
			Logger.warn(`[CARET-PERSONA] getPersona: Could not read or parse persona.md, using defaults. Error: ${error}`)
		}

		return { name, description, customInstruction }
	}

	public async loadSimplePersonaImages(controller: Controller): Promise<SimplePersonaImages | null> {
		try {
			// Load persona images from globalStorage file system
			const personaDir = path.join(controller.context.globalStorageUri.fsPath, PERSONA_CONSTANTS.IMAGES_DIR)
			const profileWebpPath = path.join(personaDir, PERSONA_CONSTANTS.PROFILE_IMAGE)
			const thinkingWebpPath = path.join(personaDir, PERSONA_CONSTANTS.THINKING_IMAGE)
			const profilePngPath = path.join(personaDir, PERSONA_CONSTANTS.LEGACY_PROFILE_IMAGE)
			const thinkingPngPath = path.join(personaDir, PERSONA_CONSTANTS.LEGACY_THINKING_IMAGE)

			const { fileExistsAtPath } = await import("@utils/fs")

			const profilePath = (await fileExistsAtPath(profileWebpPath)) ? profileWebpPath : profilePngPath
			const thinkingPath = (await fileExistsAtPath(thinkingWebpPath)) ? thinkingWebpPath : thinkingPngPath

			if (!(await fileExistsAtPath(profilePath)) || !(await fileExistsAtPath(thinkingPath))) {
				return null
			}

			const avatar = await fs.readFile(profilePath)
			const thinkingAvatar = await fs.readFile(thinkingPath)

			return { avatar, thinkingAvatar }
		} catch (error) {
			Logger.error(`Failed to load persona images: ${error}`)
			return null
		}
	}

	public async savePersonaProfile(_controller: Controller, profile: PersonaProfile): Promise<void> {
		Logger.info(`Saving persona profile for: ${profile.name}`)
		try {
			const rulesDir = await ensureRulesDirectoryExists()
			const personaMdPath = path.join(rulesDir, GlobalFileNames.persona)

			await writeFile(personaMdPath, profile.customInstruction)
			Logger.debug(`Persona profile saved to ${personaMdPath}`)
		} catch (error) {
			Logger.error(`Failed to save persona profile: ${error}`)
			throw error
		}
	}

	public async savePersonaImages(controller: Controller, images: SimplePersonaImages): Promise<void> {
		try {
			// Save persona images to globalStorage file system
			const personaDir = path.join(controller.context.globalStorageUri.fsPath, PERSONA_CONSTANTS.IMAGES_DIR)

			await fs.mkdir(personaDir, { recursive: true })

			const profilePath = path.join(personaDir, PERSONA_CONSTANTS.PROFILE_IMAGE)
			const thinkingPath = path.join(personaDir, PERSONA_CONSTANTS.THINKING_IMAGE)

			await fs.writeFile(profilePath, images.avatar)
			await fs.writeFile(thinkingPath, images.thinkingAvatar)
		} catch (error) {
			Logger.error(`Failed to save persona images: ${error}`)
			throw error
		}
	}
}
