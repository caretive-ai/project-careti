# Caret 로깅 시스템 가이드

## 1. 개요

이 문서는 Caret의 로깅 시스템을 설명합니다. **2025년 1월 업데이트**: Caret은 표준 Cline Logger를 사용합니다. 백엔드 CaretLogger는 제거되었습니다.

### 1.1 주요 특징

- **표준 Cline Logger 사용**: 모든 백엔드 로깅은 `src/services/logging/Logger.ts`의 표준 Cline Logger를 사용
- **VSCode 출력 채널**: `HostProvider`를 통한 안정적인 출력 채널 관리
- **오류 보고**: `errorService`를 통한 원격 오류 로깅
- **웹뷰 전용**: 웹뷰에서만 `CaretWebviewLogger` 사용

## 2. 로깅 구조

### 2.1 로그 레벨

```typescript
// 웹뷰 전용 로그 레벨
export enum LogLevel {
	DEBUG = "debug",
	INFO = "info",
	WARN = "warn",
	ERROR = "error",
}
```

### 2.2 로그 포맷

```typescript
export interface LogEntry {
	timestamp: string
	level: LogLevel
	component: string
	message: string
	data?: any
}
```

## 3. Backend 로깅 (표준 Cline Logger)

### 3.1 표준 Logger 사용

**위치**: `src/services/logging/Logger.ts`

Caret의 모든 백엔드 로깅은 표준 Cline Logger를 사용합니다. 이 로거는 `HostProvider`를 통해 VSCode 출력 채널에 로그를 기록하며, `errorService`를 통해 오류를 원격으로 보고합니다.

```typescript
// src/services/logging/Logger.ts
import { HostProvider } from "@/hosts/host-provider"
import { errorService } from "../posthog/PostHogClientProvider"

/**
 * Simple logging utility for the extension's backend code.
 */
export class Logger {
	public readonly channelName = "Cline Dev Logger"
	static error(message: string, error?: Error) {
		Logger.#output("ERROR", message, error)
		errorService.logMessage(message, "error")
		error && errorService.logException(error)
	}
	static warn(message: string) {
		Logger.#output("WARN", message)
		errorService.logMessage(message, "warning")
	}
	static log(message: string) {
		Logger.#output("LOG", message)
	}
	static debug(message: string) {
		Logger.#output("DEBUG", message)
	}
	static info(message: string) {
		Logger.#output("INFO", message)
	}
	static trace(message: string) {
		Logger.#output("TRACE", message)
	}
	static #output(level: string, message: string, error?: Error) {
		let fullMessage = message
		if (error?.message) {
			fullMessage += ` ${error.message}`
		}
		HostProvider.get().logToChannel(`${level} ${fullMessage}`)
		if (error?.stack) {
			console.log(`Stack trace:\n${error.stack}`)
		}
	}
}
```

### 3.2 사용 예시

표준 Cline `Logger` 클래스의 정적 메서드를 직접 호출하여 사용합니다.

```typescript
import { Logger } from "@/services/logging/Logger"

// 로그 레벨별 사용 예시
Logger.info("컴포넌트가 초기화되었습니다.")
Logger.debug("개발 중에만 유용한 상세 정보입니다.")
Logger.warn("API 응답에 예상치 못한 필드가 포함되어 있습니다.")
Logger.error("파일을 읽는 중 오류가 발생했습니다.", new Error("File not found"))
```

### 3.3 개발 가이드라인

- ✅ **DO**: 백엔드에서는 `import { Logger } from "@services/logging/Logger"`를 사용
- ❌ **DON'T**: `caret-logger` 또는 `CaretLogger` 사용 금지 (제거됨)
- ✅ **DO**: 웹뷰에서는 `CaretWebviewLogger` 사용 가능

## 4. 세션 로그 시스템 ⭐ 새로 추가됨

### 4.1 개요

Caret에는 **디버그 로그**와 별도로 **세션 로그** 시스템이 있습니다. 이는 실제 사용자 활동을 기록하고 성능 분석에 사용됩니다.

### 4.2 세션 로그 vs 디버그 로그 차이점

