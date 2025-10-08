# Phase 1-B 실행 계획: 상태 관리 변경 심층 분석 및 대응

## 1. 분석 결과

`src/core/storage/state-keys.ts` 분석 결과, `workspaceRoots`, `multiRootEnabled`, `ocaApiKey` 등 다수의 상태 키가 Cline의 `GlobalState` 및 `Secrets` 인터페이스에서 완전히 제거되었음을 확인했다. 이는 관련 기능의 아키텍처가 근본적으로 변경되었음을 시사하며, 단순 키 매핑 방식으로는 해결이 불가능하다.

## 2. 목표

'최소 침습 원칙'을 준수하며, 변경된 Cline의 상태 관리 아키텍처에 대응하는 호환성 레이어를 `caret-src` 내에 구현하여 그룹 B 컴파일 에러를 해결한다.

## 3. 작업 단계

### Step 1: `setup.ts` 심층 분석 (멀티-루트 워크스페이스)

- **대상 파일**: `src/core/workspace/setup.ts`
- **작업**: 해당 파일에서 발생하는 `workspaceRoots`, `primaryRootIndex` 관련 에러를 중심으로, Cline이 멀티-루트 워크스페이스 정보를 어떻게 관리하고 초기화하는지 코드의 흐름을 역추적하여 분석한다.
- **목표**: `vscode.workspace.workspaceFolders`를 직접 사용하는 방식 등 새로운 구현 패턴을 파악한다.

### Step 2: `CaretWorkspaceService` 설계

- **경로**: `caret-src/services/workspace/CaretWorkspaceService.ts`
- **작업**: Step 1의 분석 결과를 바탕으로, Caret의 다른 부분들이 기존처럼 워크스페이스 정보를 쉽게 사용할 수 있도록 인터페이스를 제공하는 독립 서비스를 설계한다.
- **예상 인터페이스**:
  ```typescript
  class CaretWorkspaceService {
    // 기존 `workspaceRoots`와 유사한 기능을 제공
    public getWorkspaceRoots(): readonly vscode.Uri[];

    // 기존 `primaryRootIndex`와 유사한 기능을 제공
    public getPrimaryRootIndex(): number;
  }
  ```

### Step 3: `OcaAuthProvider.ts` 심층 분석 (인증 및 보안)

- **대상 파일**: `src/services/auth/oca/providers/OcaAuthProvider.ts`
- **작업**: `ocaApiKey`, `ocaRefreshToken` 관련 에러를 중심으로, Cline의 새로운 인증 정보 및 보안 키 관리 메커니즘을 분석한다.
- **목표**: `getSecret`, `storeSecret`과 같은 VS Code SecretStorage API를 직접 사용하는 패턴이나, 새로운 인증 서비스의 흐름을 파악한다.

### Step 4: `CaretAuthCompatLayer` 설계

- **경로**: `caret-src/services/auth/CaretAuthCompatLayer.ts`
- **작업**: Step 3의 분석 결과를 바탕으로, Caret의 인증 로직이 새로운 Cline의 인증 메커니즘과 호환될 수 있도록 중간 계층(Compatibility Layer)을 설계한다.

## 4. 다음 단계

- **Step 1**을 실행하기 위해 `src/core/workspace/setup.ts` 파일을 읽고 분석을 시작한다.
