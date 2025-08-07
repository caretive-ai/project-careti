# Task #006-1: 타입 정의 파일 병합 (업스트림 머징 하위 작업)

- **상위 작업:** [Task #006: 업스트림 병합 충돌 해결 계획](./006-upstream-merge-conflict-resolution-plan.md)
- **목표:** `src/core/controller/index.ts`와 같은 핵심 파일 병합 시 발생하는 타입 오류를 근본적으로 해결하기 위해, 의존성이 있는 타입 정의 파일들의 병합을 우선적으로 완료합니다.

---

## 1. 작업 배경

`src/core/controller/index.ts` 병합 과정에서, 해당 파일이 참조하는 `WebviewMessage`, `ExtensionState`, `Task` 등의 타입/클래스 정의가 현재 브랜치의 버전과 `upstream/main`의 버전 간에 차이가 있어 수많은 타입스크립트 오류가 발생했습니다.

이 문제를 해결하기 위해, `index.ts`를 직접 수정하기 전에 관련된 타입 정의 파일들을 먼저 병합하여 안정적인 코드 기반을 마련합니다.

## 2. 병합 대상 파일 및 순서

아래 순서에 따라 파일을 하나씩 병합하고, 각 파일 병합 후에는 `git add`를 통해 변경사항을 스테이징합니다.

1.  `src/shared/WebviewMessage.ts`
2.  `src/shared/ExtensionMessage.ts`
3.  `src/shared/ChatSettings.ts`
4.  `src/core/task/index.ts`
5.  기타 `src/shared/` 및 `src/core/` 내의 충돌 파일 중, 다른 파일에 타입/인터페이스를 제공하는 파일들

## 3. 병합 전략

-   **Caret 기능 확장 유지:** Caret에서 추가한 새로운 메시지 타입, 인터페이스 속성, 클래스 멤버 등은 모두 유지합니다.
-   **Cline 구조 개선 수용:** Cline에서 변경된 코드 구조(예: 타입 정의 방식, gRPC 관련 구조)는 적극적으로 수용하여 최신 아키텍처를 따릅니다.
-   **점진적 해결:** 한 번에 하나의 파일만 병합하고, 완료 후 즉시 스테이징하여 작업 단위를 명확하게 구분합니다.

## 4. 시작점

-   `read_file` 도구를 사용하여 `src/shared/WebviewMessage.ts`의 충돌 내용을 읽고 분석하는 것부터 시작합니다.
