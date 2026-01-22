# Cline Latest Merge Analysis Report

## 📋 개요

**분석 대상**: main → upstream/main (Cline v3.49.0 이후 최신)
**분석 날짜**: 2025-01-14
**분석 목적**: upstream의 최신 변경 사항을 분석하고 Careti에 체리픽 머징할 대상을 식별

## 📊 변경 통계

- **총 커밋 수**: 50+ 개
- **변경 파일 수**: 2,055 개
- **코드 변경량**: ~10,000+ 라인 추가/삭제

## 🔍 주요 변경 사항 카테고리

### 1. Skills 시스템 (우선순위: 높음)

**관련 커밋**:
- `2ebbe954d` - feat(skills): Implement Skills system for reusable agent instructions
- `050773ac3` - feat(skills): add Skills tab UI for managing skill toggles
- `46aa66ed9` - feat: add skillsEnabled setting to gate Skills feature
- `38f619cfd` - docs(skills): add Skills feature documentation
- `efe468d9b` - Add telemetry for skills feature

**변경 파일**:
```
src/core/context/instructions/user-instructions/skills.ts (新增)
src/core/context/instructions/user-instructions/__tests__/skills.test.ts (新增)
src/core/prompts/system-prompt/components/skills.ts (新增)
src/core/prompts/system-prompt/tools/use_skill.ts (新增)
src/core/task/tools/handlers/UseSkillToolHandler.ts (新增)
src/shared/skills.ts (新增)
src/core/storage/disk.ts (수정 - getClineHomePath() 추가)
```

**기능 설명**:
- 재사용 가능한 AI 에이전트 인스트럭션 시스템
- 프로젝트 및 글로벌 디렉토리(~/.cline/skills)에서 스킬 발견 및 로드
- YAML 프론트매터를 통한 스킬 메타데이터 파싱
- use_skill 툴을 통한 온디맨드 인스트럭션 로드
- 스킬 활성화/비활성화 토글 UI

**Careti 영향도 분석**:
- ✅ **추천 체리픽**: Skills 시스템은 Careti의 agent 개선에 유용
- ⚠️ **충돌 가능성**: Careti의 프롬프트 시스템과 통합 필요
- 🔧 **수정 필요**: `.cline/skills` → `.careti/skills`로 경로 변경

### 2. Hooks 시스템 (우선순위: 높음)

**관련 커밋**:
- `6f8ed7aa5` - Display simple indicator for hooks in the CLI

**변경 파일**:
```
src/core/hooks/HookDiscoveryCache.ts (新增)
src/core/hooks/HookProcess.ts (新增)
src/core/hooks/__tests__/ (새 테스트 디렉토리)
proto/cline/hooks.proto (수정)
cli/pkg/cli/display/hook_renderer.go (新增)
cli/pkg/cli/handlers/say_handlers_hooks.go (新增)
docs/features/hooks/ (새 문서 디렉토리)
```

**기능 설명**:
- 태스크 수명주기에서 실행되는 훅(Hook) 시스템
- TaskComplete, TaskStart 등의 이벤트 훅 지원
- CLI에서 훅 실행 상태 표시
- 쉘 이스케이프 보안 처리

**Careti 영향도 분석**:
- ✅ **추천 체리픽**: 태스크 추적 및 모니터링에 유용
- ⚠️ **충돌 가능성**: Careti의 custom task flow와 통합 필요
- 🔧 **수정 필요**: `.cline/hooks` → `.careti/hooks`로 경로 변경

### 3. Chat Streaming UI 리팩터링 (우선순위: 중간)

