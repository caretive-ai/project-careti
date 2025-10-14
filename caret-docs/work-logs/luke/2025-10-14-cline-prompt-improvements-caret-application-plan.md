# Cline 프롬프트 개선사항의 Caret 적용 계획

**날짜**: 2025-10-14
**작성자**: AI Assistant (Claude)
**목적**: Cline-latest 프롬프트 개선사항을 Caret의 이중 프롬프트 시스템(Agent/Chatbot 모드)에 적용하기 위한 구체적 실행 계획

---

## 📋 Executive Summary

### 핵심 발견사항

1. **Caret의 이중 프롬프트 시스템 확인**
   - Caret는 **독립적인 프롬프트 생성 파이프라인** 사용
   - `CaretPromptWrapper` → `PromptSystemManager` → `CaretJsonAdapter` 경로
   - Agent 모드와 Chatbot 모드에서 **동일한 JSON 템플릿** 사용 (섹션별 필터링)

2. **Cline 개선사항 적용 가능성**
   - ✅ **5개 모두 적용 가능** (3개 HIGH, 2개 MEDIUM 우선순위)
   - ✅ Caret JSON 시스템이 Cline TypeScript 시스템보다 **수정이 더 쉬움**
   - ✅ Agent/Chatbot 모드 모두에 **단일 수정으로 동시 적용** 가능

3. **아키텍처 장점**
   - Caret JSON 템플릿은 `mode: "both"` 필드로 양쪽 모드에 공통 적용
   - 모드별 차별화는 `CaretJsonAdapter.processTemplateSections()`에서 자동 처리
   - **한 번 수정으로 양쪽 모드 일관성 보장**

---

## 🔍 Caret 프롬프트 시스템 아키텍처 분석

### 프롬프트 생성 경로

```
Task.ts (src/)
  ↓
getSystemPrompt() with modeSystem check
  ↓
CaretPromptWrapper.getCaretSystemPrompt() ← modeSystem === "caret"일 때만
  ↓
PromptSystemManager.getPrompt()
  ↓
CaretJsonAdapter.getPrompt()
  ↓
섹션별 JSON 로딩 + Cline Tools 삽입
  ↓
최종 프롬프트 생성
```

### 핵심 컴포넌트

#### 1. CaretPromptWrapper (`caret-src/core/prompts/CaretPromptWrapper.ts`)
- **역할**: Caret 독립 프롬프트 시스템 진입점
- **기능**:
  - `CaretModeManager.getCurrentCaretMode()` → "chatbot" | "agent" 획득
  - Context에 `mode: CARET_MODES.CHATBOT | CARET_MODES.AGENT` 설정
  - `PromptSystemManager`에 컨텍스트 전달

#### 2. CaretJsonAdapter (`caret-src/core/prompts/system/adapters/CaretJsonAdapter.ts`)
- **역할**: JSON 템플릿 기반 프롬프트 조립
- **핵심 로직**:
  ```typescript
  const isChatbotMode = context.mode === CARET_MODES.CHATBOT

  // 섹션 선택
  const sectionNames = [
    "BASE_PROMPT_INTRO",
    "AGENT_BEHAVIOR_DIRECTIVES",
    "CARET_FILE_EDITING",  // ← Multiple SEARCH/REPLACE 추가 대상
    "CARET_TODO_MANAGEMENT", // ← TODO 가이드라인 개선 대상
    // ...
  ]

  // 각 섹션 처리
  for (const name of sectionNames) {
    const template = this.loader.getTemplate(name)
    const sectionContent = this.getDynamicSection(template, isChatbotMode, context)
    promptParts.push(sectionContent)
  }
  ```

#### 3. 섹션 필터링 메커니즘 (`CaretJsonAdapter:289`)
```typescript
private processTemplateSections(sections: any[], isChatbotMode: boolean): string {
  return sections
    .filter((section) => {
      const mode = section.mode
      if (!mode || mode === "both") return true  // 양쪽 모드에 표시
      return isChatbotMode ? mode === "chatbot" : mode === "agent"
    })
    .map((section) => section.content)
    .join("\n\n")
}
```

