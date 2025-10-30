// TEST 8: Import full App.tsx and render it
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"

console.log("[TEST] 1. main.tsx executing...")

// Import full App.tsx
import App from "./App.tsx"
console.log("[TEST] 2. App.tsx imported successfully")

try {
	const rootElement = document.getElementById("root")
	if (!rootElement) {
		throw new Error("Root element not found!")
	}
	console.log("[TEST] 3. Root element found")

	const root = createRoot(rootElement)
	console.log("[TEST] 4. React root created")

	// Render full App
	console.log("[TEST] 5. Rendering full App...")
	root.render(
		<StrictMode>
			<App />
		</StrictMode>
	)
	console.log("[TEST] 6. ✅ Full App rendered successfully!")
} catch (error) {
	console.error("[TEST] ❌ Failed:", error)
	document.body.innerHTML = `<div style="padding: 2rem; color: white; background: #f44336;">
		<h1>❌ React Failed</h1>
		<pre>${error instanceof Error ? error.message : String(error)}</pre>
	</div>`
}
