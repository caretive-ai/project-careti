# Cline 시스템 프롬프트 개선사항 분석 작업 지시서
**작성일**: 2025-10-14
**대상 AI**: 외부 AI Assistant
**작업 유형**: 코드 비교 분석 및 통합 제안
**예상 소요 시간**: 2-3시간

---

## 📋 작업 개요

**목적**: Cline-latest의 시스템 프롬프트 개선사항을 Caret의 JSON 기반 프롬프트 시스템과 비교 분석하여, Caret에 반영해야 할 개선사항을 도출

**배경**:
- Caret은 Cline v3.32.7 기반의 포크 프로젝트
- 2025-10-09 ~ 2025-10-14: Cline upstream 완전 채택 + Caret Features 재구현 완료
- Caret은 독자적인 JSON 기반 프롬프트 시스템 사용 (Cline은 TypeScript 기반)
- Cline-latest에 2024-12-01 이후 추가된 프롬프트 개선사항을 Caret에 반영 필요

**중요 원칙**:
- Caret의 JSON 시스템 구조 유지
- Cline의 개선사항 중 효과가 입증된 것만 선택적 반영
- 토큰 효율성 고려 (Caret은 더 간결한 프롬프트 지향)

---

## 🎯 작업 목표

### 1차 목표: 상세 비교 분석
- Cline-latest 프롬프트 시스템 구조 분석
- Caret JSON 프롬프트 시스템 구조 분석
- 양측 시스템의 차이점 및 장단점 비교

### 2차 목표: 개선사항 도출
- Cline의 최근 프롬프트 개선사항 추출 (2024-12-01 이후)
- 각 개선사항의 효과 평가
- Caret 적용 가능성 판단

### 3차 목표: 통합 계획 수립
- 반영할 개선사항 우선순위 결정
- JSON 파일별 구체적 수정 제안
- 토큰 영향도 분석

---

## 📂 필수 참조 파일

### Caret 관련 파일 (현재 프로젝트)

#### 1. Caret JSON 프롬프트 섹션
**위치**: `/Users/luke/dev/caret/caret-src/core/prompts/sections/`

**파일 목록**:
```
AGENT_BEHAVIOR_DIRECTIVES.json     - Agent 모드 행동 지침
BASE_PROMPT_INTRO.json              - 기본 소개
CARET_ACTION_STRATEGY.json          - 행동 전략
CARET_BEHAVIOR_RULES.json           - 행동 규칙
CARET_CAPABILITIES.json             - 기능 설명
CARET_FEEDBACK_SYSTEM.json          - 피드백 시스템
CARET_FILE_EDITING.json             - 파일 편집 가이드 ⭐ 중요
CARET_MCP_INTEGRATION.json          - MCP 통합
CARET_SYSTEM_INFO.json              - 시스템 정보
CARET_TASK_OBJECTIVE.json           - 작업 목표
CARET_TASK_PROGRESS.json            - 작업 진행
CARET_TODO_MANAGEMENT.json          - TODO 관리 ⭐ 중요
CARET_USER_INSTRUCTIONS.json        - 사용자 지침
CHATBOT_AGENT_MODES.json            - Chatbot/Agent 모드 설명
COLLABORATIVE_PRINCIPLES.json       - 협업 원칙
```

**주요 확인 대상**:
- `CARET_FILE_EDITING.json` - Cline의 `editing_files.ts`와 비교
- `CARET_TODO_MANAGEMENT.json` - Cline의 `auto_todo.ts`와 비교

#### 2. Caret 프롬프트 시스템 코드
- `caret-src/core/prompts/system/JsonTemplateLoader.ts` - JSON 로더
- `caret-src/core/prompts/system/adapters/CaretJsonAdapter.ts` - JSON 조합 로직
- `caret-src/core/prompts/system/PromptSystemManager.ts` - 시스템 관리자
- `caret-src/core/prompts/CaretPromptWrapper.ts` - Caret 프롬프트 래퍼

#### 3. Caret 기능 명세서
- `caret-docs/features/f06-caret-prompt-system.md` - F06: JSON 시스템 프롬프트

### Cline 관련 파일 (비교 대상)

#### 1. Cline 프롬프트 컴포넌트
**위치**: `/Users/luke/dev/caret/cline-latest/src/core/prompts/system-prompt/components/`

