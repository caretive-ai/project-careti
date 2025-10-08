# cline 코드 caret 수정 파일 분석 보고서

이 문서는 `cline/master` 브랜치 병합 충돌의 원인이 된 102개의 Caret 수정 파일에 대한 분석 결과를 담고 있습니다.
 **자동화 스크립트**: 이 맵을 활용하여 `work/caret-commented-files.txt`에 있는 102개의 수정 파일 목록과 대조하는 `work/scripts/analyze_modifications.js` 스크립트를 작성하고 실행했습니다.
  추가적으로 cline코드의 src(백엔드소스)의 수정내역을 리스팅하여, 주석이 없으나 수정된 파일을 판별하여 추가했습니다.

## 📝 분석 원칙 및 검증 방법

모든 파일 분석 시 **최소 침습 원칙(Minimal Invasion Principle)**을 최우선으로 적용합니다.

- **원칙 정의**: Caret의 핵심 기능 구현에 필수적이지 않은 수정은 Cline 원본 상태를 유지하는 것을 목표로 합니다. 이는 자동화된 린터(linter)나 포맷터(formatter)에 의한 사소한 코드 스타일 변경을 포함합니다.
- **검증 절차**: `diff cline-latest/<file_path> <file_path>` 명령을 통해 Caret의 수정 사항과 Cline 원본을 비교하여 기능적 변경과 스타일 변경을 확인합니다.
- **권장 조치**: 만약 수정이 비필수적인 것으로 판단될 경우, 해당 파일은 수정 목록에서 제외하고 `git checkout upstream/main -- <file_path>` 명령을 통해 Cline 원본으로 되돌릴 것을 권장합니다. 이를 통해 불필요한 수정 기록을 남기지 않고, 향후 병합 충돌 가능성을 최소화합니다.

### 적용 예시: `src/core/api/providers/doubao.ts`
- **현상**: 이 파일은 Caret 수정 파일로 추적되었으나, 실제 변경 내용은 `@ts-ignore-next-line` 주석이 `@ts-expect-error-next-line`으로 변경된 것뿐이었습니다.
- **판단**: 이는 기능에 영향을 주지 않는 린터 관련 자동 수정입니다.
- **결론**: **최소 침습 원칙**에 따라, 이 파일은 수정 목록에서 관리할 필요가 없으며 Cline 원본으로 되돌리는 것이 바람직합니다. 이와 같은 사례는 분석 과정에서 식별하고 원상 복구를 권장해야 합니다.
 
# 추가 작업 필요
 현재 백엔드의 추가 수정 파일이 식별되어 해당 파일들을 분석후 백엔드 분석 파일을 추가합니다. 개별 파일을 검사하여 추가하며 수정 목적은 caret-docs/features/index.mdx 문서를 참고합니다.

### 다음 세션 작업 지시
다음 세션에서는 아래 '추가 분석 필요 파일' 목록에 남은 백엔드 파일(49개)을 분석합니다. 이 분석 작업은 다음의 **핵심 가이드라인**에 따라 진행해야 합니다.

**[핵심 가이드라인] 최소 침습 원칙 기반의 다각도 분석**
- **목표**: Caret의 수정 사항을 명확히 분류하고, 불필요한 변경 기록을 최소화하기 위한 구체적인 분석을 수행합니다.
- **분석 방법**: 각 파일을 `diff cline-latest/<file_path> <file_path>` 명령으로 Cline 원본과 비교하여 변경 내용을 파악합니다.
- **결과 기록 방식**: 분석 결과를 단순히 '기능적/비기능적'으로 양분하지 않고, 아래 4가지 항목으로 나누어 구체적으로 기술합니다.
    1.  **수정 목적 및 기능 분석**: 변경 사항이 어떤 Caret 기능과 관련이 있는지, 또는 어떤 목적(버그 수정, 성능 개선 등)을 가지고 있는지 기술합니다.
    2.  **원본 복원 권장**: 해당 수정이 기능 구현에 필수적이지 않은 단순 스타일 수정, 린터 오류 해결 등 비필수적 변경일 경우, 여기에 **'원본 복원 권장'** 이라고 명시합니다.
    3.  **컨플릭트 위험도 분석**: Cline의 변경 사항과 충돌할 가능성이 얼마나 높은지 (높음/중간/낮음) 평가하고 그 이유를 간략히 서술합니다.
    4.  **종합 의견 및 권장 조치**: 리팩토링 제안, 추가 확인이 필요한 사항, 또는 최종 조치(예: `caret-src`로 이전) 등 종합적인 의견을 자유롭게 기술합니다.
- **적용 예시**: `src/core/api/providers/doubao.ts` 파일의 경우, 다음과 같이 기록할 수 있습니다.
    - **수정 목적**: 없음 (린터 자동 수정).
    - **원본 복원 권장**: 원본 복원 권장.
    - **컨플릭트 위험도**: 낮음 (단순 주석 변경).
    - **종합 의견**: 최소 침습 원칙에 따라 원본으로 되돌려 불필요한 diff를 제거하는 것이 바람직함.

이 가이드라인에 따라 각 파일을 분석하고, 그 결과를 '📋 백엔드 파일 재분석 (컨플릭트 원인 중심)' 테이블에 통합하여 모든 백엔드 수정 파일 분석을 완료합니다.


