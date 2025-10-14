# 크로스체크 검증 가이드 (다른 AI용)

**날짜**: 2025-10-14
**대상 AI**: Claude, GPT-4, Gemini 등 (독립 검증용)
**목적**: 시스템 프롬프트 수정의 정확성과 안전성을 독립적으로 검증
**난이도**: Medium
**예상 소요 시간**: 20-30분

---

## 🎯 검증 미션

Caret 프로젝트의 시스템 프롬프트 2개 파일을 수정하려고 합니다.
수정 내용이 정확하고 안전한지 **독립적으로 검증**해주세요.

---

## 📂 검증 대상 파일

### 파일 1: CARET_FILE_EDITING.json
- **경로**: `caret-src/core/prompts/sections/CARET_FILE_EDITING.json`
- **목적**: 파일 편집 가이드라인
- **수정 내용**: Multiple SEARCH/REPLACE blocks 최적화 추가
- **원본 참조**: `cline-latest/src/core/prompts/system-prompt/components/editing_files.ts` (commit 41202df74)

### 파일 2: CARET_TODO_MANAGEMENT.json
- **경로**: `caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json`
- **목적**: TODO 리스트 관리 가이드라인
- **수정 내용**: 업데이트 타이밍 명확화 및 전체 재설계
- **원본 참조**: `cline-latest/src/core/prompts/system-prompt/components/auto_todo.ts` (commit f0cd7fd36)

---

## 📖 필수 읽기 자료

1. **상세 수정 명세서**: `2025-10-14-DETAILED-MODIFICATION-SPECS.md`
   - 수정 전후 전체 내용
   - 변경 사항 상세 분석
   - 검증 체크리스트

2. **원본 Cline 파일** (비교 대조용):
   - `cline-latest/src/core/prompts/system-prompt/components/editing_files.ts`
   - `cline-latest/src/core/prompts/system-prompt/components/auto_todo.ts`

3. **Caret 아키텍처 이해** (선택):
   - `CLAUDE.md` (프로젝트 개요)
   - `caret-docs/work-logs/luke/2025-10-14-cline-prompt-improvements-caret-application-plan.md`

---

## ✅ 검증 체크리스트

### Level 1: 기본 검증 (CRITICAL)

#### 파일 1: CARET_FILE_EDITING.json

**구조 검증**
- [ ] JSON 문법 오류 없음 (jq 파싱 성공)
- [ ] 최상위 키 3개: `file_editing`, `mode_restrictions`, `template_vars`
- [ ] `file_editing.sections` 배열 존재
- [ ] `sections[0].mode === "both"`
- [ ] `sections[0].tokens === "~320"`

**핵심 내용 검증**
- [ ] "## Workflow Best Practices" 섹션 존재
- [ ] "### Multiple Changes to Same File" 서브섹션 존재
- [ ] "**IMPORTANT**" 강조 문구 포함
- [ ] "single replace_in_file call with multiple SEARCH/REPLACE blocks" 문구 정확
- [ ] "DO NOT make multiple successive replace_in_file calls" 부정 지시 포함
- [ ] 예시에 ✅, ❌ 이모지 사용
- [ ] "30-50% reduction" 정량적 수치 포함
- [ ] "Optimized for Claude Sonnet 4.5" 언급

**Mode-Specific 검증**
- [ ] AGENT Mode에 "Apply multiple SEARCH/REPLACE blocks in single call" 항목 추가
- [ ] CHATBOT Mode 헤더가 "Restrictions" → "Guidelines"로 변경
- [ ] CHATBOT Mode에 "multiple SEARCH/REPLACE blocks in single suggestion" 항목 추가

**메타데이터 검증**
- [ ] `template_vars.changelog` 필드 존재
- [ ] `template_vars.cline_commit === "41202df74"`
- [ ] `template_vars.token_increase` 필드 존재
- [ ] 토큰 증가 계산: 320 - 130 = 190 (정확)

---

#### 파일 2: CARET_TODO_MANAGEMENT.json