**파일 목록**:
```
editing_files.ts        - 파일 편집 가이드 ⭐ 중요
auto_todo.ts           - TODO 자동 관리 ⭐ 중요
agent_role.ts          - Agent 역할
capabilities.ts        - 기능 설명
act_vs_plan_mode.ts    - Plan/Act 모드
system_info.ts         - 시스템 정보
user_instructions.ts   - 사용자 지침
feedback.ts            - 피드백
task_progress.ts       - 작업 진행
mcp.ts                 - MCP 통합
rules.ts               - 행동 규칙
objective.ts           - 작업 목표
tool_use/              - 툴 사용 관련
```

#### 2. Cline 프롬프트 시스템 코드
- `cline-latest/src/core/prompts/system-prompt/index.ts` - 메인 진입점
- `cline-latest/src/core/prompts/system-prompt/registry/PromptRegistry.ts` - 레지스트리
- `cline-latest/src/core/prompts/system-prompt/registry/PromptBuilder.ts` - 빌더
- `cline-latest/src/core/prompts/commands.ts` - 명령어 프롬프트

#### 3. Cline Git 커밋 (최근 개선사항)
**중요 커밋**:
```
41202df74 (2025-09-29) - Multiple SEARCH/REPLACE blocks 권장
f0cd7fd36 (2025년 후반) - TODO 자동 업데이트 가이드라인 명확화
5af6e8d5e (2025-09-04) - Deep-planning dependency 폴더 제외
6ecadfc7a (2025-09-04) - Parameterless tool docs 개선
5595d12dc (2025년 중반) - Task progress parameter 확장
```

**확인 방법**:
```bash
cd /Users/luke/dev/caret/cline-latest
git log --since="2024-12-01" --grep="prompt" --oneline
git show 41202df74:src/core/prompts/system-prompt/components/editing_files.ts
git show f0cd7fd36:src/core/prompts/system-prompt/components/auto_todo.ts
```

---

## 🔍 상세 작업 단계

### Step 1: Caret 현재 상태 파악 (30분)

#### 1.1 JSON 파일 구조 분석
```bash
cd /Users/luke/dev/caret/caret-src/core/prompts/sections
cat CARET_FILE_EDITING.json | jq '.'
cat CARET_TODO_MANAGEMENT.json | jq '.'
```

**분석 포인트**:
- 각 JSON 파일의 구조 (sections, mode, tokens 등)
- 현재 포함된 내용과 누락된 내용
- 토큰 사용량 추정치

**기대 출력**:
```markdown
## Caret JSON 구조 분석

### CARET_FILE_EDITING.json
- 현재 토큰: ~130
- 주요 내용:
  - replace_in_file vs write_to_file 선택 가이드
  - Auto-formatting 고려사항
  - Mode별 제한사항
- 누락된 내용:
  - [여기에 누락 내용 기록]
```

#### 1.2 CaretJsonAdapter 로직 분석
**파일**: `caret-src/core/prompts/system/adapters/CaretJsonAdapter.ts`

**확인 사항**:
- JSON 섹션 선택 로직 (lines 35-51)
- Mode별 조건부 섹션 (chatbot vs agent)
- Cline 툴 시스템 통합 방식 (lines 100-120)

### Step 2: Cline 개선사항 추출 (1시간)

#### 2.1 editing_files.ts 비교
**Cline 파일**: `cline-latest/src/core/prompts/system-prompt/components/editing_files.ts`

**비교 대상**: `caret-src/core/prompts/sections/CARET_FILE_EDITING.json`

**비교 방법**:
```bash
# Cline 내용 확인
cat /Users/luke/dev/caret/cline-latest/src/core/prompts/system-prompt/components/editing_files.ts

# Caret 내용 확인
cat /Users/luke/dev/caret/caret-src/core/prompts/sections/CARET_FILE_EDITING.json
```

**분석 항목**:
1. **Multiple SEARCH/REPLACE blocks** (Line 73):
   - Cline: "IMPORTANT: prefer to use a single replace_in_file call with multiple SEARCH/REPLACE blocks"
   - Caret: 해당 내용 있는지 확인
   - 평가: 있으면 ✅, 없으면 추가 필요 ⭐

