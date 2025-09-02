const fs = require("fs")
const path = require("path")

// --- 설정 ---
const TASKS = ["calculator", "markdown", "todolist", "json-processor"]
const MODELS = ["gemini-2.5-pro-preview-06-05", "gemini-2.5-flash-preview-05-20"]
const AGENTS = ["caret", "cline"]
const REPORT_PATH = __dirname

// --- 데이터 파싱 함수 ---

/**
 * 개별 보고서 파일에서 성능 데이터를 추출합니다.
 * @param {string} reportPath - 보고서 파일 경로
 * @returns {object|null} 추출된 성능 데이터 또는 null
 */
function parseReportFile(reportPath) {
	if (!fs.existsSync(reportPath)) {
		return null
	}

	try {
		const content = fs.readFileSync(reportPath, "utf-8")
		const lines = content.split("\n")

		// 데이터 추출을 위한 정규식 패턴들
		const patterns = {
			totalTokensIn: /\*\*총 입력 토큰\*\* \| ([0-9,]+)/,
			totalTokensOut: /\*\*총 출력 토큰\*\* \| ([0-9,]+)/,
			totalCachedTokens: /\*\*캐시된 토큰\*\* \| ([0-9,]+)/,
			totalCost: /\*\*총 API 비용\*\* \| \$([0-9.]+)/,
			apiCallCount: /\*\*API 호출 횟수\*\* \| ([0-9]+)회/,
			avgTokensPerCall: /\*\*평균 토큰\/호출\*\* \| ([0-9,]+) 토큰\/호출/,
			avgCostPerCall: /\*\*평균 비용\/호출\*\* \| \$([0-9.]+)\/호출/,
			totalLatency: /\*\*총 실행 시간\*\* \| ([0-9]+)초/,
			executionPeriod: /\*\*실행 기간\*\* \| (.+)/,
			actualMode: /\*\*실제 세션 모드\*\* \| ([a-z]+)/,
			actualSessionType: /\*\*실제 세션 타입\*\* \| ([a-z]+)/,
			promptLength: /\*\*프롬프트 길이\*\* \| ([0-9,]+) 문자/,
			promptWordCount: /\*\*단어 수\*\* \| ([0-9,]+) 개/,
			promptTokenCount: /\*\*측정된 토큰 수\*\* \| ([0-9,]+) 개/,
		}

		const data = {}
		const contentStr = content

		// 각 패턴으로 데이터 추출
		for (const [key, pattern] of Object.entries(patterns)) {
			const match = contentStr.match(pattern)
			if (match) {
				let value = match[1]

				// 숫자 필드 처리
				if (
					key.includes("Tokens") ||
					key.includes("Count") ||
					key.includes("Latency") ||
					key.includes("Length") ||
					key.includes("Word")
				) {
					value = parseInt(value.replace(/,/g, ""))
				} else if (key.includes("Cost")) {
					value = parseFloat(value)
				}

				data[key] = value
			}
		}

		// 파일명에서 추가 정보 추출
		const filename = path.basename(reportPath)
		const filenameMatch = filename.match(/^([^-]+)-(.+)-(\d{8})-report\.md$/)
		if (filenameMatch) {
			data.agent = filenameMatch[1]
			data.modelInfo = filenameMatch[2]
			data.date = filenameMatch[3]
		}

		// 모델명 정리 - 다양한 형식 지원
		if (data.modelInfo) {
			const modelInfo = data.modelInfo.toLowerCase()
			if (modelInfo.includes("pro")) {
				data.model = "gemini-2.5-pro-preview-06-05"
			} else if (modelInfo.includes("flash")) {
				data.model = "gemini-2.5-flash-preview-05-20"
			} else {
				data.model = "unknown"
			}
		}

		return data
	} catch (error) {
		console.warn(`보고서 파싱 중 오류 발생: ${reportPath}`, error.message)
		return null
	}
}

/**
 * 모든 실험 보고서를 수집하고 파싱합니다.
 * @returns {Array} 파싱된 모든 실험 데이터
 */