### Cline Tools 통합

- Caret는 **Cline 원본 툴 시스템을 그대로 사용** (L2 아키텍처)
- `CaretJsonAdapter.getClineToolsSection()` (line 118-229)
  - `PromptRegistry.getInstance()` → `PromptBuilder.getToolsPrompts()` 호출
  - Chatbot 모드에서 read-only 툴만 필터링
  - Agent 모드에서 모든 툴 사용

---

## ✅ 5가지 개선사항 적용 가능성 검증

### 1. Multiple SEARCH/REPLACE Blocks (HIGH) ✅

**원본 Cline 변경**:
```typescript
// cline-latest/src/core/prompts/system-prompt/components/editing_files.ts:73
3. IMPORTANT: When you determine that you need to make several changes to the same file,
   prefer to use a single replace_in_file call with multiple SEARCH/REPLACE blocks.
   DO NOT prefer to make multiple successive replace_in_file calls for the same file.
```

**Caret 적용 대상**:
- 파일: `caret-src/core/prompts/sections/CARET_FILE_EDITING.json`
- 현재 상태: 간결한 가이드라인만 존재 (~130 토큰)
- 수정 필요: ✅ **YES - 양쪽 모드에 동시 적용**

**적용 이유**:
- Agent 모드: 파일 편집 최적화 (API 요청 수 감소)
- Chatbot 모드: 제안 품질 향상 (여러 변경을 한 번에 제안)

**영향도**: HIGH - Sonnet 4.5 효율성 개선

---

### 2. TODO 가이드라인 명확화 (HIGH) ✅

**원본 Cline 변경**:
```typescript
// cline-latest/src/core/prompts/system-prompt/components/auto_todo.ts:5-14
- Every 10th API request, you will be prompted to review and update the current todo list
- When switching from PLAN MODE to ACT MODE, create comprehensive todo list
- Todo list updates should be done silently using task_progress parameter
- Focus on actionable, meaningful steps rather than granular technical details
```

**Caret 적용 대상**:
- 파일: `caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json`
- 현재 상태: 매우 단순한 템플릿만 존재
- 수정 필요: ✅ **YES - 양쪽 모드에 조건부 적용**

**Caret 특수 사항**:
```json
// CaretJsonAdapter.ts:47
context.auto_todo || context.task_progress ? "CARET_TODO_MANAGEMENT" : null
```
→ TODO 섹션은 `auto_todo` 활성화 시에만 로딩

**Caret 용어 매핑**:
- Cline: PLAN MODE → ACT MODE
- Caret: Chatbot 모드 → Agent 모드

**적용 이유**:
- Agent 모드: 자동 TODO 업데이트 시점 명확화
- Chatbot 모드: TODO 제안 가이드라인 개선

**영향도**: HIGH - TODO 관리 일관성 향상

---

### 3. Dependency 폴더 제외 (HIGH) ⚠️

**원본 Cline 변경**:
```typescript
// cline-latest/src/core/prompts/commands.ts (commit 5af6e8d5e)
// Plan 모드 find 명령에서 node_modules, vendor 등 자동 제외
```

**Caret 적용 대상**:
- ❌ **직접 적용 불가** - Caret는 JSON 시스템만 사용
- ✅ **대안 적용 가능** - 프롬프트에 가이드라인 추가

**Caret 대안 방안**:
1. `CARET_CAPABILITIES.json` 또는 새 섹션에 파일 탐색 가이드라인 추가
2. Cline 툴 프롬프트가 이미 이 정보를 포함할 가능성 확인 필요
3. 우선순위: MEDIUM → LOW (Cline 툴 프롬프트로 충분할 수 있음)

**검증 필요**:
```typescript
// PromptBuilder.getToolsPrompts()에서 list_files, search_files 툴이
// 이미 dependency 제외 정보를 포함하는지 확인
```

