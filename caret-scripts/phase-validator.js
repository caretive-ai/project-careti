const fs = require("fs")
const path = require("path")

class PhaseValidator {
	validatePhase1() {
		console.log("🚀 Starting Phase 1 validation...")

		// JSON 파일 3개 존재 여부 검증
		const requiredFiles = ["CARET_TODO_MANAGEMENT.json", "CARET_TASK_PROGRESS.json", "CARET_FEEDBACK_SYSTEM.json"]
		const sectionsDir = path.join(__dirname, "../caret-src/core/prompts/sections")

		requiredFiles.forEach((file) => {
			const filePath = path.join(sectionsDir, file)
			if (!fs.existsSync(filePath)) {
				throw new Error(`❌ Missing required file: ${file}`)
			}
			console.log(`✅ Found required file: ${file}`)

			// JSON 스키마 유효성 검사
			try {
				const content = fs.readFileSync(filePath, "utf8")
				JSON.parse(content)
				console.log(`   - ✅ JSON syntax is valid for ${file}`)
			} catch (e) {
				throw new Error(`❌ Invalid JSON syntax in ${file}: ${e.message}`)
			}
		})

		// 토큰 효율성 임계값 검사는 Phase 2에서 구현 예정
		console.log("   - ⚠️ Token efficiency check will be implemented in a later phase.")

		console.log("🎉 Phase 1 validation completed successfully!")
		return true
	}
}

// To run this validator:
// const validator = new PhaseValidator();
// validator.validatePhase1();
