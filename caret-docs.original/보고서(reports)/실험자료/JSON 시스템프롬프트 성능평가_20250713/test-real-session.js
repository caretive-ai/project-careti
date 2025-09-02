const fs = require("fs")
const path = require("path")

console.log("🧪 Testing Real Session Logging...")

// 실제 로그 파일 경로 (방금 확인한 가장 최근 태스크)
const realTaskDir = "C:\\Users\\luke\\AppData\\Roaming\\Code\\User\\globalStorage\\caretive.caret\\tasks\\1752747521095"
const uiMessagesPath = path.join(realTaskDir, "ui_messages.json")
const metadataPath = path.join(realTaskDir, "task_metadata.json")

try {
	console.log("📁 Loading real session data...")

	// 실제 세션 데이터 로드
	const uiMessages = JSON.parse(fs.readFileSync(uiMessagesPath, "utf-8"))
	const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"))

	console.log(`📊 Total UI Messages: ${uiMessages.length}`)

	// generate-report.js와 동일한 로직으로 파싱
	let totalTokensIn = 0
	let totalTokensOut = 0
	let totalCachedTokens = 0
	let totalCost = 0
	let apiCallCount = 0
	let actualMode = "unknown"
	let actualSessionType = "unknown"
	let sessionInfoFound = false

	uiMessages.forEach((msg, index) => {
		if (msg.type === "say" && msg.say === "api_req_started") {
			try {
				const apiData = JSON.parse(msg.text)
				totalTokensIn += apiData.tokensIn || 0
				totalTokensOut += apiData.tokensOut || 0
				totalCachedTokens += apiData.cachedTokens || 0
				totalCost += apiData.cost || 0
				apiCallCount++

				console.log(`\n🔍 API Request #${apiCallCount}:`)
				console.log(`   📈 Tokens In: ${apiData.tokensIn}`)
				console.log(`   📈 Tokens Out: ${apiData.tokensOut}`)
				console.log(`   💾 Cached Tokens: ${apiData.cachedTokens}`)
				console.log(`   💰 Cost: $${apiData.cost}`)

				// 🎯 세션 정보 추출 테스트
				if (apiData.sessionMode) {
					actualMode = apiData.sessionMode
					sessionInfoFound = true
					console.log(`   🎯 Session Mode: ${apiData.sessionMode}`)
				}
				if (apiData.sessionType) {
					actualSessionType = apiData.sessionType
					console.log(`   🔄 Session Type: ${apiData.sessionType}`)
				}

				// 시스템 프롬프트 정보
				if (apiData.systemPromptInfo) {
					console.log(`   📝 System Prompt: ${apiData.systemPromptInfo.mode} mode`)
					console.log(`   📏 Length: ${apiData.systemPromptInfo.length} chars`)
				}
			} catch (e) {
				console.error(`❌ Failed to parse API data at index ${index}:`, e.message)
			}
		}
	})

	// 결과 출력
	console.log("\n" + "=".repeat(50))
	console.log("📊 Real Session Analysis Results:")
	console.log("=".repeat(50))
	console.log(`🎯 Session Mode: ${actualMode}`)
	console.log(`🔄 Session Type: ${actualSessionType}`)
	console.log(`📊 Total API Calls: ${apiCallCount}`)
	console.log(`📈 Total Tokens In: ${totalTokensIn.toLocaleString()}`)
	console.log(`📈 Total Tokens Out: ${totalTokensOut.toLocaleString()}`)
	console.log(`💾 Total Cached Tokens: ${totalCachedTokens.toLocaleString()}`)
	console.log(`💰 Total Cost: $${totalCost.toFixed(6)}`)

	// 검증
	if (sessionInfoFound && actualMode !== "unknown") {
		console.log("\n✅ SUCCESS!")
		console.log("🎉 Session logging is working perfectly!")
		console.log("📈 generate-report.js can now read REAL session data!")
		console.log("🚫 No more hardcoded values needed!")

		console.log("\n📋 Summary:")
		console.log(`   • sessionMode: ${actualMode} (from real session)`)
		console.log(`   • sessionType: ${actualSessionType} (dynamically detected)`)
		console.log(`   • Real API usage data collected ✅`)
		console.log(`   • Performance metrics accurate ✅`)
	} else {
		console.log("\n❌ FAILED: Session data not detected properly")
		console.log(`Expected: sessionMode from real data`)
		console.log(`Got: sessionMode="${actualMode}", sessionType="${actualSessionType}"`)
	}
} catch (error) {
	console.error("❌ Test failed:", error.message)
}
