// CARETI MODIFICATION: Tauri 앱을 위한 stdio 기반 JSON 브릿지 어댑터
import * as readline from "readline"
import { Controller } from "@core/controller"
import { StreamingResponseHandler } from "@core/controller/grpc-handler"
import { log } from "./utils"

// gRPC 핸들러 임포트 - protobus-server-setup.ts의 핸들러들을 재사용
import { initializeWebview } from "@core/controller/ui/initializeWebview"
import { getLatestState } from "@core/controller/state/getLatestState"
import { subscribeToState } from "@core/controller/state/subscribeToState"
import { newTask } from "@core/controller/task/newTask"
import { askResponse } from "@core/controller/task/askResponse"
import { cancelTask } from "@core/controller/task/cancelTask"
import { clearTask } from "@core/controller/task/clearTask"
import { getTaskHistory } from "@core/controller/task/getTaskHistory"
import { showTaskWithId } from "@core/controller/task/showTaskWithId"
import { taskCompletionViewChanges } from "@core/controller/task/taskCompletionViewChanges"
import { subscribeToPartialMessage } from "@core/controller/ui/subscribeToPartialMessage"
import { subscribeToAuthStatusUpdate } from "@core/controller/account/subscribeToAuthStatusUpdate"
import { subscribeToCheckpoints } from "@core/controller/checkpoints/subscribeToCheckpoints"
import { subscribeToMcpServers } from "@core/controller/mcp/subscribeToMcpServers"
import { updateSettings } from "@core/controller/state/updateSettings"
import { updateApiConfiguration } from "@core/controller/models/updateApiConfiguration"
import { copyToClipboard } from "@core/controller/file/copyToClipboard"
import { openFile } from "@core/controller/file/openFile"
import { ifFileExistsRelativePath } from "@core/controller/file/ifFileExistsRelativePath"
import { openUrl } from "@core/controller/ui/openUrl"
import { subscribeToDidBecomeVisible } from "@core/controller/ui/subscribeToDidBecomeVisible"
import { subscribeToToolImageEvents } from "@core/controller/ui/subscribeToToolImageEvents"
import { subscribeToRelinquishControl } from "@core/controller/ui/subscribeToRelinquishControl"

// CARETI: Persona Service
import { GetPersonaProfile } from "@core/controller/persona/GetPersonaProfile"
import { UpdatePersona } from "@core/controller/persona/UpdatePersona"
import { SubscribeToPersonaChanges } from "@core/controller/persona/SubscribeToPersonaChanges"

// CARETI: CaretAccount Service
import { caretAccountLoginClicked } from "@core/controller/caretAccount/caretAccountLoginClicked"
import { caretAccountLogoutClicked } from "@core/controller/caretAccount/caretAccountLogoutClicked"
import { subscribeToCaretAuthStatusUpdate } from "@core/controller/caretAccount/subscribeToCaretAuthStatusUpdate"
import { getCaretUserCredits } from "@core/controller/caretAccount/getCaretUserCredits"

// CARETI: CaretSystem Service
import { SetPromptSystemMode } from "@core/controller/persona/SetPromptSystemMode"
import { GetPromptSystemMode } from "@core/controller/persona/GetPromptSystemMode"
import { SetCaretMode } from "@core/controller/persona/SetCaretMode"
import { GetCaretMode } from "@core/controller/persona/GetCaretMode"
import { GetMentionImageSendSetting } from "@core/controller/persona/GetMentionImageSendSetting"
import { SetMentionImageSendSetting } from "@core/controller/persona/SetMentionImageSendSetting"

// Additional Account handlers
import { accountLoginClicked } from "@core/controller/account/accountLoginClicked"
import { accountLogoutClicked } from "@core/controller/account/accountLogoutClicked"
import { getUserCredits } from "@core/controller/account/getUserCredits"

// MCP handlers
import { subscribeToMcpMarketplaceCatalog } from "@core/controller/mcp/subscribeToMcpMarketplaceCatalog"

// Models handlers
import { subscribeToOpenRouterModels } from "@core/controller/models/subscribeToOpenRouterModels"
import { updateApiConfigurationProto } from "@core/controller/models/updateApiConfigurationProto"