**구조 검증**
- [ ] JSON 문법 오류 없음 (jq 파싱 성공)
- [ ] 최상위 키 3개: `todo_management`, `conditional_loading`, `template_vars`
- [ ] `todo_management.sections` 배열 존재
- [ ] `sections[0].mode === "both"`
- [ ] `sections[0].tokens === "~280"`
- [ ] Legacy `chatbot`, `agent` 키 완전 삭제 (중요!)

**핵심 내용 검증 - Update Timing**
- [ ] "## Update Timing" 섹션 존재
- [ ] "Every 10th API request" 문구 정확
- [ ] "Mode Switch (Chatbot → Agent)" 화살표 표기 정확
- [ ] "Silent Updates" + "task_progress parameter" 언급
- [ ] "do not announce these updates to the user" 명시

**핵심 내용 검증 - Format Guidelines**
- [ ] "## Format Guidelines" 섹션 존재
- [ ] Markdown 체크박스: `` `- [ ]` `` 및 `` `- [x]` `` (백틱 포함)
- [ ] 백틱 코드 포맷팅 사용 확인

**핵심 내용 검증 - Quality Standards**
- [ ] "## Quality Standards" 섹션 존재
- [ ] 3개 표준 존재: Actionable Steps, Meaningful Progress, User Value
- [ ] "not granular details" 명시적 지시 포함

**핵심 내용 검증 - Mode-Specific Behavior**
- [ ] "## Mode-Specific Behavior" 섹션 존재
- [ ] "### CHATBOT Mode" 서브섹션 (3개 항목)
- [ ] "### AGENT Mode" 서브섹션 (4개 항목)
- [ ] AGENT Mode에 "every 10th API request" 재강조
- [ ] AGENT Mode에 "switching from Chatbot mode" 명시

**메타데이터 검증**
- [ ] `conditional_loading.enabled_when` 정확: `"context.auto_todo || context.task_progress"`
- [ ] `template_vars.cline_commit === "f0cd7fd36"`
- [ ] `template_vars.token_increase === "+240 (~600% increase)"`
- [ ] `template_vars.caret_terminology` nested object 존재
- [ ] 용어 매핑 정확: "PLAN→ACT === Chatbot→Agent"

---

### Level 2: 원본 비교 검증 (HIGH)

#### Cline editing_files.ts 비교

**검증 방법**:
1. `cline-latest/src/core/prompts/system-prompt/components/editing_files.ts` 파일 열기
2. Line 73 근처 찾기: "IMPORTANT: When you determine"
3. Caret JSON의 "Multiple Changes to Same File" 섹션과 비교

**확인 사항**:
- [ ] "prefer to use a single replace_in_file call" 문구 일치
- [ ] "DO NOT prefer to make multiple successive" 부정 표현 일치
- [ ] 예시 동일: "add a component to a file" + "import statement" + "component usage"
- [ ] 핵심 개념 누락 없음: single call, multiple blocks, stacking

**원본 코드 발췌** (참고용):
```
3. IMPORTANT: When you determine that you need to make several changes to the same file,
prefer to use a single replace_in_file call with multiple SEARCH/REPLACE blocks.
DO NOT prefer to make multiple successive replace_in_file calls for the same file.
For example, if you were to add a component to a file, you would use a single
replace_in_file call with a SEARCH/REPLACE block to add the import statement and
another SEARCH/REPLACE block to add the component usage, rather than making one
replace_in_file call for the import statement and then another separate
replace_in_file call for the component usage.
```

---

#### Cline auto_todo.ts 비교

**검증 방법**:
1. `cline-latest/src/core/prompts/system-prompt/components/auto_todo.ts` 파일 열기
2. Line 5-14 확인: `TODO_LIST_TEMPLATE_TEXT` 상수
3. Caret JSON의 각 섹션과 1:1 대조