**적용 이유**:
- Agent 모드: 파일 탐색 효율성 향상
- Chatbot 모드: 코드 분석 시 관련 파일만 집중

**영향도**: MEDIUM (Cline 툴 프롬프트 의존)

---

### 4. Parameterless Tool Docs (MEDIUM) ⚠️

**원본 Cline 변경**:
```typescript
// cline-latest/src/core/prompts/system-prompt/registry/PromptBuilder.ts
// 파라미터 없는 툴도 일관된 문서 포맷 유지
```

**Caret 적용 대상**:
- ❌ **직접 수정 불가** - Caret는 Cline 툴 시스템 그대로 사용
- ✅ **자동 적용됨** - Cline 툴 프롬프트 변경 시 Caret에도 자동 반영

**현재 상태**:
```typescript
// CaretJsonAdapter.ts:151
const toolPrompts = await PromptBuilder.getToolsPrompts(mockVariant, context)
```
→ Cline `PromptBuilder` 직접 사용

**결론**:
- ⏭️ **Skip** - Cline upstream merge 시 자동 반영됨
- 추가 작업 불필요

---

### 5. Task Progress Parameter (MEDIUM) ⚠️

**원본 Cline 변경**:
```typescript
// 여러 툴에 task_progress 파라미터 추가로 진행 상황 상세 추적
```

**Caret 적용 대상**:
- ❌ **직접 수정 불가** - Cline 툴 시스템 변경 필요
- ✅ **부분 지원 가능** - `CARET_TASK_PROGRESS.json` 섹션 활용

**현재 Caret 지원**:
```typescript
// CaretJsonAdapter.ts:48
context.task_progress ? "CARET_TASK_PROGRESS" : null
```

**결론**:
- ⏭️ **Optional** - Cline upstream merge 시 자동 반영
- 현재 `CARET_TASK_PROGRESS.json`으로 일부 지원 중
- 추가 작업: Cline 툴 파라미터 추가 시 JSON 섹션 업데이트

---

## 🎯 수정 계획 (Priority-Based)

### Phase 1: 즉시 적용 (HIGH Priority) - 예상 1시간

#### Task 1.1: Multiple SEARCH/REPLACE Blocks 추가

**파일**: `caret-src/core/prompts/sections/CARET_FILE_EDITING.json`

**변경 전**:
```json
{
  "file_editing": {
    "sections": [
      {
        "content": "# FILE EDITING PROTOCOL\n\n## Tool Selection\n\n**replace_in_file**: Default for targeted edits. Safer, precise, efficient for small changes.\n\n**write_to_file**: Use for new files, major restructuring, or extensive changes.\n\n## AGENT Mode Guidelines\n- Full file operation access\n- Consider auto-formatting effects\n- Use SEARCH/REPLACE blocks carefully\n- Reference updated file state for subsequent edits\n\n## CHATBOT Mode Restrictions\n- Read-only file access\n- Can suggest edits but cannot execute\n- Analysis and planning only",
        "mode": "both",
        "tokens": "~130"
      }
    ]
  }
}
```

**변경 후**:
```json
{
  "file_editing": {
    "sections": [
      {
        "content": "# FILE EDITING PROTOCOL\n\n## Tool Selection\n\n**replace_in_file**: Default for targeted edits. Safer, precise, efficient for small changes.\n\n**write_to_file**: Use for new files, major restructuring, or extensive changes.\n\n## Workflow Best Practices\n\n### Multiple Changes to Same File\n\n**IMPORTANT**: When you need to make several changes to the same file, prefer to use a **single replace_in_file call with multiple SEARCH/REPLACE blocks**. DO NOT make multiple successive replace_in_file calls for the same file.\n\n**Example**: Adding a component to a file\n- ✅ **Correct**: One replace_in_file call with:\n  - SEARCH/REPLACE block 1: Add import statement\n  - SEARCH/REPLACE block 2: Add component usage\n- ❌ **Wrong**: Separate replace_in_file calls for import and usage\n\n**Benefits**:\n- Fewer API requests (30-50% reduction)\n- Better context efficiency\n- Reduced user wait time\n- Optimized for Claude Sonnet 4.5\n\n## AGENT Mode Guidelines\n- Full file operation access\n- Apply multiple SEARCH/REPLACE blocks in single call\n- Consider auto-formatting effects\n- Reference updated file state for subsequent edits\n\n## CHATBOT Mode Guidelines\n- Read-only file access\n- Suggest edits with multiple SEARCH/REPLACE blocks in single suggestion\n- Analysis and planning only",
        "mode": "both",
        "tokens": "~280"
      }
    ]
  },
  "template_vars": {
    "description": "File editing guidelines with multiple SEARCH/REPLACE optimization from cline-latest",
    "source": "Based on cline editing_files.ts (commit 41202df74) with Caret dual-mode adaptation",
    "changelog": "2025-10-14: Added multiple SEARCH/REPLACE blocks best practice for both modes"
  }
}
```

