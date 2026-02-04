# AI 작업 인덱스

효율적인 AI 작업 실행을 위한 이중 디렉토리 문서 구조입니다.

## 개요

Caret의 이중 디렉토리 아키텍처로 작업합니다:

### `.agents/` (AI용)
- 토큰 최적화, 영어
- `context/*.md,*.json,*.yaml`: 빠른 참조 (50-80줄)
- `workflows/*.md`: 상세 절차 (100-250줄)
- `workflows/atoms/*.md`: 재사용 가능한 빌딩 블록

### `.users/` (사람용)
- 한국어로 상세 설명
- `context/*.md`: 사람이 읽기 좋은 가이드 (`.agents/context/` 미러링)

### `careti-docs/development/`
- 한국어 개발자 가이드

## 작업 카테고리

### AI 기능 개발
**키워드**: AI, feature, integration, system prompt, chatbot, agent, conversation
- 빠른 참조: `.agents/context/ai-feature.md` (60줄)
- 상세 절차: `.agents/workflows/ai-feature.md` (245줄)
- 한국어 가이드: `careti-docs/development/ai-feature.md`

### AI 작업 프로토콜
**키워드**: work protocol, phase, TDD, verification, documentation review
- 빠른 참조: `.agents/context/ai-work-protocol.md` (64줄)
- 상세 절차: `.agents/workflows/ai-work-protocol.md` (104줄)

### 아키텍처 & 설계
**키워드**: architecture, design, structure, system, scaling, fork, Cline modification
- 빠른 참조: `.agents/context/careti-architecture-guide.md`, `.agents/context/architecture-guide.yaml`
- 한국어 가이드: `careti-docs/development/careti-architecture-and-implementation-guide.md`

### 캐러티 개발 워크플로우
**키워드**: caret development, development workflow, TDD, document-driven
- 빠른 참조: `.agents/context/careti-development.md` (68줄)
- 상세 절차: `.agents/workflows/careti-development.md` (129줄)

### Cline 원본 수정
**키워드**: Cline modification, source change, src/ directory, L1 L2 L3, proto
- 빠른 참조: `.agents/context/cline-modification.md` (78줄)
- 상세 절차: `.agents/workflows/cline-modification.md` (146줄)
- 참고: 항상 백업 + `// CARETI MODIFICATION:` 주석 요구사항 준수

### 중요 검증
**키워드**: verification, critical analysis, 3-stage, balanced review
- 빠른 참조: `.agents/context/critical-verification.md` (53줄)
- 상세 절차: `.agents/workflows/critical-verification.md` (93줄)

### 문서 조직
**키워드**: documentation, knowledge sync, atomization, F11, 1:1 parity
- 빠른 참조: `.agents/context/document-organization.md` (47줄)
- 상세 절차: `.agents/workflows/document-organization.md` (100줄)
- 한국어 가이드: `careti-docs/development/documentation-guide.md`

### 병합 전략
**키워드**: merge, fork, L1 L2 L3, Cline integration, upstream
- 빠른 참조: `.agents/context/merge-strategy.md` (51줄)
- 상세 절차: `.agents/workflows/merge-strategy.md` (87줄)

### 새 컴포넌트 생성
**키워드**: component, React, new feature, UI, service, TDD
- 빠른 참조: `.agents/context/new-component.md` (80줄)
- 상세 절차: `.agents/workflows/new-component.md` (180줄)
- 한국어 가이드: `careti-docs/development/component-architecture-principles.md`

### 테스팅 & 품질
**키워드**: test, TDD, quality, coverage, verification, bug, integration test
- 빠른 참조: `.agents/context/testing-work.md` (82줄)
- 상세 절차: `.agents/workflows/testing-work.md` (253줄)
- 한국어 가이드: `careti-docs/development/testing-guide.md`

### CLI 개발
**키워드**: CLI, headless, yolo, subagent, agent mode, chatbot mode, terminal, standalone, benchmark
- 기능 문서: `careti-docs/features/f18-cli-agent-chatbot-mode.md`
- 설정: `.agents/context/agents-rules.json` (cli_standalone 섹션)
- 테스트: `CLAUDE.md` (CLI Testing 섹션)
- 참고:
  - 모드: plan (노랑), act (파랑), agent (초록), chatbot (마젠타)
  - Headless: `--yolo` 플래그 (서브에이전트/벤치마크용)
  - 빌드: `npm run compile-cli`
  - 테스트: `cd cli && go test ./e2e/... -v`

