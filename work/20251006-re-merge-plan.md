# Cline-Caret 재병합 실행 계획 (Architecture-First Approach)

**문서 목적**: `merge-failure-analysis-report.md` 분석 결과를 바탕으로, 실패한 머지를 체계적으로 재시작하기 위한 실행 계획을 수립합니다.

**핵심 전략**: 아키텍처 우선 접근법 (Architecture-First)
- Cline의 변경된 아키텍처를 먼저 이해하고 통합한 후, 기능별로 점진적으로 병합을 진행합니다.
- 각 단계별로 엄격한 검증 절차를 거쳐 회귀를 방지합니다.

---

## Phase A: 기반 시스템 재구축 (Foundation Rebuild)

**목표**: 확장 프로그램의 가장 기본적인 골격(진입점, 타입 정의, 통신 프로토콜)을 안정화시킵니다.

| # | 작업 내용 | 대상 파일 | 완료 조건 |
|---|---|---|---|
| A1 | **진입점 재구성**: Cline의 `extension.ts` 구조에 맞춰 Caret의 활성화 로직을 재통합합니다. | `src/extension.ts` | Caret 관련 초기화 코드가 Cline의 활성화 흐름에 정상적으로 연결됨. |
| A2 | **타입 시스템 통합**: `api.ts`의 타입 정의를 Cline 최신 버전에 맞게 업데이트하고, Caret 전용 타입을 추가합니다. | `src/shared/api.ts` | 타입 충돌이 해결되고, `npm run check-types` 통과. |
| A3 | **통신 프로토콜 정립**: `ExtensionMessage.ts`를 Cline의 새 메시징 구조에 맞춰 재구성합니다. | `src/shared/ExtensionMessage.ts` | 프론트엔드-백엔드 간 기본 메시지 타입 정의 완료. |

**Phase A 완료 검증**:
- [ ] `npm run compile` 성공
- [ ] VSCode에서 확장 프로그램이 오류 없이 로딩됨 (기능 동작은 미확인)

---

## Phase B: 핵심 시스템 검증 (Core System Verification)

**목표**: 기반 시스템 위에서 핵심 로직(상태 관리, 컨트롤러)이 최소한으로 동작하는 것을 확인합니다.

| # | 작업 내용 | 대상 파일 | 완료 조건 |
|---|---|---|---|
| B1 | **상태 관리 시스템 통합**: Cline의 새로운 `StateManager` 싱글톤 패턴을 적용하고, Caret의 상태(`workspaceState`, `globalState`) 관리 로직을 연결합니다. | `src/core/storage/StateManager.ts`, `src/core/storage/utils/state-helpers.ts` | 상태 값 읽기/쓰기 기본 동작 확인. |
| B2 | **컨트롤러 구조 통합**: `Controller`와 `Task` 패턴을 이해하고, Caret의 기능 핸들러들을 연결할 준비를 합니다. | `src/core/controller/index.ts`, `src/core/task/index.ts` | 핵심 컨트롤러 초기화 성공. |

**Phase B 완료 검증**:
- [ ] `npm run test:unit` (관련 단위 테스트) 통과
- [ ] 프론트엔드-백엔드 간 간단한 ping-pong 메시지 통신 성공

---

## Phase C: 기능별 점진적 통합 (Gradual Feature Integration)

**목표**: 안정화된 코어 위에 Caret 고유 기능과 Cline 신규 기능을 순차적으로 통합합니다.

| # | 작업 내용 | 우선순위 | 비고 |
|---|---|---|---|
| C1 | **프롬프트 시스템 통합**: Caret/Cline 듀얼 모드를 지원하도록 프롬프트 시스템을 재구축합니다. | `High` | AI 핵심 기능이므로 최우선 통합. |
| C2 | **Tool Handlers 통합**: 50개 이상의 Tool Handler를 순차적으로 병합하고 테스트합니다. | `Medium` | 개별적으로 분리하여 하나씩 통합. |
| C3 | **Caret 고유 기능 통합**: Persona, i18n, 브랜딩 관련 로직을 재연결합니다. | `High` | Caret의 정체성과 직결된 기능. |
| C4 | **기타 서비스 통합**: 인증, 브라우저 제어 등 나머지 서비스를 통합합니다. | `Low` | |

**Phase C 완료 검증**:
- [ ] `npm run test:all` 통과
- [ ] 주요 기능 E2E 테스트 통과
- [ ] Caret/Cline 모드 전환 및 기능 동작 확인

---

## 병합 원칙

1.  **Caret 고유성 보존 (Caret Identity Preservation)**:
    -   브랜딩 (`caret.*`), Persona, i18n, 듀얼 프롬프트 시스템은 **반드시 보존**합니다.
    -   Caret 전용 패키지 및 스크립트는 유지합니다.

2.  **Cline 아키텍처 채택 (Cline Integration)**:
    -   `StateManager` 싱글톤, `Controller/Task` 패턴 등 최신 아키텍처를 **적극적으로 수용**합니다.
    -   OCA, 신규 Provider 등 Cline의 새로운 기능은 통합합니다.
    -   성능 및 보안 개선 사항은 최대한 반영합니다.
