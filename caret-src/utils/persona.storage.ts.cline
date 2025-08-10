import * as vscode from "vscode"
import * as fs from "fs/promises"
import * as path from "path"
import { caretLogger } from "./caret-logger"

// CARET MODIFICATION: 새로운 globalStorage 기반 페르소나 이미지 시스템
export interface PersonaStorageImages {
	avatarUri: string // vscode-file:// 프로토콜 사용
	thinkingAvatarUri: string // vscode-file:// 프로토콜 사용
}

/**
 * globalStorage에 personas 디렉토리를 생성하고 경로를 반환
 */
export async function ensurePersonaDirectoryExists(context: vscode.ExtensionContext): Promise<string> {
	try {
		const personaDir = path.join(context.globalStorageUri.fsPath, "personas")
		await fs.mkdir(personaDir, { recursive: true })

		caretLogger.debug(`Persona directory ensured: ${personaDir}`)
		return personaDir
	} catch (error) {
		caretLogger.error(`Failed to create persona directory: ${error}`)
		throw error
	}
}

/**
 * 첫 실행 시 기본 이미지를 globalStorage로 복사
 * 이미 존재하면 복사하지 않음
 */
export async function initializeDefaultPersonaImages(context: vscode.ExtensionContext): Promise<void> {
	try {
		const personaDir = await ensurePersonaDirectoryExists(context)
		const profilePath = path.join(personaDir, "agent_profile.png")
		const thinkingPath = path.join(personaDir, "agent_thinking.png")

		// 프로필 이미지 복사 (없을 때만)
		try {
			await fs.access(profilePath)
			caretLogger.debug("agent_profile.png already exists, skipping copy")
		} catch {
			// 파일이 없으면 기본 이미지 복사
			const defaultProfile = path.join(context.extensionPath, "caret-assets/agent_profile.png")
			await fs.copyFile(defaultProfile, profilePath)
			caretLogger.info("Default agent_profile.png copied to globalStorage")
		}

		// 생각 중 이미지 복사 (없을 때만)
		try {
			await fs.access(thinkingPath)
			caretLogger.debug("agent_thinking.png already exists, skipping copy")
		} catch {
			// 파일이 없으면 기본 이미지 복사
			const defaultThinking = path.join(context.extensionPath, "caret-assets/agent_thinking.png")
			await fs.copyFile(defaultThinking, thinkingPath)
			caretLogger.info("Default agent_thinking.png copied to globalStorage")
		}
	} catch (error) {
		caretLogger.error(`Failed to initialize default persona images: ${error}`)
		throw error
	}
}

/**
 * globalStorage에서 페르소나 이미지를 웹뷰 안전 URI로 로드
 */
export async function loadPersonaImagesFromStorage(context: vscode.ExtensionContext): Promise<PersonaStorageImages> {
	try {
		const personaDir = await ensurePersonaDirectoryExists(context)
		const profilePath = path.join(personaDir, "agent_profile.png")
		const thinkingPath = path.join(personaDir, "agent_thinking.png")

		// CARET MODIFICATION: Convert to base64 for CSP compliance
		try {
			const profileBuffer = await fs.readFile(profilePath)
			const thinkingBuffer = await fs.readFile(thinkingPath)

			const avatarUri = `data:image/png;base64,${profileBuffer.toString("base64")}`
			const thinkingAvatarUri = `data:image/png;base64,${thinkingBuffer.toString("base64")}`

			caretLogger.debug(
				`Loaded persona images as base64: ${avatarUri.slice(0, 50)}..., ${thinkingAvatarUri.slice(0, 50)}...`,
			)

			return {
				avatarUri,
				thinkingAvatarUri,
			}
		} catch (error) {
			caretLogger.warn(`Failed to read persona image files: ${error}`)
			return {
				avatarUri: "",
				thinkingAvatarUri: "",
			}
		}
	} catch (error) {
		caretLogger.error(`Failed to load persona images from storage: ${error}`)
		// 에러 시 빈 URI 반환
		return {
			avatarUri: "",
			thinkingAvatarUri: "",
		}
	}
}

/**
 * 커스텀 이미지를 globalStorage에 저장하고 파일 URI 반환
 */
export async function saveCustomPersonaImage(
	context: vscode.ExtensionContext,
	imageType: "normal" | "thinking",
	base64Data: string,
): Promise<string> {
	try {
		const personaDir = await ensurePersonaDirectoryExists(context)
		const fileName = imageType === "normal" ? "agent_profile.png" : "agent_thinking.png"
		const imagePath = path.join(personaDir, fileName)

		caretLogger.debug(`Saving custom persona image: ${imageType} -> ${imagePath}`)

		// base64 데이터 유효성 검증 및 변환
		const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, "")

		// CARET MODIFICATION: Base64 유효성 검증
		if (!base64String || base64String.length === 0) {
			throw new Error("Empty base64 data")
		}

		// Base64 형식 검증 (RFC 4648 기준)
		const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
		if (!base64Regex.test(base64String)) {
			throw new Error("Invalid base64 format")
		}

		// 최소 이미지 데이터 크기 검증 (10바이트 이상)
		const imageBuffer = Buffer.from(base64String, "base64")
		if (imageBuffer.length < 10) {
			throw new Error("Invalid image data: too small")
		}

		// globalStorage에 이미지 저장
		await fs.writeFile(imagePath, imageBuffer)

		// CARET MODIFICATION: Return base64 for CSP compliance
		const savedImageBase64 = `data:image/png;base64,${imageBuffer.toString("base64")}`
		caretLogger.info(`Custom persona image saved successfully: ${fileName} (${imageBuffer.length} bytes) -> base64 data`)

		return savedImageBase64
	} catch (error) {
		caretLogger.error(`Failed to save custom persona image: ${error}`)
		throw error
	}
}

/**
 * 템플릿 캐릭터 선택 시 해당 이미지를 globalStorage로 복사
 */
export async function replacePersonaImageFromTemplate(
	context: vscode.ExtensionContext,
	imageType: "normal" | "thinking",
	templateImagePath: string,
): Promise<void> {
	try {
		const personaDir = await ensurePersonaDirectoryExists(context)
		const fileName = imageType === "normal" ? "agent_profile.png" : "agent_thinking.png"
		const targetPath = path.join(personaDir, fileName)

		caretLogger.debug(`Replacing persona image from template: ${templateImagePath} -> ${targetPath}`)

		// 템플릿 이미지를 globalStorage로 복사
		await fs.copyFile(templateImagePath, targetPath)

		caretLogger.info(`Persona image replaced from template: ${fileName}`)
	} catch (error) {
		caretLogger.error(`Failed to replace persona image from template: ${error}`)
		throw error
	}
}
