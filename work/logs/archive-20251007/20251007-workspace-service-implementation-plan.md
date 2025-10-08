# Workspace Service 구현 및 연동 계획

## 1. 분석 요약

`src/core/workspace/setup.ts` 분석 결과, Cline은 더 이상 `GlobalState`에 워크스페이스 정보를 저장하지 않고, `HostProvider.workspace.getWorkspacePaths({})`를 통해 동적으로 조회하는 방식으로 변경되었다. `setup.ts`에 남아있는 `setGlobalState` 호출 코드가 컴파일 에러의 직접적인 원인이다.

## 2. 목표

'최소 침습' 및 '`caret-src` 우선' 원칙에 따라 `CaretWorkspaceService`를 구현하고, `setup.ts`의 컴파일 에러를 해결하여 그룹 B 문제 해결의 기반을 마련한다.

## 3. 작업 단계

### Step 1: `CaretWorkspaceService` 골격 생성

- **경로**: `caret-src/services/workspace/CaretWorkspaceService.ts`
- **작업**: 워크스페이스 정보를 관리하고 제공할 독립 서비스의 기본 골격을 생성한다.
- **예상 코드**:
  ```typescript
  import * as vscode from 'vscode';
  import { HostProvider } from '@/hosts/host-provider';

  export class CaretWorkspaceService {
    private roots: readonly vscode.Uri[] = [];
    private primaryRootIndex: number = 0;

    constructor() {
      // 초기화 로직
    }

    public async initialize(): Promise<void> {
      const response = await HostProvider.workspace.getWorkspacePaths({});
      // TODO: response를 바탕으로 roots와 primaryRootIndex를 설정하는 로직 구현
    }

    public getWorkspaceRoots(): readonly vscode.Uri[] {
      return this.roots;
    }

    public getPrimaryRootIndex(): number {
      return this.primaryRootIndex;
    }
  }
  ```

### Step 2: `setup.ts` 최소 침습 수정

- **대상 파일**: `src/core/workspace/setup.ts`
- **작업**: 컴파일 에러를 유발하는, 이미 삭제된 `GlobalState` 키(`workspaceRoots`, `primaryRootIndex`)에 값을 할당하는 두 줄의 코드를 제거한다.
- **수정 전**:
  ```typescript
  stateManager.setGlobalState("workspaceRoots", manager.getRoots())
  stateManager.setGlobalState("primaryRootIndex", manager.getPrimaryIndex())
  ```
- **수정 후**: 해당 라인들을 주석 처리하거나 삭제한다.

### Step 3: 원칙 준수 체크리스트 검증

- **수정 대상**: `src/core/workspace/setup.ts`
- **검증**:
  - [x] **1. `src` 수정이 불가피한가?**: 예. Cline 원본 파일의 컴파일 에러를 직접 수정해야 하므로 불가피하다.
  - [x] **2. 수정 범위가 최소한인가?**: 예. 에러를 유발하는 2줄의 코드만 제거하므로 최소한의 수정이다.
  - [x] **3. `// CARET MODIFICATION:` 주석을 포함했는가?**: 예. 수정 시 주석을 추가할 것이다.
  - [x] **4. 향후 병합 영향을 분석했는가?**: 예. 삭제된 상태 키를 사용하는 레거시 코드를 제거하는 것이므로, 향후 병합 시 충돌 가능성이 낮고 오히려 긍정적이다.

## 4. 다음 단계

- **Step 1**을 실행하여 `CaretWorkspaceService.ts` 파일을 생성한다.
- **Step 2**와 **Step 3**을 실행하여 `setup.ts` 파일을 수정한다.