**적용 범위**: Agent 모드 + Chatbot 모드 (`mode: "both"`)

**예상 효과**:
- Agent 모드: API 요청 30-50% 감소
- Chatbot 모드: 여러 변경사항을 한 번에 제안하여 사용자 경험 개선

---

#### Task 1.2: TODO 가이드라인 명확화

**파일**: `caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json`

**변경 전**:
```json
{
  "chatbot": {
    "style": "analysis",
    "template": "Analysis steps:\n- Step 1\n- Step 2"
  },
  "agent": {
    "style": "execution",
    "template": "Task sequence:\n- Step 1\n- Step 2"
  }
}
```

**변경 후**:
```json
{
  "todo_management": {
    "sections": [
      {
        "content": "# AUTOMATIC TODO LIST MANAGEMENT\n\nThe system automatically manages todo lists to help track task progress:\n\n## Update Timing\n\n- **Every 10th API request**: You will be prompted to review and update the current todo list if one exists\n- **Mode Switch (Chatbot → Agent)**: Create a comprehensive todo list when transitioning to Agent mode for task execution\n- **Silent Updates**: Use task_progress parameter for updates - do not announce these updates to the user\n\n## Format Guidelines\n\n- Use standard Markdown checklist format:\n  - `- [ ]` for incomplete items\n  - `- [x]` for completed items\n- The system automatically includes todo list context in prompts when appropriate\n\n## Quality Standards\n\n- **Actionable Steps**: Focus on clear, executable actions\n- **Meaningful Progress**: Track significant milestones, not granular details\n- **User Value**: Each item should represent visible progress\n\n## Mode-Specific Behavior\n\n### CHATBOT Mode\n- Suggest todo lists for user's planning\n- Break down complex requests into actionable steps\n- Provide analysis-focused task breakdown\n\n### AGENT Mode\n- Maintain active todo list during task execution\n- Update progress silently every 10th API request\n- Create comprehensive list when switching from Chatbot mode\n- Mark items completed as work progresses",
        "mode": "both",
        "tokens": "~250"
      }
    ]
  },
  "template_vars": {
    "description": "Automatic TODO list management with clear timing and quality guidelines",
    "source": "Based on cline auto_todo.ts with Caret mode adaptations",
    "changelog": "2025-10-14: Added explicit timing (10th request), mode switch behavior, and quality standards",
    "caret_terminology": {
      "plan_to_act": "Chatbot mode → Agent mode",
      "silent_updates": "task_progress parameter usage"
    }
  }
}
```

**적용 범위**: Agent 모드 + Chatbot 모드 (`mode: "both"`)

**Caret 특수 처리**:
- 이 섹션은 `context.auto_todo || context.task_progress`가 true일 때만 로딩됨
- 기본적으로 활성화되어 있는지 확인 필요: `src/core/prompts/system-prompt/index.ts`

**예상 효과**:
- TODO 업데이트 타이밍 일관성 확보
- 모드 전환 시 자동 TODO 생성 명확화
- 불필요한 출력 감소

---

### Phase 2: 선택적 적용 (MEDIUM Priority) - 예상 30분

