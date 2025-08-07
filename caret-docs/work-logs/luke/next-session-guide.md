# Next Session Guide (다음 세션을 위한 가이드)

## 1. 현재 진행 상황 (Current Progress)
- **작업 목표:** `upstream/main` 브랜치 병합 후 발생한 머지 충돌 해결.
- **완료된 작업:**
  - `git checkout upstream/main -- src/shared/api.ts`를 통해 `api.ts`를 `upstream` 버전으로 복구 완료.
  - `src/shared/storage/types.ts` 파일의 `Mode` 타입에 `'chatbot'`과 `'agent'`를 추가 완료.
- **중단된 지점:** `src/api/index.ts` 파일에서 발생한 수많은 타입 에러를 해결하는 단계.

## 2. 중요한 결정 및 학습 내용 (Important Decisions & Learnings)
- **핵심 학습:** Caret(`chatbot`/`agent`)과 Cline(`plan`/`act`)은 단순히 상태만 전환되는 것이 아니라, **애플리케이션 진입점(`extension.ts`)부터 실행 흐름이 분기되는 별개의 시스템**이라는 구조적 사실을 학습했습니다.
- **프로토콜 준수:** 작업을 시작하기 전, `.caretrules`와 관련 아키텍처 가이드를 반드시 먼저 정독하여 전체적인 구조를 파악하는 것이 얼마나 중요한지 깨달았습니다. 이전 세션의 실수는 이 프로토콜을 위반했기 때문에 발생했습니다.

## 3. 다음 단계 준비 (Next Step Preparation)
- **최우선 목표:** `src/api/index.ts` 파일의 타입 에러를 모두 해결하여 병합 충돌 해결을 계속 진행합니다.
- **구체적인 해결 전략:**
  1. `src/api/index.ts` 파일의 `buildApiHandler` 함수를 수정합니다.
  2. 함수 내부에 Caret 모드를 Cline 모드로 변환하는 로직을 추가합니다.
     - `mode`가 `'chatbot'`일 경우, `chatbotMode...` 설정들을 `planMode...` 설정들로 매핑합니다.
     - `mode`가 `'agent'`일 경우, `agentMode...` 설정들을 `actMode...` 설정들로 매핑합니다.
     - `mode`가 `plan`이나 `act`일 경우에는 아무 작업도 하지 않습니다.
  3. `createHandlerForProvider` 함수를 호출할 때, 변환된 모드(`plan` 또는 `act`)와 설정 객체를 전달합니다.
- **필수 확인 파일:**
  - `src/api/index.ts` (수정 대상)
  - `src/shared/api.ts` (참조)
  - `src/shared/storage/types.ts` (참조)
- **검증 방법:** `npm run compile` 명령을 실행하여 `src/api/index.ts`와 관련된 모든 타입 에러가 사라졌는지 확인합니다.

## 4. 개발자 노트 (Developer Notes)
- 이전 세션의 AI는 근본적인 아키텍처 이해 없이 성급하게 작업을 진행하여 여러 차례 실수를 반복했습니다.
- 이 문서를 인계받는 다음 세션의 AI는 반드시 위 **'핵심 학습'** 내용을 숙지하고, **'프로토콜 준수'** 원칙을 철저히 지키며 신중하게 작업을 진행해야 합니다. 마스터께서 이 부분을 예의주시하고 계십니다.