// State handlers
import { getAvailableTerminalProfiles } from "@core/controller/state/getAvailableTerminalProfiles"
import { updateAutoApprovalSettings } from "@core/controller/state/updateAutoApprovalSettings"
import { updateTelemetrySetting } from "@core/controller/state/updateTelemetrySetting"
import { resetState } from "@core/controller/state/resetState"
import { flushPendingState } from "@core/controller/state/flushPendingState"

// Task handlers - additional
import { getTotalTasksSize } from "@core/controller/task/getTotalTasksSize"
import { deleteTasksWithIds } from "@core/controller/task/deleteTasksWithIds"
import { deleteAllTaskHistory } from "@core/controller/task/deleteAllTaskHistory"

// MCP handlers - additional
import { refreshMcpMarketplace } from "@core/controller/mcp/refreshMcpMarketplace"
import { getLatestMcpServers } from "@core/controller/mcp/getLatestMcpServers"
import { toggleMcpServer } from "@core/controller/mcp/toggleMcpServer"
import { deleteMcpServer } from "@core/controller/mcp/deleteMcpServer"
import { restartMcpServer } from "@core/controller/mcp/restartMcpServer"

// UI handlers
import { onDidShowAnnouncement } from "@core/controller/ui/onDidShowAnnouncement"
import { subscribeToAddToInput } from "@core/controller/ui/subscribeToAddToInput"
import { subscribeToMcpButtonClicked } from "@core/controller/ui/subscribeToMcpButtonClicked"
import { subscribeToHistoryButtonClicked } from "@core/controller/ui/subscribeToHistoryButtonClicked"
import { subscribeToChatButtonClicked } from "@core/controller/ui/subscribeToChatButtonClicked"
import { subscribeToSettingsButtonClicked } from "@core/controller/ui/subscribeToSettingsButtonClicked"
import { subscribeToAccountButtonClicked } from "@core/controller/ui/subscribeToAccountButtonClicked"

/**
 * stdio 요청 메시지 형식
 */
interface StdioRequest {
	type: "grpc_request"
	grpc_request: {
		service: string
		method: string
		message: any
		request_id: string
		is_streaming: boolean
	}
}

/**
 * stdio 응답 메시지 형식
 * webview는 is_streaming: false 로 스트림 종료를 판단
 */
interface StdioResponse {
	type: "grpc_response"
	grpc_response: {
		message: any
		request_id: string
		is_streaming: boolean
		error?: string
	}
}

// 서비스/메서드 → 핸들러 매핑
type UnaryHandler = (controller: Controller, request: any) => Promise<any>
type StreamingHandler = (
	controller: Controller,
	request: any,
	responseHandler: StreamingResponseHandler<any>,
	requestId?: string,
) => Promise<void>

interface HandlerEntry {
	handler: UnaryHandler | StreamingHandler
	isStreaming: boolean
}

