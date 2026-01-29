# F16 - 웹 도구 및 슬래시 명령

**Status**: ✅ v0.4.6 (Cline v3.49.1 포팅) | **Scope**: Backend(도구), Webview(UI) | **Priority**: 🟢 High

## 📋 개요

Cline v3.49.1에서 포팅된 웹 도구 및 슬래시 명령 시스템입니다.

### 포팅된 기능
- **Web Search** (`web_search`) - SerpAPI 기반 웹 검색
- **Explain Changes** (`/explain-changes`) - Git 변경사항 AI 설명
- **Use Skill** (`use_skill`) - 스킬 시스템 통합 도구

## ✅ 왜 중요한가

- **정보 접근성**: AI가 최신 정보를 검색하여 더 정확한 답변 제공
- **개발 생산성**: Git 변경사항을 AI가 자동으로 설명하여 코드 리뷰 효율화
- **스킬 활용**: 프로젝트별 스킬을 AI가 자동으로 로드하여 일관된 작업 수행

---

## 🔍 Web Search 도구

### 기능 설명
AI가 웹에서 정보를 검색하여 최신 정보를 기반으로 답변합니다.

### 활성화 조건
```typescript
// Careti 프로바이더 + clineWebToolsEnabled 설정 필요
context.providerInfo.providerId === "careti" && context.clineWebToolsEnabled === true
```

### 사용 예시
```
사용자: "React 19의 새로운 기능이 뭐야?"
AI: [web_search 도구로 검색 후 최신 정보 제공]
```

### 관련 파일
- `src/core/prompts/system-prompt/tools/web_search.ts` - 도구 정의
- `src/core/task/tools/handlers/WebSearchToolHandler.ts` - 핸들러
- `src/core/prompts/system-prompt/components/capabilities.ts` - 시스템 프롬프트 통합

### 설정
| 설정 키 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `clineWebToolsEnabled` | boolean | true | 웹 도구 활성화 |

---

## 📝 Explain Changes 슬래시 명령

### 기능 설명
Git 변경사항에 대한 AI 주석을 생성하여 코드 리뷰를 돕습니다.

### 사용법
```
/explain-changes
```

### 동작
1. Git diff를 분석
2. VS Code diff view 열기
3. 변경된 코드에 AI 설명 주석 추가

### 관련 파일
- `src/core/slash-commands/index.ts` - 명령 등록
- `src/core/prompts/commands.ts` - `explainChangesToolResponse()` 함수
- `src/core/prompts/system-prompt/tools/generate_explanation.ts` - 도구 정의
- `src/core/task/tools/handlers/GenerateExplanationToolHandler.ts` - 핸들러

### 제한사항
- VS Code 확장에서만 사용 가능 (CLI 미지원)
- Git 저장소 필요

---

## 🎯 Use Skill 도구

### 기능 설명
`.agents/skills/` 디렉토리의 스킬을 AI가 자동으로 로드합니다.

### 연관 기능
- **F06**: 에이전트 표준화 (`.agents/skills/` 구조)

### 동작
1. 사용자가 스킬 관련 요청
2. AI가 `use_skill` 도구로 스킬 로드
3. 스킬의 지시사항에 따라 작업 수행

### 관련 파일
- `src/shared/tools.ts` - `USE_SKILL` enum
- `src/core/prompts/system-prompt/tools/use_skill.ts` - 도구 정의 (해당 시)
- `webview-ui/src/components/chat/ChatRow.tsx` - `useSkill` UI case

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    사용자 입력                               │
│  "최신 React 문서 찾아줘" or "/explain-changes"              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 슬래시 명령 파서                             │
│  src/core/slash-commands/index.ts                           │
│  - /explain-changes 감지 시 명령 프롬프트 주입               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   시스템 프롬프트                            │
│  - clineWebToolsEnabled 시 web_search 기능 설명 포함        │
│  - SKILLS 컴포넌트로 스킬 시스템 설명 포함                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    도구 실행                                 │
│  ToolExecutor → WebSearchToolHandler                        │
│              → GenerateExplanationToolHandler               │
│              → UseSkillToolHandler                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    UI 렌더링                                 │
│  ChatRow.tsx                                                │
│  - webSearch case: 검색 결과 표시                           │
│  - generate_explanation case: 설명 생성 상태 표시            │
│  - useSkill case: 스킬 로드 표시                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 테스트

### Web Search
```bash
npm run test:unit -- --grep "WebSearchToolHandler"
```

### Explain Changes
- VS Code에서 `/explain-changes` 입력
- Git 변경사항이 있는 상태에서 테스트

---

## 🔄 머징 가이드

### Cline upstream 머징 시 주의사항

1. **도구 정의 파일**
   - `tools/web_search.ts` - variant 목록 확인
   - `tools/generate_explanation.ts` - 파라미터 변경 확인

2. **슬래시 명령**
   - `slash-commands/index.ts` - 명령 목록 동기화
   - `prompts/commands.ts` - 응답 함수 동기화

3. **설정 키**
   - `clineWebToolsEnabled` - 기본값 및 동작 확인

4. **UI**
   - `ChatRow.tsx` - 새로운 case 추가 여부 확인

---

## 📚 관련 문서

- **F06**: 에이전트 표준화 - 스킬 시스템 구조
- **F07**: Careti 프롬프트 시스템 - 도구 등록

---

**최종 업데이트**: 2026-01-26
**문서 버전**: v1.0 (Cline v3.49.1 포팅)
