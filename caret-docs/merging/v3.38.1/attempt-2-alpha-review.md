# Phase D 코드 리뷰 (재검토)

**리뷰어**: Alpha (Gemini)  
**리뷰 일시**: 2025-11-23 15:54 (재검토)  
**대상**: Phase D 구현 (D-1 ModeSystem 버그 수정 + D-2 CLI 구현)  
**기준 문서**: `attempt-2-master.md` Lines 149-315

---

## 🎯 Executive Summary

Phase D는 **D-1 (ModeSystem 버그 수정)**과 **D-2 (Caret CLI 구현)** 두 부분으로 구성되어 있습니다.

| 섹션 | 계획된 작업 | 실제 구현 | 평가 |
|------|------------|----------|------|
| **D-1** | ModeSystem 버그 수정 (코어 로직) | ✅ 완료 | 🟢 EXCELLENT |
| **D-1 테스트** | mode-system.test.ts 생성 | ❌ 미구현 | 🔴 MISSING |
| **D-2 CLI** | Caret/Cline 분기 구현 | ❌ 미구현 | 🔴 NOT DONE |

**최종 판정**: 🟡 **D-1 코어 완료, 테스트 및 D-2 미완료**

---

## 📋 상세 코드 리뷰

### ✅ D-1.1: SetPromptSystemMode.ts - GlobalState 영속화

**파일**: `src/core/controller/persona/SetPromptSystemMode.ts`

#### 계획 vs 실제

**계획 (attempt-2-master.md:173-191)**:
```typescript
// Line 34-38 추가
controller.stateManager.setGlobalStateBatch({ caretModeSystem: newMode })
Logger.debug(`[SetPromptSystemMode] Saved to globalState: caretModeSystem=${newMode}`)
```

**실제 구현 (Line 34-35)**:
```typescript
// CARET MODIFICATION: Persist caretModeSystem to globalState for restart consistency
controller.stateManager.setGlobalStateBatch({ caretModeSystem: newMode })
```

#### 평가

| 항목 | 분석 | 상태 |
|------|------|------|
| **위치 정확성** | Line 34-35, `setCurrentMode()` 직후 | ✅ |
| **API 사용** | `setGlobalStateBatch()` 올바름 | ✅ |
| **주석** | CARET MODIFICATION 포함, 의도 명확 | ✅ |
| **최소 침습** | 1줄 추가만, 기존 로직 보존 | ✅ |
| **로깅** | 계획된 debug 로그는 없지만 필수는 아님 | ⚠️ |

**결론**: **🟢 PASS** - 핵심 기능은 완벽히 구현됨. Debug 로그 생략은 문제 없음.

---

### ✅ D-1.2: system-prompt/index.ts - Caret 분기 추가

**파일**: `src/core/prompts/system-prompt/index.ts`

#### 계획 vs 실제

**계획 (attempt-2-master.md:195-224)**:
```typescript
export async function getSystemPrompt(context: SystemPromptContext) {
    if (context.modeSystem === "caret") {
        const { CaretPromptWrapper } = await import("@caret/core/prompts/CaretPromptWrapper")
        const systemPrompt = await CaretPromptWrapper.getCaretSystemPrompt(context)
        return { systemPrompt, tools: [] }
    }
    const registry = PromptRegistry.getInstance()
    const systemPrompt = await registry.get(context)
    const tools = registry.nativeTools
    return { systemPrompt, tools }
}
```

**실제 구현 (Line 16-26)**:
```typescript
export async function getSystemPrompt(context: SystemPromptContext) {
    // CARET MODIFICATION: Route Caret mode to CaretPromptWrapper while preserving cline tool shape
    if (context.modeSystem === "caret") {
        const { CaretPromptWrapper } = await import("@caret/core/prompts/CaretPromptWrapper")
        return { systemPrompt: await CaretPromptWrapper.getCaretSystemPrompt(context), tools: [] }
    }
    const registry = PromptRegistry.getInstance()
    const systemPrompt = await registry.get(context)
    const tools = registry.nativeTools
    return { systemPrompt, tools }
}
```

#### 평가

| 항목 | 분석 | 상태 |
|------|------|------|
| **분기 조건** | `context.modeSystem === "caret"` 정확 | ✅ |
| **Dynamic Import** | lazy loading으로 Caret 의존성 격리 | ✅ |
| **Dual Shape** | Caret: `{systemPrompt, tools:[]}` <br> Cline: `{systemPrompt, tools}` | ✅ |
| **Task.ts 호환** | `Task.ts:2111-2112`가 기대하는 구조와 완벽 매칭 | ✅ |
| **Minimal Invasion** | Cline 경로 100% 보존, 5줄만 추가 | ✅ |