| 구분       | 디버그 로그                     | 세션 로그                                                                 |
| ---------- | ------------------------------- | ------------------------------------------------------------------------- |
| **목적**   | 개발자 디버깅, 문제 해결        | 실제 사용자 활동 기록, 성능 측정                                          |
| **위치**   | CaretLogger, CaretWebviewLogger      | 각 taskId별 디렉토리                                                      |
| **파일들** | 로그 출력 채널                  | `ui_messages.json`, `api_conversation_history.json`, `task_metadata.json` |
| **내용**   | "세션 시작됨", "설정 변경됨" 등 | 토큰 사용량, 비용, 캐시 히트, 실제 대화 내용                              |

### 4.3 세션 로그 구조

#### 세션 로그 저장 위치

```
%APPDATA%\Code\User\globalStorage\caretive.caret\tasks\{timestamp}\
├── ui_messages.json           # UI 메시지 내역 (ClineMessage[])
├── api_conversation_history.json  # 실제 API 대화 내역
└── task_metadata.json        # 태스크 메타데이터
```

#### `ui_messages.json` 구조 (핵심 데이터)

```json
[
  {
    "ts": 1707000000000,
    "type": "say",
    "say": "api_req_started",
    "text": "{
      \"request\":\"사용자 요청 내용\",
      \"tokensIn\":150,
      \"tokensOut\":300,
      \"cachedTokens\":75,
      \"cost\":0.008,
      \"sessionMode\":\"caret\",
      \"sessionType\":\"new\",
      \"systemPromptInfo\":{
        \"length\":5000,
        \"wordCount\":1200,
        \"preview\":\"시스템 프롬프트 미리보기...\",
        \"isCaretJson\":true,
        \"isTrueCline\":false,
        \"estimatedTokens\":1600,
        \"mode\":\"caret\"
      }
    }"
  }
]
```

### 4.4 세션 로그 기록 구현

#### 백엔드 구현 위치

**파일**: `src/core/task/index.ts` - `recursivelyMakeClineRequests()` 메서드

```typescript
// 4764-4766라인: api_req_started 메시지에 세션 정보 기록
const lastApiReqIndex = findLastIndex(this.clineMessages, (m) => m.say === "api_req_started")

// CARET MODIFICATION: 세션 모드 정보를 실제 세션로그에 기록
const sessionMode = this.chatSettings.modeSystem || "unknown"
const sessionType = this.clineMessages.some((m) => m.say === "api_req_started") ? "continuing" : "new"

this.clineMessages[lastApiReqIndex].text = JSON.stringify({
	request: userContent.map((block) => formatContentBlockToMarkdown(block)).join("\n\n"),
	sessionMode, // 🆕 추가: 세션 모드 (caret/cline)
	sessionType, // 🆕 추가: 세션 타입 (new/continuing)
	// ... 기타 토큰 사용량, 비용 정보
} satisfies ClineApiReqInfo)
```

#### 타입 정의

**파일**: `src/shared/ExtensionMessage.ts` - `ClineApiReqInfo` 인터페이스

```typescript
interface ClineApiReqInfo {
	request: string
	// ... 기존 필드들
	// CARET MODIFICATION: 실제 세션 정보 추가 (generate-report.js가 읽는 정보)
	sessionMode?: string // 🆕 세션 모드 (caret/cline)
	sessionType?: string // 🆕 세션 타입 (new/continuing)
}
```

### 4.5 세션 로그 활용

#### 성능 분석 스크립트

세션 로그는 `generate-report.js` 등의 성능 분석 도구에서 활용됩니다:

```javascript
// 실제 세션 데이터에서 정보 추출
const uiMessages = JSON.parse(fs.readFileSync("ui_messages.json", "utf-8"))
const apiRequests = uiMessages.filter((msg) => msg.say === "api_req_started").map((msg) => JSON.parse(msg.text))

// 실제 토큰 사용량, 세션 모드 등 분석
const totalTokensIn = apiRequests.reduce((sum, req) => sum + (req.tokensIn || 0), 0)
const sessionMode = apiRequests[0]?.sessionMode || "unknown"
const sessionType = apiRequests[0]?.sessionType || "unknown"
```

#### 개발자 디버깅

