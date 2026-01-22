# Codex 오픈소스 대비 Careti Smart Terminal 개선·통합 계획

작성: Codex 에이전트  
목표: Smart Terminal을 “상위 에이전트 허브”로 완성하고, Codex 오픈소스에서 배울 점을 Careti에 반영해 멀티 에이전트/멀티 CLI 제어 역량을 강화한다.

---

## 1) 현재 Careti Smart Terminal 상태 (코드 기준)
- **핵심 경로**: `careti-src/integrations/terminal/interactive/`  
  - `InteractiveSession.ts`: 출력 버퍼링, async `readOutput`, 입력 전송  
  - `SessionManager.ts`: ULID 세션 ID, 생성/조회/종료/목록  
  - `adapters/vscode/VSCodeTerminalAdapter.ts`: `node-pty` 기반 PTY, 출력 `onData`, Ctrl+C는 상위에서 보내도록 의존  
  - `core/interfaces/ITerminalAdapter.ts`, `core/types.ts`: 인터페이스/타입
- **Tool 연결**: `src/core/task/tools/handlers/TerminalToolHandler.ts`가 6 액션(open/send/read/stop/close/list)을 TaskConfig와 연결.
- **부족한 점**  
  1) **헤드리스/멀티 에이전트 진입점 부재**: 외부 에이전트(Codex CLI, Claude Code 등)가 터미널 세션을 재사용할 API/프로토콜이 없음.  
  2) **플래그/프로필 기반 실험 토글 부재**: PTY/헤드리스/스트리밍 같은 기능을 안전하게 on/off 할 제어 레이어가 없음.  
  3) **출력 스트리밍·관측성 부족**: JSONL 이벤트 스트림, 로그/트레이싱 경로 정비 필요.  
  4) **IDE 확장성**: VS Code 어댑터만 존재, IntelliJ 어댑터 스텁/계획 부재.  

---

## 2) Codex 오픈소스에서 배울 수 있는 포인트 (핵심만)
- **비대화형 실행 모드**: `codex exec`이 JSONL 스트림/구조화 출력/마지막 결과 파일 쓰기를 지원 → 헤드리스 자동화/CI/다른 에이전트 호출이 쉬움 (`codex/docs/exec.md`).  
- **풍부한 플래그·프로필**: `config.toml` + `--config key=value` + `[features]`로 실험 기능을 안전하게 토글 (`codex/docs/config.md`).  
- **스트리머블/PTY 실행**: `unified_exec`, `streamable_shell` 같은 PTY 기반 실행을 기능 플래그 단위로 켜서 호환성/안전성 관리.  
- **이벤트/관측성**: JSONL 이벤트 타입(`thread/turn/item`, `command_execution`, `file_change`, `mcp_tool_call`, …)을 표준화해 외부 툴이 상태를 구독 가능.  

---

## 3) 목표 아키텍처 (텍스트 구조도)
```
[Careti Task Layer]
  └─ ToolExecutor
       └─ TerminalToolHandler (IDE/자동화 공용)
             │
             ▼
[Terminal Service Layer]  ← 기존 SessionManager/InteractiveSession/Adapters 리팩터링
  ├─ SessionManager (ULID, metadata, lifecycle)
  ├─ InteractiveSession (buffer + async read)
  ├─ Adapters
  │   ├─ VSCodeTerminalAdapter (node-pty, 완료)
  │   └─ IntelliJTerminalAdapter (pty4j, 예정)
  └─ Stream Bridge (신규)
       ├─ JSONL event emitter (open/send/read/exit/error)
       └─ API surface (CLI/HTTP/gRPC 중 택1)

[Headless/External Entry Points]
  ├─ careti-cli (신규 하위명령: terminal, exec-like)
  └─ Optional HTTP gateway (다른 에이전트가 subscribe)

[Config/Feature Flags]
  ├─ features.terminal_headless (headless gateway on/off)
  ├─ features.terminal_stream (JSONL stream on/off)
  ├─ features.terminal_tty (PTY 필수 vs fallback)
```

---

