#!/usr/bin/env node

/**
 * CodeCenter 로케일 브랜딩 변환 스크립트
 * JSON 파일에서 Caret → CodeCenter 브랜딩 변환을 수행
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

function warning(message) {
	log(`⚠️ ${message}`, "yellow")
}

class CodeCenterLocaleReplacer {
	constructor() {
		this.projectRoot = this.findProjectRoot()
		this.targetDir = path.join(this.projectRoot, "caret-b2b/brands/codecenter/locale")

		// 브랜딩 변환 규칙 (순서 중요 - 긴 패턴부터 처리)
		this.replacementRules = [
			// 한국어 조사 처리 (가장 구체적인 것부터)
			{ from: "캐럿이", to: "코드센터가" },
			{ from: "캐럿을", to: "코드센터를" },
			{ from: "캐럿", to: "코드센터" },

			// 영어 회사명
			{ from: "Caretive INC", to: "Slexn INC" },
			{ from: "Caretive Inc.", to: "Slexn Inc." },
			{ from: "Caretive Inc", to: "Slexn Inc" },

			// JSON 키 값들 (대소문자 구분)
			{ from: ': "caret', to: ': "codecenter' },
			{ from: " caret_mcp", to: " codecenter_mcp" },
			{ from: ".caretrule", to: ".codecenterrule" },
			{ from: ".Caret", to: ".CodeCenter" },

			// 일반 브랜드명 (대소문자 구분)
			{ from: "Caret", to: "CodeCenter" },
			{ from: "caret", to: "codecenter" },
		]

		this.stats = {
			filesProcessed: 0,
			totalReplacements: 0,
			ruleUsage: {},
		}
	}

	findProjectRoot() {
		let currentDir = __dirname
		while (currentDir !== path.dirname(currentDir)) {
			if (fs.existsSync(path.join(currentDir, "package.json"))) {
				const pkg = JSON.parse(fs.readFileSync(path.join(currentDir, "package.json"), "utf8"))
				if (pkg.name === "claude-dev" || pkg.name === "caret" || pkg.name === "codecenter") {
					return currentDir
				}
			}
			currentDir = path.dirname(currentDir)
		}
		throw new Error("프로젝트 루트를 찾을 수 없습니다")
	}

	async processAllLocales() {
		log("\n🚀 CodeCenter 로케일 브랜딩 변환 시작", "bright")

		if (!fs.existsSync(this.targetDir)) {
			error(`타겟 디렉토리가 없습니다: ${this.targetDir}`)
			return false
		}

		// 백업 생성
		const backupDir = `${this.targetDir}-backup-${Date.now()}`
		fs.cpSync(this.targetDir, backupDir, { recursive: true })
		info(`백업 생성: ${backupDir}`)

		// 언어별 처리
		const languages = fs.readdirSync(this.targetDir)

		for (const lang of languages) {
			const langDir = path.join(this.targetDir, lang)

			if (!fs.statSync(langDir).isDirectory()) continue

			info(`\n📂 언어 처리: ${lang}`)

			const jsonFiles = fs.readdirSync(langDir).filter((f) => f.endsWith(".json"))

			for (const jsonFile of jsonFiles) {
				const filePath = path.join(langDir, jsonFile)
				await this.processJsonFile(filePath, lang, jsonFile)
			}
		}

		this.printStatistics()
		return true
	}

	async processJsonFile(filePath, language, fileName) {
		try {
			// 원본 내용 읽기
			const originalContent = fs.readFileSync(filePath, "utf8")
			let modifiedContent = originalContent
			let fileReplacements = 0

			// 규칙별로 변환 적용
			for (const rule of this.replacementRules) {
				const beforeCount = (modifiedContent.match(new RegExp(this.escapeRegex(rule.from), "g")) || []).length

				if (beforeCount > 0) {
					modifiedContent = modifiedContent.replace(new RegExp(this.escapeRegex(rule.from), "g"), rule.to)

					const afterCount = (modifiedContent.match(new RegExp(this.escapeRegex(rule.from), "g")) || []).length
					const replacements = beforeCount - afterCount

					if (replacements > 0) {
						fileReplacements += replacements

						// 통계 업데이트
						if (!this.stats.ruleUsage[rule.from]) {
							this.stats.ruleUsage[rule.from] = 0
						}
						this.stats.ruleUsage[rule.from] += replacements

						log(`    🔄 "${rule.from}" → "${rule.to}" (${replacements}개)`, "cyan")
					}
				}
			}

			// 변경된 내용이 있으면 파일 업데이트
			if (originalContent !== modifiedContent) {
				// JSON 유효성 검사
				try {
					JSON.parse(modifiedContent)
				} catch (jsonError) {
					error(`    ✗ ${fileName}: JSON 파싱 오류 - ${jsonError.message}`)
					return
				}

				fs.writeFileSync(filePath, modifiedContent, "utf8")
				success(`    ✓ ${fileName} (${fileReplacements}개 변환)`)
				this.stats.totalReplacements += fileReplacements
			} else {
				log(`    ○ ${fileName} (변경사항 없음)`, "yellow")
			}

			this.stats.filesProcessed++
		} catch (error) {
			error(`    ✗ ${fileName}: ${error.message}`)
		}
	}

	escapeRegex(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
	}

	printStatistics() {
		log("\n📊 변환 통계", "bright")
		success(`처리된 파일: ${this.stats.filesProcessed}개`)
		success(`총 변환 횟수: ${this.stats.totalReplacements}개`)

		if (Object.keys(this.stats.ruleUsage).length > 0) {
			log("\n📋 규칙별 사용 횟수:", "blue")
			for (const [rule, count] of Object.entries(this.stats.ruleUsage)) {
				log(`  • "${rule}": ${count}회`, "cyan")
			}
		} else {
			warning("변환된 내용이 없습니다. 이미 CodeCenter로 변환되었을 수 있습니다.")
		}
	}

	async findRemainingCaretReferences() {
		log("\n🔍 남은 Caret 참조 검사", "bright")

		const languages = fs.readdirSync(this.targetDir)
		let foundReferences = false

		for (const lang of languages) {
			const langDir = path.join(this.targetDir, lang)

			if (!fs.statSync(langDir).isDirectory()) continue

			const jsonFiles = fs.readdirSync(langDir).filter((f) => f.endsWith(".json"))

			for (const jsonFile of jsonFiles) {
				const filePath = path.join(langDir, jsonFile)
				const content = fs.readFileSync(filePath, "utf8")

				// Caret 관련 패턴 검색
				const caretPatterns = [/캐럿/g, /[^a-zA-Z]Caret[^a-zA-Z]/g, /[^a-zA-Z]caret[^a-zA-Z]/g, /Caretive/g]

				for (const pattern of caretPatterns) {
					const matches = content.match(pattern)
					if (matches) {
						if (!foundReferences) {
							warning("⚠️ 아직 변환되지 않은 Caret 참조가 발견되었습니다:")
							foundReferences = true
						}
						log(`  ${lang}/${jsonFile}: ${matches.length}개 - ${matches.join(", ")}`, "yellow")
					}
				}
			}
		}

		if (!foundReferences) {
			success("🎉 모든 Caret 참조가 성공적으로 CodeCenter로 변환되었습니다!")
		}

		return !foundReferences
	}
}

// 메인 실행
async function main() {
	try {
		const args = process.argv.slice(2)
		const command = args[0]

		const replacer = new CodeCenterLocaleReplacer()

		if (command === "--check" || command === "-c") {
			// 검사만 수행
			await replacer.findRemainingCaretReferences()
		} else {
			// 변환 수행
			const success = await replacer.processAllLocales()
			if (!success) {
				process.exit(1)
			}

			// 변환 후 검사
			await replacer.findRemainingCaretReferences()

			success("\n🎯 CodeCenter 로케일 브랜딩 변환이 완료되었습니다!")
		}
	} catch (error) {
		error(`스크립트 실행 중 오류: ${error.message}`)
		process.exit(1)
	}
}

// 사용법 출력
if (process.argv.includes("--help") || process.argv.includes("-h")) {
	console.log(`
📋 CodeCenter 로케일 브랜딩 변환 스크립트

사용법:
  node codecenter-locale-replacer.js          # 변환 수행
  node codecenter-locale-replacer.js --check  # 검사만 수행
  node codecenter-locale-replacer.js --help   # 도움말

변환 규칙:
  • 캐럿이 → 코드센터가
  • 캐럿을 → 코드센터를  
  • 캐럿 → 코드센터
  • Caretive INC → Slexn INC
  • : "caret → : "codecenter
  • caret_mcp → codecenter_mcp
  • .caretrule → .codecenterrule
  • .Caret → .CodeCenter
  • Caret → CodeCenter (대소문자 구분)
`)
	process.exit(0)
}

// 직접 실행 시에만 main 함수 호출
if (require.main === module) {
	main()
}
