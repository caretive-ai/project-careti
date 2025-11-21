import { t } from "@/caret/utils/i18n"
import { ActionMetadata } from "./types"

export const getActionMetadata = (): ActionMetadata[] => [
	{
		id: "enableAutoApprove",
		label: t("autoApprove.enableAutoApprove.label", "settings"),
		shortName: t("autoApprove.enableAutoApprove.shortName", "settings"),
		description: t("autoApprove.enableAutoApprove.description", "settings"),
		icon: "codicon-play-circle",
	},
	{
		id: "enableAll",
		label: t("autoApprove.enableAll.label", "settings"),
		shortName: t("autoApprove.enableAll.shortName", "settings"),
		description: t("autoApprove.enableAll.description", "settings"),
		icon: "codicon-checklist",
	},
	{
		id: "readFiles",
		label: t("autoApprove.readFiles.label", "settings"),
		shortName: t("autoApprove.readFiles.shortName", "settings"),
		description: t("autoApprove.readFiles.description", "settings"),
		icon: "codicon-search",
		subAction: {
			id: "readFilesExternally",
			label: t("autoApprove.readFilesExternally.label", "settings"),
			shortName: t("autoApprove.readFilesExternally.shortName", "settings"),
			description: t("autoApprove.readFilesExternally.description", "settings"),
			icon: "codicon-folder-opened",
			parentActionId: "readFiles",
		},
	},
	{
		id: "editFiles",
		label: t("autoApprove.editFiles.label", "settings"),
		shortName: t("autoApprove.editFiles.shortName", "settings"),
		description: t("autoApprove.editFiles.description", "settings"),
		icon: "codicon-edit",
		subAction: {
			id: "editFilesExternally",
			label: t("autoApprove.editFilesExternally.label", "settings"),
			shortName: t("autoApprove.editFilesExternally.shortName", "settings"),
			description: t("autoApprove.editFilesExternally.description", "settings"),
			icon: "codicon-files",
			parentActionId: "editFiles",
		},
	},
	{
		id: "executeSafeCommands",
		label: t("autoApprove.executeSafeCommands.label", "settings"),
		shortName: t("autoApprove.executeSafeCommands.shortName", "settings"),
		description: t("autoApprove.executeSafeCommands.description", "settings"),
		icon: "codicon-terminal",
		subAction: {
			id: "executeAllCommands",
			label: t("autoApprove.executeAllCommands.label", "settings"),
			shortName: t("autoApprove.executeAllCommands.shortName", "settings"),
			description: t("autoApprove.executeAllCommands.description", "settings"),
			icon: "codicon-terminal-bash",
			parentActionId: "executeSafeCommands",
		},
	},
	{
		id: "useBrowser",
		label: t("autoApprove.useBrowser.label", "settings"),
		shortName: t("autoApprove.useBrowser.shortName", "settings"),
		description: t("autoApprove.useBrowser.description", "settings"),
		icon: "codicon-globe",
	},
	{
		id: "useMcp",
		label: t("autoApprove.useMcp.label", "settings"),
		shortName: t("autoApprove.useMcp.shortName", "settings"),
		description: t("autoApprove.useMcp.description", "settings"),
		icon: "codicon-server",
	},
]

export const getNotificationsSetting = (): ActionMetadata => ({
	id: "enableNotifications",
	label: t("autoApprove.enableNotifications.label", "settings"),
	shortName: t("autoApprove.enableNotifications.shortName", "settings"),
	description: t("autoApprove.enableNotifications.description", "settings"),
	icon: "codicon-bell",
})
