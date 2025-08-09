// TDD RED Phase: Caret-Cline 하이브리드 모드 설정 시스템 테스트
import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"

describe("Caret-Cline Hybrid Mode Settings", () => {
	describe("Proto Definition", () => {
		it("should have modeSystem field in UpdateSettingsRequest", () => {
			const protoPath = join(process.cwd(), "proto/state.proto")
			const protoContent = readFileSync(protoPath, "utf-8")

			// RED: modeSystem 필드가 아직 존재하지 않아야 함
			expect(protoContent).toContain("optional string mode_system")
		})

		it("should have modeSystem field in ChatSettings", () => {
			const protoPath = join(process.cwd(), "proto/state.proto")
			const protoContent = readFileSync(protoPath, "utf-8")

			// RED: ChatSettings에도 modeSystem 필드가 있어야 함
			expect(protoContent).toMatch(/message ChatSettings.*{[^}]*optional string mode_system[^}]*}/s)
		})
	})

	describe("Settings UI Integration", () => {
		it("should have mode system setting in SettingsView", () => {
			const settingsPath = join(process.cwd(), "caret-caret-webview-ui/src/components/settings/SettingsView.tsx")
			const settingsContent = readFileSync(settingsPath, "utf-8")

			// RED: 아직 modeSystem 설정 UI가 없어야 함
			expect(settingsContent).toContain("modeSystem")
		})

		it("should have mode system in ExtensionStateContext", () => {
			const contextPath = join(process.cwd(), "caret-caret-webview-ui/src/context/ExtensionStateContext.tsx")
			const contextContent = readFileSync(contextPath, "utf-8")

			// RED: Context에 modeSystem 상태가 없어야 함
			expect(contextContent).toContain("modeSystem")
		})
	})

	describe("Locale Support", () => {
		const locales = ["ko", "en", "ja", "zh"]

		locales.forEach((locale) => {
			it(`should have mode system translations in ${locale}`, () => {
				const localePath = join(process.cwd(), `caret-webview-ui/src/caret/locale/${locale}/common.json`)
				const localeContent = readFileSync(localePath, "utf-8")
				const translations = JSON.parse(localeContent)

				// RED: 아직 modeSystem 번역이 없어야 함
				expect(translations.settings?.modeSystem).toBeDefined()
				expect(translations.settings?.modeSystem?.label).toBeDefined()
				expect(translations.settings?.modeSystem?.description).toBeDefined()
				expect(translations.settings?.modeSystem?.options?.caret).toBeDefined()
				expect(translations.settings?.modeSystem?.options?.cline).toBeDefined()
			})
		})
	})

	describe("Mode System Integration", () => {
		it("should have consistent modeSystem implementation across all files", () => {
			// GREEN: 이제 modeSystem이 모든 필요한 곳에 구현되었는지 확인
			const chatSettingsPath = join(process.cwd(), "src/shared/ChatSettings.ts")
			const chatSettingsContent = readFileSync(chatSettingsPath, "utf-8")

			// ChatSettings 인터페이스에 modeSystem 필드가 있는지 확인
			expect(chatSettingsContent).toContain("modeSystem?:")
			expect(chatSettingsContent).toContain('modeSystem: "caret"')
		})
	})
})