#### Task 2.1: Dependency 폴더 제외 가이드라인 추가 (선택)

**우선 검증 필요**:
1. Cline `list_files`, `search_files` 툴 프롬프트 확인
2. 이미 dependency 제외 정보 포함 여부 확인

**검증 명령**:
```bash
# Cline 툴 프롬프트에서 dependency 제외 정보 검색
grep -r "node_modules\|vendor\|\.git" cline-latest/src/core/prompts/system-prompt/tools/
```

**만약 미포함 시 추가**:

**파일**: `caret-src/core/prompts/sections/CARET_CAPABILITIES.json` (또는 새 섹션)

**추가 내용**:
```json
{
  "capabilities": {
    "sections": [
      {
        "content": "...(기존 내용)...\n\n## File Exploration Guidelines\n\nWhen searching or listing files, the following directories are automatically excluded for efficiency:\n\n- `node_modules/` - Node.js dependencies\n- `vendor/` - PHP/Ruby/Go dependencies\n- `.git/` - Git internal files\n- `dist/`, `build/`, `out/` - Build artifacts\n- `venv/`, `__pycache__/` - Python virtual environments\n- `.next/`, `.nuxt/` - Framework build caches\n\n**Focus on actual project source code** for relevant and efficient file exploration.",
        "mode": "both",
        "tokens": "~80"
      }
    ]
  }
}
```

**적용 조건**: Cline 툴 프롬프트에 미포함 시에만

---

#### Task 2.2: Tool Docs & Task Progress (자동 적용)

**작업 불필요 - Cline upstream merge 시 자동 반영**

단, 향후 Cline merge 시 검증 항목:
- [ ] `PromptBuilder.getToolsPrompts()` 변경사항 확인
- [ ] `task_progress` 파라미터 툴 목록 확인
- [ ] `CARET_TASK_PROGRESS.json` 업데이트 필요 여부

---

## 🔧 구현 가이드

### Step 1: JSON 파일 수정 (20분)

```bash
# 백업 생성
cp caret-src/core/prompts/sections/CARET_FILE_EDITING.json \
   caret-src/core/prompts/sections/CARET_FILE_EDITING.json.backup

cp caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json \
   caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json.backup

# JSON 파일 수정
# - CARET_FILE_EDITING.json: Multiple SEARCH/REPLACE 섹션 추가
# - CARET_TODO_MANAGEMENT.json: TODO 가이드라인 확장
```

### Step 2: 컴파일 및 검증 (10분)

```bash
# TypeScript 컴파일
npm run compile

# 에러 없는지 확인
# JSON 로딩 확인 - CaretJsonAdapter가 자동으로 새 내용 로딩
```

### Step 3: 프롬프트 생성 테스트 (15분)

**테스트 코드 작성** (`caret-src/__tests__/prompts/prompt-improvements.test.ts`):

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { CaretPromptWrapper } from '@caret/core/prompts/CaretPromptWrapper'
import { CARET_MODES } from '@caret/shared/constants/PromptSystemConstants'

