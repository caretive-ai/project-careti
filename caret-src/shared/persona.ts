export interface Persona {
	id: string
	name: string
	description: string
	customInstructions?: string
	avatarUri?: string
	thinkingAvatarUri?: string
	isDefault?: boolean
	isEditable?: boolean
}

// CARET MODIFICATION: 단순한 2파일 시스템으로 변경 - customAvatarUri, customThinkingAvatarUri 제거
export interface TemplateCharacter {
	character: string
	en: {
		name: string
		description: string
		customInstruction: PersonaInstruction
	}
	ko: {
		name: string
		description: string
		customInstruction: PersonaInstruction
	}
	avatarUri: string
	thinkingAvatarUri: string
	introIllustrationUri: string
	isDefault: boolean
}

export interface PersonaSubSection {
	name: string
	nickname: string
	type: string
	inspiration: string[]
}

export interface LanguageSubSection {
	style: string
	endings: string[]
	expressions: string[]
}

export interface EmotionStyleSubSection {
	tone: string
	attitude: string
	phrasing: string
	exclamations: string[]
}

export interface BehaviorSubSection {
	loyalty: string
	communication_focus: string
	thought_process: string[]
}

export interface PersonaInstruction {
	persona: PersonaSubSection
	language: LanguageSubSection
	emotion_style: EmotionStyleSubSection
	behavior: BehaviorSubSection
	signature_phrase: string
}