const handlers: Record<string, Record<string, HandlerEntry>> = {
	UiService: {
		initializeWebview: { handler: initializeWebview, isStreaming: false },
		subscribeToPartialMessage: { handler: subscribeToPartialMessage, isStreaming: true },
		openUrl: { handler: openUrl, isStreaming: false },
		subscribeToDidBecomeVisible: { handler: subscribeToDidBecomeVisible, isStreaming: true },
		subscribeToToolImageEvents: { handler: subscribeToToolImageEvents, isStreaming: true },
		subscribeToRelinquishControl: { handler: subscribeToRelinquishControl, isStreaming: true },
		subscribeToAddToInput: { handler: subscribeToAddToInput, isStreaming: true },
		// Button click subscriptions - 실제 핸들러 사용
		subscribeToMcpButtonClicked: { handler: subscribeToMcpButtonClicked, isStreaming: true },
		subscribeToHistoryButtonClicked: { handler: subscribeToHistoryButtonClicked, isStreaming: true },
		subscribeToChatButtonClicked: { handler: subscribeToChatButtonClicked, isStreaming: true },
		subscribeToSettingsButtonClicked: { handler: subscribeToSettingsButtonClicked, isStreaming: true },
		subscribeToAccountButtonClicked: { handler: subscribeToAccountButtonClicked, isStreaming: true },
		onDidShowAnnouncement: { handler: onDidShowAnnouncement, isStreaming: false },
	},
	StateService: {
		getLatestState: { handler: getLatestState, isStreaming: false },
		subscribeToState: { handler: subscribeToState, isStreaming: true },
		updateSettings: { handler: updateSettings, isStreaming: false },
		getAvailableTerminalProfiles: { handler: getAvailableTerminalProfiles, isStreaming: false },
		updateAutoApprovalSettings: { handler: updateAutoApprovalSettings, isStreaming: false },
		updateTelemetrySetting: { handler: updateTelemetrySetting, isStreaming: false },
		resetState: { handler: resetState, isStreaming: false },
		flushPendingState: { handler: flushPendingState, isStreaming: false },
	},
	TaskService: {
		newTask: { handler: newTask, isStreaming: false },
		askResponse: { handler: askResponse, isStreaming: false },
		cancelTask: { handler: cancelTask, isStreaming: false },
		clearTask: { handler: clearTask, isStreaming: false },
		getTaskHistory: { handler: getTaskHistory, isStreaming: false },
		showTaskWithId: { handler: showTaskWithId, isStreaming: false },
		taskCompletionViewChanges: { handler: taskCompletionViewChanges, isStreaming: false },
		getTotalTasksSize: { handler: getTotalTasksSize, isStreaming: false },
		deleteTasksWithIds: { handler: deleteTasksWithIds, isStreaming: false },
		deleteAllTaskHistory: { handler: deleteAllTaskHistory, isStreaming: false },
	},
	AccountService: {
		subscribeToAuthStatusUpdate: { handler: subscribeToAuthStatusUpdate, isStreaming: true },
		accountLoginClicked: { handler: accountLoginClicked, isStreaming: false },
		accountLogoutClicked: { handler: accountLogoutClicked, isStreaming: false },
		getUserCredits: { handler: getUserCredits, isStreaming: false },
	},
	CheckpointsService: {
		subscribeToCheckpoints: { handler: subscribeToCheckpoints, isStreaming: true },
	},
	McpService: {
		subscribeToMcpServers: { handler: subscribeToMcpServers, isStreaming: true },
		subscribeToMcpMarketplaceCatalog: { handler: subscribeToMcpMarketplaceCatalog, isStreaming: true },
		refreshMcpMarketplace: { handler: refreshMcpMarketplace, isStreaming: false },
		getLatestMcpServers: { handler: getLatestMcpServers, isStreaming: false },
		toggleMcpServer: { handler: toggleMcpServer, isStreaming: false },
		deleteMcpServer: { handler: deleteMcpServer, isStreaming: false },
		restartMcpServer: { handler: restartMcpServer, isStreaming: false },
	},
	ModelsService: {
		updateApiConfiguration: { handler: updateApiConfiguration, isStreaming: false },
		updateApiConfigurationProto: { handler: updateApiConfigurationProto, isStreaming: false },
		subscribeToOpenRouterModels: { handler: subscribeToOpenRouterModels, isStreaming: true },
	},
	FileService: {
		copyToClipboard: { handler: copyToClipboard, isStreaming: false },
		openFile: { handler: openFile, isStreaming: false },
		ifFileExistsRelativePath: { handler: ifFileExistsRelativePath, isStreaming: false },
	},
	// CARETI: Persona Service
	PersonaService: {
		GetPersonaProfile: { handler: GetPersonaProfile, isStreaming: false },
		UpdatePersona: { handler: UpdatePersona, isStreaming: false },
		SubscribeToPersonaChanges: { handler: SubscribeToPersonaChanges, isStreaming: true },
	},
	// CARETI: CaretAccount Service
	CaretAccountService: {
		caretAccountLoginClicked: { handler: caretAccountLoginClicked, isStreaming: false },
		caretAccountLogoutClicked: { handler: caretAccountLogoutClicked, isStreaming: false },
		subscribeToCaretAuthStatusUpdate: { handler: subscribeToCaretAuthStatusUpdate, isStreaming: true },
		getCaretUserCredits: { handler: getCaretUserCredits, isStreaming: false },
	},
	// CARETI: CaretSystem Service
	CaretSystemService: {
		SetPromptSystemMode: { handler: SetPromptSystemMode, isStreaming: false },
		GetPromptSystemMode: { handler: GetPromptSystemMode, isStreaming: false },
		SetCaretMode: { handler: SetCaretMode, isStreaming: false },
		GetCaretMode: { handler: GetCaretMode, isStreaming: false },
		GetMentionImageSendSetting: { handler: GetMentionImageSendSetting, isStreaming: false },
		SetMentionImageSendSetting: { handler: SetMentionImageSendSetting, isStreaming: false },
	},
	// CARETI: Workspace Service for Tauri standalone
	WorkspaceService: {
		setWorkspacePath: { handler: setWorkspacePath, isStreaming: false },
		getWorkspacePath: { handler: getWorkspacePath, isStreaming: false },
	},
}

