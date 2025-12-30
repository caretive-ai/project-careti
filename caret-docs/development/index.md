# 개발 문서 대시보드

Caret 개발자가 확인해야 할 KO 우선 문서 모음입니다. `features.en`만 EN 병행을 유지하며, `.agents/context` 워크플로우와의 매핑을 함께 표기합니다.

## 🚀 시작하기
- **[환경 설정 및 보안](./configuration.md)** — `.env`, 비밀 관리
- **[빌드 및 테스트](./build-and-test.md)** — Core/Webview/CLI 빌드·테스트 스크립트
- **[CLI 개발 가이드](./cli-development.md)** — CLI 빌드/실행/TDD
- **[CLI 인증 플로우(서버 요구사항/목업)](./caret-cli-auth-flow.md)** — 서버팀 공유용, 목업으로 E2E 검증

## 🧭 개발 워크플로우 ('.agents/context/workflows' 매핑)
- **[Caret 개발 흐름](./caret-development.md)** ↔ `.agents/context/workflows/caret-development.md`
- **[Cline 수정 안전 가이드](./cline-modification.md)** ↔ `.agents/context/workflows/cline-modification.md`
- **[테스팅 가이드](./testing-guide.md)** ↔ `.agents/context/workflows/testing-work.md` (+ `atoms/tdd-cycle.yaml`)
- **[AI 작업 프로토콜](./ai-work-protocol.md)** / **인덱스** ↔ `.agents/context/workflows/ai-work-protocol.md`
- **[브랜딩/B2B 워크플로우](./b2b-branding-workflow.md)** ↔ `.agents/context/workflows/branding-and-logging.md`
- **[새 컴포넌트 만들기](./new-component.md)** ↔ `.agents/context/workflows/new-component.md`
- **[문서 정리 가이드](./document-organization.md)** ↔ `.agents/context/workflows/document-organization.md`
- **[크리티컬 검증](./critical-verification.md)** ↔ `.agents/context/workflows/critical-verification.md`
- **[AI 기능 워크플로우](./ai-feature.md)** ↔ `.agents/context/workflows/ai-feature.md`
- **[테스팅 작업](./testing-work.md)** ↔ `.agents/context/workflows/testing-work.md` (중복 내용, 통합 검토 예정)

## 🏛️ 아키텍처 & 패턴 (참고용)
- **[Caret 아키텍처 개요](./caret-architecture-and-implementation-guide.md)** — merge-strategy/merge-workflow 참조
- **[프론트엔드-백엔드 통신 패턴](./frontend-backend-interaction-patterns.md)**
- **[컴포넌트 아키텍처 원칙](./component-architecture-principles.md)**
- **[프롬프트 관리](./prompt-management.md)** / **[시스템 프롬프트 구현](./system-prompt-implementation.md)**
- **[메시지 처리/체크포인트 아키텍처](./message-processing-architecture.md)** / **[체크포인트 아키텍처](./checkpoint-architecture.md)**
- **[파일/이미지 스토리지](./file-storage-and-image-loading-guide.md)**, **[UI-스토리지 흐름](./ui-to-storage-flow.md)**
- 기타 참고: `build-system.md`, `button-system-architecture-guide.md`, `extension-architecture.mmd`

## 📚 레퍼런스/규약
- **[모델 지원 목록 (KO)](./support-model-list.md)** / **[모델 목록 (EN)](./support-model-list.en.md)**
- **[로케일 규칙](./locale.md)**
- **[로깅 규칙](./logging-rules.md)**, **[링크 관리](./link-management-guide.md)**, **[JSON 주석 규약](./json-comment-conventions.md)**
- **[유틸리티 스크립트](./utilities.md)**

## 🗂️ 추가 정리/검토 대상
- 고립·구버전 가능성: `build-system.md`, `button-system-architecture-guide.md`, `message-processing-architecture.md`, `checkpoint-architecture.md`, `system-prompt-implementation.md`, `extension-architecture.mmd`
- 필요 시 최신 가이드로 병합하거나 `archived/` 이동 예정 (삭제 전 합의)

---
- [프로젝트 README](../../README.md)로 돌아가기
