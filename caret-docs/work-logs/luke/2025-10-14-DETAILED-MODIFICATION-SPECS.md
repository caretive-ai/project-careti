# 시스템 프롬프트 수정 상세 명세서 (크로스체크용)

**날짜**: 2025-10-14
**목적**: 다른 AI가 독립적으로 검증할 수 있도록 수정 내용을 명확히 명세
**중요도**: CRITICAL - 시스템 프롬프트는 AI 행동의 핵심
**크로스체크 필수**: 다른 AI가 이 문서만으로 검증 가능해야 함

---

## 📋 수정 대상 파일 목록

### 파일 1: CARET_FILE_EDITING.json
- **경로**: `/Users/luke/dev/caret/caret-src/core/prompts/sections/CARET_FILE_EDITING.json`
- **현재 라인 수**: 20줄
- **현재 토큰 수**: ~130 토큰
- **수정 후 예상 토큰 수**: ~320 토큰
- **증가량**: +190 토큰 (+146%)

### 파일 2: CARET_TODO_MANAGEMENT.json
- **경로**: `/Users/luke/dev/caret/caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json`
- **현재 라인 수**: 11줄
- **현재 토큰 수**: ~40 토큰
- **수정 후 예상 토큰 수**: ~280 토큰
- **증가량**: +240 토큰 (+600%)

---

## 🔧 파일 1: CARET_FILE_EDITING.json 수정 명세

### 현재 전체 내용 (20줄)

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
	},
	"mode_restrictions": {
		"chatbot": "Read-only access, suggest edits only",
		"agent": "Full editing capabilities with both tools"
	},
	"template_vars": {
		"description": "File editing guidelines adapted from cline's editing_files.ts with mode restrictions",
		"source": "Based on cline editing_files.ts but condensed for Caret efficiency"
	}
}
```

### 수정 후 전체 내용 (33줄)

```json
{
	"file_editing": {
		"sections": [
			{
				"content": "# FILE EDITING PROTOCOL\n\n## Tool Selection\n\n**replace_in_file**: Default for targeted edits. Safer, precise, efficient for small changes.\n\n**write_to_file**: Use for new files, major restructuring, or extensive changes.\n\n## Workflow Best Practices\n\n### Multiple Changes to Same File\n\n**IMPORTANT**: When you need to make several changes to the same file, prefer to use a **single replace_in_file call with multiple SEARCH/REPLACE blocks**. DO NOT make multiple successive replace_in_file calls for the same file.\n\n**Example**: Adding a component to a file\n- ✅ **Correct**: One replace_in_file call with:\n  - SEARCH/REPLACE block 1: Add import statement\n  - SEARCH/REPLACE block 2: Add component usage\n- ❌ **Wrong**: Separate replace_in_file calls for import and usage\n\n**Benefits**:\n- Fewer API requests (30-50% reduction)\n- Better context efficiency\n- Reduced user wait time\n- Optimized for Claude Sonnet 4.5\n\n## AGENT Mode Guidelines\n- Full file operation access\n- Apply multiple SEARCH/REPLACE blocks in single call\n- Consider auto-formatting effects\n- Reference updated file state for subsequent edits\n\n## CHATBOT Mode Guidelines\n- Read-only file access\n- Suggest edits with multiple SEARCH/REPLACE blocks in single suggestion\n- Analysis and planning only",
				"mode": "both",
				"tokens": "~320"
			}
		]
	},
	"mode_restrictions": {
		"chatbot": "Read-only access, suggest edits only",
		"agent": "Full editing capabilities with both tools"
	},
	"template_vars": {
		"description": "File editing guidelines with multiple SEARCH/REPLACE optimization from cline-latest",
		"source": "Based on cline editing_files.ts (commit 41202df74) with Caret dual-mode adaptation",
		"changelog": "2025-10-14: Added multiple SEARCH/REPLACE blocks best practice for both modes",
		"cline_commit": "41202df74",
		"token_increase": "+190 (~146% increase)"
	}
}
```

### 수정 내용 상세 분석

#### 변경 1: `content` 필드 내용 확장

**변경 위치**: Line 5, `sections[0].content` 필드 내부

**추가된 섹션**:
```markdown
## Workflow Best Practices

