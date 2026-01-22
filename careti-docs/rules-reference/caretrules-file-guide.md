# .agents/context 규칙 구조 가이드

`.agents/context/`는 Careti 에이전트가 프로젝트를 이해하기 위해 읽는 표준 지식 저장소입니다. 세션 시작 시 반드시 `.agents/context/careti-rules.json`을 읽고, 필요할 때 `.agents/context/workflows/`의 워크플로우 문서를 온디맨드로 추가 로드합니다.

## 핵심 파일

- `careti-rules.json`: 시스템 프롬프트에 직접 포함되는 단일 SoT입니다. 프로젝트 정체성, 머지 전략, 아키텍처 규칙, 작업 원칙을 정의합니다.
- `careti-rules.md`: 사람이 읽기 쉬운 요약/설명 문서입니다. JSON의 의미와 반드시 일치해야 합니다.
- `*.md`, `*.yaml`: 상세 가이드/체크리스트/프로토콜 문서입니다. `careti-rules.json`이 참조하는 문서를 중심으로 유지합니다.
- `workflows/`: 작업별 절차 문서를 모은 디렉토리입니다. 필요할 때만 읽습니다.

## 동작 원칙

- 레거시 규칙 경로는 **완전 폐기**되어 더 이상 읽지 않습니다.
- 규칙/워크플로우의 출처는 항상 `.agents/context` 기준입니다.
- 규칙 변경 시 `careti-rules.json`과 관련 문서의 의미가 일치하도록 함께 수정합니다.

## 관리 팁

- 경로/브랜드 계산은 `careti-src/utils/brand-utils.ts`를 사용합니다. 경로를 하드코딩하지 않습니다.
- `.agents/context`는 실행 시점에만 로드됩니다. 빌드 산출물/캐시 대상으로 취급하지 않습니다.
