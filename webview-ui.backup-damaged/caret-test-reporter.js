/**
 * Caret vs Cline 테스트 결과 분리 리포터
 * 테스트를 Caret 전용과 Cline 원본으로 분류하여 깔끔하게 표시
 */

class CaretTestReporter {
	constructor() {
		this.caretTests = []
		this.clineTests = []
		this.startTime = 0
	}

	onInit() {
		this.startTime = Date.now()
	}

	onFinished(files = [], errors = []) {
		// 테스트 결과 분류
		files.forEach((file) => {
			// 정확한 Caret 테스트 판별: /src/caret/ 폴더에 있는 것만
			const isCaretTest = file.filepath.includes("/src/caret/") || file.filepath.includes("\\src\\caret\\")

			file.tasks?.forEach((task) => {
				const testInfo = {
					name: task.name,
					file: file.name,
					filepath: file.filepath,
					state: task.result?.state || "unknown",
					duration: task.result?.duration || 0,
					error: task.result?.errors?.[0]?.message,
					stack: task.result?.errors?.[0]?.stack,
					location: this.extractLocation(task.result?.errors?.[0]),
				}

				if (isCaretTest) {
					this.caretTests.push(testInfo)
				} else {
					this.clineTests.push(testInfo)
				}
			})
		})

		this.printResults()
	}

	extractLocation(error) {
		if (!error?.stack) return null

		// 스택에서 파일 경로와 라인 번호 추출
		const stackLines = error.stack.split("\n")
		for (const line of stackLines) {
			const match = line.match(/at .* \((.+):(\d+):(\d+)\)/) || line.match(/at (.+):(\d+):(\d+)/)
			if (match && match[1] && !match[1].includes("node_modules")) {
				return {
					file: match[1],
					line: match[2],
					column: match[3],
				}
			}
		}
		return null
	}

	printResults() {
		const totalDuration = Date.now() - this.startTime

		console.log("\n" + "=".repeat(80))
		console.log("                         📊 테스트 결과")
		console.log("=".repeat(80))

		// Caret 테스트 결과
		this.printSection("🔷 Caret 전용 테스트", this.caretTests, "\x1b[35m") // 마젠타

		// Cline 테스트 결과
		this.printSection("🤖 Cline 원본 테스트", this.clineTests, "\x1b[34m") // 블루

		// 전체 요약
		const totalCaret = this.caretTests.length
		const totalCline = this.clineTests.length
		const passedCaret = this.caretTests.filter((t) => t.state === "pass").length
		const passedCline = this.clineTests.filter((t) => t.state === "pass").length

		console.log("\n📈 전체 요약")
		console.log("-".repeat(50))
		console.log(`🔷 Caret: ${passedCaret}/${totalCaret} 통과`)
		console.log(`🤖 Cline: ${passedCline}/${totalCline} 통과`)
		console.log(`⏱️  총 시간: ${totalDuration}ms`)
		console.log("=".repeat(80) + "\n")
	}

	printSection(title, tests, color) {
		const passed = tests.filter((t) => t.state === "pass").length
		const failed = tests.filter((t) => t.state === "fail").length

		console.log(`\n${color}${title} (${passed}/${tests.length} 통과)\x1b[0m`)
		console.log(color + "-".repeat(50) + "\x1b[0m")

		if (tests.length === 0) {
			console.log("   테스트 없음")
			return
		}

		tests.forEach((test, index) => {
			const status = test.state === "pass" ? "✅ 성공" : test.state === "fail" ? "❌ 실패" : "⚠️  알 수 없음"
			const duration = test.duration ? `(${test.duration}ms)` : ""

			console.log(`${index + 1}. ${test.name}: ${status} ${duration}`)

			if (test.error) {
				console.log(`   ❌ 오류: ${test.error.split("\n")[0]}`)
			}
		})
	}
}

export default CaretTestReporter
