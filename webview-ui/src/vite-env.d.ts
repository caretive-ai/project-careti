/// <reference types="vite/client" />

// CARETI MODIFICATION: Window interface extensions
interface Window {
	WEBVIEW_PROVIDER_TYPE?: "sidebar" | "tab"
	__is_standalone__?: boolean
}
