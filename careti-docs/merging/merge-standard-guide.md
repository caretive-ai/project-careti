# Careti-Cline 머징 표준 가이드

**작성일**: 2025-10-12
**최종 업데이트**: 2025-10-14
**버전**: v1.1
**기반**: 2025-10-09~2025-10-14 머징 경험 및 피드백 (1차~9차)
**상태**: 🔄 Living Document - 계속 개선

---

## 📋 목차

1. [개요](#개요)
2. [머징 전 준비](#머징-전-준비)
3. [Phase별 상세 프로세스](#phase별-상세-프로세스)
4. [Critical Files 관리](#critical-files-관리)
5. [검증 체크리스트](#검증-체크리스트)
6. [Feature 문서 작성 기준](#feature-문서-작성-기준)
7. [교훈 및 함정](#교훈-및-함정)
8. [문제 해결 가이드](#문제-해결-가이드)
9. [최신 머징 전략 (Attempt 2 기반)](#최신-머징-전략-attempt-2-기반)

---

## 최신 머징 전략 (Attempt 2 기반)

### 1. Hybrid Pattern (하이브리드 패턴)
**정의**: Cline의 기존 로직을 유지하면서 Careti의 기능을 선택적으로 주입하는 패턴. `Level 2 (Conditional)`의 구체화된 형태입니다.

**적용 원칙**:
- **Intercept & Delegate**: Cline의 핵심 로직 실행 직전에 Careti 모드인지 확인하고, 맞다면 Careti 전용 로직으로 위임합니다.
- **Fallback to Base**: Careti 모드가 아니거나 특정 조건이 맞지 않으면 즉시 Cline 원본 로직으로 떨어집니다.

**성공 사례 (Attempt 2)**:
- **System Prompt**: `Task/index.ts`에서 `modeSystem`을 확인. `"careti"`이면 `CaretiPromptWrapper` 사용, 아니면 기존 `PromptRegistry` 사용.
- **Auth**: `SharedUriHandler.ts`에서 `provider === "careti"`일 때만 `CaretiGlobalManager`로 토큰 처리, 그 외엔 기존 로직 수행.

### 2. Logic-based 3-way Comparison (논리 기반 3자 비교)
**정의**: 단순한 코드 diff가 아니라, **Base Logic (Cline)**, **Target Logic (Careti Specs)**, **Merged Logic (Implementation)** 3가지 차원에서 논리적 정합성을 검증하는 방법.

**검증 프로세스**:
1. **Base Logic 분석**: 원본 Cline이 어떻게 동작하는지 파악 (예: Query 파라미터만 파싱).
2. **Target Logic 정의**: Careti이 무엇을 필요로 하는지 정의 (예: Hash 파라미터 파싱 필요).
3. **Merged Logic 검증**: 구현된 코드가 Base를 해치지 않으면서 Target을 달성했는지 확인 (예: Query + Hash 모두 파싱하도록 확장).

**문서화**: 리뷰 문서 작성 시 이 3가지 차원의 비교 표를 포함하여 "왜 이렇게 수정했는지"를 논리적으로 증명해야 합니다.

---

---

## 개요

### 목적
Cline upstream을 Careti에 안전하게 머징하기 위한 표준 프로세스 정의

### 핵심 원칙
1. **최소 침습**: Cline 코드 최대한 보존
2. **Careti 보존**: Careti 기능 100% 유지
3. **검증 철저**: 빌드 + 런타임 검증 필수
4. **문서화**: 모든 변경사항 기록
5. **빌드-우선 완화**: Cline 소스는 기능 변경 없이 린트/빌드 통과가 가능하도록 설정을 우선 조정하고, 불가피하게 코드 수정 시 1~3줄 이내 + `// CARETI MODIFICATION` 주석으로 최소 침습 적용 (Careti 소스는 자유 수정 가능)

### 머징 전략
- **Level 1 (Preferred)**: Careti 전용 디렉토리 (`careti-src/`, `careti-docs/` 등)
- **Level 2 (Conditional)**: Cline 파일 최소 수정 (1-3 lines, `CARETI MODIFICATION` 주석)
- **Level 3 (Critical)**: Frontend Context 통합 등 필수 수정
- **Frontend 머지 이후 필수 정리**: Webview/루트 브랜딩과 빌드 정합성을 즉시 확인한다.
  - `package.json` contributes(views/commands/category), ActivityBar/Webview ID, Output channel/Logger 이름이 Careti인지 확인.
  - 브랜드 자산(`assets/icons/*`, 배너/agent 이미지 등) 재복사 후 빌드.
  - **가장 먼저**: upstream `package.json`/정적 리소스(`assets/**`, public/icons 등)를 그대로 복사해 빌드/런타임이 깨지지 않는지 확인하고, 이후 Careti 브랜딩을 덮어쓴다. 이 단계를 건너뛰면 CLI/아이콘 누락이 뒤늦게 발견된다.
  - **3-way 원칙(구조 변경 시)**: Webview 구조/컴포넌트가 upstream에서 바뀌었으면 base/cline/careti 3-way로 구조를 먼저 가져온 뒤, Careti 전용 기능·i18n·브랜딩을 다시 주입한다(“구조는 cline, 기능은 careti”). 임의로 기존 구조를 고집하지 않는다.
  - **Feature 매핑 의무화**: f03(브랜딩/자산), f04(계정), f07(페르소나) 등 기능 문서의 필수 조건(자산 번들 포함, caretUserProfile 전달, persona import 매핑)을 체크리스트로 작성해, 모든 항목 체크 후에만 머지 완료로 간주한다.
  - **상태 전파 검증**: `postStateToWebview`/apiConfiguration에 careti 필드(caretUserProfile 등)가 내려가는지 로그/단위테스트로 확인하고, 로그인/모드/모델이 실제 반영되는지 실행 경고까지 검사한다.
  - Cline 소스에 손댄 부분은 1~3줄 이내 + `// CARETI MODIFICATION` 주석 필수.
  - 린트/빌드 오류는 설정 override/제외로 우선 해결, 범위를 최소화하고 문서화.

---

## 머징 전 준비

### 1. 환경 설정

#### 1.1 Git 설정
```bash
# Upstream remote 추가 (최초 1회)
git remote add upstream https://github.com/cline/cline.git

# Upstream 최신화
git fetch upstream

# 현재 Cline 버전 확인
git log upstream/main --oneline -5
```

#### 1.2 백업 생성
```bash
# 1. 현재 브랜치 백업
git checkout main
git tag backup-before-merge-$(date +%Y%m%d)

# 2. 작업 브랜치 생성
git checkout -b merge/cline-upstream-$(date +%Y%m%d)
```

#### 1.3 빌드 검증
```bash
# 의존성 확인
npm install
cd webview-ui && npm install && cd ..

# 현재 상태 빌드
npm run compile
npm run protos
cd webview-ui && npm run build
```

**체크리스트**:
- [ ] Upstream remote 설정됨
- [ ] 백업 태그 생성됨
- [ ] 작업 브랜치 생성됨
- [ ] 현재 상태 빌드 성공

---

## Phase별 상세 프로세스

### Phase 0: AI Rules 우선 복구 (Priority 0) ⭐ **가장 중요**

**목표**: AI 에이전트가 올바른 머징 규칙(Hybrid Pattern, Minimal Invasion)을 따르도록 규칙 파일을 가장 먼저 복구.

**이유**: `.agents/context`에는 머징 전략과 AI 행동 지침이 포함되어 있습니다. 이 파일들이 없으면 AI가 머징 과정에서 잘못된 판단을 할 수 있습니다.

**체크리스트**:
- [ ] `.agents/context` 디렉토리 우선 복구
  ```bash
  # 백업에서 .agents/context만 먼저 복구
  cp -r /tmp/careti-backup-$(date +%Y%m%d)/.agents/context ./
  ```
- [ ] AI 세션 재시작 또는 규칙 리로드 (필요 시)
- [ ] AI에게 현재 머징 전략(`merge-standard-guide.md`)을 인지시킴

---

### Phase 1: 준비 및 백업

**목표**: 안전망 구축

**체크리스트**:
- [ ] Git 백업 완료
- [ ] Careti 전용 디렉토리 백업 (별도 경로)
  ```bash
  mkdir -p /tmp/careti-backup-$(date +%Y%m%d)
  cp -r careti-src /tmp/careti-backup-$(date +%Y%m%d)/
  cp -r careti-docs /tmp/careti-backup-$(date +%Y%m%d)/
  cp -r assets /tmp/careti-backup-$(date +%Y%m%d)/
  cp -r careti-scripts /tmp/careti-backup-$(date +%Y%m%d)/
  cp -r .agents/context /tmp/careti-backup-$(date +%Y%m%d)/
  ```
- [ ] 백업 크기 확인 (예상: 5-10MB)
- [ ] Upstream Cline 버전 기록

---

### Phase 2: Upstream 완전 채택

**목표**: Cline 최신 코드로 교체 (Careti 수정 모두 제거)

**⚠️ CRITICAL**: 이 단계에서 모든 Cline 파일이 upstream 버전으로 교체됨

**체크리스트**:
- [ ] Careti 전용 디렉토리 백업 확인 (Phase 1)
- [ ] Hard Reset 실행
  ```bash
  git reset --hard upstream/main
  ```
- [ ] Reset 후 Careti 디렉토리 사라진 것 확인 (정상)
- [ ] Careti 디렉토리 복원
  ```bash
  cp -r /tmp/careti-backup-$(date +%Y%m%d)/careti-src ./
  cp -r /tmp/careti-backup-$(date +%Y%m%d)/careti-docs ./
  cp -r /tmp/careti-backup-$(date +%Y%m%d)/assets ./
  cp -r /tmp/careti-backup-$(date +%Y%m%d)/careti-scripts ./
  cp -r /tmp/careti-backup-$(date +%Y%m%d)/.agents/context ./
  ```
- [ ] Git에 추가 및 커밋
  ```bash
  git add careti-src/ careti-docs/ assets/ careti-scripts/ .agents/context/
  git commit -m "chore: Restore Careti-specific directories after upstream reset"
  ```

#### Phase 2.1: 루트 빌드/ignore 파일 즉시 복구 (VSIX 용량 보호)

**목표**: Cline 기본 `.vscodeignore`/`.gitignore`가 그대로 덮어쓰여 VSIX가 수백 MB로 커지는 사고를 예방.

**체크리스트**:
- [ ] `careti-main/.vscodeignore` → 리포지터리 루트로 복사 (화이트리스트 버전 유지)
- [ ] `careti-main/.gitignore` → 루트로 복사 (필요 시 Careti 항목 병합)
- [ ] 복구 직후 `npx vsce ls --packageManager npm` 또는 `ls -lah dist/ webview-ui/build/`로 포함 파일 확인
- [ ] `npm run package:release` 실행 전, VSIX 용량이 50MB 내외인지 확인 (경고 발생 시 .vscodeignore 재점검)

> **WHY?** upstream reset 이후 이 단계가 누락되면 CLI/standalone/merge 비교 디렉토리가 그대로 포함되어 1GB 이상의 VSIX가 생성된다. 모든 프런트/백엔드 수정 전에 반드시 ignore 파일부터 복원한다.

---

### Phase 3: 타입 파일 보호

**목표**: Careti 타입 확장 파일 보호 설정

**⚠️ CRITICAL**: 이 파일들은 Cline upstream에 없음, 삭제되면 컴파일 실패

**보호 대상 파일**:
```
src/types/vscode-extensions.d.ts
src/core/api/providers/vscode-lm.ts
src/integrations/terminal/TerminalManager.ts
src/services/posthog/PostHogClientProvider.ts
src/standalone/vscode-context.ts
src/services/mcp/McpHub.ts
```

**체크리스트**:
- [ ] `.gitattributes` 파일 생성
  ```
  # Careti 타입 솔루션 파일 - 충돌 시 Careti 버전 우선
  src/types/vscode-extensions.d.ts merge=ours
  src/core/api/providers/vscode-lm.ts merge=ours
  src/integrations/terminal/TerminalManager.ts merge=ours
  src/services/posthog/PostHogClientProvider.ts merge=ours
  src/standalone/vscode-context.ts merge=ours
  src/services/mcp/McpHub.ts merge=ours
  ```
- [ ] Git merge driver 설정
  ```bash
  git config merge.ours.driver true
  ```
- [ ] 타입 파일 내용 확인 (약 108줄)

---

### Phase 4: Backend 재구현

**목표**: Careti Feature Backend 부분 재구현

**Feature 순서**:
1. F09 (FeatureConfig) - 안전
2. F03 (Branding) - disk.ts 수정
3. F08 (Persona) - disk.ts 수정, careti-src 복원
4. F01 (CommonUtil) - careti-src 복원
5. F05 (RulePriority) - disk.ts 수정
6. F11 (InputHistory) - CaretiGlobalManager 복원

**각 Feature별 체크리스트**:
- [ ] Feature 문서 읽기 (`careti-docs/features/f*.md`)
- [ ] Modified Files 확인
- [ ] careti-src 파일 복원 (있는 경우)
- [ ] Cline 파일 최소 수정 (있는 경우)
- [ ] `// CARETI MODIFICATION:` 주석 추가
- [ ] 컴파일 검증 (`npm run compile`)
- [ ] Feature 문서 업데이트

**⚠️ 주의사항**:
- F04 (CaretAccount)는 Frontend 의존성으로 Phase 5로 연기
- 수정 파일은 1-3 lines 이내로 제한
- 수정 시 백업 불필요 (`.cline` 백업 deprecated)
- (예외) 테스트 등으로 보호 디렉토리 내 신규 파일 추가가 불가피하면, 파일 상단에 `// CARETI MODIFICATION:`로 Careti 추가 파일임을 표시

---

### Phase 5: Frontend 재구현

**목표**: Careti Feature Frontend 부분 재구현

#### Phase 5.0: 기본 파일 복사 ⭐ **가장 중요**

**체크리스트**:

**1. Careti 전용 디렉토리 복사** (전체)
- [ ] `careti-main/webview-ui/src/careti/` → `webview-ui/src/careti/` 복사
  ```bash
  cp -r careti-main/webview-ui/src/careti/ webview-ui/src/careti/
  ```
- [ ] 디렉토리 구조 확인 (components, hooks, utils, context 등)

**2. Cline 변경 파일 분석**
- [ ] Cline 변경 파일 목록 확인
  ```bash
  git diff upstream/v3.31.0..upstream/main -- webview-ui/
  ```
- [ ] 변경 파일을 3개 그룹으로 분류:
  - **Cline Only**: Cline 개선사항만 (lint, 타입 안전성)
  - **Careti Only**: Careti 기능만 (새 컴포넌트, 훅)
  - **Mixed**: Cline 변경 + Careti 기능 통합 필요

**3. Cline Only 파일 복사**
- [ ] 해당 파일들을 cline-latest에서 그대로 복사
- [ ] 예: parseInt radix, indexOf 최적화 등

**4. 🔴 CRITICAL FILES 통합** ⚠️ **절대 누락 금지**

**App.tsx** - Context Provider 통합
- [ ] careti-main의 App.tsx를 참조하여 수정
- [ ] Import 추가:
  ```tsx
  import CaretiI18nProvider from "./careti/context/CaretI18nContext"
  import { CaretStateContextProvider, useCaretState } from "./careti/context/CaretStateContext"
  import PersonaTemplateSelector from "./careti/components/PersonaTemplateSelector"
  ```
- [ ] AppContent에 useCaretState 추가:
  ```tsx
  const AppContent = () => {
    const { showPersonaSelector } = useCaretState()
    // ...
  }
  ```
- [ ] App 컴포넌트 Provider 래핑:
  ```tsx
  const App = () => {
    return (
      <Providers>
        <CaretiI18nProvider defaultLanguage="en">
          <CaretStateContextProvider>
            <AppContent />
          </CaretStateContextProvider>
        </CaretiI18nProvider>
      </Providers>
    )
  }
  ```
- [ ] showPersonaSelector 조건부 렌더링 추가 (AppContent 내부)

**Providers.tsx** - Provider 순서 확인
- [ ] PlatformProvider가 최상위인지 확인
- [ ] 순서: PlatformProvider → ExtensionStateContextProvider → ...
- [ ] careti-main과 비교하여 순서 일치 확인

**🔴 Additional Critical Files (4th Feedback)** - Welcome/Settings/Chat 통합

**WelcomeView.tsx** - 언어/API/Persona 플로우
- [ ] careti-main에서 전체 복사:
  ```bash
  cp careti-main/webview-ui/src/components/welcome/WelcomeView.tsx \
     webview-ui/src/components/welcome/
  ```
- [ ] CaretWelcomeSection, PreferredLanguageSetting, CaretApiSetup 포함 확인
- [ ] featureConfig.redirectAfterApiSetup 로직 확인
- ⚠️ **누락 시 영향**: 최초 설정 플로우 동작 불가

**ChatView.tsx** - Persona 아바타 통합
- [ ] careti-main에서 전체 복사하여 PersonaAvatar 컴포넌트 통합 확인
- [ ] WelcomeSection에 `version` prop 전달 확인
- ⚠️ **누락 시 영향**: 홈 화면 페르소나 이미지 누락, TypeScript 에러

**SettingsView.tsx + sections/** - General/About 탭
- [ ] SettingsView.tsx 전체 복사
- [ ] settings/sections/ 디렉토리 전체 복사:
  ```bash
  cp -r careti-main/webview-ui/src/components/settings/sections/ \
        webview-ui/src/components/settings/
  ```
- [ ] GeneralSection: 언어 설정, Careti/Cline 모드, Persona 토글 확인
- [ ] AboutSection: Announcement에 `version` prop 전달 확인
- ⚠️ **누락 시 영향**: 설정 탭 UI 누락, TypeScript 에러

**ApiOptions.tsx** - Provider 선택 필터링
- [ ] careti-main에서 전체 복사
- [ ] featureConfig.enabledProviders 필터링 로직 확인
- ⚠️ **누락 시 영향**: 일부 Provider만 동작, 선택 에러

**ClineRulesToggleModal.tsx** - Persona 관리 통합
- [ ] careti-main에서 전체 복사
- [ ] PersonaManagement 컴포넌트 import 확인
- [ ] Persona 관리 UI 표시 확인
- ⚠️ **누락 시 영향**: Rules 메뉴에서 Persona 관리 불가

**task-header/** - HomeHeader와 Persona 이미지
- [ ] task-header 디렉토리 전체 복사:
  ```bash
  cp -r careti-main/webview-ui/src/components/chat/task-header/ \
        webview-ui/src/components/chat/
  ```
- [ ] PersonaAvatar, TaskTimeline 컴포넌트 확인
- ⚠️ **누락 시 영향**: 홈 화면 상단 Persona 이미지 누락

**5. Mixed 파일 통합** (Cline + Careti)
- [ ] ChatTextArea.tsx - F11 InputHistory 통합
- [ ] RequestyModelPicker.tsx - F10 ProviderSetup 통합
- [ ] Cline 최신 코드 기반 + Careti 기능 추가
- [ ] `// CARETI MODIFICATION:` 주석 추가

**6. Proto 및 Backend 핸들러 확인 (4th Feedback)**

**누락된 Proto 메서드 확인**:
- [ ] careti-main의 proto 파일과 현재 proto 파일 비교
  ```bash
  # StateService 예제
  diff proto/cline/state.proto careti-main/proto/cline/state.proto
  ```
- [ ] 누락된 rpc 메서드 추가:
  ```protobuf
  service StateService {
    // ...
    rpc updateDefaultTerminalProfile(StringRequest) returns (TerminalProfileUpdateResponse);
  }
  ```
- [ ] Proto 재생성:
  ```bash
  npm run protos
  ```
- [ ] Backend 핸들러 복사:
  ```bash
  # 예: updateDefaultTerminalProfile handler
  cp careti-main/src/core/controller/state/updateDefaultTerminalProfile.ts \
     src/core/controller/state/
  ```
- [ ] protobus-services.ts 자동 등록 확인
- ⚠️ **누락 시 영향**: Runtime 시 메서드 없음 에러, Frontend 기능 동작 불가

**TypeScript 타입 에러 수정**:
- [ ] RefreshedRules 등 Proto 타입에 Careti 필드 누락 확인
  ```typescript
  // 예: localCaretRulesToggles가 없다면 해당 코드 주석 처리
  // if (response.localCaretRulesToggles?.toggles) { ... }
  ```
- [ ] 컴포넌트 Props 타입 불일치 수정:
  ```typescript
  // 예: Announcement component
  // ❌ <Announcement showCloseButton={false} />
  // ✅ <Announcement version={version} />
  ```
- [ ] Unused imports 제거 (lint 에러)

**7. 컴파일 검증**
- [ ] TypeScript 컴파일
  ```bash
  npm run check-types
  cd webview-ui && npx tsc -b --noEmit
  ```
- [ ] Frontend 빌드
  ```bash
  cd webview-ui && npm run build
  ```
- [ ] 모든 에러 해결 (0 errors)

**⚠️ 이 단계에서 가장 많은 실수 발생**:
- App.tsx 누락 → 전체 Context 시스템 동작 불가
- Providers.tsx 순서 틀림 → 초기화 에러
- Mixed 파일 통합 실패 → Feature 동작 불가
- WelcomeView/Settings/ChatView 누락 → UI 플로우 동작 불가
- Proto 메서드 누락 → Runtime 메서드 에러
- Props 타입 불일치 → TypeScript 컴파일 에러

#### Phase 5.1 ~ 5.8: Feature별 순차 통합

**Feature 순서**:
1. F01 (CommonUtil) - 안전
2. F09 (FeatureConfig) - 안전
3. F08 (Persona) - 안전
4. F04 (CaretAccount) - 안전
5. F02 (i18n) - 안전, 광범위
6. F03 (Branding) - 안전, 광범위
7. F11 (InputHistory) - ChatTextArea 통합 필요
8. F10 (ProviderSetup) - RequestyModelPicker 통합 필요

**각 Phase 체크리스트**:
- [ ] Feature 문서 읽기
- [ ] Modified Files 확인 및 복사/수정
- [ ] Cline 변경 파일과 충돌 확인
- [ ] 통합 방식 결정 (Cline 우선 vs Careti 추가)
- [ ] 컴파일 검증
- [ ] Feature 문서 업데이트

---

## Critical Files 관리

### Frontend Critical Files (절대 누락 금지)

이 파일들은 **반드시** careti-main 버전 또는 수정된 버전 사용:

#### 1. Context Integration
```
webview-ui/src/App.tsx
webview-ui/src/Providers.tsx
```

**누락 시 영향**: 전체 Context 시스템 동작 불가 (i18n, Persona 등)

**검증 방법**:
```bash
# App.tsx에 CaretiI18nProvider 있는지 확인
grep -n "CaretiI18nProvider" webview-ui/src/App.tsx

# CaretStateContextProvider 있는지 확인
grep -n "CaretStateContextProvider" webview-ui/src/App.tsx
```

#### 2. Context Implementation
```
webview-ui/src/careti/context/CaretI18nContext.tsx
webview-ui/src/careti/context/CaretStateContext.tsx
```

**누락 시 영향**: Context 자체가 없어 import 에러

#### 3. Entry Point
```
webview-ui/src/main.tsx
webview-ui/index.html
```

**검증 방법**:
```bash
# main.tsx 존재 확인
ls -la webview-ui/src/main.tsx

# index.html 타이틀 확인 (Careti인지)
grep "<title>" webview-ui/index.html
```

### Backend Critical Files

```
src/types/vscode-extensions.d.ts               (타입 확장)
src/core/storage/disk.ts                       (브랜딩, 페르소나 경로)
src/extension.ts                               (명령어 등록)
src/integrations/terminal/TerminalRegistry.ts  (터미널 이름/아이콘, initialize 호출 필수)
src/integrations/terminal/TerminalProcess.ts   (Linux shellIntegration 정지 현상 방지)
src/hosts/vscode/hostbridge/workspace/executeCommandInTerminal.ts (즉시 터미널 실행 시 브랜딩 재사용)
```

- ✅ `TerminalRegistry.initialize(context)`가 `activate()` 초기에 호출되는지 확인하고, `getTerminalBranding()`으로 Careti 이름/아이콘을 공유한다.
- ✅ `TerminalProcess`에는 **stream idle timeout(5초)** 래퍼가 반드시 존재해야 하며, Linux에서 출력이 멈춘 채 끝나지 않는 버그를 막아야 한다.
- ✅ VS Code 호스트에서 즉시 만드는 터미널(`executeCommandInTerminal`)도 같은 브랜딩/아이콘을 사용하도록 한다.

---

## 검증 체크리스트

### Level 1: 빌드 검증 (필수)

```bash
# 1. Proto 재생성
npm run protos
# 예상: 23 files, 215 formatted, 0 errors

# 2. Backend 컴파일
npm run compile
# 예상: 0 errors

# 3. Lint
npm run lint
# 예상: 0 errors

# 4. Frontend 빌드
cd webview-ui && npm run build
# 예상: 5-6MB bundle, 0 errors
```

**체크리스트**:
- [ ] Proto 생성 성공
- [ ] Backend TypeScript 0 errors
- [ ] Lint 0 errors
- [ ] Frontend 빌드 성공
- [ ] Bundle 크기 정상 (5-6MB)

### Level 2: 런타임 검증 (필수) ⭐ **가장 중요**

**Extension 실행**:
```bash
# VS Code에서 F5 누르기
# Extension Development Host 새 창 열림
```

**체크리스트**:

**기본 동작**:
- [ ] Extension 로딩 성공
- [ ] Webview 표시됨
- [ ] Console 에러 없음

**Context 시스템**:
- [ ] 설정 버튼 클릭 → 설정 화면 표시 (에러 없음)
- [ ] Console에 "useCaretI18nContext" 에러 없음
- [ ] Console에 "CaretStateContext" 에러 없음

**Persona 시스템**:
- [ ] 하단 Rules 버튼 클릭 → Persona 버튼 표시됨
- [ ] Persona 버튼 클릭 → Persona 관리 화면 표시

**i18n 시스템**:
- [ ] 설정 → Language → 언어 변경 동작
- [ ] UI 텍스트가 선택한 언어로 변경
- [ ] Console 에러 없음

**브랜딩**:
- [ ] Welcome 화면 "Hi, I'm Careti" 표시
- [ ] 로고가 Careti 로고
- [ ] HTML 타이틀 "Careti Webview"

**Model Selector**:
- [ ] 하단 Model 버튼 클릭 → 모델 선택 화면 표시
- [ ] Provider 목록 표시
- [ ] 모델 선택 동작

### Level 3: 기능 검증 (선택)

**Chat 기능**:
- [ ] 채팅 입력 가능
- [ ] API 호출 동작
- [ ] 응답 표시

**History 기능**:
- [ ] Input History 동작 (↑/↓ 키)
- [ ] 이전 입력 불러오기

**Account 기능**:
- [ ] Account 버튼 클릭 → Careti Account 표시
- [ ] 로그인 동작

---

## Feature 문서 작성 기준

### 필수 섹션

#### 1. 개요
```markdown
# F0X - Feature Name

**상태**: ✅ Phase X 완료
**구현도**: 100% 완료
**우선순위**: HIGH/MEDIUM/LOW

---

## 📋 개요

**목표**: [1-2 문장으로 Feature 목적]

**핵심 기능**:
- 기능 1
- 기능 2
```

#### 2. Backend 구현 (Phase 4)
```markdown
## 🏗️ Backend 구현 (Phase 4)

### ✅ 핵심 파일 수정

**1. 파일명** (+XX lines)
```
경로
- 수정 내용 1
- 수정 내용 2
```

**핵심 코드**:
```typescript
// CARETI MODIFICATION: [설명]
code here
```

### 📝 Modified Files (Phase 4)

**Cline 핵심 파일**:
- src/path/to/file.ts  (+XX lines, Line YY-ZZ)

**Careti 전용 파일**:
- careti-src/path/to/file.ts  (신규)

**최소 침습**: X개 파일, YY lines 추가
```

#### 3. Frontend 구현 (Phase 5) ⭐ **가장 중요**

```markdown
## 🌐 Frontend 구현 (Phase 5)

### ✅ 핵심 파일 수정

#### 🔴 CRITICAL FILES (누락 시 전체 기능 동작 불가)

**1. App.tsx** - Context Provider 통합
- **Line XX-YY**: Import 추가
  ```tsx
  import CaretiI18nProvider from "./careti/context/CaretI18nContext"
  ```
- **Line ZZ-AA**: Provider 래핑 추가
  ```tsx
  <CaretiI18nProvider defaultLanguage="en">
    <AppContent />
  </CaretiI18nProvider>
  ```
- ⚠️ **누락 시 영향**: 전체 i18n 시스템 동작 불가

#### Context Implementation
**2. webview-ui/src/careti/context/CaretI18nContext.tsx** (신규)
- Context Provider 구현
- Language state 관리

#### Consumer Components
**3. webview-ui/src/components/settings/ApiOptions.tsx**
- useCaretI18nContext 사용
- Line XX: `const { language } = useCaretI18nContext()`

### 📝 Modified Files (Phase 5)

#### 🔴 Critical Files (필수)
- webview-ui/src/App.tsx (Line XX-YY, ZZ-AA)
- webview-ui/src/Providers.tsx (순서 확인)

#### Context
- webview-ui/src/careti/context/CaretI18nContext.tsx (신규)

#### Components
- webview-ui/src/components/settings/ApiOptions.tsx (Line XX)
- ... [모든 파일 명시]

**최소 침습**: X개 파일 수정, Y개 신규, ZZ lines
```

#### 4. 검증 섹션

```markdown
## 🧪 검증

### 빌드 검증
- [ ] npm run compile - 성공
- [ ] npm run build:webview - 성공

### 런타임 검증
- [ ] Extension 실행 (F5)
- [ ] [구체적 동작] 확인
- [ ] Console 에러 없음

### 테스트 케이스
```typescript
// 1. [기능명]
[테스트 코드] ✅

// 2. [기능명]
[테스트 코드] ✅
```
```

---

## 교훈 및 함정

### 교훈 1: "Hard Reset은 모든 것을 삭제한다"

**문제**:
```bash
git reset --hard upstream/main
# → App.tsx, Providers.tsx가 Cline 버전으로 교체
# → Careti Context Provider 모두 소실
```

**해결**:
- Phase 5.0에서 Critical Files를 명시적으로 체크
- App.tsx, Providers.tsx를 별도 체크리스트 항목으로

### 교훈 2: "컴파일 성공 ≠ 런타임 성공"

**문제**:
- TypeScript 컴파일 0 errors
- Context 파일도 모두 존재
- BUT, Provider 래핑이 없어 런타임 실패

**해결**:
- 빌드 검증 + 런타임 검증 필수
- F5 실행 및 주요 기능 동작 확인

### 교훈 3: "AI Rules(.agents/context)는 코드보다 먼저 머지되어야 한다" ⭐ **신규**

**배경**:
- AI 에이전트는 `.agents/context`에 정의된 규칙(Minimal Invasion, Hybrid Pattern 등)을 따릅니다.
- 머지 초기 단계(Reset 직후)에 이 파일들이 없으면 AI는 "일반적인 코딩 관습"대로 행동하여 Careti의 엄격한 머징 규칙을 위반할 수 있습니다.

**해결**:
- **Phase 0**를 신설하여 `.agents/context`를 가장 먼저 복구합니다.
- AI가 작업을 시작하기 전에 "나는 Careti 머징 규칙을 따르고 있는가?"를 스스로 확인하게 합니다.

### 교훈 4: "Cline 프롬프트 개선사항은 Careti JSON 시스템에 반영" ⭐ **신규**

**배경**:
- Cline upstream은 TypeScript 기반 프롬프트 시스템 사용
- Careti는 JSON 기반 독립 프롬프트 시스템 (L1 아키텍처)
- Cline 개선사항을 Careti에 수동 반영 필요

**프로세스** (2025-10-14 실제 사례):

#### 1️⃣ Cline 변경사항 분석
```bash
# Cline upstream 커밋 확인
git log upstream/main --oneline -- src/core/prompts/

# 핵심 개선사항 추출
- commit 41202df74: Multiple SEARCH/REPLACE blocks 최적화
- commit f0cd7fd36: TODO 업데이트 타이밍 명확화
```

**분석 문서 작성**:
- `careti-docs/work-logs/luke/YYYY-MM-DD-cline-prompt-analysis.md`
- Cline 원본 코드 발췌
- Careti 적용 가능성 평가

#### 2️⃣ 상세 수정 명세서 작성
**파일**: `YYYY-MM-DD-DETAILED-MODIFICATION-SPECS.md`

**포함 내용**:
- ✅ 수정 전/후 완전한 JSON 코드
- ✅ 변경 사항 라인 단위 분석
- ✅ 토큰 수 계산 (before → after)
- ✅ 원본 Cline 코드 비교
- ✅ 80+ 검증 체크리스트
- ✅ jq/grep 자동 검증 명령어

#### 3️⃣ 크로스체크 검증 (다른 AI)
**파일**: `YYYY-MM-DD-CROSS-CHECK-VALIDATION-GUIDE.md`

**검증 항목**:
- JSON 문법 오류 확인
- 구조 일관성 (mode: "both")
- Cline 원본 반영 정확성
- 토큰 수 계산 검증
- Legacy 구조 제거 확인

**검증 결과**: `YYYY-MM-DD-prompt-spec-verification-report.md`
- 95% 신뢰도 APPROVED
- 토큰 수 미세 조정 (~280 → ~320)

#### 4️⃣ 최종 구현
**파일**: `YYYY-MM-DD-FINAL-IMPLEMENTATION-FILES.md`

**실행 단계**:
1. 백업 생성
   ```bash
   cp CARET_FILE_EDITING.json CARET_FILE_EDITING.json.bak-YYYYMMDD
   cp CARET_TODO_MANAGEMENT.json CARET_TODO_MANAGEMENT.json.bak-YYYYMMDD
   ```

2. JSON 파일 수정
   - `careti-src/core/prompts/sections/CARET_FILE_EDITING.json`
   - `careti-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json`

3. 검증
   ```bash
   jq '.' 파일명  # JSON 문법
   npm run compile  # TypeScript 컴파일
   ```

4. 테스트
   - VS Code Extension Host 실행 (F5)
   - Agent/Chatbot 모드 프롬프트 확인
   - Logger 출력 확인

**실제 결과** (2025-10-14):
- ✅ JSON 문법 통과
- ✅ 컴파일 성공 (0 errors)
- ✅ 토큰 증가: +470 (+276%, 전체 대비 +0.47%)
- ✅ 예상 효과: API 요청 30-50% 감소

#### 5️⃣ 문서화
**완료 보고서**: `YYYY-MM-DD-IMPLEMENTATION-COMPLETE.md`

**포함 내용**:
- 수정 파일 목록 + 백업 경로
- 검증 결과 상세
- 변경 사항 비교표
- 예상 효과 (정량/정성)
- Git 커밋 메시지
- 롤백 방법

**Git 커밋**:
```bash
git add careti-src/core/prompts/sections/CARET_FILE_EDITING.json
git add careti-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json
git commit -m "feat(prompts): Apply Cline prompt improvements to Careti dual-mode system

- Add multiple SEARCH/REPLACE blocks optimization (30-50% API reduction)
- Clarify TODO update timing (every 10th request, mode switch)
- Add Quality Standards for actionable TODO items

Based on Cline commits: 41202df74, f0cd7fd36
Verified by: Claude Sonnet 4.5 cross-check (95% confidence)"
```

**핵심 교훈**:
- ✅ Careti JSON 시스템은 TypeScript보다 수정 용이
- ✅ `mode: "both"` 필드로 Agent/Chatbot 동시 적용
- ✅ 다른 AI 크로스체크로 95% 신뢰도 확보
- ✅ 토큰 증가는 전체 시스템 대비 미미 (+0.47%)
- ✅ 상세 문서화로 향후 동일 프로세스 재현 가능

**적용 빈도**: Cline upstream 주요 프롬프트 개선 시마다 (분기 1-2회 예상)

**관련 문서**:
- `careti-docs/work-logs/luke/2025-10-14-cline-prompt-analysis.md`
- `careti-docs/work-logs/luke/2025-10-14-DETAILED-MODIFICATION-SPECS.md`
- `careti-docs/work-logs/luke/2025-10-14-CROSS-CHECK-VALIDATION-GUIDE.md`
- `careti-docs/work-logs/luke/2025-10-14-prompt-spec-verification-report.md`
- `careti-docs/work-logs/luke/2025-10-14-FINAL-IMPLEMENTATION-FILES.md`
- `careti-docs/work-logs/luke/2025-10-14-IMPLEMENTATION-COMPLETE.md`

### 교훈 4: "Feature 문서는 구체적으로"

**나쁜 예**:
```markdown
Frontend: Phase 5에서 UI 연동
```

**좋은 예**:
```markdown
Frontend: Phase 5
- webview-ui/src/App.tsx (Line 99-104: Provider 래핑)
- ⚠️ CRITICAL: 누락 시 전체 기능 동작 불가
```

### 교훈 4: "Provider 순서가 중요하다"

**문제**:
```tsx
// ❌ 잘못된 순서
<ExtensionStateContextProvider>
  <PlatformProvider>
    ...
  </PlatformProvider>
</ExtensionStateContextProvider>
```

**해결**:
```tsx
// ✅ 올바른 순서
<PlatformProvider>
  <ExtensionStateContextProvider>
    ...
  </ExtensionStateContextProvider>
</PlatformProvider>
```

### 교훈 5: "Cline 변경 파일은 3가지로 분류"

**Cline Only**:
- Cline 개선사항만 (lint, 타입 안전성)
- → Cline 코드 그대로 사용

**Careti Only**:
- Careti 기능만 (새 컴포넌트, 훅)
- → careti-main에서 복사

**Mixed**:
- Cline 변경 + Careti 기능
- → Cline 기반 + Careti 기능 추가 (가장 어려움)

### 교훈 6: "신규 Cline 파일도 브랜딩 체크 필수"

**문제 사례 (AccountWelcomeView)**:
- Cline v3.32.7에서 새로 추가된 파일
- "Cline Only" 파일로 분류되어 그대로 채택
- Cline 브랜딩 (로고, 텍스트, URL) 그대로 통과
- 로그아웃 상태 테스트 누락으로 발견 안 됨

**올바른 프로세스**:

1. **신규 파일 목록 확인**:
   ```bash
   # Cline upstream과 비교하여 새로 추가된 파일 찾기
   cd cline-latest
   git log --name-status upstream/main..HEAD | grep "^A" | awk '{print $2}'
   ```

2. **UI 컴포넌트 브랜딩 체크**:
   - Logo import (`ClineLogoWhite` → `CaretLogoWhite` 또는 PersonaAvatar)
   - 하드코딩된 텍스트 ("Sign up with Cline" → i18n)
   - URL (`cline.bot` → `github.com/aicoding-careti/careti`)
   - 스타일 클래스명에 브랜드 이름 포함 여부

3. **i18n 적용 확인**:
   - 모든 사용자 노출 텍스트 `t()` 함수 사용
   - 4개 언어 파일 모두 번역 키 추가 (en, ko, ja, zh)

4. **런타임 테스트 전체 시나리오**:
   - ✅ 로그인 상태
   - ✅ 로그아웃 상태
   - ✅ 계정 전환 (Careti ↔ Cline)
   - ✅ 각 상태별 UI 컴포넌트 표시 확인

**체크리스트**:
- [ ] `git diff` 또는 `git log`로 신규 파일 목록 작성
- [ ] 각 신규 UI 컴포넌트 파일 열어서 브랜딩 확인
- [ ] Logo import 검색: `grep -r "ClineLogo" webview-ui/src`
- [ ] 하드코딩 텍스트 검색: `grep -r "Sign up with Cline" webview-ui/src`
- [ ] URL 검색: `grep -r "cline\.bot" webview-ui/src`
- [ ] i18n 미적용 검색: `grep -r "className.*<p>.*[A-Z]" webview-ui/src` (대문자로 시작하는 하드코딩)

---

## 문제 해결 가이드

### 문제 1: Context 에러

**증상**:
```
useCaretI18nContext must be used within a CaretiI18nProvider
```

**원인**: App.tsx에 CaretiI18nProvider 래핑 누락

**해결**:
1. careti-main/webview-ui/src/App.tsx 참조
2. CaretiI18nProvider import 추가
3. Provider 래핑 추가
4. 컴파일 및 런타임 검증

### 문제 2: Persona 버튼 안 보임

**증상**: Rules 버튼 클릭 시 Persona 버튼 없음

**원인**: CaretStateContextProvider 누락 또는 enablePersonaSystem false

**해결**:
1. App.tsx에 CaretStateContextProvider 확인
2. useCaretState() 사용 확인
3. enablePersonaSystem 값 확인 (F5 → Console)

### 문제 3: 빌드는 성공하지만 런타임 에러

**증상**: TypeScript 0 errors, 하지만 Extension 실행 시 에러

**원인**: Context Provider 누락, Provider 순서 틀림

**해결**:
1. F5로 Extension 실행
2. Console 에러 확인
3. Provider 순서 확인 (Providers.tsx)
4. Critical Files 체크리스트 재확인

### 문제 4: i18n 텍스트 안 나옴

**증상**: UI에 번역 키가 그대로 표시 ("button.save" 등)

**원인**: CaretiI18nProvider 없거나 언어 파일 로딩 실패

**해결**:
1. CaretiI18nProvider 확인
2. 언어 파일 존재 확인 (`webview-ui/src/careti/locales/`)
3. Console에 파일 로딩 에러 확인

### 문제 5: VS Code API 중복 획득 에러

**증상**:
```
An instance of the VS Code API has already been acquired
Found unexpected null at assertIsDefined
Webview 로딩 실패
```

**원인**: `acquireVsCodeApi()` 함수가 여러 곳에서 호출됨
- VS Code는 webview당 `acquireVsCodeApi()` 1회만 허용
- Careti의 `webview-ui/src/utils/vscode.ts`는 singleton 패턴 사용
- 다른 파일에서 직접 `acquireVsCodeApi()` 호출 시 충돌 발생

**해결**:
1. **3-way 비교 실행** (cline-latest, careti-main, 현재):
   ```bash
   # Cline에 해당 파일이 있는지 확인
   ls cline-latest/webview-ui/src/utils/vscode.ts
   # → 없으면 Careti 전용 파일
   ```

2. **중복 호출 찾기**:
   ```bash
   # webview-ui에서 acquireVsCodeApi 직접 호출 검색
   cd webview-ui
   grep -r "acquireVsCodeApi()" --include="*.ts" --include="*.tsx"
   ```

3. **수정 방법**:
   - `platform.config.ts` 등에서 직접 호출 제거
   - vscode singleton import 사용:
     ```typescript
     import { vscode as vscodeSingleton } from "../utils/vscode"
     vscodeSingleton.postMessage(message)
     ```

4. **검증**:
   - F5로 Extension 실행
   - Console에 "An instance of the VS Code API..." 에러 없음 확인
   - Webview 정상 로딩 확인

**교훈**:
- Careti 전용 파일(`utils/vscode.ts`)은 singleton 패턴 유지
- 머징 시 Cline 파일에서 `acquireVsCodeApi()` 직접 호출 발견되면 singleton으로 교체 필요
- VS Code API 제약사항 (1회만 획득 가능)을 항상 염두에 둘 것

---

## 다음 머징 회차 체크리스트

### 전체 프로세스 체크리스트

**Phase 1: 준비**
- [ ] Git 백업 완료
- [ ] Careti 디렉토리 백업 (/tmp)
- [ ] Upstream 최신 확인
- [ ] 현재 빌드 성공 확인

**Phase 2: Upstream 채택**
- [ ] Hard Reset 실행
- [ ] Careti 디렉토리 복원
- [ ] Git 커밋

**Phase 3: 타입 보호**
- [ ] .gitattributes 설정
- [ ] Merge driver 설정
- [ ] 타입 파일 확인

**Phase 4: Backend (8-12시간)**
- [ ] F09 Feature Config
- [ ] F03 Branding
- [ ] F08 Persona
- [ ] F01 Common Util
- [ ] F06 Agent Standardization
- [ ] F11 Input History
- [ ] 각 Feature 후 컴파일 검증

**Phase 5.0: Frontend 기본 (2-3시간) ⭐ 가장 중요**
- [ ] Careti 디렉토리 복사 (`webview-ui/src/careti/`)
- [ ] Cline Only 파일 복사
- [ ] 🔴 **신규 Cline 파일 브랜딩 체크** (추가된 파일 목록 확인)
- [ ] 🔴 App.tsx - Context Provider 통합
- [ ] 🔴 Providers.tsx - 순서 확인
- [ ] Mixed 파일 통합
- [ ] 컴파일 검증
- [ ] **런타임 검증 (F5) - 로그인/로그아웃 모두 테스트**

**Phase 5.1~5.8: Frontend Feature (6-8시간)**
- [ ] F01 ~ F10 순차 통합
- [ ] 각 Feature 후 컴파일 검증

**최종 검증**
- [ ] 빌드 검증 (0 errors)
- [ ] **런타임 검증 (F5)**
- [ ] 주요 기능 동작 확인
- [ ] Console 에러 없음

---

## 문서 개선 이력

**v1.0** (2025-10-12):
- 초기 버전 작성
- 2025-10-09 머징 경험 반영
- Context Provider 누락 문제 반영
- 런타임 검증 강화

**v1.1** (2025-10-12 23:53 - 4th Feedback 반영):
- **Additional Critical Files 섹션 추가** (Phase 5.0):
  - WelcomeView.tsx: 언어/API/Persona 플로우
  - ChatView.tsx: Persona 아바타, version prop
  - SettingsView + sections/: General/About 탭
  - ApiOptions.tsx: Provider 필터링
  - ClineRulesToggleModal.tsx: Persona 관리
  - task-header/: HomeHeader, Persona 이미지
- **Proto 및 Backend 핸들러 섹션 추가**:
  - 누락된 proto 메서드 확인 및 추가 가이드
  - Backend 핸들러 복사 방법
  - 예: updateDefaultTerminalProfile
- **TypeScript 타입 에러 수정 가이드 추가**:
  - Proto 타입 불일치 (localCaretRulesToggles)
  - Props 타입 불일치 (Announcement version prop)
  - Unused imports 제거
- **실제 런타임 테스트 결과 반영** (4th feedback 7개 문제):
  - 문제 13: WelcomeView 페이지 통합 누락
  - 문제 14: API Provider 선택 에러
  - 문제 15: Settings General 탭 UI 누락
  - 문제 16: Settings About 탭 내용 누락
  - 문제 17: 홈 화면 Persona 이미지 누락
  - 문제 18: Rules 메뉴 Persona 설정 누락
  - 문제 19: Announcement Cline 버전
- **Common Root Cause 식별**: Phase 5.0 선택적 복사 불완전
- Phase 5.0 체크리스트 상세화 (기존 4개 → 7개 항목)

**v1.2** (2025-10-13 12:50 - 5th Feedback 반영):
- **🔴 파일 복사 != 기능 동작 원칙 추가**:
  - 파일 복사 후 반드시 런타임 검증 필수
  - DevTools 활용 가이드 추가
  - State 전달 체인 추적 방법
- **🔴 Persona 반복 누락 근본 원인 분석**:
  - 3차, 4차, 5차 반복 누락 이유 규명
  - 조건부 렌더링 로직 확인 필수
  - Screenshot 첨부 의무화
- **머징 프로세스 근본 문제 식별**:
  - 수동 작업 의존성 (50개+ 파일)
  - careti-main 버전 관리 부족
  - Settings 탭 구조 Cline 최신 반영 필요
- **Phase 0 추가: careti-main 버전 확인**:
  - careti-main base Cline 버전 확인 필수
  - 머징 대상 Cline 버전과 비교
  - 버전 차이 크면 careti-main 먼저 업데이트
- **Phase 5.0 런타임 검증 강화**:
  - 각 파일 복사 후 즉시 F5 실행
  - DevTools Elements/Components 탭 활용
  - console.log로 State 값 확인
  - Screenshot 2장 이상 첨부 (홈, Settings)
- **Settings 탭 구조 검증 추가**:
  - Cline upstream 최신 구조 확인
  - 탭 순서, 아이콘, 새 기능 모두 반영
  - 기능 탭 최신 기능 체크리스트
- **"완료" 기준 재정의**:
  - 이전: 파일 복사 + 컴파일 성공
  - 신규: 파일 복사 + 컴파일 + **런타임 검증** + Screenshot
- **5th feedback 20개 문제 반영**:
  - i18n 대량 누락 (7개)
  - Persona 계속 누락 (2개)
  - Provider 선택 무반응 (2개)
  - Settings 탭 구조/기능 누락 (6개)
  - 기타 UI 누락 (3개)

**다음 개선 예정**:
- 6th feedback 결과 반영
- 런타임 검증 자동화 검토 (E2E 테스트)
- Feature 문서 템플릿 개선

---

**작성자**: Luke (with Claude Code)
**기반**: merge/cline-upstream-20251009 경험
**상태**: Living Document - 계속 개선 예정
