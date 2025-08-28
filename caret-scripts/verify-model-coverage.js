const fs = require("fs")
const path = require("path")

// 색상 출력을 위한 유틸리티
const colors = {
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	cyan: "\x1b[36m",
	reset: "\x1b[0m",
}

function log(message, color = colors.reset) {
	console.log(`${color}${message}${colors.reset}`)
}

/**
 * api.ts 파일에서 모델 정의 객체로부터 모든 모델 ID를 추출합니다.
 * 예: export const anthropicModels = { ... }
 * @param {string} filePath - api.ts 파일 경로
 * @returns {Set<string>} - 모델 ID의 Set
 */
function extractModelIds(filePath) {
	const modelIds = new Set()
	try {
		const content = fs.readFileSync(filePath, "utf8")
		// 'export const ...Models = {' 형태의 모든 모델 정의 객체를 찾습니다.
		const modelRegex = /export const (\w+Models) = {([^}]+)}/gs
		const allModelsRegex = /export const (\w+Models) = {([\s\S]*?)} as const/g

		let match
		while ((match = allModelsRegex.exec(content)) !== null) {
			const modelObjectContent = match[2]
			// 객체 내의 키 (모델 ID)를 추출합니다.
			const keyRegex = /"([^"]+)": {/g
			let keyMatch
			while ((keyMatch = keyRegex.exec(modelObjectContent)) !== null) {
				modelIds.add(keyMatch[1])
			}
		}
	} catch (error) {
		log(`Error reading or parsing file ${filePath}: ${error.message}`, colors.red)
	}
	return modelIds
}

function main() {
	log("🔍 모델 커버리지 검증 스크립트 시작...", colors.cyan)

	const caretApiPath = path.resolve(__dirname, "../src/shared/api.ts")
	const clineApiPath = path.resolve(__dirname, "../cline-latest/src/shared/api.ts")

	if (!fs.existsSync(caretApiPath)) {
		log(`❌ Caret api.ts 파일을 찾을 수 없습니다: ${caretApiPath}`, colors.red)
		return
	}
	if (!fs.existsSync(clineApiPath)) {
		log(`❌ Cline api.ts 파일을 찾을 수 없습니다: ${clineApiPath}`, colors.red)
		return
	}

	const caretModels = extractModelIds(caretApiPath)
	const clineModels = extractModelIds(clineApiPath)

	log(`📊 Caret 모델 수: ${caretModels.size}`)
	log(`📊 Cline 모델 수: ${clineModels.size}`)

	const missingModels = new Set()
	for (const model of clineModels) {
		if (!caretModels.has(model)) {
			missingModels.add(model)
		}
	}

	if (missingModels.size > 0) {
		log(`\n⚠️ Caret에 누락된 Cline 모델 (${missingModels.size}개):`, colors.yellow)
		missingModels.forEach((model) => console.log(`  - ${model}`))
	} else {
		log(`\n✅ 완벽합니다! Caret은 Cline의 모든 모델을 포함하고 있습니다.`, colors.green)
	}

	log("\n🔍 검증 완료.", colors.cyan)
}

main()
