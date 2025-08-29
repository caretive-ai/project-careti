const fs = require("fs")
const path = require("path")

// --- 설정 ---
// 로그 파일이 저장된 기본 경로
const LOG_BASE_PATH = path.join(process.env.APPDATA, "Code", "User", "globalStorage", "caretive.caret", "tasks")
// 보고서를 저장할 현재 경로
const REPORT_PATH = __dirname

// --- 함수 ---

/**
 * 지정된 디렉토리에서 가장 최근의 태스크 폴더를 찾습니다.
 * 실험은 일반적으로 하나의 태스크 폴더에서 수행되므로, 가장 최근 것을 사용합니다.
 * @param {string} experimentPath - 실험 관련 파일이 있는 경로 (스크립트 실행 위치 기준)
 * @returns {string | null} 가장 최근 태스크 폴더의 전체 경로 또는 null
 */
function getLatestTaskDir(experimentPath) {
	if (!fs.existsSync(LOG_BASE_PATH)) {
		console.error(`로그 디렉토리를 찾을 수 없습니다: ${LOG_BASE_PATH}`)
		return null
	}
	const allTaskDirs = fs
		.readdirSync(LOG_BASE_PATH, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name)
		.sort((a, b) => b.localeCompare(a)) // 최신순으로 정렬

	if (allTaskDirs.length === 0) {
		console.error("처리할 태스크 로그 폴더가 없습니다.")
		return null
	}
	// 가장 최근 태스크 폴더를 반환
	return path.join(LOG_BASE_PATH, allTaskDirs[0])
}

/**
 * 로컬 로그 파일에서 데이터를 분석합니다 (마크다운 형식)
 * @param {string} logFilePath - 로그 파일 경로
 * @returns {object | null} 추출된 성능 데이터 또는 null
 */
function parseMarkdownLogFile(logFilePath) {
	if (!fs.existsSync(logFilePath)) {
		console.error(`로그 파일을 찾을 수 없습니다: ${logFilePath}`)
		return null
	}

	try {
		const logContent = fs.readFileSync(logFilePath, "utf-8")
		const lines = logContent.split("\n")

		let systemPromptInfo = null
		let modeCheckLogs = []
		let apiCallCount = 0
		let totalTokensIn = 0
		let totalTokensOut = 0
		let totalCachedTokens = 0 // 캐시된 토큰 수 추가
		let totalCost = 0
		let timestamps = []

		// 로그 라인별 분석
		lines.forEach((line) => {
			// 타임스탬프 추출
			const timestampMatch = line.match(/\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\]/)
			if (timestampMatch) {
				timestamps.push(new Date(timestampMatch[1]).getTime())
			}

			// 모드 체크 로그 수집
			if (line.includes("[MODE_CHECK]") || line.includes("[MODE-CHECK-")) {
				modeCheckLogs.push(line)
			}

			// 시스템 프롬프트 정보 추출
			if (line.includes("[PROMPT-USAGE]") && !systemPromptInfo) {
				// 길이와 토큰 추출
				const lengthMatch = line.match(/길이: ([\d,]+) chars/)
				const tokenMatch = line.match(/토큰: ~(\d+)/)
				const modelMatch = line.match(/모델: ([^\s]+)/)

				if (lengthMatch && tokenMatch) {
					const length = parseInt(lengthMatch[1].replace(/,/g, ""))
					const tokens = parseInt(tokenMatch[1])
					const model = modelMatch ? modelMatch[1] : "unknown"

					// 모드 판별
					const isCaretMode = line.includes("CARET 모드")
					const isClineMode = line.includes("CLINE 모드")

					systemPromptInfo = {
						length,
						wordCount: Math.floor(length / 5), // 추정
						approxTokens: tokens,
						mode: isCaretMode ? "caret" : isClineMode ? "cline" : "unknown",

						preview: isCaretMode ? "Caret JSON system prompt..." : "Cline system prompt...",
					}
				}
			}
		})

		// 타임스탬프에서 실행 시간 계산
		let startTime = 0,
			endTime = 0,
			totalLatency = 0
		if (timestamps.length > 0) {
			startTime = Math.min(...timestamps)
			endTime = Math.max(...timestamps)
			totalLatency = endTime - startTime
		}

		// 실제 API 호출 및 토큰 데이터 추출
		lines.forEach((line) => {
			// 실제 API 응답에서 토큰 정보 추출
			if (line.includes("[API_RESPONSE]")) {
				const tokenInMatch = line.match(/inputTokens?:\s*(\d+)/)
				const tokenOutMatch = line.match(/outputTokens?:\s*(\d+)/)
				// CARET MODIFICATION: 실제 캐시 필드명으로 수정
				const cacheWritesMatch = line.match(/cacheWrites:\s*(\d+)/)
				const cacheReadsMatch = line.match(/cacheReads:\s*(\d+)/)
				const costMatch = line.match(/cost:\s*\$?([\d.]+)/)

				if (tokenInMatch) totalTokensIn += parseInt(tokenInMatch[1])
				if (tokenOutMatch) totalTokensOut += parseInt(tokenOutMatch[1])
				if (cacheWritesMatch) totalCachedTokens += parseInt(cacheWritesMatch[1])
				if (cacheReadsMatch) totalCachedTokens += parseInt(cacheReadsMatch[1])
				if (costMatch) totalCost += parseFloat(costMatch[1])

				apiCallCount++
			}
		})

		// 실제 세션 모드 확인
		let actualMode = "unknown"
		let actualSessionType = "unknown"
		if (systemPromptInfo) {
			actualMode = systemPromptInfo.mode
		} else {
			// 로그에서 모드 정보 추출
			const caretModeMatch = logContent.match(/\[SESSION_START\].*mode:\s*"?caret"?/i)
			const clineModeMatch = logContent.match(/\[SESSION_START\].*mode:\s*"?cline"?/i)
			if (caretModeMatch) actualMode = "caret"
			else if (clineModeMatch) actualMode = "cline"

			// 로그에서 세션 타입 정보 추출
			const newSessionMatch = logContent.match(/\[SESSION_START\].*type:\s*"?new"?/i)
			const restoreSessionMatch = logContent.match(/\[SESSION_START\].*type:\s*"?restore"?/i)
			if (newSessionMatch) actualSessionType = "new"
			else if (restoreSessionMatch) actualSessionType = "restore"
		}

		// 시스템 프롬프트 정보에 실제 모드 반영
		if (systemPromptInfo) {
			systemPromptInfo.mode = actualMode
		}

		return {
			totalTokensIn,
			totalTokensOut,
			totalCachedTokens, // 캐시된 토큰 수 추가
			totalCost,
			apiCallCount,
			startTime,
			endTime,
			totalLatency,
			systemPromptInfo,
			modeCheckLogs,
			actualMode, // 실제 세션 모드 추가
			actualSessionType, // 실제 세션 타입 추가
		}
	} catch (error) {
		console.error(`로그 파일 파싱 중 오류 발생: ${logFilePath}`, error)
		return null
	}
}

