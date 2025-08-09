// CARET MODIFICATION: 파일 시작 주석 테스트
import React, { useRef, useState, useEffect } from "react"
import { useClickAway, useWindowSize } from "react-use"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useAutoApproveActions } from "@/hooks/useAutoApproveActions"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import { VSCodeTextField, VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { getAsVar, VSC_TITLEBAR_INACTIVE_FOREGROUND } from "@/utils/vscStyles"
import HeroTooltip from "@/components/common/HeroTooltip"
import AutoApproveMenuItem from "./AutoApproveMenuItem"
import { ActionMetadata } from "./types"
import { t } from "@/caret/utils/i18n" // CARET MODIFICATION: 다국어 지원을 위한 t 함수 임포트

const breakpoint = 500

interface AutoApproveModalProps {
	isVisible: boolean
	setIsVisible: (visible: boolean) => void
	buttonRef: React.RefObject<HTMLDivElement>
	ACTION_METADATA: ActionMetadata[]
	NOTIFICATIONS_SETTING: ActionMetadata
}

const AutoApproveModal: React.FC<AutoApproveModalProps> = ({
	isVisible,
	setIsVisible,
	buttonRef,
	ACTION_METADATA,
	NOTIFICATIONS_SETTING,
}) => {
	const { autoApprovalSettings } = useExtensionState()
	const { isChecked, isFavorited, toggleFavorite, updateAction, updateMaxRequests } = useAutoApproveActions()

	const modalRef = useRef<HTMLDivElement>(null)
	const itemsContainerRef = useRef<HTMLDivElement>(null)
	const { width: viewportWidth, height: viewportHeight } = useWindowSize()
	const [arrowPosition, setArrowPosition] = useState(0)
	const [menuPosition, setMenuPosition] = useState(0)
	const [containerWidth, setContainerWidth] = useState(0)

	useClickAway(modalRef, (e) => {
		// Skip if click was on the button that toggles the modal
		if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
			return
		}
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
	}, [isVisible, viewportWidth, viewportHeight, buttonRef])

	// Track container width for responsive layout
	useEffect(() => {
		if (!isVisible) return

		const updateWidth = () => {
			if (itemsContainerRef.current) {
				setContainerWidth(itemsContainerRef.current.offsetWidth)
			}
		}

		// Initial measurement
		updateWidth()

		// Set up resize observer
		const resizeObserver = new ResizeObserver(updateWidth)
		if (itemsContainerRef.current) {
			resizeObserver.observe(itemsContainerRef.current)
		}

		// Clean up
		return () => {
			resizeObserver.disconnect()
		}
	}, [isVisible])

	// CARET MODIFICATION: 액션과 하위 액션까지 재귀적으로 번역하는 헬퍼
	const translateAction = (action: ActionMetadata): ActionMetadata => {
		const translated: ActionMetadata = {
			...action,
			label: t(action.label, "settings"),
			description: t(action.description, "settings"),
			shortName: t(action.shortName, "settings"),
		}
		if (action.subAction) {
			translated.subAction = translateAction(action.subAction)
		}
		return translated
	}

	if (!isVisible) return null

	return (
		<div ref={modalRef}>
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

				<div className="flex justify-between items-center mb-3">
					<HeroTooltip
						content={t("autoApprove.tooltip", "settings")}
						placement="top">
						<div className="text-base font-semibold mb-1">{t("autoApprove.title", "settings")}</div> 
					</HeroTooltip>
					<VSCodeButton appearance="icon" onClick={() => setIsVisible(false)}>
						<span className="codicon codicon-close text-[10px]"></span>
					</VSCodeButton>
				</div>

				<div className="mb-2.5">
					<span className="text-[color:var(--vscode-foreground)] font-medium">{t("autoApprove.actionsHeader", "settings")}:</span>
				</div>

				<div
					ref={itemsContainerRef}
					className="relative mb-6"
					style={{
						columnCount: containerWidth > breakpoint ? 2 : 1,
						columnGap: "4px",
					}}>
					{/* Vertical separator line - only visible in two-column mode */}
					{containerWidth > breakpoint && (
						<div
							className="absolute left-1/2 top-0 bottom-0 w-[0.5px] opacity-20"
							style={{
								background: getAsVar(VSC_TITLEBAR_INACTIVE_FOREGROUND),
								transform: "translateX(-50%)", // Center the line
							}}
						/>
					)}

					{/* All items in a single list - CSS Grid will handle the column distribution */}
					{ACTION_METADATA.map((action) => (
						<AutoApproveMenuItem
							key={action.id}
							action={translateAction(action)}
							isChecked={isChecked}
							isFavorited={isFavorited}
							onToggle={updateAction}
							onToggleFavorite={toggleFavorite}
						/>
					))}
				</div>

				<div className="mb-2.5">
					<span className="text-[color:var(--vscode-foreground)] font-medium">{t("autoApprove.quickSettingsHeader", "settings")}:</span>
				</div>

				<AutoApproveMenuItem
					key={NOTIFICATIONS_SETTING.id}
					action={translateAction(NOTIFICATIONS_SETTING)}
					isChecked={isChecked}
					isFavorited={isFavorited}
					onToggle={updateAction}
					onToggleFavorite={toggleFavorite}
				/>

				<HeroTooltip
					content={t("autoApprove.maxRequestsTooltip", "settings")}
					placement="top">
					<div className="flex items-center pl-1.5 my-2">
						<span className="codicon codicon-settings text-[#CCCCCC] text-[14px]" />
						<span className="text-[#CCCCCC] text-xs font-medium ml-2">{t("autoApprove.maxRequestsLabel", "settings")}:</span>
						<VSCodeTextField
							className="flex-1 w-full pr-[35px] ml-4"
							value={autoApprovalSettings.maxRequests.toString()}
							onInput={async (e) => {
								const input = e.target as HTMLInputElement
								// Remove any non-numeric characters
								input.value = input.value.replace(/[^0-9]/g, "")
								const value = parseInt(input.value)
								if (!isNaN(value) && value > 0) {
									await updateMaxRequests(value)
								}
							}}
							onKeyDown={(e) => {
								// Prevent non-numeric keys (except for backspace, delete, arrows)
								if (!/^\d$/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key)) {
									e.preventDefault()
								}
							}}
						/>
					</div>
				</HeroTooltip>
			</div>
		</div>
	)
}

export default AutoApproveModal
