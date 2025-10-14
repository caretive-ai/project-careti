# AI 작업 인덱스 - 컨텍스트 효율성 가이드

Caret 프로젝트에서 작업하며 작업 특성에 따라 관련 문서를 효율적으로 선택해야 합니다.

## 1. 작업 특성 분석 (30초)
사용자 요청에서 키워드를 추출하여 작업을 분류합니다:

**아키텍처 & 설계**:
- 키워드: architecture, design, structure, system, scaling, fork, Cline modification
- 읽기: caret-architecture-and-implementation-guide.mdx, extension-architecture.mmd

**B2B 브랜딩 & 전환**:
- 키워드: b2b, brand, codecenter, conversion, slexn
- 읽기: b2b-branding-workflow.md

**AI 시스템 개발**:
- 키워드: AI, message, system prompt, chatbot, agent, conversation
- 읽기: ai-message-flow-guide.mdx, system-prompt-implementation.mdx

**프론트엔드-백엔드 통신**:
- 키워드: webview, communication, state management, message passing, UI integration
- 읽기: frontend-backend-interaction-patterns.mdx, webview-extension-communication.mdx

**UI/UX 개발**:
- 키워드: component, React, UI, UX, persona, multilingual, i18n
- 읽기: component-architecture-principles.mdx, locale.mdx

**테스팅 & 품질**:
- 키워드: test, TDD, quality, coverage, verification, bug
- 읽기: testing-guide.mdx, logging.mdx

**개발 도구**:
- 키워드: utility, tool, file handling, image, link, build
- 읽기: utilities.mdx, file-storage-and-image-loading-guide.mdx

**Cline 원본 수정**:
- 키워드: Cline modification, source change, src/ directory, backup
- 읽기: caret-architecture-and-implementation-guide.mdx + .caretrules 백업 규칙 재확인

## 2. 스마트 읽기 전략 (5-10분)
- **높은 우선순위**: 직접 관련성 (최대 1-2개 문서)
- **중간 우선순위**: 간접 관련성 (필요시만 스캔)
- **낮은 우선순위**: 참고 문서 (링크만 확인)

## 3. 필수 사전 작업 체크
- [ ] .caretrules 파일 수정 체크리스트 확인
- [ ] TDD 원칙 (Red → Green → Refactor) 이해
- [ ] 백업 생성 계획 (Cline 원본 수정 시)
- [ ] CARET MODIFICATION 주석 계획 (Cline 원본 수정 시)

## 4. 다음 단계
문서 선택 및 읽기 후, `/ai-work-protocol`을 사용하여 상세한 단계별 구현 접근 방식을 따릅니다.

## 가이드라인
- 작업 특성 키워드 기반으로 관련 문서만 선택하여 AI 컨텍스트 사용 최적화
- 목표는 최소한의 컨텍스트 사용으로 최대 효율성
- 특정 작업에 필요한 것만 읽기
- 항상 순서 따르기: 작업 분석 → 문서 선택 → 집중 읽기 → 프로토콜 실행