/**
 * 태스크 로그 파일을 읽고 성능 데이터를 추출합니다.
 * @param {string} taskDir - 분석할 태스크 폴더의 전체 경로
 * @returns {object | null} 추출된 성능 데이터 또는 null
 */
function parseLogFiles(taskDir) {
	const uiMessagesPath = path.join(taskDir, "ui_messages.json")
	const metadataPath = path.join(taskDir, "task_metadata.json")

	if (!fs.existsSync(uiMessagesPath) || !fs.existsSync(metadataPath)) {
		console.error(`필요한 로그 파일이 없습니다: ${taskDir}`)
		return null
	}

	try {
		const uiMessages = JSON.parse(fs.readFileSync(uiMessagesPath, "utf-8"))
		const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"))

		let totalTokensIn = 0
		let totalTokensOut = 0
		let totalCachedTokens = 0 // 캐시된 토큰 수 추가
		let totalCost = 0
		let apiCallCount = 0
		// CARET MODIFICATION: 시스템 프롬프트 검증을 위한 변수 추가
		let systemPromptInfo = null
		let modeCheckLogs = []
		let actualMode = "unknown" // 실제 세션 모드
		let actualSessionType = "unknown" // 실제 세션 타입

		uiMessages.forEach((msg) => {
			if (msg.type === "say" && msg.say === "api_req_started") {
				try {
					const apiData = JSON.parse(msg.text)
					totalTokensIn += apiData.tokensIn || 0
					totalTokensOut += apiData.tokensOut || 0
					// CARET MODIFICATION: 실제 캐시 필드명 수정 (cacheWrites + cacheReads)
					totalCachedTokens += (apiData.cacheWrites || 0) + (apiData.cacheReads || 0)
					totalCost += apiData.cost || 0
					apiCallCount++

					// 세션 모드 정보 추출 (첫 번째 API 호출에서)
					if (actualMode === "unknown" && apiData.sessionMode) {
						actualMode = apiData.sessionMode
					}

					// 세션 타입 정보 추출 (첫 번째 API 호출에서)
					if (actualSessionType === "unknown" && apiData.sessionType) {
						actualSessionType = apiData.sessionType
					}

					// CARET MODIFICATION: 향상된 시스템 프롬프트 정보 추출
					if (!systemPromptInfo) {
						// 새로운 로그 구조에서 시스템 프롬프트 정보 추출 (우선순위 1)
						if (apiData.systemPromptInfo) {
							systemPromptInfo = {
								length: apiData.systemPromptInfo.length,
								wordCount: apiData.systemPromptInfo.wordCount,
								approxTokens:
									apiData.systemPromptInfo.estimatedTokens ||
									Math.ceil(apiData.systemPromptInfo.wordCount * 1.33),
								preview: apiData.systemPromptInfo.preview,
								mode: apiData.systemPromptInfo.mode || "unknown", // CARET MODIFICATION: 모드 정보 추가
							}
						}
						// 기존 방식으로 폴백 (우선순위 2)
						else if (apiData.messages && apiData.messages.length > 0) {
							const systemMessage = apiData.messages.find((m) => m.role === "system")
							if (systemMessage && systemMessage.content) {
								const content = systemMessage.content
								systemPromptInfo = {
									length: content.length,
									wordCount: content.split(/\s+/).length,
									approxTokens: Math.ceil(content.split(/\s+/).length * 1.33),
									preview: content.substring(0, 200) + "...",
									mode: "unknown", // CARET MODIFICATION: 모드 정보 기본값
								}
							}
						}
						// 레거시 구조로 폴백 (우선순위 3)
						else if (apiData.request && apiData.request.messages) {
							const systemMessage = apiData.request.messages.find((m) => m.role === "system")
							if (systemMessage && systemMessage.content) {
								const content = systemMessage.content
								systemPromptInfo = {
									length: content.length,
									wordCount: content.split(/\s+/).length,
									approxTokens: Math.ceil(content.split(/\s+/).length * 1.33),
									preview: content.substring(0, 200) + "...",
									mode: "unknown", // CARET MODIFICATION: 모드 정보 기본값
								}
							}
						}
					}
				} catch (e) {
					// text에 JSON이 아닌 다른 내용이 있을 수 있으므로 오류는 무시
				}
			}

			// CARET MODIFICATION: 모드 체크 로그 추출
			if (msg.type === "say" && msg.say === "completion_result") {
				if (msg.text.includes("[MODE-CHECK-")) {
					modeCheckLogs.push(msg.text)
				}
			}
		})

		const timestamps = metadata.files_in_context.map((f) => f.cline_read_date).filter(Boolean)
		let startTime = 0,
			endTime = 0,
			totalLatency = 0
		if (timestamps.length > 0) {
			startTime = Math.min(...timestamps)
			endTime = Math.max(...timestamps)
			totalLatency = endTime - startTime
		}

		// 시스템 프롬프트 정보에 실제 모드 반영
		if (systemPromptInfo && actualMode !== "unknown") {
			systemPromptInfo.mode = actualMode
		}

		return {
			totalTokensIn,
			totalTokensOut,
			totalCachedTokens, // 캐시된 토큰 수 추가
			totalCost,
			apiCallCount,
			startTime,
			endTime,
			totalLatency,
			// CARET MODIFICATION: 시스템 프롬프트 정보 추가
			systemPromptInfo,
			modeCheckLogs,
			actualMode, // 실제 세션 모드 추가
			actualSessionType, // 실제 세션 타입 추가
		}
	} catch (error) {
		console.error(`로그 파일 파싱 중 오류 발생: ${taskDir}`, error)
		return null
	}
}

