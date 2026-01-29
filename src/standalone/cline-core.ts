import { ExternalDiffViewProvider } from "@hosts/external/ExternalDiffviewProvider"
import { ExternalWebviewProvider } from "@hosts/external/ExternalWebviewProvider"
import { ExternalHostBridgeClientManager } from "@hosts/external/host-bridge-client-manager"
import {
	DiffServiceClientInterface,
	EnvServiceClientInterface,
	WindowServiceClientInterface,
	WorkspaceServiceClientInterface,
} from "@generated/hosts/host-bridge-client-types"
import { HostBridgeClientProvider } from "@/hosts/host-provider-types"
import { retryOperation } from "@utils/retry"
import * as path from "path"
import { initialize, tearDown } from "@/common"
import { SqliteLockManager } from "@/core/locks/SqliteLockManager"
import { WebviewProvider } from "@/core/webview"
import { AuthHandler } from "@/hosts/external/AuthHandler"
import { HostProvider } from "@/hosts/host-provider"
import { DiffViewProvider } from "@/integrations/editor/DiffViewProvider"
import { HOSTBRIDGE_PORT, waitForHostBridgeReady } from "./hostbridge-client"
import { setStandaloneInstallDirCwd } from "./install-cwd"
import { setLockManager } from "./lock-manager"
import { PROTOBUS_PORT, startProtobusService } from "./protobus-service"
import { log } from "./utils"
import { initializeContext } from "./vscode-context"
import { startStdioAdapter } from "./stdio-adapter" // CARETI MODIFICATION: Tauri stdio 모드

let globalLockManager: SqliteLockManager | undefined

async function main() {
	log("\n\n\nStarting cline-core service...\n\n\n")
	log(`Environment variables: ${JSON.stringify(process.env)}`)

	// Parse command line arguments
	const args = parseArgs()

	// Show help if requested
	if (args.help) {
		showHelp()
		process.exit(0)
	}

	// CARETI MODIFICATION: Standalone에서 리소스 로딩을 위해 cwd를 설치 디렉토리로 고정 (upstream b1d15d4fe)
	setStandaloneInstallDirCwd(__dirname)

	// Initialize context with optional custom directory from CLI
	const { extensionContext, DATA_DIR, EXTENSION_DIR } = initializeContext(args.config)

	// CARETI MODIFICATION: Tauri stdio 모드 - host-bridge 없이 최소 초기화
	if (args.stdio) {
		await mainStdio(extensionContext, EXTENSION_DIR, DATA_DIR)
		return
	}

	// Configure ports - CLI args override everything
	if (args.port) {
		process.env.PROTOBUS_ADDRESS = `127.0.0.1:${args.port}`
		// Auto-calculate hostbridge port if not specified
		if (!args.hostBridgePort) {
			process.env.HOST_BRIDGE_ADDRESS = `127.0.0.1:${HOSTBRIDGE_PORT}`
		}
	}
	if (args.hostBridgePort) {
		process.env.HOST_BRIDGE_ADDRESS = `127.0.0.1:${args.hostBridgePort}`
	}

	try {
		// Set up error handlers FIRST (before any service starts)
		setupGlobalErrorHandlers()

		const hostAddress = await waitForHostBridgeReady()

		// The host bridge should be available before creating the host provider because it depends on the host bridge.
		setupHostProvider(extensionContext, EXTENSION_DIR, DATA_DIR)

		const webviewProvider = await initialize(extensionContext)

		// Enable the localhost HTTP server that handles auth redirects.
		AuthHandler.getInstance().setEnabled(true)

		// Now this will throw instead of exit if binding fails
		const protobusAddress = await startProtobusService(webviewProvider.controller)

		// Initialize SQLite lock manager for instance registration
		const dbPath = `${DATA_DIR}/locks.db`
		globalLockManager = new SqliteLockManager({
			dbPath,
			instanceAddress: protobusAddress,
		})

		// Make lock manager available to other modules
		setLockManager(globalLockManager)

		await globalLockManager.registerInstance({
			hostAddress,
		})
		log(`Registered instance in SQLite locks: ${protobusAddress}`)

		// Clean up any orphaned folder locks from dead instances
		globalLockManager.cleanupOrphanedFolderLocks()

		// Mark instance healthy after services are up
		globalLockManager.touchInstance()

		log("All services started successfully")
	} catch (err) {
		log(`FATAL ERROR during startup: ${err}`)
		log(`Cleaning up and shutting down...`)
		await shutdownGracefully(globalLockManager)
		process.exit(1)
	}
}

