const fs = require("fs")
const path = require("path")

class PhaseValidator {
	validatePhase1() {
		// JSON 파일 3개 존재 여부 검증
		const requiredFiles = ["CARET_TODO_MANAGEMENT.json", "CARET_TASK_PROGRESS.json", "CARET_FEEDBACK_SYSTEM.json"]
		requiredFiles.forEach((file) => {
			const filePath = path.join(__dirname, `../caret-src/core/prompts/sections/${file}`)
			if (!fs.existsSync(filePath)) {
				throw new Error(`Missing required file: ${file}`)
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

	validatePhase2() {
		const requiredFiles = [
			"../caret-src/core/prompts/system/PromptSystemManager.ts",
			"../caret-src/core/prompts/system/adapters/CaretJsonAdapter.ts",
			"../caret-src/core/prompts/system/adapters/ClineLatestAdapter.ts",
			"../caret-src/__tests__/tdd/T06PromptSystemIntegration.test.ts",
		]
		requiredFiles.forEach((file) => {
			if (!fs.existsSync(path.join(__dirname, file))) {
				throw new Error(`Missing required file: ${file}`)
			}
		})
		console.log("🎉 Phase 2 validation successful: All required files exist.")
		return true
	}
}

// To run this validator:
// const validator = new PhaseValidator();
// validator.validatePhase1();
// validator.validatePhase2();