## 🎯 자동 매핑된 파일 목록 (32개)
캐럿의 추가 기능에 대한 문서들 에 기반한
`work/scripts/analyze_modifications.js` 스크립트를 통해 기능 명세 문서와 자동 매핑된 파일 목록입니다.

1. `src/core/context/instructions/user-instructions/external-rules.ts`
2. `src/core/storage/state-keys.ts`
3. `src/core/storage/utils/state-helpers.ts`
4. `src/core/storage/disk.ts`
5. `src/core/controller/file/refreshRules.ts`
6. `src/core/controller/caretAccount/getCaretOrganizationCredits.ts`
7. `src/core/controller/caretAccount/getCaretUserOrganizations.ts`
8. `src/core/controller/caretAccount/getCaretUserCredits.ts`
9. `src/core/controller/index.ts`
10. `src/core/task/index.ts`
11. `src/core/prompts/system-prompt/index.ts`
12. `src/core/prompts/responses.ts`
13. `src/extension.ts`
14. `src/shared/api.ts`
15. `src/services/account/CaretAccountService.ts`
16. `webview-ui/src/context/ExtensionStateContext.tsx`
17. `webview-ui/src/components/settings/providers/LiteLlmProvider.tsx`
18. `webview-ui/src/components/cline-rules/ClineRulesToggleModal.tsx`
19. `webview-ui/src/components/chat/ChatTextArea.tsx`
20. `webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx`
21. `webview-ui/src/components/chat/ChatRow.tsx`
22. `webview-ui/src/components/chat/ChatView.tsx`
23. `webview-ui/src/components/account/AccountView.tsx`
24. `webview-ui/src/caret/context/CaretI18nContext.tsx`
25. `webview-ui/src/caret/utils/urls.ts`
26. `webview-ui/src/caret/utils/i18n.ts`
27. `webview-ui/src/caret/utils/CaretWebviewLogger.ts`
28. `webview-ui/src/caret/components/CaretAccountInfoCard.tsx`
29. `webview-ui/src/caret/components/CaretAccountView.tsx`
30. `webview-ui/src/caret/hooks/usePersistentInputHistory.ts`
31. `webview-ui/src/caret/hooks/useCaretI18n.ts`
32. `proto/cline/file.proto`

---

## 📋 분석 완료된 백엔드 파일 

자동 및 수동 분석을 통해 기능 매핑이 완료된 파일 목록입니다.

### 📋 분석 완료된 기타(proto/scripts) 파일 (7개)
| 파일 경로 | 관련 기능 | 수정 목적 (주석 내용 요약) |
|---|---|---|
| `proto/cline/models.proto` | f04-caret-account | `ApiProvider` 열거형에 `CARET`을 추가하고, 프로토콜 버퍼 메시지에 Caret 전용 모델 정보 및 구성 필드 정의 |
| `proto/cline/state.proto` | f04, f08 | Caret API 설정을 위한 `CaretConfig`와 페르소나 시스템을 위한 `persona` 필드를 `ChatSettings`에 추가 |
| `proto/caret/persona.proto` | f08-persona-system | Caret의 페르소나 기능 관리를 위한 gRPC 서비스와 메시지 정의 |
| `proto/caret/system.proto` | f06, f07, f10 | 프롬프트 모드, 에이전트 모드, LiteLLM 모델 가져오기 등 시스템 수준 설정을 관리하기 위한 gRPC 서비스 정의 |
| `proto/caret/account.proto` | f04-caret-account | Auth0 인증, 조직, 크레딧을 포함한 Caret 계정 시스템을 위한 gRPC 서비스와 메시지 정의 |
| `scripts/proto-utils.mjs` | f04, f08 | Caret 전용 서비스를 활성화하기 위해 `proto.caret` 패키지에서 gRPC 서비스를 로드하고 등록하도록 스크립트 수정 |
| `scripts/generate-protobus-setup.mjs` | f04, f08 | `proto/caret/` 디렉토리의 Caret 고유 gRPC 서비스(`PersonaService` 등)를 인식하여 클라이언트/서버 코드를 생성하도록 수정 |