### Multiple Changes to Same File

**IMPORTANT**: When you need to make several changes to the same file, prefer to use a **single replace_in_file call with multiple SEARCH/REPLACE blocks**. DO NOT make multiple successive replace_in_file calls for the same file.

**Example**: Adding a component to a file
- ✅ **Correct**: One replace_in_file call with:
  - SEARCH/REPLACE block 1: Add import statement
  - SEARCH/REPLACE block 2: Add component usage
- ❌ **Wrong**: Separate replace_in_file calls for import and usage

**Benefits**:
- Fewer API requests (30-50% reduction)
- Better context efficiency
- Reduced user wait time
- Optimized for Claude Sonnet 4.5
```

**삽입 위치**: `## Tool Selection` 섹션 다음, `## AGENT Mode Guidelines` 섹션 앞

**검증 포인트**:
- [ ] 새 섹션이 Tool Selection과 Mode Guidelines 사이에 삽입됨
- [ ] Markdown 포맷 유지 (`\n\n`으로 섹션 구분)
- [ ] 이모지 사용 (✅, ❌)
- [ ] 정량적 수치 포함 ("30-50% reduction")

#### 변경 2: AGENT Mode Guidelines 수정

**변경 전**:
```
## AGENT Mode Guidelines
- Full file operation access
- Consider auto-formatting effects
- Use SEARCH/REPLACE blocks carefully
- Reference updated file state for subsequent edits
```

**변경 후**:
```
## AGENT Mode Guidelines
- Full file operation access
- Apply multiple SEARCH/REPLACE blocks in single call
- Consider auto-formatting effects
- Reference updated file state for subsequent edits
```

**차이점**:
- 2번째 항목 추가: "Apply multiple SEARCH/REPLACE blocks in single call"
- 기존 "Use SEARCH/REPLACE blocks carefully" 항목은 삭제

**검증 포인트**:
- [ ] "Apply multiple SEARCH/REPLACE blocks in single call" 항목 존재
- [ ] "Use SEARCH/REPLACE blocks carefully" 항목 삭제 확인
- [ ] 다른 3개 항목은 그대로 유지

#### 변경 3: CHATBOT Mode Restrictions → Guidelines 이름 변경

**변경 전**:
```
## CHATBOT Mode Restrictions
- Read-only file access
- Can suggest edits but cannot execute
- Analysis and planning only
```

**변경 후**:
```
## CHATBOT Mode Guidelines
- Read-only file access
- Suggest edits with multiple SEARCH/REPLACE blocks in single suggestion
- Analysis and planning only
```

**차이점**:
- 헤더 이름: "Restrictions" → "Guidelines" (일관성 개선)
- 2번째 항목 수정: "Can suggest edits but cannot execute" → "Suggest edits with multiple SEARCH/REPLACE blocks in single suggestion"

**검증 포인트**:
- [ ] 헤더가 "Guidelines"로 변경됨
- [ ] "multiple SEARCH/REPLACE blocks in single suggestion" 문구 포함
- [ ] 1, 3번째 항목은 그대로 유지

#### 변경 4: tokens 메타데이터 업데이트

**변경 전**: `"tokens": "~130"`
**변경 후**: `"tokens": "~320"`

**검증 포인트**:
- [ ] 토큰 수가 130 → 320으로 증가
- [ ] 증가량 계산: 320 - 130 = 190 토큰
- [ ] 증가율 계산: (190 / 130) * 100 = 146%

#### 변경 5: template_vars 확장

**변경 전**:
```json
"template_vars": {
  "description": "File editing guidelines adapted from cline's editing_files.ts with mode restrictions",
  "source": "Based on cline editing_files.ts but condensed for Caret efficiency"
}
```