```bash
# 최근 세션 로그 확인
cd "%APPDATA%\Code\User\globalStorage\caretive.caret\tasks"
dir | Sort-Object LastWriteTime -Descending | Select-Object -First 5

# 특정 세션의 api_req_started 메시지 확인
Select-String -Path "ui_messages.json" -Pattern "api_req_started" -Context 0,5
```

## 5. Frontend 로깅 (webview-ui)

### 5.1 CaretWebviewLogger 클래스

**실제 구현 위치**: `webview-ui/src/caret/utils/CaretWebviewLogger.ts`

Caret 웹뷰에서는 `CaretWebviewLogger` 클래스를 표준 로거로 사용합니다.

주요 기능:

- 로그 메시지를 브라우저 콘솔과 VSCode 확장 기능(Extension Host) 양쪽으로 전송
- `LogLevel` 열거형 (DEBUG, INFO, WARN, ERROR)을 사용하여 로그 레벨 관리
- 개발 모드(`import.meta.env.MODE !== 'production'`)에서만 `DEBUG` 레벨 로그 처리

**참고:** Vite 환경 변수를 TypeScript에서 사용하려면 `webview-ui/src/vite-env.d.ts` 파일이 필요합니다:

```typescript
/// <reference types="vite/client" />
```

### 5.2 CaretWebviewLogger 실제 구현

```typescript
import { vscode } from "../utils/vscode"

interface LogEntry {
	timestamp: string
	level: LogLevel
	component: string
	message: string
	data?: any
}

export enum LogLevel {
	DEBUG = "debug",
	INFO = "info",
	WARN = "warn",
	ERROR = "error",
}

class CaretWebviewLogger {
	private component: string
	private isDev: boolean

	constructor(component: string) {
		this.component = component
		this.isDev = import.meta.env.MODE !== "production"
	}

	private log(level: LogLevel, message: string, data?: any): void {
		// 개발 모드가 아니면 DEBUG 레벨 로그는 처리하지 않음
		if (level === LogLevel.DEBUG && !this.isDev) {
			return
		}

		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			component: this.component,
			message,
			data,
		}

		// 브라우저 콘솔에 로그 출력
		switch (level) {
			case LogLevel.DEBUG:
				console.debug(`[${this.component}] ${message}`, data || "")
				break
			case LogLevel.INFO:
				console.info(`[${this.component}] ${message}`, data || "")
				break
			case LogLevel.WARN:
				console.warn(`[${this.component}] ${message}`, data || "")
				break
			case LogLevel.ERROR:
				console.error(`[${this.component}] ${message}`, data || "")
				break
		}

		// Extension Host로 로그 전송
		vscode.postMessage({
			type: "log",
			entry,
		})
	}

	debug(message: string, data?: any): void {
		this.log(LogLevel.DEBUG, message, data)
	}

	info(message: string, data?: any): void {
		this.log(LogLevel.INFO, message, data)
	}

	warn(message: string, data?: any): void {
		this.log(LogLevel.WARN, message, data)
	}

	error(message: string, data?: any): void {
		this.log(LogLevel.ERROR, message, data)
	}
}

export default CaretWebviewLogger

// Named export for convenience
export const caretWebviewLogger = new CaretWebviewLogger("Caret")
```

### 5.3 사용 예시

```typescript
import CaretWebviewLogger, { LogLevel } from "@/caret/utils/CaretWebviewLogger"

// CaretWebviewLogger 인스턴스 생성 (React 컴포넌트 내부)
const logger = new CaretWebviewLogger("MyWebviewComponent")

// 로그 출력
logger.info("컴포넌트가 마운트되었습니다.")
logger.debug("개발 중에만 보이는 디버그 메시지", { someData: 123 })
logger.warn("API 응답이 예상과 다릅니다.", { response: { status: 200, body: "unexpected" } })
logger.error("API 호출 중 심각한 오류 발생!", new Error("Network Failure"))
```

## 6. 로그 관리

### 6.1 로그 파일 관리