### API 프로바이더 테스팅
**키워드**: API, provider, test script, LLM, streaming, integration test, Upstage, GLM, Gemini
- 빠른 참조: `.agents/context/api-provider-testing.yaml`
- 한국어 가이드: `.users/context/api-provider-testing.md`
- 상세 가이드: `docs/API_TEST_GUIDE.md`

### B2B 브랜딩 & 변환
**키워드**: b2b, brand, codecenter, conversion, slexn
- 빠른 참조: `.agents/context/b2b-branding-workflow.md`
- 상세 절차: `.agents/workflows/branding-and-logging.md` (157줄)
- 한국어 가이드: `careti-docs/development/b2b-branding-workflow.md`

### i18n 정적 번역 수정
**키워드**: i18n, translation, static, dynamic, language switching, sovereign cloud, multilingual
- 상세 절차: `.agents/workflows/i18n-static-translation-fix.md` (158줄)
- 참고: Sovereign Cloud - 7개 언어 (en, ko, ja, zh, fr, de, ru)

### 프론트엔드-백엔드 통신
**키워드**: webview, communication, state management, message passing, UI integration, gRPC
- 빠른 참조: `.agents/context/frontend-backend-patterns.md`, `.agents/context/webview-communication.md`
- 한국어 가이드: `careti-docs/development/frontend-backend-interaction-patterns.md`, `careti-docs/development/webview-extension-communication.md`

### AI 시스템 개발
**키워드**: AI, message, system prompt, chatbot, agent, model, provider
- 빠른 참조: `.agents/context/system-prompt.md`, `.agents/context/message-processing.md`
- 한국어 가이드: `careti-docs/development/system-prompt-implementation.md`, `careti-docs/development/message-processing-architecture.md`

### UI/UX 개발
**키워드**: UI, UX, persona, multilingual, i18n, button, interaction, link management
- 빠른 참조: `.agents/context/component-architecture.md`
- 한국어 가이드: `careti-docs/development/component-architecture-principles.md`, `careti-docs/development/link-management-guide.md`

### 개발 도구
**키워드**: utility, tool, file handling, image, link, build, storage, flow
- 빠른 참조: `.agents/context/build-system.md`
- 한국어 가이드: `careti-docs/development/utilities.md`, `careti-docs/development/file-storage-and-image-loading-guide.md`, `careti-docs/development/ui-to-storage-flow.md`

## 작업 단계

### 단계 1: 작업 특성 분석
**소요 시간**: 30초
- 사용자 요청에서 키워드 추출하여 작업 분류

### 단계 2: 스마트 읽기 전략
**소요 시간**: 5-10분
- **높음**: 직접 관련 (최대 1-2개 문서)
- **중간**: 간접 관련 (필요시에만 스캔)
- **낮음**: 참조 문서 (링크만 확인)

### 단계 3: 필수 사전 점검
- [ ] `.agents/context` 파일 수정 체크리스트 확인
- [ ] TDD 원칙 (Red → Green → Refactor) 이해
- [ ] 백업 생성 계획 (Cline 원본 수정 시)
- [ ] CARETI MODIFICATION 주석 계획 (Cline 원본 수정 시)

### 단계 4: 다음 단계
문서 선택 및 읽기 후, 상세한 단계별 구현 접근을 위해 `/ai-work-protocol` 사용

## 가이드라인
- 작업 특성 키워드를 기반으로 관련 문서만 선택하여 AI 컨텍스트 사용 최적화
- 목표는 최소 컨텍스트 사용으로 최대 효율성
- 특정 작업에 필요한 것만 읽기
- 항상 순서 준수: 작업 분석 → 문서 선택 → 집중 읽기 → 프로토콜 실행

## 미러링 정책
- 이 파일 수정 시 `.agents/context/ai-work-index.yaml`도 동일하게 업데이트