**기술적 탁월성**:
- `tools: []` 반환으로 CaretModeManager의 도구 필터링 로직 존중
- Inline return으로 코드 간결성 증가 (계획보다 개선됨)
- "preserving cline tool shape" 주석으로 의도 명확히 문서화

**결론**: **🟢 EXCELLENT** - 계획을 초과 달성. 코드 품질도 우수.

---

### ❌ D-1.3: 테스트 추가 (미구현)

**계획 (attempt-2-master.md:233-262)**: `caret-src/__tests__/prompt-system/mode-system.test.ts` 생성

**현황**:
```bash
$ find caret-src/__tests__ -name "*mode-system*"
# 결과 없음
```

#### 누락된 테스트 케이스

1. ✖ SetPromptSystemMode 호출 후 globalState 확인
2. ✖ modeSystem="caret" 시 CaretPromptWrapper 호출 확인
3. ✖ modeSystem="cline" 시 PromptRegistry 호출 확인
4. ✖ Webview에서 Chatbot/Agent 라벨 표시 확인
5. ✖ Webview에서 Plan/Act 라벨 표시 확인

**영향도 분석**:
- **위험도**: 🟡 중간 - 코어 로직은 단순하나 통합 테스트 없이는 런타임 검증 불가
- **회귀 위험**: 향후 리팩토링 시 버그 재발 가능성 증가

**결론**: **🔴 CRITICAL MISSING** - Phase D 완료 전 반드시 추가 필요

---

### ❌ D-2: Caret CLI 구현 (미구현)

#### D-2.1: CLI 배너 및 감지

**발견된 파일**:
- `webview-ui/src/components/welcome/CliInstallBanner.tsx` (✅ 존재)
- `src/utils/cli-detector.ts` (✅ 존재, 하지만 Cline 전용)

**계획 (attempt-2-master.md:280-289)**:
```
CliInstallBanner: Caret/Cline 브랜딩 분기 (modeSystem 기반)
cli-detector: Caret CLI (caret version, ~/.caret/bin) 감지 추가
```

**실제 구현 - CliInstallBanner.tsx**:

| Line | 코드 | 문제 |
|------|------|------|
| 26 | `url: "https://github.com/aicoding-caret/caret#cli-installation"` | ❌ 하드코딩 (Caret 전용) |
| 31 | `text: "npm install -g @caret-ai/cli"` | ❌ 하드코딩 (Caret 전용) |
| 8 | `const { isCliSubagent } = useExtensionState()` | ❌ `modeSystem` 없음 |

**필요한 수정**:
```typescript
const { isCliSubagent, modeSystem } = useExtensionState()

const cliUrl = modeSystem === "caret" 
  ? "https://github.com/aicoding-caret/caret#cli-installation"
  : "https://github.com/cline/cline#cli-installation"

const cliCommand = modeSystem === "caret"
  ? "npm install -g @caret-ai/cli"
  : "npm install -g @cline/cli"
```

**실제 구현 - cli-detector.ts**:

| Function | 현황 | 필요 |
|----------|------|------|
| `isClineCliInstalled()` | ✅ 구현됨 | - |
| `isCaretCliInstalled()` | ❌ 없음 | ✅ 필요 |

**필요한 수정**:
```typescript
export async function isCaretCliInstalled(): Promise<boolean> {
  try {
    const { stdout } = await execAsync("caret version", { timeout: 5000 })
    return stdout.includes("Caret CLI Version") || stdout.includes("Caret Core Version")
  } catch (error) {
    return false
  }
}
```

**결론**: **🔴 NOT IMPLEMENTED** - 파일은 있으나 분기 로직 전혀 없음

---

#### D-2.2: 프롬프트 CLI 안내

**파일**: `src/core/prompts/system-prompt/components/cli_subagents.ts`

**계획 (attempt-2-master.md:292-296)**:
```
cline 개선점 흡수 + Caret CLI 명칭/용도 반영
```

**실제 구현 분석**:

| Line | 내용 | 문제 |
|------|------|------|
| 5 | `USING THE CLINE CLI TOOL` | ❌ Cline만 언급 |
| 7 | "The Cline CLI tool can be used..." | ❌ Cline만 설명 |
| 18 | `cline "your prompt here"` | ❌ `caret` 명령어 없음 |

