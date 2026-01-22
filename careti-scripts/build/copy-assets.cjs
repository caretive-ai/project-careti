const fs = require("fs")
const path = require("path")

// 프로젝트 루트 경로
const projectRoot = path.resolve(__dirname, "../..")

// 소스 디렉토리: assets (전체)
const srcDir = path.join(projectRoot, "assets")

// 타겟 디렉토리: webview-ui/src/(careti|caret)/assets (전체)
// CARETI MODIFICATION: support Caret → Careti rebrand while keeping legacy path.
const destDirs = [
	path.join(projectRoot, "webview-ui", "src", "careti", "assets"),
	path.join(projectRoot, "webview-ui", "src", "careti", "assets"),
]

console.log("Syncing assets to webview-ui...")
console.log(`From: ${srcDir}`)
for (const destDir of destDirs) {
	console.log(`To:   ${destDir}`)
}

if (!fs.existsSync(srcDir)) {
	console.error(`❌ Source directory not found: ${srcDir}`)
	process.exit(1)
}

try {
	for (const destDir of destDirs) {
		// 타겟 디렉토리 삭제 (Clean copy)
		if (fs.existsSync(destDir)) {
			fs.rmSync(destDir, { recursive: true, force: true })
		}

		// 타겟 디렉토리 생성
		fs.mkdirSync(destDir, { recursive: true })

		// 폴더 전체 복사 (재귀적으로)
		fs.cpSync(srcDir, destDir, { recursive: true, force: true })
	}
	console.log("✅ Assets synced successfully!")
} catch (err) {
	console.error("❌ Failed to sync assets:", err)
	process.exit(1)
}
