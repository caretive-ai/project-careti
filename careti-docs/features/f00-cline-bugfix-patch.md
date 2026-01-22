# F00 - Cline Bugfix & Patch

**상태**: ✅ 진행 중  
**영향 범위**: Backend, Terminal, System Integration  
**우선순위**: 🔴 High

---

## 📋 개요

Cline 원본 코드에서 발견된 버그나 Careti 환경에서 발생하는 문제를 해결하기 위한 패치 모음입니다.  
Careti은 Cline의 기능을 100% 호환하면서도, 안정성과 브랜딩 일관성을 위해 필요한 최소한의 수정을 가합니다.

## 🛠️ 패치 목록

### 1. Terminal 안정화 & 브랜딩 복구 (Linux Shell Integration)
Linux + Shell Integration 조합에서 `executeCommandTool` 명령이 종료되지 않거나(hang), 터미널이 `Cline` 이름/아이콘으로 표시되는 문제를 수정했습니다.

- **문제점**: Linux 환경에서 Shell Integration 스트림이 닫히지 않아 명령 수행이 멈추는 현상, CLI 터미널이 Cline 브랜딩으로 노출됨.
- **해결책**:
  - **터미널 스트림 타임아웃**: stream idle 시 5초 후 강제 완료 처리 (`STREAM_IDLE_TIMEOUT`).
  - **브랜딩 일관성**: `TerminalRegistry`/`executeCommandInTerminal`에서 Careti 이름/아이콘 사용 강제.

### 2. 도구 승인/Ask 동시성 (Fix: `Current ask promise was ignored`)
아래 형태로 표면화되는 레이스/경합을 완화합니다:
`Error executing <tool>: Current ask promise was ignored` (예: `read_file`, `write_to_file`, `ask_followup_question`, `execute_command`).

- **증상**:
  - 도구 승인(approval) 프롬프트 및 기타 ask가 간헐적으로 실패(사용자 입장에서는 UI가 정상인데도 오류로 종료).
  - 도구 실패가 연쇄되며 다른 도구/디프 편집 흐름까지 깨질 수 있음.
- **원인(Cline-compat 레이어)**:
  - 기존 `Task.ask()`가 “현재 ask 유효성” 판정에 범용 메시지 타임스탬프(`lastMessageTs`)를 사용 → ask 대기 중 `say()`가 끼면 ask가 무효화될 수 있음.
  - 타임스탬프를 분리해도, *실제 concurrent ask*(첫 ask 응답 대기 중 두 번째 ask 시작)가 발생하면 여전히 한쪽이 ignored로 종료될 수 있음(툴 체인/취소-재개 흐름 등).
- **해결(Careti 우선 적용)**:
  - **ask 유효성 분리**: `lastAskTs`를 도입하고 ask 유효성 판정에 사용(= `say()`로 ask가 무효화되지 않도록).
  - **ask 직렬화(큐/뮤텍스)**: `partial=true`(스트리밍 UI 업데이트) 예외를 제외하고, non-partial ask는 1개만 in-flight가 되도록 직렬화.
  - **abort 안전성**: abort 시 ask 대기가 즉시 종료되어 락이 해제되도록 보완(교착 방지).
  - **보조 완화**: 비병렬 모드에서 complete tool 연쇄 실행 경합을 줄이기 위해 complete-tool 경로에서 `didAlreadyUseTool`을 더 이르게 설정.

### 3. Cline과 동시 설치(공존) 시 활성화 실패 (Command ID 충돌)
Careti와 Cline을 동시에 설치했을 때 아래 오류로 Cline 활성화가 실패할 수 있습니다:
`Activating extension 'saoudrizwan.claude-dev' failed: command 'cline.plusButtonClicked' already exists.`

- **원인**: Careti가 Cline과 동일한 전역 command ID(예: `cline.plusButtonClicked`)를 등록하고 있었고, VS Code는 command ID가 전역 유니크여야 함.
- **해결**: Careti command를 확장 ID prefix로 네임스페이스 분리 (예: `caretive.careti.plusButtonClicked`).
- **주의**:
  - Careti의 기존 `cline.*` command ID를 직접 참조하던 사용자 커스텀 키바인딩/자동화가 있다면 업데이트가 필요.
  - 내장 keybindings/menus는 함께 갱신됨.