2. **Auto-formatting 상세 설명** (Lines 55-67):
   - Cline: 8가지 구체적 예시 (Breaking lines, indentation, quotes, imports, etc.)
   - Caret: 요약된 내용만 있는지 확인
   - 평가: 상세도 비교

3. **Workflow Tips 5단계** (Lines 69-76):
   - Cline: 5단계 상세 가이드
   - Caret: 해당 섹션 있는지 확인
   - 평가: 구조 비교

**기대 출력**:
```markdown
## editing_files 비교 분석

### 차이점 1: Multiple SEARCH/REPLACE blocks
**Cline (Line 73)**:
"IMPORTANT: When you determine that you need to make several changes to the same file,
prefer to use a single replace_in_file call with multiple SEARCH/REPLACE blocks..."

**Caret 현재 상태**: [없음 / 요약만 있음 / 동일]

**평가**:
- 영향도: HIGH (API 요청 30-50% 감소)
- 구현 난이도: LOW (JSON에 1-2줄 추가)
- 반영 권장: ⭐⭐⭐ YES

**Caret JSON 수정안**:
```json
{
  "file_editing": {
    "sections": [
      {
        "content": "...\n\n🆕 IMPORTANT: 같은 파일에 여러 변경사항이 있을 경우,
        여러 개의 replace_in_file 호출 대신 하나의 호출에 여러 SEARCH/REPLACE 블록을 사용하세요.\n
        예시: import 문과 컴포넌트 사용 부분을 하나의 replace_in_file에서 처리"
      }
    ]
  }
}
```

### 차이점 2: [계속 작성]
...
```

#### 2.2 auto_todo.ts 비교
**Cline 파일**: `cline-latest/src/core/prompts/system-prompt/components/auto_todo.ts`

**비교 대상**: `caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json`

**분석 항목**:
1. **업데이트 주기 명시** (Line 9):
   - Cline: "Every 10th API request, you will be prompted..."
   - Caret: 해당 내용 있는지 확인

2. **Silent 업데이트 강조** (Line 11):
   - Cline: "Todo list updates should be done silently using the task_progress parameter"
   - Caret: 해당 내용 있는지 확인

3. **Actionable steps 강조** (Line 14):
   - Cline: "Focus on creating actionable, meaningful steps rather than granular technical details"
   - Caret: 해당 내용 있는지 확인

#### 2.3 Git 커밋 히스토리 분석
```bash
cd /Users/luke/dev/caret/cline-latest
git log --since="2024-12-01" --all --oneline --grep="prompt" | head -30
```

**확인 대상**:
- 프롬프트 관련 커밋 리스트
- 각 커밋의 변경 내용 요약
- 주요 개선사항 5-10개 추출

### Step 3: 효과 분석 및 우선순위 결정 (30분)

#### 3.1 영향도 분석 매트릭스

**평가 기준**:
| 기준 | 높음 (3점) | 중간 (2점) | 낮음 (1점) |
|------|-----------|-----------|-----------|
| API 요청 감소 | 30%+ | 10-30% | <10% |
| 사용자 경험 개선 | 명확한 개선 | 보통 개선 | 미미한 개선 |
| 토큰 효율성 | 토큰 절약 | 중립 | 토큰 증가 |
| 구현 난이도 | 1시간 이내 | 1-3시간 | 3시간 이상 |

**분석 예시**:
```markdown
## 개선사항 우선순위 매트릭스

### 1. Multiple SEARCH/REPLACE blocks
- API 요청 감소: 3점 (30-50% 감소)
- 사용자 경험: 3점 (대기 시간 단축)
- 토큰 효율성: 3점 (중복 파일 로드 방지)
- 구현 난이도: 1점 (20분)
- **총점: 10점 / 우선순위: HIGH ⭐⭐⭐**

### 2. TODO 업데이트 주기 명시
- API 요청 감소: 1점 (영향 없음)
- 사용자 경험: 2점 (일관된 업데이트)
- 토큰 효율성: 2점 (불필요한 출력 감소)
- 구현 난이도: 1점 (10분)
- **총점: 6점 / 우선순위: MEDIUM ⭐⭐**

[나머지 개선사항 계속...]
```

#### 3.2 토큰 영향도 분석

**현재 Caret 프롬프트 토큰 사용량**:
```
CARET_FILE_EDITING.json: ~130 tokens
CARET_TODO_MANAGEMENT.json: ~50 tokens (추정)
전체 Caret 프롬프트: ~800-1000 tokens (추정)
```

