import { useMemo, useRef, useState } from "react"
// CARET MODIFICATION: Import i18n context for language reactivity
import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"
import { t } from "@/caret/utils/i18n"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useAutoApproveActions } from "@/hooks/useAutoApproveActions"
import { getAsVar, VSC_TITLEBAR_INACTIVE_FOREGROUND } from "@/utils/vscStyles"
import AutoApproveMenuItem from "./AutoApproveMenuItem"
import AutoApproveModal from "./AutoApproveModal"
// CARET MODIFICATION: Changed from static constants to dynamic functions for i18n support
import { getActionMetadata, getNotificationsSetting } from "./constants"

interface AutoApproveBarProps {
	style?: React.CSSProperties
}

const AutoApproveBar = ({ style }: AutoApproveBarProps) => {
	const { autoApprovalSettings } = useExtensionState()
	const { isChecked, isFavorited, updateAction } = useAutoApproveActions()
	// CARET MODIFICATION: Use i18n context to detect language changes
	const { language } = useCaretI18nContext()

	const [isModalVisible, setIsModalVisible] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)

	const favorites = useMemo(() => autoApprovalSettings.favorites || [], [autoApprovalSettings.favorites])

	// CARET MODIFICATION: Use dynamic functions with language dependency for i18n updates
	const actionMetadata = useMemo(() => getActionMetadata(), [language])
	const notificationsSetting = useMemo(() => getNotificationsSetting(), [language])

	// Render a favorited item with a checkbox
	const renderFavoritedItem = (favId: string) => {
		const actions = [...actionMetadata.flatMap((a) => [a, a.subAction]), notificationsSetting]
		const action = actions.find((a) => a?.id === favId)
		if (!action) {
			return null
		}

		return (
			<AutoApproveMenuItem
				action={action}
				condensed={true}
				isChecked={isChecked}
				isFavorited={isFavorited}
				onToggle={updateAction}
				showIcon={false}
			/>
		)
	}

	const getQuickAccessItems = () => {
		const notificationsEnabled = autoApprovalSettings.enableNotifications
		const enabledActionsNames = Object.keys(autoApprovalSettings.actions).filter(
			(key) => autoApprovalSettings.actions[key as keyof typeof autoApprovalSettings.actions],
		)
		const enabledActions = enabledActionsNames.map((action) => {
			return actionMetadata.flatMap((a) => [a, a.subAction]).find((a) => a?.id === action)
		})

		const minusFavorites = enabledActions.filter((action) => !favorites.includes(action?.id ?? "") && action?.shortName)

		if (notificationsEnabled) {
			minusFavorites.push(notificationsSetting)
		}

		return [
			...favorites.map((favId) => renderFavoritedItem(favId)),
			minusFavorites.length > 0 ? (
				<span className="text-[color:var(--vscode-foreground-muted)] pl-[10px] opacity-60" key="separator">
					✓
				</span>
			) : null,
			...minusFavorites.map((action, index) => (
				<span className="text-[color:var(--vscode-foreground-muted)] opacity-60" key={action?.id}>
					{action?.shortName}
					{index < minusFavorites.length - 1 && ","}
				</span>
			)),
		]
	}

	return (
		<div
			className="px-[10px] mx-[15px] select-none rounded-[10px_10px_0_0]"
			style={{
				borderTop: `0.5px solid color-mix(in srgb, ${getAsVar(VSC_TITLEBAR_INACTIVE_FOREGROUND)} 20%, transparent)`,
				overflowY: "auto",
				backgroundColor: isModalVisible ? CODE_BLOCK_BG_COLOR : "transparent",
				...style,
			}}>
			<div
				className="cursor-pointer py-[8px] pr-[2px] flex items-center justify-between gap-[8px]"
				onClick={() => {
					setIsModalVisible((prev) => !prev)
				}}
				ref={buttonRef}>
				<div
					className="flex flex-nowrap items-center overflow-x-auto gap-[4px] whitespace-nowrap"
					style={{
						msOverflowStyle: "none",
						scrollbarWidth: "none",
						WebkitOverflowScrolling: "touch",
					}}>
					<span>{t("autoApprove.autoApproveLabel", "common")}</span>
					{getQuickAccessItems()}
				</div>
				{isModalVisible ? (
					<span className="codicon codicon-chevron-down" />
				) : (
					<span className="codicon codicon-chevron-up" />
				)}
			</div>

			<AutoApproveModal
				ACTION_METADATA={actionMetadata}
				buttonRef={buttonRef}
				isVisible={isModalVisible}
				NOTIFICATIONS_SETTING={notificationsSetting}
				setIsVisible={setIsModalVisible}
			/>
		</div>
	)
}

export default AutoApproveBar
