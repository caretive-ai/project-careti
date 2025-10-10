# F01 - Common Utility

**상태**: ✅ Phase 4 완료 (Backend)
**구현도**: 100% 완료
**우선순위**: MEDIUM - 개발 인프라

---

## 📋 개요

**목표**: 백엔드/프론트엔드 공통 유틸리티 시스템 - URL 관리 및 로깅

**핵심 기능**:
- URL 상수 관리 (다국어 지원)
- 로깅 시스템 (caretLogger, caretWebviewLogger)
- 개발 스크립트 (빌드, 테스트, 패키징)

---

## 🏗️ Backend 구현 (Phase 4)

### ✅ 핵심 파일

**1. URL 관리 시스템**
```
caret-src/utils/urls.ts
- CARET_URLS: 일반 URL 상수
- CARET_LOCALIZED_URLS: 다국어 URL
- getLocalizedUrl(): 언어별 링크 헬퍼
```

**2. 로깅 시스템**
```
caret-src/utils/logger.ts
- caretLogger: Backend 로그
- caretWebviewLogger: Frontend 로그
- Debug/Info/Warn/Error 레벨
```

**3. 개발 스크립트**
```
caret-scripts/
├── setup-dev-env.js          # 개발 환경 설정
├── test-report.js             # 테스트 리포트
├── package-release.js         # VSIX 빌드
├── caret-coverage-check.js    # 코드 커버리지
└── sync-caretrules.js         # 규칙 동기화
```

---

## 🔧 URL 관리

### URL 상수

```typescript
// caret-src/utils/urls.ts
export const CARET_URLS = {
    CARET_SERVICE: "https://caret.team",
    CARET_GITHUB: "https://github.com/aicoding-caret/caret",
    CARET_APP_CREDITS: "https://app.caret.team/credits",
}

export const CARET_LOCALIZED_URLS = {
    DOC_GETTING_STARTED: {
        ko: "https://docs.caret.team/ko/getting-started",
        en: "https://docs.caret.team/en/getting-started",
    },
    // ... 다른 다국어 링크
}
```

### 언어별 링크

```typescript
import { getLocalizedUrl } from "@caret/utils/urls"

const url = getLocalizedUrl("DOC_GETTING_STARTED", "ko")
// → "https://docs.caret.team/ko/getting-started"
```

---

## 📝 로깅 시스템

### Backend 로깅

```typescript
import { caretLogger } from "@caret/utils/logger"

caretLogger.debug("Debug message")
caretLogger.info("Info message")
caretLogger.warn("Warning message")
caretLogger.error("Error message")
```

### Frontend 로깅

```typescript
import { caretWebviewLogger } from "@caret/utils/logger"

caretWebviewLogger.info("[COMPONENT] Rendering...")
caretWebviewLogger.error("[API] Request failed", error)
```

---

## 🛠️ 개발 스크립트

### 주요 스크립트

**1. 환경 설정**
```bash
npm run setup
# → setup-dev-env.js 실행
# → .caretrules 동기화
```

**2. 테스트 리포트**
```bash
npm run test:all
# → test-report.js 실행
# → 통합 테스트 리포트 생성
```

**3. 릴리즈 빌드**
```bash
npm run package:release
# → package-release.js 실행
# → VSIX 파일 생성
```

**4. 커버리지 분석**
```bash
npm run caret:coverage
# → Caret vs Cline 코드 분석
```

---

## 📊 파일 구조

### Caret 전용 파일

```
caret-src/utils/
├── urls.ts              # URL 상수 및 헬퍼
├── logger.ts            # 로깅 시스템
└── common.ts            # 공통 유틸리티

caret-scripts/
├── setup-dev-env.js
├── test-report.js
├── package-release.js
├── caret-coverage-check.js
└── sync-caretrules.js
```

### Cline 수정 없음

- **최소 침습**: Cline 파일 0개 수정
- **완전 독립**: caret-src/에 완전 격리

---

## 💡 핵심 장점

**1. 중앙 집중식 관리**
- URL 상수 한 곳에서 관리
- 다국어 링크 자동 처리
- 타입 안전성 보장

**2. 개발 효율성**
- 자동화된 빌드 스크립트
- 일관된 로깅 시스템
- 테스트 리포트 자동 생성

**3. 유지보수**
- 단일 파일 수정으로 전체 URL 업데이트
- 로깅 포맷 통일
- 스크립트 재사용 가능

---

## 🧪 사용 예시

### URL 사용

```typescript
import { CARET_URLS, getLocalizedUrl } from "@caret/utils/urls"

// 일반 URL
const github = CARET_URLS.CARET_GITHUB

// 다국어 URL
const docUrl = getLocalizedUrl("DOC_GETTING_STARTED", currentLanguage)
```

### 로깅 사용

```typescript
import { caretLogger } from "@caret/utils/logger"

try {
    // 작업 수행
    caretLogger.info("Operation completed")
} catch (error) {
    caretLogger.error("Operation failed", error)
}
```

---

**작성일**: 2025-10-10
**Phase**: Phase 4 완료
**Cline 수정**: 없음 (완전 독립)