/**
 * CARETI MODIFICATION: Tauri 앱을 위한 stdio 모드 진입점
 * host-bridge 없이 실행되며, Tauri가 호스트 역할을 대체
 */
async function mainStdio(extensionContext: any, extensionDir: string, dataDir: string) {
	log("[stdio] Starting in stdio mode for Tauri...")

	try {
		// Set up error handlers
		setupGlobalErrorHandlers()

		// stdio 모드에서는 HostProvider를 Tauri 브릿지용으로 설정
		// Tauri가 파일시스템/터미널 등 호스트 기능을 제공
		setupHostProviderForStdio(extensionContext, extensionDir, dataDir)

		// Initialize the webview provider and controller
		const webviewProvider = await initialize(extensionContext)

		// Enable auth handler for OAuth redirects
		AuthHandler.getInstance().setEnabled(true)

		// Start stdio adapter instead of gRPC server
		startStdioAdapter(webviewProvider.controller)

		log("[stdio] cline-core running in stdio mode")
	} catch (err) {
		log(`[stdio] FATAL ERROR: ${err}`)
		process.exit(1)
	}
}

/**
 * CARETI MODIFICATION: stdio 모드용 HostProvider 설정
 * Tauri가 호스트 역할을 대신하므로, host-bridge 클라이언트 대신 스텁 사용
 */
function setupHostProviderForStdio(extensionContext: any, extensionDir: string, dataDir: string) {
	const createWebview = (): WebviewProvider => {
		return new ExternalWebviewProvider(extensionContext)
	}
	const createDiffView = (): DiffViewProvider => {
		return new ExternalDiffViewProvider()
	}
	const getCallbackUrl = (): Promise<string> => {
		return AuthHandler.getInstance().getCallbackUrl()
	}
	const getBinaryLocation = async (name: string): Promise<string> => path.join(process.cwd(), name)

	// stdio 모드에서는 host-bridge가 없으므로 스텁 매니저 사용
	// Tauri 측에서 필요한 호스트 기능을 구현해야 함
	HostProvider.initialize(
		createWebview,
		createDiffView,
		new StdioHostBridgeClientManager(),
		log,
		getCallbackUrl,
		getBinaryLocation,
		extensionDir,
		dataDir,
	)
}

/**
 * CARETI MODIFICATION: stdio 모드용 스텁 HostBridgeClientManager
 * 실제 호스트 기능은 Tauri 측에서 처리
 */
class StdioHostBridgeClientManager implements HostBridgeClientProvider {
	workspaceClient: WorkspaceServiceClientInterface
	envClient: EnvServiceClientInterface
	windowClient: WindowServiceClientInterface
	diffClient: DiffServiceClientInterface

	constructor() {
		// 스텁 클라이언트 생성 - host-bridge 없이 로컬에서 처리
		this.workspaceClient = new StdioWorkspaceServiceClient()
		this.envClient = new StdioEnvServiceClient()
		this.windowClient = new StdioWindowServiceClient()
		this.diffClient = new StubiDiffServiceClient()
	}
}

// 스텁 Workspace 클라이언트 - stdio-adapter의 작업 경로 사용
class StdioWorkspaceServiceClient implements WorkspaceServiceClientInterface {
	async getWorkspacePaths(_request: any): Promise<any> {
		// stdio-adapter에서 설정된 작업 경로 사용
		const { getCurrentWorkspacePath } = await import("./stdio-adapter")
		const workspacePath = getCurrentWorkspacePath()
		log(`[stdio] getWorkspacePaths: ${workspacePath}`)
		// proto.host.GetWorkspacePathsResponse 형식에 맞게 반환
		return {
			id: "standalone",
			paths: [workspacePath],
		}
	}
	async saveOpenDocumentIfDirty(_request: any): Promise<any> { return {} }
	async getDiagnostics(_request: any): Promise<any> { return { diagnostics: [] } }
	async openProblemsPanel(_request: any): Promise<any> { return {} }
	async openInFileExplorerPanel(_request: any): Promise<any> { return {} }
	async openClineSidebarPanel(_request: any): Promise<any> { return {} }
	async openTerminalPanel(_request: any): Promise<any> { return {} }
	async executeCommandInTerminal(_request: any): Promise<any> { return { output: "" } }
}

