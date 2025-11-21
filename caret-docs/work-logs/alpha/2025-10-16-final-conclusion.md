# F12 Claude Code Task 툴 최종 결론

작성일: 2025-10-16
작성자: Alpha Yang

## 핵심 발견

### Task 툴 존재 확인

```bash
$ claude -p "What tools do you have access to?"

## Task Management & Collaboration
- **Task** - Launch specialized agents for complex multi-step tasks 
  (general-purpose, statusline-setup, output-style-setup)
```

**확인된 사실:**
1. ✅ Task 툴은 Claude Code CLI의 **내장 툴**
2. ✅ "Launch specialized agents" - 서브에이전트 기능
3. ✅ 기본 제공되는 agent types 존재

---

## 최종 결론

### 1. Caret 구현 방향: CLI 방식 유지 (시나리오 A)

**이유:**
- Task 툴은 Claude Code CLI가 이미 제공
- Caret은 `--disallowedTools` 제어만 하면 됨
- 최소 침습 원칙 준수

### 2. 현재 구현의 문제점

**CaretPromptWrapper.ts의 Task 툴 주입:**
```typescript
// ❌ 불필요한 코드 (제거 필요)
if (isClaudeCode) {
  const taskToolDescription = CaretPromptWrapper.getTaskToolDescription()
  prompt = CaretPromptWrapper.injectTaskToolDescription(prompt, taskToolDescription)
}
```

**문제:**
- CLI가 이미 Task 툴 제공
- 시스템 프롬프트에 중복 추가
- 충돌 및 혼란 가능성

### 3. 올바른 구현

**run.ts만 수정하면 충분:**
```typescript
// src/integrations/claude-code/run.ts
async function getClaudeCodeDisallowedTools(): Promise<string> {
  const isCaretMode = CaretGlobalManager.currentMode === "caret"
  
  const disallowedTools = [
    // ✅ Caret 모드에서만 Task 툴 활성화
    ...(isCaretMode ? [] : ["Task"]),
    "Bash",
    "Glob",
    "Grep",
    // ... other tools
  ]
  
  return disallowedTools.join(",")
}
```

**이것만으로 끝:**
- Caret 모드: Task 툴 사용 가능
- Cline 모드: Task 툴 비활성화
- CLI가 모든 것을 처리

---

## 구현 계획

### Phase 1: 불필요한 코드 제거

1. **CaretPromptWrapper.ts 수정**
   ```typescript
   // Task 툴 주입 코드 전체 제거
   // - getTaskToolDescription() 메서드
   // - injectTaskToolDescription() 메서드
   // - provider 감지 로직
   ```

2. **CLAUDE_CODE_TASK_TOOL.json 삭제**
   ```bash
   rm caret-src/core/prompts/sections/CLAUDE_CODE_TASK_TOOL.json
   ```

3. **run.ts는 그대로 유지**
   - 이미 올바르게 구현됨
   - Caret 모드 감지 ✅
   - Task 툴 제어 ✅

### Phase 2: 테스트

1. **컴파일 확인**
   ```bash
   npm run compile
   ```

2. **F5 디버그 테스트**
   - Caret 모드로 전환
   - Claude Code 모델 선택
   - Task 툴 사용 가능 확인

3. **로그 검증**
   ```typescript
   // CaretGlobalManager.currentMode === "caret" 확인
   // disallowedTools에 "Task"가 없는지 확인
   ```

### Phase 3: 문서화

1. **F12 스펙 업데이트**
   - Task 툴은 CLI 내장
   - 시스템 프롬프트 주입 불필요
   - CLI 제어만으로 충분

2. **위험성 문서**
   - CLI 파싱 방식의 한계 명시
   - 향후 SDK 마이그레이션 계획

---

## 마스터 질문 답변

### Q: "서브프로세스를 클로드 코드 cli를 실행하고 파싱해온다는거야?"
**A:** ✅ 맞습니다. `execa()`로 subprocess 실행 후 stdout JSON 파싱

### Q: "클로드 코드가 출력 형태 바꾸면 망하네?"
**A:** ✅ 정확합니다. `--output-format stream-json`에 의존

### Q: "공식 sdk를 쓰지 않고 출력만 파싱했다는거지?"
**A:** ✅ 맞습니다. TypeScript SDK 미사용, JSON.parse()만 사용

### Q: "서브태스크를 너는 실행할 수 있어?"
**A:** 
- ✅ Task 툴은 Claude Code CLI에 내장
- ✅ `--disallowedTools`에서 제외하면 사용 가능
- ❌ 제 환경(Cline 툴 시스템)에서는 직접 사용 불가
- ✅ 하지만 Caret이 Claude Code 모델을 사용할 때는 Task 툴 제공됨

---

## 다음 작업

### 즉시 수행

1. **CaretPromptWrapper.ts 수정**
   - Task 툴 주입 코드 제거
   - 디버그 로깅 제거
   - provider 감지 로직 제거

2. **JSON 파일 삭제**
   - `CLAUDE_CODE_TASK_TOOL.json` 제거

3. **컴파일 및 테스트**
   - `npm run compile`
   - F5 디버그 실행
   - Caret 모드 + Claude Code 모델 테스트

### 마스터 승인 필요

작업 진행해도 될까요?
1. CaretPromptWrapper.ts에서 Task 툴 주입 코드 제거
2. CLAUDE_CODE_TASK_TOOL.json 삭제
3. 컴파일 후 테스트

---

## 참고 문서

- `caret-docs/work-logs/alpha/2025-10-16-sdk-explanation.md`
- `caret-docs/work-logs/alpha/2025-10-16-implementation-approach-analysis.md`
- `caret-docs/work-logs/alpha/2025-10-16-cli-parsing-risk-analysis.md`
- `caret-docs/work-logs/alpha/2025-10-16-task-tool-verification.md`