**관련 커밋**:
- `9603643b7` - refactor: Chat Streaming UI (#8264)

**변경 파일**:
```
webview-ui/src/components/chat/ChatRow.tsx (대규모 리팩터링)
webview-ui/src/components/chat/CompletionOutputRow.tsx (新增)
webview-ui/src/components/chat/CommandOutputRow.tsx (新增)
webview-ui/src/components/chat/DiffEditRow.tsx (수정)
webview-ui/src/components/chat/ThinkingRow.tsx (新增)
webview-ui/src/components/chat/TypewriterText.tsx (新增)
webview-ui/src/components/chat/chat-view/components/messages/ToolGroupRenderer.tsx (新增)
webview-ui/src/components/chat/chat-view/utils/messageUtils.ts (대규모 수정)
webview-ui/src/assets/ClineCompactIcon.tsx (新增)
```

**기능 설명**:
- VSCode codicons → Lucide React icons로 마이그레이션
- ChatRow 컴포넌트 재구성 및 스타일링 개선
- 도구 실행 그룹화(Tool Group) 기능 추가
- Thinking/Reasoning 콘텐츠 표시 개선
- TypewriterText 컴포넌트 추가 (타이핑 효과)
- Task 완료 상태 UI 개선

**Careti 영향도 분석**:
- ⚠️ **신중한 체리픽**: Careti의 브랜딩 UI와 충돌 가능
- 🎨 **수정 필요**: Cline 아이콘 → Careti 아이콘으로 변경
- 📊 **영향 범위**: 웹뷰 UI 전반에 영향

### 4. MCP (Model Context Protocol) 개선 (우선순위: 높음)

**관련 커밋**:
- `ea1dbd8be` - feat: When remote config is enabled, add logic for enterprise to control local MCPs via remote config
- `0671c59e6` - feat(mcp): improve image display in MCP responses
- `bf8788750` - feat: Auto-sync remote MCP servers from remote config to local settings
- `82b1a0164` - Adds mcp server support
- `489ee936c` - feat: UI changes for remote configured MCP servers
- `46ab08c9f` - fix(mcp): handle 404 responses from streamableHttp servers
- `7b62d7786` - fix(ui): MCP server UI improvements

**변경 파일**:
```
src/core/storage/remote-config/syncRemoteMcpServers.ts (新增)
src/core/controller/models/refreshLiteLlmModels.ts (수정)
src/core/controller/models/refreshLiteLlmModelsRpc.ts (수정)
src/core/controller/models/subscribeToLiteLlmModels.ts (수정)
webview-ui/src/components/settings/providers/ (다수 수정)
```

**기능 설명**:
- Remote config에서 MCP 서버 자동 동기화
- MCP 응답에서 이미지 디스플레이 개선
- Streamable HTTP 서버의 404 응답 처리 개선
- Enterprise용 MCP 제어 기능 추가

**Careti 영향도 분석**:
- ✅ **추천 체리픽**: Careti의 MCP 통합 개선에 도움
- ⚠️ **주의 사항**: Enterprise 기능은 Careti에 적용 안 될 수 있음

### 5. BannerService 통합 (우선순위: 낮음)

**관련 커밋**:
- `a44298374` - Integrate the `BannerService` with the webview
- `eee64c520` - Remove unused react banners
- `8f1405b88` - fix(ui): improve banner carousel styling and dismiss functionality

**변경 파일**:
```
src/shared/cline/banner.ts (新增)
webview-ui/src/components/common/BannerCarousel.tsx (수정)
webview-ui/src/components/common/PopupModalContainer.tsx (수정)
webview-ui/src/components/common/ScreenReaderAnnounce.tsx (수정)
webview-ui/src/components/common/WhatsNewModal.tsx (新增)
webview-ui/src/utils/bannerUtils.tsx (新增)
```

**기능 설명**:
- 웹뷰에 BannerService 통합
- 배너 캐러셀 스타일링 및 해제 기능 개선
- 새로운 기능 알림 모달 추가

**Careti 영향도 분석**:
- ⏸️ **보류**: 마케팅 기능으로 Careti에 우선순위 낮음
- 🎨 **추후 고려**: 배너 콘텐츠 Careti 브랜딩으로 변경 필요

### 6. LiteLLM 개선 (우선순위: 중간)

**관련 커밋**:
- `cc0d4ae6c` - [PF-392] Fix LiteLLM model selection
- `6d1890f8b` - fix: litellm - trigger model fetching with default base URL

**변경 파일**:
```
src/core/api/providers/litellm.ts (수정)
src/core/controller/models/refreshLiteLlmModels.ts (수정)
```

**기능 설명**:
- LiteLLM 모델 선택 버그 수정
- 기본 base URL에서 모델 가져오기 트리거

**Careti 영향도 분석**:
- ✅ **추천 체리픽**: 버그 수정으로 안정성 향상

### 7. 인증 및 보안 개선 (우선순위: 높음)

**관련 커밋**:
- `11d17fc17` - Fix auth state loop
- `42a3dc615` - Prevent requests with an expired auth token
- `748ba99c1` - Remove the IAuthProvider
- `f2c130a69` - Prevent using expired tokens when making authenticated requests
- `aed3ac659` - Use the same font for the auth handler redirect as the dashboard

**변경 파일**:
```
src/core/api/ (다수 수정)
src/shared/ (인증 관련 수정)
```

**기능 설명**:
- 인증 상태 루프 버그 수정
- 만료된 토큰으로 요청 방지
- IAuthProvider 인터페이스 제거 및 리팩터링
- 인증 핸들러 리다이렉트 폰트 통일

**Careti 영향도 분석**:
- ✅ **우선 체리픽**: 보안 관련 버그 수정

### 8. Explain Changes 기능 (우선순위: 중간)

**관련 커밋**:
- 여러 커밋에서 Explain Changes 기능 추가

**변경 파일**:
```
src/core/controller/task/explainChanges.ts (新增)
src/core/controller/task/explainChangesShared.ts (新增)
src/core/prompts/system-prompt/tools/generate_explanation.ts (新增)
src/core/task/tools/handlers/GenerateExplanationToolHandler.ts (新增)
webview-ui/src/components/chat/chat-view/components/messages/ToolGroupRenderer.tsx (수정)
```

**기능 설명**:
- 변경 사항 설명 기능 추가
- generate_explanation 툴 구현

**Careti 영향도 분석**:
- ✅ **추천 체리픽**: 사용자 경험 개선

### 9. Remote Config 확장 (우선순위: 중간)

**관련 커밋**:
- `ea1dbd8be` - feat: When remote config is enabled, add logic for enterprise to control local MCPs via remote config
- `4032e51e8` - Allow admins and owners to override remote config
- `2a48bad28` - feat: [extensions] remotely configure whether enterprise users can disable a remote MCP server or not

**기능 설명**:
- Remote config 기능 확장
- Enterprise용 제어 기능 추가

**Careti 영향도 분석**:
- ⚠️ **선택적 체리픽**: Enterprise 기능은 Careti에 적용 안 될 수 있음

### 10. UI/UX 다양한 개선 (우선순위: 낮음~중간)

**관련 커밋**:
- `7470d234e` - feat: add image support for Claude 3.5 Haiku
- `21b81f184` - fix: close context menu when pressing Escape key
- `09cb9ac9a` - fix: make workflow slash command search case-insensitive
- `d422ebbb2` - Revert "fix: normalize file paths with spaces before extensions from VS Code LM API"
- `362429a31` - fix: normalize file paths with spaces before extensions from VS Code LM API

**기능 설명**:
- Claude 3.5 Haiku 이미지 지원
- Escape 키로 컨텍스트 메뉴 닫기
- 워크플로우 슬래시 명령 대소문자 구분 없이 검색
- 파일 경로 정규화 관련 수정

**Careti 영향도 분석**:
- ✅ **추천 체리픽**: UX 개선

## 🎯 체리픽 머징 우선순위

### 우선순위 1 (즉시 체리픽)
1. **인증/보안 버그 수정**
   - `11d17fc17` - Fix auth state loop
   - `42a3dc615` - Prevent requests with an expired auth token
   - `f2c130a69` - Prevent using expired tokens

2. **LiteLLM 버그 수정**
   - `cc0d4ae6c` - Fix LiteLLM model selection
   - `6d1890f8b` - fix: litellm - trigger model fetching with default base URL

### 우선순위 2 (조기 체리픽)
1. **Skills 시스템**
   - `2ebbe954d` - Implement Skills system
   - `050773ac3` - Skills tab UI
   - `46aa66ed9` - skillsEnabled setting
   - 주요 파일: `skills.ts`, `UseSkillToolHandler.ts`

2. **MCP 개선**
   - `0671c59e6` - improve image display in MCP responses
   - `46ab08c9f` - handle 404 responses from streamableHttp servers
   - `7b62d7786` - MCP server UI improvements

3. **Hooks 시스템**
   - `HookProcess.ts`, `HookDiscoveryCache.ts`
   - CLI hook rendering

### 우선순위 3 (검토 후 체리픽)
1. **Explain Changes 기능**
   - `explainChanges.ts`, `GenerateExplanationToolHandler.ts`

2. **UI/UX 개선**
   - Escape 키 컨텍스트 메뉴 닫기
   - 대소문자 구분 없는 검색

3. **Chat Streaming UI 리팩터링**
   - ⚠️ 신중한 통합 필요
   - Careti 브랜딩과 충돌 가능

### 우선순위 4 (보류/제외)
1. **BannerService**
   - 마케팅 기능으로 우선순위 낮음

2. **Remote Config Enterprise 기능**
   - Careti에 적용 안 됨

## 🔧 Careti 통합 가이드

### Skills 시스템 통합 시 수정 사항

1. **경로 변경**:
   ```typescript
   // Before
   const clineSkillsPath = path.join(getClineHomePath(), "skills");

   // After (Careti)
   const caretSkillsPath = path.join(getCaretHomePath(), "skills");
   ```

2. **브랜딩 수정**:
   - "Cline" → "Careti"으로 변경
   - 시스템 프롬프트에 Skills 설명 추가 시 Careti 컨텍스트에 맞게 수정

### Hooks 시스템 통합 시 수정 사항

1. **경로 변경**:
   ```typescript
   // Before
   const clineHooksPath = path.join(getClineHomePath(), "hooks");

   // After (Careti)
   const caretHooksPath = path.join(getCaretHomePath(), "hooks");
   ```

2. **프로토 파일 수정**:
   - `proto/cline/hooks.proto` → `proto/careti/hooks.proto`
   - Careti 템플릿 캐릭터에 맞는 훅 템플릿 추가

### Chat Streaming UI 통합 시 수정 사항

1. **아이콘 변경**:
   ```typescript
   // Before
   import { ClineCompactIcon } from '../assets/ClineCompactIcon';

   // After (Careti)
   import { CaretCompactIcon } from '../assets/CaretCompactIcon';
   ```

2. **테마 색상 수정**:
   - Cline의 초록색 계열 → Careti의 브랜드 색상으로 변경

## 📝 체리픽 머징 순서

### Phase 1: 보안 및 버그 수정 (1-2일)
1. 인증/보안 버그 수정 체리픽
2. LiteLLM 버그 수정 체리픽
3. 단위 테스트 실행 및 검증

### Phase 2: Skills 시스템 (2-3일)
1. Skills 핵심 파일 체리픽
2. 경로 및 브랜딩 수정
3. Careti 프롬프트 시스템 통합
4. 테스트 및 검증

### Phase 3: Hooks 시스템 (2-3일)
1. Hooks 핵심 파일 체리픽
2. 경로 및 브랜딩 수정
3. Careti 템플릿 시스템 통합
4. 테스트 및 검증

### Phase 4: MCP 개선 (1-2일)
1. MCP 개선 사항 체리픽
2. UI 개선 사항 적용
3. 테스트 및 검증

### Phase 5: Explain Changes 및 UI 개선 (1-2일)
1. Explain Changes 기능 체리픽
2. UI/UX 개선 사항 적용
3. Careti 브랜딩 맞춤 수정
4. 테스트 및 검증

### Phase 6: Chat Streaming UI (3-4일)
1. UI 컴포넌트 체리픽
2. Careti 브랜딩 적용
3. 신중한 통합 테스트
4. 사용자 경험 검증

## ⚠️ 주의 사항

1. **충돌 파일**:
   - `src/core/prompts/system-prompt/` - Careti의 프롬프트 시스템과 충돌 가능
   - `webview-ui/src/components/chat/` - Careti의 브랜딩 UI와 충돌 가능
   - `src/core/api/providers/` - Careti의 provider 확장과 충돌 가능

2. **테스트 필수**:
   - 체리픽 후 반드시 단위 테스트 실행
   - 통합 테스트 실행
   - E2E 테스트 실행

3. **브랜칭 전략**:
   - 각 Phase별로 기능 브랜치 생성
   - 개별 테스트 후 main에 머지

## 📚 참고 자료

- Cline 커밋 로그: `git log main..upstream/main --oneline`
- 상세 diff: `git diff main upstream main --stat`
- 변경 파일 목록: `git diff --name-status main upstream main`

## ✅ 결론

upstream의 최신 변경 사항은 Skills, Hooks, MCP 개선 등 Careti에 유용한 기능을 포함하고 있습니다. 특히:

1. **Skills 시스템**은 Careti의 agent 개선에 큰 도움이 될 것
2. **Hooks 시스템**은 태스크 추적 및 모니터링 강화
3. **보안 버그 수정**은 안정성 향상
4. **MCP 개선**은 MCP 통합 강화

체리픽 머징은 6단계로 나누어 진행하며, 각 단계별로 테스트와 검증을 통해 Careti의 안정성을 유지하면서 새로운 기능을 통합할 수 있습니다.

---

**보고서 작성자**: Luke
**마지막 업데이트**: 2025-01-14
