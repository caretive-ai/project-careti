import { AutoApprovalSettingsRequest } from "@shared/proto/cline/state"
import { AutoApprovalSettings } from "../../AutoApprovalSettings"

// Converts domain AutoApprovalSettings to proto AutoApprovalSettingsRequest
export function convertAutoApprovalSettingsToProto(settings: AutoApprovalSettings): AutoApprovalSettingsRequest {
	const req: any = {
		metadata: {},
		version: settings.version,
		actions: {
			readFiles: settings.actions.readFiles || false,
			readFilesExternally: settings.actions.readFilesExternally || false,
			editFiles: settings.actions.editFiles || false,
			editFilesExternally: settings.actions.editFilesExternally || false,
			executeSafeCommands: settings.actions.executeSafeCommands || false,
			executeAllCommands: settings.actions.executeAllCommands || false,
			useBrowser: settings.actions.useBrowser || false,
			useMcp: settings.actions.useMcp || false,
			generateImages: settings.actions.generateImages || false,
		},
	}
	if ("enabled" in settings) req.enabled = (settings as any).enabled
	if ("maxRequests" in settings) req.maxRequests = (settings as any).maxRequests
	if ("enableNotifications" in settings) req.enableNotifications = (settings as any).enableNotifications
	if ("favorites" in settings) req.favorites = (settings as any).favorites
	return req as AutoApprovalSettingsRequest
}

// Converts proto AutoApprovalSettingsRequest to domain AutoApprovalSettings
export function convertProtoToAutoApprovalSettings(protoSettings: AutoApprovalSettingsRequest): AutoApprovalSettings {
	const res: any = {
		version: (protoSettings as any).version,
		actions: {
			readFiles: (protoSettings as any).actions?.readFiles || false,
			readFilesExternally: (protoSettings as any).actions?.readFilesExternally || false,
			editFiles: (protoSettings as any).actions?.editFiles || false,
			editFilesExternally: (protoSettings as any).actions?.editFilesExternally || false,
			executeSafeCommands: (protoSettings as any).actions?.executeSafeCommands || false,
			executeAllCommands: (protoSettings as any).actions?.executeAllCommands || false,
			useBrowser: (protoSettings as any).actions?.useBrowser || false,
			useMcp: (protoSettings as any).actions?.useMcp || false,
			generateImages: (protoSettings as any).actions?.generateImages || false,
		},
	}
	if ("enabled" in (protoSettings as any)) res.enabled = (protoSettings as any).enabled
	if ("maxRequests" in (protoSettings as any)) res.maxRequests = (protoSettings as any).maxRequests
	if ("enableNotifications" in (protoSettings as any)) res.enableNotifications = (protoSettings as any).enableNotifications
	if ("favorites" in (protoSettings as any)) res.favorites = (protoSettings as any).favorites
	return res as AutoApprovalSettings
}
