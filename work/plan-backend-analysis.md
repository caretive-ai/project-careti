# 백엔드 파일 추가 분석 및 통합 계획 (수정 2)

이 문서는 `work/analysis-of-102-modifications.md` 문서의 지시에 따라, 추가 분석이 필요한 49개 백엔드 파일에 대한 분석 및 결과 통합 작업을 계획합니다. `cline-latest` 디렉토리와의 비교를 통해 각 파일의 상태(수정 또는 추가)를 명확히 판별하는 단계를 최우선으로 진행합니다.

## 🎯 목표

- '추가 분석 필요 파일' 목록의 백엔드 파일 49개에 대해 **파일 상태(수정/추가)를 명확히 판별**합니다.
- 판별된 상태에 기반하여 수정 목적, 충돌 원인, 원칙 위반 여부를 분석합니다.
- 분석 결과를 '📋 백엔드 파일 재분석 (컨플릭트 원인 중심)' 테이블에 통합합니다.
- `analysis-of-102-modifications.md` 문서를 최신 상태로 업데이트하여 모든 백엔드 수정 파일 분석을 완료합니다.

## 📝 작업 절차

1.  **사전 준비**:
    -   [x] `caret-docs/features/index.mdx` 파일 내용을 읽고 기능 컨텍스트를 파악합니다.
    -   [x] `work/backend-analysis-results.md` 파일을 새로운 형식에 맞게 초기화합니다.

2.  **파일 상태 판별 및 분석 (반복 수행)**:
    -   `analysis-of-102-modifications.md`의 '추가 분석 필요 파일' 목록에서 다음 분석 대상 파일을 선정합니다.
    -   **`cline-latest` 디렉토리와 비교하여 해당 파일이 Cline 원본에 존재하는지 확인합니다.**
        -   존재하는 경우: **수정된 파일 (Modified)**
        -   존재하지 않는 경우: **Caret에서 추가된 파일 (Added)**
    -   파일 상태를 `work/backend-analysis-results.md`에 기록합니다.
    -   `read_file`을 사용하여 파일의 전체 내용을 읽습니다.
    -   파일 상태에 따라 분석을 수행합니다.
        -   **수정된 파일**: 왜 수정했는지, 그리고 그 수정이 Cline의 변경과 어떻게 충돌했는지 분석합니다.
        -   **추가된 파일**: 이 파일이 왜 `src`가 아닌 `caret-src`에 위치해야 하는지 원칙 위반 관점에서 분석하고, 이 파일로 인해 어떤 **간접적인 충돌**이 발생했는지(예: `index.ts` 수정) 분석합니다.
    -   분석 결과를 마크다운 테이블 행 형식으로 `work/backend-analysis-results.md`에 임시 저장합니다.

3.  **결과 통합**:
    -   모든 파일 분석이 완료되면, `work/backend-analysis-results.md`의 내용을 `work/analysis-of-102-modifications.md` 파일의 '📋 백엔드 파일 재분석 (컨플릭트 원인 중심)' 테이블에 추가합니다.
    -   `work/analysis-of-102-modifications.md` 파일의 '추가 분석 필요 파일' 목록에서 분석이 완료된 백엔드 파일 목록을 제거합니다.

4.  **최종 검토**:
    -   `work/analysis-of-102-modifications.md` 파일의 내용이 지시사항에 맞게 완전히 업데이트되었는지 최종 확인합니다.

## 🗂️ 분석 대상 파일 목록 (49개)

- `src/common.ts`
- `src/core/api/providers/cline.ts`
- `src/core/api/providers/doubao.ts`
- `src/core/api/providers/fireworks.ts`
- `src/core/api/providers/litellm.ts`
- `src/core/api/providers/lmstudio.ts`
- `src/core/api/providers/openai.ts`
- `src/core/api/providers/openrouter.ts`
- `src/core/api/providers/qwen.ts`
- `src/core/api/providers/requesty.ts`
- `src/core/api/providers/xai.ts`
- `src/core/controller/file/toggleWindsurfRule.ts`
- `src/core/controller/models/getSapAiCoreModels.ts`
- `src/core/controller/models/refreshOpenRouterModels.ts`
- `src/core/prompts/commands.ts`
- `src/core/prompts/loadMcpDocumentation.ts`
- `src/core/prompts/system-prompt/__tests__/integration.test.ts`
- `src/core/storage/utils/state-helpers.ts`
- `src/core/task/tools/handlers/AccessMcpResourceHandler.ts`
- `src/core/task/tools/handlers/CondenseHandler.ts`
- `src/core/task/tools/handlers/ExecuteCommandToolHandler.ts`
- `src/core/task/tools/handlers/ListCodeDefinitionNamesToolHandler.ts`
- `src/core/task/tools/handlers/ListFilesToolHandler.ts`
- `src/core/task/tools/handlers/NewTaskHandler.ts`
- `src/core/task/tools/handlers/ReadFileToolHandler.ts`
- `src/core/task/tools/handlers/ReportBugHandler.ts`
- `src/core/task/tools/handlers/SearchFilesToolHandler.ts`
- `src/core/task/tools/handlers/UseMcpToolHandler.ts`
- `src/core/task/tools/handlers/WebFetchToolHandler.ts`
- `src/core/task/tools/handlers/WriteToFileToolHandler.ts`
- `src/core/task/tools/utils/ToolConstants.ts`
- `src/core/webview/WebviewProvider.ts`
- `src/dev/commands/tasks.ts`
- `src/hosts/vscode/VscodeWebviewProvider.ts`
- `src/hosts/vscode/hostbridge/workspace/openClineSidebarPanel.ts`
- `src/integrations/terminal/TerminalManager.ts`
- `src/integrations/terminal/TerminalProcess.test.ts`
- `src/services/browser/BrowserSession.ts`
- `src/services/browser/UrlContentFetcher.ts`
- `src/services/mcp/McpHub.ts`
- `src/services/test/TestServer.ts`
- `src/services/uri/SharedUriHandler.ts`
- `src/test/e2e/auth.test.ts`
- `src/test/e2e/chat.test.ts`
- `src/test/e2e/diff.test.ts`
- `src/test/e2e/editor.test.ts`
- `src/test/e2e/fixtures/server/api.ts`
- `src/test/e2e/utils/common.ts`
- `src/test/e2e/utils/helpers.ts`
