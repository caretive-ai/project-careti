# Smart Terminal Hub (멀티 에이전트 오케스트레이션)

## 📋 개요
- **목적**: codex/claude-code 등 외부 에이전트와 CLI들을 Caret이 상위 에이전트로 제어(열기/대화/판정/중재)하는 터미널 허브.
- **상태**: 설계 완료, 개발 착수 가능. Cline 머지와 독립된 별도 feature로 진행 후 합류 검토.

### 업스트림(Cline) 반영 현황 주의
- 현재 진행 중인 Cline v3.35.0 머지 로그에 따르면 최신 Cline은 **CLI/exec/stream 기능**을 포함하고 있음. Smart Terminal Hub는 중복 구현을 피하고 Cline CLI 경로 재사용을 우선한다.
- 전략: 터미널/exec의 저층 기능은 Cline CLI/TerminalManager를 재사용하고, Caret 고유 가치는 **세션 중재·멀티에이전트 오케스트레이션·요약/판정 UX**에 집중한다. 별도 CLI 추가 시 경로/네임스페이스를 분리하고 기본값은 off로 유지.

## 🧭 목표/시나리오
- **가위바위보**: codex/claude-code 각 세션에 물어보고 Caret이 승패 판정.
- **토론 중재**: 하나의 주제로 라운드별 질문/반론을 보내고, 실시간 로그+중재/요약을 사용자에게 보여준 뒤 결론 제공.
- **멀티 세션 제어**: 여러 터미널을 동시에 열어 CLI/REPL을 병렬 실행하고 상태를 관리.

## 🏗️ 아키텍처/변경 범위 (머지 영향 최소화 방침)
- **기존 재사용**: `caret-src/integrations/terminal/interactive/{InteractiveSession,SessionManager}` + `VSCodeTerminalAdapter(node-pty)` 유지.
- **신규/추가 레이어 (caret-src 우선, 기본값 off)**  
  - `TerminalService`(신규): SessionManager + adapter 팩토리 + EventBus 싱글톤.  
  - `TerminalEventBus`(신규): JSONL 이벤트(`session_opened/closed`, `output`, `exit`, `error`, `command_sent`) publish.  
  - `Headless CLI gateway`(신규): `cli/terminal-gateway.ts`에서 open/send/read/list/close를 JSONL로 출력.  
  - `Feature flags`: `features.terminal_stream`, `features.terminal_headless`, `features.terminal_tty_required` (기본 false → upstream 동작 보존).  
  - 환경 토글: 임시로 `CARET_TERMINAL_STREAM=true` 환경 변수가 설정된 경우에만 EventBus 활성화. 기본값은 미설정(비활성).
  - `UI(웹뷰)`: 세션 리스트 + 패널. `Live(stream)` 탭(색상/라벨로 JSONL 표시) / `Summary` 탭(중재·결론). 스위치로 stream on/off.
- **필수 최소 수정 (src 경로)**  
  - `src/shared/tools.ts`/`ToolExecutor`/`assistant-message`의 tool 등록 부분만 유지/확장.  
  - `TerminalToolHandler`: manager 접근을 `getTerminalService()`로 교체, 새 액션 stub(`resize/signal`)은 `not_implemented` 반환.  
  - 시스템 프롬프트: `caret-src/core/prompts/sections/TERMINAL_TOOL_GUIDE.json`에 스트리밍/헤드리스 사용법 추가.
- **머지 전략**: 새 파일/플래그 중심으로 격리, 기본값 off → Cline 머지 시 충돌 최소화. CARET MOD 주석 유지.

## 🧪 테스트 (요약, 상세는 보고서 참조)
- 단위: SessionManager ULID/메타데이터, InteractiveSession readOutput 타임아웃, EventBus publish/dispose, PTY 실패 시 fallback(플래그 off).  
- 통합: Python/Node REPL open→send→read, Ctrl+C(stop), list/close, PTY on/off 비교.  
- CLI(JSONL): `pnpm caret terminal --action open ... --json` 등으로 이벤트 시퀀스 검사.  
- 플래그: `terminal_stream` off/on, `terminal_headless` off, `terminal_tty_required` on/off 동작 차이.  
- 수동 프롬프트: 가위바위보/토론 시나리오를 채팅창에서 실행(스트림 on일 때 실시간 로그, off일 때 요약만).

## 📎 참고/출처
- 상세 설계·테스트 시나리오: `caret-docs/보고서(reports)/프로젝트 개선/codex-caret-smart-terminal-통합-계획.md`
- 업스트림 머지 가이드: `caret-docs/guides/upstream-merging.md` (충돌 시 --onto 전략)