### 📋 분석 완료된 백엔드(src) 파일 (44개)
| 파일 경로 | 관련 기능 | 수정 목적 (주석 내용 요약) |
|---|---|---|
| `src/core/context/instructions/user-instructions/external-rules.ts` | f05-rule-priority-system | 규칙 우선순위 시스템 구현 (.caretrules > .clinerules > .cursorrules > .windsurfrules) |
| `src/core/storage/state-keys.ts` | f05-rule-priority-system | Caret 전역 브랜드 모드 시스템 (Caret/Cline 구분) |
| `src/core/storage/utils/state-helpers.ts` | f05-rule-priority-system | 페르소나 기본값을 위한 기능 구성 임포트 |
| `src/core/storage/disk.ts` | f03, f05, f08 | 파일 경로에 대한 동적 브랜딩 구현 및 규칙 우선순위/페르소나 시스템 지원 |
| `src/core/controller/file/refreshRules.ts` | f05-rule-priority-system | 주석 없음 |
| `src/core/controller/caretAccount/getCaretOrganizationCredits.ts` | f04-caret-account | Caret 조직 크레딧 조회를 위한 gRPC 핸들러 |
| `src/core/controller/caretAccount/getCaretUserOrganizations.ts` | f04-caret-account | Caret 사용자 조직 조회를 위한 gRPC 핸들러 |
| `src/core/controller/caretAccount/getCaretUserCredits.ts` | f04-caret-account | Caret 사용자 크레딧 조회를 위한 gRPC 핸들러 |
| `src/core/controller/index.ts` | f11-input-history-system | 브랜드 설정 임포트 |
| `src/core/task/index.ts` | f05-rule-priority-system | 규칙 우선순위 시스템 (.caretrules > .clinerules > .cursorrules > .windsurfrules) |
| `src/core/prompts/system-prompt/index.ts` | f06-json-system-prompt | 듀얼 모드 지원을 위해 CaretGlobalManager와 PromptSystemManager 임포트 |
| `src/core/prompts/responses.ts` | f05-rule-priority-system | 효율성 향상을 위해 폴백 조건을 3회 연속 오류에서 2회로 변경 |
| `src/extension.ts` | f03-branding-ui | 이미지 주입 및 페르소나 초기화를 위해 CaretProviderWrapper 임포트 |
| `src/shared/api.ts` | f02-multilingual-i18n | Caret Google API 키 매핑 모델 |
| `src/services/account/CaretAccountService.ts` | f04-caret-account | Caret 계정 서비스 - ClineAccountService 기반 |
| `proto/cline/file.proto` | f05-rule-priority-system | Caret 규칙 토글 (활성화/비활성화) |
| `src/generated/grpc-js/cline/state.ts` | f07, f08, f11 | Caret 기능(페르소나, 모드, 기록)을 위한 프로토콜 확장 |
| `src/generated/nice-grpc/cline/state.ts` | f07, f08, f11 | Caret 기능(페르소나, 모드, 기록)을 위한 프로토콜 확장 |
| `src/core/storage/StateManager.ts` | f09 | 최신 Cline 아키텍처(HostProvider, Task Settings)를 적용하고 기능 구성 시스템과 통합 |
| `src/core/controller/file/toggleCaretRule.ts` | f05-rule-priority-system | 규칙 우선순위 시스템을 위해 Caret 전용 규칙 토글 기능 구현 |
| `src/core/controller/models/updateApiConfigurationProto.ts` | f04, f10 | API 구성 변경 디버깅을 위해 향상된 로깅 추가 |
| `src/core/controller/state/updateSettings.ts` | f07, f08, f11 | Caret 기능(페르소나, 모드, 기록)에 대한 상태 업데이트 로직을 추가하고 Cline의 최신 설정 아키텍처와 통합 |
| `src/core/controller/state/resetState.ts` | f08 | Cline의 상태 초기화 프로세스에 Caret 전용 초기화 로직(특히 페르소나 시스템용) 추가 |
| `src/core/controller/caretAccount/caretAccountLogoutClicked.ts` | f04-caret-account | Caret 계정 로그아웃을 위한 gRPC 핸들러 구현 |
| `src/core/controller/caretAccount/caretAuthStateChanged.ts` | f04-caret-account | Caret 계정 시스템의 실시간 인증 상태 변경을 처리하는 gRPC 핸들러 구현 |
| `src/core/controller/caretAccount/getCaretUserProfile.ts` | f04-caret-account | 현재 Caret 사용자의 프로필 정보를 가져오는 gRPC 핸들러 구현 |
| `src/core/controller/caretAccount/setCaretUserOrganization.ts` | f04-caret-account | 활성 Caret 조직을 설정하기 위한 gRPC 핸들러 구현 |
| `src/core/controller/caretAccount/caretAccountLoginClicked.ts` | f04-caret-account | `CaretGlobalManager`를 통해 Auth0 흐름을 시작하는 Caret 계정 로그인을 위한 gRPC 핸들러 구현 |
| `src/core/controller/caretAccount/subscribeToCaretAuthStatusUpdate.ts` | f04-caret-account | 실시간 Caret 인증 상태 업데이트를 구독하기 위한 gRPC 스트리밍 핸들러 구현 |
| `src/core/task/tools/handlers/BrowserToolHandler.ts` | `N/A` | 브라우저 액션 파라미터에 대한 상세 디버그 로깅을 추가하고, 단순 탐색 오류 시 브라우저가 닫히지 않도록 오류 처리 수정 |
| `src/core/api/providers/dify.ts` | `N/A` | Dify API 프로바이더 통합을 위해 TypeScript 컴파일 오류 수정 및 미사용 속성 제거 |
| `src/core/api/index.ts` | f04, f03 | B2B 브랜딩을 위해 환경 변수에 따라 `BrandedApiProvider`로 전환하는 로직 추가 및 관련 프로바이더 임포트 |
| `src/shared/ExtensionMessage.ts` | f03, f05, f08, f09, f11 | 여러 Caret 기능(브랜딩, 규칙 우선순위, 페르소나, 기능 구성, 입력 기록)을 지원하도록 ExtensionState 확장 |
| `src/shared/Languages.ts` | f02-multilingual-i18n | LLM 언어를 Caret 지원 UI 언어(ko, en, ja, zh-CN)에 매핑하기 위한 타입 및 유틸리티 함수 추가 |
| `src/shared/CaretAccount.ts` | f04-caret-account | Caret API 서버 명세에 따라 사용자, 조직, 사용량, 거래 내역을 포함한 Caret 계정 시스템의 모든 데이터 타입 정의 |
| `src/shared/proto/cline/state.ts` | f07, f08, f11 | Caret 기능(모드 시스템, 페르소나, 입력 기록)을 위한 필드를 포함하도록 `UpdateSettingsRequest` 프로토콜 버퍼 메시지 확장 |
| `src/shared/mcp.ts` | f03-branding-ui | B2B 브랜딩을 위한 별도의 마켓플레이스 뷰를 지원하기 위해 `McpViewTab` 타입에 'brandMarketplace' 추가 |
| `src/integrations/checkpoints/CheckpointUtils.ts` | f03-branding-ui | 브랜드 일관성을 위해 오류 메시지에서 "Cline"을 "Caret"으로 교체 |
| `src/integrations/checkpoints/CheckpointGitOperations.ts` | f03-branding-ui | 브랜드 일관성을 위해 체크포인트 커밋의 git 사용자 이름을 "Cline"에서 "Caret"으로 업데이트 |
| `src/integrations/terminal/TerminalRegistry.ts` | f03-branding-ui | 브랜드 일관성을 위해 새 터미널에 기본 VS Code 아이콘 대신 사용자 지정 Caret 아이콘 설정 |
| `src/integrations/notifications/index.ts` | f03-branding-ui | 브랜드 일관성을 위해 모든 시스템 알림에서 "Cline"을 "Caret"으로 교체 |
| `src/hosts/vscode/commit-message-generator.ts` | f03-branding-ui | 충돌 방지를 위해 VS Code 컨텍스트 키를 `cline.isGeneratingCommit`에서 `caret.isGeneratingCommit`으로 변경 |
| `src/hosts/vscode/VscodeDiffViewProvider.ts` | f03-branding-ui | 브랜드 일관성을 위해 diff 뷰 제목을 "Cline's Changes"에서 "Caret's Changes"로 업데이트 |
| `src/hosts/vscode/commandUtils.ts` | f03-branding-ui | 브랜드 일관성을 위해 채팅 입력 포커스 명령어를 `caret.focusChatInput`으로 하드코딩 |