## 4) 작업 계획 (파일 단위로 “무엇을 어떻게 바꾼다”)

### Phase 0 – 사전 정리
- 머징 우선순위 반영: 현재 브랜치 대비 upstream 머지 완료 후 진행. (충돌 가능성이 큰 `ToolExecutor`/`assistant-message`/`tools.ts`는 머지 끝난 뒤 수정)

### Phase 1 – 터미널 서비스 정리/확장
1. **서비스 경계 명확화**  
   - 새 파일: `careti-src/integrations/terminal/interactive/service/TerminalService.ts` (팩토리 + export)  
   - 역할: `SessionManager`를 보유하고 adapters를 주입받는 단일 엔트리.  
   - 기존 `adapters/vscode/index.ts`의 `getGlobalSessionManager`는 `getTerminalService()`(싱글톤)로 교체해 세션 관리와 스트리밍 브리지를 같은 경로로 노출.
2. **IntelliJ 어댑터 스텁**  
   - 새 파일: `careti-src/integrations/terminal/interactive/adapters/intellij/IntelliJTerminalAdapter.ts`  
   - 내용: `ITerminalAdapter` 구현 스텁 + `TODO(pt y4j wiring)` + 테스트 skip guard.  
   - 목적: 코드 구조를 두 IDE가 공유하도록 정리하고, 빌드 시 선택 가능하도록 준비.
3. **스트림 브리지 초안**  
   - 새 파일: `careti-src/integrations/terminal/interactive/stream/TerminalEventBus.ts`  
   - 내용: EventEmitter 기반 JSONL 이벤트 (`session_opened`, `session_closed`, `output`, `exit`, `error`, `command_sent`)를 publish.  
   - `InteractiveSession` 내부에서 `emit` 대신 브리지를 경유하도록 훅 추가(옵션 설정).

### Phase 2 – Tool/Config 통합
1. **TerminalToolHandler 간소화 & 확장 포인트** (`src/core/task/tools/handlers/TerminalToolHandler.ts`)  
   - `manager` 접근을 `getTerminalService()`로 교체.  
   - `read`/`send` 결과에 `events`(새 출력 없으면 `[]`)와 `updated_at` timestamp 포함.  
   - Ctrl+C 외에 `resize`/`signal` 액션을 예약(스위치 케이스 stub, `not_implemented` 반환).  
2. **Config 플래그 도입**  
   - 위치: `src/core/config/index.ts` 또는 기존 config 로딩 지점에 `features.terminal_headless`, `features.terminal_stream`, `features.terminal_tty_required` 추가.  
   - `TerminalToolHandler`와 `TerminalService`가 플래그를 읽어 동작 변경:  
     - `terminal_tty_required=false`일 때 PTY 오류 시 `spawn` fallback 허용(로그 남김).  
     - `terminal_stream=true`일 때 EventBus 활성화.
3. **System prompt/tool metadata**  
   - `careti-src/core/prompts/sections/TERMINAL_TOOL_GUIDE.json`: 스트리밍/헤드리스 사용법, 새로운 액션(resize/signal) 설명 추가.  

### Phase 3 – Headless 진입점(멀티 에이전트 허브)
1. **CLI 엔드포인트**  
   - 새 파일: `cli/terminal-gateway.ts`  
   - 명령: `pnpm careti terminal --action open/send/read/list --json` 형태로 JSONL 이벤트 출력.  
   - 내부에서 `TerminalService` 사용, `--session-id`로 기존 세션 재사용.  
   - 안전 가드: Git 리포 체크, `--sandbox` 옵션은 기존 CLI 정책 준수.
2. **JSONL 이벤트 포맷 정리**  
   - 새 문서: `careti-docs/development/terminal-events.md`  
   - 스키마: `{type, session_id, data, ts}` 형식으로 Codex 이벤트(`item.*`)와 호환되게 설계.

### Phase 4 – 테스트/검증
1. **단위 테스트**  
   - `careti-src/integrations/terminal/interactive/__tests__/unit/`에 EventBus/Service 테스트 추가.  
   - PTY 불가 환경에서 fallback 동작을 `terminal_tty_required=false`로 검증.  
