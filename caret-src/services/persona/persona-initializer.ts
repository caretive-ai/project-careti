import * as path from "path"
import * as fs from "fs/promises"
import * as vscode from "vscode"
import { Logger } from "@/services/logging/Logger"
import { PersonaStorage } from "./persona-storage"
import { fileExistsAtPath, writeFile } from "@utils/fs"
import { ensureRulesDirectoryExists } from "@/core/storage/disk"

/**
 * 페르소나 초기화를 담당하는 클래스
 * 처음 설치 시 또는 필요한 경우 페르소나를 초기화합니다.
 */
export class PersonaInitializer {
	private context: vscode.ExtensionContext

	constructor(context: vscode.ExtensionContext) {
		this.context = context
	}

	/**
	 * 페르소나 초기화 실행
	 * template_characters.json에서 isDefault: true 설정된 페르소나를 찾아 설정합니다.
	 */
	public async initialize(): Promise<void> {
		Logger.info("[CARET-PERSONA] PersonaInitializer: 페르소나 초기화 시작")
		try {
			// 0. 레거시 custom_instructions.md 파일 정리
			await this.cleanupLegacyCustomInstructions()

			// 1. persona.md 파일 존재 여부 확인
			const globalRulesDir = await ensureRulesDirectoryExists()
			const personaMdPath = path.join(globalRulesDir, "persona.md")

			// 2. 페르소나 이미지 존재 여부 확인
			const personaImagesExist = await this.checkPersonaImagesExist()

			// 둘 다 존재하면 초기화 건너뛰기
			if ((await fileExistsAtPath(personaMdPath)) && personaImagesExist) {
				Logger.info("[CARET-PERSONA] PersonaInitializer: 페르소나가 이미 설정되어 있습니다. 초기화 건너뜁니다.")
				return
			}

			// 3. template_characters.json 파일에서 기본 페르소나 찾기
			const defaultPersona = await this.findDefaultPersona()
			if (!defaultPersona) {
				Logger.error("[CARET-PERSONA] PersonaInitializer: 기본 페르소나를 찾을 수 없습니다.")
				return
			}

			Logger.info(`[CARET-PERSONA] PersonaInitializer: 기본 페르소나 '${defaultPersona.character || "알 수 없음"}' 설정`)

			// 4. persona.md 파일이 없으면 생성/업데이트
			if (!(await fileExistsAtPath(personaMdPath))) {
				await this.updatePersonaMd(defaultPersona)
			}

			// 5. 페르소나 이미지가 없으면 설정
			if (!personaImagesExist) {
				await this.updatePersonaImagesInGlobalStorage(defaultPersona)
			}

			Logger.info("[CARET-PERSONA] PersonaInitializer: 페르소나 초기화 완료")

		} catch (error) {
			Logger.error(`[CARET-PERSONA] PersonaInitializer: 페르소나 초기화 실패: ${error}`)
		}
	}

	/**
	 * 페르소나 이미지가 존재하는지 확인합니다.
	 */
	private async checkPersonaImagesExist(): Promise<boolean> {
		try {
			const personaDir = path.join(this.context.globalStorageUri.fsPath, "personas")
			const profilePath = path.join(personaDir, "agent_profile.png")
			const thinkingPath = path.join(personaDir, "agent_thinking.png")

			// 두 파일이 모두 존재하는지 확인
			return (await fileExistsAtPath(profilePath)) && (await fileExistsAtPath(thinkingPath))
		} catch (error) {
			Logger.debug(`[CARET-PERSONA] 페르소나 이미지가 존재하지 않습니다: ${error}`)
			return false
		}
	}