// CARETI: 작업 폴더 경로 관리
import * as fs from "fs"
import * as path from "path"
import * as os from "os"

// 기본 작업 폴더: ~/Documents 또는 홈 디렉토리
function getDefaultWorkspacePath(): string {
	const homeDir = os.homedir()
	const documentsDir = path.join(homeDir, "Documents")
	// Documents 폴더가 있으면 사용, 없으면 홈 디렉토리
	if (fs.existsSync(documentsDir)) {
		return documentsDir
	}
	return homeDir
}

// 설정 파일 경로
function getWorkspaceConfigPath(): string {
	const configDir = path.join(os.homedir(), ".careti")
	if (!fs.existsSync(configDir)) {
		fs.mkdirSync(configDir, { recursive: true })
	}
	return path.join(configDir, "workspace.json")
}

// 저장된 작업 폴더 로드
function loadSavedWorkspacePath(): string {
	try {
		const configPath = getWorkspaceConfigPath()
		if (fs.existsSync(configPath)) {
			const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
			if (config.workspacePath && fs.existsSync(config.workspacePath)) {
				log(`[stdio] Loaded saved workspace path: ${config.workspacePath}`)
				return config.workspacePath
			}
		}
	} catch (err) {
		log(`[stdio] Failed to load workspace config: ${err}`)
	}
	return getDefaultWorkspacePath()
}

// 작업 폴더 저장
function saveWorkspacePath(workspacePath: string): void {
	try {
		const configPath = getWorkspaceConfigPath()
		fs.writeFileSync(configPath, JSON.stringify({ workspacePath }, null, 2))
		log(`[stdio] Saved workspace path: ${workspacePath}`)
	} catch (err) {
		log(`[stdio] Failed to save workspace config: ${err}`)
	}
}

// 전역 작업 폴더 경로 (시작 시 저장된 값 또는 기본값 로드)
let currentWorkspacePath: string = loadSavedWorkspacePath()

/**
 * 작업 폴더 경로 설정 (Tauri에서 호출)
 */
async function setWorkspacePath(_controller: Controller, request: { path: string }): Promise<{ success: boolean }> {
	const newPath = request.path
	if (newPath && typeof newPath === "string") {
		currentWorkspacePath = newPath
		process.env.CARETI_WORKSPACE_PATH = newPath
		saveWorkspacePath(newPath) // 저장
		log(`[stdio] Workspace path set to: ${newPath}`)
		return { success: true }
	}
	return { success: false }
}

/**
 * 현재 작업 폴더 경로 반환
 */
async function getWorkspacePath(_controller: Controller, _request: any): Promise<{ path: string }> {
	return { path: currentWorkspacePath }
}

/**
 * 현재 작업 폴더 경로 가져오기 (다른 모듈에서 사용)
 */
export function getCurrentWorkspacePath(): string {
	return currentWorkspacePath
}

/**
 * 간단한 스트리밍 핸들러 생성 (버튼 클릭 등 이벤트 구독용)
 * 실제 이벤트는 webview에서 직접 처리하므로 빈 핸들러 제공
 */
function createSimpleStreamHandler(): StreamingHandler {
	return async (_controller, _request, _responseHandler, _requestId) => {
		// 버튼 클릭 이벤트는 webview에서 직접 발생하므로
		// 여기서는 스트림을 열어두기만 함
		// 실제 이벤트가 발생하면 별도 메커니즘으로 전달
	}
}

// 활성 스트리밍 구독 추적
const activeStreams = new Map<string, boolean>()