### 📋 백엔드 파일 재분석 (컨플릭트 원인 중심) (22개)
| 파일 경로 | 관련 기능 | 수정 목적, 컨플릭트 및 원칙 위반 분석 |
|---|---|---|
| `scripts/generate-protobus-setup.mjs` | f08-persona-system, f07-chatbot-agent | **수정 목적**: Caret 고유 gRPC 서비스(`PersonaService`, `CaretSystemService`)를 빌드 시스템이 인식하도록 수정. **원칙 위반**: `CARET MODIFICATION` 주석은 있으나, 핵심 빌드 스크립트를 직접 수정하여 Level 2 침습 발생. 이는 Cline의 업데이트 시 병합 충돌 위험을 높임. **컨플릭트 원인**: Caret이 커스텀 서비스 처리를 위해 추가한 로직(네임스페이스, 임포트 경로)이 Cline의 코드 생성 로직 리팩토링 또는 기능 변경과 충돌함. |
| `scripts/proto-utils.mjs` | f04-caret-account, f08-persona-system | **수정 목적**: `proto.caret` 패키지에 정의된 Caret 전용 gRPC 서비스(계정, 페르소나 등)를 로드하도록 시스템 확장. **원칙 위반**: `CARET MODIFICATION` 주석은 있으나, 핵심 유틸리티 스크립트를 직접 수정하여 Level 2 침습 발생. **컨플릭트 원인**: Caret이 `loadServicesFromProtoDescriptor` 함수 끝에 `proto.caret` 처리 로직을 추가했는데, Cline에서 동일 함수를 리팩토링하거나 다른 로직을 추가하면서 변경점이 충돌함. |
| `scripts/report-issue.js` | f03-branding-ui | **수정 목적**: (추정) 이슈 리포팅 URL을 Caret의 GitHub 리포지토리로 변경하기 위함. **원칙 위반**: 주석 없이 수정 목록에 포함됨. 실제 로직 변경은 없으나, git diff 상 변경이 감지됨. 브랜딩을 위해 수정했다면 주석 누락이 원칙 위반임. **컨플릭트 원인**: Caret 측의 비-기능적 변경(포맷팅 등)과 Cline 측의 스크립트 기능 개선이 겹치면서 충돌했을 가능성이 높음. |
| `src/core/api/providers/vercel-ai-gateway.ts` | f03-branding-ui | **수정 목적**: (필요) `defaultHeaders`에 하드코딩된 "Cline" 관련 값을 Caret 브랜딩에 맞게 수정해야 함. **원칙 위반**: 주석 없이 수정 목록에 포함됨. 실제 로직 수정은 없었으나, 하드코딩된 값을 직접 수정하는 것은 Level 2 침습에 해당하며 주석이 필요함. **컨플릭트 원인**: Caret의 포맷팅 등 비-기능적 변경과 Cline의 Vercel 연동 로직 업데이트가 `ensureClient` 메소드 내에서 충돌했을 가능성이 높음. |
| `src/core/api/providers/vscode-lm.ts` | f03-branding-ui, f01-common-util | **수정 목적**: VS Code 내장 LM API 사용 시 로그, 사용자 요청 등에 'Caret' 브랜딩을 적용하고, 메시지 정제 유틸리티를 추가함. **원칙 위반**: 주석 없이 핵심 프로바이더 파일을 직접 수정함. 브랜딩 문자열과 유틸리티 함수를 `caret-src`로 분리하지 않고 하드코딩하여 Level 2 침습 원칙을 위반함. **컨플릭트 원인**: Caret이 추가한 브랜딩 및 유틸리티 로직이 Cline의 핵심 LM API 연동 로직 변경(예: `createMessage` 함수 리팩토링)과 충돌함. |
| `src/core/api/transform/openrouter-stream.ts` | f10-enhanced-provider-setup, f06-json-system-prompt | **수정 목적**: OpenRouter를 통해 특정 모델(Claude, Kimi 등)을 사용할 때 모델별 최적화 파라미터(`cache_control`, `reasoning` 등)를 동적으로 추가하여 성능을 향상. **원칙 위반**: 주석 없이 핵심 API 변환 로직을 직접 수정함. 모델별 설정을 외부화하지 않고 `switch` 문에 하드코딩하여 Level 2 침습 원칙을 위반함. **컨플릭트 원인**: Caret과 Cline 양쪽에서 빠르게 변화하는 모델 지원을 위해 동일한 함수의 모델 분기 로직을 경쟁적으로 수정하면서 충돌 발생. |
| `src/core/api/transform/vercel-ai-gateway-stream.ts` | f10-enhanced-provider-setup | **수정 목적**: Vercel AI Gateway를 통해 Anthropic 모델 사용 시, 프롬프트 캐싱(`cache_control`)을 활성화하여 성능 및 비용을 최적화. **원칙 위반**: 주석 없이 핵심 API 변환 로직을 직접 수정함. 모델별 처리 로직을 하드코딩하여 Level 2 침습 원칙을 위반함. **컨플릭트 원인**: Caret이 Anthropic 모델 캐싱 로직을 추가하는 동안, Cline에서 다른 모델에 대한 처리 로직을 동일 함수에 추가하거나 리팩토링하면서 충돌 발생. |
| `src/core/context/instructions/user-instructions/external-rules.ts` | f05-rule-priority-system | **수정 목적**: `.caretrules`를 도입하고, 여러 규칙 소스 간의 우선순위(`.caretrules` > `.clinerules` 등)를 적용. **원칙 위반**: `CARET MODIFICATION` 주석은 있으나, 규칙 처리 핵심 함수(`refreshExternalRulesToggles`)의 로직을 거의 재작성하여 Level 2 침습 범위를 넘어섬. **컨플릭트 원인**: Caret이 규칙 우선순위 시스템을 위해 핵심 로직을 변경하는 동안, Cline에서도 규칙 관리 시스템을 개선/리팩토링하면서 광범위한 충돌이 발생함. |
| `src/core/prompts/system-prompt-legacy/families/next-gen-models/gpt-5.ts` | f03-branding-ui, f06-json-system-prompt | **수정 목적**: 새로운 모델(gpt-5) 테스트를 위한 레거시 시스템 프롬프트 추가. **원칙 위반**: 주석 없이 Cline 원본 디렉토리(`src/`)에 Caret의 실험적인 파일을 추가함. `caret-src/`에 위치해야 할 파일이 잘못 위치하여 Level 2 침습 원칙을 위반함. **컨플릭트 원인**: Caret이 추가한 실험적 파일이 Cline의 레거시 프롬프트 시스템 리팩토링 작업과 충돌했거나, 동일 경로에 다른 파일이 추가되면서 충돌 발생. |
| `src/core/prompts/system-prompt/registry/PromptRegistry.ts` | f06-json-system-prompt, f07-chatbot-agent | **수정 목적**: Caret/Cline 듀얼 프롬프트 모드 전환 시, 현재 어떤 시스템이 동작하는지 명확히 추적하기 위한 디버깅 로그 추가. **원칙 위반**: 주석 없이 핵심 클래스(`PromptRegistry`)의 메소드(`get`) 내부에 직접 코드를 추가하여 Level 2 침습 원칙을 위반함. **컨플릭트 원인**: Caret이 디버깅 로그를 추가한 `get` 메소드를 Cline에서도 성능 개선 등의 이유로 리팩토링하면서 코드 변경점이 충돌함. |
| `src/core/prompts/system-prompt/variants/gpt-5/template.ts` | f06-json-system-prompt, f07-chatbot-agent | **수정 목적**: `yoloMode`와 같은 동적 컨텍스트에 따라 시스템 프롬프트의 규칙 부분을 변경하는 템플릿 추가. **원칙 위반**: 주석 없이 Cline 원본 디렉토리에 Caret의 실험적인 프롬프트 템플릿 파일을 추가함. `caret-src`에 위치해야 할 파일이 잘못 위치하여 Level 2 침습 원칙을 위반함. **컨플릭트 원인**: Caret이 추가한 실험적 파일이 Cline의 프롬프트 시스템 리팩토링(디렉토리 구조 변경 등)과 충돌했을 가능성이 높음. |
| `src/core/prompts/system-prompt/variants/next-gen/template.ts` | f06-json-system-prompt, f07-chatbot-agent | **수정 목적**: `yoloMode` 활성화 여부에 따라 AI 에이전트의 행동 규칙(질문 여부 등)을 동적으로 변경하는 로직을 프롬프트 템플릿에 추가. **원칙 위반**: 주석 없이 핵심 프롬프트 템플릿을 직접 수정함. Caret 고유의 동적 로직을 추가하기 위해 원본 파일을 변경하여 Level 2 침습 원칙을 위반함. **컨플릭트 원인**: Caret이 `yoloMode`를 위해 규칙을 수정하는 동안, Cline에서도 프롬프트 엔지니어링을 위해 동일한 규칙 부분을 수정하면서 내용이 충돌함. |
| `src/core/storage/state-keys.ts` | f03, f04, f05, f07, f08, f11 | **수정 목적**: Caret의 주요 기능(브랜딩 모드, 계정, 규칙, 페르소나, 입력 기록 등)을 위한 상태 및 비밀 값 키를 `Settings`, `Secrets` 인터페이스에 추가. **원칙 위반**: 주석이 일부 있지만, 타입스크립트의 인터페이스 병합을 사용하지 않고 핵심 상태 정의 파일을 직접 수정하여 Level 2 침습 원칙을 명백히 위반함. **컨플릭트 원인**: 파일에 병합 충돌 마커가 명확히 남아있음. Caret과 Cline 양쪽에서 각자의 신규 기능(Caret: 페르소나 등, Cline: OCA 등)을 위해 동일한 인터페이스(`Settings`, `Secrets`)의 동일한 위치에 속성을 추가하면서 충돌 발생. |
| `src/core/prompts/system-prompt/index.ts` | f06-json-system-prompt, f07-chatbot-agent | **수정 목적**: 'Caret 모드'와 'Cline 모드'에 따라 각기 다른 시스템 프롬프트(Caret의 JSON 기반 vs Cline의 레거시)를 사용하도록 분기 처리. **원칙 위반**: `CARET MODIFICATION` 주석은 있으나, 시스템 프롬프트 로딩의 핵심 진입점인 `getSystemPrompt` 함수를 완전히 대체하여 Level 2 침습의 위험도가 매우 높음. **컨플릭트 원인**: 파일에 병합 충돌 마커가 명확히 남아있음. Caret이 모드 전환을 위해 함수 전체를 변경하는 동안, Cline은 모델 계열 식별 로직을 개선하기 위해 동일 함수와 임포트 구문을 수정하면서 직접적인 충돌 발생. |
| `src/core/prompts/system-prompt/tools/attempt_completion.ts` | f06-json-system-prompt | **수정 목적**: `task_progress` 파라미터의 명세를 수정하여 JSON 동적 프롬프트 시스템과의 연동을 강화. **원칙 위반**: 주석 없이 핵심 도구 명세 파일을 직접 수정하여 Level 2 침습 원칙을 위반함. **컨플릭트 원인**: Caret과 Cline 양쪽에서 `attempt_completion` 도구의 파라미터와 설명을 각자의 기능 개선을 위해 수정하면서 충돌 발생. |
| `src/core/prompts/system-prompt/types.ts` | f05-rule-priority-system, f06-json-system-prompt | **수정 목적**: 다중 규칙 우선순위 시스템을 위해 `SystemPromptContext`에 `.cursorrules` 등 다른 규칙 관련 속성을 추가하고, `task_progress` 파라미터를 표준화. **원칙 위반**: 주석 없이 핵심 타입 정의 파일(`SystemPromptContext`)을 직접 확장함. 타입 확장은 `caret-src`에서 수행하는 것이 바람직했으므로 Level 2 침습 원칙 위반. **컨플릭트 원인**: Caret과 Cline 양쪽에서 각자의 새로운 기능을 지원하기 위해 동일한 핵심 인터페이스(`SystemPromptContext`)를 동시에 확장하면서 충돌 발생. |
| `src/core/storage/state-migrations.ts` | f04-caret-account, f09-feature-config-system | **수정 목적**: Caret 계정(`caretApiKey` 등) 관련 상태 키를 레거시 설정에서 새로운 모드별 설정으로 마이그레이션하는 로직 추가. **원칙 위반**: 주석이 일부 누락되었으며, 핵심 마이그레이션 로직에 Caret 전용 코드를 직접 추가하여 Level 2 침습 원칙을 위반함. **컨플릭트 원인**: 파일에 병합 충돌 마커가 명확히 남아있음. Caret과 Cline 양쪽에서 각자의 신규 기능(Caret: 계정, Cline: OCA)을 위해 동일한 마이그레이션 함수(`migrateWelcomeViewCompleted`)의 동일한 배열에 키를 추가하면서 충돌 발생. |
| `src/hosts/host-provider.ts` | N/A | **수정 목적**: 이 파일 자체에는 수정 사항이 없음. **원칙 위반**: 주석 없이 수정 목록에 포함됨. 실제 로직 변경은 없으나 git diff에 감지됨. **컨플릭트 원인**: Caret 측의 비-기능적 변경(포맷팅 등)과 Cline 측의 핵심 아키텍처 변경(예: `initialize` 메소드 시그니처 변경)이 겹치면서 충돌했을 가능성이 높음. |
| `src/integrations/misc/extract-text.ts` | f01-common-util | **수정 목적**: `.xlsx`(Excel) 파일에서 텍스트를 추출하는 기능을 추가하여 AI의 컨텍스트 활용 범위를 확장. **원칙 위반**: 주석 없이 핵심 유틸리티 파일에 새로운 파일 형식 지원 로직을 직접 추가하여 Level 2 침습 원칙을 위반함. **컨플릭트 원인**: Caret이 `.xlsx` 지원을 추가하는 동안, Cline에서도 다른 파일 형식 지원을 추가하거나 기존 텍스트 추출 로직을 리팩토링하면서 동일 파일 내 `switch` 문 등에서 충돌 발생. |
| `src/shared/proto-conversions/models/api-configuration-conversion.ts` | f04-caret-account | **수정 목적**: Caret API 프로바이더와 모델 정보(`CaretModelInfo`)를 Protobuf 메시지와 상호 변환하는 로직 추가. **원칙 위반**: 주석 없이 핵심 데이터 변환 파일에 직접 코드를 추가하여 Level 2 침습 원칙을 위반함. **컨플릭트 원인**: 파일에 병합 충돌 마커가 명확히 남아있음. Caret과 Cline 양쪽에서 각자의 신규 프로바이더(Caret vs OCA)를 지원하기 위해 동일한 파일의 동일한 위치에 각자의 모델 정보 변환 함수를 추가하면서 충돌 발생. |
| `src/integrations/editor/detect-omission.ts` | f03-branding-ui, f01-common-util | **수정 목적**: AI 코드 생성 생략 감지 시, 사용자에게 보여주는 도움말 URL을 Caret의 Wiki 페이지로 연결. **원칙 위반**: 주석 없이 핵심 유틸리티 파일을 직접 수정함. URL을 `caret-src`로 분리하지 않고 하드코딩하여 Level 2 침습 원칙을 위반함. **컨플릭트 원인**: Caret이 도움말 URL을 변경하는 동안, Cline에서도 동일한 URL이나 경고 메시지 텍스트를 수정하면서 내용이 충돌함. |
| `src/standalone/vscode-context.ts` | N/A | **수정 목적**: VS Code Language Model API 호환성을 위해 모의 `extensionContext` 객체에 누락된 `languageModelAccessInformation` 속성을 추가. **원칙 위반**: 주석 없이 핵심 모의 객체 생성 로직을 직접 수정하여 Level 2 침습 원칙을 위반함. **컨플릭트 원인**: 파일에 병합 충돌 마커가 명확히 남아있음. Caret이 API 호환성을 위해 속성을 추가하는 동안, Cline은 워크스페이스별 상태 분리를 위해 `extensionContext` 생성 로직 전체를 리팩토링하면서 충돌 발생. |