// 스텁 Env 클라이언트
class StdioEnvServiceClient implements EnvServiceClientInterface {
	async clipboardWriteText(_request: any): Promise<any> { return {} }
	async clipboardReadText(_request: any): Promise<any> { return { value: "" } }
	async getHostVersion(_request: any): Promise<any> { return { version: "tauri-standalone" } }
	// CARETI MODIFICATION: Standalone 모드에서는 IDE 리다이렉트 URI가 없음
	// undefined를 반환하면 AuthHandler가 리다이렉트 없이 성공 페이지만 표시
	async getIdeRedirectUri(_request: any): Promise<any> { throw new Error("No IDE redirect URI in standalone mode") }
	async getTelemetrySettings(_request: any): Promise<any> { return { enabled: false } }
	subscribeToTelemetrySettings(_request: any, _callbacks: any): () => void { return () => {} }
	async shutdown(_request: any): Promise<any> { return {} }
}

// 스텁 Window 클라이언트
class StdioWindowServiceClient implements WindowServiceClientInterface {
	async showTextDocument(_request: any): Promise<any> { return {} }
	async showOpenDialogue(_request: any): Promise<any> { return { uris: [] } }
	async showMessage(_request: any): Promise<any> { return {} }
	async showInputBox(_request: any): Promise<any> { return { value: "" } }
	async showSaveDialog(_request: any): Promise<any> { return {} }
	async openFile(_request: any): Promise<any> { return {} }
	async openSettings(_request: any): Promise<any> { return {} }
	async getOpenTabs(_request: any): Promise<any> { return { paths: [] } }
	async getVisibleTabs(_request: any): Promise<any> { return { paths: [] } }
	async getActiveEditor(_request: any): Promise<any> { return {} }
}

// 스텁 Diff 클라이언트
class StubiDiffServiceClient implements DiffServiceClientInterface {
	async openDiff(_request: any): Promise<any> { return {} }
	async getDocumentText(_request: any): Promise<any> { return { text: "" } }
	async replaceText(_request: any): Promise<any> { return {} }
	async scrollDiff(_request: any): Promise<any> { return {} }
	async truncateDocument(_request: any): Promise<any> { return {} }
	async saveDocument(_request: any): Promise<any> { return {} }
	async closeAllDiffs(_request: any): Promise<any> { return {} }
	async openMultiFileDiff(_request: any): Promise<any> { return {} }
}

function setupHostProvider(extensionContext: any, extensionDir: string, dataDir: string) {
	const createWebview = (): WebviewProvider => {
		return new ExternalWebviewProvider(extensionContext)
	}
	const createDiffView = (): DiffViewProvider => {
		return new ExternalDiffViewProvider()
	}
	const getCallbackUrl = (): Promise<string> => {
		return AuthHandler.getInstance().getCallbackUrl()
	}
	// cline-core expects the binaries to be unpacked in the directory where it is running.
	const getBinaryLocation = async (name: string): Promise<string> => path.join(process.cwd(), name)

	HostProvider.initialize(
		createWebview,
		createDiffView,
		new ExternalHostBridgeClientManager(),
		log,
		getCallbackUrl,
		getBinaryLocation,
		extensionDir,
		dataDir,
	)
}

/**
 * Sets up global error handlers to prevent the process from crashing
 * on unhandled exceptions and promise rejections
 */
