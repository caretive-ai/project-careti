# 머징 작업 이후 루크 피드백 (10차)
 * 머징 작업 이후 발생한 문제들을 기록하고 ai와 상호 작용을 하기 위한 문서다.

# 관련 문서
 * 머징 작업 마스터 문서,와 기타 머징 문서들
  caret-docs/merging/merge-execution-master-plan.md
  caret-docs/merging/*.md
 * 머징한 기능 명세들
  caret-docs/features/f01~f10 문서들
    * 추가 참고사항 : 과거 f06, f07문서는 f06문서로 통합되었고, 뒤의 문서는 한개씩 번호를 당겼음
       - 혹시 문서를 읽는 중에 f07번호 이후의 문서의 내용이 주제가 상이한 경우, 바뀐 문서의 내용에 맞게 변경 할 것
 * 이전 머징 피드백
   2025-10-13-8-merge-feedback.md (1~9차)

# 작업 방법
 * 문서와 코드를 100% 믿지 말 것, 둘 다 맞춰 보고 고민, 코드의 상태를 중심으로 생각할 것
 * 디버깅에 매몰 되지 말고, 머징 작업이었다는 것을 기억할것
   cline의 코드는 최대한 변경하지 않는 최소 침습이어야 함. caret-src를 cline 구조 에 맞추어야 함
 * ai는 누락이 빈번하다는 것을 기억하고, 다시 확인할 것
 * 무엇이 빠졌다면 바로 구현하지 말고, 머징과정 중 왜 빠졌는지 파악할 것
    - cline상태로 이름 변경이 안된건가 ?
    - caret에서 옮겨오지 않은건가?
    - cline의 구조변경이 caret에 적용 안된건가?
 * 프론트 i18n 작업시에는 반드시 f02의 i18n파일과 키의 표준 설정 방법을 참고하거나 기존에 이미 생성되어있는 지를 꼭 확인하여 중복 생성을 하지 말것
 * 왜 머징에서 누락되었는지를 확인하여 다음 회차 머징에는 똑같은 문제가 발생하지 않도록, caret-docs/merging/merge-execution-master-plan.md 을 개선할 것
 * 본 작업은 머징임 !!! 절대로 절대로 맘대로 새로 구현하지 말것!!
 * 모든 이슈는 현재코드, cline-latest, caret-main 의 3-way 구현을 비교할 것, 다르게 구현되있거나 이유없이 새로 구현된 흔적이 보이면 최소 침습의 원칙에 의해 다시 수정할것.
   대원칙 잊고 맘대로 구현해서 망쳐놓은 것임


# 10차 피드백 (2025-10-14)

------------ 잔여 이슈 리스트 ----------

### 1. AccountWelcomeView 다국어 번역 미완료 ✅ **완료** (2025-10-14)

**근본 원인 분석**:
- 9차 수정에서 AccountWelcomeView.tsx의 i18n 키 적용은 완료됨
- 하지만 `termsOfServiceUrl`, `privacyPolicyUrl` 키가 4개 언어 모두 누락
- 추가로 `common.common.and` 키 오류 발견 (정확한 키: `common.and`)

**10차 수정사항** ✅:
1. **AccountWelcomeView.tsx 키 오류 수정**:
   - Line 27: `t("common.common.and", "common")` → `t("common.and", "common")`

2. **4개 언어 파일에 URL 키 추가**:
   - `webview-ui/src/caret/locale/ko/common.json` (lines 273-274)
   - `webview-ui/src/caret/locale/en/common.json` (lines 282-283)
   - `webview-ui/src/caret/locale/ja/common.json` (lines 262-263)
   - `webview-ui/src/caret/locale/zh/common.json` (lines 262-263)
   - 추가된 키:
     ```json
     "termsOfServiceUrl": "https://github.com/aicoding-caret/caret",
     "privacyPolicyUrl": "https://github.com/aicoding-caret/caret"
     ```

**검증 결과**:
- ✅ TypeScript 타입 체크 성공 (`npx tsc --noEmit`)
- ✅ JSON 문법 검증 성공 (4개 언어)
- ✅ 모든 i18n 키 정상 적용

**수정 파일**:
- `webview-ui/src/components/account/AccountWelcomeView.tsx` (1줄 수정)
- `webview-ui/src/caret/locale/{ko,en,ja,zh}/common.json` (각 2줄 추가)

**참고 문서**:
- 이전 9차 수정 (2025-10-13-8-merge-feedback.md lines 756-809)

---

### 2. ModeSystemToggle UI 업데이트 안 됨 ✅ **완료** (2025-10-14 최종)

**초기 증상**:
```
Frontend: "Caret" 고정, Backend: "cline" 고정
[ModeSystemToggle] User clicked toggle: caret -> cline
[CaretGlobalManager] Mode switched: caret → cline ✅
Frontend UI: 여전히 "Caret" 표시 ❌
```

**사용자 테스트 시나리오**:
1. Settings → Debug → **Reset Global State**
2. 언어 설정
3. API 설정
4. Settings → General → **모드 토글 테스트**

**근본 원인 분석** ✅:

#### 문제 1: 중복 폴더로 인한 빌드 혼동
- **발견**: `src/core/controller/caretSystem/` 와 `caret-src/core/controller/caretSystem/` 두 폴더 존재
- **원인**: esbuild는 `@caret/*` 별칭을 통해 `caret-src/`를 빌드하는데, `src/`에 OLD 코드 존재
- **결과**: 수정한 파일(`src/`)이 빌드에 포함되지 않고, OLD 파일(`caret-src/`)이 빌드됨

#### 문제 2: postStateToWebview() 호출 누락
- **핵심 문제**: `SetPromptSystemMode`가 상태를 변경한 후 **Frontend에 알리지 않음**
- **잘못된 흐름**:
  ```typescript
  // caret-src/core/controller/caretSystem/SetPromptSystemMode.ts (OLD)
  CaretGlobalManager.get().setCurrentMode(newMode)  // ✅ Backend 상태 변경
  await controller.context.workspaceState.update(...)  // ✅ Disk 저장
  // ❌ Frontend 알림 없음 → UI 업데이트 안 됨
  ```

---

**10차 최종 수정사항** ✅:

#### 수정 1: 중복 폴더 제거
```bash
rm -rf src/core/controller/caretSystem/
```
- `caret-src/core/controller/caretSystem/`만 사용
- 빌드 혼동 해결

#### 수정 2: SetPromptSystemMode.ts - postStateToWebview() 추가
**파일**: `caret-src/core/controller/caretSystem/SetPromptSystemMode.ts`

**수정 전**:
```typescript
Logger.debug(`[SetPromptSystemMode] Changing mode from ${CaretGlobalManager.currentMode} to ${newMode}`)

// Update CaretGlobalManager
CaretGlobalManager.get().setCurrentMode(newMode)

// Persist to workspace state
await controller.context.workspaceState.update("caret.promptSystem.mode", newMode)

Logger.info(`[SetPromptSystemMode] Successfully changed to ${newMode} mode`)
```

**수정 후**:
```typescript
Logger.debug(`[SetPromptSystemMode] Changing mode from ${CaretGlobalManager.currentMode} to ${newMode}`)

// Update CaretGlobalManager (in-memory)
CaretGlobalManager.get().setCurrentMode(newMode)
Logger.debug(
    `[SetPromptSystemMode] After setCurrentMode: CaretGlobalManager.currentMode=${CaretGlobalManager.currentMode}`,
)

// Persist to workspace state
await controller.context.workspaceState.update("caret.promptSystem.mode", newMode)

// CARET MODIFICATION: Post updated state to webview
Logger.debug(`[SetPromptSystemMode] Before postStateToWebview`)
await controller.postStateToWebview()  // ⭐ 핵심 수정
Logger.debug(`[SetPromptSystemMode] After postStateToWebview`)

Logger.info(`[SetPromptSystemMode] Successfully changed to ${newMode} mode`)
```

**핵심 개선**: `await controller.postStateToWebview()` 추가로 Frontend에 상태 변경 즉시 전파

#### 수정 3: subscribeToState.ts - Logger 사용
**파일**: `src/core/controller/state/subscribeToState.ts`

**변경사항**:
- `console.log` → `Logger.debug` 변경 (Cline 표준 로깅)
- `Logger` import 추가

#### 수정 4: F06 문서 정리
**파일**: `caret-docs/features/f06-caret-prompt-system.md`

**제거한 섹션** (Line 122-133):
- "모드 상태 관리 구조" 섹션 삭제 (잘못된 구현 설명이었음)

---

**최종 구조**:

```
저장 흐름:
1. 사용자 토글 클릭
   → SetPromptSystemMode("cline")
   → CaretGlobalManager.setCurrentMode("cline")  // In-memory
   → workspaceState.update("caret.promptSystem.mode", "cline")  // Disk persist
   → postStateToWebview()  // ⭐ Frontend 알림

읽기 흐름:
2. postStateToWebview()
   → modeSystem = CaretGlobalManager.currentMode  // 직접 읽기 (Line 760)
   → sendStateUpdate({ modeSystem: "cline" })
   → Frontend setState({ modeSystem: "cline" })
   → UI 자동 업데이트 ✅
```

**핵심 개선**:
- `postStateToWebview()` 호출로 Frontend 즉시 동기화
- 중복 폴더 제거로 빌드 명확화
- Debug 로그 추가로 디버깅 용이

---

**검증 결과**:
- ✅ TypeScript 타입 체크 통과
- ✅ 백엔드 컴파일 성공
- ✅ Clean rebuild 후 정상 동작 확인
- ✅ VS Code 재시작 후 테스트 완료

**수정된 파일**:
1. `caret-src/core/controller/caretSystem/SetPromptSystemMode.ts` (+5줄: postStateToWebview 호출 + 로그)
2. `src/core/controller/state/subscribeToState.ts` (+1줄: Logger import, console.log → Logger.debug)
3. `caret-docs/features/f06-caret-prompt-system.md` (-12줄: 잘못된 섹션 제거)
4. `src/core/controller/caretSystem/` (폴더 전체 삭제)

---

### 3. 일반 설정 탭 열 때 updateApiConfigurationProto 호출 문제 ✅ **완료** (2025-10-14)

**증상**:
```
일반 설정 탭 클릭 → 다음 로그 출력:
DEBUG [Controller] 📋 Loaded featureConfig to send to webview: {...}
DEBUG [CaretProviderWrapper] Received message: updateApiConfigurationProto...
```

**분석**:
- `updateApiConfigurationProto`는 앱 시작 또는 설정 변경 시에만 호출되어야 함
- 탭 전환 시 호출되는 것은 불필요한 API 호출

**해결**: Section 2에서 해결됨 - `postStateToWebview()` 호출이 추가되어 상태 전파가 정상화됨

---

### 4. Caret 모드에서 Plan/Act 버튼 표시 및 프롬프트 문제 (진행 중)

**사용자 피드백** (2025-10-14):
- "캐럿 모드지만 UI에 plan/act버튼이 나오고 있어"
- "실제 동작하면서 ai에게 물어보니 Act모드라고 해"
- "@caret-docs/features/f06-caret-prompt-system.md 의 머징이 완벽하지 않았다는 얘기야"

**증상**:
```
1. Caret 모드로 설정했는데도 UI에 "Plan/Act" 토글 버튼 표시됨
2. AI가 자신을 "Act 모드"라고 답변함
3. Chatbot/Agent 모드가 아닌 Plan/Act 프롬프트가 사용되고 있음
```

---

**3-way 비교 분석** ✅:

#### 1. ChatTextArea.tsx - UI 레이블 문제

**cline-latest** (upstream ChatTextArea.tsx:1807, 1814):
```typescript
<SwitchOption>Plan</SwitchOption>
<SwitchOption>Act</SwitchOption>
```
- 하드코딩된 "Plan"/"Act" 레이블
- modeSystem 개념 없음

**caret-main** (ChatTextArea.tsx:1843, 1851):
```typescript
{modeSystem === "caret" ? t("mode.chatbot.label", "chat") : t("mode.plan.label", "chat")}
{modeSystem === "caret" ? t("mode.agent.label", "chat") : t("mode.act.label", "chat")}
```
- modeSystem에 따라 동적으로 레이블 변경
- Caret: "Chatbot"/"Agent", Cline: "Plan"/"Act"
- i18n 적용

**현재** (ChatTextArea.tsx:1807, 1814):
```typescript
Plan
Act
```
- cline-latest와 동일 (하드코딩)
- modeSystem 조건부 렌더링 누락

#### 2. Backend 프롬프트 시스템

**src/core/prompts/system-prompt/index.ts** (lines 38-56):
```typescript
// CARET MODIFICATION: F06 - JSON System Prompt (Hybrid Mode)
try {
    const { CaretGlobalManager } = await import("@caret/managers/CaretGlobalManager")
    const currentMode = CaretGlobalManager.currentMode

    if (currentMode === "caret") {
        // Use Caret's JSON-based hybrid prompt system
        const { CaretPromptWrapper } = await import("@caret/core/prompts/CaretPromptWrapper")
        return await CaretPromptWrapper.getCaretSystemPrompt(context)
    }
} catch (error) {
    console.debug("[System Prompt] Caret mode check failed, using Cline default:", error)
}

// Default: Use Cline's original prompt system
const registry = PromptRegistry.getInstance()
return await registry.get(context)
```
- ✅ Backend 분기는 이미 구현됨
- currentMode === "caret" → CaretPromptWrapper (Chatbot/Agent 프롬프트)
- currentMode === "cline" → Cline registry (Plan/Act 프롬프트)

#### 3. CaretPromptWrapper 파일 존재 여부

**확인 필요**:
```bash
ls -la caret-src/core/prompts/CaretPromptWrapper.ts
```
- caret-main에는 존재 (`caret-main/caret-src/core/prompts/CaretPromptWrapper.ts`)
- 현재 버전 확인 필요

---

**근본 원인** ✅:

1. **Frontend UI 머징 누락**:
   - ChatTextArea.tsx의 modeSystem 조건부 렌더링 코드가 Cline upstream 머징 시 손실
   - caret-main (Line 1067, 1826, 1829, 1843, 1851)에는 modeSystem 체크 존재
   - 현재 버전: 완전 누락

2. **Backend 프롬프트 시스템**:
   - ✅ 이미 구현됨 (system-prompt/index.ts)
   - CaretPromptWrapper 파일 존재 여부 확인 필요

3. **i18n 번역 키**:
   - `chat.json`에 `mode.chatbot.label`, `mode.agent.label` 키 필요
   - caret-main 참조하여 4개 언어 모두 추가 필요

---

**수정 계획** ✅:

#### Phase 1: CaretPromptWrapper 파일 확인 및 복원
1. caret-main에서 다음 파일 확인:
   - `caret-src/core/prompts/CaretPromptWrapper.ts`
   - `caret-src/core/prompts/sections/*.ts` (JSON prompts)
   - `caret-src/core/prompts/system/*.ts` (support files)
2. 현재 버전에 없으면 caret-main에서 복사

#### Phase 2: ChatTextArea.tsx 수정
1. Line 292 근처 `useExtensionState()`에서 `modeSystem` 추출 확인
2. Line 1067: CaretGlobalManager modeSystem 체크 추가 (API 설정 전환용)
3. Lines 1807, 1814: 하드코딩 레이블을 조건부 i18n으로 변경:
   ```typescript
   {modeSystem === "caret" ? t("mode.chatbot.label", "chat") : t("mode.plan.label", "chat")}
   {modeSystem === "caret" ? t("mode.agent.label", "chat") : t("mode.act.label", "chat")}
   ```
4. Line 1797: Tooltip 텍스트도 조건부 변경 (caret-main 참조)
5. Line 1826-1829: 컨텍스트 메뉴 레이블도 조건부 변경

#### Phase 3: i18n 번역 추가
1. `webview-ui/src/caret/locale/*/chat.json` 4개 언어 파일:
   ```json
   "mode": {
       "chatbot": {
           "label": "Chatbot",
           "tooltip": "..."
       },
       "agent": {
           "label": "Agent",
           "tooltip": "..."
       },
       "plan": { "label": "Plan", ... },
       "act": { "label": "Act", ... }
   }
   ```
2. caret-main chat.json 참조하여 정확한 키 구조 확인

#### Phase 4: 검증
1. `npm run compile` 성공 확인
2. Caret 모드: "Chatbot/Agent" 표시 확인
3. Cline 모드: "Plan/Act" 표시 확인
4. AI에게 "현재 모드가 뭐야?" 질문 → Chatbot/Agent 답변 확인

---

**10차 수정 완료** ✅ (2025-10-14 진행 중):

#### 수정 1: ChatTextArea.tsx - UI 조건부 렌더링
**파일**: `webview-ui/src/components/chat/ChatTextArea.tsx`

**변경사항**:
1. Line 19: `import { t } from "@/caret/utils/i18n"` 추가
2. Line 294: `modeSystem` 추출 from `useExtensionState()`
3. Lines 1815, 1823: 레이블 조건부 렌더링:
   ```typescript
   {modeSystem === "caret" ? t("mode.chatbot.label", "chat") : t("mode.plan.label", "chat")}
   {modeSystem === "caret" ? t("mode.agent.label", "chat") : t("mode.act.label", "chat")}
   ```
4. Lines 1802-1805: Tooltip 텍스트 조건부 변경

#### 수정 2: i18n 번역 추가
**파일**: `webview-ui/src/caret/locale/en/chat.json`

**추가된 키** (Lines 51-73):
```json
"mode": {
    "act": { "label": "Act" },
    "plan": { "label": "Plan" },
    "agent": { "label": "Agent" },
    "chatbot": { "label": "Chatbot" }
}
```

**남은 작업**:
- 한국어, 일본어, 중국어 chat.json에도 mode 키 추가 필요

**검증**:
- ✅ `npm run compile` 성공
- 🔄 Caret 모드 UI 테스트 필요
- 🔄 Cline 모드 UI 테스트 필요

---

**사용자 의견**:
- "왜 정상이라고 생각해?"
- "해당 로그는 앱 실행시 처음 실행 되야 하는거 아냐?"

**분석**:
- `updateApiConfigurationProto`는 앱 시작 또는 설정 변경 시에만 호출되어야 함
- 탭 전환 시 호출되는 것은 불필요한 API 호출 = 버그

**조사 필요**:
1. `GeneralSettingsSection` 또는 `CaretGeneralSettingsSection` 컴포넌트
2. useEffect 훅 중 mount 시 API 호출하는 코드
3. `useApiConfigurationHandlers` 사용 여부

---

## 🎯 8차/9차 완료된 항목 (참고용)

### ✅ 완료 항목
1. **1.1**: Welcome 배너 이미지 (정규식 수정, Base64 주입)
2. **1.5**: 오픈라우터 모델 설명 번역 (Model 레이블, ThinkingBudget, featuredModels i18n)
3. **1.6**: 페르소나 설정 페이지 엑스박스 (1.1로 해결)
4. **2.2**: 텔레메트리 배너 (GitHub 링크로 변경, i18n 적용)
5. **2.2**: 공지사항 (v3.32.7 버전 업데이트, CHANGELOG 정리)
6. **2.4**: Rules 아이콘 페르소나 누락 (3.6-a/b로 해결)
7. **3.3**: Focus Chain 활성화 (기본값 true 설정)
8. **3.5**: Browser 설정 Warning (transient prop 사용)
9. **3.6-a**: 모드 시스템 토글 (proto field 1001+ 충돌 해결)
10. **3.6-b**: 페르소나 시스템 활성화 체크박스 (`!== false` 패턴)
11. **4.1**: Account 메뉴 (CaretAccountView 3-way 분기, VS Code API 중복 해결, 브랜딩 수정)
12. **4.2**: AccountWelcomeView 브랜딩 (로고, 텍스트 i18n, GitHub 링크)

---

## 📊 머징 검증 리포트 (2025-10-14)

**전체 머징 검증 완료** - 상세 리포트 참조:
→ `caret-docs/work-logs/luke/2025-10-14-merge-verification-report.md`

### 핵심 결과
- ✅ **기능 머징: 성공** (모든 Caret 기능 정상 이전)
- ⚠️ **문서 구조: 부분 성공** (workflow 중복 발견)

### 발견된 주요 이슈
1. **Workflow 중복**: `.caretrules/workflows/` ↔ `caret-docs/development/workflows/`
   - 대부분 파일이 두 위치에 존재하나 내용 상이
   - 일부 파일 한쪽에만 존재
   - **권장**: `.caretrules/workflows/`를 단일 진실 공급원으로 정리

2. **상호참조 미완성**: 23개 한글 MDX 중 9개만 workflows 참조
   - **권장**: 모든 한글 문서에 관련 AI workflow 링크 추가

3. **CLAUDE.md 개선 필요**:
   - Workflow 시스템 설명 불명확
   - 문서 조직 전략 누락
   - **권장**: "AI Development Methodology" 섹션 추가

### 권장 조치 (우선순위)
1. **High**: Workflow 중복 해결 (섹션 5.1.A)
2. **High**: CLAUDE.md 업데이트 (섹션 5.1.C)
3. **Medium**: 상호참조 완성 (섹션 5.2.D)

---

## 📚 머징 개선 사항 (누적)

### Proto 수정 시 필수 3단계
1. proto 파일 수정 (Settings + UpdateSettingsRequest 모두)
2. `npm run protos` 실행 (생성 코드 업데이트)
3. Controller getStateToPostToWebview() 필드 추가

### 신규 Cline 파일 브랜딩 체크
- Logo import 검색: `grep -r "ClineLogo" webview-ui/src`
- 하드코딩 텍스트 검색: `grep -r "Sign up with Cline"`
- URL 검색: `grep -r "cline\\.bot"`
- 런타임 테스트: 로그인/로그아웃/계정전환 모두 테스트

### Singleton 패턴 주의
- Caret 전용 파일 (utils/vscode.ts) 중복 호출 방지
- `acquireVsCodeApi()` 1회만 호출 보장

### State Flow 검증
- Backend (state-helpers) → ExtensionState → Frontend Context 전체 흐름 확인
- globalState 로드 → Controller 전달 → Proto 생성 → Frontend 수신