function collectAllReports() {
	const allReports = []

	for (const task of TASKS) {
		const taskDir = path.join(REPORT_PATH, task)
		if (!fs.existsSync(taskDir)) {
			console.warn(`과업 디렉토리 없음: ${taskDir}`)
			continue
		}

		const files = fs.readdirSync(taskDir)
		const reportFiles = files.filter((f) => f.endsWith("-report.md"))

		for (const reportFile of reportFiles) {
			const reportPath = path.join(taskDir, reportFile)
			const data = parseReportFile(reportPath)

			if (data) {
				data.task = task
				data.reportFile = reportFile
				allReports.push(data)
			}
		}
	}

	return allReports
}

// --- 통계 헬퍼 함수 ---

/**
 * 숫자 배열의 중앙값을 계산합니다.
 * @param {number[]} arr - 숫자 배열
 * @returns {number} 중앙값
 */
function median(arr) {
	if (arr.length === 0) return 0
	const sorted = [...arr].sort((a, b) => a - b)
	const mid = Math.floor(sorted.length / 2)
	return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * 숫자 배열의 표준편차를 계산합니다.
 * @param {number[]} arr - 숫자 배열
 * @returns {number} 표준편차
 */
function standardDeviation(arr) {
	if (arr.length < 2) return 0
	const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length
	return Math.sqrt(
		arr.reduce((acc, val) => acc.concat((val - mean) ** 2), []).reduce((acc, val) => acc + val, 0) / (arr.length - 1),
	)
}

/**
 * 주어진 리포트 배열과 키에 대한 통계 정보를 계산합니다.
 * @param {object[]} reports - 리포트 객체 배열
 * @param {string} key - 통계를 계산할 데이터의 키
 * @returns {object} 평균, 중앙값, 표준편차를 포함하는 객체
 */
function getStats(reports, key, perKey = null) {
	const values = reports.map((r) => {
		const value = r[key] || 0
		if (perKey) {
			const perValue = r[perKey] || 1 // 0으로 나누는 것을 방지
			return perValue === 0 ? 0 : value / perValue
		}
		return value
	})

	const total = values.reduce((sum, v) => sum + v, 0)
	const avg = reports.length > 0 ? total / reports.length : 0

	return {
		avg: avg,
		median: median(values),
		stdDev: standardDeviation(values),
		values: values,
	}
}

/**
 * 배열을 주어진 키로 그룹화합니다.
 * @param {object[]} array - 그룹화할 객체 배열
 * @param {string[]} keys - 그룹화 기준이 될 키 배열
 * @returns {object} 그룹화된 객체
 */
function groupBy(array, keys) {
	return array.reduce((result, currentValue) => {
		const groupKey = keys.map((key) => currentValue[key]).join(" | ")
		;(result[groupKey] = result[groupKey] || []).push(currentValue)
		return result
	}, {})
}

// --- 분석 함수들 ---

/**
 * 에이전트별 성능 요약 생성
 */
function generateAgentSummary(reports) {
	const summary = {}

	for (const agent of AGENTS) {
		const agentReports = reports.filter((r) => r.agent === agent)
		if (agentReports.length === 0) continue

		summary[agent] = {
			totalExperiments: agentReports.length,
			totalApiCalls: agentReports.reduce((sum, r) => sum + (r.apiCallCount || 0), 0),
			costPerCallStats: getStats(agentReports, "totalCost", "apiCallCount"),
			latencyPerCallStats: getStats(agentReports, "totalLatency", "apiCallCount"),
			tokensInPerCallStats: getStats(agentReports, "totalTokensIn", "apiCallCount"),
			tokensOutPerCallStats: getStats(agentReports, "totalTokensOut", "apiCallCount"),
		}
	}

	return summary
}

/**
 * 모델별 성능 요약 생성
 */
function generateModelSummary(reports) {
	const summary = {}

	for (const model of MODELS) {
		const modelReports = reports.filter((r) => r.model === model)
		if (modelReports.length === 0) continue

		summary[model] = {
			totalExperiments: modelReports.length,
			totalApiCalls: modelReports.reduce((sum, r) => sum + (r.apiCallCount || 0), 0),
			costPerCallStats: getStats(modelReports, "totalCost", "apiCallCount"),
			latencyPerCallStats: getStats(modelReports, "totalLatency", "apiCallCount"),
			tokensInPerCallStats: getStats(modelReports, "totalTokensIn", "apiCallCount"),
			tokensOutPerCallStats: getStats(modelReports, "totalTokensOut", "apiCallCount"),
		}
	}

	return summary
}

/**
 * 과업별 성능 요약 생성
 */
function generateTaskSummary(reports) {
	const summary = {}

	for (const task of TASKS) {
		const taskReports = reports.filter((r) => r.task === task)
		if (taskReports.length === 0) continue

		summary[task] = {
			totalExperiments: taskReports.length,
			caretReports: taskReports.filter((r) => r.agent === "caret").length,
			clineReports: taskReports.filter((r) => r.agent === "cline").length,
			proReports: taskReports.filter((r) => r.model === "gemini-2.5-pro-preview-06-05").length,
			flashReports: taskReports.filter((r) => r.model === "gemini-2.5-flash-preview-05-20").length,
		}
	}

	return summary
}

/**
 * 상세 비교 분석 생성
 */
function generateDetailedComparison(reports) {
	const comparison = {
		byTaskAndAgent: {},
		byTaskAndModel: {},
		byAgentAndModel: {},
	}

	// 과업 x 에이전트 비교
	for (const task of TASKS) {
		comparison.byTaskAndAgent[task] = {}
		for (const agent of AGENTS) {
			const filtered = reports.filter((r) => r.task === task && r.agent === agent)
			if (filtered.length > 0) {
				comparison.byTaskAndAgent[task][agent] = {
					experiments: filtered.length,
					costStats: getStats(filtered, "totalCost"),
					latencyStats: getStats(filtered, "totalLatency"),
					apiCallStats: getStats(filtered, "apiCallCount"),
					tokensInStats: getStats(filtered, "totalTokensIn"),
					tokensOutStats: getStats(filtered, "totalTokensOut"),
				}
			}
		}
	}

	// 과업 x 모델 비교
	for (const task of TASKS) {
		comparison.byTaskAndModel[task] = {}
		for (const model of MODELS) {
			const filtered = reports.filter((r) => r.task === task && r.model === model)
			if (filtered.length > 0) {
				comparison.byTaskAndModel[task][model] = {
					experiments: filtered.length,
					avgCost: filtered.reduce((sum, r) => sum + (r.totalCost || 0), 0) / filtered.length,
					avgLatency: filtered.reduce((sum, r) => sum + (r.totalLatency || 0), 0) / filtered.length,
					avgTokensIn: filtered.reduce((sum, r) => sum + (r.totalTokensIn || 0), 0) / filtered.length,
					avgTokensOut: filtered.reduce((sum, r) => sum + (r.totalTokensOut || 0), 0) / filtered.length,
					avgApiCalls: filtered.reduce((sum, r) => sum + (r.apiCallCount || 0), 0) / filtered.length,
				}
			}
		}
	}

	return comparison
}

/**
 * 데이터셋에서 이상치를 찾습니다.
 * @param {object[]} reports - 전체 리포트 배열
 * @param {string} key - 분석할 데이터 키
 * @param {string} label - 지표 라벨
 * @returns {string} 이상치에 대한 마크다운 텍스트
 */
function findOutliers(reports, groupByKeys, key, label) {
	const grouped = groupBy(reports, groupByKeys)
	let allOutliers = []

	for (const groupName in grouped) {
		const groupReports = grouped[groupName]
		if (groupReports.length < 3) continue // 최소 3개 이상 데이터가 있어야 통계적 의미가 있음

		const stats = getStats(groupReports, key)
		const threshold = stats.avg + 1.5 * stats.stdDev
		const outliers = groupReports.filter((r) => r[key] > threshold)

		allOutliers = allOutliers.concat(outliers.map((o) => ({ ...o, groupAvg: stats.avg })))
	}

	if (allOutliers.length === 0) {
		return `- ${label}: 특이한 이상치 없음.\n`
	}

	let outlierText = `- **${label} 이상치 발견:**\n`
	for (const outlier of allOutliers) {
		const val = outlier[key]
		const percentage = (((val - outlier.groupAvg) / outlier.groupAvg) * 100).toFixed(1)
		outlierText += `  - **${outlier.task} / ${outlier.agent} / ${outlier.modelInfo}**: ${val.toLocaleString()} (그룹 평균 대비 ${percentage}% 높음)\n`
	}
	return outlierText
}

/**
 * 데이터셋에서 이상치를 제거합니다.
 * @param {object[]} reports - 전체 리포트 배열
 * @param {string[]} groupByKeys - 그룹화 기준 키
 * @param {string} key - 분석할 데이터 키
 * @returns {object[]} 이상치가 제거된 리포트 배열
 */
function removeOutliers(reports, groupByKeys, key) {
	const grouped = groupBy(reports, groupByKeys)
	let cleanReports = []

	for (const groupName in grouped) {
		const groupReports = grouped[groupName]
		if (groupReports.length < 3) {
			cleanReports = cleanReports.concat(groupReports)
			continue
		}
		const stats = getStats(groupReports, key)
		const threshold = stats.avg + 1.5 * stats.stdDev
		const inliers = groupReports.filter((r) => r[key] <= threshold)
		cleanReports = cleanReports.concat(inliers)
	}
	return cleanReports
}

// --- 보고서 생성 함수들 ---

/**
 * 종합 마크다운 보고서 생성
 */
function createComprehensiveReport(reports, agentSummary, modelSummary, taskSummary, comparison) {
	const formatStats = (stats, prefix = "", suffix = "", decimals = 2) => {
		if (!stats || stats.values.length === 0) return "N/A"
		const avg = stats.avg.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
		const med = stats.median.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
		const std = stats.stdDev.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
		return `${prefix}${avg}${suffix} (중앙값: ${med}, σ: ${std})`
	}
	const totalExperiments = reports.length
	const completedTasks = Object.keys(taskSummary).length
	const incompleteTasks = TASKS.filter((task) => !taskSummary[task])

	let report = `# 🧪 AI 에이전트 성능 비교 실험 종합 보고서

> **실험 기간**: ${new Date().toLocaleDateString("ko-KR")}  
> **총 실험 수**: ${totalExperiments}회  
> **완료된 과업**: ${completedTasks}/${TASKS.length}개  

## 📊 실험 진행 현황

### 과업별 실험 현황
| 과업 | 총 실험 | Caret | Cline | Pro 모델 | Flash 모델 | 완료율 |
|---|---|---|---|---|---|---|
`

	for (const task of TASKS) {
		const summary = taskSummary[task]
		if (summary) {
			const completionRate = (
				((summary.caretReports + summary.clineReports) / (AGENTS.length * MODELS.length * 3)) *
				100
			).toFixed(1)
			report += `| ${task} | ${summary.totalExperiments} | ${summary.caretReports} | ${summary.clineReports} | ${summary.proReports} | ${summary.flashReports} | ${completionRate}% |\n`
		} else {
			report += `| ${task} | 0 | 0 | 0 | 0 | 0 | 0% |\n`
		}
	}

	if (incompleteTasks.length > 0) {
		report += `\n⚠️ **미완료 과업**: ${incompleteTasks.join(", ")}\n`
	}

	// 에이전트 비교
	report += `\n## 🤖 에이전트 성능 비교 (Caret vs Cline)

### 전체 성능 요약
| 지표 | Caret | Cline | 차이 (Caret - Cline) | 효율성 |
|---|---|---|---|---|
`

	const caretData = agentSummary["caret"] || {}
	const clineData = agentSummary["cline"] || {}

	const metrics = [
		{ key: "totalExperiments", label: "총 실험 수", formatter: (val) => `${val.toLocaleString()}회` },
		{ key: "totalApiCalls", label: "총 API 호출", formatter: (val) => `${val.toLocaleString()}회` },
		{ key: "costPerCallStats", label: "평균 비용/호출", formatter: (stats) => formatStats(stats, "$", "", 6) },
		{ key: "latencyPerCallStats", label: "평균 시간/호출", formatter: (stats) => formatStats(stats, "", "초", 0) },
		{ key: "tokensInPerCallStats", label: "평균 입력 토큰/호출", formatter: (stats) => formatStats(stats, "", " 토큰", 0) },
		{ key: "tokensOutPerCallStats", label: "평균 출력 토큰/호출", formatter: (stats) => formatStats(stats, "", " 토큰", 0) },
	]

	for (const metric of metrics) {
		if (metric.key === "totalExperiments") {
			const caretVal = caretData.totalExperiments || 0
			const clineVal = clineData.totalExperiments || 0
			const diff = caretVal - clineVal
			report += `| ${metric.label} | ${metric.formatter(caretVal)} | ${metric.formatter(clineVal)} | ${diff}회 | 🟡 동등 |\n`
			continue
		}

		const caretStat = caretData[metric.key]
		const clineStat = clineData[metric.key]

		const caretStr = metric.formatter(caretStat)
		const clineStr = metric.formatter(clineStat)

		const diff = (caretStat ? caretStat.avg : 0) - (clineStat ? clineStat.avg : 0)
		const diffPercentage = clineStat && clineStat.avg !== 0 ? ((diff / clineStat.avg) * 100).toFixed(1) : "N/A"

		const diffStr = `${diff > 0 ? "+" : ""}${diff.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${diffPercentage}%)`

		const effStr = diff < 0 ? "🟢 Caret 우수" : diff > 0 ? "🔴 Cline 우수" : "🟡 동등"

		report += `| ${metric.label} | ${caretStr} | ${clineStr} | ${diffStr} | ${effStr} |\n`
	}

	// 에이전트 비교 (Pro 모델 한정)
	report += `\n### Pro 모델 한정 성능 요약\n`
	report += `| 지표 | Caret | Cline | 차이 (Caret - Cline) | 효율성 |\n`
	report += `|---|---|---|---|---|\n`

	const proReports = reports.filter((r) => r.model === "gemini-2.5-pro-preview-06-05")
	const proAgentSummary = generateAgentSummary(proReports)
	const caretProData = proAgentSummary["caret"] || {}
	const clineProData = proAgentSummary["cline"] || {}

	for (const metric of metrics) {
		if (metric.key === "totalExperiments") {
			const caretVal = caretProData.totalExperiments || 0
			const clineVal = clineProData.totalExperiments || 0
			const diff = caretVal - clineVal
			report += `| ${metric.label} | ${metric.formatter(caretVal)} | ${metric.formatter(clineVal)} | ${diff}회 | 🟡 동등 |\n`
			continue
		}

		const caretStat = caretProData[metric.key]
		const clineStat = clineProData[metric.key]

		const caretStr = metric.formatter(caretStat)
		const clineStr = metric.formatter(clineStat)

		const diff = (caretStat ? caretStat.avg : 0) - (clineStat ? clineStat.avg : 0)
		const diffPercentage = clineStat && clineStat.avg !== 0 ? ((diff / clineStat.avg) * 100).toFixed(1) : "N/A"

		const diffStr = `${diff > 0 ? "+" : ""}${diff.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${diffPercentage}%)`

		const effStr = diff < 0 ? "🟢 Caret 우수" : diff > 0 ? "🔴 Cline 우수" : "🟡 동등"

		report += `| ${metric.label} | ${caretStr} | ${clineStr} | ${diffStr} | ${effStr} |\n`
	}

	// 모델 비교
	report += `\n## ⚡ 모델 성능 비교 (Pro vs Flash)

### 전체 성능 요약
| 지표 | Pro 모델 | Flash 모델 | 차이 (Pro - Flash) | 효율성 |
|---|---|---|---|---|
`

	const proData = modelSummary["gemini-2.5-pro-preview-06-05"] || {}
	const flashData = modelSummary["gemini-2.5-flash-preview-05-20"] || {}

	for (const metric of metrics) {
		if (metric.key === "totalExperiments") {
			const proVal = proData.totalExperiments || 0
			const flashVal = flashData.totalExperiments || 0
			const diff = proVal - flashVal
			report += `| ${metric.label} | ${metric.formatter(proVal)} | ${metric.formatter(flashVal)} | ${diff}회 | ${diff > 0 ? "🟢 Pro 우수" : "🔴 Flash 우수"} |\n`
			continue
		}

		const proStat = proData[metric.key]
		const flashStat = flashData[metric.key]

		const proStr = metric.formatter(proStat)
		const flashStr = metric.formatter(flashStat)

		const diff = (proStat ? proStat.avg : 0) - (flashStat ? flashStat.avg : 0)
		const diffPercentage = flashStat && flashStat.avg !== 0 ? ((diff / flashStat.avg) * 100).toFixed(1) : "N/A"

		const diffStr = `${diff > 0 ? "+" : ""}${diff.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${diffPercentage}%)`

		const effStr = diff < 0 ? "🟢 Pro 우수" : diff > 0 ? "🔴 Flash 우수" : "🟡 동등"

		report += `| ${metric.label} | ${proStr} | ${flashStr} | ${diffStr} | ${effStr} |\n`
	}

	// 과업별 상세 분석
	report += `\n## 📋 과업별 상세 성능 분석\n`

	for (const task of TASKS) {
		if (!taskSummary[task]) continue

		report += `\n### ${task.charAt(0).toUpperCase() + task.slice(1)} 과업\n\n`

		const taskAgentComparison = comparison.byTaskAndAgent[task] || {}
		const caretTaskData = taskAgentComparison["caret"]
		const clineTaskData = taskAgentComparison["cline"]

		if (caretTaskData && clineTaskData) {
			report += `| 지표 | Caret | Cline | 차이 | 우수 에이전트 |\n`
			report += `|---|---|---|---|---|\n`

			const taskMetrics = [
				{ key: "costStats", label: "비용", formatter: (stats) => formatStats(stats, "$", "", 6) },
				{ key: "latencyStats", label: "시간", formatter: (stats) => formatStats(stats, "", "초", 0) },
				{ key: "apiCallStats", label: "API 호출", formatter: (stats) => formatStats(stats, "", "회", 1) },
				{ key: "tokensInStats", label: "입력 토큰", formatter: (stats) => formatStats(stats, "", " 토큰", 0) },
				{ key: "tokensOutStats", label: "출력 토큰", formatter: (stats) => formatStats(stats, "", " 토큰", 0) },
			]

			for (const metric of taskMetrics) {
				const caretStat = caretTaskData[metric.key]
				const clineStat = clineTaskData[metric.key]

				const caretStr = metric.formatter(caretStat)
				const clineStr = metric.formatter(clineStat)

				const diff = (caretStat ? caretStat.avg : 0) - (clineStat ? clineStat.avg : 0)
				const diffPercentage = clineStat && clineStat.avg !== 0 ? ((diff / clineStat.avg) * 100).toFixed(1) : "N/A"

				const diffStr = `${diff > 0 ? "+" : ""}${diff.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${diffPercentage}%)`

				const betterAgent = diff < 0 ? "🟢 Caret" : diff > 0 ? "🔴 Cline" : "🟡 동등"

				report += `| ${metric.label} | ${caretStr} | ${clineStr} | ${diffStr} | ${betterAgent} |\n`
			}
		} else if (caretTaskData) {
			report += `🟢 **Caret만 완료** - 평균 비용: $${caretTaskData.avgCost.toFixed(6)}, 평균 시간: ${Math.round(caretTaskData.avgLatency)}초\n`
		} else if (clineTaskData) {
			report += `🔴 **Cline만 완료** - 평균 비용: $${clineTaskData.avgCost.toFixed(6)}, 평균 시간: ${Math.round(clineTaskData.avgLatency)}초\n`
		} else {
			report += `⚠️ **미완료 과업**\n`
		}
	}

	// 과업별 상세 분석 (Pro 모델 한정)
	report += `\n## 📋 과업별 상세 성능 분석 (Pro 모델 한정)\n`

	const proComparison = generateDetailedComparison(proReports)

	for (const task of TASKS) {
		if (!taskSummary[task]) continue

		const proTaskAgentComparison = proComparison.byTaskAndAgent[task] || {}
		if (Object.keys(proTaskAgentComparison).length < 2) continue

		report += `\n### ${task.charAt(0).toUpperCase() + task.slice(1)} 과업 (Pro 모델)\n\n`

		const caretTaskData = proTaskAgentComparison["caret"]
		const clineTaskData = proTaskAgentComparison["cline"]

		if (caretTaskData && clineTaskData) {
			report += `| 지표 | Caret | Cline | 차이 | 우수 에이전트 |\n`
			report += `|---|---|---|---|---|\n`

			const taskMetrics = [
				{ key: "costStats", label: "비용", formatter: (stats) => formatStats(stats, "$", "", 6) },
				{ key: "latencyStats", label: "시간", formatter: (stats) => formatStats(stats, "", "초", 0) },
				{ key: "apiCallStats", label: "API 호출", formatter: (stats) => formatStats(stats, "", "회", 1) },
				{ key: "tokensInStats", label: "입력 토큰", formatter: (stats) => formatStats(stats, "", " 토큰", 0) },
				{ key: "tokensOutStats", label: "출력 토큰", formatter: (stats) => formatStats(stats, "", " 토큰", 0) },
			]

			for (const metric of taskMetrics) {
				const caretStat = caretTaskData[metric.key]
				const clineStat = clineTaskData[metric.key]

				const caretStr = metric.formatter(caretStat)
				const clineStr = metric.formatter(clineStat)

				const diff = (caretStat ? caretStat.avg : 0) - (clineStat ? clineStat.avg : 0)
				const diffPercentage = clineStat && clineStat.avg !== 0 ? ((diff / clineStat.avg) * 100).toFixed(1) : "N/A"

				const diffStr = `${diff > 0 ? "+" : ""}${diff.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${diffPercentage}%)`

				const betterAgent = diff < 0 ? "🟢 Caret" : diff > 0 ? "🔴 Cline" : "🟡 동등"

				report += `| ${metric.label} | ${caretStr} | ${clineStr} | ${diffStr} | ${betterAgent} |\n`
			}
		}
	}

	// 이상치 분석
	report += `\n## 🔬 주요 이상치 분석 (그룹 평균 + 1.5 * σ 초과)\n`
	report += findOutliers(reports, ["task", "agent", "model"], "totalCost", "비용")
	report += findOutliers(reports, ["task", "agent", "model"], "totalLatency", "시간")
	report += findOutliers(reports, ["task", "agent", "model"], "totalTokensIn", "입력 토큰")

	// 이상치 제외 분석
	report += `\n## 📊 이상치 제외 성능 분석\n`

	// Caret vs Cline (Pro 모델, 이상치 제외)
	report += `\n### Caret vs Cline 비교 (Pro 모델, 이상치 제외)\n`
	report += `| 지표 | Caret | Cline | 차이 (Caret - Cline) | 효율성 |\n`
	report += `|---|---|---|---|---|\n`

	let cleanProCaret = proReports.filter((r) => r.agent === "caret")
	let cleanProCline = proReports.filter((r) => r.agent === "cline")

	const proMetricKeys = ["totalCost", "totalLatency", "apiCallCount", "totalTokensIn", "totalTokensOut"]

	for (const key of proMetricKeys) {
		cleanProCaret = removeOutliers(cleanProCaret, ["task", "model"], key)
		cleanProCline = removeOutliers(cleanProCline, ["task", "model"], key)
	}

	const cleanProAgentSummary = generateAgentSummary(cleanProCaret.concat(cleanProCline))
	const cleanCaretProData = cleanProAgentSummary["caret"] || {}
	const cleanClineProData = cleanProAgentSummary["cline"] || {}

	for (const metric of metrics) {
		if (metric.key === "totalExperiments") {
			report += `| 이상치 제외 실험 수 | ${cleanCaretProData.totalExperiments || 0}회 | ${cleanClineProData.totalExperiments || 0}회 | - | 🟡 동등 |\n`
			continue
		}
		const caretStat = cleanCaretProData[metric.key]
		const clineStat = cleanClineProData[metric.key]
		const caretStr = metric.formatter(caretStat)
		const clineStr = metric.formatter(clineStat)
		const diff = (caretStat ? caretStat.avg : 0) - (clineStat ? clineStat.avg : 0)
		const diffPercentage = clineStat && clineStat.avg !== 0 ? ((diff / clineStat.avg) * 100).toFixed(1) : "N/A"
		const diffStr = `${diff > 0 ? "+" : ""}${diff.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${diffPercentage}%)`
		const effStr = diff < 0 ? "🟢 Caret 우수" : diff > 0 ? "🔴 Cline 우수" : "🟡 동등"
		report += `| ${metric.label} | ${caretStr} | ${clineStr} | ${diffStr} | ${effStr} |\n`
	}

	// 주요 인사이트
	report += `\n## 🎯 주요 인사이트

### Caret vs Cline 비교
`

	if (caretData.totalExperiments && clineData.totalExperiments) {
		const costDiff = caretData.costPerCallStats.avg - clineData.costPerCallStats.avg
		const timeDiff = caretData.latencyPerCallStats.avg - clineData.latencyPerCallStats.avg

		if (costDiff < 0) {
			report += `- 💰 **비용 효율성**: Caret이 API 호출당 평균 $${Math.abs(costDiff).toFixed(6)} 더 저렴합니다.\n`
		} else {
			report += `- 💰 **비용 효율성**: Cline이 API 호출당 평균 $${Math.abs(costDiff).toFixed(6)} 더 저렴합니다.\n`
		}

		if (timeDiff < 0) {
			report += `- ⏱️ **실행 속도**: Caret이 API 호출당 평균 ${Math.abs(timeDiff).toFixed(2)}초 더 빠릅니다.\n`
		} else {
			report += `- ⏱️ **실행 속도**: Cline이 API 호출당 평균 ${Math.abs(timeDiff).toFixed(2)}초 더 빠릅니다.\n`
		}
	}

	report += `
### Pro vs Flash 모델 비교
`

	if (proData.totalExperiments && flashData.totalExperiments) {
		const modelCostDiff = proData.costPerCallStats.avg - flashData.costPerCallStats.avg
		const modelTimeDiff = proData.latencyPerCallStats.avg - flashData.latencyPerCallStats.avg

		if (modelCostDiff < 0) {
			report += `- 💰 **비용 효율성**: Pro 모델이 API 호출당 평균 $${Math.abs(modelCostDiff).toFixed(6)} 더 저렴합니다.\n`
		} else {
			report += `- 💰 **비용 효율성**: Flash 모델이 API 호출당 평균 $${Math.abs(modelCostDiff).toFixed(6)} 더 저렴합니다.\n`
		}

		if (modelTimeDiff < 0) {
			report += `- ⏱️ **실행 속도**: Pro 모델이 API 호출당 평균 ${Math.abs(modelTimeDiff).toFixed(2)}초 더 빠릅니다.\n`
		} else {
			report += `- ⏱️ **실행 속도**: Flash 모델이 API 호출당 평균 ${Math.abs(modelTimeDiff).toFixed(2)}초 더 빠릅니다.\n`
		}
	}

	report += `
### 권장사항
- 🎯 **가장 효율적인 조합**: [데이터 분석 결과에 따라 권장]
- 📈 **성능 개선 포인트**: [주요 개선 영역 식별]
- 🔄 **추가 실험 필요 영역**: ${incompleteTasks.length > 0 ? incompleteTasks.join(", ") : "모든 과업 완료"}

---

**보고서 생성 시간**: ${new Date().toISOString()}  
**분석된 실험 수**: ${totalExperiments}개  
**실험 기간**: ${reports.length > 0 ? reports[0].date : "N/A"}
`

	return report
}

// --- 메인 함수 ---

function main() {
	console.log("🧪 AI 에이전트 성능 비교 실험 종합 보고서 생성 중...")

	// 모든 보고서 수집
	const allReports = collectAllReports()
	console.log(`📊 총 ${allReports.length}개 실험 보고서를 수집했습니다.`)

	// 디버깅: 수집된 보고서 정보 출력
	console.log("🔍 수집된 보고서들:")
	allReports.forEach((report, index) => {
		console.log(`  ${index + 1}. ${report.task} - ${report.agent} - ${report.model} (${report.reportFile})`)
	})

	if (allReports.length === 0) {
		console.error("❌ 분석할 실험 보고서가 없습니다.")
		process.exit(1)
	}

	// 분석 수행
	const agentSummary = generateAgentSummary(allReports)
	const modelSummary = generateModelSummary(allReports)
	const taskSummary = generateTaskSummary(allReports)
	const comparison = generateDetailedComparison(allReports)

	// 종합 보고서 생성
	const comprehensiveReport = createComprehensiveReport(allReports, agentSummary, modelSummary, taskSummary, comparison)

	// 보고서 저장
	const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "")
	const outputPath = path.join(REPORT_PATH, `comprehensive-performance-report-${timestamp}.md`)

	fs.writeFileSync(outputPath, comprehensiveReport, "utf-8")

	console.log(`✅ 종합 보고서가 생성되었습니다: ${outputPath}`)
	console.log(`📈 분석 완료:`)
	console.log(`   - 총 실험: ${allReports.length}개`)
	console.log(`   - Caret 실험: ${allReports.filter((r) => r.agent === "caret").length}개`)
	console.log(`   - Cline 실험: ${allReports.filter((r) => r.agent === "cline").length}개`)
	console.log(`   - 완료된 과업: ${Object.keys(taskSummary).length}/${TASKS.length}개`)

	return outputPath
}

if (require.main === module) {
	main()
}

module.exports = { main, collectAllReports, parseReportFile }