2. **통합 테스트**  
   - `node-repl.test.ts` 업데이트: JSONL 이벤트가 순서대로 나오는지 확인.  
   - 새 테스트: CLI `terminal-gateway` 스냅샷(입력→JSONL 시퀀스).  
3. **문서 스냅샷**  
   - 보고서 및 개발 가이드에 새로운 이벤트/플래그 반영.

### Phase 5 – IntelliJ 준비 (병행/후순위)
1. IntelliJ 어댑터를 실제 pty4j 연동으로 구현, 빌드 플래그/조건부 import로 VS Code와 분리.  
2. IDE별 설정 선택지 문서화 (`careti-docs/development/frontend-backend-interaction-patterns.md`에 추가).

---

## 5) 마이그레이션 메모
- **브랜치 전략**: `smart-terminal` → `smart-terminal/headless-infra`로 분기해 머지 리스크를 최소화.  
- **릴리즈 토글**: 기본값은 기존 동작 유지 (`terminal_headless=false`, `terminal_stream=false`).  
- **호환성**: VS Code 어댑터가 PTY 실패 시 spawn fallback을 허용할지 플래그로 제어.  
- **문서 위치**:  
  - 본 보고서: `careti-docs/보고서(reports)/프로젝트 개선/`  
  - 이벤트 스펙: `careti-docs/development/terminal-events.md` (신규)  
  - 시스템 프롬프트 가이드: `careti-src/core/prompts/sections/TERMINAL_TOOL_GUIDE.json` 업데이트  

---

## 6) 바로 다음 액션 제안 (우선순위 순)
1) 머지 완료 대기 후 **Phase 1**부터 착수: TerminalService 도입 + getTerminalService로 교체.  
2) **EventBus JSONL** 추가해 스트리밍 경로 확보(Phase 1.3), 이어서 `terminal_stream` 플래그 연동(Phase 2.2).  
3) 간단한 **CLI 게이트웨이**(Phase 3.1)로 다른 에이전트(Codex/Claude Code)와 세션을 공유할 수 있게 만들기.  
4) 테스트/문서 업데이트(Phase 4)로 완료선 정의.  

---

## 7) 머지 친화성 강화 메모 (Cline upstream 대비 변경 범위 최소화)
- **기본 전략**: 새로운 기능은 `careti-src/` 아래에 추가·주입하고, `src/`(Cline 경로)는 최소 수정만 수행. Tool 등록/enum 변경 같은 필수 수정은 `// CARETI MODIFICATION:` 주석을 남겨 upstream 머지 시 식별 가능하게 유지.  
- **플래그의 기본값은 off**: `features.terminal_*`를 추가하되 기본값을 `false`로 두어, 머지 직후 동작은 upstream과 동일하다. PTY 실패 시 spawn fallback도 플래그로 보호.  
- **헤드리스/스트리밍 격리**: CLI 게이트웨이·JSONL 이벤트 버스는 신규 파일로만 구성하고, core Tool/Task 경로는 얇은 훅으로 주입. 충돌을 줄이기 위해 기존 함수 시그니처 변경을 피하고, 새 액션은 `not_implemented` 반환으로 선언 후 내부 서비스에서만 처리.  
- **태그/베이스라인 관리**: Squash 머지 후 `careti-squash-baseline-*` 태그를 남겨 `--onto` 재베이스 전략을 계속 사용할 수 있게 한다(문맥: `careti-docs/guides/upstream-merging.md`).  
- **브랜치 전략**: `smart-terminal/headless-infra` 등 기능별 브랜치로 분리해, 머지 작업과 기능 개발을 명확히 구분한다.

---

## 8) 테스트 계획 (Smart Terminal 통합)
**목표**: PTY/스트리밍/헤드리스 경로 추가가 기존 흐름을 깨지 않도록 회귀 방지하며, 멀티 에이전트 사용 사례를 검증한다.

