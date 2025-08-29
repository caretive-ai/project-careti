# Caret 프로젝트 종합 규칙 및 개발 가이드

**Caret**: VSCode용 AI 코딩 어시스턴트 확장 - Cline 기반 Fork 프로젝트

## 프로젝트 개요

**프로젝트명**: Caret (캐럿 - '^' 기호, 당근🥕 아님)
**설명**: 개인화된 개발 파트너십에 중점을 둔 VSCode AI 어시스턴트 확장
**기반**: Cline 프로젝트의 Fork로 직접 통합
**저장소**: https://github.com/aicoding-caret/caret

**네이밍 컨벤션**: Caret은 프로그래밍에서 사용하는 텍스트 커서 기호 '^'를 의미하며, 프로그래밍 현장에서 위치와 방향을 나타내는 중요한 기호입니다.

## 아키텍처 원칙

**Fork 기반 구조**: Cline 코드베이스를 `src/` 디렉토리에 직접 통합하여 최소 확장 전략 채택

**디렉토리 구성**:
```
caret/
├── src/                      # Cline 원본 코드 (보존 필수)
├── caret-src/                # Caret 확장 기능 (최소한)
├── webview-ui/               # React 프론트엔드 (Cline 빌드 시스템 활용)
├── caret-assets/             # Caret 전용 리소스
├── caret-docs/               # Caret 문서 시스템
└── caret-scripts/            # Caret 자동화 스크립트
```

**코드 관리 원칙 (CRITICAL - AI 필수 준수)**:

### 1. Cline 원본 파일 수정 시 절대 원칙
- **디렉토리**: `src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/` 및 루트 설정 파일
- **원칙 1 (확장성의 원칙): 상속 vs 직접 수정**
    - **신규 기능 추가**: 기존 클래스의 기능을 확장하여 새로운 기능을 추가할 때는 `상속`을 우선적으로 사용한다. (`caret-src` 내에 새로운 클래스 파일 생성)
    - **기존 기능 수정**: 기존 기능의 동작을 일부 변경해야 할 때, 상속을 통한 `오버라이딩(overriding)`이 가능하다면 그 방법을 사용한다.
    - **직접 수정의 조건**: 상속하려는 부모 클래스의 핵심 속성이나 메소드가 `private`으로 선언되어 있어 상속을 통한 확장이 불가능할 경우, 예외적으로 해당 원본 파일을 **백업 후 직접 수정**하는 것을 허용한다. 이는 '최소 수정의 원칙'에 더 부합하는 방법이다.
- **원칙 2**: **주석처리된 안 쓰는 코드도 절대 건드리지 말 것** (머징 고려)
- **원칙 3**: **최소 수정의 원칙** - 1-3라인 이내 권장
- **원칙 4**: **수정 시 주석처리하지 말고 완전히 대체**
- **원칙 5**: **반드시 CARET MODIFICATION 주석 추가**

### 2. 백업 규칙 (MANDATORY)
```bash
# 1단계: 백업 생성 (수정 전 필수)
cp src/extension.ts src/extension-ts.cline

# 2단계: 파일 상단에 CARET MODIFICATION 주석 추가
// CARET MODIFICATION: 구체적인 수정 내용 설명
// Original backed up to: src/extension-ts.cline
// Purpose: 수정 목적
```

