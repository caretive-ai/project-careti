# Prompt System 비교 보고서 (Cline v3.38.1 ↔ Careti)

작성자: Codex  
범위: `src/core/prompts/system-prompt/**`, Careti 하이브리드 프롬프트 경로(`careti-src/core/prompts/**`)  
기준: `comparison/cline/src/core/prompts/system-prompt` (Cline v3.38.1) vs 현재 워킹트리

---

## 1) 전체 정합성
- 템플릿/variants/tools/registry 구조는 cline v3.38.1과 동일하며, 차이는 Careti 모드 분기용 최소 침습 변경에 한정.
- 최신 cline 변경사항이 반영된 영역: CLI 서브에이전트 안내 텍스트, PromptRegistry/TemplateEngine/variants 전반. 워킹트리와 cline 비교 시 추가 차이 없음(아래 세 곳만 차이).

## 2) 차이 요약
1. `src/core/prompts/system-prompt/index.ts`
   - CARETI 분기: `context.modeSystem === "careti"`이면 `CaretiPromptWrapper.getCaretSystemPrompt` 호출, `tools: []` 반환 (tools는 CaretModeManager에서 관리).
   - cline 경로: PromptRegistry 그대로 사용.
2. `src/core/prompts/system-prompt/components/cli_subagents.ts`
   - 내용은 cline 최신 텍스트와 동일하되, CLI/에이전트 명칭·명령어를 `modeSystem`에 따라 `Careti`/`Cline`으로 스위칭.
3. `src/core/prompts/system-prompt/types.ts`
   - `modeSystem?: "careti" | "cline"` 필드 추가로 Careti 분기 전달.

## 3) 최근 cline 변경 반영 여부
- CLI Subagents 안내(3.38.1 변경점): 문구·예시·Tips 모두 동일하게 유지하고, Careti/클라인 명칭만 동적으로 치환되도록 구현 → **반영 완료, 누락 없음**.
- PromptRegistry/variants/templates: cline와 동일. 추가/삭제 없음 → **정합**.
- 툴 세트(ClineToolSet): cline 네이티브 그대로, Careti 모드에서는 tool list 빈 배열을 반환하여 모드 매니저에서 필터 → **의도된 차이**.

## 4) Careti 하이브리드 경로 검증 포인트
- 초기화: `src/common.ts`에서 `JsonTemplateLoader`를 `careti-src/core/prompts/sections`로 초기화(복구 완료). 이 경로 누락 시 Careti 모드 프롬프트 생성 실패.
- 모드 전달: `SystemPromptContext.modeSystem` → `CaretiPromptWrapper` → `PromptSystemManager` → `CaretiJsonAdapter`.
- 도구 필터링: Careti 모드에서 `tools: []` 반환 + `CaretModeManager.isToolAllowed` 사용. Cline 모드는 registry.nativeTools 그대로.
- Terminology 치환: `CaretiJsonAdapter` 내 PLAN/ACT → Chatbot/Agent 변환 로직 유지.

## 5) 위험/추가 확인
- `modeSystem` 필드가 누락되면 Careti 분기 실행 불가하므로, 컨트롤러(`Task`, `ExtensionStateContext`)에서 항상 전달되는지 회귀 테스트 필요.
- CLI 배너/감지(Phase D-2) 진행 시 `cli_subagents.ts` 텍스트 변경이 없는지 재검토 필요하지만, 현 시점 문구 동일.

## 6) 결론
- cline v3.38.1 시스템 프롬프트 최신 변경점은 모두 반영되어 있으며, Careti 전용 분기/치환 로직만 추가로 존재. 추가 이식 필요 없음.  
- 회귀 방지를 위해 `modeSystem` 전달 경로와 `JsonTemplateLoader` 초기화 여부를 체크리스트에 포함하는 것으로 충분.