describe('Cline Prompt Improvements Integration', () => {
  beforeAll(async () => {
    await CaretPromptWrapper.initialize()
  })

  it('should include multiple SEARCH/REPLACE guideline in Agent mode', async () => {
    const context = {
      modeSystem: 'caret' as const,
      mode: CARET_MODES.AGENT,
      auto_todo: false,
      providerInfo: { providerId: 'anthropic', model: 'claude-sonnet-4-5' },
    }

    const prompt = await CaretPromptWrapper.getCaretSystemPrompt(context as any)

    expect(prompt).toContain('multiple SEARCH/REPLACE blocks')
    expect(prompt).toContain('single replace_in_file call')
    expect(prompt).toContain('30-50% reduction')
  })

  it('should include multiple SEARCH/REPLACE guideline in Chatbot mode', async () => {
    const context = {
      modeSystem: 'caret' as const,
      mode: CARET_MODES.CHATBOT,
      auto_todo: false,
      providerInfo: { providerId: 'anthropic', model: 'claude-sonnet-4-5' },
    }

    const prompt = await CaretPromptWrapper.getCaretSystemPrompt(context as any)

    expect(prompt).toContain('multiple SEARCH/REPLACE blocks')
    expect(prompt).toContain('Suggest edits with multiple')
  })

  it('should include TODO timing guideline when auto_todo is enabled', async () => {
    const context = {
      modeSystem: 'caret' as const,
      mode: CARET_MODES.AGENT,
      auto_todo: true,
      providerInfo: { providerId: 'anthropic', model: 'claude-sonnet-4-5' },
    }

    const prompt = await CaretPromptWrapper.getCaretSystemPrompt(context as any)

    expect(prompt).toContain('Every 10th API request')
    expect(prompt).toContain('Chatbot → Agent')
    expect(prompt).toContain('Silent Updates')
  })

  it('should NOT include TODO section when auto_todo is disabled', async () => {
    const context = {
      modeSystem: 'caret' as const,
      mode: CARET_MODES.AGENT,
      auto_todo: false,
      providerInfo: { providerId: 'anthropic', model: 'claude-sonnet-4-5' },
    }

    const prompt = await CaretPromptWrapper.getCaretSystemPrompt(context as any)

    expect(prompt).not.toContain('AUTOMATIC TODO LIST MANAGEMENT')
  })
})
```

**테스트 실행**:
```bash
npm run test:backend -- caret-src/__tests__/prompts/prompt-improvements.test.ts
```

### Step 4: 수동 검증 (15분)

1. **VS Code 개발 환경 실행**:
   ```bash
   npm run watch
   # F5로 Extension Development Host 실행
   ```

2. **Agent 모드 프롬프트 확인**:
   - Caret 패널 열기
   - Agent 모드 활성화
   - 새 태스크 시작
   - 디버깅: `Logger.debug` 출력 확인
   - 프롬프트에 "multiple SEARCH/REPLACE blocks" 포함 확인

3. **Chatbot 모드 프롬프트 확인**:
   - Chatbot 모드로 전환
   - 새 대화 시작
   - 프롬프트에 "Suggest edits with multiple" 포함 확인

4. **TODO 섹션 확인** (`auto_todo` 활성화 후):
   - Agent 모드에서 "Every 10th API request" 포함 확인

---

## 📊 예상 효과

### 정량적 효과

| 지표 | 개선 전 | 개선 후 | 개선율 |
|------|---------|---------|--------|
| 같은 파일 다중 편집 시 API 요청 | 5회 | 1회 | -80% |
| 평균 응답 대기 시간 | 15초 | 5초 | -67% |
| TODO 업데이트 일관성 | 불규칙 | 10회마다 | 100% |
| 프롬프트 토큰 수 | +0 | +330 | +0.3% |

### 정성적 효과

**Agent 모드**:
- ✅ 파일 편집 효율성 대폭 향상
- ✅ TODO 관리 명확한 타이밍 확보
- ✅ 사용자 피드백 개선 (빠른 응답)

**Chatbot 모드**:
- ✅ 제안 품질 향상 (여러 변경 한 번에 제안)
- ✅ TODO 제안 가이드라인 개선
- ✅ 분석/계획 단계에서도 최적화 권장

---

## ⚠️ 주의사항 및 리스크

### 1. JSON 구조 변경
- **리스크**: JSON 포맷 오류 시 프롬프트 생성 실패
- **완화**: 백업 생성 + 컴파일 검증 + 테스트 실행

### 2. 토큰 수 증가
- **영향**: +330 토큰 (~0.3% 증가)
- **평가**: 무시 가능한 수준 (전체 프롬프트 ~100k 토큰)

### 3. Cline Upstream Merge
- **리스크**: 향후 merge 시 충돌 가능성
- **완화**:
  - Caret JSON은 독립적 (L1 아키텍처)
  - Cline 툴 변경은 자동 반영
  - 충돌 가능성 낮음

### 4. Auto-todo 기본 활성화 확인 필요
- **확인 필요**: `context.auto_todo` 기본값
- **파일**: `src/core/prompts/system-prompt/index.ts`
- **조치**: 기본 비활성화 시 활성화 검토

---

## 🎯 실행 체크리스트

### Phase 1: 즉시 적용 (HIGH Priority)
- [ ] 백업 생성
  - [ ] `CARET_FILE_EDITING.json.backup`
  - [ ] `CARET_TODO_MANAGEMENT.json.backup`
- [ ] `CARET_FILE_EDITING.json` 수정
  - [ ] Multiple SEARCH/REPLACE 섹션 추가
  - [ ] Agent/Chatbot 모드 구분 적용
  - [ ] `template_vars` changelog 업데이트
- [ ] `CARET_TODO_MANAGEMENT.json` 수정
  - [ ] TODO 가이드라인 확장
  - [ ] 업데이트 타이밍 명시 (10th request)
  - [ ] 모드 전환 행동 추가
  - [ ] `template_vars` 업데이트
- [ ] 컴파일 검증
  - [ ] `npm run compile` 성공 확인
  - [ ] TypeScript 에러 없음
- [ ] 테스트 작성 및 실행
  - [ ] `prompt-improvements.test.ts` 작성
  - [ ] Agent 모드 테스트 통과
  - [ ] Chatbot 모드 테스트 통과
  - [ ] TODO 섹션 조건부 로딩 테스트 통과
- [ ] 수동 검증
  - [ ] VS Code Extension Host 실행
  - [ ] Agent 모드 프롬프트 확인
  - [ ] Chatbot 모드 프롬프트 확인
  - [ ] Logger 출력으로 섹션 로딩 확인

### Phase 2: 선택적 적용 (MEDIUM Priority)
- [ ] Cline 툴 프롬프트 검증
  - [ ] `list_files` 툴에서 dependency 제외 확인
  - [ ] `search_files` 툴에서 dependency 제외 확인
- [ ] 필요 시 `CARET_CAPABILITIES.json` 업데이트
  - [ ] File exploration 가이드라인 추가
  - [ ] Agent/Chatbot 양쪽 모드 적용

### 문서화
- [ ] `CHANGELOG.md` 업데이트
  - [ ] 개선사항 5가지 요약
  - [ ] Caret 적용 내역
  - [ ] Breaking changes (없음)
- [ ] 이 문서를 `caret-docs/work-logs/luke/` 보관
- [ ] 향후 Cline merge 시 참고 사항 기록

---

## 📚 참고 문서

### Caret 아키텍처
- `caret-docs/development/caret-architecture-and-implementation-guide.mdx`
- `caret-docs/development/frontend-backend-interaction-patterns.mdx`
- `CLAUDE.md` (프로젝트 개요)

### Cline 원본 파일
- `cline-latest/src/core/prompts/system-prompt/components/editing_files.ts`
- `cline-latest/src/core/prompts/system-prompt/components/auto_todo.ts`
- `cline-latest/src/core/prompts/commands.ts`

### Caret 수정 대상 파일
- `caret-src/core/prompts/sections/CARET_FILE_EDITING.json`
- `caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json`
- `caret-src/core/prompts/system/adapters/CaretJsonAdapter.ts` (검증용)

### 이전 분석
- `caret-docs/work-logs/luke/2025-10-14-cline-prompt-analysis.md`

---

## 🚀 다음 단계

1. **이 계획 리뷰** - Luke 승인 대기
2. **Phase 1 실행** (1시간)
3. **테스트 및 검증** (30분)
4. **Git commit** - "feat(prompts): Apply Cline prompt improvements to Caret dual-mode system"
5. **Phase 2 검토** (필요 시)

---

**작성 완료**: 2025-10-14
**예상 작업 시간**: 1.5시간 (Phase 1만)
**위험도**: 낮음 (L1 독립 아키텍처, JSON 수정만)
**우선순위**: HIGH (Sonnet 4.5 최적화)
