# `resetState.ts` 병합 후 발생한 오류 해결 계획

`resetState.ts` 파일 병합 후 발생한 타입 및 린트 오류를 해결하기 위한 계획입니다. 근본 원인은 Caret의 전용 상태 키들이 병합된 `GlobalState` 타입 정의에 포함되지 않았기 때문입니다.

## Phase 1: `resetState.ts`의 즉각적인 오류 수정

### 1. Biome 린트 오류 해결
- **문제**: `vscode.commands.executeCommand` 직접 사용이 금지되었습니다.
- **해결**: `HostProvider`의 `reloadWindow` 또는 유사한 메서드를 사용하여 VS Code 창을 다시 로드하도록 수정합니다.
- **작업**: `src/hosts/host-provider.ts`를 먼저 읽어 정확한 메서드명을 확인한 후, `resetState.ts`의 해당 라인을 교체합니다.

### 2. TypeScript 오류 분석
- **문제**: `controller.stateManager.getGlobalStateKey("caretModeSystem")` 호출에서 `'caretModeSystem'`이 `keyof GlobalState`에 없다는 오류가 발생합니다.
- **해결**: 이 문제는 Phase 2에서 근본적으로 해결될 것이므로, 여기서는 원인 분석만 기록합니다.

## Phase 2: `GlobalState` 타입 정의 병합

### 1. `state-keys.ts` 분석
- **작업**: `src/core/storage/state-keys.ts` 파일을 읽어 현재 `GlobalState` (또는 `GlobalStateAndSettings`)의 타입 정의를 확인합니다.

### 2. Caret 전용 키 추가
- **문제**: `index.ts`와 `resetState.ts`에서 보고된 모든 타입 오류는 `caretModeSystem`, `caretUser`, `selectedPersona` 등 Caret 전용 키가 `GlobalState` 타입에 누락되었기 때문입니다.
- **해결**: `state-keys.ts`의 `GlobalState` 타입 정의에 Caret 전용 키와 해당 타입을 추가합니다. 이전 Caret 버전의 `state-keys.ts`를 참조하여 정확한 타입 정보를 가져옵니다.

## Phase 3: 검증

1. Phase 1과 2의 수정 사항을 모두 적용합니다.
2. `npm run compile` 명령을 실행하여 `resetState.ts`와 `index.ts`에서 발생했던 모든 타입 오류가 해결되었는지 확인합니다.