### 4. (추가될 버그픽스 공간)
- *추후 Cline 원본의 버그나 호환성 문제가 발견되면 이곳에 기록합니다.*

---

## 🏗 수정 파일 (Code Scope)

| 영역 | 파일 | 변경 요약 |
| --- | --- | --- |
| **Terminal** | `src/integrations/terminal/TerminalProcess.ts` | `STREAM_IDLE_TIMEOUT` 래퍼 추가, idle 시 스트림 종료. |
| **Terminal** | `src/integrations/terminal/TerminalRegistry.ts` | `getTerminalBranding()` 도입, `initialize(context)`에서 displayName/아이콘 경로 캐시. |
| **Terminal** | `src/hosts/vscode/hostbridge/workspace/executeCommandInTerminal.ts` | ad-hoc 터미널 생성 시에도 `getTerminalBranding()` 사용. |
| **Main** | `src/extension.ts` | activate 초기에 `TerminalRegistry.initialize(context)` 호출. |
| **Utils** | `careti-src/utils/brand-utils.ts` | dist/CLI 경로에서도 `package.json`을 찾도록 다중 후보 경로 탐색. |
| **Task** | `src/core/task/TaskState.ts` | `lastAskTs` 추가(ask 유효성 판정에서 `say()`와 분리). |
| **Task** | `src/core/task/index.ts` | ask 뮤텍스로 직렬화, abort-safe 대기, `lastAskTs` 기반 유효성 판정. |
| **Task** | `src/core/task/ToolExecutor.ts` | 비병렬 모드에서 complete tool 경합 완화(`didAlreadyUseTool` 선설정). |
| **Tests** | `src/core/task/__tests__/TaskAskConcurrency.test.ts` | ask/say 경합 및 ask 직렬화 회귀 테스트. |
| **VS Code** | `package.json` | `contributes.commands` + menus + keybindings의 `cline.*` → `caretive.careti.*` 변경. |
| **VS Code** | `src/registry.ts` | command prefix를 `${publisher}.${name}`로 사용해 Cline과 충돌 방지. |
| **Dev** | `src/dev/commands/tasks.ts` | dev command ID를 `caretive.careti.dev.*`로 변경. |
| **Tests** | `src/test/extension.test.ts` | plus 버튼 command를 `${publisher}.${name}.plusButtonClicked`로 실행. |
| **UI** | `src/core/controller/ui/openWalkthrough.ts` | 현재 extension id 기반으로 `CaretWalkthrough` 열기. |

---

## ✅ 검증 항목

1. **Linux (Shell Integration 지원)**
   - VS Code Dev Host에서 Careti에게 `node -v`, `npm -v` 요청.
   - 5초 내 `TerminalProcess`가 `continue` 이벤트를 emit하고 Task가 unblock 되는지 확인.
2. **Linux (Shell Integration 미지원 / Cursor 등)**
   - fallback 분기(`terminal.sendText`)가 실행되고 3초 뒤 자동 continue 되는지 확인.
3. **브랜딩**
   - CLI 설치 배너와 VS Code 터미널 제목이 `"Careti"` + `robot_panel_light/dark.png`로 표시되는지 스크린샷 저장.
4. **Regression**
   - `npm run package:release` → 설치 후 `HostProvider.workspace.executeCommandInTerminal` 호출 경로 로그에 `success: true` 확인.
5. **Ask 동시성**
   - 승인 프롬프트가 필요한 도구(예: `read_file`)를 반복 실행하고 `Current ask promise was ignored`가 더 이상 발생하지 않는지 확인.
6. **동시 설치(공존)**
   - Careti + Cline 동시 설치 후, 어느 쪽도 command ID 중복으로 활성화 실패하지 않는지 확인.

---

## 📎 참고

- 머징 표준 가이드의 **Backend Critical Files** 목록에 해당 파일 3종(TerminalRegistry / TerminalProcess / executeCommandInTerminal)이 추가됨.
- 머징 실행 마스터 플랜 Phase 4.T 항목과 연동되어, 다음 라운드에서도 자동으로 체크되도록 했다.
- upstream(Cline) 관점에서는 “ask 동시성” 이슈가 재현된다면 askId 매칭 또는 ask 큐(직렬화)가 가장 안전한 해결 방향임.