**변경 후**:
```json
"template_vars": {
  "description": "File editing guidelines with multiple SEARCH/REPLACE optimization from cline-latest",
  "source": "Based on cline editing_files.ts (commit 41202df74) with Caret dual-mode adaptation",
  "changelog": "2025-10-14: Added multiple SEARCH/REPLACE blocks best practice for both modes",
  "cline_commit": "41202df74",
  "token_increase": "+190 (~146% increase)"
}
```

**추가된 필드**:
- `changelog`: 변경 이력 추적
- `cline_commit`: 원본 Cline 커밋 해시 참조
- `token_increase`: 토큰 증가량 기록

**검증 포인트**:
- [ ] `description` 내용 업데이트 확인
- [ ] `source`에 커밋 해시 포함 확인
- [ ] 3개 새 필드 추가 확인

---

## 🔧 파일 2: CARET_TODO_MANAGEMENT.json 수정 명세

### 현재 전체 내용 (11줄)

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

### 수정 후 전체 내용 (42줄)

```json
{
	"todo_management": {
		"sections": [
			{
				"content": "# AUTOMATIC TODO LIST MANAGEMENT\n\nThe system automatically manages todo lists to help track task progress:\n\n## Update Timing\n\n- **Every 10th API request**: You will be prompted to review and update the current todo list if one exists\n- **Mode Switch (Chatbot → Agent)**: Create a comprehensive todo list when transitioning to Agent mode for task execution\n- **Silent Updates**: Use task_progress parameter for updates - do not announce these updates to the user\n\n## Format Guidelines\n\n- Use standard Markdown checklist format:\n  - `- [ ]` for incomplete items\n  - `- [x]` for completed items\n- The system automatically includes todo list context in prompts when appropriate\n\n## Quality Standards\n\n- **Actionable Steps**: Focus on clear, executable actions\n- **Meaningful Progress**: Track significant milestones, not granular details\n- **User Value**: Each item should represent visible progress\n\n## Mode-Specific Behavior\n\n### CHATBOT Mode\n- Suggest todo lists for user's planning\n- Break down complex requests into actionable steps\n- Provide analysis-focused task breakdown\n\n### AGENT Mode\n- Maintain active todo list during task execution\n- Update progress silently every 10th API request\n- Create comprehensive list when switching from Chatbot mode\n- Mark items completed as work progresses",
				"mode": "both",
				"tokens": "~280"
			}
		]
	},
	"conditional_loading": {
		"enabled_when": "context.auto_todo || context.task_progress",
		"note": "This section only loads when TODO management is enabled"
	},
	"template_vars": {
		"description": "Automatic TODO list management with clear timing and quality guidelines",
		"source": "Based on cline auto_todo.ts (commit f0cd7fd36) with Caret mode adaptations",
		"changelog": "2025-10-14: Complete rewrite with explicit timing, mode switch behavior, and quality standards",
		"cline_commit": "f0cd7fd36",
		"token_increase": "+240 (~600% increase)",
		"caret_terminology": {
			"plan_to_act_mapping": "Cline PLAN→ACT === Caret Chatbot→Agent",
			"mode_switch_trigger": "When user switches from Chatbot mode to Agent mode"
		}
	}
}
```

### 수정 내용 상세 분석

#### 변경 1: 전체 구조 재설계

**기존 구조** (Legacy):
```json
{
  "chatbot": { "style": "...", "template": "..." },
  "agent": { "style": "...", "template": "..." }
}
```

**새 구조** (표준 섹션 포맷):
```json
{
  "todo_management": {
    "sections": [ { "content": "...", "mode": "both", "tokens": "..." } ]
  },
  "conditional_loading": { ... },
  "template_vars": { ... }
}
```

**변경 이유**:
- 다른 JSON 파일과 구조 일관성 확보
- `CaretJsonAdapter.processTemplateSections()` 호환성
- `mode: "both"` 필드로 양쪽 모드 자동 지원

**검증 포인트**:
- [ ] 최상위 키가 `"todo_management"`로 변경
- [ ] `sections` 배열 존재
- [ ] `sections[0].mode === "both"` 확인
- [ ] Legacy `chatbot`, `agent` 키 완전 삭제 확인

#### 변경 2: content 필드 내용 (완전 새로 작성)