1. **단위 테스트 (careti-src/integrations/terminal/interactive/__tests__/unit/)**  
   - SessionManager: 세션 생성/조회/종료/리스트 ULID 유효성, 메타데이터 갱신.  
   - InteractiveSession: `readOutput` 타임아웃/신규 출력 감지, `clearOutput`.  
   - TerminalEventBus(신규): 이벤트 publish 순서, 구독 해제(dispose) 시 메모리 누수 없는지.  
   - Adapter fallback: `terminal_tty_required=false`일 때 PTY 실패 시 spawn fallback 여부(환경 가드 필요).

2. **통합 테스트 (careti-src/integrations/terminal/interactive/__tests__/integration/)**  
   - Python REPL: open → send `print(1)` → read → close (기존 7종 유지).  
   - Node REPL: PTY on/off, 이벤트 스트림(onData) 수신까지 확인.  
   - Ctrl+C(stop): 장기 실행 명령에 대해 종료 이벤트 방출 여부.  
   - Resize/signal stub: `not_implemented` 응답 확인(시그니처 회귀 방지).  

3. **CLI/헤드리스 시나리오**  
   - `cli/terminal-gateway`(신규): open/send/read/list/close를 JSONL로 출력하는 스냅샷 테스트.  
   - `--json` 스트림 순서 검증: `session_opened` → `output` → `exit` 순서 유지.  
   - Git 리포 안전 가드: 리포 아님 + `--skip-git-repo-check` 동작 확인.

4. **플래그/구성 테스트**  
   - `terminal_stream=false`: 이벤트 미발행, 기존 Tool 결과만 나오는지 확인.  
   - `terminal_headless=false`: CLI 게이트웨이가 실행 시 거부/경고 처리되는지.  
   - `terminal_tty_required=true`: PTY 실패 시 에러 반환, false일 때 fallback.

5. **문서/가이드 검증**  
   - `careti-docs/development/terminal-events.md`(신규)와 `TERMINAL_TOOL_GUIDE.json` 업데이트가 코드와 일치하는지 검토.  
   - 업스트림 머지 가이드 준수 확인: 새 파일 중심 변경, core 시그니처 변경 최소화.

6. **회귀/품질 게이트**  
   - `pnpm run compile`, `pnpm run lint`, 터미널 단위/통합 테스트 셋.  
   - PTY가 없는 CI 환경 가드: PTY 의존 테스트는 조건부 skip, fallback 경로 테스트는 반드시 실행.

### 8-1) 테스트 시나리오 & 프롬프트/명령 예시
#### 단위 테스트 (vitest)
- InteractiveSession `readOutput` 타임아웃:  
  - 코드: `await session.readOutput(200)` → 출력 없으면 `[]` 기대.  
  - 신규 출력 후: `session.sendInput("echo 1")` 후 모의 onOutput 트리거 → `["1\n"]` 기대.
- SessionManager ULID/메타데이터:  
  - `const id = await manager.createSession(cfg)` 후 `listSessions()`에 `id` 포함, `lastActivity` 업데이트 확인.
- EventBus publish:  
  - `bus.publish("session_opened", {...})` → subscriber에서 동일 payload 수신. `dispose` 후 이벤트 미수신 확인.
- Adapter fallback:  
  - 환경 플래그 `terminal_tty_required=false`에서 PTY 생성 실패를 모킹 → spawn fallback 호출 여부 확인.

#### 통합 테스트 (Node/Python REPL)
- Python REPL (PTY on):  
  - 액션: `open` → `send "print(1)"` → `read`  
  - 기대: `read` 결과에 `1` 포함, `sessions`에 동일 id 존재.  
  - Ctrl+C: `stop` 후 `read`에서 `KeyboardInterrupt` 또는 빈 출력 확인.
- Node REPL (PTY on):  
  - 액션: `open` → `send "1+2"` → `read`  
  - 기대: `read` 결과에 `3` 포함.  
  - PTY off(fallback): 플래그 off 시 빈 출력/오류 없는지, on 시 정상 출력.
- 리스트/종료:  
  - `list` 반환에 세션 메타 포함, `close` 후 `list` 길이 감소 확인.

