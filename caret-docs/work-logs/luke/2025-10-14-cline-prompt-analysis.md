# Cline 시스템 프롬프트 개선사항 분석
**날짜**: 2025-10-14
**목적**: Cline-latest의 시스템 프롬프트 개선사항을 분석하여 Caret JSON 시스템에 반영할 만한 내용 파악

---

## 📋 Executive Summary

Cline의 최근 시스템 프롬프트 개선사항을 분석한 결과, **5개의 주요 개선사항**이 발견되었으며, 이 중 **3개는 Caret에 즉시 반영 권장**, **2개는 선택적 반영**을 권장합니다.

### 즉시 반영 권장 (HIGH Priority)
1. ✅ **Multiple SEARCH/REPLACE blocks** - Sonnet 4.5 효율성 개선
2. ✅ **TODO 자동 업데이트 가이드라인** - 명확한 업데이트 시점 제시
3. ✅ **Deep-planning dependency 폴더 제외** - Plan 모드 성능 개선

### 선택적 반영 (MEDIUM Priority)
4. 🔄 **Parameterless tool docs** - 툴 문서 일관성 개선
5. 🔄 **Task progress parameter** - 더 상세한 진행 상황 추적

---

## 🔍 상세 분석

## 1. Multiple SEARCH/REPLACE Blocks 개선 (HIGH)

**커밋**: `41202df74` (2025-09-29)
**파일**: `src/core/prompts/system-prompt/components/editing_files.ts`

### 변경 내용
```
# Workflow Tips (Line 73 추가)

3. IMPORTANT: When you determine that you need to make several changes to the same file,
   prefer to use a single replace_in_file call with multiple SEARCH/REPLACE blocks.
   DO NOT prefer to make multiple successive replace_in_file calls for the same file.

   For example, if you were to add a component to a file, you would use a single
   replace_in_file call with a SEARCH/REPLACE block to add the import statement and
   another SEARCH/REPLACE block to add the component usage, rather than making one
   replace_in_file call for the import statement and then another separate replace_in_file
   call for the component usage.
```

### 왜 중요한가?
- **API 요청 수 감소**: 같은 파일에 여러 변경 시 1번의 API 요청으로 처리
- **Sonnet 4.5 최적화**: Claude Sonnet 4.5가 여러 블록을 동시 처리하도록 명시적 유도
- **컨텍스트 효율**: 파일 내용을 한 번만 로드하여 처리

### Caret 반영 방안
**파일**: `caret-src/core/prompts/sections/CARET_FILE_EDITING.json`

```json
{
  "title": "파일 편집 가이드라인",
  "content": [
    "...",
    {
      "heading": "워크플로우 팁",
      "points": [
        "편집 전 변경 범위를 평가하여 적절한 도구 선택",
        "타겟팅된 편집의 경우 replace_in_file 사용 (여러 SEARCH/REPLACE 블록 가능)",
        "🆕 중요: 같은 파일에 여러 변경사항이 있을 경우, 여러 개의 replace_in_file 호출 대신 하나의 호출에 여러 SEARCH/REPLACE 블록을 사용하세요",
        "🆕 예시: 컴포넌트 추가 시 import 문과 사용 부분을 하나의 replace_in_file 호출에서 처리",
        "대규모 개편이나 새 파일 생성은 write_to_file 사용",
        "파일 편집 후 자동 포매팅된 최종 상태를 다음 편집의 기준점으로 사용"
      ]
    }
  ]
}
```

**예상 효과**:
- API 요청 수 30-50% 감소 (같은 파일 다중 편집 시)
- 사용자 대기 시간 단축
- 토큰 사용량 최적화

---

## 2. TODO 자동 업데이트 가이드라인 명확화 (HIGH)

**커밋**: `f0cd7fd36` (2025년 후반)
**파일**: `src/core/prompts/system-prompt/components/auto_todo.ts`

### 변경 내용 (현재 Cline-latest)
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

### 현재 Caret (비교)
**파일**: 확인 필요 - Caret JSON 시스템에 TODO 관련 섹션

### 왜 중요한가?
- **명확한 업데이트 시점**: "10번째 API 요청마다" 명시적으로 제시
- **사용자 경험 개선**: "silently" 업데이트하여 불필요한 출력 방지
- **모드 전환 시 자동화**: PLAN → ACT 전환 시 자동으로 TODO 생성