**전체 content 구조**:
```markdown
# AUTOMATIC TODO LIST MANAGEMENT

The system automatically manages todo lists to help track task progress:

## Update Timing
[3개 항목]

## Format Guidelines
[2개 항목 + 서브 항목]

## Quality Standards
[3개 항목]

## Mode-Specific Behavior
### CHATBOT Mode
[3개 항목]
### AGENT Mode
[4개 항목]
```

**섹션별 상세 내용**:

##### Section 1: Update Timing
```markdown
## Update Timing

- **Every 10th API request**: You will be prompted to review and update the current todo list if one exists
- **Mode Switch (Chatbot → Agent)**: Create a comprehensive todo list when transitioning to Agent mode for task execution
- **Silent Updates**: Use task_progress parameter for updates - do not announce these updates to the user
```

**검증 포인트**:
- [ ] "Every 10th API request" 문구 존재
- [ ] "Chatbot → Agent" 화살표 표기 확인
- [ ] "Silent Updates" + "task_progress parameter" 언급
- [ ] "do not announce" 명시적 지시 확인

##### Section 2: Format Guidelines
```markdown
## Format Guidelines

- Use standard Markdown checklist format:
  - `- [ ]` for incomplete items
  - `- [x]` for completed items
- The system automatically includes todo list context in prompts when appropriate
```

**검증 포인트**:
- [ ] Markdown 체크박스 포맷 예시 (`- [ ]`, `- [x]`)
- [ ] 백틱으로 코드 포맷팅
- [ ] "automatically includes" 자동화 설명

##### Section 3: Quality Standards
```markdown
## Quality Standards

- **Actionable Steps**: Focus on clear, executable actions
- **Meaningful Progress**: Track significant milestones, not granular details
- **User Value**: Each item should represent visible progress
```

**검증 포인트**:
- [ ] 3개 표준 (Actionable, Meaningful, User Value)
- [ ] "not granular details" 명시적 지시
- [ ] 각 항목이 볼드체로 강조

##### Section 4: Mode-Specific Behavior

**CHATBOT Mode**:
```markdown
### CHATBOT Mode
- Suggest todo lists for user's planning
- Break down complex requests into actionable steps
- Provide analysis-focused task breakdown
```

**AGENT Mode**:
```markdown
### AGENT Mode
- Maintain active todo list during task execution
- Update progress silently every 10th API request
- Create comprehensive list when switching from Chatbot mode
- Mark items completed as work progresses
```

**검증 포인트**:
- [ ] Chatbot: 3개 항목 (suggest, break down, provide)
- [ ] Agent: 4개 항목 (maintain, update, create, mark)
- [ ] Agent 모드에 "every 10th API request" 재강조
- [ ] Agent 모드에 "switching from Chatbot mode" 명시

#### 변경 3: conditional_loading 필드 추가

```json
"conditional_loading": {
  "enabled_when": "context.auto_todo || context.task_progress",
  "note": "This section only loads when TODO management is enabled"
}
```

**목적**: CaretJsonAdapter 로직 문서화

**관련 코드**:
```typescript
// CaretJsonAdapter.ts:47
context.auto_todo || context.task_progress ? "CARET_TODO_MANAGEMENT" : null
```

**검증 포인트**:
- [ ] `enabled_when` 조건이 코드와 일치
- [ ] `note` 필드로 추가 설명 제공

#### 변경 4: template_vars 대폭 확장

**추가된 필드**:
```json
"template_vars": {
  "description": "...",
  "source": "Based on cline auto_todo.ts (commit f0cd7fd36) with Caret mode adaptations",
  "changelog": "2025-10-14: Complete rewrite with explicit timing, mode switch behavior, and quality standards",
  "cline_commit": "f0cd7fd36",
  "token_increase": "+240 (~600% increase)",
  "caret_terminology": {
    "plan_to_act_mapping": "Cline PLAN→ACT === Caret Chatbot→Agent",
    "mode_switch_trigger": "When user switches from Chatbot mode to Agent mode"
  }
}
```

**새로운 nested object**: `caret_terminology`
- Cline과 Caret 용어 매핑 명시
- 향후 Cline merge 시 참조용