/**
 * 실제 성능 데이터 기반으로 동적 분석 생성
 */
function generateDynamicAnalysis(data, agentName) {
	if (!data.systemPromptInfo) {
		return "⚠️ 시스템 프롬프트 정보를 찾을 수 없습니다."
	}

	const info = data.systemPromptInfo

	return `**토큰 효율성:**
- 문자당 토큰 비율: ${(info.approxTokens / info.length).toFixed(3)}
- 단어당 토큰 비율: ${(info.approxTokens / info.wordCount).toFixed(3)}`
}

/**
 * 추출된 데이터를 마크다운 보고서 형식으로 만듭니다.
 * @param {string} experimentName - 실험 주제 이름
 * @param {string} agentName - AI 에이전트 이름
 * @param {object} data - parseLogFiles에서 반환된 데이터
 * @returns {string} 마크다운 형식의 보고서 문자열
 */
function createMarkdownReport(experimentName, agentName, data) {
	const executionPeriod =
		data.startTime && data.endTime
			? `${new Date(data.startTime).toLocaleString("ko-KR")} ~ ${new Date(data.endTime).toLocaleString("ko-KR")}`
			: "N/A"

	// CARET MODIFICATION: 호출당 평균 계산
	const avgTokensPerCall =
		data.apiCallCount > 0 ? Math.round((data.totalTokensIn + data.totalTokensOut) / data.apiCallCount) : 0
	const avgCostPerCall = data.apiCallCount > 0 ? data.totalCost / data.apiCallCount : 0

	// CARET MODIFICATION: 실제 데이터 기반 시스템 프롬프트 정보 분석
	const systemPromptAnalysis = data.systemPromptInfo
		? `
## 🔍 시스템 프롬프트 검증

| 항목 | 결과 |
|---|---|
| **실행 모드** | \`${data.actualMode || data.systemPromptInfo.mode || "unknown"}\` |
| **프롬프트 길이** | ${data.systemPromptInfo.length.toLocaleString()} 문자 |
| **단어 수** | ${data.systemPromptInfo.wordCount.toLocaleString()} 개 |
| **측정된 토큰 수** | ${data.systemPromptInfo.approxTokens.toLocaleString()} 개 |

${generateDynamicAnalysis(data, agentName)}

### 시스템 프롬프트 미리보기
\`\`\`
${data.systemPromptInfo.preview}
\`\`\`
`
		: "⚠️ 시스템 프롬프트 정보를 찾을 수 없습니다."

	const modeCheckAnalysis =
		data.modeCheckLogs && data.modeCheckLogs.length > 0
			? `
## 🔧 모드 체크 로그

${data.modeCheckLogs
	.slice(0, 5)
	.map((log) => `- ${log.substring(0, 120)}...`)
	.join("\n")}
${data.modeCheckLogs.length > 5 ? `\n... 및 ${data.modeCheckLogs.length - 5}개 추가 로그` : ""}
`
			: ""

	return `# [${experimentName}] ${agentName} 성능 테스트 보고서

## 요약

| 측정 지표 | 결과 |
|---|---|
| **총 입력 토큰** | ${data.totalTokensIn.toLocaleString()} |
| **총 출력 토큰** | ${data.totalTokensOut.toLocaleString()} |
| **캐시된 토큰** | ${data.totalCachedTokens?.toLocaleString() || 0} |
| **총 API 비용** | $${data.totalCost.toFixed(6)} |
| **API 호출 횟수** | ${data.apiCallCount}회 |
| **평균 토큰/호출** | ${avgTokensPerCall.toLocaleString()} 토큰/호출 |
| **평균 비용/호출** | $${avgCostPerCall.toFixed(6)}/호출 |
| **총 실행 시간** | ${Math.round(data.totalLatency / 1000)}초 (${data.totalLatency}ms) |
| **실행 기간** | ${executionPeriod} |
| **실제 세션 모드** | ${data.actualMode || "unknown"} |
| **실제 세션 타입** | ${data.actualSessionType || "unknown"} |

${systemPromptAnalysis}

${modeCheckAnalysis}

## 세부 정보

- **로그 폴더:** ${path.basename(getLatestTaskDir(REPORT_PATH)) || "Unknown"}
- **보고서 생성 시간:** ${new Date().toISOString()}
`
}