**개선사항 적용 후 예상 토큰**:
```markdown
## 토큰 변화 예측

### 시나리오 1: 모든 개선사항 반영
- CARET_FILE_EDITING.json: 130 → 180 tokens (+50)
- CARET_TODO_MANAGEMENT.json: 50 → 80 tokens (+30)
- 전체: 1000 → 1080 tokens (+8%)

### 시나리오 2: HIGH 우선순위만 반영
- CARET_FILE_EDITING.json: 130 → 150 tokens (+20)
- CARET_TODO_MANAGEMENT.json: 50 → 60 tokens (+10)
- 전체: 1000 → 1030 tokens (+3%)

**권장**: 시나리오 2 (HIGH 우선순위만 반영)
```

### Step 4: 통합 계획 수립 (30분)

#### 4.1 JSON 파일별 수정안

**출력 형식**:
```markdown
## CARET_FILE_EDITING.json 수정안

### 현재 버전
```json
{
  "file_editing": {
    "sections": [
      {
        "content": "# FILE EDITING PROTOCOL\n\n## Tool Selection\n\n**replace_in_file**: Default for targeted edits...",
        "mode": "both",
        "tokens": "~130"
      }
    ]
  }
}
```

### 수정 버전 (v1.1.0)
```json
{
  "file_editing": {
    "sections": [
      {
        "content": "# FILE EDITING PROTOCOL\n\n## Tool Selection\n\n**replace_in_file**: Default for targeted edits...\n\n🆕 ## Workflow Optimization\n\n**Multiple SEARCH/REPLACE Blocks**: When making several changes to the same file, prefer a single replace_in_file call with multiple SEARCH/REPLACE blocks rather than multiple successive calls.\n\n**Example**: Adding a component requires both import and usage - combine both in one call:\n- SEARCH/REPLACE block 1: Add import statement\n- SEARCH/REPLACE block 2: Add component usage\n\n**Benefits**:\n- 30-50% fewer API requests\n- Faster response time\n- Single file loading",
        "mode": "both",
        "tokens": "~150"
      }
    ]
  },
  "version": "1.1.0",
  "lastUpdated": "2025-10-14",
  "changeLog": [
    "Added: Multiple SEARCH/REPLACE blocks optimization guideline"
  ]
}
```

### 변경 사항 요약
- 토큰 증가: 130 → 150 (+20 tokens, +15%)
- 추가 내용: Workflow Optimization 섹션
- 예상 효과: API 요청 30-50% 감소
```

#### 4.2 Phase별 반영 계획

```markdown
## 통합 Phase 계획

### Phase 1: HIGH 우선순위 (즉시 반영) - 1-2시간
**목표**: API 효율성 및 사용자 경험 개선

1. **CARET_FILE_EDITING.json 업데이트** (30분)
   - Multiple SEARCH/REPLACE blocks 가이드 추가
   - Workflow Optimization 섹션 신규 추가

2. **CARET_TODO_MANAGEMENT.json 업데이트** (20분)
   - "Every 10th API request" 업데이트 주기 명시
   - Silent 업데이트 강조
   - Actionable steps 가이드 추가

3. **검증 및 테스트** (40분)
   - JSON 파일 syntax 검증
   - JsonTemplateLoader 로딩 테스트
   - Agent/Chatbot 모드별 프롬프트 생성 확인
   - 변경 전후 diff 비교

### Phase 2: MEDIUM 우선순위 (선택적 반영) - 2-3시간
**목표**: 파일 탐색 성능 개선 및 문서 일관성

4. **파일 탐색 최적화** (1시간)
   - Dependency 폴더 제외 규칙 추가
   - 새 JSON 섹션 또는 기존 섹션 확장 결정
   - node_modules, vendor, .git 등 제외 목록 정의

5. **Parameterless tool docs** (30분)
   - 현재 툴 문서 검토
   - 필요 시 CaretJsonAdapter에서 처리

6. **Task progress parameter** (필요 시 2시간)
   - 요구사항 재확인
   - 현재 TODO 시스템과 충돌 여부 검토

### Phase 3: 검증 및 문서화 (1시간)
7. **전체 검증**
   - 모든 변경사항 통합 테스트
   - 토큰 사용량 측정
   - 성능 비교 (API 요청 수, 응답 시간)

8. **문서 업데이트**
   - CHANGELOG.md 업데이트
   - f06-caret-prompt-system.md 업데이트
   - merge-execution-master-plan.md 업데이트
```

