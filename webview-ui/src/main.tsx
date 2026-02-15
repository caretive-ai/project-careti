import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./main.css"
import "./index.css"
// CARETI MODIFICATION: Standalone 빌드에서 다크 테마 스타일 적용
import "./standalone-theme.css"
import App from "./App.tsx"

// CARETI MODIFICATION: Standalone 모드에서 body에 클래스 추가
declare const __PLATFORM__: string
if (__PLATFORM__ === "standalone") {
	document.body.classList.add("platform-standalone")
}

// CARETI MODIFICATION: Tauri 브릿지 초기화
async function setupTauriBridge() {
	try {
		const { listen } = await import("@tauri-apps/api/event")

		// initialization_script에서 이미 설정된 값이 없으면 설정
		if (!window.__is_standalone__) {
			window.__is_standalone__ = true
		}
		if (!window.clineClientId) {
			window.clineClientId = "standalone-" + Date.now()
		}

		// Tauri grpc_response 이벤트 → window.postMessage로 전달
		await listen("grpc_response", (event: any) => {
			window.postMessage(event.payload, "*")
		})

		// initialization_script에서 standalonePostMessage가 설정되지 않은 경우 fallback
		if (!window.standalonePostMessage) {
			const { invoke } = await import("@tauri-apps/api/core")
			window.standalonePostMessage = async (messageJson: string) => {
				try {
					await invoke("proto_bus_message", { message: messageJson })
				} catch (error) {
					console.error("[standalonePostMessage] Error:", error)
				}
			}
		}

		console.log("[Careti] Tauri bridge initialized")
	} catch (error) {
		console.error("[Careti] Bridge setup error:", error)
	}
}

async function initApp() {
	if (__PLATFORM__ === "standalone") {
		await setupTauriBridge()
	}

	createRoot(document.getElementById("root")!).render(
		<StrictMode>
			<App />
		</StrictMode>,
	)
}

initApp()