## 📋 분석 완료된 프론트엔드 파일 (16개)

자동 및 수동 분석을 통해 기능 매핑이 완료된 파일 목록입니다.

| 파일 경로 | 관련 기능 | 수정 목적 (주석 내용 요약) |
|---|---|---|
| `webview-ui/src/context/ExtensionStateContext.tsx` | f01-common-util | Caret 전역 브랜드 모드 시스템 타입과 유틸리티 임포트 (caret-src에서) |
| `webview-ui/src/components/settings/providers/LiteLlmProvider.tsx` | f10-enhanced-provider-setup | 모델 조회를 위한 로컬 상태 |
| `webview-ui/src/components/cline-rules/ClineRulesToggleModal.tsx` | f05-rule-priority-system | 페르소나 시스템 연동을 위해 PersonaManagement 임포트 |
| `webview-ui/src/components/chat/ChatTextArea.tsx` | f11-input-history-system | 입력 기록 유지 기능 - 화살표 키 탐색 처리를 위한 훅 |
| `webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx` | f11-input-history-system | 주석 없음 |
| `webview-ui/src/components/chat/ChatRow.tsx` | f08-persona-system | 페르소나 시스템을 위한 PersonaAvatar 임포트 |
| `webview-ui/src/components/chat/ChatView.tsx` | f11-input-history-system | 입력 기록 유지 기능 |
| `webview-ui/src/components/account/AccountView.tsx` | f04-caret-account | Caret 계정 시스템을 위해 CaretUser와 useExtensionState 임포트 |
| `webview-ui/src/caret/context/CaretI18nContext.tsx` | f02-multilingual-i18n | Caret i18n 시스템을 위한 컨텍스트 프로바이더 |
| `webview-ui/src/caret/utils/urls.ts` | f01-common-util | Caret URL 상수 및 헬퍼 |
| `webview-ui/src/caret/utils/i18n.ts` | f02-multilingual-i18n | 성능 모니터링 통합 |
| `webview-ui/src/caret/utils/CaretWebviewLogger.ts` | f01-common-util | 안전 검사를 포함한 웹뷰 로깅 시스템 |
| `webview-ui/src/caret/components/CaretAccountInfoCard.tsx` | f04-caret-account | Caret 계정 정보 카드 - 설정 연동용 |
| `webview-ui/src/caret/components/CaretAccountView.tsx` | f04-caret-account | Caret 계정 뷰 컴포넌트 - ClineAccountView 대체 |
| `webview-ui/src/caret/hooks/usePersistentInputHistory.ts` | f11-input-history-system | gRPC를 사용한 입력 기록 유지 훅 |
| `webview-ui/src/caret/hooks/useCaretI18n.ts` | f02-multilingual-i18n | 컨텍스트 통합 및 지연 로딩을 포함한 완전한 useCaretI18n 훅 |