	/**
	 * template_characters.json 파일에서 기본 페르소나를 찾습니다.
	 */
	private async findDefaultPersona(): Promise<any> {
		try {
			const templatePath = path.join(
				this.context.extensionPath,
				"assets",
				"template_characters",
				"template_characters.json",
			)

			const templatesRaw = await fs.readFile(templatePath, "utf-8")
			const templates = JSON.parse(templatesRaw)

			if (!Array.isArray(templates) || templates.length === 0) {
				Logger.error("[CARET-PERSONA] template_characters.json is empty or not an array.")
				return null
			}

			// isDefault: true 설정된 기본 페르소나 찾기
			let defaultPersona = templates.find((char: any) => char.isDefault === true)

			// 기본 페르소나가 없으면 첫 번째 항목을 기본값으로 사용
			if (!defaultPersona) {
				Logger.debug("[CARET-PERSONA] No default persona found, falling back to the first one.")
				defaultPersona = templates[0]
			}

			return defaultPersona
		} catch (error) {
			Logger.error(`[CARET-PERSONA] Failed to find default persona: ${error}`)
			return null
		}
	}

	/**
	 * persona.md 파일을 생성하거나 업데이트합니다.
	 */
	private async updatePersonaMd(persona: any): Promise<void> {
		try {
			// 사용자의 선호 언어를 기반으로 페르소나 데이터 선택
			const userLanguage = this.getUserPreferredLanguage()
			const languageKey = this.mapLanguageToKey(userLanguage)
			
			Logger.info(`[CARET-PERSONA] PersonaInitializer: 사용자 선호 언어 '${userLanguage}' → 키 '${languageKey}'`)
			
			// 선호 언어에 해당하는 페르소나 데이터를 찾고, 없으면 영어를 기본값으로 사용
			const personaData = persona[languageKey] || persona.en || Object.values(persona)[0]
			const personaInstruction = personaData.customInstruction

			if (!personaInstruction) {
				Logger.error("[CARET-PERSONA] PersonaInitializer: 페르소나 지침을 찾을 수 없습니다.")
				return
			}

			const globalRulesDir = await ensureRulesDirectoryExists()
			const personaMdPath = path.join(globalRulesDir, "persona.md")
			const content = JSON.stringify(personaInstruction, null, 2)

			await writeFile(personaMdPath, content)

			Logger.info(`[CARET-PERSONA] PersonaInitializer: persona.md 파일 업데이트 완료 (언어: ${languageKey})`)
		} catch (error) {
			Logger.error(`[CARET-PERSONA] PersonaInitializer: persona.md 업데이트 실패: ${error}`)
		}
	}

	/**
	 * 페르소나 이미지를 globalStorage에 복사합니다.
	 */
	private async updatePersonaImagesInGlobalStorage(persona: any): Promise<void> {
		try {
			// 페르소나 디렉토리 생성
			const personaDir = path.join(this.context.globalStorageUri.fsPath, "personas")
			await fs.mkdir(personaDir, { recursive: true })

			// asset: 경로를 실제 파일 경로로 변환
			let normalImagePath = persona.avatarUri
			let thinkingImagePath = persona.thinkingAvatarUri

			if (normalImagePath.startsWith("asset:/assets/")) {
				// template_characters.json에서는 경로가 "asset:/assets/template_characters/..."로 되어 있음
				// 실제 파일 경로는 "assets/template_characters/..."
				normalImagePath = path.join(
					this.context.extensionPath,
					"assets",
					normalImagePath.replace("asset:/assets/", ""),
				)
			} else if (normalImagePath.startsWith("asset:/")) {
				normalImagePath = path.join(this.context.extensionPath, normalImagePath.replace("asset:/", ""))
			}

			if (thinkingImagePath.startsWith("asset:/assets/")) {
				// template_characters.json에서는 경로가 "asset:/assets/template_characters/..."로 되어 있음
				// 실제 파일 경로는 "assets/template_characters/..."
				thinkingImagePath = path.join(
					this.context.extensionPath,
					"assets",
					thinkingImagePath.replace("asset:/assets/", ""),
				)
			} else if (thinkingImagePath.startsWith("asset:/")) {
				thinkingImagePath = path.join(this.context.extensionPath, thinkingImagePath.replace("asset:/", ""))
			}

			Logger.debug(
				`[CARET-PERSONA] PersonaInitializer: globalStorage 이미지 경로 변환 - normal: ${normalImagePath}, thinking: ${thinkingImagePath}`,
			)

			// 이미지 파일 복사
			const profileDst = path.join(personaDir, "agent_profile.png")
			const thinkingDst = path.join(personaDir, "agent_thinking.png")

			await fs.copyFile(normalImagePath, profileDst)
			await fs.copyFile(thinkingImagePath, thinkingDst)

			Logger.info(`[CARET-PERSONA] PersonaInitializer: 페르소나 이미지를 globalStorage에 복사 완료 (${persona.character})`)
		} catch (error) {
			Logger.error(`[CARET-PERSONA] PersonaInitializer: 페르소나 이미지 복사 실패: ${error}`)
		}
	}

