// CARETI MODIFICATION: Handle Careti auth token bootstrap
import { WebviewProvider } from "@/core/webview"
import { focusChatInput } from "@/hosts/vscode/commandUtils"
import { Logger } from "../logging/Logger"

/**
 * Shared URI handler that processes both VSCode URI events and HTTP server callbacks
 */
export class SharedUriHandler {
	/**
	 * Processes a URI and routes it to the appropriate handler
	 * @param url The URI to process (can be from VSCode or converted from HTTP)
	 * @returns Promise<boolean> indicating success (true) or failure (false)
	 */
	public static async handleUri(url: string): Promise<boolean> {
		const parsedUrl = new URL(url)
		const path = parsedUrl.pathname

		// Create URLSearchParams from the query string, but preserve plus signs
		// by replacing them with a placeholder before parsing
		const queryString = parsedUrl.search.slice(1) // Remove leading '?'
		const query = new URLSearchParams(queryString.replace(/\+/g, "%2B"))
		// Some auth providers (Cline, Careti) return tokens in the hash fragment.
		const hashString = parsedUrl.hash.startsWith("#") ? parsedUrl.hash.slice(1) : parsedUrl.hash
		const hashQuery = hashString ? new URLSearchParams(hashString.replace(/\+/g, "%2B")) : undefined

		// Unified getter that checks query first, then fragment
		const getParam = (key: string) => query.get(key) || hashQuery?.get(key)

		Logger.info(
			"SharedUriHandler: Processing URI:" +
				JSON.stringify({
					path: path,
					query: query,
					hashQuery: hashQuery,
					scheme: parsedUrl.protocol,
				}),
		)

		let visibleWebview = WebviewProvider.getVisibleInstance()

		if (!visibleWebview) {
			// CARETI MODIFICATION: 로그인 콜백 도착 시 Careti 사이드바가 보이지 않으면
			// (다른 사이드바 탭/접힘 상태) 인증 정보가 조용히 드랍되던 문제 —
			// 사이드바를 포커스해 인스턴스를 확보한 뒤 계속 처리한다
			try {
				visibleWebview = await focusChatInput()
				Logger.info("SharedUriHandler: Webview was not visible; focused sidebar to handle callback")
			} catch {
				Logger.warn("SharedUriHandler: No webview instance available")
				return false
			}
		}

		try {
			switch (path) {
				case "/openrouter": {
					const code = query.get("code")
					if (code) {
						await visibleWebview.controller.handleOpenRouterCallback(code)
						return true
					}
					console.warn("SharedUriHandler: Missing code parameter for OpenRouter callback")
					return false
				}
				case "/requesty": {
					const code = query.get("code")
					if (code) {
						await visibleWebview.controller.handleRequestyCallback(code)
						return true
					}
					console.warn("SharedUriHandler: Missing code parameter for Requesty callback")
					return false
				}
				case "/auth":
				case "/auth/callback": {
					// CARETI MODIFICATION: Support both /auth and /auth/callback paths
					// Caret API uses /auth/callback for standalone mode
					const providerParam = getParam("provider")

					Logger.info(`SharedUriHandler - Auth callback received for ${providerParam} - ${path}`)

					const tokenParam = getParam("token") || getParam("refreshToken") || getParam("idToken") || undefined
					const codeParam = getParam("code") || undefined

					// CARETI MODIFICATION: /auth/callback path는 standalone 모드에서 Careti 인증용이므로
				// provider 파라미터가 없으면 "careti"로 기본 설정
				const provider = providerParam ?? (path === "/auth/callback" ? "careti" : "cline")
					const token = tokenParam || codeParam

					if (token) {
						await visibleWebview.controller.handleAuthCallback(token, provider)
						return true
					}
					Logger.warn("SharedUriHandler: Missing idToken parameter for auth callback")
					return false
				}
				case "/auth/oca": {
					console.log("SharedUriHandler: Oca Auth callback received:", { path: path })

					const code = query.get("code")
					const state = query.get("state")

					if (code && state) {
						await visibleWebview.controller.handleOcaAuthCallback(code, state)
						return true
					}
					console.warn("SharedUriHandler: Missing code parameter for auth callback")
					return false
				}
				case "/task": {
					const prompt = query.get("prompt")
					if (prompt) {
						await visibleWebview.controller.handleTaskCreation(prompt)
						return true
					}
					Logger.warn("SharedUriHandler: Missing prompt parameter for task creation")
					return false
				}
				// Match /mcp-auth/callback/{hash}
				case path.match(/^\/mcp-auth\/callback\/[^/]+$/)?.input: {
					const serverHash = path.split("/").pop()
					const code = query.get("code")
					const state = query.get("state")

					if (!code || !serverHash) {
						Logger.warn("SharedUriHandler: Missing code or hash in MCP OAuth callback")
						return false
					}

					await visibleWebview.controller.handleMcpOAuthCallback(serverHash, code, state)
					return true
				}
				default:
					Logger.warn(`SharedUriHandler: Unknown path: ${path}`)
					return false
			}
		} catch (error) {
			Logger.error("SharedUriHandler: Error processing URI:", error)
			return false
		}
	}
}
