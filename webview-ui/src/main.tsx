import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"

import App from "./App.tsx"

declare const __PLATFORM__: string

// Tag body with the current build platform to scope platform-specific styles
if (typeof document !== "undefined" && document.body) {
	document.body.dataset.platform = __PLATFORM__

	// For standalone (IntelliJ) ensure http(s) links open externally instead of navigating the webview
	if (__PLATFORM__ === "standalone") {
		document.addEventListener("click", (event) => {
			const target = event.target as HTMLElement | null
			if (!target) return
			const anchor = target.closest("a") as HTMLAnchorElement | null
			if (!anchor || !anchor.href) return
			const href = anchor.href
			if (href.startsWith("http://") || href.startsWith("https://")) {
				event.preventDefault()
				window.open(href, "_blank", "noopener")
			}
		})
	}
}

try {
	const rootElement = document.getElementById("root")
	if (!rootElement) {
		throw new Error("Root element not found!")
	}

	const root = createRoot(rootElement)

	root.render(
		<StrictMode>
			<App />
		</StrictMode>
	)
} catch (error) {
	document.body.innerHTML = `<div style="padding: 2rem; color: white; background: #f44336;">
		<h1>❌ React Failed</h1>
		<pre>${error instanceof Error ? error.message : String(error)}</pre>
	</div>`
}