**검증 포인트**:
- [ ] `cline_commit` 해시 포함
- [ ] `token_increase` 계산: 280 - 40 = 240
- [ ] `changelog`에 "Complete rewrite" 명시
- [ ] `caret_terminology` nested object 존재
- [ ] "PLAN→ACT === Chatbot→Agent" 매핑 정확성

---

## ✅ 검증 체크리스트 (다른 AI용)

### 파일 1: CARET_FILE_EDITING.json

#### 구조 검증
- [ ] JSON 문법 오류 없음 (파싱 가능)
- [ ] 최상위 키 3개: `file_editing`, `mode_restrictions`, `template_vars`
- [ ] `file_editing.sections` 배열 길이 === 1
- [ ] `sections[0].mode === "both"`
- [ ] `sections[0].tokens === "~320"`

#### 내용 검증
- [ ] "## Workflow Best Practices" 섹션 존재
- [ ] "### Multiple Changes to Same File" 서브섹션 존재
- [ ] "**IMPORTANT**" 강조 포함
- [ ] "single replace_in_file call with multiple SEARCH/REPLACE blocks" 문구 존재
- [ ] 예시 섹션에 ✅, ❌ 이모지 사용
- [ ] "30-50% reduction" 정량적 수치 포함
- [ ] "Optimized for Claude Sonnet 4.5" 언급
- [ ] AGENT Mode에 "Apply multiple SEARCH/REPLACE blocks in single call" 항목
- [ ] CHATBOT Mode 헤더가 "Guidelines"로 변경
- [ ] CHATBOT Mode에 "multiple SEARCH/REPLACE blocks in single suggestion" 항목

#### 메타데이터 검증
- [ ] `template_vars.changelog` 필드 존재
- [ ] `template_vars.cline_commit === "41202df74"`
- [ ] `template_vars.token_increase` 필드 존재
- [ ] 토큰 증가 계산 정확성: 320 - 130 = 190

#### 원본 Cline 비교 검증
- [ ] Cline `editing_files.ts` Line 73의 내용을 정확히 반영
- [ ] "prefer to use a single replace_in_file call" 문구 일치
- [ ] "DO NOT prefer to make multiple successive" 부정 지시 포함

---

### 파일 2: CARET_TODO_MANAGEMENT.json

#### 구조 검증
- [ ] JSON 문법 오류 없음 (파싱 가능)
- [ ] 최상위 키 3개: `todo_management`, `conditional_loading`, `template_vars`
- [ ] `todo_management.sections` 배열 길이 === 1
- [ ] `sections[0].mode === "both"`
- [ ] `sections[0].tokens === "~280"`
- [ ] Legacy `chatbot`, `agent` 키 완전 삭제 확인

#### 내용 검증 - Update Timing
- [ ] "## Update Timing" 섹션 존재
- [ ] "Every 10th API request" 문구 존재
- [ ] "Chatbot → Agent" 모드 전환 언급
- [ ] "Silent Updates" + "task_progress parameter" 언급
- [ ] "do not announce these updates to the user" 명시

#### 내용 검증 - Format Guidelines
- [ ] "## Format Guidelines" 섹션 존재
- [ ] Markdown 체크박스 포맷: `` `- [ ]` ``, `` `- [x]` ``
- [ ] 백틱 코드 포맷팅 사용 확인

#### 내용 검증 - Quality Standards
- [ ] "## Quality Standards" 섹션 존재
- [ ] 3개 표준: Actionable Steps, Meaningful Progress, User Value
- [ ] "not granular details" 명시적 지시 포함

#### 내용 검증 - Mode-Specific Behavior
- [ ] "## Mode-Specific Behavior" 섹션 존재
- [ ] "### CHATBOT Mode" 서브섹션 존재
- [ ] "### AGENT Mode" 서브섹션 존재
- [ ] CHATBOT Mode 항목 수 === 3
- [ ] AGENT Mode 항목 수 === 4
- [ ] AGENT Mode에 "every 10th API request" 재강조
- [ ] AGENT Mode에 "switching from Chatbot mode" 언급