### Caret 반영 방안
**파일**: `caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json`

현재 내용 확인 후 다음 항목 추가/수정:
```json
{
  "title": "자동 TODO 리스트 관리",
  "content": [
    "시스템은 작업 진행 상황 추적을 위해 TODO 리스트를 자동 관리합니다:",
    "🆕 10번째 API 요청마다 기존 TODO 리스트가 있으면 검토 및 업데이트 요청",
    "🆕 Chatbot 모드에서 Agent 모드로 전환 시 포괄적인 TODO 리스트 생성",
    "🆕 TODO 업데이트는 task_progress 파라미터를 사용하여 자동으로 수행 (사용자에게 공지하지 않음)",
    "표준 마크다운 체크리스트 형식 사용: '- [ ]' (미완료), '- [x]' (완료)",
    "시스템이 적절한 시점에 자동으로 TODO 컨텍스트 포함",
    "🆕 세부 기술 사항보다는 실행 가능하고 의미 있는 단계에 집중"
  ]
}
```

**예상 효과**:
- TODO 업데이트 타이밍 일관성 확보
- 불필요한 출력 감소로 대화 흐름 개선
- 실행 가능한 TODO 아이템 품질 향상

---

## 3. Deep-Planning Dependency 폴더 제외 (HIGH)

**커밋**: `5af6e8d5e` (2025-09-04)
**파일**: `src/core/prompts/commands.ts`

### 변경 내용
Plan 모드에서 `find` 명령 실행 시 dependency 폴더(node_modules, vendor 등) 자동 제외

### 왜 중요한가?
- **Plan 모드 성능**: 불필요한 dependency 폴더 스캔 방지
- **토큰 절약**: 수천 개의 불필요한 파일 경로 로드 방지
- **관련성 향상**: 실제 프로젝트 코드에만 집중

### Caret 반영 방안
**파일**: Caret는 별도 commands 처리 로직 확인 필요

현재 Caret에서 `find` 명령이나 파일 탐색 관련 프롬프트에 다음 추가:
```json
{
  "title": "파일 탐색 가이드라인",
  "content": [
    "파일 검색 시 다음 디렉토리는 자동으로 제외됩니다:",
    "🆕 - node_modules/ (Node.js 의존성)",
    "🆕 - vendor/ (PHP/Ruby/Go 의존성)",
    "🆕 - .git/ (Git 내부 파일)",
    "🆕 - dist/, build/, out/ (빌드 산출물)",
    "🆕 - venv/, __pycache__/ (Python 관련)",
    "실제 프로젝트 소스 코드에 집중하여 효율적인 탐색 수행"
  ]
}
```

**예상 효과**:
- Plan 모드 탐색 속도 50-80% 향상
- 토큰 사용량 대폭 감소
- 더 관련성 높은 파일 제안

---

## 4. Parameterless Tool Docs 개선 (MEDIUM)

**커밋**: `6ecadfc7a` (2025-09-04)
**파일**: `src/core/prompts/system-prompt/registry/PromptBuilder.ts`

### 변경 내용
파라미터가 없는 툴의 경우에도 일관된 문서 포맷 유지

### 왜 중요한가?
- **문서 일관성**: 모든 툴 문서가 동일한 형식
- **GPT-5 호환성**: 새로운 모델 패밀리 지원

### Caret 반영 여부
⚠️ **선택적 반영**
- Caret JSON 시스템은 이미 구조화된 형식 사용
- 현재 툴 문서에 문제가 없다면 낮은 우선순위

---

## 5. Task Progress Parameter 확장 (MEDIUM)

**커밋**: `5595d12dc` (2025년 중반)
**파일**: 다수의 툴 정의 파일

### 변경 내용
여러 툴에 `task_progress` 파라미터 추가하여 더 상세한 진행 상황 추적

### 왜 중요한가?
- **진행 상황 가시성**: 각 툴 실행마다 TODO 업데이트 가능
- **사용자 피드백**: 실시간 진행 상황 파악

