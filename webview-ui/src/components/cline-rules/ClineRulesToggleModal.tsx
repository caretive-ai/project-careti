// CARETI MODIFICATION: Rules, Workflows, and Hooks toggle modal
// Updated to include hooks tab from cline-latest with Careti path standards
import { EmptyRequest } from "@shared/proto/cline/common"
import {
    ClineRulesToggles,
    RefreshedRules,
    SkillInfo,
    ToggleCaretRuleRequest,
    ToggleClineRuleRequest,
    ToggleCursorRuleRequest,
    ToggleSkillRequest,
    ToggleWindsurfRuleRequest,
    ToggleWorkflowRequest,
} from "@shared/proto/cline/file"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import React, { useEffect, useRef, useState } from "react"
import { useClickAway, useWindowSize } from "react-use"
import styled from "styled-components"
// CARETI MODIFICATION: Import PersonaManagement for persona system integration
import PersonaManagement from "@/careti/components/PersonaManagement"
import { useCaretI18nContext } from "@/careti/context/CaretI18nContext"
import { t } from "@/careti/utils/i18n"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import Tooltip from "@/components/common/Tooltip"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { FileServiceClient } from "@/services/grpc-client"
import { isMacOSOrLinux } from "@/utils/platformUtils"
import HookRow from "./HookRow"
import NewRuleRow from "./NewRuleRow"
import RuleRow from "./RuleRow"
import RulesToggleList from "./RulesToggleList"