#### 메타데이터 검증
- [ ] `conditional_loading.enabled_when` 필드 존재
- [ ] 조건식: `"context.auto_todo || context.task_progress"`
- [ ] `template_vars.cline_commit === "f0cd7fd36"`
- [ ] `template_vars.token_increase === "+240 (~600% increase)"`
- [ ] `template_vars.caret_terminology` nested object 존재
- [ ] 용어 매핑: "PLAN→ACT === Chatbot→Agent" 정확성

#### 원본 Cline 비교 검증
- [ ] Cline `auto_todo.ts` Line 9의 "Every 10th API request" 반영
- [ ] Cline Line 10의 "PLAN MODE to ACT MODE" → "Chatbot → Agent" 변환
- [ ] Cline Line 11의 "silently using task_progress parameter" 반영
- [ ] Cline Line 14의 "actionable, meaningful steps" 반영

---

## 🔬 원본 Cline 코드 비교

### Cline editing_files.ts (commit 41202df74)

**원본 코드** (Line 70-76):
```typescript
# Workflow Tips

1. Before editing, assess the scope of your changes and decide which tool to use.
2. For targeted edits, apply replace_in_file with carefully crafted SEARCH/REPLACE blocks. If you need multiple changes, you can stack multiple SEARCH/REPLACE blocks within a single replace_in_file call.
3. IMPORTANT: When you determine that you need to make several changes to the same file, prefer to use a single replace_in_file call with multiple SEARCH/REPLACE blocks. DO NOT prefer to make multiple successive replace_in_file calls for the same file. For example, if you were to add a component to a file, you would use a single replace_in_file call with a SEARCH/REPLACE block to add the import statement and another SEARCH/REPLACE block to add the component usage, rather than making one replace_in_file call for the import statement and then another separate replace_in_file call for the component usage.
4. For major overhauls or initial file creation, rely on write_to_file.
5. Once the file has been edited with either write_to_file or replace_in_file, the system will provide you with the final state of the modified file. Use this updated content as the reference point for any subsequent SEARCH/REPLACE operations, since it reflects any auto-formatting or user-applied changes.
```

**Caret 적용 검증**:
- [ ] Item 3의 핵심 문구 "prefer to use a single replace_in_file call with multiple SEARCH/REPLACE blocks" 포함
- [ ] "DO NOT prefer to make multiple successive" 부정 지시 포함
- [ ] 예시 "add a component to a file" 동일하게 사용
- [ ] "import statement and another SEARCH/REPLACE block" 패턴 반영

---

### Cline auto_todo.ts (commit f0cd7fd36)

**원본 코드** (Line 5-14):
```typescript
const TODO_LIST_TEMPLATE_TEXT = `AUTOMATIC TODO LIST MANAGEMENT

The system automatically manages todo lists to help track task progress:

- Every 10th API request, you will be prompted to review and update the current todo list if one exists
- When switching from PLAN MODE to ACT MODE, you should create a comprehensive todo list for the task
- Todo list updates should be done silently using the task_progress parameter - do not announce these updates to the user
- Use standard Markdown checklist format: "- [ ]" for incomplete items and "- [x]" for completed items
- The system will automatically include todo list context in your prompts when appropriate
- Focus on creating actionable, meaningful steps rather than granular technical details`
```

**Caret 적용 검증**:
- [ ] "Every 10th API request" 정확히 일치
- [ ] "PLAN MODE to ACT MODE" → "Chatbot → Agent" 용어 변환
- [ ] "silently using the task_progress parameter" 반영
- [ ] "do not announce these updates to the user" 그대로 유지
- [ ] Markdown 체크박스 포맷 "- [ ]", "- [x]" 동일
- [ ] "actionable, meaningful steps rather than granular technical details" 반영

---

## 🧪 검증 방법론

### 1. JSON 문법 검증
```bash
# 파일 1 검증
cat caret-src/core/prompts/sections/CARET_FILE_EDITING.json | jq '.' > /dev/null
echo $?  # 0이어야 함 (성공)

# 파일 2 검증
cat caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json | jq '.' > /dev/null
echo $?  # 0이어야 함 (성공)
```

