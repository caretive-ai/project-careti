/**
 * CARET MODIFICATION: UI Renderer Factory for Mode System
 *
 * Purpose: 중앙 집중식 UI 렌더링으로 36개 webview 파일의 산재된
 * CARET MODIFICATION을 단일 팩터리로 교체합니다.
 *
 * Strategy:
 * - UI 컴포넌트들에서 modeSystem 기반 분기 로직 제거
 * - 모든 모드별 UI 렌더링을 이 팩터리로 위임
 * - 기존 CARET MODIFICATION 코드를 renderer.render() 호출로 교체
 */

export interface ModeRenderer {
	// 모드 라벨 렌더링
	getModeLabel(mode: string): string
	getToggleLabel(currentMode: string, targetMode: string): string

	// 툴팁 및 설명 렌더링
	getModeTooltip(mode: string): string
	getModeDescription(mode: string): string

	// 아이콘 및 스타일 렌더링
	getModeIcon(mode: string): string
	getModeClassName(mode: string): string
}

// Cline 모드 렌더러 (기존 Plan/Act 용어 유지)
export class ClineModeRenderer implements ModeRenderer {
	getModeLabel(mode: string): string {
		return mode === "plan" ? "Plan" : "Act"
	}

	getToggleLabel(currentMode: string, targetMode: string): string {
		return targetMode === "plan" ? "Plan" : "Act"
	}

	getModeTooltip(mode: string): string {
		return mode === "plan"
			? "Plan mode: Analyze and strategize before taking action"
			: "Act mode: Execute tasks and make changes directly"
	}

	getModeDescription(mode: string): string {
		return mode === "plan" ? "Focus on planning and analysis" : "Focus on execution and implementation"
	}

	getModeIcon(mode: string): string {
		return mode === "plan" ? "📋" : "⚡"
	}

	getModeClassName(mode: string): string {
		return mode === "plan" ? "plan-mode" : "act-mode"
	}
}

// Caret 모드 렌더러 (Chatbot/Agent 용어 사용)
export class CaretModeRenderer implements ModeRenderer {
	getModeLabel(mode: string): string {
		// Caret 모드에서는 plan → Chatbot, act → Agent로 매핑
		return mode === "plan" ? "Chatbot" : "Agent"
	}

	getToggleLabel(currentMode: string, targetMode: string): string {
		return targetMode === "plan" ? "Chatbot" : "Agent"
	}

	getModeTooltip(mode: string): string {
		return mode === "plan"
			? "Chatbot mode: Expert consultation and guidance"
			: "Agent mode: Collaborative development and execution"
	}

	getModeDescription(mode: string): string {
		return mode === "plan" ? "Focus on analysis and consultation" : "Focus on collaborative implementation"
	}

	getModeIcon(mode: string): string {
		return mode === "plan" ? "💬" : "🤖"
	}

	getModeClassName(mode: string): string {
		return mode === "plan" ? "chatbot-mode" : "agent-mode"
	}
}

// 중앙 렌더러 팩터리 (싱글톤 패턴)
export class ModeRendererFactory {
	private static instance: ModeRendererFactory
	private renderers = new Map<string, ModeRenderer>()

	private constructor() {
		// 기본 렌더러 등록
		this.renderers.set("cline", new ClineModeRenderer())
		this.renderers.set("caret", new CaretModeRenderer())
	}

	static getInstance(): ModeRendererFactory {
		if (!ModeRendererFactory.instance) {
			ModeRendererFactory.instance = new ModeRendererFactory()
		}
		return ModeRendererFactory.instance
	}

	getRenderer(modeSystem: string): ModeRenderer {
		const renderer = this.renderers.get(modeSystem)
		if (!renderer) {
			console.warn(`Unknown mode system: ${modeSystem}, falling back to cline renderer`)
			return this.renderers.get("cline")!
		}
		return renderer
	}

	// 편의 메서드들 (UI 컴포넌트에서 직접 호출)
	getModeLabel(modeSystem: string, mode: string): string {
		return this.getRenderer(modeSystem).getModeLabel(mode)
	}

	getModeTooltip(modeSystem: string, mode: string): string {
		return this.getRenderer(modeSystem).getModeTooltip(mode)
	}

	getModeIcon(modeSystem: string, mode: string): string {
		return this.getRenderer(modeSystem).getModeIcon(mode)
	}

	getToggleLabel(modeSystem: string, currentMode: string, targetMode: string): string {
		return this.getRenderer(modeSystem).getToggleLabel(currentMode, targetMode)
	}
}

// 싱글톤 인스턴스 export
export const modeRendererFactory = ModeRendererFactory.getInstance()
