import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"

import App from "./App.tsx"

declare const __PLATFORM__: string

// Tag body with the current build platform to scope platform-specific styles
if (typeof document !== "undefined" && document.body) {
	document.body.dataset.platform = __PLATFORM__
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