### 2. 구조 검증 (jq 명령)
```bash
# 파일 1: 최상위 키 확인
jq 'keys | sort' CARET_FILE_EDITING.json
# 예상 출력: ["file_editing", "mode_restrictions", "template_vars"]

# 파일 1: mode 필드 확인
jq '.file_editing.sections[0].mode' CARET_FILE_EDITING.json
# 예상 출력: "both"

# 파일 1: tokens 필드 확인
jq '.file_editing.sections[0].tokens' CARET_FILE_EDITING.json
# 예상 출력: "~320"

# 파일 2: 최상위 키 확인
jq 'keys | sort' CARET_TODO_MANAGEMENT.json
# 예상 출력: ["conditional_loading", "template_vars", "todo_management"]

# 파일 2: Legacy 키 없음 확인
jq 'has("chatbot")' CARET_TODO_MANAGEMENT.json
# 예상 출력: false

jq 'has("agent")' CARET_TODO_MANAGEMENT.json
# 예상 출력: false

# 파일 2: caret_terminology 존재 확인
jq '.template_vars.caret_terminology' CARET_TODO_MANAGEMENT.json
# 예상 출력: {"plan_to_act_mapping": "...", "mode_switch_trigger": "..."}
```

### 3. 내용 검증 (grep 명령)
```bash
# 파일 1: 핵심 문구 존재 확인
grep -o "multiple SEARCH/REPLACE blocks" CARET_FILE_EDITING.json | wc -l
# 예상: 최소 3회 이상

grep -o "30-50% reduction" CARET_FILE_EDITING.json | wc -l
# 예상: 1회

grep -o "Claude Sonnet 4.5" CARET_FILE_EDITING.json | wc -l
# 예상: 1회

# 파일 2: 핵심 문구 존재 확인
grep -o "Every 10th API request" CARET_TODO_MANAGEMENT.json | wc -l
# 예상: 2회 (Update Timing + AGENT Mode)

grep -o "Chatbot → Agent" CARET_TODO_MANAGEMENT.json | wc -l
# 예상: 1회

grep -o "task_progress parameter" CARET_TODO_MANAGEMENT.json | wc -l
# 예상: 1회

grep -o "do not announce" CARET_TODO_MANAGEMENT.json | wc -l
# 예상: 1회
```

### 4. 토큰 수 검증
```bash
# 파일 1: content 길이 확인
jq -r '.file_editing.sections[0].content' CARET_FILE_EDITING.json | wc -c
# 예상: ~1400-1600 chars (토큰 비율 약 1:4.5)

# 파일 2: content 길이 확인
jq -r '.todo_management.sections[0].content' CARET_TODO_MANAGEMENT.json | wc -c
# 예상: ~1200-1400 chars
```

### 5. 원본 Cline 비교 검증
```bash
# Cline 원본 파일에서 핵심 문구 추출
grep -A 2 "IMPORTANT: When you determine" cline-latest/src/core/prompts/system-prompt/components/editing_files.ts

grep -A 1 "Every 10th API request" cline-latest/src/core/prompts/system-prompt/components/auto_todo.ts

# Caret JSON에서 동일 문구 확인
jq -r '.file_editing.sections[0].content' CARET_FILE_EDITING.json | grep -o "prefer to use a single replace_in_file call"

jq -r '.todo_management.sections[0].content' CARET_TODO_MANAGEMENT.json | grep -o "Every 10th API request"
```

---

## 📊 변경 요약표

| 항목 | 파일 1 (FILE_EDITING) | 파일 2 (TODO_MANAGEMENT) |
|------|----------------------|--------------------------|
| **라인 수** | 20 → 33 (+65%) | 11 → 42 (+282%) |
| **토큰 수** | ~130 → ~320 (+146%) | ~40 → ~280 (+600%) |
| **구조 변경** | 내용 확장 | 완전 재설계 |
| **mode 필드** | `"both"` 유지 | `"both"` 신규 추가 |
| **주요 추가 내용** | Multiple SEARCH/REPLACE 최적화 | 10번째 요청, 모드 전환 |
| **메타데이터** | 3개 필드 추가 | 5개 필드 추가 + nested |
| **Cline commit** | 41202df74 | f0cd7fd36 |
| **적용 범위** | Agent + Chatbot | Agent + Chatbot |