#### CLI/헤드리스(JSONL) 시나리오
- 명령: `pnpm careti terminal --action open --command "node" --json`  
  - 기대 JSONL: `{"type":"session_opened","session_id":"...","data":{"command":"node"}}`
- 명령: `pnpm careti terminal --action send --session-id <ID> --input "1+2"`  
  - 기대 JSONL: `{"type":"command_sent",...}` 이어서 `{"type":"output","data":"3\n"}`
- 명령: `pnpm careti terminal --action read --session-id <ID>`  
  - 기대 JSONL: `{"type":"output","data": "..."}`
- 명령: `pnpm careti terminal --action close --session-id <ID>`  
  - 기대 JSONL: `{"type":"session_closed","session_id":"..."}`
- Git 리포 체크: 리포 아닌 경로에서 실행 시 오류 `not a git repo` 메시지, `--skip-git-repo-check` 사용 시 실행 허용.

#### 플래그 동작 검증
- `terminal_stream=false`: CLI 실행 시 JSONL 이벤트 미발행, Tool 결과만 출력.  
- `terminal_headless=false`: CLI 진입 시 “headless disabled” 에러/경고 후 종료.  
- `terminal_tty_required=true`: PTY init 실패 시 에러 반환; false일 때는 spawn fallback으로 계속 동작.

#### 문서 스냅샷
- `careti-docs/development/terminal-events.md`와 실제 이벤트 필드 비교: 스키마 `type/session_id/data/ts` 일치 여부.  
- `TERMINAL_TOOL_GUIDE.json`: 새 액션(resize/signal stub) 설명과 실 코드 시그니처 일치 여부 확인.

#### 챗 프롬프트 기반 수동 검증 (IDE/CLI 대화창에 직접 입력)
- 세션 생성:  
  - 메시지: `터미널 열고 node REPL 실행해줘. 세션 ID 알려줘.`  
  - 기대: `action=open`, `command=node`, `sessionId` 응답 표시.
- 명령 전송/응답 확인:  
  - 메시지: `방금 세션에 "1+2" 보내고 결과 읽어줘.`  
  - 기대: `send` → `read` 연속 호출, 출력에 `3` 포함.
- 다중 세션:  
  - 메시지: `python3 -i로 새 세션 열고, 첫 세션과 둘 다 list로 보여줘.`  
  - 기대: list에 2개 세션, 각각 command/node, python 구분 명시.
- Ctrl+C 동작:  
  - 메시지: `첫 세션에 오래 걸리는 명령 "sleep 5" 보내고 1초 후 Ctrl+C 보내서 중단된 로그를 읽어줘.`  
  - 기대: stop 후 read에서 중단/빈 출력 확인.
- 종료/정리:  
  - 메시지: `두 세션 모두 닫고 list 다시 보여줘.`  
  - 기대: list 결과 0, close 확인 메시지.
- 스트리밍 플래그 off 상태 확인:  
  - 메시지: `terminal_stream 플래그 꺼진 상태에서 read 결과만 간단히 알려줘.`  
  - 기대: 이벤트 없이 Tool 결과만 응답.
