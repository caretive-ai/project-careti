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

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