### Caret 반영 여부
⚠️ **선택적 반영**
- Caret의 TODO 시스템이 이미 충분하다면 낮은 우선순위
- 필요 시 Phase 2로 연기 가능

---

## 📊 반영 우선순위 매트릭스

| 개선사항 | 영향도 | 구현 난이도 | 우선순위 | 예상 작업 시간 |
|---------|--------|------------|---------|---------------|
| Multiple SEARCH/REPLACE | 높음 | 낮음 | ⭐⭐⭐ HIGH | 30분 |
| TODO 가이드라인 | 중간 | 낮음 | ⭐⭐⭐ HIGH | 20분 |
| Dependency 제외 | 높음 | 중간 | ⭐⭐⭐ HIGH | 1시간 |
| Parameterless docs | 낮음 | 낮음 | ⭐ MEDIUM | 30분 |
| Task progress | 중간 | 높음 | ⭐ MEDIUM | 2시간 |

---

## 🎯 권장 작업 순서

### Phase 1: 즉시 반영 (1.5-2시간)
1. **Multiple SEARCH/REPLACE** (30분)
   - `CARET_FILE_EDITING.json` 업데이트
   - "Workflow Tips" 섹션에 항목 추가

2. **TODO 가이드라인** (20분)
   - `CARET_TODO_MANAGEMENT.json` 업데이트
   - 업데이트 시점 명시화

3. **Dependency 폴더 제외** (1시간)
   - Caret 파일 탐색 로직 확인
   - 프롬프트 또는 코드에 제외 규칙 추가

### Phase 2: 선택적 반영 (필요 시)
4. **Parameterless tool docs** (30분)
   - 현재 툴 문서 검토 후 결정

5. **Task progress parameter** (2시간)
   - 요구사항 재확인 후 결정

---

## 🔄 Caret JSON 시스템 반영 가이드

### JSON 섹션 업데이트 패턴
```json
{
  "version": "1.1.0",
  "lastUpdated": "2025-10-14",
  "changeLog": [
    "🆕 Added: Multiple SEARCH/REPLACE blocks guideline",
    "🆕 Updated: TODO management timing clarification",
    "🆕 Added: Dependency folder exclusion rules"
  ],
  "content": {
    // 업데이트된 내용
  }
}
```

### 테스트 체크리스트
- [ ] JSON 파일 syntax 검증
- [ ] JsonTemplateLoader 로딩 테스트
- [ ] Agent 모드에서 프롬프트 생성 확인
- [ ] Chatbot 모드에서 프롬프트 생성 확인
- [ ] 변경 전후 프롬프트 diff 확인

---

## 📝 추가 발견 사항

### Cline의 프롬프트 구조
```
src/core/prompts/system-prompt/
├── components/          # 개별 섹션 컴포넌트
│   ├── agent_role.ts
│   ├── capabilities.ts
│   ├── editing_files.ts
│   ├── auto_todo.ts
│   └── ...
├── registry/           # 프롬프트 조합 로직
├── templates/          # 템플릿 엔진
└── variants/           # 모델별 변형
```

### Caret의 프롬프트 구조
```
caret-src/core/prompts/
├── sections/           # JSON 섹션 파일
│   ├── BASE_PROMPT_INTRO.json
│   ├── CARET_FILE_EDITING.json
│   ├── CARET_TODO_MANAGEMENT.json
│   └── ...
└── system/             # 시스템 관리
    ├── JsonTemplateLoader.ts
    ├── CaretJsonAdapter.ts
    └── PromptSystemManager.ts
```

**차이점**:
- Cline: TypeScript 기반, 함수형 컴포넌트
- Caret: JSON 기반, 선언적 구조
- 장점: Caret의 JSON은 더 유지보수하기 쉬움
- 단점: Cline의 동적 로직이 필요한 부분은 adapter에서 처리 필요

---

## ✅ 다음 단계

1. **즉시 작업**: Phase 1의 3가지 개선사항 반영
2. **테스트**: Agent/Chatbot 모드 모두에서 검증
3. **문서화**: 변경 사항을 `CHANGELOG.md`에 기록
4. **모니터링**: 사용자 피드백 수집하여 효과 검증

---

**작성자**: AI Assistant (Claude)
**검토 필요**: Luke (Caret 개발자)
