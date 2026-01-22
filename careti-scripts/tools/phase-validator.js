const fs = require("fs")
const path = require("path")

class PhaseValidator {
	validatePhase1() {
		// JSON 파일 3개 존재 여부 검증
		const requiredFiles = ["CARET_TODO_MANAGEMENT.json", "CARET_TASK_PROGRESS.json", "CARET_FEEDBACK_SYSTEM.json"]
		requiredFiles.forEach((file) => {
			const filePath = path.join(__dirname, `../careti-src/core/prompts/sections/${file}`)
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
			"../careti-src/core/prompts/system/PromptSystemManager.ts",
			"../careti-src/core/prompts/system/adapters/CaretJsonAdapter.ts",
			"../careti-src/core/prompts/system/adapters/ClineLatestAdapter.ts",
			"../careti-src/__tests__/tdd/T06PromptSystemIntegration.test.ts",
		]
		requiredFiles.forEach((file) => {
			if (!fs.existsSync(path.join(__dirname, file))) {
				throw new Error(`Missing required file: ${file}`)
			}
		})
		console.log("🎉 Phase 2 validation successful: All required files exist.")
		return true
	}

	validatePhase3() {
		// 1. Verify JsonTemplateLoader.ts exists
		const loaderPath = path.join(__dirname, "../careti-src/core/prompts/system/JsonTemplateLoader.ts")
		if (!fs.existsSync(loaderPath)) {
			throw new Error("Missing required file: JsonTemplateLoader.ts")
		}
		console.log("✅ Found required file: JsonTemplateLoader.ts")

		// 2. Verify T06PromptSystemIntegration.test.ts does not use vi.mock
		const testFilePath = path.join(__dirname, "../careti-src/__tests__/tdd/T06PromptSystemIntegration.test.ts")
		const testFileContent = fs.readFileSync(testFilePath, "utf8")
		if (testFileContent.includes("vi.mock")) {
			throw new Error("T06PromptSystemIntegration.test.ts should not use vi.mock for Phase 3.")
		}
		console.log("✅ T06PromptSystemIntegration.test.ts is correctly using real implementations.")

		console.log("🎉 Phase 3 validation completed successfully!")
		return true
	}
}

// To run this validator:
// const validator = new PhaseValidator();
// validator.validatePhase1();
// validator.validatePhase2();
// validator.validatePhase3();

module.exports = PhaseValidator
