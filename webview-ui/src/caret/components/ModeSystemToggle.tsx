// CARET MODIFICATION: 전역 브랜드 모드 토글 컴포넌트 - caret-main에서 이식

import React from "react"
import styled from "styled-components"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CaretSystemServiceClient } from "@/services/grpc-client"
import { t } from "../utils/i18n"
import { CaretWebviewLogger } from "../utils/webview-logger"

const logger = new CaretWebviewLogger("ModeSystemToggle")

// CARET MODIFICATION: caret-main에서 가져온 토글 스위치 스타일 (원본: SettingsView.tsx)
const ModeSwitchContainer = styled.div<{ disabled: boolean }>`
	position: relative;
	display: flex;
	align-items: center;
	background-color: var(--vscode-editor-background);
	border: 1px solid var(--vscode-input-border);
	border-radius: 12px;
	overflow: hidden;
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};
	user-select: none;
	width: 140px;
	height: 28px;
`

const ModeSlider = styled.div.withConfig({
	shouldForwardProp: (prop) => !["isCaret", "isCline"].includes(prop),
})<{ isCaret: boolean; isCline?: boolean }>`
	position: absolute;
	height: 100%;
	width: 50%;
	background-color: var(--vscode-focusBorder);
	transition: transform 0.2s ease;
	transform: translateX(${(props) => (props.isCline ? "100%" : "0%")});
`

const ModeSwitchOption = styled.div.withConfig({
	shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>`
	padding: 4px 12px;
	color: ${(props) => (props.isActive ? "white" : "var(--vscode-input-foreground)")};
	z-index: 1;
	transition: color 0.2s ease;
	font-size: 12px;
	width: 50%;
	min-width: 50px;
	text-align: center;
	white-space: nowrap;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		background-color: ${(props) => (!props.isActive ? "var(--vscode-toolbar-hoverBackground)" : "transparent")};
	}
`

interface ModeSystemToggleProps {
	className?: string
}

/**
 * CARET MODIFICATION: 전역 브랜드 모드 토글 컴포넌트
 * Caret/Cline 전환을 위한 토글 스위치 - caret-main 스타일 이식
 */
const ModeSystemToggle: React.FC<ModeSystemToggleProps> = ({ className }) => {
	const { modeSystem, setModeSystem } = useExtensionState()

	const handleToggle = async () => {
		const newMode = modeSystem === "caret" ? "cline" : "caret"

		// CARET MODIFICATION: Enhanced debug logging for mode switching
		console.log(`[ModeSystemToggle] 🔄 Mode switch initiated:`, {
			currentMode: modeSystem,
			targetMode: newMode,
			timestamp: new Date().toISOString(),
			component: "ModeSystemToggle",
			action: "handleToggle",
		})

		logger.info(`User clicked toggle: ${modeSystem} -> ${newMode}`)

		try {
			const startTime = Date.now()
			console.log(`[ModeSystemToggle] 📤 Sending gRPC request: SetPromptSystemMode({ mode: "${newMode}" })`)

			// Use gRPC to set the new mode
			const response = await CaretSystemServiceClient.SetPromptSystemMode({
				mode: newMode,
			})

			const endTime = Date.now()
			const responseTime = endTime - startTime

			console.log(`[ModeSystemToggle] 📥 gRPC response received:`, {
				success: response.success,
				currentMode: response.currentMode,
				errorMessage: response.errorMessage,
				responseTime: `${responseTime}ms`,
				timestamp: new Date().toISOString(),
			})

			if (response.success) {
				logger.info(`Successfully changed to ${response.currentMode} mode`)
				console.log(
					`[ModeSystemToggle] ✅ Mode change successful: UI will auto-update via postStateToWebview() to ${response.currentMode}`,
				)
				// CARET MODIFICATION: No manual setModeSystem() call needed
				// Backend's postStateToWebview() automatically updates ExtensionStateContext
			} else {
				logger.error(`Failed to change mode: ${response.errorMessage}`)
				console.error(`[ModeSystemToggle] ❌ Mode change failed:`, response.errorMessage)
			}
		} catch (error) {
			logger.error(`Error changing mode: ${error}`)
			console.error(`[ModeSystemToggle] ❌ Exception during mode change:`, {
				error: error,
				currentMode: modeSystem,
				targetMode: newMode,
				timestamp: new Date().toISOString(),
			})
		}
	}

	return (
		<div className={`mb-[15px] ${className || ""}`}>
			<div className="flex items-center justify-between mb-2">
				<label className="text-sm font-medium">{t("modeSystem.label", "settings")}</label>
				<ModeSwitchContainer data-testid="mode-system-toggle-container" disabled={false} onClick={handleToggle}>
					<ModeSlider isCaret={modeSystem === "caret"} isCline={modeSystem === "cline"} />
					<ModeSwitchOption data-testid="caret-mode-option" isActive={modeSystem === "caret"}>
						{t("modeSystem.options.caret", "settings")}
					</ModeSwitchOption>
					<ModeSwitchOption data-testid="cline-mode-option" isActive={modeSystem === "cline"}>
						{t("modeSystem.options.cline", "settings")}
					</ModeSwitchOption>
				</ModeSwitchContainer>
			</div>
			<p className="text-xs text-[var(--vscode-descriptionForeground)]">{t("modeSystem.description", "settings")}</p>
		</div>
	)
}

export default React.memo(ModeSystemToggle)
