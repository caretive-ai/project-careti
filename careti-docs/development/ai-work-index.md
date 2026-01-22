# AI 작업 인덱스 (KO 우선, .agents/context 기반)

목적: 작업 성격을 빠르게 분류하고 **필요한 규칙/가이드만 온디맨드로** 읽기 위한 인덱스입니다.

## Phase 0: 항상 먼저 읽기
1. `.agents/context/careti-rules.json` (Single Source of Truth: 프로젝트 규칙/워크플로우 인덱스)
2. `.agents/context/workflows/<해당 워크플로우>.md` (필요할 때만)
3. 참고(사람 문서): `careti-docs/development/index.md` (KO 대시보드)

## 작업 성격별 빠른 매핑

### 1) Cline 원본 수정 / 머지 / 리그레션
- 우선 읽기(규칙): `.agents/context/workflows/cline-modification.md`, `.agents/context/workflows/merge-strategy.md`
- 참고(문서): `careti-docs/development/cline-modification.md`, `careti-docs/development/careti-architecture-and-implementation-guide.md`

### 2) 테스트/TDD/품질
- 우선 읽기(규칙): `.agents/context/workflows/testing-work.md` (+ `.agents/context/workflows/atoms/tdd-cycle.md`)
- 참고(문서): `careti-docs/development/testing-guide.md`, `careti-docs/development/testing-work.md`

### 3) 프론트엔드(Webview) ↔ Extension 통신/상태
- 우선 읽기(규칙/패턴): `.agents/context/workflows/atoms/message-flow.md`, `.agents/context/workflows/atoms/storage-patterns.md`
- 참고(문서): `careti-docs/development/webview-extension-communication.md`, `careti-docs/development/frontend-backend-interaction-patterns.md`, `careti-docs/development/ui-to-storage-flow.md`

### 4) UI/컴포넌트/i18n
- 우선 읽기(규칙): `.agents/context/workflows/new-component.md`, `.agents/context/workflows/i18n-static-translation-fix.md`
- 참고(문서): `careti-docs/development/component-architecture-principles.md`, `careti-docs/development/locale.md`
- 기능 스펙(EN 병행): `careti-docs/features.en/f02-multilingual-i18n.md`

### 5) 문서화/규약/링크 관리
- 우선 읽기(규칙): `.agents/context/workflows/document-organization.md`
- 참고(문서): `careti-docs/development/documentation-guide.md`, `careti-docs/development/json-comment-conventions.md`, `careti-docs/development/link-management-guide.md`

### 6) 브랜딩/B2B/로깅
- 우선 읽기(규칙): `.agents/context/workflows/branding-and-logging.md`
- 참고(문서): `careti-docs/development/b2b-branding-workflow.md`, `careti-docs/development/logging-rules.md`

## 기본 체크리스트
- [ ] `.agents/context` 기반 워크플로우를 먼저 선택했는가
- [ ] Cline 원본 수정이면 `.cline` 백업 없이(Deprecated) `// CARETI MODIFICATION:` + 최소 변경(1-3줄) 규칙을 지켰는가
- [ ] (예외) 테스트 등으로 보호 디렉토리 내 신규 파일 추가가 불가피하면, 파일 상단에 `// CARETI MODIFICATION:`로 Careti 추가 파일임을 표기했는가
- [ ] TDD(RED→GREEN→REFACTOR)로 테스트부터 진행했는가