- 멀티 에이전트(가위바위보) 시나리오:  
  - 메시지: `codex 세션과 claude-code 세션을 각각 열고, 두 에이전트에게 "가위바위보에서 무엇을 낼래?"를 물어본 뒤, 두 답을 비교해 승자를 알려줘.`  
  - 기대 흐름:  
    1) `open` 두 번 (예: `command="codex"`, `command="claude-code"` 또는 각각의 CLI 엔트리).  
    2) 각 세션에 `send` `"가위바위보에서 무엇을 낼래? (가위/바위/보 중 하나만 말해)"`.  
    3) `read` 각 세션 출력에서 선택(가위/바위/보) 파싱.  
    4) Careti이 두 선택을 비교해 승/패/무승부 판단 후 요약 출력(예: `codex: 보, claude-code: 가위 → claude-code 승`).  
    5) 세션 정리(`close`), `list`로 0 확인.
  - 멀티 에이전트 토론+중재 시나리오(유저가 흐름을 볼 수 있어야 함):  
    - 메시지: `codex와 claude-code 세션을 각각 열고, 주제 "TypeScript strict 모드의 장단점"에 대해 토론하게 해줘. 각 발언을 중재·요약하면서 3 라운드 후 결론을 알려줘. 모든 라운드는 내가 볼 수 있게 중간중간 출력해 줘.`  
    - 기대 흐름:  
      1) `open` 두 번으로 세션 준비.  
      2) 라운드별로:  
       - Careti이 각 세션에 `send`로 질문/반론 전달(예: 라운드1: 장점, 라운드2: 단점, 라운드3: 결론 요청).  
       - 각 `read` 결과를 즉시 사용자에게 중간 로그로 보여줌(예: `Round1 codex: ...`, `Round1 claude: ...`).  
       - Careti이 중재 코멘트/요약을 사용자에게 출력.  
    3) 3라운드 후 Careti이 두 답변을 종합해 최종 결론 메시지를 사용자에게 제시.  
      4) 세션 정리(`close` 두 번), `list` 0 확인.  
    - 주의:  
      - `terminal_stream=true`이면 JSONL 이벤트를 그대로 표면화해 사용자에게 스트림으로 보여줄 수 있음.  
      - `terminal_stream=false`라면 각 `read` 결과를 Careti이 수집해 요약/중재 메시지로 출력.  
      - 라운드 수, 주제는 사용자 프롬프트로 바꿔서 재사용 가능.

---

## 9) 스트림 노출 및 멀티-뷰 UX 방향
- **우선권**: 가능한 한 `terminal_stream=true`를 켜서 JSONL 이벤트를 **그대로 사용자에게 흘려보내고**, Careti은 중재/요약만 추가로 출력한다(이중 노출).  
- **다중 창/패널**: codex/claude-code 세션을 각각 별도 터미널 패널(또는 창/탭)로 띄우고, 공용 패널에서 중재/결론만 보여주는 구성을 지향. VS Code라면 터미널 2개 + 중재 로그 1개, CLI라면 창 2개 + 중재 표출용 창 1개.  
- **Aggregated view**: 스트림을 `timestamp / session / data`로 묶어 한 화면에 병렬 표시하는 옵션을 둔다. 토론/게임 진행 상황을 실시간으로 시각화할 수 있도록 JSONL를 그대로 뿌리거나 단순 테이블로 가공해 보여준다.  
- **기본값은 off 유지**: 머지 친화성을 위해 `terminal_stream` 기본값은 off로 두되, 사용자가 켜면 위 UX가 활성화되는 토글 방식으로 설계한다.

---

## 10) 최신 Cline CLI와의 관계 정리 (머지 로그 반영)
- Cline v3.35.0 머지 로그(브랜치 `merge/cline-v3.34.0-method3`, Stage 1-8 완료)에 따르면 Cline은 이미 CLI/exec/스트리밍(서브에이전트 포함) 경로를 갖음.  
- 우리 Smart Terminal Hub는 **저층 실행/스트림은 Cline CLI/TerminalManager를 재사용**하고, Careti 고유 가치를 **세션 중재·멀티 에이전트·요약/판정 UX**에 집중하도록 범위 조정.  
- 별도 CLI 게이트웨이를 추가할 경우, 네임스페이스를 `careti-src/cli/**` 등으로 분리하고 기본값 off(환경변수/플래그)로 두어 머지 충돌을 최소화.  
- 머지 완료 후 실제 동작을 확인한 뒤, Cline CLI의 스트림 포맷/옵션을 그대로 재사용하는 쪽을 우선 검토한다.  
- 현재 머징 브랜치(`merge/cline-v3.34.0-method3`)는 최신 Cline 일부만 반영된 상태이므로, 실제 CLI/스트림 기능 범위를 확인한 뒤 문서와 계획을 다시 정렬해야 함. 최신 Cline(예: v3.37.1) 반영 여부를 확인하고 필요 시 재검토 체크포인트를 남긴다.
