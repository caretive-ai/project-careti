# Task 011: 디버그 호스트 UI 버튼 동작 불능 문제 해결

- **문서 상태**: `수정 완료`
- **작업 상태**: `수정 중`
- **담당자**: `Alpha`
- **검토자**: `luke`

## 1. 목표

VS Code 확장 기능 디버그 모드에서 Caret UI의 상단 버튼들('설정', '계정', 'MCP' 등)이 동작하지 않는 문제를 해결한다. 최종적으로 모든 UI 기능이 정상 동작하도록 복구하고, 문제의 근본 원인을 명확히 문서화하여 재발을 방지한다.

## 2. 최종 원인 심층 분석 (수정 완료)

문제의 현상은 `is not a function` 에러이지만, 근본 원인은 **`private` 접근 제어자로 인한 상속 체계의 붕괴**이다. 이는 단일 파일의 문제가 아닌, 여러 파일에 걸친 연쇄적인 초기화 실패로 이어진다.

### '설정', '계정', 'MCP' 버튼 클릭부터 에러 발생까지의 전체 흐름

1.  **UI 계층 (클릭)**: 사용자가 웹뷰(`webview-ui/src/components/Header.tsx`)에서 버튼을 클릭하면, `vscode.postMessage`를 통해 확장 프로그램 측으로 `{ command: 'button_clicked', id: '...' }` 형태의 메시지를 보낸다. (`id`는 각각 'settings', 'account', 'mcp')

2.  **메시지 수신 및 변환 (WebviewProvider -> Controller)**:
    *   `CaretProvider`가 메시지를 수신하고, 부모 클래스인 `WebviewProvider`(`src/core/webview/index.ts`)의 로직을 통해 `Controller`(`src/core/controller/index.ts`)의 `handleWebviewMessage`로 전달한다.
    *   `Controller`는 `id` 값에 따라 `vscode.commands.executeCommand()`를 호출하여 각 버튼에 맞는 명령어를 실행시킨다. (`caret.settingsButtonClicked`, `caret.accountButtonClicked`, `caret.mcpButtonClicked`)

3.  **명령어 실행 (Extension)**:
    *   `caret-src/extension.ts`에 등록된 각 명령어의 핸들러가 실행된다.
    *   핸들러는 `CaretProvider.getSidebarInstance().controller.handle...Click()` 형태의 함수를 호출한다.

4.  **에러 발생 및 근본 원인**:
    *   **바로 이 지점에서 `is not a function` 에러가 발생한다.**
    *   **원인**: `CaretProvider`가 부모인 `ClineWebviewProvider`를 상속할 때, 부모의 `disposables` 멤버 변수가 `private`으로 선언되어 있었다.
    *   **결과**: 이로 인해 `CaretProvider`는 이벤트 리스너 등록 등 필수 초기화 로직을 `disposables` 배열에 추가할 수 없었고, 결과적으로 `controller` 객체가 **메소드가 없는 껍데기만 있는 불완전한 상태**로 생성되었다.
    *   **결론**: 세 버튼 모두 각기 다른 명령어를 호출하지만, 결국 **불완전하게 생성된 `controller`의 존재하지 않는 메소드를 호출**하려다 동일한 원인으로 실패한다.

## 3. 최종 해결 계획 (수정 완료)

이전의 잘못된 접근(원인 분석 없는 성급한 코드 수정)을 폐기하고, 심층 분석 결과에 기반한 체계적인 계획을 수립한다. **코딩에 앞서 반드시 계획을 먼저 수립하고, 문서화하며, 원칙을 준수한다.**

### Phase 1: 코드 기반 복구 (Foundation First)

