import { useRef, useState, useMemo } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useAutoApproveActions } from "@/hooks/useAutoApproveActions"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import { getAsVar, VSC_TITLEBAR_INACTIVE_FOREGROUND } from "@/utils/vscStyles"
import AutoApproveMenuItem from "./AutoApproveMenuItem"
import AutoApproveModal from "./AutoApproveModal"
import { ACTION_METADATA, NOTIFICATIONS_SETTING } from "./constants"
import { t } from "@/caret/utils/i18n"
import { ActionMetadata } from "./types"

interface AutoApproveBarProps {
	style?: React.CSSProperties
}

const AutoApproveBar = ({ style }: AutoApproveBarProps) => {
	const { autoApprovalSettings } = useExtensionState()
	const { isChecked, isFavorited, updateAction } = useAutoApproveActions()

	const [isModalVisible, setIsModalVisible] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)

	const favorites = useMemo(() => autoApprovalSettings.favorites || [], [autoApprovalSettings.favorites])

	// CARET MODIFICATION: 액션과 하위 액션 재귀 번역 헬퍼
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

	// Render a favorited item with a checkbox
	const renderFavoritedItem = (favId: string) => {
		const actions = [...ACTION_METADATA.flatMap((a) => [a, a.subAction]), NOTIFICATIONS_SETTING]
		const action = actions.find((a) => a?.id === favId)
		if (!action) return null

		return (
			<AutoApproveMenuItem
				key={action.id}
				action={translateAction(action)}
				isChecked={isChecked}
				isFavorited={isFavorited}
				onToggle={updateAction}
				condensed={true}
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
			return ACTION_METADATA.flatMap((a) => [a, a.subAction]).find((a) => a?.id === action)
		})

		let minusFavorites = enabledActions.filter((action) => !favorites.includes(action?.id ?? "") && action?.shortName)

		if (notificationsEnabled) {
			minusFavorites.push(NOTIFICATIONS_SETTING)
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
					{t(action?.shortName ?? "", "settings")}
					{index < minusFavorites.length - 1 && ","}
				</span>
			)),
		]
	}

	return (
		<div
			className="px-[10px] mx-[5px] select-none rounded-[10px_10px_0_0]"
			style={{
				borderTop: `0.5px solid color-mix(in srgb, ${getAsVar(VSC_TITLEBAR_INACTIVE_FOREGROUND)} 20%, transparent)`,
				overflowY: "auto",
				backgroundColor: isModalVisible ? CODE_BLOCK_BG_COLOR : "transparent",
				...style,
			}}>
			<div
				ref={buttonRef}
				className="cursor-pointer py-[8px] pr-[2px] flex items-center justify-between gap-[8px]"
				onClick={() => {
					setIsModalVisible((prev) => !prev)
				}}>
				<div
					className="flex flex-nowrap items-center overflow-x-auto gap-[4px] whitespace-nowrap"
					style={{
						msOverflowStyle: "none",
						scrollbarWidth: "none",
						WebkitOverflowScrolling: "touch",
					}}>
					<span>{t("autoApprove.label", "settings")}:</span>
					{getQuickAccessItems()}
				</div>
				{isModalVisible ? (
					<span className="codicon codicon-chevron-down" />
				) : (
					<span className="codicon codicon-chevron-up" />
				)}
			</div>

			<AutoApproveModal
				isVisible={isModalVisible}
				setIsVisible={setIsModalVisible}
				buttonRef={buttonRef}
				ACTION_METADATA={ACTION_METADATA}
				NOTIFICATIONS_SETTING={NOTIFICATIONS_SETTING}
			/>
		</div>
	)
}

export default AutoApproveBar