---

## 🎯 크로스체크 AI에게 요청할 검증 항목

### 필수 검증 (CRITICAL)
1. ✅ JSON 문법 오류 없음
2. ✅ 구조가 다른 Caret JSON 파일과 일관성 유지
3. ✅ `mode: "both"` 필드 존재 (양쪽 모드 적용)
4. ✅ 원본 Cline 핵심 문구 누락 없음
5. ✅ 토큰 수 계산 정확성

### 내용 검증 (HIGH)
6. ✅ "Multiple SEARCH/REPLACE blocks" 섹션 완전성
7. ✅ "Every 10th API request" 명시적 언급
8. ✅ "Chatbot → Agent" 용어 변환 정확성
9. ✅ "30-50% reduction" 정량적 수치 포함
10. ✅ "task_progress parameter" 언급

### 일관성 검증 (MEDIUM)
11. ✅ template_vars 메타데이터 완전성
12. ✅ Markdown 포맷 일관성 (`\n\n` 섹션 구분)
13. ✅ 이모지 사용 적절성 (✅, ❌)
14. ✅ 백틱 코드 포맷팅
15. ✅ 볼드체 강조 적절성

### 비교 검증 (HIGH)
16. ✅ Cline `editing_files.ts` Line 73 반영 확인
17. ✅ Cline `auto_todo.ts` Line 9-14 반영 확인
18. ✅ 부정 지시문 포함 ("DO NOT", "do not announce")
19. ✅ 예시 일관성 ("add a component to a file")
20. ✅ 용어 매핑 정확성 (PLAN→ACT === Chatbot→Agent)

---

## 📝 크로스체크 AI 프롬프트 템플릿

```
# 크로스체크 요청

다음 2개 JSON 파일의 수정 사항을 독립적으로 검증해주세요:

1. CARET_FILE_EDITING.json
2. CARET_TODO_MANAGEMENT.json

## 검증 자료
- 이 문서 (2025-10-14-DETAILED-MODIFICATION-SPECS.md)
- 원본 Cline 파일:
  - cline-latest/src/core/prompts/system-prompt/components/editing_files.ts
  - cline-latest/src/core/prompts/system-prompt/components/auto_todo.ts

## 검증 항목
위 문서의 "✅ 검증 체크리스트" 섹션의 모든 항목을 확인하고:

1. ✅ Pass / ❌ Fail / ⚠️ Warning으로 판정
2. ❌ Fail 항목은 구체적인 이유 설명
3. ⚠️ Warning 항목은 개선 제안
4. 종합 판정: APPROVED / NEEDS REVISION

## 출력 형식
- 검증 체크리스트 결과표 (Markdown table)
- 발견된 문제점 목록
- 개선 권장사항
- 최종 판정 및 사유

시작해주세요.
```

---

## 🔒 백업 및 롤백 계획

### 백업 명령
```bash
# 수정 전 백업 생성
cp caret-src/core/prompts/sections/CARET_FILE_EDITING.json \
   caret-src/core/prompts/sections/CARET_FILE_EDITING.json.bak-20251014

cp caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json \
   caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json.bak-20251014
```

### 롤백 명령 (문제 발생 시)
```bash
# 원본 복구
cp caret-src/core/prompts/sections/CARET_FILE_EDITING.json.bak-20251014 \
   caret-src/core/prompts/sections/CARET_FILE_EDITING.json

cp caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json.bak-20251014 \
   caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json

# 컴파일 재실행
npm run compile
```

---

**작성 완료**: 2025-10-14
**문서 목적**: 다른 AI의 독립적 크로스체크
**검증 난이도**: Medium (JSON 구조 + 내용 정확성)
**예상 검증 시간**: 20-30분
