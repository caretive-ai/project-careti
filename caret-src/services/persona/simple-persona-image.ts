import * as fs from "fs/promises"
import * as path from "path"
import { Logger } from "@services/logging/Logger"

// CARET MODIFICATION: 단순한 2파일 페르소나 이미지 시스템
export interface SimplePersonaImages {
	avatarUri: string
	thinkingAvatarUri: string
}

/**
 * agent_profile.png와 agent_thinking.png 파일을 직접 로드하여 base64 URI 반환
 * 파일이 없는 경우 template_characters.json에서 기본 이미지를 복사하여 생성
 */
export async function loadSimplePersonaImages(extensionPath: string): Promise<SimplePersonaImages> {
	try {
		const agentProfilePath = path.join(extensionPath, "caret-assets/agent_profile.png")
		const agentThinkingPath = path.join(extensionPath, "caret-assets/agent_thinking.png")

		Logger.debug(`Loading simple persona images from: ${agentProfilePath}, ${agentThinkingPath}`)

		// 파일이 없는 경우 기본 이미지 생성 시도
		let profileExists = false
		let thinkingExists = false

		try {
			await fs.access(agentProfilePath)
			profileExists = true
		} catch (error) {
			profileExists = false
		}

		try {
			await fs.access(agentThinkingPath)
			thinkingExists = true
		} catch (error) {
			thinkingExists = false
		}

		// 파일이 없으면 기본 이미지 생성
		if (!profileExists || !thinkingExists) {
			Logger.info("Persona images not found. Creating default images...")
			try {
				// template_characters.json 파일에서 기본 페르소나 찾기
				const templatePath = path.join(extensionPath, "caret-assets/template_characters/template_characters.json")
				const templatesRaw = await fs.readFile(templatePath, "utf-8")
				const templates = JSON.parse(templatesRaw)

				// isDefault: true 설정된 기본 페르소나 찾기
				const defaultPersona = templates.find((char: any) => char.isDefault === true) || templates[0]

				if (defaultPersona) {
					// 기본 이미지 복사
					const normalImagePath = path.join(extensionPath, defaultPersona.avatarUri.replace("asset:/", ""))
					const thinkingImagePath = path.join(extensionPath, defaultPersona.thinkingAvatarUri.replace("asset:/", ""))

					// 대상 디렉토리 생성
					const targetDir = path.dirname(agentProfilePath)
					try {
						await fs.access(targetDir)
					} catch {
						await fs.mkdir(targetDir, { recursive: true })
					}

					// 이미지 복사
					if (!profileExists) {
						await fs.copyFile(normalImagePath, agentProfilePath)
					}
					if (!thinkingExists) {
						await fs.copyFile(thinkingImagePath, agentThinkingPath)
					}

					Logger.info(`Default persona images created from ${defaultPersona.character}`)
				}
			} catch (createError) {
				Logger.error(`Failed to create default persona images: ${createError}`)
			}
		}

		// 두 파일을 동시에 로드
		const [profileBuffer, thinkingBuffer] = await Promise.all([fs.readFile(agentProfilePath), fs.readFile(agentThinkingPath)])

		// base64 데이터 URI로 변환
		const avatarUri = `data:image/png;base64,${profileBuffer.toString("base64")}`
		const thinkingAvatarUri = `data:image/png;base64,${thinkingBuffer.toString("base64")}`

		Logger.info(
			`Simple persona images loaded successfully. Profile: ${profileBuffer.length} bytes, Thinking: ${thinkingBuffer.length} bytes`,
		)

		return {
			avatarUri,
			thinkingAvatarUri,
		}
	} catch (error) {
		Logger.error(`Failed to load simple persona images: ${error}`)
		return {
			avatarUri: "",
			thinkingAvatarUri: "",
		}
	}
}

/**
 * 페르소나 선택 시 템플릿 이미지를 agent_profile.png 또는 agent_thinking.png로 복사
 */
export async function replacePersonaImage(
	imageType: "normal" | "thinking",
	sourceImagePath: string,
	extensionPath: string,
): Promise<void> {
	try {
		const targetFileName = imageType === "normal" ? "agent_profile.png" : "agent_thinking.png"
		const targetPath = path.join(extensionPath, "caret-assets", targetFileName)
		const targetDir = path.dirname(targetPath)

		Logger.debug(`Replacing persona image: ${sourceImagePath} -> ${targetPath}`)

		// 대상 디렉토리가 존재하는지 확인하고 없으면 생성
		try {
			await fs.access(targetDir)
		} catch (error) {
			Logger.debug(`Target directory doesn't exist. Creating: ${targetDir}`)
			await fs.mkdir(targetDir, { recursive: true })
		}

		// 소스 이미지를 타겟 경로로 복사
		const imageBuffer = await fs.readFile(sourceImagePath)
		await fs.writeFile(targetPath, imageBuffer)

		Logger.info(`Persona image replaced successfully: ${targetFileName} (${imageBuffer.length} bytes)`)
	} catch (error) {
		Logger.error(`Failed to replace persona image: ${error}`)
		throw error
	}
}

/**
 * 커스텀 이미지 업로드 시 base64 데이터를 agent_profile.png 또는 agent_thinking.png로 저장
 */
export async function uploadCustomPersonaImage(
	imageType: "normal" | "thinking",
	base64Data: string,
	extensionPath: string,
): Promise<void> {
	try {
		const targetFileName = imageType === "normal" ? "agent_profile.png" : "agent_thinking.png"
		const targetPath = path.join(extensionPath, "caret-assets", targetFileName)
		const targetDir = path.dirname(targetPath)

		Logger.debug(`Uploading custom persona image: ${imageType} -> ${targetPath}`)

		// 대상 디렉토리가 존재하는지 확인하고 없으면 생성
		try {
			await fs.access(targetDir)
		} catch (error) {
			Logger.debug(`Target directory doesn't exist. Creating: ${targetDir}`)
			await fs.mkdir(targetDir, { recursive: true })
		}

		// base64 데이터를 버퍼로 변환
		const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, "")
		const imageBuffer = Buffer.from(base64String, "base64")

		// 타겟 경로에 이미지 저장
		await fs.writeFile(targetPath, imageBuffer)

		Logger.info(`Custom persona image uploaded successfully: ${targetFileName} (${imageBuffer.length} bytes)`)
	} catch (error) {
		Logger.error(`Failed to upload custom persona image: ${error}`)
		throw error
	}
}
