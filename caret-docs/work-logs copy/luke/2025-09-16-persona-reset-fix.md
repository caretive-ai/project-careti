# 작업 로그: 2025-09-16 - 페르소나 초기화 문제 해결 (T12) - Caret AI 기록

## 최종 요약 (Caret AI)

**문제:** "전역 초기화" 실행 시 페르소나 이미지가 기본값으로 변경되지 않음.

**최종 분석된 원인:**
1.  **gRPC 스트림 단절:** 백엔드 내부의 페르소나 변경 이벤트(`PersonaService`)와 웹뷰가 구독하는 gRPC 스트림(`SubscribeToPersonaChanges`)이 연결되어 있지 않았음. 이로 인해 `resetState` 함수가 페르소나를 초기화해도 웹뷰는 변경 사실을 알지 못함.
2.  **웹뷰 CSP 오류:** `resetState` 함수가 웹뷰에 전달하는 페르소나 정보에 `asset://` 형태의 파일 경로가 포함되어 있었음. 웹뷰는 보안 정책(CSP)상 이 경로의 이미지를 직접 로드할 수 없어 이미지 업데이트가 실패함.
3.  **레거시 상태값 잔존:** `resetPersonaData` 함수가 `globalState`에 저장된 레거시 `personaProfile` 값을 삭제하지 않아, 초기화 후에도 웹뷰가 이 오래된 값을 참조하는 문제가 있었음.

**시도된 해결책:**
1.  `resetState.ts`에서 `PersonaService.notifyPersonaChange()`를 호출하여 UI 업데이트 시도.
2.  `persona-initializer.ts`의 `resetPersonaData` 함수에 레거시 `personaProfile` 상태를 삭제하는 로직 추가.
3.  `resetState.ts`에서 초기화된 이미지를 `data:` URI로 변환하여 웹뷰에 전달하는 로직 추가.
4.  `SubscribeToPersonaChanges.ts` 핸들러가 `PersonaService`의 이벤트를 구독하여 gRPC 스트림으로 변경사항을 전달하도록 수정.

**결과:**
위 해결책들을 모두 적용했음에도 불구하고 문제가 해결되지 않음. 근본적인 원인이 다른 곳에 있을 가능성이 높음.

---

## 작업 개요
"전역 초기화" 시 페르소나 이미지가 초기화되지 않는 문제를 해결합니다.

## 폐기된 접근 방식
- **`.proto` 파일 수정**: `proto/caret/persona.proto`에 `NotifyPersonaImageUpdate` RPC를 추가하여 백엔드에서 프론트엔드로 명시적인 업데이트 신호를 보내려 했습니다.
- **불필요한 작업**: 이 접근 방식은 기존 시스템의 UI 업데이트 메커니즘을 충분히 분석하지 않은 상태에서 진행되어 불필요한 작업이었습니다.

## 올바른 접근 방식
기존 `UpdatePersona` 핸들러의 UI 업데이트 메커니즘을 분석하여 `resetState` 핸들러에 동일하게 적용합니다.

## TDD 기반 작업 계획
1.  **RED**: `resetState` 핸들러가 UI 업데이트 알림을 보내는지 검증하는 테스트 케이스를 먼저 작성합니다.
2.  **GREEN**: `persona-initializer.ts`와 `resetState.ts`를 수정하여 테스트를 통과시킵니다.
3.  **REFACTOR**: 코드를 정리합니다.

## 현재까지의 진행 상황
- `persona.md` 파일이 없는 경우에도 디렉토리를 생성하고 파일을 생성하도록 로직 수정 완료.
- `resetPersonaData` 함수가 `persona.md` 파일도 삭제하도록 수정 완료.
- `UpdatePersona` 핸들러가 `personaService.notifyPersonaChange(profile)`를 호출하여 UI에 변경 사항을 알리는 것을 확인.
- `resetState` 핸들러에 `notifyPersonaChange` 호출 로직이 누락된 것을 확인.

## 다음 세션에 해야 할 일
1.  **`caret-src/services/persona/persona-initializer.ts` 수정**: `initialize()` 함수가 초기화된 페르소나 정보를 반환하도록 수정합니다.
2.  **`src/core/controller/state/resetState.ts` 수정**: `resetAndInitializePersona` 함수 내에서 `PersonaInitializer.initialize()` 호출 후, 반환된 페르소나 정보로 `PersonaService.getInstance().notifyPersonaChange()`를 호출하여 UI에 이미지 변경을 알리는 로직을 추가합니다.
3.  **최종 기능 테스트**: 수정된 로직이 "전역 초기화" 시 페르소나 이미지를 기본값으로 올바르게 복원하는지 확인합니다.