**필요한 수정**:
```typescript
const getCliSubagentsTemplateText = (context: SystemPromptContext) => {
  const cliName = context.modeSystem === "caret" ? "Caret" : "Cline"
  const cliCommand = context.modeSystem === "caret" ? "caret" : "cline"
  
  return `USING THE ${cliName.toUpperCase()} CLI TOOL
  
The ${cliName} CLI tool can be used to assign ${cliName} AI agents...

\`\`\`bash
${cliCommand} "your prompt here"
\`\`\`
...`
}
```

**결론**: **🔴 NOT IMPLEMENTED** - Cline CLI 안내만 존재, Caret 없음

---

#### D-2.3: i18n 누락

**계획**: `cliBanner.*` 키 추가

**확인 결과**:
```bash
$ grep -r "cliBanner" webview-ui/src/caret/locale/
# 결과 없음
```

**필요한 키** (`ko/en/ja/zh` 모든 로케일):
```json
{
  "welcome": {
    "cliBanner": {
      "title": "Caret CLI 설치",
      "description": "CLI를 설치하여 서브에이전트 기능을 사용하세요",
      "button": "설치 방법 보기"
    }
  }
}
```

**결론**: **🔴 MISSING** - i18n 키 전혀 없음, 현재 배너 렌더링 시 빈 문자열 표시됨

---

## 🔍 7가지 코드 리뷰 체크리스트

### 1. 3-Way 비교 정확성
- ✅ **PASS**: D-1은 `comparison/base|cline|caret` 기준 정확히 병합
- ❌ **FAIL**: D-2는 3-way 비교 없이 Caret 하드코딩

### 2. 버그 수정 시 3-Way 추적
- ✅ **PASS**: D-1 원인 분석(Line 156-170)과 구현이 100% 일치

### 3. 최소 침습 및 CARET MODIFICATION 주석
- ✅ **PASS**: D-1은 6줄 추가, 모든 수정에 주석 포함
- ⚠️ **WARNING**: CliInstallBanner는 TODO 주석만 있고 완성도 낮음

### 4. 하드코딩/정책 위반
- 🔴 **FAIL**: 
  - `CliInstallBanner.tsx`: Caret URL/명령어 하드코딩
  - `cli_subagents.ts`: Cline 명칭 하드코딩
  - **i18n 미적용**: 정책 심각 위반

### 5. Caret 정책 준수
- ✅ **D-1 PASS**: F06 Prompt System 완벽 구현
- 🔴 **D-2 FAIL**: 
  - F02 i18n 위반 (locale 키 없음)
  - Minimal Invasion 위반 (Cline 하드코딩)

### 6. 보안 위험
- ✅ **PASS**: 보안 이슈 없음

### 7. Stub/미완성 코드
- 🔴 **FAIL**:
  - `CliInstallBanner.tsx:18`: `// TODO: Add isClineCliInstalled`
  - `cli_subagents.ts`: Caret CLI 로직 없음 (Stub 상태)

---

## 📊 Phase D 완성도 분석

### D-1: ModeSystem 버그 수정

| 작업 | 계획 | 실제 | 완성도 |
|------|------|------|--------|
| SetPromptSystemMode 영속화 | ✅ | ✅ | 100% |
| getSystemPrompt 분기 | ✅ | ✅ | 100% |
| Dual Shape 반환 | ✅ | ✅ | 100% |
| 테스트 추가 | ✅ | ❌ | 0% |

**D-1 전체 완성도**: **75%** (코어 100%, 테스트 0%)

### D-2: Caret CLI 구현

| 작업 | 계획 | 실제 | 완성도 |
|------|------|------|--------|
| CliInstallBanner 분기 | ✅ | ❌ | 0% |
| cli-detector 분기 | ✅ | ❌ | 0% |
| cli_subagents 분기 | ✅ | ❌ | 0% |
| i18n 키 추가 | ✅ | ❌ | 0% |

**D-2 전체 완성도**: **0%** (파일만 존재, 기능 미구현)

---

## 🚨 Critical Issues

### Issue #1: 테스트 부재로 인한 검증 불가

**증상**: `mode-system.test.ts` 파일 없음

**영향**: 
- ModeSystem 버그 수정 기능의 런타임 동작 검증 불가
- 향후 회귀 버그 발생 시 조기 발견 불가능