// --- 메인 로직 ---

function main() {
	const args = process.argv.slice(2)
	if (args.length !== 2) {
		console.error("사용법: node generate-report.js <실험주제> <AI에이전트명>")
		console.error("예시: node generate-report.js calculator caret-gemini2.5-pro-preview-06-05-tink1024-1")
		process.exit(1)
	}

	const [experimentName, agentName] = args
	console.log(`'${experimentName}' 실험에 대한 '${agentName}' 에이전트의 보고서를 생성합니다...`)

	let data = null

	// 우선적으로 실제 세션 로그 (JSON) 사용
	const latestTaskDir = getLatestTaskDir(path.join(REPORT_PATH, experimentName, agentName))
	if (latestTaskDir) {
		console.log(`실제 세션 로그 분석: ${latestTaskDir}`)
		data = parseLogFiles(latestTaskDir)
	}

	// 세션 로그가 없으면 로컬 마크다운 로그를 폴백으로 사용
	if (!data) {
		const localLogPath = path.join(REPORT_PATH, experimentName, `${agentName.split("-")[0]}.log.md`)
		if (fs.existsSync(localLogPath)) {
			console.warn(`⚠️ 실제 세션 로그를 찾을 수 없어 추정값 기반 로그를 사용: ${localLogPath}`)
			data = parseMarkdownLogFile(localLogPath)
		} else {
			console.error("실제 세션 로그와 로컬 로그 모두 찾을 수 없습니다.")
			process.exit(1)
		}
	}

	if (!data) {
		console.error("로그 데이터를 파싱할 수 없습니다.")
		process.exit(1)
	}

	const reportContent = createMarkdownReport(experimentName, agentName, data)
	const outputPath = path.join(
		REPORT_PATH,
		experimentName,
		`${agentName}-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-report.md`,
	)

	// 출력 디렉토리가 없으면 생성
	const outputDir = path.dirname(outputPath)
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true })
	}

	fs.writeFileSync(outputPath, reportContent, "utf-8")
	console.log(`보고서가 생성되었습니다: ${outputPath}`)
}

if (require.main === module) {
	main()
}