function setupGlobalErrorHandlers() {
	// Handle unhandled exceptions
	process.on("uncaughtException", (error: Error) => {
		log(`ERROR: Uncaught exception: ${error.message}`)
		log(`Stack trace: ${error.stack}`)
		// Log the error but don't exit the process
	})

	// Handle unhandled promise rejections
	process.on("unhandledRejection", (reason: any, _promise: Promise<any>) => {
		log(`ERROR: Unhandled promise rejection: ${reason}`)
		if (reason instanceof Error) {
			log(`Stack trace: ${reason.stack}`)
		}
		// Log the error but don't exit the process
	})

	// Handle process warnings (optional, for debugging)
	process.on("warning", (warning: Error) => {
		log(`Process Warning: ${warning.name}: ${warning.message}`)
	})

	// Graceful shutdown handlers
	process.on("SIGINT", () => {
		log("Received SIGINT, shutting down gracefully...")
		shutdownGracefully(globalLockManager).catch((err) => {
			log(`Error during SIGINT shutdown: ${err}`)
			process.exit(1)
		})
	})

	process.on("SIGTERM", () => {
		log("Received SIGTERM, shutting down gracefully...")
		shutdownGracefully(globalLockManager).catch((err) => {
			log(`Error during SIGTERM shutdown: ${err}`)
			process.exit(1)
		})
	})
}

/**
 * Request host bridge shutdown with retry logic and timeout handling.
 * Uses best-effort approach - logs failures but doesn't block shutdown.
 */
async function requestHostBridgeShutdown(): Promise<void> {
	try {
		await retryOperation(3, 2000, async () => {
			await HostProvider.env.shutdown({})
		})
		log("Host bridge shutdown requested successfully")
	} catch (error) {
		log(`Warning: Failed to request host bridge shutdown: ${error}`)
		log("Proceeding with cleanup")
	}
}

/**
 * Gracefully shutdown the cline-core process by:
 * 1. Calling shutdown RPC on the paired host bridge
 * 2. Cleaning up the lock manager entry
 * 3. Tearing down services
 * 4. Exiting the process
 */
async function shutdownGracefully(lockManager?: SqliteLockManager) {
	try {
		// Step 1: Tell the paired host bridge to shut down
		log("Requesting host bridge shutdown...")
		if (HostProvider.isInitialized()) {
			await requestHostBridgeShutdown()
		} else {
			log("Warning: HostProvider not initialized, cannot request shutdown")
		}

		// Step 2: Clean up lock manager entry
		log("Cleaning up lock manager entry...")
		try {
			// First unregister the instance
			lockManager?.unregisterInstance()
			// Then clean up any folder locks held by this instance
			lockManager?.cleanupOrphanedFolderLocks()
			lockManager?.close()
			log("Lock manager entry cleaned up successfully")
		} catch (error) {
			log(`Warning: Failed to clean up lock manager: ${error}`)
		}

		// Step 3: Tear down services
		log("Tearing down services...")
		try {
			tearDown()
			log("Services torn down successfully")
		} catch (error) {
			log(`Warning: Failed to tear down services: ${error}`)
		}

		log("Graceful shutdown completed")
	} catch (error) {
		log(`Error during graceful shutdown: ${error}`)
	} finally {
		// Step 4: Exit the process
		process.exit(0)
	}
}

// Parse command line arguments
interface CliArgs {
	port?: number
	hostBridgePort?: number
	config?: string
	help?: boolean
	stdio?: boolean // CARETI MODIFICATION: Tauri stdio 모드 지원
}

function parseArgs(): CliArgs {
	const args: CliArgs = {}
	const argv = process.argv.slice(2)

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]
		switch (arg) {
			case "--port":
			case "-p":
				args.port = parseInt(argv[++i], 10)
				break
			case "--host-bridge-port":
				args.hostBridgePort = parseInt(argv[++i], 10)
				break
			case "--config":
			case "-c":
				args.config = argv[++i]
				break
			case "--help":
			case "-h":
				args.help = true
				break
			// CARETI MODIFICATION: Tauri stdio 모드 지원
			case "--stdio":
				args.stdio = true
				break
		}
	}

	return args
}

function showHelp() {
	console.log(`
Cline Core - Standalone Server

Usage: node cline-core.js [options]

Options:
  -p, --port <port>              Port for the main gRPC service (default: ${PROTOBUS_PORT})
  --host-bridge-port <port>      Port for the host bridge service (default: ${HOSTBRIDGE_PORT})
  -c, --config <path>            Directory for Cline data storage (default: ~/.cline)
  --stdio                        Run in stdio mode for Tauri integration (no gRPC server)
  -h, --help                     Show this help message

Environment Variables:
  PROTOBUS_ADDRESS              Override the main service address (format: host:port)
  HOST_BRIDGE_ADDRESS            Override the host bridge address (format: host:port)
`)
}

main()
