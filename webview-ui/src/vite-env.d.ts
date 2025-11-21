/// <reference types="vite/client" />

// CARET MODIFICATION: Window interface extensions
interface Window {
	WEBVIEW_PROVIDER_TYPE?: "sidebar" | "tab"
	__is_standalone__?: boolean
}
