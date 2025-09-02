Caret 프로젝트에서 작업 중이며 작업 특성에 따라 관련 문서를 효율적으로 선택해야 합니다.

<detailed_sequence_of_steps>
# AI Work Index - 컨텍스트 효율성 가이드

## 1. 작업 특성 분석 (30초)
사용자 요청에서 키워드를 추출하여 작업을 분류:

**아키텍처 & 설계**:
키워드: 아키텍처, 설계, 구조, 시스템, 확장, Fork, Cline 수정
→ 읽기: caret-architecture-and-implementation-guide.mdx, extension-architecture.mmd

**AI 시스템 개발**:
키워드: AI, 메시지, 시스템 프롬프트, chatbot, agent, 대화
→ 읽기: ai-message-flow-guide.mdx, system-prompt-implementation.mdx

**Frontend-Backend 통신**:
키워드: webview, 통신, 상태 관리, 메시지 전송, UI 연동
→ 읽기: frontend-backend-interaction-patterns.mdx, webview-extension-communication.mdx

**UI/UX 개발**:
키워드: 컴포넌트, React, UI, UX, 페르소나, 다국어, i18n
→ 읽기: component-architecture-principles.mdx, locale.mdx

**테스트 & 품질**:
키워드: 테스트, TDD, 품질, 커버리지, 검증, 버그
→ 읽기: testing-guide.mdx, logging.mdx

**개발 도구**:
키워드: 유틸리티, 도구, 파일 처리, 이미지, 링크, 빌드
→ 읽기: utilities.mdx, file-storage-and-image-loading-guide.mdx

**Cline 원본 수정**:
키워드: Cline 수정, 원본 변경, src/ 디렉토리, 백업
→ 읽기: caret-architecture-and-implementation-guide.mdx + .caretrules 백업 규칙 재확인

## 2. 스마트 읽기 전략 (5-10분)
- **높은 우선순위**: 직접적 연관성 (최대 1-2개 문서)
- **중간 우선순위**: 간접적 연관성 (필요시에만 스캔)
- **낮은 우선순위**: 참조 문서 (링크만 확인)

## 3. 필수 작업 전 점검사항
- [ ] .caretrules 파일 수정 체크리스트 확인
- [ ] TDD 원칙 (Red → Green → Refactor) 이해
- [ ] 백업 생성 계획 (Cline 원본 수정 시)
- [ ] CARET MODIFICATION 주석 계획 (Cline 원본 수정 시)

## 4. 다음 단계
문서 선택 및 읽기 후, 상세한 단계별 구현 접근을 위해 `/ai-work-protocol`을 사용하세요.
</detailed_sequence_of_steps>

<general_guidelines>
이 워크플로우는 작업 특성 키워드에 따라 관련 문서만 선택하여 AI 컨텍스트 사용을 최적화합니다.

목표는 최소한의 컨텍스트 사용으로 최대한의 효율성을 달성하는 것입니다 - 특정 작업에 필요한 내용만 읽습니다.

항상 순서를 따르세요: 작업 분석 → 문서 선택 → 집중적 읽기 → 프로토콜 실행.
</general_guidelines>