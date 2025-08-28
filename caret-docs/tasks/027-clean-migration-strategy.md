# Task #027: Clean Caret Rebuild - Reverse Squash Merge Strategy

# 📋 **027번 Clean Migration - 세분화 작업 계획**

## 🎯 **전체 작업 개요**

### **🚨 [CRITICAL] 0순위 원칙: 개발 가이드 숙지**
> **모든 코딩 작업에 앞서, 아래 핵심 개발 가이드 2개를 반드시 먼저 정독하고 완벽히 숙지해야 합니다. 프로젝트의 표준 아키텍처를 이해하지 않고 코드를 작성하는 것은 금지됩니다.**
> 1. **[프론트엔드-백엔드 상호작용 표준 패턴 가이드](./../development/frontend-backend-interaction-patterns.en.mdx)**
> 2. **[메시지 처리 아키텍처 가이드](./../development/message-processing-architecture.en.mdx)**

### **🚨 핵심 개발 원칙: Code-First Analysis**
```
⚠️ 개발에서 이해했다고 착각하는 게 제일 무서운 것이다.
```

**필수 작업 순서**:
1. **📋 실제 코드 분석**: 각 Phase마다 `caret-main/` 실제 소스코드 철저 분석
2. **📝 특징 문서 업데이트**: 분석 결과 바탕으로 해당 기능 문서 정확히 수정
3. **🔧 구현 및 이식**: 정확한 이해 바탕으로 머징 작업 수행
4. **🧪 검증**: 실제 동작 확인 및 테스트

**금지사항**:
- ❌ **할루시네이션 기반 문서 작성 금지**
- ❌ **Cline-latest의 많은 구조변경이 있었으며 이로 인한 에러가 많을 것으로 예상되며 모두 준용해야함**
- ❌ **추측으로 구현 세부사항 기술 금지** 
- ❌ **모든 에러는 머징과정 중 일어난 일이므로 에러만 수정하면 안됌. Cline과 Caret어느쪽의 이슈인지 반드시 분석후 대응** 
- ❌ **코드 분석 없이 머징 작업 금지**


### **🎯 Phase별 공통 개발 원칙**