- **목표**: 상속 체계를 바로잡아 `CaretProvider`가 완벽하게 초기화되도록 한다.
- **작업 계획**:
    1.  **`.caretrules` 절차 준수**:
        - **백업 확인**: `src/core/webview/index-ts.cline` 백업 파일의 존재를 확인한다. (완료)
        - **최소 수정**: `src/core/webview/index.ts`에서 `private disposables`를 `protected disposables`로 변경하고, `CARET MODIFICATION` 주석을 추가한다. **이것이 모든 문제 해결의 시작점이다.**
    2.  **`CaretProvider.ts` 수정**:
        - `ClineWebviewProvider`를 상속받아, `resolveWebviewView`를 오버라이드한다.
        - `protected`가 된 `disposables`를 사용하여 이벤트 리스너를 올바르게 등록한다.
        - `localResourceRoots`에 Vite 개발 서버 경로와 `codicons` 경로를 추가한다.
        - `getHMRHtmlContent`에 `codicons` 링크와 `react-refresh` 스크립트가 포함되도록 수정하여 UI 렌더링 문제를 해결한다.

### Phase 2: 기능 구현 및 검증

- **목표**: 정상화된 기반 위에서 버튼 기능들을 올바르게 연결하고 최종 검증한다.
- **작업 계획**:
    1.  **`extension.ts` 수정**:
        - **Phase 1이 완료되어 `CaretProvider`가 정상화된 것을 확인한 후에만** 이 단계를 진행한다.
        - 원본 `src/extension.ts`의 로직을 기반으로, 모든 버튼의 명령어 핸들러(`settings`, `account`, `mcp`, `history`, `plus`, `popout` 등)가 `controller`의 올바른 메소드를 호출하도록 재구현한다.
    2.  **최종 검증**:
        - `npm run compile`로 빌드가 성공하는지 확인한다.
        - `npm run test:all`로 모든 테스트가 통과하는지 확인한다.
        - 디버그 모드를 실행하여, UI, 아이콘, 모든 버튼이 완벽하게 동작하는지 최종 검증한다.

### Phase 3: 프로젝트 식별자 통일 (Namespace & ID 변경)

- **목표**: 프로젝트 전반에 걸쳐 남아있는 `cline` 식별자를 `caret`으로 변경하여 잠재적인 컴파일 오류를 제거하고 프로젝트의 정체성을 통일한다.
- **작업 계획**:
    1.  **문제 식별**: `npm run compile` 과정에서 다수의 `proto.cline` 관련 타입 에러(e.g., `TS2694: Namespace has no exported member 'cline'`)가 발생함을 확인했다. 이는 `proto` 파일의 네임스페이스가 `caret`으로 변경되었음에도 불구하고, 다수의 타입스크립트 파일이 여전히 이전 네임스페이스를 참조하고 있었기 때문이다.
    2.  **`proto` 네임스페이스 수정**:
        - 문제 발생 파일들(`getAvailableTerminalProfiles.ts`, `updateDefaultTerminalProfile.ts` 등)을 대상으로, `.cline` 백업 원칙을 준수하며 모든 `proto.cline` 참조를 `proto.caret`으로 수정했다.
        - 이 과정에서 일부 파일은 이미 `proto.caret`으로 수정되어 있었으나, 일부는 누락되어 있어 컴파일 오류의 원인이 되고 있었다.
    3.  **`package.json` 식별자 수정**:
        - `proto` 네임스페이스 문제 해결 과정에서, `package.json`을 비롯한 프로젝트 설정 파일 곳곳에 `cline`이라는 ID가 남아있는 것을 추가로 발견했다.
        - `Caret`으로의 완전한 포크를 위해 `package.json`의 `name`, `displayName`, `description` 및 각종 명령어 스크립트에 포함된 `cline` ID를 모두 `caret`으로 통일했다.
    4.  **결과 및 교훈**:
        - 단순한 기능 버그 수정뿐만 아니라, 프로젝트의 이름, 네임스페이스, ID와 같은 핵심 식별자를 일관성 있게 관리하는 것이 중요하다는 점을 확인했다.
        - 이러한 식별자 불일치는 당장의 컴파일 오류를 넘어, 향후 유지보수 및 업스트림(Cline)과의 변경점 비교 시 혼란을 야기할 수 있으므로 초기에 바로잡는 것이 필수적이다.
