# f01 - 공통 유틸리티

## 📋 개요

백엔드/프론트엔드 공통 유틸리티 라이브러리 시스템입니다. Careti 프로젝트에서 자주 사용되는 URL 관리와 로깅 기능을 제공합니다.

## ✅ 완료된 구성 요소

### 1. 빌드 및 개발 스크립트

**위치**: `scripts/`, `careti-scripts/`

Careti-main에서 검증된 유용한 빌드 스크립트들을 이식하여 개발 효율성을 향상시킵니다.

```json
{
  "scripts": {
    "setup": "node careti-scripts/setup-dev-env.js",
    "compile:fast": "node esbuild.mjs", 
    "test:all": "node careti-scripts/test-report.js",
    "package:release": "node careti-scripts/build/package-release.js",
    "careti:coverage": "node careti-scripts/careti-coverage-check.js",
    "models:generate": "node careti-scripts/generate-support-model-list.js"
  }
}
```

**주요 스크립트:**
- `setup-dev-env.js`: 크로스 플랫폼 개발 환경 설정
- `test-report.js`: 통합 테스트 리포트 생성기
- `package-release.js`: VSIX 릴리즈 패키지 빌드 자동화
- `careti-coverage-check.js`: Careti vs Cline 코드 커버리지 분석
- `generate-support-model-list.js`: 지원 모델 문서 자동 생성
- 색상 로깅 및 오류 처리 유틸리티 포함

### 2. URL 상수 관리 시스템

**위치**: `webview-ui/src/careti/utils/urls.ts`

- 다국어 지원 URL 상수 및 헬퍼 함수
- 언어별 링크 분류, 타입 안전성, fallback 지원

```typescript
// 일반 URL (언어 무관)
export const CARET_URLS = {
	CARET_SERVICE: "https://careti.ai",
	CARET_GITHUB: "https://github.com/aicoding-careti/careti",
	CARET_APP_CREDITS: "https://careti.ai/billing",
	// ...
} as const

// 언어별 URL  
export const CARET_LOCALIZED_URLS = {
	EDUCATION_PROGRAM: {
		ko: "https://github.com/aicoding-careti/multi-post-agent/...",
		en: "https://github.com/aicoding-careti/multi-post-agent/...",
		ja: "https://github.com/aicoding-careti/multi-post-agent/...",
		zh: "https://github.com/aicoding-careti/multi-post-agent/...",
	},
	// ...
} as const
```

### 3. 웹뷰 로깅 시스템

**위치**: `webview-ui/src/careti/utils/CaretWebviewLogger.ts`

- 웹뷰에서 Extension Host로 안전한 로그 전송
- 개발/프로덕션 모드 지원, 안전 검사 내장
- 클래스명과 파일명 일치 (CaretWebviewLogger)
- f02(로깅) 기능에서 활용 예정

```typescript
export enum LogLevel {
	DEBUG = "debug",
	INFO = "info", 
	WARN = "warn",
	ERROR = "error",
}

class CaretWebviewLogger {
	constructor(component: string)
	debug(message: string, data?: any): void
	info(message: string, data?: any): void
	warn(message: string, data?: any): void
	error(message: string, data?: any): void
}
```

## 🔧 사용법

### 개발 스크립트 사용

```bash
# 개발 환경 설정 (크로스 플랫폼)
npm run setup

# 빠른 컴파일 (타입 체크 스킵)
npm run compile:fast

# 통합 테스트 리포트 
npm run test:all

# 릴리즈 VSIX 패키지 빌드
npm run package:release

# Careti vs Cline 코드 커버리지 분석
npm run careti:coverage

# 지원 모델 문서 생성
npm run models:generate
```

### URL 상수 사용

```typescript
import { getUrl, getLocalizedUrl } from "@/careti/utils/urls"

// 일반 URL 가져오기
const serviceUrl = getUrl("CARET_SERVICE")

// 언어별 URL 가져오기  
const educationUrl = getLocalizedUrl("EDUCATION_PROGRAM", "ko")
```

### 웹뷰 로깅 사용

```typescript
import CaretWebviewLogger from "@/careti/utils/CaretWebviewLogger"

const logger = new CaretWebviewLogger("MyComponent")

logger.info("컴포넌트가 초기화되었습니다")
logger.debug("디버그 정보", { data: 123 })
logger.warn("경고 메시지")
logger.error("오류 발생", error)
```

### 4. CaretiGlobalManager 싱글톤 시스템

**위치**: `careti-src/managers/CaretiGlobalManager.ts`

- 전역 브랜드 모드 시스템 중앙 관리자
- ExtensionState와 CaretiGlobalManager 완벽 동기화
- 싱글톤 패턴으로 전역 접근 보장
- 브랜드별 설정 및 i18n 기능 통합 관리

```typescript
// CaretiGlobalManager 클래스 구조
export class CaretiGlobalManager {
	private static _instance: CaretiGlobalManager | null = null
	private _currentMode: CaretModeSystem = "careti"
	
	// 싱글톤 접근
	public static get(): CaretiGlobalManager
	
	// 모드 시스템 관리
	public getCurrentMode(): CaretModeSystem
	public setCurrentMode(mode: CaretModeSystem): void
	
	// 브랜드 정보
	public getCurrentBrandName(): string
	public isI18nEnabled(): boolean
	public isBrandingEnabled(): boolean
	public getModeDefaultLanguage(): "ko" | "en"
	
	// 정적 접근자
	public static get currentMode(): CaretModeSystem
	public static get brandName(): string  
	public static get isI18nEnabled(): boolean
}
```

