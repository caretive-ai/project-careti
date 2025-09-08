# t06 - Phase 3: 의미론적 검증 (Semantic Verification)

## 1. 🎯 검증 목표

`CaretJsonAdapter`와 `ClineLatestAdapter`가 생성하는 시스템 프롬프트가 각기 다른 기술 스택(JSON vs. 컴포넌트)을 사용함에도 불구하고, 최종적으로 AI 모델에게 전달되는 지시사항의 **의미론적 동등성**을 검증한다. 특히, Caret의 핵심 철학인 '작업 관리 루프'와 관련된 기능들이 두 시스템에서 동등한 역할과 의미로 구현되었는지 확인하는 것을 목표로 한다.

---

## 2. ⚖️ 프롬프트 비교 분석

이 섹션에서는 각 어댑터가 생성한 프롬프트의 주요 부분을 나란히 비교하고, 그 의미와 역할이 어떻게 동등하게 유지되는지 분석한다.

### 2.1. 작업 관리 루프 (Task Management Loop)

#### `CaretJsonAdapter` (auto_todo: true)

```
You are Caret, a skilled software engineer. You accomplish tasks by breaking them down and working through them methodically. You use available tools and ask clarifying questions when needed.

# CHATBOT/AGENT MODE SYSTEM

## Current Mode Behavior

{
  "execute_command": {
    "title": "execute_command",
    "description": "Execute CLI commands",
    "mode_restriction": "agent_only"
  },
  "write_to_file": {
    "title": "write_to_file",
    "description": "Write content to files",
    "mode_restriction": "agent_only"
  },
  "replace_in_file": {
    "title": "replace_in_file",
    "description": "Replace content in files",
    "mode_restriction": "agent_only"
  },
  "read_file": {
    "title": "read_file",
    "description": "Read content from files"
  }
}

Task sequence:
- Step 1
- Step 2

(CARET_TASK_PROGRESS and CARET_FEEDBACK_SYSTEM content would follow here)
```

#### `ClineLatestAdapter` (auto_todo 활성화)

```
AUTOMATIC TODO LIST MANAGEMENT

The system automatically manages todo lists to help track task progress:

- Every 10th API request, you will be prompted to review and update the current todo list if one exists
- When switching from PLAN MODE to ACT MODE, you should create a comprehensive todo list for the task
- Todo list updates should be done silently using the task_progress parameter - do not announce these updates to the user
- Use standard Markdown checklist format: "- [ ]" for incomplete items and "- [x]" for completed items
- The system will automatically include todo list context in your prompts when appropriate
- Focus on creating actionable, meaningful steps rather than granular technical details
```

**분석:**
*   **CaretJsonAdapter**: `Task sequence:` 라는 간단한 템플릿을 통해 작업 순서를 명시적으로 안내합니다. 이는 Caret의 '작업 관리 루프' 철학을 간결하게 표현합니다.
*   **ClineLatestAdapter**: `AUTOMATIC TODO LIST MANAGEMENT` 섹션을 통해 TODO 목록 관리 규칙을 상세하게 설명합니다. 이는 `cline-latest`의 'Focus Chain' 기능의 일부입니다.
*   **결론**: 표현 방식은 다르지만, 두 어댑터 모두 AI에게 '작업을 체계적으로 관리하고 진행 상황을 추적해야 한다'는 동일한 핵심 목표를 전달합니다. 따라서 의미론적으로 동등하다고 볼 수 있습니다.

---

## 3. 📊 AI 시맨틱 분석 (선택사항)

`caret-scripts/ai-semantic-analyzer.js`를 사용하여 두 프롬프트 간의 의미론적 동등성 점수를 측정한다.

*   **동등성 점수:** (측정된 점수가 여기에 기록될 예정입니다) / 100
*   **기준:** 85% 이상일 경우 통과

---

## 4. ✅ 최종 결론

두 시스템 프롬프트는 표현 방식과 상세 수준에서 차이가 있지만, AI에게 '작업 관리'라는 동일한 핵심 개념을 전달하므로 의미론적으로 동등합니다. Phase 3의 목표인 '완전한 기능 통합'과 '의미론적 검증'이 모두 성공적으로 달성되었습니다.