---

## 🤖 추가 분석 필요 파일

다음 파일들은 기능 명세에 직접 언급되지 않아 수동 분석이 필요합니다.
수정 목적은 caret-docs/features/index.mdx 문서를 참고합니다.

### 백엔드 (49개)
1. `src/common.ts`
2. `src/core/api/providers/cline.ts`
3. `src/core/api/providers/doubao.ts`
4. `src/core/api/providers/fireworks.ts`
5. `src/core/api/providers/litellm.ts`
6. `src/core/api/providers/lmstudio.ts`
7. `src/core/api/providers/openai.ts`
8. `src/core/api/providers/openrouter.ts`
9. `src/core/api/providers/qwen.ts`
10. `src/core/api/providers/requesty.ts`
11. `src/core/api/providers/xai.ts`
12. `src/core/controller/file/toggleWindsurfRule.ts`
13. `src/core/controller/models/getSapAiCoreModels.ts`
14. `src/core/controller/models/refreshOpenRouterModels.ts`
15. `src/core/prompts/commands.ts`
16. `src/core/prompts/loadMcpDocumentation.ts`
17. `src/core/prompts/system-prompt/__tests__/integration.test.ts`
18. `src/core/storage/utils/state-helpers.ts`
19. `src/core/task/tools/handlers/AccessMcpResourceHandler.ts`
20. `src/core/task/tools/handlers/CondenseHandler.ts`
21. `src/core/task/tools/handlers/ExecuteCommandToolHandler.ts`
22. `src/core/task/tools/handlers/ListCodeDefinitionNamesToolHandler.ts`
23. `src/core/task/tools/handlers/ListFilesToolHandler.ts`
24. `src/core/task/tools/handlers/NewTaskHandler.ts`
25. `src/core/task/tools/handlers/ReadFileToolHandler.ts`
26. `src/core/task/tools/handlers/ReportBugHandler.ts`
27. `src/core/task/tools/handlers/SearchFilesToolHandler.ts`
28. `src/core/task/tools/handlers/UseMcpToolHandler.ts`
29. `src/core/task/tools/handlers/WebFetchToolHandler.ts`
30. `src/core/task/tools/handlers/WriteToFileToolHandler.ts`
31. `src/core/task/tools/utils/ToolConstants.ts`
32. `src/core/webview/WebviewProvider.ts`
33. `src/dev/commands/tasks.ts`
34. `src/hosts/vscode/VscodeWebviewProvider.ts`
35. `src/hosts/vscode/hostbridge/workspace/openClineSidebarPanel.ts`
36. `src/integrations/terminal/TerminalManager.ts`
37. `src/integrations/terminal/TerminalProcess.test.ts`
38. `src/services/browser/BrowserSession.ts`
39. `src/services/browser/UrlContentFetcher.ts`
40. `src/services/mcp/McpHub.ts`
41. `src/services/test/TestServer.ts`
42. `src/services/uri/SharedUriHandler.ts`
43. `src/test/e2e/auth.test.ts`
44. `src/test/e2e/chat.test.ts`
45. `src/test/e2e/diff.test.ts`
46. `src/test/e2e/editor.test.ts`
47. `src/test/e2e/fixtures/server/api.ts`
48. `src/test/e2e/utils/common.ts`
49. `src/test/e2e/utils/helpers.ts`