const ClineRulesToggleModal: React.FC = () => {
	const { language } = useCaretI18nContext()
	const {
		globalClineRulesToggles = {},
		localClineRulesToggles = {},
		localCaretRulesToggles = {}, // CARETI MODIFICATION: Add missing localCaretRulesToggles
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
		// CARETI MODIFICATION: Skills toggles
		globalSkillsToggles = {},
		localSkillsToggles = {},
		setGlobalSkillsToggles,
		setLocalSkillsToggles,
		skillsEnabled,
		// CARETI MODIFICATION: Get featureConfig from ExtensionState for runtime dynamic delivery
		modeSystem,
		enablePersonaSystem,
		featureConfig,
		hooksEnabled,
	} = useExtensionState()

	// CARETI MODIFICATION: Hooks state management
	const [globalHooks, setGlobalHooks] = useState<Array<{ name: string; enabled: boolean; absolutePath: string }>>([])
	const [workspaceHooks, setWorkspaceHooks] = useState<
		Array<{ workspaceName: string; hooks: Array<{ name: string; enabled: boolean; absolutePath: string }> }>
	>([])
	// CARETI MODIFICATION: Skills state management
	const [globalSkills, setGlobalSkills] = useState<SkillInfo[]>([])
	const [localSkills, setLocalSkills] = useState<SkillInfo[]>([])

	const isWindows = !isMacOSOrLinux()
	const [isVisible, setIsVisible] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)
	const modalRef = useRef<HTMLDivElement>(null)
	const { width: viewportWidth, height: viewportHeight } = useWindowSize()
	const [arrowPosition, setArrowPosition] = useState(0)
	const [menuPosition, setMenuPosition] = useState(0)
	const [currentView, setCurrentView] = useState<"rules" | "workflows" | "hooks" | "skills">("rules")

	// CARETI MODIFICATION: Auto-switch to rules tab if hooks become disabled while viewing hooks tab
	useEffect(() => {
		if (currentView === "hooks" && !hooksEnabled) {
			setCurrentView("rules")
		}
	}, [currentView, hooksEnabled])

	// CARETI MODIFICATION: Auto-switch to rules tab if skills become disabled while viewing skills tab
	useEffect(() => {
		if (currentView === "skills" && !skillsEnabled) {
			setCurrentView("rules")
		}
	}, [currentView, skillsEnabled])

	useEffect(() => {
		if (isVisible) {
			FileServiceClient.refreshRules({} as EmptyRequest)
				.then((response: RefreshedRules) => {
					// Update state with the response data using all available setters
					if (response.globalClineRulesToggles?.toggles) {
						setGlobalClineRulesToggles(response.globalClineRulesToggles.toggles)
					}
					if (response.localClineRulesToggles?.toggles) {
						setLocalClineRulesToggles(response.localClineRulesToggles.toggles)
					}
					if (response.localCaretRulesToggles?.toggles) {
						// CARETI MODIFICATION: Add missing handler
						setLocalCaretRulesToggles(response.localCaretRulesToggles.toggles)
					}
					if (response.localCursorRulesToggles?.toggles) {
						setLocalCursorRulesToggles(response.localCursorRulesToggles.toggles)
					}
					if (response.localWindsurfRulesToggles?.toggles) {
						setLocalWindsurfRulesToggles(response.localWindsurfRulesToggles.toggles)
					}
					if (response.localWorkflowToggles?.toggles) {
						setLocalWorkflowToggles(response.localWorkflowToggles.toggles)
					}
					if (response.globalWorkflowToggles?.toggles) {
						setGlobalWorkflowToggles(response.globalWorkflowToggles.toggles)
					}
				})
				.catch((error) => {
					console.error("Failed to refresh rules:", error)
				})
		}
	}, [isVisible])

	// CARETI MODIFICATION: Refresh hooks when hooks tab becomes visible
	useEffect(() => {
		if (!isVisible || currentView !== "hooks") {
			return
		}

		const abortController = new AbortController()

		// Initial refresh when tab opens
		const refreshHooks = () => {
			if (abortController.signal.aborted) return

			FileServiceClient.refreshHooks({} as EmptyRequest)
				.then((response) => {
					if (!abortController.signal.aborted) {
						setGlobalHooks(response.globalHooks || [])
						setWorkspaceHooks(response.workspaceHooks || [])
					}
				})
				.catch((error) => {
					if (!abortController.signal.aborted) {
						console.error("Failed to refresh hooks:", error)
					}
				})
		}

		// Refresh immediately
		refreshHooks()

		// Poll every 1 second to detect filesystem changes
		const pollInterval = setInterval(refreshHooks, 1000)

		return () => {
			abortController.abort()
			clearInterval(pollInterval)
		}
	}, [isVisible, currentView])

	// CARETI MODIFICATION: Refresh skills when skills tab becomes visible
	useEffect(() => {
		if (!isVisible || currentView !== "skills") {
			return
		}

		let isCancelled = false

		const refreshSkills = () => {
			if (isCancelled) return

			FileServiceClient.refreshSkills({} as EmptyRequest)
				.then((response) => {
					if (!isCancelled) {
						setGlobalSkills(response.globalSkills || [])
						setLocalSkills(response.localSkills || [])
					}
				})
				.catch((error) => {
					if (!isCancelled) {
						console.error("Failed to refresh skills:", error)
					}
				})
		}

		// Refresh immediately
		refreshSkills()

		// Poll every 1 second to detect filesystem changes
		const pollInterval = setInterval(refreshSkills, 1000)

		return () => {
			isCancelled = true
			clearInterval(pollInterval)
		}
	}, [isVisible, currentView])

	// Format global rules for display with proper typing
	const globalRules = Object.entries(globalClineRulesToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	// Format local rules for display with proper typing
	const localRules = Object.entries(localClineRulesToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	const cursorRules = Object.entries(localCursorRulesToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	// CARETI MODIFICATION: Add caretRules for display
	const caretRules = Object.entries(localCaretRulesToggles || {})
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

	// Handle toggle rule using gRPC
	const toggleRule = (isGlobal: boolean, rulePath: string, enabled: boolean) => {
		FileServiceClient.toggleClineRule(
			ToggleClineRuleRequest.create({
				isGlobal,
				rulePath,
				enabled,
			}),
		)
			.then((response) => {
				// Update the local state with the response
				if (response.globalClineRulesToggles?.toggles) {
					setGlobalClineRulesToggles(response.globalClineRulesToggles.toggles)
				}
				if (response.localClineRulesToggles?.toggles) {
					setLocalClineRulesToggles(response.localClineRulesToggles.toggles)
				}
			})
			.catch((error) => {
				console.error("Error toggling Cline rule:", error)
			})
	}

	// CARETI MODIFICATION: Add toggleCaretRule function
	const toggleCaretRule = (rulePath: string, enabled: boolean) => {
		FileServiceClient.toggleCaretRule(
			ToggleCaretRuleRequest.create({
				rulePath,
				enabled,
			}),
		)
			.then((response) => {
				// Update the local state with the response
				if (response.toggles) {
					setLocalCaretRulesToggles(response.toggles)
				}
			})
			.catch((error) => {
				console.error("Error toggling Careti rule:", error)
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
				// Update the local state with the response
				if (response.toggles) {
					setLocalCursorRulesToggles(response.toggles)
				}
			})
			.catch((error) => {
				console.error("Error toggling Cursor rule:", error)
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
				console.error("Error toggling Windsurf rule:", error)
			})
	}

	// CARETI MODIFICATION: Toggle hook handler
	const toggleHook = (isGlobal: boolean, hookName: string, enabled: boolean, workspaceName?: string) => {
		FileServiceClient.toggleHook({
			metadata: {} as any,
			hookName,
			isGlobal,
			enabled,
			workspaceName,
		})
			.then((response) => {
				setGlobalHooks(response.hooksToggles?.globalHooks || [])
				setWorkspaceHooks(response.hooksToggles?.workspaceHooks || [])
			})
			.catch((error) => {
				console.error("Error toggling hook:", error)
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
			.catch((err: Error) => {
				console.error("Failed to toggle workflow:", err)
			})
	}

	// CARETI MODIFICATION: Handle toggle for skills
	const toggleSkill = (isGlobal: boolean, skillPath: string, enabled: boolean) => {
		FileServiceClient.toggleSkill(
			ToggleSkillRequest.create({
				skillPath,
				isGlobal,
				enabled,
			}),
		)
			.then((response) => {
				if (response.globalSkillsToggles) {
					setGlobalSkillsToggles(response.globalSkillsToggles)
				}
				if (response.localSkillsToggles) {
					setLocalSkillsToggles(response.localSkillsToggles)
				}
				// Update local skills state
				if (isGlobal) {
					setGlobalSkills((prev) => prev.map((s) => (s.path === skillPath ? { ...s, enabled } : s)))
				} else {
					setLocalSkills((prev) => prev.map((s) => (s.path === skillPath ? { ...s, enabled } : s)))
				}
			})
			.catch((error) => {
				console.error("Error toggling skill:", error)
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
			<div className="inline-flex min-w-0 max-w-full" ref={buttonRef}>
				<Tooltip
					tipText={t("clineRulesToggleModal.manageRulesWorkflows", "chat")}
					visible={isVisible ? false : undefined}>
					<VSCodeButton
						appearance="icon"
						aria-label="Cline Rules"
						onClick={() => setIsVisible(!isVisible)}
						style={{ padding: "0px 0px", height: "20px" }}>
						<div className="flex items-center gap-1 text-xs whitespace-nowrap min-w-0 w-full">
							<span
								className="codicon codicon-law flex items-center"
								style={{ fontSize: "12.5px", marginBottom: 1 }}
							/>
						</div>
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
								{t("clineRulesToggleModal.rulesTab", "chat")}
							</TabButton>
							<TabButton isActive={currentView === "workflows"} onClick={() => setCurrentView("workflows")}>
								{t("clineRulesToggleModal.workflowsTab", "chat")}
							</TabButton>
							{/* CARETI MODIFICATION: Hooks tab - only show when hooks feature is enabled */}
							{hooksEnabled && (
								<TabButton isActive={currentView === "hooks"} onClick={() => setCurrentView("hooks")}>
									{t("clineRulesToggleModal.hooksTab", "chat")}
								</TabButton>
							)}
							{/* CARETI MODIFICATION: Skills tab - only show when skills feature is enabled */}
							{skillsEnabled && (
								<TabButton isActive={currentView === "skills"} onClick={() => setCurrentView("skills")}>
									{t("clineRulesToggleModal.skillsTab", "chat")}
								</TabButton>
							)}
						</div>
					</div>

					{/* Description text */}
					<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-4">
						{currentView === "rules" ? (
							<p>
								{t("clineRulesToggleModal.rulesDescription", "chat")}{" "}
								<VSCodeLink
									className="text-xs"
									href={`https://docs.careti.ai/${language}/features/careti-rules`}
									style={{ display: "inline" }}>
									{t("clineRulesToggleModal.docs", "chat")}
								</VSCodeLink>
							</p>
						) : currentView === "workflows" ? (
							<p>
								{t("clineRulesToggleModal.workflowsDescription", "chat")}{" "}
								<span className="text-[var(--vscode-foreground)] font-bold">
									{t("clineRulesToggleModal.workflowName", "chat")}
								</span>{" "}
								in the chat.{" "}
								<VSCodeLink
									className="text-xs"
									href={`https://docs.careti.ai/${language}/features/slash-commands/workflows`}
									style={{ display: "inline" }}>
									{t("clineRulesToggleModal.docs", "chat")}
								</VSCodeLink>
							</p>
						) : currentView === "skills" ? (
							<p>{t("clineRulesToggleModal.skillsDescription", "chat")}</p>
						) : (
							<p>{t("clineRulesToggleModal.hooksDescription", "chat")}</p>
						)}
					</div>

					{currentView === "rules" ? (
						<>
							{/* CARETI MODIFICATION: Persona Management Section - only shown when feature flag enabled AND user enabled it */}
							{featureConfig?.showPersonaSettings && modeSystem === "careti" && enablePersonaSystem && (
								<PersonaManagement className="mb-3" />
							)}

							{/* Global Rules Section */}
							<div className="mb-3">
								<div className="text-sm font-normal mb-2">{t("clineRulesToggleModal.globalRules", "chat")}</div>
								<RulesToggleList
									isGlobal={true}
									listGap="small"
									rules={globalRules}
									ruleType={"cline"}
									showNewRule={true}
									showNoRules={false}
									toggleRule={(rulePath, enabled) => toggleRule(true, rulePath, enabled)}
								/>
							</div>

							{/* Local Rules Section */}
							<div style={{ marginBottom: -10 }}>
								<div className="text-sm font-normal mb-2">{t("rules.section.workspaceRules", "settings")}</div>
								{/* CARETI MODIFICATION: Show .agents/context only */}
								<RulesToggleList
									isGlobal={false}
									listGap="small" // CARETI MODIFICATION: Use dedicated careti toggle
									rules={caretRules}
									ruleType={"careti"}
									showNewRule={false}
									showNoRules={false}
									toggleRule={toggleCaretRule}
								/>
							</div>
						</>
					) : currentView === "workflows" ? (
						<>
							{/* Global Workflows Section */}
							<div className="mb-3">
								<div className="text-sm font-normal mb-2">
									{t("clineRulesToggleModal.globalWorkflows", "chat")}
								</div>
								<RulesToggleList
									isGlobal={true}
									listGap="small"
									rules={globalWorkflows}
									ruleType={"workflow"}
									showNewRule={true}
									showNoRules={false}
									toggleRule={(rulePath, enabled) => toggleWorkflow(true, rulePath, enabled)}
								/>
							</div>

							{/* Local Workflows Section */}
							<div style={{ marginBottom: -10 }}>
								<div className="text-sm font-normal mb-2">
									{t("clineRulesToggleModal.workspaceWorkflows", "chat")}
								</div>
								<RulesToggleList
									isGlobal={false}
									listGap="small"
									rules={localWorkflows}
									ruleType={"workflow"}
									showNewRule={true}
									showNoRules={false}
									toggleRule={(rulePath, enabled) => toggleWorkflow(false, rulePath, enabled)}
								/>
							</div>
						</>
					) : currentView === "skills" ? (
						<>
							{/* CARETI MODIFICATION: Skills Tab Content */}
							{/* Global Skills Section */}
							<div className="mb-3">
								<div className="text-sm font-normal mb-2">
									{t("clineRulesToggleModal.globalSkills", "chat")}
								</div>
								<div className="flex flex-col gap-0">
									{globalSkills
										.sort((a, b) => a.name.localeCompare(b.name))
										.map((skill) => (
											<RuleRow
												enabled={skill.enabled}
												isGlobal={true}
												key={skill.path}
												rulePath={skill.path}
												ruleType="skill"
												toggleRule={(path, enabled) => toggleSkill(true, path, enabled)}
											/>
										))}
									<NewRuleRow isGlobal={true} ruleType="skill" />
								</div>
							</div>

							{/* Workspace Skills Section */}
							<div style={{ marginBottom: -10 }}>
								<div className="text-sm font-normal mb-2">
									{t("clineRulesToggleModal.workspaceSkills", "chat")}
								</div>
								<div className="flex flex-col gap-0">
									{localSkills
										.sort((a, b) => a.name.localeCompare(b.name))
										.map((skill) => (
											<RuleRow
												enabled={skill.enabled}
												isGlobal={false}
												key={skill.path}
												rulePath={skill.path}
												ruleType="skill"
												toggleRule={(path, enabled) => toggleSkill(false, path, enabled)}
											/>
										))}
									<NewRuleRow isGlobal={false} ruleType="skill" />
								</div>
							</div>
						</>
					) : (
						<>
							{/* CARETI MODIFICATION: Hooks Tab Content */}
							<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-4">
								<p>
									Toggle to enable/disable (chmod +x/-x).{" "}
									<VSCodeLink
										className="text-xs"
										href={`https://docs.careti.ai/${language}/features/hooks`}
										style={{ display: "inline" }}>
										{t("clineRulesToggleModal.docs", "chat")}
									</VSCodeLink>
								</p>
							</div>

							{/* Windows warning banner */}
							{isWindows && (
								<div className="flex items-center gap-2 px-5 py-3 mb-4 bg-[var(--vscode-inputValidation-warningBackground)] border-l-[3px] border-[var(--vscode-inputValidation-warningBorder)]">
									<i className="codicon codicon-warning text-sm" />
									<span className="text-base">
										Hook toggling is not supported on Windows. Hooks can be created, edited, and deleted,
										but cannot be enabled/disabled and will not execute.
									</span>
								</div>
							)}

							{/* Global Hooks */}
							<div className="mb-3">
								<div className="text-sm font-normal mb-2">
									{t("clineRulesToggleModal.globalHooks", "chat")}
								</div>
								<div className="flex flex-col gap-0">
									{globalHooks
										.sort((a, b) => a.name.localeCompare(b.name))
										.map((hook) => (
											<HookRow
												absolutePath={hook.absolutePath}
												enabled={hook.enabled}
												hookName={hook.name}
												isGlobal={true}
												isWindows={isWindows}
												key={hook.name}
												onDelete={(hooksToggles) => {
													// Use response data directly, no need to refresh
													setGlobalHooks(hooksToggles.globalHooks || [])
													setWorkspaceHooks(hooksToggles.workspaceHooks || [])
												}}
												onToggle={(name: string, newEnabled: boolean) =>
													toggleHook(true, name, newEnabled)
												}
											/>
										))}
									<NewRuleRow
										existingHooks={globalHooks.map((h) => h.name)}
										isGlobal={true}
										ruleType="hook"
									/>
								</div>
							</div>

							{/* Workspace Hooks - one section per workspace */}
							{/* CARETI MODIFICATION: Use .agents/hooks path instead of .clinerules/hooks */}
							{workspaceHooks.map((workspace, index) => (
								<div
									key={workspace.workspaceName}
									style={{ marginBottom: index === workspaceHooks.length - 1 ? -10 : 12 }}>
									<div className="text-sm font-normal mb-2">
										{workspace.workspaceName}/.agents/hooks/
									</div>
									<div className="flex flex-col gap-0">
										{workspace.hooks
											.sort((a, b) => a.name.localeCompare(b.name))
											.map((hook) => (
												<HookRow
													absolutePath={hook.absolutePath}
													enabled={hook.enabled}
													hookName={hook.name}
													isGlobal={false}
													isWindows={isWindows}
													key={hook.absolutePath}
													onDelete={(hooksToggles) => {
														// Use response data directly, no need to refresh
														setGlobalHooks(hooksToggles.globalHooks || [])
														setWorkspaceHooks(hooksToggles.workspaceHooks || [])
													}}
													onToggle={(name: string, newEnabled: boolean) =>
														toggleHook(false, name, newEnabled, workspace.workspaceName)
													}
													workspaceName={workspace.workspaceName}
												/>
											))}
										<NewRuleRow
											existingHooks={workspace.hooks.map((h) => h.name)}
											isGlobal={false}
											ruleType="hook"
											workspaceName={workspace.workspaceName}
										/>
									</div>
								</div>
							))}
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