### 3. 자유 수정 가능 영역
- **caret-src/**: Caret 전용 디렉토리 - 완전 자유 수정
- **caret-docs/**: Caret 문서 - 완전 자유 수정  
- **caret-assets/**: Caret 리소스 - 완전 자유 수정

### 4. 수정 예시 (올바른 방법)
```typescript
// ❌ 잘못된 방법 - 주석처리로 남김
// const oldValue = "claude-dev.SidebarProvider"  // 원본
const newValue = "claude-dev.SidebarProvider"  // 새로운 값

// ✅ 올바른 방법 - 완전 대체
const newValue = "claude-dev.SidebarProvider"  // CARET: 사이드바 ID 변경
```

**Cline 패턴 활용**:
- **Task 실행 시스템**: 스트리밍 처리, race condition 방지 잠금 메커니즘
- **API 관리**: 토큰 추적 및 컨텍스트 자동 관리
- **에러 처리**: 자동 재시도 및 사용자 확인 프로세스
- **상태 관리**: Global/Workspace/Secrets 다중 저장소, 인스턴스 동기화
- **실시간 통신**: Controller ↔ ExtensionStateContext 패턴

## 개발 환경 및 빌드

**필수 요구사항**: Node.js 18+, npm/yarn, VSCode, Git

**개발 환경 설정 (권장)**:
가장 쉽고 빠른 방법은 프로젝트 루트에서 제공되는 자동화 스크립트를 실행하는 것입니다.

```bash
# 모든 플랫폼 권장
npm run install:all

# 또는 Windows 사용자
powershell .\\clean-build-package.ps1
```
이 스크립트는 의존성 설치, Protocol Buffer 컴파일 등 모든 과정을 자동으로 처리합니다.

**수동 설정 (문제 발생 시)**:
자동화 스크립트에 문제가 발생할 경우, 아래 절차를 따라 수동으로 설정할 수 있습니다.
```bash
git clone https://github.com/aicoding-caret/caret.git
cd caret
npm install
cd webview-ui && npm install && cd ..
npm run protos
npm run compile
# VSCode에서 F5로 개발 모드 실행
```

**주요 빌드 명령어**:
```bash
npm run protos          # Protocol Buffer 컴파일
npm run compile         # TypeScript 컴파일
npm run build:webview   # React 빌드
npm run watch           # 개발용 watch 모드
npm run package         # VSIX 패키지 생성
```

## 개발 프로세스

**Git 커밋 컨벤션**:
```
[type]: [description]
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드/설정 변경
```

**상태 관리**: CaretProvider가 Cline의 WebviewProvider를 확장하며, Cline 패턴을 준수하여 최소 확장으로 기존 기능 활용

**도구 통합**: Cline의 기존 통합(`src/integrations/`), API 프로바이더(`src/api/providers/`), 체크포인트(`src/integrations/checkpoints/`) 활용

## AI 작업 프로토콜

**🚨 중요: AI 어시스턴트는 다음 프로토콜을 수행하기 위한 상세 실행 절차서로 [`./guides/ai-work-method-guide.mdx`](./guides/ai-work-method-guide.mdx)를 최우선으로 숙지하고, 모든 작업을 해당 문서의 지시에 따라 수행해야 합니다.**

**작업 시작 프로토콜 (CRITICAL)** - AI 어시스턴트는 다음 순서를 **반드시** 준수:

**Phase 0: 필수 사전 검토 - AI 작업 인덱스 가이드 우선 독해 (MANDATORY)**
*   **목표:** 효율적인 컨텍스트 관리를 통해 작업 성격에 맞는 문서만 선택적으로 독해하여 개발 효율성을 극대화하는 단계입니다.

**STEP 1: AI 작업 인덱스 가이드 독해**
- [ ] **필수 독해**: `caret-docs/development/ai-work-index.en.mdx` (AI 작업 인덱스 가이드) 완전 독해
- [ ] **컨텍스트 효율성**: 모든 문서를 읽지 말고 작업에 필요한 문서만 선택적으로 독해

**STEP 2: 작업 성격 분석**
- [ ] **키워드 추출**: 사용자 요청에서 핵심 키워드 추출
- [ ] **카테고리 식별**: 키워드 기반으로 작업 카테고리 분류
  - 🏗️ 아키텍처 & 설계 관련
  - 🤖 AI 시스템 개발
  - 🔄 Frontend-Backend 통신
  - 🎨 UI/UX 개발
  - 🧪 테스트 & 품질 관리
  - 🔧 개발 도구 & 유틸리티
  - 📖 문서화 & 규약
  - 🚨 Cline 원본 수정

**STEP 3: 선택적 문서 독해**
- [ ] **High Priority**: 직접 관련된 핵심 문서 (1-2개) 완전 독해
- [ ] **Medium Priority**: 간접 관련 문서 (필요시만 부분 독해)
- [ ] **Low Priority**: 참고용 문서 (링크만 확인)

**STEP 4: 아키텍처 결정 체크리스트**
- [ ] 이 기능은 Caret 전용인가? 
  - YES → `caret-src/` 또는 `webview-ui/src/caret/`
  - NO → Cline 원본 최소 수정 + 백업 필수
- [ ] Cline 원본 파일 수정이 필요한가?
  - YES → 백업 생성 + CARET MODIFICATION 주석 + 최소 수정 원칙
- [ ] 새로운 컴포넌트가 필요한가?
  - YES → 적절한 디렉토리 선택 (caret/ vs src/)
- [ ] 테스트 파일 위치는?
  - webview → `webview-ui/src/caret/**/*.test.tsx`
  - 백엔드 → `caret-src/__tests__/`

**STEP 5: 계획 수립 및 개발자 승인**: 아키텍처 결정 사항 명시 후 개발자 승인 요청

**핵심 개발 원칙**:
- **품질 우선**: 속도보다 정확성과 품질 우선
- **테스트 필수**: 모든 테스트 통과, 실패 시 근본 원인 해결
- **문제 회피 금지**: 임시 방편이나 '나중에 수정' 접근 금지
- **기술 부채 방지**: 처음부터 올바른 구현
- **완전성 추구**: 부분적/불완전한 상태로 작업 종료 금지
- **검증 우선**: 코드 변경 후 반드시 컴파일, 테스트, 실행 검증
- **CARET 주석 필수**: Caret 수정 시 반드시 CARET MODIFICATION 주석 추가

**Phase 기반 작업 설계 (강화된 체크포인트)**:

**Phase 1: TDD RED - 실패하는 테스트 작성**
*   **목표:** 구현할 기능의 요구사항을 명확히 정의하는 '실패하는' 테스트 코드를 먼저 작성합니다.

🚨 **STOP POINT 1: 테스트 파일 생성 전 경로 확인**
- [ ] 테스트 설정의 include 경로 확인:
  - webview: `src/caret/**/*.test.{ts,tsx}`
  - 백엔드: `caret-src/__tests__/`
- [ ] 테스트 파일이 올바른 디렉토리에 생성되는가?
- [ ] **즉시 검증**: 테스트 파일 생성 후 `npm run test:webview` 실행으로 인식 확인

**Phase 2: TDD GREEN - 테스트 통과 구현**
*   **목표:** 앞에서 작성한 테스트를 통과시키는 '최소한의' 코드를 작성하여 기능을 구현합니다.

🚨 **STOP POINT 2: Cline 원본 파일 수정 전 (MANDATORY)**
**다음 중 하나라도 해당되면 STOP하고 체크리스트 실행:**
- `src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/` 파일 수정
- 기존 Cline 컴포넌트에 기능 추가

**필수 체크리스트:**
- [ ] 백업 파일 생성: `cp {원본파일} {파일명-확장자}.cline`
- [ ] CARET MODIFICATION 주석 추가 계획
- [ ] 최소 수정 원칙 (1-3라인) 준수 계획
- [ ] 완전 대체 (주석처리 금지) 방식 계획

🚨 **STOP POINT 3: 새 파일 생성 전 디렉토리 확인**
- [ ] Caret 전용 기능이 `caret/` 폴더에 구현되는가?
- [ ] import 경로가 올바른가?
- [ ] **즉시 검증**: Cline 원본 수정 후 `npm run compile`로 에러 확인

**Phase 3: TDD REFACTOR - 코드 품질 개선 및 전체 검증**
*   **목표:** 기능은 그대로 유지하면서 코드의 구조를 개선하고, 전체 시스템이 정상 동작하는지 최종 확인합니다.

- [ ] 전체 시스템 검증: `npm run compile` 성공
- [ ] 모든 테스트 통과: `npm run test:webview`, `npm run test:backend`
- [ ] 기존 기능에 영향 없음 확인

**실행 원칙**: 각 Phase 시작 전 관련 가이드 문서 및 원칙 재확인 **필수**

## 🚨 **코딩 작업 강제 체크리스트 (AI 필수 준수)**

### **📋 코딩 작업 시작 전 MANDATORY 체크리스트**

**AI 어시스턴트는 모든 코딩 작업 시작 전 다음을 반드시 확인해야 합니다:**

#### **1. TDD 원칙 강제 확인**
- [ ] **테스트 작성 계획**: 구현보다 테스트를 먼저 작성할 계획인가?
- [ ] **Red-Green-Refactor**: TDD 3단계 사이클을 준수할 것인가?
- [ ] **테스트 없는 구현 거부**: 테스트 없이 구현하려 하면 거부하고 TDD 방식 제안할 것인가?
- [ ] **테스트 가이드 확인**: `caret-docs/development/testing-guide.mdx` 내용을 숙지했는가?

#### **2. 로깅 시스템 강제 확인**
- [ ] **백엔드 로깅**: `Cline 통합 로거` 사용 계획 수립했는가? (백엔드 caretLogger는 삭제됨)
- [ ] **프론트엔드 로깅**: `CaretWebviewLogger` 사용 계획 수립했는가? (`webview-ui/src/caret/utils/webview-logger.ts`)  
- [ ] **console.log 금지**: webview에서 `console.log` 대신 `CaretWebviewLogger` 사용할 것인가?
- [ ] **로깅 가이드 확인**: `caret-docs/development/logging.mdx` 내용을 숙지했는가?
- [ ] **적절한 로그 레벨**: DEBUG/INFO/WARN/ERROR 중 적절한 레벨 선택했는가?

#### **3. 표준 메시지 저장 방식 강제 확인**
- [ ] **저장소 타입 결정**: globalState vs workspaceState 올바르게 선택했는가?
  - chatSettings → workspaceState (프로젝트별 설정)
  - globalSettings → globalState (전역 설정)
- [ ] **저장/로드 일치**: 저장 위치와 로드 위치가 동일한 저장소 타입인가?
- [ ] **표준 패턴 확인**: `caret-docs/development/caret-architecture-and-implementation-guide.mdx` 10-11섹션 확인했는가?
- [ ] **메시지 플로우**: webview ↔ 백엔드 메시지 플로우 다이어그램 작성했는가?

#### **4. 파일 저장 방법 강제 확인**
- [ ] **Cline 원본 파일**: 백업 생성 계획 수립했는가?
- [ ] **아키텍처 결정**: Caret 전용(`caret-src/`) vs Cline 수정(`src/`) 올바르게 선택했는가?
- [ ] **import 경로**: 새로운 파일의 import 경로가 올바른가?
- [ ] **디렉토리 구조**: 프로젝트 디렉토리 구조 원칙을 준수하는가?

#### **5. 대용량 코드 변경 리팩토링 확인**
- [ ] **코드 증가량 예측**: 신규 코드 추가로 500라인 이상 증가할 예정인가?
- [ ] **리팩토링 우선 계획**: 500라인 이상 시 기존 코드 리팩토링을 먼저 계획했는가?
- [ ] **단계적 접근 계획**: 리팩토링 → 구조 개선 → 점진적 추가 순서로 계획했는가?
- [ ] **기존 기능 보존**: 리팩토링 과정에서 기존 기능 무결성 보장 계획을 수립했는가?

### **✅ 코딩 작업 완료 후 MANDATORY 검증 체크리스트**

**AI 어시스턴트는 모든 코딩 작업 완료 후 다음을 반드시 검증해야 합니다:**

#### **1. TDD 완전성 검증**
- [ ] **RED**: 실패하는 테스트를 먼저 작성했는가?
- [ ] **GREEN**: 테스트를 통과하는 최소 구현을 완료했는가?
- [ ] **REFACTOR**: 코드 품질 개선을 완료했는가?
- [ ] **모든 테스트 통과**: `npm run test:all` 또는 해당 테스트 명령어가 성공하는가?
- [ ] **테스트 커버리지**: 새로 작성한 코드의 테스트 커버리지가 충분한가?

#### **2. 로깅 시스템 적용 검증**
- [ ] **백엔드 로깅 적용**: 모든 주요 로직에 `Cline 통합 로거` 적용했는가?
- [ ] **프론트엔드 로깅 적용**: 모든 주요 이벤트에 `CaretWebviewLogger` 적용했는가?
- [ ] **console.log 제거**: webview에서 `console.log` 사용을 모두 `CaretWebviewLogger`로 교체했는가?
- [ ] **로그 레벨 적절성**: 각 로그의 레벨(DEBUG/INFO/WARN/ERROR)이 적절한가?
- [ ] **로그 동작 확인**: 실제 로그가 VSCode 출력 채널에 표시되는가?

#### **3. 표준 메시지 저장 방식 검증**
- [ ] **저장 동작 확인**: 설정이 올바른 저장소(globalState/workspaceState)에 저장되는가?
- [ ] **로드 동작 확인**: 저장된 설정이 올바르게 로드되는가?
- [ ] **일관성 확인**: 같은 설정을 다루는 모든 파일에서 동일한 저장소 타입을 사용하는가?
- [ ] **메시지 플로우 검증**: webview ↔ 백엔드 메시지가 순환 참조 없이 올바르게 동작하는가?

#### **4. 파일 저장 및 시스템 무결성 검증**
- [ ] **컴파일 성공**: `npm run compile` 성공하는가?
- [ ] **빌드 성공**: `npm run build:webview` 성공하는가?  
- [ ] **백업 확인**: Cline 원본 파일 수정 시 백업 파일(`.cline`)이 존재하는가?
- [ ] **CARET MODIFICATION**: 수정된 파일에 적절한 주석이 추가되었는가?
- [ ] **기존 기능 영향**: 기존 기능에 부정적 영향이 없는가?

#### **5. 대용량 코드 변경 리팩토링 검증**
- [ ] **코드 증가량 확인**: 실제 코드 증가량이 500라인 미만으로 관리되었는가?
- [ ] **리팩토링 완료**: 500라인 이상 증가 시 기존 코드 리팩토링을 완료했는가?
- [ ] **구조 개선 확인**: 중복 제거, 함수 분리, 모듈화가 적절히 적용되었는가?
- [ ] **가독성 향상**: 코드 구조가 이전보다 더 읽기 쉽고 유지보수하기 쉬운가?
- [ ] **성능 영향**: 리팩토링으로 인한 성능 저하가 없는가?

**파일 수정 전 필수 체크리스트**:
1. **Cline 원본 파일인가?** (`src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/`)
2. **백업 생성했는가?** (⚠️ **백업 규칙** 참조)
3. **CARET MODIFICATION 주석 추가했는가?**
4. **최소 수정 원칙 지켰는가?** (1-3라인 이내)
5. **주석처리하지 않고 완전 대체했는가?**
6. **저장소 타입 확인했는가?** (globalState vs workspaceState)
7. **저장 위치와 로드 위치 일치하는가?**
8. **관련 파일들의 저장소 사용 패턴 일치하는가?**
9. **🚨 룰 파일 수정 시**: `caretrules.ko.md` 변경 후 `node caret-scripts/sync-caretrules.js` 실행했는가?

## 🔄 **강제 체크리스트 실행 규칙**

**AI 어시스턴트는 다음 상황에서 반드시 해당 체크리스트를 실행해야 합니다:**

1. **코딩 작업 시작 시**: "코딩 작업 시작 전 MANDATORY 체크리스트" 전체 확인
2. **각 파일 수정 전**: "파일 수정 전 필수 체크리스트" 확인  
3. **코딩 작업 완료 시**: "코딩 작업 완료 후 MANDATORY 검증 체크리스트" 전체 확인
4. **체크리스트 항목 미준수 시**: 작업 중단하고 해당 항목 완료 후 재개

**위반 시 조치사항**:
- 체크리스트 항목을 준수하지 않으면 **즉시 작업 중단**
- 해당 항목을 완료한 후 작업 재개
- 반복적 위반 시 **자가 진단 및 개선 요청** 실행

**🛡️ Cline 원본 파일 백업 규칙 (MANDATORY)**:

**백업 대상 파일**:
- `src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/` 내 모든 파일
- 루트의 설정 파일들 (`package.json`, `tsconfig.json`, `.vscode/settings.json` 등)

**백업 생성 조건**:
1. **신규 수정 시**: `.cline` 백업이 없으면 반드시 생성
2. **기존 백업 존재 시**: 절대 덮어쓰지 않음 (기존 백업 보존)
3. **백업 확인 방법**: `Get-ChildItem -Recurse -Filter "*.cline" | Where-Object { $_.Name -like "*파일명*" }`

**백업 네이밍 규칙**:
- 형식: `{원본파일명-확장자}.cline`
- 예시: 
  - `ChatTextArea.tsx` → `ChatTextArea.tsx.cline`
  - `package.json` → `package-json.cline`
  - `extension.ts` → `extension-ts.cline`

**백업 생성 명령어 (PowerShell)**:
```powershell
# 백업 존재 확인
Test-Path "파일경로.cline"