**확인 사항**:
- [ ] "Every 10th API request" 정확히 일치
- [ ] "PLAN MODE to ACT MODE" → "Chatbot → Agent" 변환 정확
- [ ] "silently using the task_progress parameter" 반영
- [ ] "do not announce these updates to the user" 그대로 유지
- [ ] Markdown 포맷 `"- [ ]"`, `"- [x]"` 동일 (따옴표 포함)
- [ ] "actionable, meaningful steps rather than granular technical details" 반영

**원본 코드 발췌** (참고용):
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

---

### Level 3: 일관성 검증 (MEDIUM)

#### JSON 구조 일관성
- [ ] 두 파일 모두 표준 Caret 섹션 포맷 사용:
  ```json
  {
    "section_name": {
      "sections": [
        { "content": "...", "mode": "both", "tokens": "..." }
      ]
    },
    "template_vars": { ... }
  }
  ```
- [ ] `mode: "both"` 필드로 양쪽 모드 동시 지원
- [ ] `tokens` 필드에 토큰 수 추정치 포함

#### Markdown 포맷 일관성
- [ ] 섹션 구분: `\n\n` (이중 개행)
- [ ] 헤더 레벨: `#` (최상위), `##` (주요 섹션), `###` (서브섹션)
- [ ] 리스트 포맷: `- ` (unordered), `  - ` (nested)
- [ ] 강조: `**텍스트**` (볼드), `` `코드` `` (인라인 코드)

#### 용어 일관성
- [ ] "CHATBOT Mode" vs "AGENT Mode" (대문자, 단수형)
- [ ] "replace_in_file" (언더스코어, 소문자)
- [ ] "SEARCH/REPLACE blocks" (대문자, 슬래시)
- [ ] "task_progress parameter" (언더스코어, 소문자)

---

### Level 4: 의미 검증 (HIGH)

#### 논리적 일관성
- [ ] Multiple SEARCH/REPLACE 최적화가 실제로 효율적인가?
  - ✅ Yes: 하나의 API 요청으로 여러 변경 처리
  - ❌ No: 오류 시 전체 롤백 필요 (trade-off 있음)

- [ ] "10번째 API 요청마다" 업데이트가 합리적인가?
  - ✅ Yes: 너무 자주(매번) 또는 너무 드물게(50번) 하지 않는 균형

- [ ] Chatbot → Agent 전환 시 TODO 생성이 필요한가?
  - ✅ Yes: 계획(Chatbot) → 실행(Agent) 단계에서 작업 목록 필요

#### 사용자 경험 검증
- [ ] "do not announce" 지시가 사용자 경험을 개선하는가?
  - ✅ Yes: 불필요한 "TODO 업데이트했습니다" 메시지 방지

- [ ] "30-50% reduction" 수치가 과장되지 않았는가?
  - 검증 필요: 5번의 별도 호출 → 1번으로 = 80% 감소
  - ⚠️ Warning: 실제로는 경우에 따라 다름 (평균 30-50%는 보수적)

#### 안전성 검증
- [ ] 부정 지시문이 명확한가?
  - ✅ "DO NOT make multiple successive calls" - 명확
  - ✅ "do not announce these updates" - 명확

- [ ] 예외 상황 처리가 언급되었는가?
  - ⚠️ Warning: 오류 처리 가이드라인 없음 (기존 Cline도 마찬가지)

---

## 🔬 검증 방법 (실전)

### 1. JSON 문법 검증

```bash
# 터미널에서 실행
cd /Users/luke/dev/caret

# 파일 1 검증
jq '.' caret-src/core/prompts/sections/CARET_FILE_EDITING.json > /dev/null 2>&1
if [ $? -eq 0 ]; then echo "✅ FILE_EDITING.json 문법 OK"; else echo "❌ 문법 오류"; fi

# 파일 2 검증
jq '.' caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json > /dev/null 2>&1
if [ $? -eq 0 ]; then echo "✅ TODO_MANAGEMENT.json 문법 OK"; else echo "❌ 문법 오류"; fi
```

### 2. 구조 검증 (jq 쿼리)

