// CARET MODIFICATION: Enhanced rules toggle modal with caretrules support. Original backed up as ClineRulesToggleModal-tsx.cline
// CARET MODIFICATION: Added i18n and replaced console.log with caretWebviewLogger
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import Tooltip from "@/components/common/Tooltip"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { FileServiceClient } from "@/services/grpc-client"
import { vscode } from "@/utils/vscode"
import { caretWebviewLogger } from "@/caret/utils/webview-logger"
import { EmptyRequest } from "@shared/proto/common"
import {
	ClineRulesToggles,
	RefreshedRules,
	ToggleClineRuleRequest,
	ToggleCaretRuleRequest,
	ToggleCursorRuleRequest,
	ToggleWindsurfRuleRequest,
	ToggleWorkflowRequest,
} from "@shared/proto/file"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import React, { useEffect, useRef, useState } from "react"
import { useClickAway, useWindowSize } from "react-use"
import styled from "styled-components"
import RulesToggleList from "./RulesToggleList"
import { t } from "@/caret/utils/i18n"

const ClineRulesToggleModal: React.FC = () => {
	const {
		globalClineRulesToggles = {},
		localClineRulesToggles = {},
		localCaretRulesToggles = {},
		localCursorRulesToggles = {},
		localWindsurfRulesToggles = {},
		localWorkflowToggles = {},
		globalWorkflowToggles = {},
		setGlobalClineRulesToggles,
		setLocalClineRulesToggles,
		setLocalCaretRulesToggles,
		setLocalCursorRulesToggles,
		setLocalWindsurfRulesToggles,
		setLocalWorkflowToggles,
		setGlobalWorkflowToggles,
	} = useExtensionState()
	const [isVisible, setIsVisible] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)
	const modalRef = useRef<HTMLDivElement>(null)
	const { width: viewportWidth, height: viewportHeight } = useWindowSize()
	const [arrowPosition, setArrowPosition] = useState(0)
	const [menuPosition, setMenuPosition] = useState(0)
	const [currentView, setCurrentView] = useState<"rules" | "workflows">("rules")

	useEffect(() => {
		if (isVisible) {
			caretWebviewLogger.debug("Rules modal opened, refreshing rules...")
			FileServiceClient.refreshRules({} as EmptyRequest)
				.then((response: RefreshedRules) => {
					caretWebviewLogger.debug("Rules refresh response:", response)
					if (response.globalClineRulesToggles?.toggles) {
						setGlobalClineRulesToggles(response.globalClineRulesToggles.toggles)
						caretWebviewLogger.debug("Set global cline rules:", response.globalClineRulesToggles.toggles)
					}
					if (response.localClineRulesToggles?.toggles) {
						setLocalClineRulesToggles(response.localClineRulesToggles.toggles)
						caretWebviewLogger.debug("Set local cline rules:", response.localClineRulesToggles.toggles)
					}
					if (response.localCaretRulesToggles?.toggles) {
						setLocalCaretRulesToggles(response.localCaretRulesToggles.toggles)
						caretWebviewLogger.debug("Set local caret rules:", response.localCaretRulesToggles.toggles)
					}
					if (response.localCursorRulesToggles?.toggles) {
						setLocalCursorRulesToggles(response.localCursorRulesToggles.toggles)
						caretWebviewLogger.debug("Set local cursor rules:", response.localCursorRulesToggles.toggles)
					}
					if (response.localWindsurfRulesToggles?.toggles) {
						setLocalWindsurfRulesToggles(response.localWindsurfRulesToggles.toggles)
						caretWebviewLogger.debug("Set local windsurf rules:", response.localWindsurfRulesToggles.toggles)
					}
					if (response.localWorkflowToggles?.toggles) {
						setLocalWorkflowToggles(response.localWorkflowToggles.toggles)
						caretWebviewLogger.debug("Set local workflows:", response.localWorkflowToggles.toggles)
					}
					if (response.globalWorkflowToggles?.toggles) {
						setGlobalWorkflowToggles(response.globalWorkflowToggles.toggles)
						caretWebviewLogger.debug("Set global workflows:", response.globalWorkflowToggles.toggles)
					}
				})
				.catch((error) => {
					caretWebviewLogger.error("Failed to refresh rules", error)
				})
		}
	}, [
		isVisible,
		setGlobalClineRulesToggles,
		setLocalClineRulesToggles,
		setLocalCaretRulesToggles,
		setLocalCursorRulesToggles,
		setLocalWindsurfRulesToggles,
		setLocalWorkflowToggles,
		setGlobalWorkflowToggles,
	])

	// Format rules for display
	const globalRules = Object.entries(globalClineRulesToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	const localRules = Object.entries(localClineRulesToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	const caretRules = Object.entries(localCaretRulesToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	const cursorRules = Object.entries(localCursorRulesToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	const windsurfRules = Object.entries(localWindsurfRulesToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	const localWorkflows = Object.entries(localWorkflowToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	const globalWorkflows = Object.entries(globalWorkflowToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	// Toggle handlers
	const toggleRule = (isGlobal: boolean, rulePath: string, enabled: boolean) => {
		FileServiceClient.toggleClineRule(
			ToggleClineRuleRequest.create({
				isGlobal,
				rulePath,
				enabled,
			}),
		)
			.then((response) => {
				if (response.globalClineRulesToggles?.toggles) {
					setGlobalClineRulesToggles(response.globalClineRulesToggles.toggles)
				}
				if (response.localClineRulesToggles?.toggles) {
					setLocalClineRulesToggles(response.localClineRulesToggles.toggles)
				}
			})
			.catch((error) => {
				caretWebviewLogger.error("Error toggling Cline rule", error)
			})
	}

	const toggleCaretRule = (rulePath: string, enabled: boolean) => {
		caretWebviewLogger.debug("Toggling Caret rule:", { rulePath, enabled })
		FileServiceClient.toggleCaretRule(
			ToggleCaretRuleRequest.create({
				rulePath,
				enabled,
			}),
		)
			.then((response) => {
				caretWebviewLogger.debug("Caret rule toggle response:", response)
				if (response.toggles) {
					setLocalCaretRulesToggles(response.toggles)
					caretWebviewLogger.debug("Updated local caret rule toggles:", response.toggles)
				}
			})
			.catch((error) => {
				caretWebviewLogger.error("Error toggling Caret rule", error)
			})
	}

	const toggleCursorRule = (rulePath: string, enabled: boolean) => {
		FileServiceClient.toggleCursorRule(
			ToggleCursorRuleRequest.create({
				rulePath,
				enabled,
			}),
		)
			.then((response) => {
				if (response.toggles) {
					setLocalCursorRulesToggles(response.toggles)
				}
			})
			.catch((error) => {
				caretWebviewLogger.error("Error toggling Cursor rule", error)
			})
	}

	const toggleWindsurfRule = (rulePath: string, enabled: boolean) => {
		FileServiceClient.toggleWindsurfRule(
			ToggleWindsurfRuleRequest.create({
				rulePath,
				enabled,
			} as ToggleWindsurfRuleRequest),
		)
			.then((response: ClineRulesToggles) => {
				if (response.toggles) {
					setLocalWindsurfRulesToggles(response.toggles)
				}
			})
			.catch((error) => {
				caretWebviewLogger.error("Error toggling Windsurf rule", error)
			})
	}

	const toggleWorkflow = (isGlobal: boolean, workflowPath: string, enabled: boolean) => {
		FileServiceClient.toggleWorkflow(
			ToggleWorkflowRequest.create({
				workflowPath,
				enabled,
				isGlobal,
			}),
		)
			.then((response) => {
				if (response.toggles) {
					if (isGlobal) {
						setGlobalWorkflowToggles(response.toggles)
					} else {
						setLocalWorkflowToggles(response.toggles)
					}
				}
			})
			.catch((error) => {
				caretWebviewLogger.error("Failed to toggle workflow", error)
			})
	}

	// Close modal when clicking outside
	useClickAway(modalRef, () => {
		setIsVisible(false)
	})

	// Calculate positions for modal and arrow
	useEffect(() => {
		if (isVisible && buttonRef.current) {
			const buttonRect = buttonRef.current.getBoundingClientRect()
			const buttonCenter = buttonRect.left + buttonRect.width / 2
			const rightPosition = document.documentElement.clientWidth - buttonCenter - 5

			setArrowPosition(rightPosition)
			setMenuPosition(buttonRect.top + 1)
		}
	}, [isVisible, viewportWidth, viewportHeight])

	return (
		<div ref={modalRef}>
			<div ref={buttonRef} className="inline-flex min-w-0 max-w-full">
				<Tooltip tipText={t("rulesModal.tooltip.manageRulesWorkflows")} visible={isVisible ? false : undefined}>
					<VSCodeButton
						appearance="icon"
						aria-label={t("rulesModal.ariaLabel.clineRulesButton")}
						onClick={() => setIsVisible(!isVisible)}>
						<span className="codicon codicon-law"></span>
					</VSCodeButton>
				</Tooltip>
			</div>
			{isVisible && (
				<div
					className="fixed left-[15px] right-[15px] border border-[var(--vscode-editorGroup-border)] p-3 rounded z-[1000] overflow-y-auto"
					style={{
						bottom: `calc(100vh - ${menuPosition}px + 6px)`,
						background: CODE_BLOCK_BG_COLOR,
						maxHeight: "calc(100vh - 100px)",
						overscrollBehavior: "contain",
					}}>
					<div
						className="fixed w-[10px] h-[10px] z-[-1] rotate-45 border-r border-b border-[var(--vscode-editorGroup-border)]"
						style={{
							bottom: `calc(100vh - ${menuPosition}px)`,
							right: arrowPosition,
							background: CODE_BLOCK_BG_COLOR,
						}}
					/>

					{/* Tabs container */}
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginBottom: "10px",
						}}>
						<div
							style={{
								display: "flex",
								gap: "1px",
								borderBottom: "1px solid var(--vscode-panel-border)",
							}}>
							<TabButton isActive={currentView === "rules"} onClick={() => setCurrentView("rules")}>
								{t("rules.tab.rules")}
							</TabButton>
							<TabButton isActive={currentView === "workflows"} onClick={() => setCurrentView("workflows")}>
								{t("rules.tab.workflows")}
							</TabButton>
						</div>
					</div>

					{/* Description text */}
					<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-4">
						{currentView === "rules" ? (
							<p>
								{t("rules.description")}
								<VSCodeLink
									href="#"
									onClick={() =>
										vscode.postMessage({
											type: "openUrl",
											url: "https://docs.cline.dev/customization/rules/",
										} as any)
									}
									className="text-xs">
									{t("rules.docsLink")}
								</VSCodeLink>
							</p>
						) : (
							<p>
								{t("rules.workflowsDescription")}{" "}
								<VSCodeLink
									href="#"
									onClick={() =>
										vscode.postMessage({
											type: "openUrl",
											url: "https://docs.cline.dev/customization/workflows/",
										} as any)
									}
									className="text-xs">
									{t("rules.docsLink")}
								</VSCodeLink>
							</p>
						)}
					</div>

					{currentView === "rules" ? (
						<>
							{/* Global Rules Section */}
							<div className="mb-3">
								<div className="text-sm font-normal mb-2">{t("rules.section.globalRules")}</div>
								<RulesToggleList
									rules={globalRules}
									toggleRule={(rulePath, enabled) => toggleRule(true, rulePath, enabled)}
									listGap="small"
									isGlobal={true}
									ruleType={"cline"}
									showNewRule={true}
									showNoRules={false}
								/>
							</div>

							{/* Local Rules Section */}
							<div style={{ marginBottom: -10 }}>
								<div className="text-sm font-normal mb-2">{t("rules.section.workspaceRules")}</div>
								{/* Caret Rules */}
								{caretRules.length > 0 && (
									<>
										<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-1 mt-2">
											{t("rules.subTitle.caretRules")}
										</div>
										<RulesToggleList
											rules={caretRules}
											toggleRule={toggleCaretRule}
											listGap="small"
											isGlobal={false}
											ruleType={"caret"}
											showNewRule={false}
											showNoRules={false}
										/>
									</>
								)}
								{/* Cline Rules */}
								{localRules.length > 0 && (
									<>
										<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-1 mt-2">
											{t("rules.subTitle.clineRules")}
										</div>
										<RulesToggleList
											rules={localRules}
											toggleRule={(rulePath, enabled) => toggleRule(false, rulePath, enabled)}
											listGap="small"
											isGlobal={false}
											ruleType={"cline"}
											showNewRule={true}
											showNoRules={false}
										/>
									</>
								)}
								{/* Cursor Rules */}
								{cursorRules.length > 0 && (
									<>
										<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-1 mt-2">
											{t("rules.subTitle.cursorRules")}
										</div>
										<RulesToggleList
											rules={cursorRules}
											toggleRule={toggleCursorRule}
											listGap="small"
											isGlobal={false}
											ruleType={"cursor"}
											showNewRule={false}
											showNoRules={false}
										/>
									</>
								)}
								{/* Windsurf Rules */}
								{windsurfRules.length > 0 && (
									<>
										<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-1 mt-2">
											{t("rules.subTitle.windsurfRules")}
										</div>
										<RulesToggleList
											rules={windsurfRules}
											toggleRule={toggleWindsurfRule}
											listGap="small"
											isGlobal={false}
											ruleType={"windsurf"}
											showNewRule={false}
											showNoRules={false}
										/>
									</>
								)}
							</div>
						</>
					) : (
						<>
							{/* Global Workflows Section */}
							<div className="mb-3">
								<div className="text-sm font-normal mb-2">{t("rules.section.globalWorkflows")}</div>
								<RulesToggleList
									rules={globalWorkflows}
									toggleRule={(rulePath, enabled) => toggleWorkflow(true, rulePath, enabled)}
									listGap="small"
									isGlobal={true}
									ruleType={"workflow"}
									showNewRule={true}
									showNoRules={false}
								/>
							</div>

							{/* Local Workflows Section */}
							<div style={{ marginBottom: -10 }}>
								<div className="text-sm font-normal mb-2">{t("rules.section.localWorkflows")}</div>
								<RulesToggleList
									rules={localWorkflows}
									toggleRule={(rulePath, enabled) => toggleWorkflow(false, rulePath, enabled)}
									listGap="small"
									isGlobal={false}
									ruleType={"workflow"}
									showNewRule={true}
									showNoRules={false}
								/>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	)
}

const StyledTabButton = styled.button<{ isActive: boolean }>`
	background: none;
	border: none;
	border-bottom: 2px solid ${(props) => (props.isActive ? "var(--vscode-foreground)" : "transparent")};
	color: ${(props) => (props.isActive ? "var(--vscode-foreground)" : "var(--vscode-descriptionForeground)")};
	padding: 8px 16px;
	cursor: pointer;
	font-size: 13px;
	margin-bottom: -1px;
	font-family: inherit;

	&:hover {
		color: var(--vscode-foreground);
	}
`

export const TabButton = ({
	children,
	isActive,
	onClick,
}: {
	children: React.ReactNode
	isActive: boolean
	onClick: () => void
}) => (
	<StyledTabButton isActive={isActive} onClick={onClick}>
		{children}
	</StyledTabButton>
)

export default ClineRulesToggleModal