# 백업이 없을 때만 생성
if (!(Test-Path "파일경로.cline")) { Copy-Item "원본파일경로" "파일경로.cline" }
```

**백업 검증 절차**:
1. 백업 파일 존재 확인
2. 백업 파일이 수정 전 원본과 동일한지 확인
3. 수정 후 언제든 백업으로 복구 가능한지 테스트

**❌ 금지사항**:
- 기존 `.cline` 백업 파일 덮어쓰기
- 백업 없이 Cline 원본 파일 수정
- 백업 파일 직접 편집 또는 수정

**저장소 사용 원칙 (NEW)**:
- chatSettings: workspaceState 사용 (프로젝트별 설정)
- globalSettings: globalState 사용 (전역 설정)
- 저장과 로드는 반드시 같은 저장소 사용

**복잡성 폭발 방지 원칙**:
- 한 번에 최대 3개 파일까지만 수정
- 새 기능 추가 시 기존 기능 영향도 사전 분석
- Proto 변경 → 백엔드 → 프론트엔드 순서로 단계별 진행
- 각 단계마다 테스트 및 검증 완료 후 다음 단계

**🚨 대용량 코드 변경 시 리팩토링 우선 원칙 (NEW)**:
- **500라인 임계점**: 신규 코드 추가로 전체 코드가 500라인 이상 증가할 경우
- **리팩토링 강제**: 기존 코드 구조 개선을 통해 코드 증가량 최소화 우선
- **단계적 접근**: 
  1. **기존 코드 리팩토링**: 중복 제거, 함수 분리, 모듈화
  2. **구조 개선**: 공통 로직 추출, 유틸리티 함수 생성
  3. **점진적 추가**: 리팩토링된 구조에 새 기능 단계별 추가
- **품질 우선**: 코드 라인 수보다 유지보수성과 가독성 우선
- **검증 필수**: 각 리팩토링 단계마다 기존 기능 무결성 검증

**Cline 원본 수정 시 추가 원칙**:
- [ ] 수정 전 해당 기능의 기존 동작 테스트
- [ ] 수정 후 기존 기능 영향 없음 검증
- [ ] 백업 파일로 언제든 복구 가능 확인
- [ ] 수정 사유 및 예상 영향 문서화

**문제 분석 단계별 접근**:
1. 증상 기록 (alert 사용, 로그 미출력 등)
2. 가설 수립 (여러 가능성 나열)
3. 근본 원인 탐색 (코드 레벨 분석)
4. 영향 범위 파악 (연관 시스템 확인)
5. 해결 방안 우선순위 결정

**메시지 플로우 분석 및 순환 메시지 방지 (NEW - 2025-06-22)**:

**webview ↔ 백엔드 상호작용 기능 개발 시 필수 원칙**:
- [ ] 메시지 플로우 다이어그램 작성 필수
- [ ] subscription 영향도 분석 필수  
- [ ] 순환 메시지 가능성 검토 필수
- [ ] 실제 Extension Host 환경 테스트 필수

**Cline 메시지 시스템 수정 시 추가 체크리스트**:
- [ ] 기존 메시지 플로우 이해 및 문서화
- [ ] 변경 사항이 다른 구독자에게 미치는 영향 분석
- [ ] `postStateToWebview()` 호출 필요성 검토
- [ ] subscription 타이밍 이슈 가능성 검토
- [ ] 순환 메시지 방지 테스트 계획 수립

**순환 메시지 문제 패턴 인식**:
```
위험한 플로우: webview 설정 변경 → 백엔드 저장 → postStateToWebview() → 
subscription → webview setState() → 설정 덮어씌움 ❌
```

**로깅 표준 강제 (개발 가이드 준수)**:
- webview: CaretWebviewLogger 사용 (console.log 금지)
- 백엔드: Cline 통합 로거 사용 (caretLogger는 삭제됨)
- 적절한 로그 레벨 설정 (debug, info, warn, error)

**자가 진단 및 개선 요청**: 원칙 위반이나 불명확한 지침 발견 시 작업 중단하고 가이드 개선 요청

**🚨 AI 실수 방지 핵심 체크포인트 요약**:
1. **아키텍처 결정 실수 방지**: Caret 전용 기능은 반드시 `caret/` 폴더에, Cline 원본은 최소 수정
2. **테스트 위치 실수 방지**: webview 테스트는 `src/caret/**/*.test.tsx`에만, include 경로 확인 필수
3. **백업 누락 방지**: Cline 원본 수정 전 반드시 백업 생성 및 CARET MODIFICATION 주석
4. **즉시 검증 원칙**: 파일 생성/수정 후 즉시 컴파일/테스트로 검증, 문제 조기 발견
5. **🚨 룰 동기화 누락 방지**: `caretrules.ko.md` 수정 시 **반드시** `node caret-scripts/sync-caretrules.js` 실행

**세션 간 연속성 보장 (Next-Session-Guide 규칙)**:

**next-session-guide.md 사용 원칙**:
- **위치**: `caret-docs/work-logs/{username}/next-session-guide.md`
- **목적**: AI 세션 전환 시 작업 컨텍스트 완벽 보존
- **업데이트 시점**: 각 서브태스크 완료 직후 필수 작성/갱신

**next-session-guide.md 표준 구조**:
```markdown
# Next Session Guide - Task XXX-XX