```bash
# 파일 1: 최상위 키 확인
jq 'keys | sort' caret-src/core/prompts/sections/CARET_FILE_EDITING.json
# 예상: ["file_editing", "mode_restrictions", "template_vars"]

# 파일 1: mode 필드 확인
jq '.file_editing.sections[0].mode' caret-src/core/prompts/sections/CARET_FILE_EDITING.json
# 예상: "both"

# 파일 2: Legacy 키 제거 확인
jq 'has("chatbot") or has("agent")' caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json
# 예상: false (Legacy 키 없어야 함)

# 파일 2: caret_terminology 존재 확인
jq '.template_vars | has("caret_terminology")' caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json
# 예상: true
```

### 3. 내용 검증 (grep)

```bash
# 파일 1: 핵심 문구 개수 확인
grep -o "multiple SEARCH/REPLACE blocks" caret-src/core/prompts/sections/CARET_FILE_EDITING.json | wc -l
# 예상: 3회 이상

grep -o "30-50% reduction" caret-src/core/prompts/sections/CARET_FILE_EDITING.json | wc -l
# 예상: 1회

# 파일 2: 핵심 문구 확인
grep -o "Every 10th API request" caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json | wc -l
# 예상: 2회

grep -o "Chatbot → Agent" caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json | wc -l
# 예상: 1회 이상
```

### 4. 원본 비교 (diff-like)

```bash
# Cline 원본에서 핵심 문구 추출
grep -A 3 "IMPORTANT: When you determine" cline-latest/src/core/prompts/system-prompt/components/editing_files.ts

# Caret JSON에서 동일 문구 확인
jq -r '.file_editing.sections[0].content' caret-src/core/prompts/sections/CARET_FILE_EDITING.json | grep "prefer to use a single replace_in_file call"

# 결과 비교: 핵심 문구가 포함되어 있는지 확인
```

---

## 📊 검증 결과 보고 양식

### 검증 결과표

| 검증 항목 | 파일 1 | 파일 2 | 판정 | 비고 |
|----------|--------|--------|------|------|
| JSON 문법 | ✅/❌ | ✅/❌ | | |
| 구조 일관성 | ✅/❌ | ✅/❌ | | |
| mode: "both" | ✅/❌ | ✅/❌ | | |
| 토큰 수 계산 | ✅/❌ | ✅/❌ | | |
| 핵심 문구 포함 | ✅/❌ | ✅/❌ | | |
| 원본 Cline 반영 | ✅/❌ | ✅/❌ | | |
| 부정 지시문 | ✅/❌ | ✅/❌ | | |
| Markdown 포맷 | ✅/❌ | ✅/❌ | | |
| 용어 일관성 | ✅/❌ | ✅/❌ | | |
| 논리적 타당성 | ✅/❌ | ✅/❌ | | |

### 발견된 문제점

#### Critical Issues (❌ Fail)
1. [문제 설명]
2. [수정 방안]

#### Warnings (⚠️)
1. [개선 권장사항]
2. [잠재적 위험]

#### Minor Issues (ℹ️)
1. [사소한 개선점]

### 종합 판정

- [ ] **APPROVED**: 모든 검증 통과, 수정 진행 가능
- [ ] **APPROVED WITH WARNINGS**: 대부분 통과, 경미한 개선 권장
- [ ] **NEEDS REVISION**: 중요한 문제 발견, 수정 필요
- [ ] **REJECTED**: 심각한 오류, 전면 재검토 필요

**판정 사유**:
```
[검증자의 종합 의견 작성]
```

---

## 🎯 중점 검증 항목 (우선순위)

### Priority 1 (반드시 확인)
1. ✅ JSON 문법 오류 없음
2. ✅ 원본 Cline 핵심 문구 누락 없음
3. ✅ `mode: "both"` 필드 존재 (양쪽 모드 적용)
4. ✅ Legacy 구조 완전 제거 (파일 2)
5. ✅ 부정 지시문 정확성

### Priority 2 (강력 권장)
6. ✅ 토큰 수 계산 정확성
7. ✅ 용어 일관성 (Chatbot/Agent, SEARCH/REPLACE)
8. ✅ Markdown 포맷 일관성
9. ✅ 메타데이터 완전성
10. ✅ 예시의 명확성

