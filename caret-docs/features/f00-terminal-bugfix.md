# F00 - Terminal 안정화 & 브랜딩 복구

**상태**: ✅ Phase 4.T 완료  
**영향 범위**: Backend (VS Code Host, CLI install flow)  
**우선순위**: 🔴 High

---

## 📋 개요

Caret 최신 버전에서는 Linux + Shell Integration 조합에서 `executeCommandTool` 명령이 종료되지 않거나, CLI 설치 중 생성되는 터미널이 `Cline` 이름/아이콘으로 표시되는 문제가 있었다.  
이번 머징에서는 다음 두 가지 축을 반드시 복구한다.

1. **터미널 스트림 타임아웃**: shell integration stream이 더 이상 데이터를 내보내지 않으면 5초 후 자동 완료 처리해 hang을 막는다.
2. **브랜딩 일관성**: `TerminalRegistry`/`executeCommandInTerminal` 모두 Caret 이름·아이콘을 사용하고, `brand-utils`는 dist/CLI 환경에서도 `package.json`을 정확히 읽는다.

---

## 🏗 수정 파일

| 파일 | 변경 요약 |
| --- | --- |
| `src/integrations/terminal/TerminalProcess.ts` | `STREAM_IDLE_TIMEOUT` 래퍼 추가, idle 시 스트림 종료. |
| `src/integrations/terminal/TerminalRegistry.ts` | `getTerminalBranding()` 도입, `initialize(context)`에서 displayName/아이콘 경로 캐시. |
| `src/hosts/vscode/hostbridge/workspace/executeCommandInTerminal.ts` | ad-hoc 터미널 생성 시에도 `getTerminalBranding()` 사용. |
| `src/extension.ts` | activate 초기에 `TerminalRegistry.initialize(context)` 호출. |
| `caret-src/utils/brand-utils.ts` | dist/CLI 경로에서도 `package.json`을 찾도록 다중 후보 경로 탐색. |

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