#### **✨ 신규 아키텍처 원칙: Caret 기능 완전 분리**
> **CRITICAL**: Cline의 핵심 코드는 **수정하지 않는 것(Don't touch)**을 원칙으로 합니다. Caret의 모든 고유 기능은 `caret-src`, `webview-ui/src/caret` 등 지정된 `caret` 전용 디렉토리 내에서 독립적으로 구현되어야 합니다. 이는 향후 Cline 업데이트 시 발생할 수 있는 충돌을 원천적으로 방지하고 유지보수성을 극대화하기 위함입니다.

**적용 예시 (`ExtensionStateContext.tsx`):**
-   **❌ 잘못된 방식**: Cline의 `ExtensionStateContext.tsx`에 Caret의 페르소나 상태(`personaProfile`)와 관련 로직을 직접 추가하는 것.
-   **✅ 올바른 방식**: `webview-ui/src/caret/context/CaretStateContext.tsx`와 같이 Caret 전용 Context를 생성하여 기능을 완전히 분리하고, `App.tsx`에서 두 Provider를 함께 사용합니다.

#### **📡 Caret 전용 gRPC 서비스 원칙 (Backend ↔ Webview 통신)**
> **CRITICAL**: `cline`의 원본 `proto` 파일은 절대 수정하지 않습니다. Caret 고유의 통신은 반드시 별도의 `proto` 파일을 생성하여 독립적인 gRPC 서비스를 구현합니다.

**`caret-main` 비표준 방식 vs. `cline-latest` 표준 gRPC 방식 비교**

이번 마이그레이션의 핵심 목표 중 하나는 `caret-main`에 구현되었던 비표준 통신 방식을 Cline의 표준 아키텍처에 맞게 재구축하는 것입니다. 페르소나 시스템이 대표적인 예시입니다.

| 구분 | ❌ `caret-main` 비표준 방식 (수정 대상) | ✅ `cline-latest` 표준 방식 (목표) |
|---|---|---|
| **프로토콜 정의** | 별도 `.proto` 파일 없음. | Caret 전용 기능을 위해 **`proto/caret/persona.proto`** 와 같이 독립된 `.proto` 파일 생성. |
| **통신 방식** | `vscode.postMessage` 사용. 커스텀 메시지 타입(`UPDATE_PERSONA_CUSTOM_INSTRUCTION`)으로 직접 통신. | **gRPC** 사용. `protobus`를 통해 생성된 `PersonaServiceClient`로 표준화된 통신. |
| **백엔드 로직** | `Controller.ts`가 모든 메시지를 수신 후, `updateRuleFileContent.ts` 같은 개별 유틸리티 함수를 직접 호출. | **독립된 서비스 컨트롤러** (`caret-src/controllers/persona/`)가 gRPC 요청을 처리. |
| **상태 관리** | 웹뷰 컴포넌트(`PersonaManagement.tsx`)가 직접 백엔드 호출 및 상태 관리. | **`ExtensionStateContext.tsx`**가 모든 gRPC 통신과 상태 관리를 중앙에서 책임짐. UI 컴포넌트는 Context를 통해 상태와 함수를 전달받음. |

**필수 구현 절차:**
1.  **`proto/caret/` 디렉토리 생성**: Caret 전용 `.proto` 파일을 위한 네임스페이스를 확보합니다.
2.  **신규 `.proto` 파일 정의**: `proto/caret/persona.proto`와 같이 기능별로 파일을 분리하여 `service`와 `message`를 정의합니다.
3.  **독립 서비스 구현**: `caret-src` 내에 해당 서비스의 gRPC 핸들러(`controller`)를 구현합니다.
4.  **`extension.ts`에 등록**: `activate` 함수에서 `cline`의 `UiService`와는 별개로, 새로 만든 Caret 전용 서비스를 gRPC 서버에 등록합니다.
5.  **웹뷰 클라이언트 사용**: 웹뷰에서는 해당 서비스의 gRPC 클라이언트를 사용하여 백엔드와 통신합니다.

**기대 효과**:
-   **독립성**: `cline`의 통신 규약을 전혀 건드리지 않으므로 향후 `cline` 업데이트 시 발생할 수 있는 충돌을 원천적으로 방지합니다.
-   **명확성**: Caret 고유의 API가 명확하게 분리되어 코드 이해도와 유지보수성이 향상됩니다.

#### **⚠️ 코드 고고학 원칙 (Code Archeology Principle)**
> **CRITICAL**: `caret-main`의 코드는 오래된 Cline 버전을 기반으로 하므로, `cline-latest`에서는 제거되었거나 완전히 변경되었을 수 있습니다. **코드를 맹목적으로 이식하는 것은 금지됩니다.**

**필수 검증 절차:**
1.  **출처 확인**: `caret-main`에서 이식하려는 코드(변수, 함수, 설정 등)를 식별합니다.
2.  **현재 상태 교차 검증**: 해당 코드가 `cline-latest`에 여전히 존재하는지, 동일한 형태와 타입으로 사용되는지 `grep` 등으로 반드시 교차 검증합니다.
3.  **판단 및 적용**:
    - **제거된 경우**: 해당 코드는 이식하지 않고, 관련 기능도 함께 제거하거나 새로운 방식으로 대체합니다.
    - **변경된 경우**: 변경된 최신 타입과 구조에 맞춰 코드를 수정하여 이식합니다.
    - **동일한 경우**: 그대로 이식하되, `// CARET MODIFICATION` 주석을 추가합니다.

**실제 실패 사례 (`initialState.ts`):**
- **`organization`, `searchEngine`**: `cline-latest`에서 제거된 속성을 그대로 이식하려다 타입 에러 발생. **(→ 제거해야 함)**
- **`shell`, `openaiReasoningEffort`**: 타입이 `boolean`/`number`에서 `string literal`/`enum`으로 변경된 것을 확인하지 않고 이식하여 에러 발생. **(→ 새 타입에 맞게 수정해야 함)**

#### **🏷️ 주석 표준 (절대 준수)**
```typescript
// CARET MODIFICATION: [기능 설명]
// 예시: 
// CARET MODIFICATION: Rule priority system implementation
// CARET MODIFICATION: Add .caretrules support for UI display
```

#### **📋 로깅 시스템 규칙**
// ... existing code ...


#### **🌍 점진적 다국어 처리 (모든 Phase 적용)**
```typescript
// Phase별 다국어 추가 원칙
// 1. 새로운 UI 컴포넌트 구현 시 반드시 다국어 키 함께 추가
// 2. 기존 텍스트는 하드코딩 → i18n 키로 변환
// 3. 최소 한국어/영어 번역 필수, 일본어/중국어는 선택

// 예시: 페르소나 설정 페이지
const PersonaSettings = () => {
  const { t } = useTranslation('persona')
  
  return (
    <div>
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
      {/* 하드코딩 금지: "Choose your AI persona" */}
    </div>
  )
}

// 해당 언어 파일에 키 추가
// webview-ui/src/caret/i18n/ko/persona.json
{
  "title": "페르소나 설정",
  "description": "AI 어시스턴트의 성격을 선택하세요"
}
```

#### **📊 CaretLogger 사용 원칙 (모든 Phase 적용)**

##### **🚨 통합 테스트 디버깅 전략** ⭐ **필수**
> **통합 테스트에서 항상 문제가 발생하므로 주요 지점에 CaretLogger 삽입 필수**

```typescript
// CARET 기능 전용 로깅 (권장)
import { CaretLogger } from "@/services/logging/CaretLogger"

// 🔍 통합 테스트 핵심 체크포인트 로깅
CaretLogger.info(`[INTEGRATION-TEST] Phase 3 시작 - 페르소나 시스템 초기화`)
CaretLogger.info(`[INTEGRATION-TEST] 컴포넌트 마운트 완료: ${componentName}`)
CaretLogger.info(`[INTEGRATION-TEST] 데이터 로딩 완료: ${dataType}`)
CaretLogger.info(`[INTEGRATION-TEST] 이벤트 처리 완료: ${eventType}`)
CaretLogger.info(`[INTEGRATION-TEST] API 호출 완료: ${apiName}`)

// Phase별 로깅 패턴
CaretLogger.debug(`[CARET-PHASE-3] Persona loading: ${personaId}`)
CaretLogger.info(`[CARET-MODE] Switching to ${newMode} mode`)
CaretLogger.warn(`[CARET-I18N] Missing translation key: ${key}`)
CaretLogger.error(`[CARET-UI] Component render failed`, error)

// 🔧 통합 테스트 에러 핸들링
try {
    // 위험한 작업
    await riskyOperation()
    CaretLogger.info(`[INTEGRATION-TEST] 위험 작업 성공: ${operationName}`)
} catch (error) {
    CaretLogger.error(`[INTEGRATION-TEST] 위험 작업 실패: ${operationName}`, error)
    throw error // 재던지기로 테스트 실패 보장
}

// Cline 기존 로깅 (기능 수정 시만)
import { Logger } from "@/services/logging/Logger"
Logger.debug("Cline existing functionality")

// 🎨 프론트엔드 통합 테스트 로깅
console.log(`[FRONTEND-INTEGRATION] 컴포넌트 렌더링 시작: ${componentName}`)
console.log(`[FRONTEND-INTEGRATION] Props 전달 완료:`, props)
console.log(`[FRONTEND-INTEGRATION] State 업데이트 완료:`, state)
console.log(`[FRONTEND-INTEGRATION] 이벤트 핸들러 등록 완료: ${eventName}`)

// 웹뷰 로깅 (개발 모드만)
if (process.env.NODE_ENV === 'development') {
    console.log(`[CARET-UI-PHASE-3] Component state:`, state)
}

// ⚙️ 백엔드 통합 테스트 로깅
CaretLogger.info(`[BACKEND-INTEGRATION] 서비스 초기화 시작: ${serviceName}`)
CaretLogger.info(`[BACKEND-INTEGRATION] 데이터베이스 연결 완료`)
CaretLogger.info(`[BACKEND-INTEGRATION] API 엔드포인트 등록 완료: ${endpoint}`)
CaretLogger.info(`[BACKEND-INTEGRATION] 미들웨어 적용 완료: ${middlewareName}`)
CaretLogger.info(`[BACKEND-INTEGRATION] 컨트롤러 로드 완료: ${controllerName}`)
```

#### **🔄 점진적 개발 전략**
- **Phase 3-5**: 각 Phase에서 해당 기능의 다국어만 추가
- **Phase 6**: 누락된 다국어 통합 및 최종 검증
- **모든 Phase**: CaretLogger로 디버깅 정보 추가

### **📝 Caret 수정 시 필수 준수 사항**

#### **🏷️ 주석 표준 (절대 준수)**
```typescript
// CARET MODIFICATION: [기능 설명]
// 예시: 
// CARET MODIFICATION: Rule priority system implementation
// CARET MODIFICATION: Add .caretrules support for UI display
```

#### **📋 로깅 시스템 규칙**
> **CRITICAL**: 백엔드와 웹뷰의 로깅 시스템을 명확히 구분하여 사용합니다.

**1. 백엔드 로깅 (`caret-src`, `src`)**
> `caret-main`에서 사용하던 `CaretLogger`는 폐기되었습니다. 모든 백엔드 로깅은 `cline-latest`의 표준 `Logger`로 통합합니다.

```typescript
// Cline 표준 로거 사용 (필수)
import { Logger } from "@/services/logging/Logger"

// Caret 기능 로깅 시 컨텍스트 명시
Logger.debug(`[CARET-PERSONA] Persona initialization started.`)
Logger.info(`[CARET-MODE] Mode changed to: ${newMode}`)
```
**금지사항**:
- ❌ 백엔드 코드에서 `CaretLogger` 클래스 신규 생성 또는 사용 금지

**2. 웹뷰 로깅 (`webview-ui`)**
> 웹뷰는 VS Code 출력 채널에 직접 접근할 수 없으므로, `CaretWebviewLogger`를 사용하여 로그를 백엔드로 전송합니다. 이 로거는 `tslog`를 기반으로 하며, 개발 모드에서는 브라우저 콘솔에도 로그를 출력합니다.

```typescript
// Caret 웹뷰 로거 사용
import { caretWebviewLogger } from "@/caret/utils/webview-logger"

caretWebviewLogger.info("Persona component mounted.", { props })
caretWebviewLogger.debug("State updated:", { newState })
```
**핵심 기능**:
-   `vscode.postMessage`를 통해 로그 메시지를 백엔드의 `Logger`로 전달
-   개발 모드(`NODE_ENV === 'development'`)에서만 `console.log` 출력
-   `tslog` 라이브러리 기반으로 다양한 로그 레벨 지원

**금지사항**:
- ❌ 릴리즈 빌드에서 `console.log` 직접 사용 금지 (`CaretWebviewLogger`를 통해야 함)

#### **📄 문서 동기화 (필수)**
- **Feature 문서 업데이트**: `caret-docs/features/[feature-name].mdx` 반드시 업데이트
- **수정 파일 전체 목록**: 모든 변경 파일과 변경 내용 상세 기록
- **실제 구현 구조**: 의사코드가 아닌 실제 코드 스니펫 반영
- **테스트 상태**: 단위/통합 테스트 결과 명시

#### **🔍 완료 검증**
```bash
# 1. 모든 CARET MODIFICATION 확인
grep -r "CARET MODIFICATION" src/ webview-ui/src/ proto/

# 2. 관련 문서 업데이트 확인
git status caret-docs/features/

# 3. 빌드 및 테스트
npm run compile && npm run test:unit
```

### **핵심 전략: Reverse Squash Merge**
- **방향**: Cline v3.25.2(최신) ← Caret 기능들 (역방향 머징)
- **목표**: 깨끗한 Cline 기반 + 모든 Caret 고유 기능 완벽 이식
- **이점**: Git 히스토리 청소 + 향후 Cline 업데이트 용이성

### **3-레포 구조**
```
D:\dev\caret/
├── 📁 현재 루트 (feature/027-clean-migration-reverse-squash) - 작업용
├── 📁 caret-main/    - 참조용 (Caret v0.1.2, 깨끗한 상태)  
└── 📁 cline-latest/  - 소스용 (Cline v3.25.2, 최신)
```

## ✅ **세분화 작업 체크리스트**

### **🔧 Phase 1: 기초 환경 구축** ✅
- [x] **027-101**: Cline v3.25.2 소스 기준으로 작업용 덮어쓰기 ✅
  - [x] cline-latest → 현재 루트 복사 (951개 파일)
  - [x] 빌드 확인 (`npm run compile`, `npm run build:webview`) 성공
  - [x] TypeScript 에러 수정 (--noEmit + -b 충돌, eslint-plugin-react-hooks 추가)
  - [ ] **🧪 테스트 환경 검증**: `npm run test:backend` 실행 확인 (다음 단계)
  - [x] 기본 동작 테스트 (F5 Extension Host) 준비 완료
  - [x] 커밋: "feat: Phase 1 완료 - Cline v3.25.2 순수 소스로 완전 교체"
  - [x] **문서 체크**: 
    - [x] 작업 문서: `caret-docs/tasks/027-clean-migration-strategy.md` 업데이트
    - [x] 차별화 문서: `caret-docs/caret-features-specification.mdx` 검토 (완전 재구성된 머징 가이드)
    - [x] 머징 가이드: `caret-docs/guides/merging-strategy-guide.md` 검토
    - [x] **작업 로그**: `caret-docs/tasks/027-clean-migration-work-log.md` 업데이트

### **🏷️ Phase 2: 기본 브랜딩** ✅
- [x] **027-201**: 앱명 변경 (cline → caret) ✅
  - [x] package.json 수정 (name, displayName, homepage, repository, author, keywords)
  - [x] walkthrough 전체 "Cline" → "Caret" 변경
  - [x] commands 전체 category/title "Cline" → "Caret" 변경
  - [x] **브랜딩 원칙 수립**: 사용자 노출 부분만 변경, 내부 코드는 Cline 유지
  - [x] extension.ts 수정 (내부 API는 cline 유지 결정)
  - [x] 명령어 ID 변경 (내부 ID는 cline 유지 결정)
  - [x] 아이콘 브랜딩: Caret 전용 아이콘 교체 및 최적화
  - [x] 빌드 및 테스트 성공
  - [x] 커밋: "feat: Phase 2 완료 - Caret 아이콘 최적화 및 브랜딩 완성"
  - [x] **문서 체크**: 
    - [x] 작업 문서: 브랜딩 변경사항 반영
    - [ ] 차별화 문서: 앱명 변경 부분 업데이트
    - [ ] 머징 가이드: 브랜딩 머징 패턴 문서화
    - [ ] **작업 로그**: 브랜딩 변경 과정 및 결과 기록

- [x] **027-202**: 규칙 파일명 변경 (.clinerules → .caretrules) ✅
  - [x] **🔍 코드 분석**: `caret-main/` 규칙 우선순위 시스템 실제 구현 분석 ✅
  - [x] **📝 TDD 1단계**: 테스트 코드 이식 (rule-priority.test.ts) - 7개 케이스 ✅
  - [x] **🔧 TDD 2단계**: 우선순위 시스템 구현 ✅
    - [x] disk.ts: caretRules 파일명 추가
    - [x] external-rules.ts: getLocalCaretRules 함수 추가  
    - [x] task/index.ts: 우선순위 로직 (.caretrules > .clinerules > .cursorrules > .windsurfrules)
    - [x] responses.ts: caretRulesLocalFileInstructions 추가
    - [x] state-keys.ts: LocalState에 localCaretRulesToggles 추가
  - [x] **🧪 TDD 3단계**: 모든 테스트 통과 (7개 케이스) ✅
  - [x] **✅ 빌드 성공**: compile + lint 모두 성공 ✅
  - [x] 커밋: "feat: Phase 2-2 완료 - 규칙 우선순위 시스템 구현" ✅

- [x] **027-202-BUGFIX**: Phase 2-2 버그 수정 🐛 ✅ **COMPLETED**
  - [x] **🚨 버그 발견**: 실제 테스트에서 우선순위 시스템 작동하지 않음
  - [x] **🔍 근본 원인 분석**: 3개 핵심 버그 식별
    - [x] 버그 1: refreshRules.ts에서 caretLocalToggles UI 전송 누락 → **수정 완료**
    - [x] 버그 2: refreshExternalRulesToggles에 우선순위 로직 없음 → **구현 완료**
    - [x] 버그 3: 초기화 시 파일 발견하면 무조건 true 설정 → **로직 개선 완료**
  - [x] **🔧 CaretLogger 클래스 구현**: `src/services/logging/CaretLogger.ts` 신규 생성
  - [x] **🔧 Caret 백엔드 완전 분리**: `src/core/controller/file/toggleCaretRule.ts` 독립 구현
  - [x] **🔧 우선순위 시스템 완전 구현**: `.caretrules` > `.clinerules` > `.cursorrules` > `.windsurfrules`
  - [x] **✅ 검증**: 실제 테스트 환경에서 우선순위 시스템 정상 작동 확인
  - [x] 커밋: "feat: 027-202-BUGFIX 완료 - Rule Priority System 완전 수정" (01f53c380)
  - [x] **문서 체크**:
    - [x] 작업 문서: 버그 수정 완료 상태 업데이트 ✅
    - [x] **작업 로그**: 디버깅 과정 및 해결 결과 기록 ✅ (2025-01-23 완료)
    - [x] 테스트 완료: 모든 우선순위 로직 정상 작동 확인 ✅
    - [x] **Luke 승인**: "잘됬어" - 모든 기능 정상 동작 확인 ✅

- [x] **027-501**: 로깅 시스템 이식 ✅ **COMPLETED** (027-202에서 동시 구현)
  - [x] **🔧 CaretLogger 클래스**: `src/services/logging/CaretLogger.ts` 완전 구현
  - [x] **🔧 Cline Logger 분리**: 전용 "Caret" 출력 채널로 완전 분리
  - [x] **🔧 규칙 시스템 로깅**: CARET/WINDSURF/CURSOR/CLINE 모든 로깅 추가
  - [x] **🔧 백엔드 로깅 적용**: 3개 파일에서 CaretLogger 활용
  - [x] **✅ 머징 충돌 방지**: Logger vs CaretLogger 명확한 분리로 안전성 확보
  - [x] 커밋: "feat: 027-202-BUGFIX 완료 - Rule Priority System 완전 수정" (CaretLogger 포함)

- [x] **문서 체크** (027-202 전체): ✅ **COMPLETED**
  - [x] 작업 문서: 규칙 파일명 변경사항 반영 ✅
  - [x] **특징 문서**: `features/rule-priority-system.mdx` **실제 구현 분석 후 정확히 수정** ✅
  - [x] **작업 로그**: 코드 분석 결과 및 구현 과정 상세 기록 ✅ (2025-01-23 완료)
  - [x] 차별화 문서: 규칙 우선순위 시스템 업데이트 ✅
  - [x] 머징 가이드: 파일명 변경 머징 패턴 문서화 ✅

### ✨ Phase 3-PRE: 아키텍처 재정렬 및 오류 수정 (필수 선행 작업)
> **CRITICAL**: Phase 3의 본격적인 기능 이식에 앞서, `caret-main`에서 이식된 페르소나 관련 소스 코드의 위치를 표준 아키텍처 원칙(`Caret 기능은 caret-src에 위치`)에 맞게 바로잡고, 이로 인해 발생한 모든 빌드 오류를 해결하는 작업을 반드시 먼저 수행합니다.

- [x] **027-300-RESTRUCTURE**: 페르소나 소스 코드 아키텍처 재정렬
  - [x] **파일 이동**: `src/services/persona/` 디렉토리의 모든 파일 (`persona-initializer.ts`, `rules.ts` 등)을 올바른 위치인 `caret-src/services/persona/`로 이동
  - [x] **`import` 경로 수정**: 파일 이동으로 인해 발생한 모든 `import` 경로 오류 수정
- [x] **027-300-BUGFIX**: 백엔드 빌드 오류 전체 수정
  - [x] **레거시 코드 제거**: `updateRuleFileContent` 관련 `import` 및 호출 코드를 `caret-src`의 모든 파일에서 제거
  - [x] **`persona-storage.ts` 수정**: `savePersonaProfile` 함수에 `.caretrules/persona.md` 파일 저장 로직 추가
  - [x] **`tsconfig` 경로 별칭 수정**: `webview-ui/tsconfig.app.json`의 경로 별칭을 `cline-latest` 표준에 맞춰 정리
  - [ ] **UI 컴포넌트 오류 수정**: `PersonaAvatar.tsx`의 상태 관리 로직을 `ExtensionStateContext`와 동기화
    - [x] `PersonaServiceClient`가 `grpc-client.ts`에 생성되지 않는 문제 해결 (`proto` 빌드 스크립트 수정)
    - [x] `PersonaManagement.test.tsx` 리팩토링 (gRPC 모킹, `PersonaProfile` 타입 사용)
    - [x] `PersonaAvatar.test.tsx` 리팩토링 (`PersonaProfile` 타입 사용)
    - [x] `PersonaAvatar.tsx` 리팩토링 (`props`로 `personaProfile` 전달)
    - [x] `PersonaManagement.tsx` 리팩토링 (gRPC 호출, `PersonaProfile` 타입 사용)
    - [ ] `PersonaTemplateSelector.tsx` 리팩토링 (레거시 `postMessage` 제거)
    - [ ] `ExtensionStateContext.tsx` 리팩토링 (`PersonaServiceClient` 연결)
  - [ ] **유틸리티 오류 수정**: `i18n.ts`, `webview-logger.ts`의 TypeScript 타입 오류 수정
- [x] **검증**: `npm run compile` **(성공)** / `npm run build:webview` **(오류 감소 - 진행중)**
- [x] **문서 동기화**: `merging-strategy-guide.md`, `frontend-backend-interaction-patterns.en.mdx`에 `tsconfig` 표준 아키텍처 원칙 반영 (완료)

<details>
<summary>📋 **웹뷰 빌드 오류 분석 및 해결 계획 (펼치기)**</summary>

#### **🚨 핵심 원인 분석 (13개 오류)**
1.  **gRPC 클라이언트 부재**: `npm run protos` 스크립트가 `caret` 네임스페이스를 인식하지 못해 `webview-ui/src/services/grpc-client.ts` 파일에 `PersonaServiceClient`를 생성하지 못함.
2.  **잘못된 `import` 경로**: `tsconfig.app.json`에 `@generated` 같은 비표준 경로 별칭이 없으며, `../`를 사용하는 상대 경로가 부정확함. 모든 타입 참조는 `@shared/`를 통해 이루어져야 함.
3.  **레거시 타입 참조**: `caret-main` 시절의 `TemplateCharacter` 같은 타입을 그대로 참조하고 있음. `PersonaProfile` 등 `proto` 기반의 표준 타입으로 변경 필요.
4.  **TypeScript 타입 오류**: `i18n.ts` 등에서 `cline-latest`의 엄격해진 타입 규칙을 위반함.

#### **🔧 해결 계획**
1.  **Proto 빌드 스크립트 수정 (필수 선행)**:
    - `scripts/proto-utils.mjs`: `loadServicesFromProtoDescriptor` 함수를 수정하여 `caret` 패키지를 포함한 모든 `proto` 패키지를 동적으로 인식하도록 변경.
    - `scripts/generate-protobus-setup.mjs`: `generateWebviewProtobusClients` 함수가 `packageName`을 기반으로 `serviceName` (`caret.persona.PersonaService`)을 동적으로 생성하도록 수정.
2.  **`npm run protos` 재실행**: 수정된 스크립트로 `PersonaServiceClient`가 올바르게 생성되는지 확인.
3.  **UI 컴포넌트 및 테스트 코드 수정**:
    - 모든 `import` 경로를 `@shared/` 별칭을 사용하도록 수정.
    - 레거시 타입(`TemplateCharacter`)을 `PersonaProfile`로 교체.
    - 생성된 `PersonaServiceClient`를 사용하도록 gRPC 호출 로직 수정.
4.  **유틸리티 타입 오류 수정**:
    - `i18n.ts`에 명시적인 타입을 추가하여 타입 오류 해결.

</details>

---
### **📢 2025-08-18 세션 종료 현황 및 다음 계획**

#### **상황 요약**
`proto` 빌드 스크립트(`proto-utils.mjs`, `generate-protobus-setup.mjs`)를 수정하여 `caret` 네임스페이스를 동적으로 처리하려는 시도는 예상보다 복잡하고 `cline` 시스템에 미치는 영향이 커서, 여러 빌드 오류를 유발하고 해결에 실패했습니다. 이에, `cline`의 핵심 빌드 시스템을 건드리지 않고 `caret`의 독립성을 확보하는 더 안전하고 표준에 부합하는 새로운 전략을 수립했습니다.

**현재 상태:**
-   **`proto` 빌드 스크립트**: `cline-latest`의 원본으로 **완전 복구 완료**.
-   **백엔드 (`/src`, `/caret-src`)**: `npm run compile` **성공**.
-   **웹뷰 (`/webview-ui`)**: `npm run build` **실패** (19개 오류).
-   **백엔드 테스트**: `persona-initializer.test.ts`의 레거시 코드로 인해 **실패** (6개 오류).

#### **새로운 웹뷰 오류 해결 전략: Caret 전용 gRPC 클라이언트 분리**
`cline`의 자동 생성 파일(`grpc-client.ts`)을 수정하는 대신, `caret` 전용 gRPC 클라이언트를 수동으로 생성하여 완벽한 독립성을 확보합니다. 이는 `cline`의 표준 아키텍처를 존중하면서 `caret` 기능을 안전하게 확장하는 최선의 방법입니다.

#### **다음 세션을 위한 작업 계획**
> **CRITICAL**: 다음 세션에서는 이 문서를 다시 읽고, 아래 계획에 따라 웹뷰 빌드 오류 해결부터 시작합니다.

1.  **[ ] Caret 전용 gRPC 클라이언트 생성**
    -   [ ] `webview-ui/src/caret/services/` 디렉토리 생성
    -   [ ] `CaretGrpcClient.ts` 파일 생성 후, 아래 내용으로 `PersonaServiceClient` 수동 구현
        ```typescript
        // webview-ui/src/caret/services/CaretGrpcClient.ts
        import * as proto from "@shared/proto/index";
        import { ProtoBusClient, Callbacks } from "../../services/grpc-client-base";

        // CARET MODIFICATION: A dedicated gRPC client for Caret-specific services.
        // This ensures separation from Cline's auto-generated client and prevents future conflicts.
        export class PersonaServiceClient extends ProtoBusClient {
            static override serviceName: string = "caret.persona.PersonaService";

            static async updatePersona(request: proto.caret.persona.UpdatePersonaRequest): Promise<proto.cline.Empty> {
                return this.makeUnaryRequest("UpdatePersona", request, proto.caret.persona.UpdatePersonaRequest.toJSON, proto.cline.Empty.fromJSON);
            }

            static subscribeToPersonaChanges(request: proto.cline.EmptyRequest, callbacks: Callbacks<proto.caret.persona.PersonaImages>): () => void {
                return this.makeStreamingRequest("SubscribeToPersonaChanges", request, proto.cline.EmptyRequest.toJSON, proto.caret.persona.PersonaImages.fromJSON, callbacks);
            }
        }
        ```

2.  **[ ] `ExtensionStateContext.tsx` 리팩토링**
    -   [ ] `import { PersonaServiceClient }` 경로를 `../../services/grpc-client`에서 `../caret/services/CaretGrpcClient`로 변경
    -   [ ] 레거시 `TemplateCharacter` 타입 `import` 제거
    -   [ ] `updatePersona` 함수의 인자를 `PersonaProfile`로 변경하고, 로직을 `CaretGrpcClient`를 사용하도록 수정

3.  **[ ] UI 컴포넌트 및 테스트 리팩토링**
    -   [ ] `PersonaManagement.tsx`와 관련 테스트 파일에서 `PersonaServiceClient`를 새로운 `CaretGrpcClient`에서 가져오도록 `import` 경로 수정
    -   [ ] 모든 파일에서 `@generated`나 `../../..` 같은 잘못된 경로를 `@shared/`로 수정
    -   [ ] 모든 `TemplateCharacter` 타입을 `PersonaProfile`로 교체
    -   [ ] `PersonaTemplateSelector.tsx`의 레거시 `postMessage` 로직 제거

4.  **[ ] `i18n.ts` 타입 오류 해결**
    -   [ ] `vite-env.d.ts`와 `i18n.ts`를 확인하여 타입 오류 해결

5.  **[ ] 웹뷰 빌드 최종 확인 (`npm run build:webview`)**

6.  **[ ] 백엔드 테스트 오류 해결**
    -   [ ] `persona-initializer.test.ts` 파일을 `cline-latest` 환경에 맞게 리팩토링

### ✅ Phase 3: 페르소나 시스템 마이그레이션 ✅ **COMPLETED** (2025-08-23)

- **상태**: ✅ **완료** - 모든 페르소나 시스템 UI 통합 및 기능 구현 완성
- **핵심 성과**: 하이브리드 패턴 v3.1을 통해 Cline 원본 최소 수정으로 페르소나 시스템 완전 통합
- **구현된 기능**:
  - ✅ **PersonaManagement**: 이미지 업로드 버튼 복원 및 Base64 변환 처리
  - ✅ **PersonaTemplateSelector**: 탭 기반 UI 복원, 템플릿 선택 시 이미지 자동 업데이트  
  - ✅ **PersonaAvatar**: CSP 호환 Base64 변환, 모든 컴포넌트에서 재사용
  - ✅ **ChatRow**: AI 텍스트 및 추론 응답에 페르소나 아바타 표시
  - ✅ **CaretProviderWrapper**: 백엔드 래퍼 패턴으로 페르소나 이미지 주입
- **기술적 검증**:
  - ✅ **TypeScript 컴파일**: `npm run compile` 0 에러
  - ✅ **React Hooks 규칙**: ESLint 검사 통과
  - ✅ **UI 일관성**: 원래 디자인 완전 복원
  - ✅ **CARET MODIFICATION 주석**: 모든 Cline 원본 수정 부분 명확히 표시
- **문서화 완료**: 
  - ✅ `features/persona-system.mdx` - 하이브리드 패턴 기반 구현 가이드
  - ✅ `tasks/027-3-persona-migration.md` - 완료 처리 및 검증 결과
  - ✅ `development/caret-architecture-and-implementation-guide.mdx` - 하이브리드 패턴 v3.1 업데이트

### 🚀 Phase 4: Agent/Chatbot 대화 흐름 완성 (CRITICAL 우선순위)
> **세부 작업 계획**: **[./027-4-independent-chatbot-agent-system.md](./027-4-independent-chatbot-agent-system.md)** 

**⚠️ 현재 Agent 모드 대화 불가 문제를 해결하기 위한 최신 Cline Handler 아키텍처 도입**

- [ ] **027-401**: Upstream 머징 + Handler 아키텍처 전환
  - [ ] **Phase 1**: cline-latest를 최신 upstream (Cline v3.25.x)로 업데이트
    - `git remote add upstream https://github.com/cline/cline.git`
    - `git fetch upstream && git merge upstream/main`
    - cline-latest-new 디렉토리 정리 (중복 제거)
  - [ ] **Phase 2**: 최신 Handler 아키텍처 도입
    - `PlanModeRespondHandler.ts` → Caret 프로젝트에 적용
    - `ToolExecutorCoordinator.ts` 업데이트
    - Handler 기반 구조로 전환
  - [ ] **Phase 3**: Caret 전용 Handler 생성
    - `AgentModeRespondHandler` 클래스 구현
    - `ChatbotModeRespondHandler` 클래스 구현
    - 최신 Cline buttonConfig 로직 적용 (버튼 제거 지원)
  - [ ] **Phase 4**: 테스트 및 검증
    - Handler 기반 대화 흐름 테스트
    - 기존 기능 회귀 테스트
    - Agent 모드 연속 대화 검증

### 🎨 Phase 5: UI/UX 개선 (MEDIUM 우선순위)
> **세부 작업 계획**: **[./027-5-ui-ux-improvements.md](./027-5-ui-ux-improvements.md)** (생성 예정)

- [ ] **027-501**: 설정창, 채팅창 등 주요 UI/UX를 개선하고 다국어 지원을 완료합니다.

### 🔐 Phase 6: 계정 및 인증 시스템 (HIGH 우선순위)
> **세부 작업 계획**: **[./027-6-account-auth-system.md](./027-6-account-auth-system.md)** (생성 예정)

- [ ] **027-601**: `caret-main`의 Auth0 기반 계정 및 인증 시스템을 `cline-latest` 아키텍처에 맞게 이식합니다.

### 🌍 Phase 7: 최종 다국어 통합 (LOW 우선순위)
> **세부 작업 계획**: **[./027-7-final-i18n.md](./027-7-final-i18n.md)** (생성 예정)

- [ ] **027-701**: 모든 기능에 대한 다국어 지원을 최종 검토하고 누락된 부분을 통합합니다.

### ✅ Phase 8: 최종 검증 및 릴리즈 (CRITICAL 우선순위)
> **세부 작업 계획**: **[./027-8-final-verification.md](./027-8-final-verification.md)** (생성 예정)

- [ ] **027-801**: 전체 기능에 대한 E2E 테스트 및 최종 검증을 수행하고 릴리즈를 준비합니다.

- [x] **027-102-BUGFIX**: 디버깅 환경 설정 복구 🐛 ✅ **COMPLETED**
  - [x] **🚨 버그 발견**: F5 디버깅 실행 시 마크다운 디버거가 실행되거나 빌드 작업 선택창이 뜨는 문제 발생
  - [x] **🔍 근본 원인 분석**: 프로젝트 루트에 `.vscode/launch.json` 및 `.vscode/tasks.json` 파일 누락
  - [x] **🔧 수정**: `cline-latest`의 설정을 기반으로 `.vscode/launch.json` 생성하여 디버깅 구성 추가
  - [x] **🔧 수정**: `.vscode/tasks.json` 생성하여 `npm: compile`을 기본 빌드 작업으로 설정
  - [x] **✅ 검증**: F5 키로 빌드 후 확장 프로그램 디버깅 정상 실행 확인
  - [x] **문서 체크**: 
    - [x] 작업 문서: 버그 수정 완료 상태 업데이트 ✅
    - [x] **작업 로그**: 디버깅 과정 및 해결 결과 기록 ✅ (2025-01-23 완료)
    - [x] 테스트 완료: 모든 우선순위 로직 정상 작동 확인 ✅
    - [x] **Luke 승인**: "잘됬어" - 모든 기능 정상 동작 확인 ✅