### Priority 3 (선택적)
11. ⚠️ 논리적 타당성 검토
12. ⚠️ 사용자 경험 개선 효과
13. ⚠️ 잠재적 부작용 분석

---

## 📝 검증자를 위한 팁

### 효율적인 검증 순서
1. **빠른 스캔** (5분): JSON 문법 + 구조 확인
2. **상세 읽기** (10분): 내용 정확성 + 원본 비교
3. **논리 검증** (5분): 의미 일관성 + 사용자 경험
4. **보고서 작성** (5-10분): 결과표 + 종합 판정

### 일반적인 함정 (피해야 할 것)
- ❌ JSON 문법만 확인하고 내용은 대충 보기
- ❌ 원본 Cline 코드와 비교하지 않기
- ❌ `mode: "both"` 필드 누락 간과
- ❌ 토큰 수 계산 실수 (특히 파일 2: 600% 증가)
- ❌ Legacy `chatbot`, `agent` 키 잔존 확인 안 함

### 확신이 없을 때
- ⚠️ "APPROVED WITH WARNINGS"로 표시하고 이유 설명
- ⚠️ 특정 항목에 대한 추가 검토 요청
- ⚠️ 대안 제시 (더 나은 표현, 구조 등)

---

## 🚨 Critical Failure 기준

다음 중 하나라도 발견되면 **REJECTED** 판정:

1. JSON 문법 오류 (파싱 실패)
2. `mode: "both"` 필드 누락 (양쪽 모드에 적용 안 됨)
3. 원본 Cline 핵심 개념 누락 ("single call", "multiple blocks")
4. 부정 지시문 왜곡 ("DO NOT" → "CAN" 등)
5. 파일 2에 Legacy `chatbot`, `agent` 키 잔존

---

## 📞 검증 후 액션

### APPROVED 시
1. ✅ 이 검증 결과를 Luke에게 보고
2. ✅ 수정 진행 승인
3. ✅ `npm run compile` 후 테스트 진행

### NEEDS REVISION 시
1. ⚠️ 발견된 문제점 상세 리스트 제공
2. ⚠️ 수정 방안 제시
3. ⚠️ 재검증 일정 협의

### REJECTED 시
1. ❌ Critical 이슈 목록 제공
2. ❌ 전면 재설계 권장
3. ❌ 대안 접근법 제시

---

## 📚 참고 자료

### 필수 문서
- `2025-10-14-DETAILED-MODIFICATION-SPECS.md` (이 디렉토리)
- `cline-latest/src/core/prompts/system-prompt/components/editing_files.ts`
- `cline-latest/src/core/prompts/system-prompt/components/auto_todo.ts`

### 선택 문서 (맥락 이해용)
- `CLAUDE.md` (Caret 프로젝트 개요)
- `caret-docs/work-logs/luke/2025-10-14-cline-prompt-improvements-caret-application-plan.md`
- `caret-docs/development/caret-architecture-and-implementation-guide.mdx`

### 유용한 명령어
```bash
# 프로젝트 루트로 이동
cd /Users/luke/dev/caret

# JSON 파일 예쁘게 출력
jq '.' caret-src/core/prompts/sections/CARET_FILE_EDITING.json

# 특정 필드 추출
jq '.file_editing.sections[0].content' caret-src/core/prompts/sections/CARET_FILE_EDITING.json

# 문자열 검색
grep -n "multiple SEARCH/REPLACE" caret-src/core/prompts/sections/CARET_FILE_EDITING.json
```

---

**검증 시작 시간**: [기록]
**검증 완료 시간**: [기록]
**검증자**: [AI 이름/버전]
**종합 판정**: [APPROVED / APPROVED WITH WARNINGS / NEEDS REVISION / REJECTED]

---

**작성 완료**: 2025-10-14
**대상**: 독립 검증 AI
**예상 검증 시간**: 20-30분
**난이도**: Medium