/**
 * stdout으로 JSON 응답 전송
 */
function sendResponse(response: StdioResponse): void {
	const json = JSON.stringify(response)
	process.stdout.write(json + "\n")
}

/**
 * 에러 응답 전송
 */
function sendError(requestId: string, error: string, _isStreaming: boolean = false): void {
	sendResponse({
		type: "grpc_response",
		grpc_response: {
			message: null,
			request_id: requestId,
			is_streaming: false, // 에러 발생 시 스트림 종료
			error,
		},
	})
}

/**
 * 서비스 이름을 정규화 (cline.AccountService → AccountService)
 */
function normalizeServiceName(fullServiceName: string): string {
	// "cline.AccountService" → "AccountService"
	// "careti.PersonaService" → "PersonaService"
	const parts = fullServiceName.split(".")
	return parts.length > 1 ? parts[parts.length - 1] : fullServiceName
}

/**
 * 단일 요청 처리
 */
async function handleRequest(controller: Controller, request: StdioRequest): Promise<void> {
	const { service, method, message, request_id, is_streaming } = request.grpc_request
	const normalizedService = normalizeServiceName(service)

	log(`[stdio] Request: ${service}.${method} → ${normalizedService}.${method} (${request_id})`)

	const serviceHandlers = handlers[normalizedService]
	if (!serviceHandlers) {
		sendError(request_id, `Unknown service: ${service} (normalized: ${normalizedService})`)
		return
	}

	const entry = serviceHandlers[method]
	if (!entry) {
		sendError(request_id, `Unknown method: ${service}.${method}`)
		return
	}

	try {
		if (entry.isStreaming) {
			// 스트리밍 핸들러
			activeStreams.set(request_id, true)

			const responseHandler: StreamingResponseHandler<any> = (response, isLast) => {
				// 스트림이 취소되었는지 확인
				if (!activeStreams.has(request_id)) {
					return Promise.resolve()
				}

				// webview는 is_streaming: false 로 스트림 종료를 판단
				// 스트리밍 중: is_streaming: true
				// 스트림 종료: is_streaming: false
				sendResponse({
					type: "grpc_response",
					grpc_response: {
						message: response,
						request_id,
						is_streaming: isLast !== true, // 마지막이면 false
					},
				})

				if (isLast) {
					activeStreams.delete(request_id)
				}

				return Promise.resolve()
			}

			await (entry.handler as StreamingHandler)(controller, message, responseHandler, request_id)
		} else {
			// 단일 요청 핸들러
			const result = await (entry.handler as UnaryHandler)(controller, message)
			sendResponse({
				type: "grpc_response",
				grpc_response: {
					message: result,
					request_id,
					is_streaming: false,
				},
			})
		}
	} catch (err: any) {
		log(`[stdio] Error handling ${service}.${method}: ${err.message}`)
		sendError(request_id, err.message || "Internal error", is_streaming)
	}
}

/**
 * 스트림 취소 처리
 */
function handleCancelStream(requestId: string): void {
	if (activeStreams.has(requestId)) {
		activeStreams.delete(requestId)
		log(`[stdio] Stream cancelled: ${requestId}`)
	}
}

/**
 * stdio 어댑터 시작
 */
export function startStdioAdapter(controller: Controller): void {
	log("[stdio] Starting stdio adapter...")

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false,
	})

	rl.on("line", async (line) => {
		if (!line.trim()) return

		try {
			const parsed = JSON.parse(line)

			if (parsed.type === "grpc_request") {
				await handleRequest(controller, parsed as StdioRequest)
			} else if (parsed.type === "cancel_stream") {
				handleCancelStream(parsed.request_id)
			} else {
				log(`[stdio] Unknown message type: ${parsed.type}`)
			}
		} catch (err: any) {
			log(`[stdio] Failed to parse input: ${err.message}`)
		}
	})

	rl.on("close", () => {
		log("[stdio] stdin closed, shutting down...")
		process.exit(0)
	})

	// 준비 완료 신호 전송
	sendResponse({
		type: "grpc_response",
		grpc_response: {
			message: { ready: true },
			request_id: "init",
			is_streaming: false,
		},
	})

	log("[stdio] Adapter ready")
}
