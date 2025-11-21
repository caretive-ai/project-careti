#!/usr/bin/env node

/**
 * CodeCenter 로케일 동기화 스크립트
 * 현재 i18n 시스템을 CodeCenter 브랜드로 동기화하고 브랜딩 변환 적용
 *
 * @author Luke Yang + Claude Code
 * @version 1.0.0
 */

const fs = require("fs")
const path = require("path")

// 색상 코드
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
}

function log(message, color = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`)
}

function error(message) {
	log(`❌ ${message}`, "red")
}

function success(message) {
	log(`✅ ${message}`, "green")
}

function info(message) {
	log(`📋 ${message}`, "blue")
}

class CodeCenterLocaleSync {
	constructor() {
		this.projectRoot = this.findProjectRoot()
		this.sourceDir = path.join(this.projectRoot, "webview-ui/src/caret/locale")
		this.targetDir = path.join(this.projectRoot, "caret-b2b/brands/codecenter/locale")

		// 브랜딩 변환 규칙
		this.brandMappings = {
			Caret: "CodeCenter",
			캐럿: "코드센터",
			caret: "codecenter",
			caretBanner: "CodeCenterBanner",
			notifyCaretAccount: "notifyCodeCenterAccount",
			learnMoreCaretGit: "learnMoreCodeCenterGit",
		}
	}

	findProjectRoot() {
		let currentDir = __dirname
		while (currentDir !== path.dirname(currentDir)) {
			if (fs.existsSync(path.join(currentDir, "package.json"))) {
				const pkg = JSON.parse(fs.readFileSync(path.join(currentDir, "package.json"), "utf8"))
				if (pkg.name === "claude-dev" || pkg.name === "caret") {
					return currentDir
				}
			}
			currentDir = path.dirname(currentDir)
		}
		throw new Error("프로젝트 루트를 찾을 수 없습니다")
	}

	async syncLocales() {
		log("\n🚀 CodeCenter 로케일 동기화 시작", "bright")

		if (!fs.existsSync(this.sourceDir)) {
			error(`소스 디렉토리가 없습니다: ${this.sourceDir}`)
			return false
		}

		// 타겟 디렉토리 생성
		if (!fs.existsSync(this.targetDir)) {
			fs.mkdirSync(this.targetDir, { recursive: true })
			info(`타겟 디렉토리 생성: ${this.targetDir}`)
		}

		// 백업 생성
		const backupDir = `${this.targetDir}-backup-${Date.now()}`
		if (fs.existsSync(this.targetDir)) {
			fs.cpSync(this.targetDir, backupDir, { recursive: true })
			info(`기존 파일 백업: ${backupDir}`)
		}

		// 언어별 처리
		const languages = fs.readdirSync(this.sourceDir)
		let totalProcessed = 0

		for (const lang of languages) {
			const sourceLangDir = path.join(this.sourceDir, lang)
			const targetLangDir = path.join(this.targetDir, lang)

			if (!fs.statSync(sourceLangDir).isDirectory()) continue

			info(`\n📂 언어 처리 중: ${lang}`)

			// 언어 디렉토리 생성
			if (!fs.existsSync(targetLangDir)) {
				fs.mkdirSync(targetLangDir, { recursive: true })
			}

			// JSON 파일들 처리
			const jsonFiles = fs.readdirSync(sourceLangDir).filter((f) => f.endsWith(".json"))

			for (const jsonFile of jsonFiles) {
				const sourceFile = path.join(sourceLangDir, jsonFile)
				const targetFile = path.join(targetLangDir, jsonFile)

				await this.processJsonFile(sourceFile, targetFile, lang)
				totalProcessed++
			}

			success(`  ${jsonFiles.length}개 파일 처리 완료`)
		}

		success(`\n🎉 동기화 완료: ${totalProcessed}개 파일 처리됨`)
		return true
	}

	async processJsonFile(sourceFile, targetFile, language) {
		try {
			// 소스 파일 읽기
			const sourceContent = JSON.parse(fs.readFileSync(sourceFile, "utf8"))

			// 브랜딩 변환 적용
			const convertedContent = this.applyBrandConversion(sourceContent, language)

			// 타겟 파일 쓰기 (들여쓰기 2칸으로 포맷팅)
			fs.writeFileSync(targetFile, JSON.stringify(convertedContent, null, 2), "utf8")

			log(`    ✓ ${path.basename(sourceFile)}`, "cyan")
		} catch (error) {
			error(`    ✗ ${path.basename(sourceFile)}: ${error.message}`)
		}
	}

	applyBrandConversion(obj, language) {
		if (typeof obj === "string") {
			// 문자열에 브랜딩 변환 적용
			let converted = obj
			for (const [from, to] of Object.entries(this.brandMappings)) {
				// 정확한 단어 매칭 (단어 경계 고려)
				const regex = new RegExp(`\\b${from}\\b`, "g")
				converted = converted.replace(regex, to)
			}
			return converted
		}

		if (Array.isArray(obj)) {
			return obj.map((item) => this.applyBrandConversion(item, language))
		}

		if (obj !== null && typeof obj === "object") {
			const converted = {}
			for (const [key, value] of Object.entries(obj)) {
				converted[key] = this.applyBrandConversion(value, language)
			}
			return converted
		}

		return obj
	}

	async validateSync() {
		log("\n🔍 동기화 검증 시작", "bright")

		if (!fs.existsSync(this.targetDir)) {
			error("타겟 디렉토리가 없습니다")
			return false
		}

		const sourceLanguages = fs.readdirSync(this.sourceDir)
		const targetLanguages = fs.readdirSync(this.targetDir)

		// 언어 디렉토리 검증
		const missingLanguages = sourceLanguages.filter(
			(lang) => fs.statSync(path.join(this.sourceDir, lang)).isDirectory() && !targetLanguages.includes(lang),
		)

		if (missingLanguages.length > 0) {
			error(`누락된 언어: ${missingLanguages.join(", ")}`)
			return false
		}

		// 파일 개수 검증
		let allValid = true
		for (const lang of sourceLanguages) {
			const sourceLangDir = path.join(this.sourceDir, lang)
			const targetLangDir = path.join(this.targetDir, lang)

			if (!fs.statSync(sourceLangDir).isDirectory()) continue

			const sourceFiles = fs.readdirSync(sourceLangDir).filter((f) => f.endsWith(".json"))
			const targetFiles = fs.readdirSync(targetLangDir).filter((f) => f.endsWith(".json"))

			if (sourceFiles.length !== targetFiles.length) {
				error(`${lang}: 파일 개수 불일치 (소스: ${sourceFiles.length}, 타겟: ${targetFiles.length})`)
				allValid = false
			} else {
				success(`${lang}: ${sourceFiles.length}개 파일 일치`)
			}
		}

		return allValid
	}
}

// 메인 실행
async function main() {
	try {
		const syncer = new CodeCenterLocaleSync()

		// 동기화 실행
		const syncSuccess = await syncer.syncLocales()
		if (!syncSuccess) {
			process.exit(1)
		}

		// 검증 실행
		const validationSuccess = await syncer.validateSync()
		if (!validationSuccess) {
			process.exit(1)
		}

		success("\n🎯 CodeCenter 로케일 동기화가 성공적으로 완료되었습니다!")
	} catch (error) {
		error(`스크립트 실행 중 오류: ${error.message}`)
		process.exit(1)
	}
}

// 직접 실행 시에만 main 함수 호출
if (require.main === module) {
	main()
}