---

## 📊 최종 산출물 형식

### 1. 비교 분석 보고서
**파일명**: `cline-caret-prompt-comparison-report.md`

**필수 포함 내용**:
```markdown
# Cline vs Caret 프롬프트 시스템 비교 분석 보고서

## Executive Summary
- 주요 발견사항 (3-5줄)
- 권장 조치 사항 (우선순위별)

## Caret 현재 상태 분석
### JSON 구조
### 토큰 사용량
### 장단점

## Cline 개선사항 분석
### 최근 개선사항 리스트 (2024-12-01 이후)
### 각 개선사항의 효과

## 상세 비교
### editing_files 비교
### auto_todo 비교
### 기타 컴포넌트 비교

## 우선순위 매트릭스
[표 형식]

## 통합 계획
### Phase 1: HIGH
### Phase 2: MEDIUM
### Phase 3: LOW (Optional)
```

### 2. JSON 수정안
**파일명**: `caret-prompt-json-updates-proposal.md`

**필수 포함 내용**:
- 각 JSON 파일의 before/after
- 변경 사유
- 예상 효과
- 토큰 영향도

### 3. 통합 가이드
**파일명**: `prompt-integration-guide.md`

**필수 포함 내용**:
- 단계별 작업 지침
- 검증 체크리스트
- 롤백 방법

---

## ⚠️ 주의사항

### 1. Caret 시스템 특성 유지
- **JSON 구조 보존**: sections, mode, tokens 필드 유지
- **토큰 효율성**: 불필요한 장황한 설명 지양
- **Mode별 분기**: chatbot vs agent 구분 유지

### 2. 선택적 반영
- **Cline의 모든 개선사항을 반영하지 않음**
- **효과가 검증된 것만 선택**
- **Caret의 설계 철학 준수**: 간결함, 명확함, 효율성

### 3. 토큰 제한
- 각 JSON 파일의 토큰 증가량 20% 이내로 제한
- 전체 프롬프트 토큰 10% 이내 증가 목표

### 4. 기존 기능 유지
- CaretJsonAdapter의 로직 변경 최소화
- JsonTemplateLoader 호환성 유지
- Mode 시스템 (chatbot/agent) 변경 금지

---

## 📚 참고 자료

### Caret 프로젝트 문서
1. **F06 명세서**: `caret-docs/features/f06-caret-prompt-system.md`
2. **머징 마스터 플랜**: `caret-docs/merging/merge-execution-master-plan.md`
3. **Caret 아키텍처 가이드**: `caret-docs/development/caret-architecture-and-implementation-guide.md`

### Cline 참고 자료
1. **Cline GitHub**: https://github.com/cline/cline
2. **최근 변경사항**: `git log --since="2024-12-01" --grep="prompt"`

### 비교 분석 예시
- 초기 분석 결과: `caret-docs/work-logs/luke/2025-10-14-cline-prompt-analysis.md`
  (참고용, 재작성 필요)

---

## ✅ 체크리스트

### 분석 완료 기준
- [ ] Caret JSON 17개 파일 모두 검토 완료
- [ ] Cline 컴포넌트 20개 파일 검토 완료
- [ ] Git 커밋 히스토리 분석 완료 (2024-12-01 이후)
- [ ] 비교 분석 보고서 작성 완료
- [ ] 우선순위 매트릭스 작성 완료
- [ ] JSON 수정안 작성 완료 (최소 2개 파일)
- [ ] 통합 계획 수립 완료

### 품질 기준
- [ ] 모든 차이점에 대해 before/after 명확히 제시
- [ ] 각 개선사항의 효과를 정량적으로 제시 (API 요청 감소율, 토큰 영향 등)
- [ ] 우선순위 판단 근거 명확히 제시
- [ ] JSON 수정안이 유효한 JSON 문법인지 검증
- [ ] 토큰 증가량 계산 정확성 확인

---

**작성자**: Luke (Caret 개발자)
**검토자**: [AI Assistant 이름]
**완료 예정일**: 2025-10-14 ~ 2025-10-15
