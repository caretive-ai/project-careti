# F12 - Careti CLI (Careti-Only Prompt System)

**Status**: 🚧 Phase 1 (careti 모드 기본화 완료, 계정/프로바이더 통합 검증 대기)  
**Scope**: CLI (Go runtime, auth/provider wizard), Core interop (prompt mode)  
**Priority**: 🔴 High

---

## 📋 Overview
Careti CLI는 Cline 호환 모드 대신 **Careti 모드만** 기본으로 사용한다. CLI 세션이 시작될 때 `SetPromptSystemMode` gRPC를 호출해 모드 시스템을 `careti`으로 강제하고, Careti JSON 시스템 프롬프트(챗봇/에이전트)를 사용한다. Cline CLI는 npm 별도 패키지로 유지되므로, Careti CLI가 Cline 호환 모드를 유지할 필요는 없다.

## 🆚 Behavior vs Cline CLI
| Area | Cline CLI | Careti CLI |
| --- | --- | --- |
| Prompt system | Cline Plan/Act 프롬프트 | **Careti JSON 프롬프트** (chatbot/agent) |
| Mode system | Plan/Act 기본 | **modeSystem=careti 강제** |
| Provider menus | Cline provider + BYO | Careti 계정/프로바이더 포함 (F05), LiteLLM BYO 확장 (F10) |
| Branding/logs | `.cline` | `.careti` 기본 경로 |

## 🏗 Code Scope (CLI)
- `cli/pkg/cli/task/manager.go`: 인스턴스 연결 직후 `Caretsystem.SetPromptSystemMode(mode="careti")` 호출(VERBOSE 시 실패 로그만).
- Auth/Provider wizard: LiteLLM BYO 옵션 확장(프롬프트 캐시/사고예산/컨텍스트/토큰/온도), Careti Account 메뉴는 F05 진행 상황에 연동.
- Run/build scripts: `scripts/careti-run*.sh`, `scripts/careti-build-*.sh` (Node 20 PATH 강제, 인스턴스 유지/kill 옵션).

## 🔗 Dependencies & Links
- **F05 - Careti Account**: CLI가 careti 모드로 동작할 때 Careti 계정/프로바이더 흐름을 그대로 노출해야 함.
- **F10 - Enhanced Provider Setup**: LiteLLM 모델 페치/설정 UX를 CLI에도 반영 (건강 체크 포함).
- **F04 - Cline Compatibility**: Core/Webview는 듀얼 모드를 유지하지만, CLI는 careti 전용으로 분리.

## 🧪 Testing (CLI)
- `GOCACHE=$PWD/.cache/go-build go test -short ./cli/...`
- 수동: `scripts/careti-run.sh version`, `scripts/careti-run-auth.sh` → auth 메뉴 진입 후 BYO/LiteLLM 설정, 종료 시 인스턴스 유지 여부 확인.

## 🤖 CLI Sub-Agent Execution

Careti CLI can run as a **sub-agent** — a short-lived, autonomous process spawned by the main extension to execute a single task in isolation.

### Command Syntax

```bash
careti "your prompt here"          # double-quoted
careti 'your prompt here'          # single-quoted
careti "prompt" --workdir /path    # with additional flags
```

The simplified syntax is detected by `isSubagentCommand()` and transformed by `transformClineCommand()` into a fully-flagged invocation:

```bash
careti "prompt" -s yolo_mode_toggled=true -s max_consecutive_mistakes=6 -F plain -y --oneshot
```

| Flag | Purpose |
| --- | --- |
| `-s yolo_mode_toggled=true` | Auto-approve tool use (no human-in-the-loop) |
| `-s max_consecutive_mistakes=6` | Limit consecutive errors before abort |
| `-F plain` | Plain text output (no TUI) |
| `-y` | Auto-confirm prompts |
| `--oneshot` | Exit after single task completion |

### Detection & Context

The extension detects sub-agent context via `isCliSubagentContext()` by checking the combination of `yoloModeToggled=true` + `maxConsecutiveMistakes=6`. This allows the main extension to adjust behavior (e.g., skip confirmation dialogs) when running inside a sub-agent.

### Skill Fork Execution

`executeSkillInFork()` in `SkillForkExecutor.ts` spawns sub-agents programmatically:

1. `shouldForkSkill(skillContent)` — checks if skill declares `context: "fork"`
2. `findCaretiCli()` — resolves binary (env var → local build → PATH)
3. `buildForkPrompt()` — constructs prompt with skill instructions
4. `runForkProcess()` — spawns isolated process with sub-agent flags, 5-minute timeout

### Code Scope (Sub-Agent)
- `src/integrations/cli-subagents/subagent_command.ts` — `isSubagentCommand()`, `transformClineCommand()`
- `src/utils/cli-detector.ts` — `isCaretCliInstalled()`, `isCliSubagentContext()`
- `src/core/task/agents/SkillForkExecutor.ts` — `executeSkillInFork()`, `findCaretiCli()`

### Testing (Sub-Agent)
- **45 tests passing** covering command detection, transformation, context detection, and binary resolution
- Run: `npx cross-env TS_NODE_PROJECT=./tsconfig.unit-test.json mocha --grep "CLI Sub-Agent"`
- With explicit binary: `CARETI_CLI_PATH=./cli-careti/bin/careti-linux-amd64 npm run test:unit -- --grep "CLI Sub-Agent"`

## 🚧 TODO / Risks
- Careti Account(F05) gRPC/UI가 CLI wizard와 완전 연동됐는지 회귀 필요.
- 모드 강제 이후 기존 Cline Plan/Act-only 기대치를 가진 사용자 혼동 가능 → 도움말/배너 정리 필요.
- Sub-agent: `findCaretiCli()` fallback paths may need expansion for Windows/macOS distribution.
