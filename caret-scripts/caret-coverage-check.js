#!/usr/bin/env node

/**
 * Caret vs Cline 코드 테스트 커버리지 비교 분석 스크립트
 *
 * 이 스크립트는 다음 작업을 수행합니다:
 * 1. Caret 전용 코드 (caret-src/, webview-ui/src/caret/) 커버리지 분석
 * 2. Cline 원본 코드 (src/, webview-ui/src/ 제외 caret/) 커버리지 분석
 * 3. 두 영역의 커버리지 비교 및 목표 대비 현황 리포트
 * 4. Caret 100% 커버리지 목표 대비 구체적인 개선 방안 제시
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// chalk 5.x는 ESM only이므로 대신 간단한 색상 함수 사용
const colors = {
	green: (text) => `\x1b[32m${text}\x1b[0m`,
	red: (text) => `\x1b[31m${text}\x1b[0m`,
	yellow: (text) => `\x1b[33m${text}\x1b[0m`,
	blue: (text) => `\x1b[34m${text}\x1b[0m`,
	cyan: (text) => `\x1b[36m${text}\x1b[0m`,
	magenta: (text) => `\x1b[35m${text}\x1b[0m`,
	bold: (text) => `\x1b[1m${text}\x1b[0m`,
}

// 설정
const COVERAGE_TARGETS = {
	// Caret 전용 코드 - 100% 목표
	CARET_BACKEND: {
		path: "caret-src/",
		target: 100,
		name: "🥕 Caret 백엔드",
		type: "caret",
		priority: "high",
	},
	CARET_FRONTEND: {
		path: "webview-ui/src/caret/",
		target: 100,
		name: "🥕 Caret 프론트엔드",
		type: "caret",
		priority: "high",
	},

	// Cline 원본 코드 - 참고용
	CLINE_BACKEND: {
		path: "src/",
		target: 70, // 현실적 목표
		name: "🤖 Cline 백엔드",
		type: "cline",
		priority: "reference",
	},
	CLINE_FRONTEND: {
		path: "webview-ui/src/",
		excludePaths: ["webview-ui/src/caret/"], // Caret 폴더 제외
		target: 70, // 현실적 목표
		name: "🤖 Cline 프론트엔드",
		type: "cline",
		priority: "reference",
	},
}

const THRESHOLDS = {
	EXCELLENT: 95,
	GOOD: 80,
	ACCEPTABLE: 70,
	POOR: 50,
}

// 유틸리티 함수
function log(message, type = "info") {
	const timestamp = new Date().toLocaleTimeString()
	const prefix = `[${timestamp}]`

	switch (type) {
		case "success":
			console.log(colors.green(`✅ ${prefix} ${message}`))
			break
		case "error":
			console.log(colors.red(`❌ ${prefix} ${message}`))
			break
		case "warning":
			console.log(colors.yellow(`⚠️  ${prefix} ${message}`))
			break
		case "info":
			console.log(colors.blue(`ℹ️  ${prefix} ${message}`))
			break
		case "excellent":
			console.log(colors.green(`🏆 ${prefix} ${message}`))
			break
		case "good":
			console.log(colors.cyan(`👍 ${prefix} ${message}`))
			break
		case "caret":
			console.log(colors.magenta(`🥕 ${prefix} ${message}`))
			break
		case "cline":
			console.log(colors.blue(`🤖 ${prefix} ${message}`))
			break
		default:
			console.log(`${prefix} ${message}`)
	}
}

function getScoreColor(score) {
	if (score >= THRESHOLDS.EXCELLENT) return "excellent"
	if (score >= THRESHOLDS.GOOD) return "good"
	if (score >= THRESHOLDS.ACCEPTABLE) return "info"
	if (score >= THRESHOLDS.POOR) return "warning"
	return "error"
}

function getScoreEmoji(score) {
	if (score >= THRESHOLDS.EXCELLENT) return "🏆"
	if (score >= THRESHOLDS.GOOD) return "👍"
	if (score >= THRESHOLDS.ACCEPTABLE) return "👌"
	if (score >= THRESHOLDS.POOR) return "⚠️"
	return "❌"
}

// 파일 분석 함수
function analyzeDirectory(dirPath, excludePaths = []) {
	const stats = {
		totalFiles: 0,
		testedFiles: 0,
		totalLines: 0,
		testedLines: 0,
		files: [],
	}

	function isExcluded(filePath) {
		return excludePaths.some((excludePath) => {
			const normalizedFilePath = path.normalize(filePath)
			const normalizedExcludePath = path.normalize(excludePath)
			return normalizedFilePath.startsWith(normalizedExcludePath)
		})
	}

	function scanDirectory(currentPath) {
		if (!fs.existsSync(currentPath)) {
			return
		}

		const items = fs.readdirSync(currentPath)

		for (const item of items) {
			const itemPath = path.join(currentPath, item)
			const stat = fs.statSync(itemPath)

			if (stat.isDirectory()) {
				// 테스트 디렉토리는 제외
				if (!item.includes("__tests__") && !item.includes(".test") && !item.includes(".spec")) {
					scanDirectory(itemPath)
				}
			} else if (stat.isFile()) {
				// 제외 경로 확인
				if (isExcluded(itemPath)) {
					continue
				}

				// TypeScript/JavaScript 파일만 분석
				if (item.endsWith(".ts") || item.endsWith(".tsx") || item.endsWith(".js") || item.endsWith(".jsx")) {
					// 테스트 파일은 제외
					if (!item.includes(".test.") && !item.includes(".spec.")) {
						const content = fs.readFileSync(itemPath, "utf8")
						const lines = content.split("\n").length

						// 해당 파일에 대한 테스트 파일이 있는지 확인
						const baseName = item.replace(/\.(ts|tsx|js|jsx)$/, "")
						const testPatterns = [
							`${baseName}.test.ts`,
							`${baseName}.test.tsx`,
							`${baseName}.spec.ts`,
							`${baseName}.spec.tsx`,
							`__tests__/${baseName}.test.ts`,
							`__tests__/${baseName}.test.tsx`,
							`__tests__/${baseName}.spec.ts`,
							`__tests__/${baseName}.spec.tsx`,
						]

						let hasTest = testPatterns.some((pattern) => {
							const testPath = path.join(path.dirname(itemPath), pattern)
							return fs.existsSync(testPath)
						})

						// CARET MODIFICATION: caret-src 루트의 __tests__ 디렉토리도 확인
						if (!hasTest && itemPath.includes("caret-src")) {
							const caretSrcRoot = itemPath.substring(0, itemPath.indexOf("caret-src") + "caret-src".length)
							const caretTestPatterns = [
								`__tests__/${baseName}.test.ts`,
								`__tests__/${baseName}.test.tsx`,
								`__tests__/${baseName}.spec.ts`,
								`__tests__/${baseName}.spec.tsx`,
							]

							hasTest = caretTestPatterns.some((pattern) => {
								const testPath = path.join(caretSrcRoot, pattern)
								return fs.existsSync(testPath)
							})
						}

						stats.totalFiles++
						stats.totalLines += lines

						if (hasTest) {
							stats.testedFiles++
							stats.testedLines += lines
						}

						stats.files.push({
							path: path.relative(process.cwd(), itemPath),
							lines,
							hasTest,
							coverage: hasTest ? 100 : 0,
						})
					}
				}
			}
		}
	}

	scanDirectory(dirPath)
	return stats
}

// 메인 분석 함수
function analyzeCoverage() {
	log("🔍 Caret vs Cline 코드 커버리지 비교 분석 시작", "info")
	console.log("")

	const results = {}
	const caretResults = {}
	const clineResults = {}

	let caretOverallScore = 0
	let caretTotalWeight = 0
	let clineOverallScore = 0
	let clineTotalWeight = 0

	// 각 타겟 디렉토리 분석
	for (const [key, config] of Object.entries(COVERAGE_TARGETS)) {
		log(`📁 ${config.name} 분석 중... (${config.path})`, config.type)

		const stats = analyzeDirectory(config.path, config.excludePaths || [])
		const fileCoverage = stats.totalFiles > 0 ? (stats.testedFiles / stats.totalFiles) * 100 : 0
		const lineCoverage = stats.totalLines > 0 ? (stats.testedLines / stats.totalLines) * 100 : 0

		// 파일 커버리지와 라인 커버리지의 평균
		const averageCoverage = (fileCoverage + lineCoverage) / 2

		const result = {
			...config,
			stats,
			fileCoverage,
			lineCoverage,
			averageCoverage,
		}

		results[key] = result

		// Caret vs Cline 분류
		if (config.type === "caret") {
			caretResults[key] = result
			const weight = stats.totalFiles
			caretOverallScore += averageCoverage * weight
			caretTotalWeight += weight
		} else {
			clineResults[key] = result
			const weight = stats.totalFiles
			clineOverallScore += averageCoverage * weight
			clineTotalWeight += weight
		}
	}

	// 전체 스코어 계산
	const finalCaretScore = caretTotalWeight > 0 ? caretOverallScore / caretTotalWeight : 0
	const finalClineScore = clineTotalWeight > 0 ? clineOverallScore / clineTotalWeight : 0

	// 결과 출력
	displayResults(caretResults, clineResults, finalCaretScore, finalClineScore)

	return {
		caret: { results: caretResults, score: finalCaretScore },
		cline: { results: clineResults, score: finalClineScore },
		overall: results,
	}
}

function displayResults(caretResults, clineResults, caretScore, clineScore) {
	console.log("")
	console.log(colors.bold("=".repeat(80)))
	console.log(colors.bold("                    📊 CARET vs CLINE 커버리지 비교 리포트"))
	console.log(colors.bold("=".repeat(80)))
	console.log("")

	// Caret 결과
	console.log(colors.magenta(colors.bold("🥕 CARET 전용 코드 (목표: 100%)")))
	console.log(colors.magenta("-".repeat(50)))

	for (const [key, result] of Object.entries(caretResults)) {
		const emoji = getScoreEmoji(result.averageCoverage)
		const scoreColor = getScoreColor(result.averageCoverage)

		console.log(`${emoji} ${result.name}`)
		console.log(`   파일: ${result.stats.testedFiles}/${result.stats.totalFiles} (${result.fileCoverage.toFixed(1)}%)`)
		console.log(`   라인: ${result.stats.testedLines}/${result.stats.totalLines} (${result.lineCoverage.toFixed(1)}%)`)
		const colorFunc = scoreColor === "info" ? colors.blue : colors[scoreColor] || colors.blue
		console.log(`   평균: ${colorFunc(result.averageCoverage.toFixed(1) + "%")} / 목표: ${result.target}%`)

		if (result.averageCoverage < result.target) {
			const gap = result.target - result.averageCoverage
			console.log(`   ${colors.red("⚠️  목표 대비 부족: " + gap.toFixed(1) + "%")}`)
		} else {
			console.log(`   ${colors.green("✅ 목표 달성!")}`)
		}
		console.log("")
	}

	const caretEmoji = getScoreEmoji(caretScore)
	const caretScoreColor = getScoreColor(caretScore)
	const caretColorFunc = caretScoreColor === "info" ? colors.blue : colors[caretScoreColor] || colors.blue
	console.log(colors.magenta(`${caretEmoji} Caret 전체 평균: ${caretColorFunc(caretScore.toFixed(1) + "%")} / 목표: 100%`))

	if (caretScore < 100) {
		const gap = 100 - caretScore
		console.log(colors.red(`   ⚠️  목표 대비 부족: ${gap.toFixed(1)}%`))
	} else {
		console.log(colors.green("   🎉 목표 달성!"))
	}

	console.log("")
	console.log("")

	// Cline 결과
	console.log(colors.blue(colors.bold("🤖 CLINE 원본 코드 (참고용)")))
	console.log(colors.blue("-".repeat(50)))

	for (const [key, result] of Object.entries(clineResults)) {
		const emoji = getScoreEmoji(result.averageCoverage)
		const scoreColor = getScoreColor(result.averageCoverage)

		console.log(`${emoji} ${result.name}`)
		console.log(`   파일: ${result.stats.testedFiles}/${result.stats.totalFiles} (${result.fileCoverage.toFixed(1)}%)`)
		console.log(`   라인: ${result.stats.testedLines}/${result.stats.totalLines} (${result.lineCoverage.toFixed(1)}%)`)
		const clineColorFunc = scoreColor === "info" ? colors.blue : colors[scoreColor] || colors.blue
		console.log(`   평균: ${clineColorFunc(result.averageCoverage.toFixed(1) + "%")} / 참고 목표: ${result.target}%`)
		console.log("")
	}

	const clineEmoji = getScoreEmoji(clineScore)
	const clineScoreColor = getScoreColor(clineScore)
	const clineOverallColorFunc = clineScoreColor === "info" ? colors.blue : colors[clineScoreColor] || colors.blue
	console.log(colors.blue(`${clineEmoji} Cline 전체 평균: ${clineOverallColorFunc(clineScore.toFixed(1) + "%")} (참고용)`))

	console.log("")
	console.log("")

	// 비교 및 권장사항
	console.log(colors.bold("📈 비교 분석 및 권장사항"))
	console.log("-".repeat(50))

	if (caretScore < 100) {
		console.log(colors.yellow("🎯 Caret 코드 100% 커버리지 달성을 위한 액션 아이템:"))

		for (const [key, result] of Object.entries(caretResults)) {
			if (result.averageCoverage < result.target) {
				const untestedFiles = result.stats.files.filter((f) => !f.hasTest)
				if (untestedFiles.length > 0) {
					console.log(`\n   ${result.name}:`)
					console.log(`   - 테스트가 필요한 파일 ${untestedFiles.length}개:`)
					untestedFiles.slice(0, 5).forEach((file) => {
						console.log(`     • ${file.path} (${file.lines} lines)`)
					})
					if (untestedFiles.length > 5) {
						console.log(`     ... 외 ${untestedFiles.length - 5}개 파일`)
					}
				}
			}
		}
	} else {
		console.log(colors.green("🎉 Caret 코드가 100% 커버리지 목표를 달성했습니다!"))
	}

	console.log("")
	console.log(colors.cyan("💡 참고: Cline 원본 코드는 upstream 호환성을 위해 수정하지 않으며,"))
	console.log(colors.cyan("   Caret 전용 코드만 100% 커버리지를 목표로 합니다."))

	console.log("")
	console.log(colors.bold("=".repeat(80)))
}

// 도움말 표시
function showHelp() {
	console.log(`
🥕 Caret 테스트 커버리지 분석 도구

사용법:
  node scripts/caret-coverage-check.js [옵션]

옵션:
  --help           이 도움말 표시

이 도구는 다음을 분석합니다:
  • caret-src/ - Caret 백엔드 코드
  • webview-ui/src/caret/ - Caret 프론트엔드 컴포넌트

목표: 모든 Caret 전용 코드 100% 테스트 커버리지
`)
}

// 메인 실행
if (process.argv.includes("--help")) {
	showHelp()
} else {
	try {
		const result = analyzeCoverage()

		// 결과에 따른 exit code
		if (result.caret.score >= THRESHOLDS.EXCELLENT) {
			process.exit(0) // 성공
		} else if (result.caret.score >= THRESHOLDS.ACCEPTABLE) {
			process.exit(0) // 허용 가능한 수준
		} else {
			process.exit(1) // 개선 필요
		}
	} catch (error) {
		console.error("커버리지 분석 중 오류 발생:", error)
		process.exit(1)
	}
}
