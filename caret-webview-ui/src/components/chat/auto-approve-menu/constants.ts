// CARET MODIFICATION: 자동 승인 액션 메타데이터 정의 및 다국어 키 적용
import { ActionMetadata } from "./types"

export const ACTION_METADATA: ActionMetadata[] = [
	{
		id: "enableAutoApprove",
		label: "autoApprove.enableAutoApprove.label",
		shortName: "autoApprove.enableAutoApprove.shortName",
		description: "autoApprove.enableAutoApprove.description",
		icon: "codicon-play-circle",
	},
	{
		id: "enableAll",
		label: "autoApprove.enableAll.label",
		shortName: "autoApprove.enableAll.shortName",
		description: "autoApprove.enableAll.description",
		icon: "codicon-checklist",
	},
	{
		id: "readFiles",
		label: "autoApprove.readFiles.label",
		shortName: "autoApprove.readFiles.shortName",
		description: "autoApprove.readFiles.description",
		icon: "codicon-search",
		subAction: {
			id: "readFilesExternally",
			label: "autoApprove.readFilesExternally.label",
			shortName: "autoApprove.readFilesExternally.shortName",
			description: "autoApprove.readFilesExternally.description",
			icon: "codicon-folder-opened",
			parentActionId: "readFiles",
		},
	},
	{
		id: "editFiles",
		label: "autoApprove.editFiles.label",
		shortName: "autoApprove.editFiles.shortName",
		description: "autoApprove.editFiles.description",
		icon: "codicon-edit",
		subAction: {
			id: "editFilesExternally",
			label: "autoApprove.editFilesExternally.label",
			shortName: "autoApprove.editFilesExternally.shortName",
			description: "autoApprove.editFilesExternally.description",
			icon: "codicon-files",
			parentActionId: "editFiles",
		},
	},
	{
		id: "executeSafeCommands",
		label: "autoApprove.executeSafeCommands.label",
		shortName: "autoApprove.executeSafeCommands.shortName",
		description: "autoApprove.executeSafeCommands.description",
		icon: "codicon-terminal",
		subAction: {
			id: "executeAllCommands",
			label: "autoApprove.executeAllCommands.label",
			shortName: "autoApprove.executeAllCommands.shortName",
			description: "autoApprove.executeAllCommands.description",
			icon: "codicon-terminal-bash",
			parentActionId: "executeSafeCommands",
		},
	},
	{
		id: "useBrowser",
		label: "autoApprove.useBrowser.label",
		shortName: "autoApprove.useBrowser.shortName",
		description: "autoApprove.useBrowser.description",
		icon: "codicon-globe",
	},
	{
		id: "useMcp",
		label: "autoApprove.useMcp.label",
		shortName: "autoApprove.useMcp.shortName",
		description: "autoApprove.useMcp.description",
		icon: "codicon-server",
	},
]

export const NOTIFICATIONS_SETTING: ActionMetadata = {
	id: "enableNotifications",
	label: "autoApprove.enableNotifications.label",
	shortName: "autoApprove.enableNotifications.shortName",
	description: "autoApprove.enableNotifications.description",
	icon: "codicon-bell",
} // CARET MODIFICATION: 알림 설정 메타데이터 정의 및 다국어 키 적용