#### ExtensionStateContext 통합

**위치**: `webview-ui/src/context/ExtensionStateContext.tsx`

ExtensionState의 modeSystem과 CaretiGlobalManager._currentMode가 완벽하게 동기화됩니다:

```typescript
// CARETI MODIFICATION: CaretiGlobalManager 통합
import { CaretiGlobalManager } from "../../../careti-src/managers/CaretiGlobalManager"

setModeSystem: (modeSystem: CaretModeSystem) => {
    const previousMode = state.modeSystem
    const timestamp = new Date().toISOString()

    // 1. 종합 로깅 (프론트엔드/백엔드)
    console.log("[GLOBAL-BACKEND] modeSystem state:", { before: previousMode, after: modeSystem, timestamp })
    console.debug("[GLOBAL-FRONTEND] modeSystem state:", { before: previousMode, after: modeSystem, timestamp })
    
    // 2. CaretiGlobalManager 싱글톤 업데이트 (핵심!)
    try {
        CaretiGlobalManager.get().setCurrentMode(modeSystem)
        console.log(`[GLOBAL-MANAGER] CaretiGlobalManager.setCurrentMode called with: ${modeSystem}`)
    } catch (error) {
        console.error("[GLOBAL-MANAGER] Failed to update CaretiGlobalManager:", error)
    }
    
    // 3. ExtensionState 업데이트
    setState((prevState) => ({ ...prevState, modeSystem }))
    
    // 4. 백엔드 API 호출
    try {
        StateServiceClient.updateSettings({ modeSystem: modeSystem })
        console.log(`[API] StateServiceClient.updateSettings called with modeSystem: ${modeSystem}`)
    } catch (error) {
        console.error("[API] Failed to update modeSystem via StateServiceClient:", error)
    }
}
```

#### 브랜드 유틸리티 통합

**위치**: `careti-src/utils/brand-utils.ts`

CaretiGlobalManager는 brand-utils의 함수들을 활용하여 동적 브랜드 정보를 제공합니다:

```typescript
import { 
    getCurrentBrandName,
    getCurrentUserMode,
    isModeI18nEnabled,
    isBrandingEnabled,
    getModeDefaultLanguage 
} from "../utils/brand-utils"

// CaretiGlobalManager 내부에서 활용
public getCurrentBrandName(): string {
    return getCurrentBrandName()  // package.json displayName 기반
}

public isI18nEnabled(): boolean {
    return isModeI18nEnabled()    // 현재 모드의 i18n 활성화 여부
}
```

> 📌 **CLI/Go 주의**: CLI나 host bridge에서 브랜드 문자열이 필요한 경우 TypeScript 유틸이 아니라 `cli/pkg/common/branding.go`의 `BrandDisplayName()`을 호출해야 합니다. 이렇게 하면 npm 패키지 `displayName`만 바꿔도 VS Code/CLI가 동시에 갱신됩니다.

### CaretiGlobalManager 사용

```typescript
import { CaretiGlobalManager } from "@careti/managers/CaretiGlobalManager"

// 싱글톤 인스턴스 접근
const manager = CaretiGlobalManager.get()

// 현재 모드 확인
const currentMode = manager.getCurrentMode() // "careti" | "cline"

// 모드 변경 (ExtensionStateContext에서 자동 호출됨)
manager.setCurrentMode("careti")

// 브랜드 정보 확인
const brandName = manager.getCurrentBrandName()    // "Careti" | "Cline" 
const isI18nEnabled = manager.isI18nEnabled()      // true | false
const defaultLang = manager.getModeDefaultLanguage() // "ko" | "en"

// 정적 접근자 사용 (편의성)
const mode = CaretiGlobalManager.currentMode        // 현재 모드
const brand = CaretiGlobalManager.brandName         // 브랜드명
const i18nSupport = CaretiGlobalManager.isI18nEnabled // i18n 지원 여부
```

## 🧪 동작 확인 방법

### CaretiGlobalManager 통합 테스트

VS Code에서 **Settings → Mode System** 토글을 변경하면 다음과 같은 로그가 개발자 콘솔에 표시됩니다:

```bash
# Careti → Cline 모드로 변경시
[GLOBAL-BACKEND] modeSystem state: { before: "careti", after: "cline", timestamp: "2025-09-05T18:30:00.000Z" }
[BACKEND] modeSystem changed: careti -> cline
[GLOBAL-FRONTEND] modeSystem state: { before: "careti", after: "cline", timestamp: "2025-09-05T18:30:00.000Z" }
[FRONTEND] Global modeSystem updated: cline
[GLOBAL-MANAGER] CaretiGlobalManager.setCurrentMode called with: cline
[API] StateServiceClient.updateSettings called with modeSystem: cline

# Cline → Careti 모드로 변경시
[BACKEND] modeSystem changed: cline -> careti
[GLOBAL-MANAGER] CaretiGlobalManager.setCurrentMode called with: careti
```

이 로그들이 정상적으로 표시되면 **CaretiGlobalManager와 ExtensionState가 완벽하게 동기화**되고 있는 것입니다.
