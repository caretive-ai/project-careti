// CARET MODIFICATION: Import types needed for merge fix
import { WebviewProvider } from "@/core/webview"
import { DiffViewProviderCreator, HostProvider, WebviewProviderCreator } from "@/hosts/host-provider"
import { HostBridgeClientProvider } from "@/hosts/host-provider-types"
import { vscodeHostBridgeClient } from "@/hosts/vscode/hostbridge/client/host-grpc-client"
import { WebviewProviderType } from "@/shared/webview/types"

/**
 * Initializes the HostProvider with test defaults.
 * This is a common setup used across multiple test files.
 *
 * @param options Optional overrides for the default test configuration
 */
export function setVscodeHostProviderMock(options?: {
	webviewProviderCreator?: WebviewProviderCreator
	diffViewProviderCreator?: DiffViewProviderCreator
	hostBridgeClient?: HostBridgeClientProvider
	logToChannel?: (message: string) => void
	getCallbackUri?: () => Promise<string>
	getBinaryLocation?: (name: string) => Promise<string>
	extensionFsPath?: string
	globalStorageFsPath?: string
}) {
	HostProvider.reset()
	HostProvider.initialize(
		// CARET MODIFICATION: WebviewProviderCreator now requires providerType parameter (merge fix)
		options?.webviewProviderCreator ?? ((_providerType: WebviewProviderType) => ({}) as WebviewProvider),
		options?.diffViewProviderCreator ?? ((() => {}) as DiffViewProviderCreator),
		options?.hostBridgeClient ?? vscodeHostBridgeClient,
		options?.logToChannel ?? ((_) => {}),
		options?.getCallbackUri ?? (async () => "http://example.com:1234/"),
		options?.getBinaryLocation ?? (async (n) => `/mock/path/to/binary/${n}`),
		options?.extensionFsPath ?? "/mock/path/to/extension",
		options?.globalStorageFsPath ?? "/mock/path/to/globalstorage",
	)
}