**권장 조치**: 
```typescript
// 최소 필수 테스트
describe("ModeSystem Integration", () => {
  it("should persist caretModeSystem to globalState", async () => {
    // SetPromptSystemMode 호출
    // globalState에서 caretModeSystem 읽기
    // 값 일치 확인
  })
  
  it("should route to CaretPromptWrapper when modeSystem=caret", async () => {
    // getSystemPrompt({ modeSystem: "caret" }) 호출
    // tools: [] 확인
  })
})
```

---

### Issue #2: CLI 분기 로직 전혀 없음

**증상**: 
- `CliInstallBanner`: Caret URL 하드코딩
- `cli-detector`: `isCaretCliInstalled()` 없음
- `cli_subagents`: Cline만 언급

**영향**:
- Cline 모드에서 Caret CLI 안내 표시됨 (잘못된 정보)
- 사용자 혼란 초래

**권장 조치**: D-2 전체 재작업 필요 (attempt-2-master.md:280-309 참조)

---

### Issue #3: i18n 정책 위반

**증상**: `cliBanner.*` 키가 locale 파일에 없음

**영향**:
- CliInstallBanner 렌더링 시 빈 문자열 표시
- 다국어 지원 실패

**권장 조치**: `ko/en/ja/zh` 모든 로케일에 키 추가

---

## 🎯 최종 평가 및 권장사항

### Phase D 완료 기준 검증

| 기준 | 상태 | 비고 |
|------|------|------|
| D-1 핵심 로직 구현 | ✅ | SetPromptSystemMode + getSystemPrompt |
| D-1 테스트 추가 | ❌ | mode-system.test.ts 없음 |
| D-2 CLI 분기 구현 | ❌ | 파일만 존재, 기능 0% |
| D-2 i18n 추가 | ❌ | locale 키 없음 |
| 수동 검증 체크리스트 | ❓ | 실행되지 않음 |

### 최종 판정

**🟡 Phase D는 부분 완료 상태**

- **D-1 코어**: 🟢 완벽 구현 (코드 품질 우수)
- **D-1 테스트**: 🔴 미완료 (Critical)
- **D-2 전체**: 🔴 미착수 (파일만 추가됨)

### Next Steps (우선순위 순)

#### 1. Immediate (즉시 필요)
✅ **D-1.3 테스트 추가** (1시간)
- `caret-src/__tests__/prompt-system/mode-system.test.ts` 생성
- 5개 테스트 케이스 구현 (attempt-2-master.md:237-261)

#### 2. Critical (D-2 재작업)
🔴 **CLI 분기 로직 구현** (2-3시간)
```typescript
// A. CliInstallBanner.tsx
const { modeSystem } = useExtensionState()
const config = getModeConfig(modeSystem) // { url, command }

// B. cli-detector.ts
export async function isCaretCliInstalled(): Promise<boolean>

// C. cli_subagents.ts
const cliName = context.modeSystem === "caret" ? "Caret" : "Cline"
```

#### 3. Required (필수)
📝 **i18n 키 추가** (30분)
- `webview-ui/src/caret/locale/{ko,en,ja,zh}/welcome.json`
- `cliBanner.{title,description,button}` 추가

#### 4. Validation (검증)
🧪 **수동 검증 체크리스트** (1시간)
```
□ npm run compile 통과
□ npm run test 통과 (신규 테스트 포함)
□ UI에서 Caret↔Cline 토글 즉시 반영
□ Caret 모드: Chatbot/Agent 라벨 + Caret CLI 안내
□ Cline 모드: Plan/Act 라벨 + Cline CLI 안내
□ 확장 재시작 후 모드 유지
```

---

## 💡 결론

**Phase D-1**의 핵심 버그 수정은 **기술적으로 완벽**하게 구현되었습니다. 코드 품질, 아키텍처 설계, Minimal Invasion 원칙 모두 훌륭합니다.

하지만 **테스트 부재**와 **D-2 미구현**으로 인해 **Phase D 전체를 완료로 간주할 수 없습니다**.

**권장**: 
1. D-1.3 테스트 추가 후 **D-1만 별도 승인**
2. D-2는 **별도 작업 항목**으로 재계획 (2-3시간 소요 예상)
3. 현재 상태로 Phase E 진행 시 **CLI 기능 누락** 리스크 존재

**최종 권장 판정**: 🟡 **D-1 승인 (테스트 조건부), D-2 재작업 필요**

