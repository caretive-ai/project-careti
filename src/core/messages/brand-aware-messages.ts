/**
 * 🟢 GREEN Phase: 브랜드별 백엔드 메시지 처리 시스템
 *
 * 백엔드에서 프론트엔드로 전송되는 모든 메시지를 브랜드 설정에 따라 처리
 * Cline 모드: 원본 영어 메시지, 최소한의 브랜딩
 * Caret 모드: 완전한 i18n 지원, 풍부한 브랜딩
 */

import * as vscode from "vscode"

export interface BrandAwareMessageConfig {
	enableI18n: boolean
	enableBackendMessages: boolean
	brandName: string
	brandNameUpper: string
	brandNameLower: string
}

/**
 * VS Code 설정에서 브랜드 모드 가져오기
 */
function getBrandMode(): string {
	const config = vscode.workspace.getConfiguration("caret")
	const modeSystem = config.get<string>("modeSystem", "caret")
	return modeSystem.toLowerCase()
}

/**
 * 현재 브랜드 설정 가져오기
 */
function getCurrentBrandConfig(): BrandAwareMessageConfig {
	const mode = getBrandMode()

	if (mode === "cline") {
		return {
			enableI18n: false,
			enableBackendMessages: false,
			brandName: "Cline",
			brandNameUpper: "CLINE",
			brandNameLower: "cline",
		}
	} else {
		return {
			enableI18n: true,
			enableBackendMessages: true,
			brandName: "Caret",
			brandNameUpper: "CARET",
			brandNameLower: "caret",
		}
	}
}

/**
 * 시스템 메시지 처리 (도구 사용 요청 등)
 */
export function formatSystemMessage(messageType: string, data: any): string {
	const config = getCurrentBrandConfig()

	// 메시지 템플릿 정의
	const messageTemplates: Record<string, string> = {
		wants_to_edit: `${config.brandName} wants to edit`,
		wants_to_create: `${config.brandName} wants to create`,
		wants_to_read: `${config.brandName} wants to read`,
		wants_to_execute_command: `${config.brandName} wants to execute a command:`,
		wants_to_use_browser: `${config.brandName} wants to use a browser and launch`,
		has_question: `${config.brandName} has a question...`,
		wants_to_start_new_task: `${config.brandName} wants to start a new task...`,
		task_completed: "Task Completed",
		api_request_pending: "API Request...",
		api_request_failed: "API Request Failed",
		api_request_cancelled: "API Request Cancelled",
	}

	const template = messageTemplates[messageType]
	if (!template) {
		return `${config.brandName} wants to perform an action`
	}

	// Cline 모드에서는 추가 번역 없이 영어로 반환
	if (!config.enableBackendMessages) {
		return template
	}

	// Caret 모드에서는 향후 i18n 처리 가능
	// TODO: 실제 i18n 시스템 연동
	return template
}

/**
 * 상태 메시지 처리 (진행 상황, 에러 등)
 */
export function formatStatusMessage(status: string, details?: string): string {
	const config = getCurrentBrandConfig()

	const statusMessages: Record<string, string> = {
		thinking: `${config.brandName} is thinking...`,
		working: `${config.brandName} is working...`,
		analyzing: `${config.brandName} is analyzing...`,
		generating: `${config.brandName} is generating code...`,
		reviewing: `${config.brandName} is reviewing changes...`,
		completed: `${config.brandName} has completed the task`,
		error: `${config.brandName} encountered an error`,
		cancelled: `${config.brandName} operation was cancelled`,
	}

	let message = statusMessages[status] || `${config.brandName} is processing...`

	if (details && config.enableBackendMessages) {
		message += `\\n${details}`
	}

	return message
}

/**
 * 도구 실행 메시지 처리
 */
export function formatToolMessage(toolName: string, action: string, target?: string): string {
	const config = getCurrentBrandConfig()

	let message = `${config.brandName} ${action}`
	if (target) {
		message += ` ${target}`
	}

	// 도구별 특별 처리
	switch (toolName) {
		case "edit_file":
			return `${config.brandName} wants to edit${target ? ` ${target}` : " a file"}`
		case "create_file":
			return `${config.brandName} wants to create${target ? ` ${target}` : " a new file"}`
		case "read_file":
			return `${config.brandName} wants to read${target ? ` ${target}` : " a file"}`
		case "execute_command":
			return `${config.brandName} wants to execute a command${target ? `: ${target}` : ""}`
		case "use_browser":
			return `${config.brandName} wants to use the browser${target ? ` to ${target}` : ""}`
		default:
			return message
	}
}

/**
 * 에러 메시지 처리
 */
export function formatErrorMessage(error: Error | string, context?: string): string {
	const config = getCurrentBrandConfig()

	const errorMessage = error instanceof Error ? error.message : error

	if (context) {
		return `${config.brandName} encountered an error in ${context}: ${errorMessage}`
	} else {
		return `${config.brandName} encountered an error: ${errorMessage}`
	}
}

/**
 * 브랜드 인식 메시지 팩토리
 * 모든 백엔드 메시지를 이 함수를 통해 처리
 */
export class BrandAwareMessageFactory {
	private config: BrandAwareMessageConfig

	constructor() {
		this.config = getCurrentBrandConfig()

		// 설정 변경 감지
		vscode.workspace.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration("caret.modeSystem")) {
				this.config = getCurrentBrandConfig()
				console.log(`🎯 브랜드 모드 변경됨: ${this.config.brandName}`)
			}
		})
	}

	/**
	 * 시스템 메시지 생성
	 */
	systemMessage(type: string, data?: any): string {
		return formatSystemMessage(type, data)
	}

	/**
	 * 상태 메시지 생성
	 */
	statusMessage(status: string, details?: string): string {
		return formatStatusMessage(status, details)
	}

	/**
	 * 도구 메시지 생성
	 */
	toolMessage(toolName: string, action: string, target?: string): string {
		return formatToolMessage(toolName, action, target)
	}

	/**
	 * 에러 메시지 생성
	 */
	errorMessage(error: Error | string, context?: string): string {
		return formatErrorMessage(error, context)
	}

	/**
	 * 현재 브랜드 설정 확인
	 */
	getBrandConfig(): BrandAwareMessageConfig {
		return { ...this.config }
	}

	/**
	 * 브랜드명 치환이 필요한 일반 메시지 처리
	 */
	replaceBrandNames(message: string): string {
		return (
			message
				.replace(/Caret/g, this.config.brandName)
				.replace(/CARET/g, this.config.brandNameUpper)
				.replace(/caret/g, this.config.brandNameLower)
				// Cline도 치환 (혼재 방지)
				.replace(/Cline/g, this.config.brandName)
				.replace(/CLINE/g, this.config.brandNameUpper)
				.replace(/cline/g, this.config.brandNameLower)
		)
	}
}

// 싱글톤 인스턴스
export const brandAwareMessages = new BrandAwareMessageFactory()