```typescript
class LogManager {
	constructor(private context: vscode.ExtensionContext) {}

	// 로그 파일 목록 조회
	async getLogFiles(): Promise<string[]> {
		const logPath = path.join(this.context.globalStoragePath, "logs")
		return fs.readdir(logPath)
	}

	// 로그 파일 읽기
	async readLogFile(filename: string): Promise<string> {
		const logPath = path.join(this.context.globalStoragePath, "logs", filename)
		return fs.readFile(logPath, "utf-8")
	}

	// 오래된 로그 파일 삭제
	async cleanupOldLogs(daysToKeep: number): Promise<void> {
		const logPath = path.join(this.context.globalStoragePath, "logs")
		const files = await fs.readdir(logPath)

		const now = new Date()
		for (const file of files) {
			const filePath = path.join(logPath, file)
			const stats = await fs.stat(filePath)
			const daysOld = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24)

			if (daysOld > daysToKeep) {
				await fs.unlink(filePath)
			}
		}
	}
}
```

### 5.2 로그 뷰어

```typescript
class LogViewer {
	constructor(private context: vscode.ExtensionContext) {}

	// 로그 뷰어 패널 생성
	createLogViewer(): void {
		const panel = vscode.window.createWebviewPanel("logViewer", "로그 뷰어", vscode.ViewColumn.One, { enableScripts: true })

		panel.webview.html = this.getWebviewContent()
	}

	// 로그 필터링
	filterLogs(logs: LogEntry[], level?: LogLevel, component?: string): LogEntry[] {
		return logs.filter((log) => {
			if (level && log.level !== level) return false
			if (component && log.component !== component) return false
			return true
		})
	}
}
```

## 6. 테스트 설정

### 6.1 Vitest 테스트 설정

로거의 테스트는 Vitest를 사용합니다:

```typescript
// caret-src/utils/__tests__/caret-logger.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { CaretLogger, CaretLogLevel } from "../caret-logger"

describe("CaretLogger", () => {
	let logger: CaretLogger
	let mockOutputChannel: any

	beforeEach(() => {
		mockOutputChannel = {
			appendLine: vi.fn(),
		}
		logger = new CaretLogger(mockOutputChannel)
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it("should log info message", () => {
		const consoleSpy = vi.spyOn(console, "info")
		logger.info("test message", "TEST")

		expect(mockOutputChannel.appendLine).toHaveBeenCalled()
		expect(consoleSpy).toHaveBeenCalled()
	})
})
```

### 6.2 Frontend 테스트 설정

```typescript
// webview-ui/src/caret/utils/__tests__/CaretWebviewLogger.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import CaretWebviewLogger, { LogLevel } from "../CaretWebviewLogger"

// Mock vscode
vi.mock("../../utils/vscode", () => ({
	vscode: {
		postMessage: vi.fn(),
	},
}))

describe("CaretWebviewLogger", () => {
	let logger: CaretWebviewLogger

	beforeEach(() => {
		logger = new CaretWebviewLogger("TestComponent")
		vi.clearAllMocks()
	})

	it("should log info message to console", () => {
		const consoleSpy = vi.spyOn(console, "info")
		logger.info("test message")

		expect(consoleSpy).toHaveBeenCalledWith("[TestComponent] test message", "")
	})
})
```

## 7. 모범 사례

### 7.1 로깅 원칙

- 적절한 로그 레벨 사용 (DEBUG → INFO → WARN → ERROR → SUCCESS)
- 의미 있는 메시지 작성
- 민감 정보 제외
- 구조화된 데이터 포함

### 7.2 성능 고려사항

- 대용량 데이터 로깅 주의
- 로그 파일 크기 관리
- 주기적인 로그 정리
- 개발 모드에서만 DEBUG 레벨 사용

### 7.3 보안 고려사항

- 민감 정보 마스킹
- 로그 파일 접근 제한
- API 키 등 시크릿 정보 로그 금지

## 8. 업데이트 기록

- 2024-03-21: 초기 문서 작성
- 2024-03-21: 로깅 클래스 구현 추가
- 2024-03-21: 로그 관리 기능 추가
- 2024-03-21: 모범 사례 추가
- 2025-06-21: 실제 코드 구조에 맞게 경로 수정 및 Vitest 테스트 예시 추가 (md → mdx 변환)