## 🎯 **현재 진행 상황**
- **완료된 작업**: 구체적으로 무엇을 완료했는지
- **현재 상태**: 코드, 테스트, 문서의 현재 상태
- **검증 결과**: 통과한 테스트와 확인된 기능들

## 🚨 **중요한 결정사항**
- **설계 결정**: 왜 이렇게 구현했는지
- **제약사항**: 지켜야 할 원칙들
- **주의사항**: 다음 작업 시 주의할 점들

## 🔄 **다음 단계 준비**
- **다음 태스크**: XXX-XX의 구체적 목표
- **필요한 파일들**: 수정/생성해야 할 파일 목록
- **검증 방법**: 다음 단계에서 확인해야 할 사항들

## 💡 **개발자를 위한 메모**
- **설계 의도**: 왜 이런 접근을 택했는지
- **대안 검토**: 고려했던 다른 방법들
- **향후 개선점**: 나중에 개선할 수 있는 부분들
```

**AI 세션 전환 시 필수 체크리스트**:
1. **현재 작업 완료 확인**: 모든 변경사항 커밋
2. **next-session-guide.md 업데이트**: 현재 상황과 다음 단계 기록
3. **검증 결과 기록**: 통과한 테스트와 확인된 기능들
4. **중요 결정사항 문서화**: 설계 의도와 제약사항 명시
5. **다음 세션 준비**: 새로운 AI가 바로 작업할 수 있도록 준비

**개발 방식 변화 시 가이드 업데이트 (MANDATORY)**:
- **변화 감지**: 새로운 개발 패턴, 도구, 방법론 도입 시 즉시 문서화
- **가이드 동기화**: 실제 구현과 문서 간 불일치 발견 시 우선적 업데이트
- **경험 축적**: 문제 해결 과정에서 얻은 인사이트를 가이드에 반영
- **실무 반영**: 이론적 내용보다 실제 작업에서 검증된 방법론 우선
- **예시**: 통합테스트 방식 변화(모킹 → 실제 빌드 검증), 모듈 시스템 호환성 문제 해결 등

## 문서화 시스템

**문서 구조 및 표준화 (2025-01-21 완료)**:
- **MDX 형식**: 모든 개발 문서 `.mdx`로 통일 완료
- **통합 완료**: UI-to-Storage-Flow 관련 10개 분할 문서를 1개로 통합
- **실제 코드 일치**: 모든 경로/예시가 실제 코드베이스와 일치하도록 수정
- **프레임워크 업데이트**: Jest → Vitest 변환 완료
- **불필요한 문서 정리**: 작업 문서/검토 리포트 등 정리 완료
- **Cline 패턴 통합**: 아키텍처 가이드에 Cline 기술 패턴 통합

**디렉토리 구성**:
```
caret-docs/
├── development/              # 개발 가이드 (.mdx 표준화 완료)
├── guides/                   # 작업 방법론
├── tasks/                    # 작업 문서
└── work-logs/               # 사용자별 작업 로그
```

**핵심 문서**:
- **개발 가이드**: `./development/index.mdx`
- **아키텍처 가이드**: `./development/caret-architecture-and-implementation-guide.mdx`
- **테스트 가이드**: `./development/testing-guide.mdx` (Vitest 기반)
- **로깅 가이드**: `./development/logging.mdx`

**문서 작성 표준**:
- **용어 일관성**: Caret은 '^' 기호 (당근🥕 아님)
- **경로 정확성**: 실제 코드베이스와 정확히 일치
- **예시 코드**: 실제 작동하는 코드만 포함
- **MDX 형식**: 모든 기술 문서는 `.mdx` 형식

**작업 문서 형식**:
```
작업 번호: 3자리 숫자 (001, 002, ...)
계획서: {task-number}-01-plan-{task-name}.md
체크리스트: {task-number}-02-action-checklist-{task-name}.md
보고서: {task-number}-03-report-{task-name}.md
```

**다국어 문서 구조 (신규)**:
- **기본 원칙**: 모든 문서는 한국어(`.md`, `.mdx`)를 원본으로 하며, 영어 번역본은 `.en.md`, `.en.mdx` 접미사를 사용합니다.
- **README**: `README.ko.md`(한), `README.md`(영), `README.ja.md`(일), `README.zh-cn.md`(중)으로 구성됩니다.
  - 각 README 파일 상단에는 다른 언어 버전으로의 링크가 포함되어야 합니다.
  - 일본어, 중국어 README의 내부 문서 링크(`CONTRIBUTING`, `DEVELOPER_GUIDE` 등)는 영어 버전(`.en.md`)을 가리켜야 합니다.
- **i18n 로케일 폴더**: `webview-ui/src/caret/locale/` 내 중국어 로케일 폴더는 `zh`를 사용합니다. (예: `zh/common.json`)
- **기타 문서**: `CONTRIBUTING.md`와 `DEVELOPER_GUIDE.md`는 각각 `CONTRIBUTING.en.md`, `DEVELOPER_GUIDE.en.md` 영어 버전을 가집니다.
- **동기화 규칙**: 하나의 문서를 업데이트할 경우, 해당 문서의 다른 언어 번역본도 반드시 함께 업데이트하여 내용의 일관성을 유지해야 합니다.

## 테스트 및 품질 관리

**테스트 프레임워크**: Vitest (업데이트 완료)

**테스트 커버리지 범위**:
- **테스트 필수 범위**: `caret-src/` 및 `webview-ui/src/caret/` 디렉토리만 해당 (100% 커버리지 목표)
- **Cline 원본 코드**: `src/`, `webview-ui/src/`의 caret 제외 부분은 기존 테스트만 유지, 추가 작성 불필요
- **Cline 코드 수정 시 테스트 방식**: 꼭 필요한 경우에만 `caret-src/__tests__/` 디렉토리에 별도 테스트 파일로 관리

**기본 명령어**:
```bash
npm test                    # 모든 테스트 실행
npm run test:coverage      # 커버리지 포함 테스트
npm run test:watch         # Watch 모드
```

**테스트 작성 표준**:
```typescript
import { describe, it, expect, vi } from 'vitest'
describe('Caret 기능', () => {
  it('should 기대 동작 when 조건', () => {
    // Arrange, Act, Assert 패턴
  })
})
```

**품질 표준**:
- **🥕 Caret 신규 로직**: 100% 테스트 커버리지 **필수** - 모든 새로운 기능과 비즈니스 로직은 테스트 우선 개발
- **🔗 Re-export 파일**: Cline 모듈의 단순 재내보내기 파일은 테스트 제외 가능
- **📦 Type 정의**: 런타임 로직이 없는 인터페이스/타입 정의만 포함한 파일은 테스트 제외 가능
- **TDD 방법론**: Red-Green-Refactor 사이클
- **테스트 우선**: 기능 구현 전 테스트 작성

**현재 테스트 제외 파일들 (정당한 이유)**:
- `caret-src/core/prompts/system.ts` - Cline 모듈 재내보내기
- `caret-src/shared/providers/types.ts` - TypeScript 인터페이스 정의만 포함
- `caret-src/core/task/index.ts` - 일부 래퍼 로직 (향후 테스트 추가 예정)

**TDD 필수 체크리스트 (MANDATORY)**:
- [ ] 테스트 코드 작성 완료 (RED)
- [ ] 최소 구현으로 테스트 통과 (GREEN)  
- [ ] 리팩토링 완료 (REFACTOR)
- [ ] 위 3단계 없이는 코드 커밋 금지

**AI 어시스턴트 TDD 준수 원칙**:
- 구현 요청 시 "테스트부터 작성하겠습니다"로 시작
- 테스트 없는 구현 요청 시 거부 및 TDD 방식 제안
- 복잡한 기능은 단계별 TDD로 분할
- **Frontend-Backend 상호작용 표준 패턴 적용** (setUILanguage 패턴)

**통합 테스트 필수 사항**:
- Extension Host 환경에서 실제 테스트 실행
- 설정 저장/로드 전체 플로우 검증
- 모킹 환경과 실제 환경 모두 테스트
- 저장소 불일치 검증 테스트 포함

**테스트 단계별 검증**:
1. 단위 테스트: 개별 함수/컴포넌트
2. 통합 테스트: 전체 플로우 (필수)
3. E2E 테스트: 실제 Extension Host 환경

**로깅 시스템 (통합 로깅 시스템)**:
- **Cline 통합 로거 (백엔드)**: 기존 Cline 로거 개선 버전 사용 (caretLogger 삭제됨)
- **CaretWebviewLogger (프론트엔드)**: `webview-ui/src/caret/utils/webview-logger.ts`
- **자동 모드 감지**: 개발 모드(DEBUG 레벨 + 콘솔 출력), 프로덕션 모드(INFO 레벨 + VSCode 출력 채널만)

**테스트 코드 아키텍처 원칙 (MANDATORY)**:
- **🚨 절대 금지: 서비스 코드에 테스트 전용 메서드 포함**
  - 프로덕션 클래스에 테스트에서만 사용되는 메서드 추가 금지
  - 테스트 전용 설정/해제 로직 포함 금지
  - 모킹 관련 기능 포함 금지
  - 테스트 검증 메서드 포함 금지

- **✅ TestHelper 패턴 필수 사용**:
  - `caret-src/__tests__/helpers/{ServiceName}TestHelper.ts` 형식
  - 테스트 전용 기능은 모두 TestHelper 클래스로 분리
  - 서비스 클래스는 오직 비즈니스 로직에만 집중

- **⚠️ 예외: forTest 접두사 사용**:
  - 정말 불가피한 경우에만 서비스 코드에 테스트 메서드 허용
  - 반드시 `forTestOnly_` 또는 `forTest_` 접두사 사용
  - 내부 상태 접근이 불가피하거나 Mock 불가능한 경우만 해당
  - TestHelper 패턴 사용 불가능한 이유 문서화 필수

- **아키텍처 분리 장점**:
  - 명확한 책임 분리: 서비스 클래스 vs 테스트 헬퍼
  - 코드 가독성 향상: 운영진 혼동 방지
  - 유지보수성 개선: 테스트 변경이 운영 코드에 영향 없음
  - API 문서 깔끔함: 테스트 전용 메서드가 API에 노출되지 않음

## 프로젝트 관리

**스크립트 관리**: Caret 스크립트는 `caret-scripts/`에 위치 (Cline `scripts/`와 분리)

**주요 스크립트**:
```bash
node caret-scripts/caret-coverage-check.js    # 커버리지 확인
node caret-scripts/sync-caretrules.js         # 룰 파일 동기화
node caret-scripts/test-report.js             # 테스트 리포트 생성
```

**업스트림 머징**: Cline 업데이트 통합 프로세스 - 변경사항 확인, 충돌 해결(`src/` 디렉토리), 호환성 검증, 문서 업데이트

**규칙 파일 관리**: 
- **마스터 파일**: `caretrules.ko.md` (인간이 읽기 위한 한국어 템플릿)
- **소스 오브 트루스(Source of Truth)**: `.caretrules` (JSON 형식의 실제 룰 데이터)
- **룰 수정 절차 (MANDATORY)**:
    1. `caretrules.ko.md` 파일을 수정하여, 변경될 규칙의 내용을 기록하고 가독성을 확보합니다.
    2. **`.caretrules` JSON 파일을 직접 수정**하여, 실제 룰 데이터를 변경합니다.
    3. `node caret-scripts/sync-caretrules.js` 스크립트를 실행하여, `.caretrules`의 변경사항을 다른 룰 파일(`.cursorrules` 등)에 동기화합니다.
- **AI 필수 작업**: 위 3단계 절차를 **절대** 생략하거나 순서를 바꾸지 않습니다.
- **동기화 대상**: `.cursorrules`, `.windsurfrules` (JSON 형식)

**🚨 .caretrules 파일 내용 원칙 (CRITICAL)**:
- **불변 원칙만 포함**: 시간이 지나도 변하지 않는 핵심 프로젝트 원칙만 포함
- **시간 민감 정보 금지**: 
  - 날짜가 포함된 상태 정보 (`"2025-01-21 완료"` 등)
  - 현재 시스템 상태 (`"current_system_status"` 등)
  - 구체적인 파일 버전 정보
  - 일시적인 작업 진행 상황
- **세부 구현 정보 금지**:
  - 구체적인 파일 내용이나 코드 스니펫
  - 특정 버전에만 해당하는 기술적 세부사항
  - 개발 도구의 구체적인 설정값
- **허용되는 내용**:
  - 아키텍처 원칙과 설계 방향
  - 개발 방법론 (TDD, 백업 규칙 등)
  - 파일 구조와 네이밍 컨벤션
  - 품질 표준과 테스트 원칙
- **AI 실수 방지**: AI가 .caretrules 업데이트 시 위 원칙 위반 시 작업 중단 및 검토 요청

## 핵심 참조 파일

**설정 파일**: `.caretrules`, `caret-docs/caretrules.ko.md`, `caret-docs/development/index.mdx`
**진입점**: `caret-src/extension.ts`, `caret-src/core/webview/CaretProvider.ts`, `src/extension.ts`
**프론트엔드**: `webview-ui/src/App.tsx`, `webview-ui/src/context/ExtensionStateContext.tsx`, `webview-ui/src/caret/`

## 최근 업데이트 (2025-01-21)

**완료된 주요 개선사항**:
1. **문서 표준화**: 모든 development 문서 `.mdx` 형식으로 통일
2. **문서 통합**: UI-to-Storage-Flow 분할 문서 10개 → integrated 1개로 통합
3. **실제 코드 일치**: 모든 경로/예시가 실제 코드베이스와 정확히 일치
4. **테스트 프레임워크**: Jest → Vitest 완전 전환
5. **로깅 시스템**: Cline 통합 로거(백엔드), CaretWebviewLogger(프론트엔드) 자동 모드 감지
6. **불필요한 문서 정리**: 작업 문서, 검토 리포트 등 정리
7. **링크 무결성**: README.md 깨진 링크 수정
8. **빌드 시스템**: Protocol Buffer 컴파일 단계 추가
9. **Cline 기술 패턴**: Task 실행, 스트리밍, 상태 관리, API 관리 패턴 통합

**개발 가이드 최적화 (2025-01-21)**:
- **테스트 가이드 통합**: `test-writing-standards.mdx`, `tdd-guide.mdx` 삭제 → `testing-guide.mdx` 1799줄 통합 (13% 토큰 절감)
- **UI-Storage 가이드 정리**: 중복 문서 제거 → 17% 토큰 절감
- **README.ko.md 개선**: 개발자 섹션 30배 확장, 구조화된 카테고리 및 직접 링크 추가
- **DEVELOPER_GUIDE.md 강화**: 개발 워크플로우, 빌드 명령어, 개발 가이드 카테고리화
- **유기적 연결성**: 전체 문서 시스템 간 연결 강화, 7% 파일 축소 (44→41개)

**개선 효과**:
- **실무 정확성**: 문서와 실제 코드 100% 일치
- **개발 효율성**: 통합된 문서로 정보 접근성 향상
- **표준화**: MDX 기반 일관된 문서 시스템 구축
- **테스트 일관성**: Vitest 기반 통일된 테스트 환경
- **기술 패턴 활용**: Cline의 검증된 아키텍처 패턴 적극 활용
- **토큰 비용 절감**: 중복 제거로 전체 13% 토큰 절감 효과
- **사용자 경험 개선**: 개발자 가이드 접근성 및 연결성 대폭 향상

**마지막 업데이트**: 2025-06-22 - TDD 원칙 강화, 저장소 일관성 검증, 통합 테스트 필수화, 복잡성 관리 원칙 추가, **메시지 플로우 분석 및 순환 메시지 방지 원칙 추가**