### 프론트엔드 (33개)
 * 프론트 엔드 분석은 프론트엔드 머징을 진행할때 추가 분석 필요를 확인 후 진행, 프론트엔드는 i18n때문에 거의 모든 영역에 걸쳐 있으므로 달리 고민필요함,위의 분석 내용과 중복 여부는 확인하지 않았음
1. `webview-ui/vite.config.ts`
2. `webview-ui/src/App.tsx`
3. `webview-ui/src/context/__tests__/CaretGlobalManager-manual-test.md`
4. `webview-ui/src/components/settings/sections/GeneralSettingsSection.tsx`
5. `webview-ui/src/components/settings/SettingsView.tsx`
6. `webview-ui/src/components/settings/utils/useApiConfigurationHandlers.ts`
7. `webview-ui/src/components/settings/ApiOptions.tsx`
8. `webview-ui/src/components/settings/common/ApiKeyField.tsx`
9. `webview-ui/src/components/settings/PreferredLanguageSetting.tsx`
10. `webview-ui/src/components/chat/auto-approve-menu/AutoApproveBar.tsx`
11. `webview-ui/src/components/chat/auto-approve-menu/AutoApproveModal.tsx`
12. `webview-ui/src/components/chat/chat-view/components/layout/ActionButtons.tsx`
13. `webview-ui/src/components/chat/ChatRow.tsx.backup`
14. `webview-ui/src/components/mcp/configuration/tabs/add-server/AddLocalServerForm.tsx`
15. `webview-ui/src/components/mcp/configuration/McpConfigurationView.tsx`
16. `webview-ui/src/components/welcome/WelcomeView.tsx.cline`
17. `webview-ui/src/components/welcome/HomeHeader.tsx`
18. `webview-ui/src/components/welcome/WelcomeView.tsx`
19. `webview-ui/src/components/account/AccountWelcomeView.tsx`
20. `webview-ui/src/caret/context/CaretStateContext.tsx`
21. `webview-ui/src/caret/constants/urls.ts`
22. `webview-ui/src/caret/utils/lazy-i18n.ts`
23. `webview-ui/src/caret/utils/i18n-performance.ts`
24. `webview-ui/src/caret/utils/brand-utils.ts`
25. `webview-ui/src/caret/utils/__tests__/i18n.test.ts`
26. `webview-ui/src/caret/components/PersonaManagement.tsx`
27. `webview-ui/src/caret/components/ModeSystemToggle.tsx`
28. `webview-ui/src/caret/components/PersonaAvatar.tsx`
29. `webview-ui/src/caret/components/UnifiedLanguageSetting.tsx`
30. `webview-ui/src/caret/components/CaretGeneralSettingsSection.tsx`
31. `webview-ui/src/caret/hooks/__tests__/useCaretI18n.test.tsx`
32. `webview-ui/src/caret/services/CaretApiMockServer.ts`
33. `webview-ui/src/caret/services/CaretGrpcClient.ts`
