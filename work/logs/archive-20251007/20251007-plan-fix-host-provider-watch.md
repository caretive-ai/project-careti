# `HostProvider.watch` 컴파일 에러 해결 계획

## 1. 문제점

`src/core/task/focus-chain/index.ts` 파일에서 `HostProvider.watch`를 호출하고 있으나, `HostProvider`가 싱글턴 인스턴스 기반으로 변경되면서 해당 정적 속성이 제거되어 컴파일 에러가 발생한다.

- `error TS2339: Property 'watch' does not exist on type 'typeof HostProvider'.`

## 2. 목표

`HostProvider`의 변경된 아키텍처에 맞춰 `watch` 서비스에 접근할 수 있도록 수정하여 컴파일 에러를 해결한다. 변경 사항은 `HostProvider` 내에 캡슐화하여 '최소 침습 원칙'을 준수한다.

## 3. 작업 단계

### Step 1: `host-provider.ts`에 정적 접근자 추가

- **대상 파일**: `src/hosts/host-provider.ts`
- **작업**: `workspace`, `window` 등의 다른 서비스와 동일한 패턴으로 `watch` 서비스를 위한 정적 접근자(static getter)를 추가한다. 이 접근자는 내부적으로 싱글턴 인스턴스의 `watchServiceClient`를 반환한다.
- **예상 코드**:
  ```typescript
  // src/hosts/host-provider.ts 내부에 추가

  // CARET MODIFICATION: Added static accessor for watch service to align with new singleton pattern.
  public static get watch() {
    return HostProvider.get().hostBridge.watchServiceClient
  }

  public static get workspace() {
  //... 기존 코드
  ```

### Step 2: 원칙 준수 체크리스트 검증

- **수정 대상**: `src/hosts/host-provider.ts`
- **검증**:
  - [x] **1. `src` 수정이 불가피한가?**: 예. Cline의 핵심 아키텍처 변경에 대응하기 위해 불가피하다.
  - [x] **2. 수정 범위가 최소한인가?**: 예. 정적 접근자 4줄만 추가하므로 최소한의 수정이다.
  - [x] **3. `// CARET MODIFICATION:` 주석을 포함했는가?**: 예. 수정 시 주석을 추가할 것이다.
  - [x] **4. 향후 병합 영향을 분석했는가?**: 예. 변경된 아키텍처를 따르는 어댑터 코드이므로, 향후 병합 시 충돌 가능성이 낮다.

## 4. 다음 단계

- **Step 1**을 실행하여 `src/hosts/host-provider.ts` 파일을 수정한다.
- 수정 후, 재컴파일을 통해 `focus-chain/index.ts`의 에러가 해결되었는지 검증한다.
