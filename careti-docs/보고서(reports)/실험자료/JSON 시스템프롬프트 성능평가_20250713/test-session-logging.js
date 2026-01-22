const fs = require("fs")
const path = require("path")

console.log("🧪 Testing Session Logging...")

// 테스트 데이터 파일 경로
const testUiMessagesPath = path.join(__dirname, "test-session-data.json")
const testMetadataPath = path.join(__dirname, "test-task_metadata.json")

try {
	// 테스트 데이터 로드
	const uiMessages = JSON.parse(fs.readFileSync(testUiMessagesPath, "utf-8"))
	const metadata = JSON.parse(fs.readFileSync(testMetadataPath, "utf-8"))

	console.log("📁 Test data loaded successfully")
	console.log(`📊 UI Messages: ${uiMessages.length}`)

	// generate-report.js와 동일한 로직으로 파싱
	let totalTokensIn = 0
	let totalTokensOut = 0
	let totalCachedTokens = 0
	let totalCost = 0
	let apiCallCount = 0
	let actualMode = "unknown"
	let sessionType = "unknown"

	uiMessages.forEach((msg) => {
		if (msg.type === "say" && msg.say === "api_req_started") {
			try {
				const apiData = JSON.parse(msg.text)
				totalTokensIn += apiData.tokensIn || 0
				totalTokensOut += apiData.tokensOut || 0
				totalCachedTokens += apiData.cachedTokens || 0
				totalCost += apiData.cost || 0
				apiCallCount++

				// 🎯 새로운 세션 정보 추출 테스트
				if (actualMode === "unknown" && apiData.sessionMode) {
					actualMode = apiData.sessionMode
				}
				if (sessionType === "unknown" && apiData.sessionType) {
					sessionType = apiData.sessionType
				}

				console.log("✅ API Request Data:")
				console.log(`   📈 Tokens In: ${apiData.tokensIn}`)
				console.log(`   📈 Tokens Out: ${apiData.tokensOut}`)
				console.log(`   💾 Cached Tokens: ${apiData.cachedTokens}`)
				console.log(`   💰 Cost: $${apiData.cost}`)
				console.log(`   🎯 Session Mode: ${apiData.sessionMode}`)
				console.log(`   🔄 Session Type: ${apiData.sessionType}`)
			} catch (e) {
				console.error("❌ Failed to parse API data:", e.message)
			}
		}
	})

	// 결과 출력
	console.log("\n📊 Session Logging Test Results:")
	console.log("=====================================")
	console.log(`🎯 Session Mode: ${actualMode}`)
	console.log(`🔄 Session Type: ${sessionType}`)
	console.log(`📊 Total API Calls: ${apiCallCount}`)
	console.log(`📈 Total Tokens In: ${totalTokensIn}`)
	console.log(`📈 Total Tokens Out: ${totalTokensOut}`)
	console.log(`💾 Total Cached Tokens: ${totalCachedTokens}`)
	console.log(`💰 Total Cost: $${totalCost}`)

	// 검증
	if (actualMode === "careti" && sessionType === "new") {
		console.log("\n✅ SUCCESS: Session logging is working correctly!")
		console.log("🎉 generate-report.js can now read real session data instead of hardcoded values!")
	} else {
		console.log("\n❌ FAILED: Session data not detected properly")
		console.log(`Expected: sessionMode="careti", sessionType="new"`)
		console.log(`Got: sessionMode="${actualMode}", sessionType="${sessionType}"`)
	}
} catch (error) {
	console.error("❌ Test failed:", error.message)
}