	/**
	 * 사용자의 선호 언어를 가져옵니다.
	 */
	private getUserPreferredLanguage(): string {
		try {
			const preferredLanguage = this.context.globalState.get("preferredLanguage") as string | undefined
			return preferredLanguage || "English" // 기본값은 English
		} catch (error) {
			Logger.warn(`[CARET-PERSONA] PersonaInitializer: 선호 언어를 가져오는데 실패: ${error}`)
			return "English"
		}
	}

	/**
	 * 언어 표시명을 페르소나 템플릿 키로 매핑합니다.
	 */
	private mapLanguageToKey(language: string): string {
		const languageMap: { [key: string]: string } = {
			"English": "en",
			"한국어": "ko", 
			"韓国語": "ko",
			"Korean": "ko",
			"日本語": "ja",
			"Japanese": "ja", 
			"中文": "zh",
			"Chinese": "zh",
			"简体中文": "zh",
			"繁體中文": "zh"
		}
		
		return languageMap[language] || "en" // 기본값은 en
	}

	/**
	 * 언어 설정 시 기본 페르소나 자동 설정
	 * 기존 persona-initialization.ts의 initializeDefaultPersonaOnLanguageSet 대체 함수
	 */
	public async initializeOnLanguageSet(language: string): Promise<void> {
		Logger.info(`[CARET-PERSONA] PersonaInitializer: 언어 설정에 따른 페르소나 초기화 시작 (${language})`)

		// 페르소나가 이미 설정되어 있는지 확인
		const personaImagesExist = await this.checkPersonaImagesExist()

		if (personaImagesExist) {
			Logger.info("[CARET-PERSONA] PersonaInitializer: 페르소나 이미지가 이미 존재합니다. 초기화 건너뜁니다.")
			return
		}

		// 기본 초기화 실행
		await this.initialize()

		Logger.info(`[CARET-PERSONA] PersonaInitializer: 언어 설정에 따른 페르소나 초기화 완료 (${language})`)
	}

	/**
	 * custom_instructions.md 파일을 정리합니다 (persona.md로 통일됨)
	 */
	public async cleanupLegacyCustomInstructions(): Promise<void> {
		try {
			const globalRulesDir = await ensureRulesDirectoryExists()
			const customInstructionsPath = path.join(globalRulesDir, "custom_instructions.md")
			
			if (await fileExistsAtPath(customInstructionsPath)) {
				await fs.unlink(customInstructionsPath)
				Logger.info("[CARET-PERSONA] PersonaInitializer: 레거시 custom_instructions.md 파일을 정리했습니다.")
			}
		} catch (error) {
			Logger.debug(`[CARET-PERSONA] PersonaInitializer: custom_instructions.md 정리 중 오류 (정상): ${error}`)
		}
	}
}

/**
 * 페르소나 데이터 완전 삭제 (디버그 메뉴 초기화용)
 * 기존 persona-initialization.ts의 resetPersonaData 함수를 유지
 */
export async function resetPersonaData(context: vscode.ExtensionContext): Promise<void> {
	try {
		const personaDir = path.join(context.globalStorageUri.fsPath, "personas")
		await fs.rm(personaDir, { recursive: true, force: true })
		Logger.info("[CARET-PERSONA] Persona data reset completed")
	} catch (error) {
		Logger.warn(`[CARET-PERSONA] Failed to reset persona data (this is normal if no data exists): ${error}`)
	}
}