# F00 - Cline Bugfix & Patch

**상태**: ✅ 진행 중  
**영향 범위**: Backend, Terminal, System Integration  
**우선순위**: 🔴 High

---

## 📋 개요

Cline 원본 코드에서 발견된 버그나 Caret 환경에서 발생하는 문제를 해결하기 위한 패치 모음입니다.  
Caret은 Cline의 기능을 100% 호환하면서도, 안정성과 브랜딩 일관성을 위해 필요한 최소한의 수정을 가합니다.

## 🛠️ 패치 목록

### 1. Terminal 안정화 & 브랜딩 복구 (Linux Shell Integration)
Linux + Shell Integration 조합에서 `executeCommandTool` 명령이 종료되지 않거나(hang), 터미널이 `Cline` 이름/아이콘으로 표시되는 문제를 수정했습니다.

- **문제점**: Linux 환경에서 Shell Integration 스트림이 닫히지 않아 명령 수행이 멈추는 현상, CLI 터미널이 Cline 브랜딩으로 노출됨.
- **해결책**:
  - **터미널 스트림 타임아웃**: stream idle 시 5초 후 강제 완료 처리 (`STREAM_IDLE_TIMEOUT`).
  - **브랜딩 일관성**: `TerminalRegistry`/`executeCommandInTerminal`에서 Caret 이름/아이콘 사용 강제.

### 2. (추가될 버그픽스 공간)
- *추후 Cline 원본의 버그나 호환성 문제가 발견되면 이곳에 기록합니다.*

---

## 🏗 수정 파일 (Code Scope)

| 영역 | 파일 | 변경 요약 |
| --- | --- | --- |
| **Terminal** | `src/integrations/terminal/TerminalProcess.ts` | `STREAM_IDLE_TIMEOUT` 래퍼 추가, idle 시 스트림 종료. |
| **Terminal** | `src/integrations/terminal/TerminalRegistry.ts` | `getTerminalBranding()` 도입, `initialize(context)`에서 displayName/아이콘 경로 캐시. |
| **Terminal** | `src/hosts/vscode/hostbridge/workspace/executeCommandInTerminal.ts` | ad-hoc 터미널 생성 시에도 `getTerminalBranding()` 사용. |
| **Main** | `src/extension.ts` | activate 초기에 `TerminalRegistry.initialize(context)` 호출. |
| **Utils** | `caret-src/utils/brand-utils.ts` | dist/CLI 경로에서도 `package.json`을 찾도록 다중 후보 경로 탐색. |

---

## ✅ 검증 항목

1. **Linux (Shell Integration 지원)**
   - VS Code Dev Host에서 Caret에게 `node -v`, `npm -v` 요청.
   - 5초 내 `TerminalProcess`가 `continue` 이벤트를 emit하고 Task가 unblock 되는지 확인.
2. **Linux (Shell Integration 미지원 / Cursor 등)**
   - fallback 분기(`terminal.sendText`)가 실행되고 3초 뒤 자동 continue 되는지 확인.
3. **브랜딩**
   - CLI 설치 배너와 VS Code 터미널 제목이 `"Caret"` + `robot_panel_light/dark.png`로 표시되는지 스크린샷 저장.
4. **Regression**
   - `npm run package:release` → 설치 후 `HostProvider.workspace.executeCommandInTerminal` 호출 경로 로그에 `success: true` 확인.

---

## 📎 참고

- 머징 표준 가이드의 **Backend Critical Files** 목록에 해당 파일 3종(TerminalRegistry / TerminalProcess / executeCommandInTerminal)이 추가됨.
- 머징 실행 마스터 플랜 Phase 4.T 항목과 연동되어, 다음 라운드에서도 자동으로 체크되도록 했다.
