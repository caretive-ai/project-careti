# Cline CLI & Subagent Research
> Discord 분석 및 기술 조사 (2025-10-31)

## 🎯 핵심 발견

### 1. 설정 공유 메커니즘 (JetBrains 방식)

**가장 중요한 발견:**
```
Andrei Eternal: "JetBrains (not VSCode) uses the same ~/.cline settings directory
as the CLI, so global settings apply to both"
```

**설정 디렉토리 구조:**
```
~/.cline/
  └── data/
      ├── globalState.json      # API keys, provider settings
      ├── secrets.json          # Encrypted secrets
      ├── workspaceState.json   # Per-project settings
      └── locks.db              # Instance management
```

**코드 레벨 확인:**
```typescript
// cline-latest/src/standalone/vscode-context.ts:18
const CLINE_DIR = clineDir || process.env.CLINE_DIR || `${os.homedir()}/.cline`
const DATA_DIR = path.join(CLINE_DIR, SETTINGS_SUBFOLDER) // "data"

globalState: new MementoStore(path.join(DATA_DIR, "globalState.json"))
secrets: new SecretStore(path.join(DATA_DIR, "secrets.json"))
```

### 2. Provider 지원 상황

**현재 지원:**
- ✅ Cline Provider (계정 필요)
- ✅ OpenRouter
- ✅ Anthropic
- ✅ Ollama (불안정)
- ✅ Fireworks

**진행 중:**
- 🚧 OpenAI Compatible (PR #7005 머지됨, npm release 대기)
- 🚧 Local LLM 지원 개선
- ❌ SAP provider node <22 문제로 release 지연

**Discord 인용:**
```
chisleu: "Still waiting for open ai compatible support in cline-cli"
Faz: "PR that fixes OpenAI compatible is merged but npm not updated"
```

### 3. Subagent 실제 사용 사례

**1) Mobile App Backend**
```
ademuk: "I have a server running cline-cli. The mobile app talks to it."
```

**2) Orchestrator 패턴**
```
TERRY: "cline as an orchestrator or as sub-agents that get called by
an orchestrator (possibly both would be cline-core)"
```

**3) Multi-Model Strategy**
```
Cool Guy: "make cline cli agents use a different model for each sub agent?
explorer agent use lightweight model, architect with heavy one"
```

**4) Custom UI**
```
Vutinberg: "time re GUI the cline CLI so I can see my 20 agents running"
Cxeb: "did anyone create a new mobile UI on top of cline cli/core?"
```

### 4. Rules & Workflows 지원

**확인된 기능:**
```
pashCline: "If you're running cline cli in that same work directory,
cline rules should work yes — same functionality as vs code.
Same with workflows, you can prompt with /workflow.md"
```

**사용 방법:**
- `.clinerules` 파일 자동 인식 (프로젝트 디렉토리)
- `/workflow.md` 프롬프트 앞에 붙여서 사용
- VS Code Extension과 완전히 동일한 동작

### 5. MCP (Model Context Protocol) 지원

**현재 상태:**
```
Szymon: "when trying to use MCP cline cli responds MCP is not connected
(while all works from vscode cline)"

Cm: "is it possible to use/configure MCP in CLI like we've had in vscode?"
```

**결론:** CLI에서 MCP 설정 불완전/버그 존재

### 6. 설정 관리

**Config 파일 위치:**
```bash
~/.cline/data/globalState.json
```

**CLI 명령어:**
```bash
# 설정 확인
cline config list

# 설정 변경
cline config set key=value

# Provider 인증
cline auth [provider]
```

**비대화형 인증 (서버 환경):**
```
ademuk: "how would I auth the cline provider non interactively?"
```
→ 아직 미구현, JetBrains IDE로 설정 후 CLI 사용 권장

### 7. 알려진 이슈들

**1) Settings 변경 반영 문제**
```
Virtuoso: "need to reinitialize a task in order for changes in
settings.json to take effect"

Rei: "We found the bug causing global settings to be updated
in cases where it shouldn't be in the cli"
```

**2) Ollama Provider 불안정**
```
Virtuoso: "Ollama model provider in Cline CLI is incredibly unstable.
Configuration does not stay put after closing terminal"
```

**3) Node 버전 호환성**
```
RuntimeRacer: "Downgrade to Node 24 fixed it"
```
→ Node <22 지원 문제 (SAP provider 때문)

**4) Terminal Output 캡처 실패**
```
PlatinumAzure: "Python extension injects 'source .venv/Scripts/activate'
which causes Cline to think output isn't captured"
```

**5) Long CLI Output 처리**
```
pixelfireplace: "cli output is pretty long and its no longer able to handle it
- making cline unusable"
```

**6) Instance Registry 에러**
```
Szymon: "failed to start new instance: instance localhost:65189 not found"
```
→ Instance lifecycle race condition

### 8. Architecture & API

**Cline Core 구조:**
```
- cline-core: 핵심 로직 (언어 독립적)
- gRPC API: 외부 통합용
- Protobus: gRPC 서비스 (default: port 50052)
- HostBridge: 호스트 통신 (default: port 50053)
```

**포트 설정:**
```bash
# CLI 실행 시
cline --port 50052 --hostBridgePort 50053

# 환경변수
PROTOBUS_ADDRESS=127.0.0.1:50052
HOST_BRIDGE_ADDRESS=127.0.0.1:50053
```

**Subagent 포트 분리:**
```typescript
// Extension에서 Subagent 실행 시 포트 충돌 방지
globalThis.process.env.CARET_SUBAGENT_MODE = "true"
globalThis.process.env.CARET_SUBAGENT_PROTOBUS_PORT = "26050"
globalThis.process.env.CARET_SUBAGENT_HOSTBRIDGE_PORT = "26051"
```

### 9. Documentation & Community

**공식 문서:**
- https://docs.cline.bot/cline-cli/overview
- https://cline.bot/blog/cline-cli-my-undying-love-of-cline-core

**소스 코드:**
- https://github.com/cline/cline/tree/main/cli (Go)
- https://github.com/cline/cline/tree/main/src/standalone (TypeScript)

**TUI Help Wanted:**
- https://github.com/cline/cline/blob/main/cli/pkg/cli/tui/HELP_WANTED.md
- Go TUI 개발자 기여 환영

**커뮤니티 요청:**
```
TERRY: "i wish there was more of a real forum for building on top of cline/cli"
pashCline: "We had ideas about making a 'cookbooks' type of resource"
```

### 10. 버전 정보

**현재 최신 (Discord 기준):**
```
Cline CLI Version:  1.0.1
Cline Core Version: 3.33.1
Commit:             03d656138
Built:              2025-10-16T19:45:12Z
```

## 🎯 Caret 통합 전략

### Option 1: JetBrains 방식 (권장)

**장점:**
- ✅ 검증된 방식 (JetBrains에서 이미 사용)
- ✅ API 키 자동 공유
- ✅ Provider 설정 공유
- ✅ 계정 종속 없음

**구현:**
```typescript
// 1. Extension 설정을 ~/.caret/data/globalState.json에 export
const CARET_CONFIG_DIR = path.join(os.homedir(), '.caret')
const DATA_DIR = path.join(CARET_CONFIG_DIR, 'data')

// Extension 시작 시 설정 동기화
await syncExtensionSettingsToCLI(context, DATA_DIR)

// 2. Subagent 실행 시 환경변수로 디렉토리 지정
process.env.CLINE_DIR = CARET_CONFIG_DIR  // CLI가 이 디렉토리 사용
process.env.CARET_SUBAGENT_MODE = "true"
process.env.CARET_SUBAGENT_PROTOBUS_PORT = "26050"
process.env.CARET_SUBAGENT_HOSTBRIDGE_PORT = "26051"

// 3. caret CLI 명령 실행
terminalManager.runCommand(terminalInfo, command)
```

**필요 작업:**
1. `~/.caret/data/globalState.json` writer 구현
2. Extension 설정 → JSON 변환 로직
3. Secrets 처리 (암호화)
4. 설정 동기화 시점 결정 (시작 시/변경 시)

### Option 2: Environment Variables

**장점:**
- ✅ 구현 간단
- ✅ 파일 I/O 없음

**단점:**
- ❌ 모든 설정을 환경변수로 전달해야 함
- ❌ 유지보수 복잡

**구현:**
```typescript
if (isSubagent) {
    // API 키 직접 전달
    const apiProvider = this.stateManager.getGlobalSettingsKey("apiProvider")
    process.env.CLINE_API_PROVIDER = apiProvider

    if (apiProvider === "anthropic") {
        const key = await this.context.secrets.get("anthropicApiKey")
        process.env.ANTHROPIC_API_KEY = key
    } else if (apiProvider === "openai") {
        const key = await this.context.secrets.get("openaiApiKey")
        process.env.OPENAI_API_KEY = key
    }
    // ... 모든 provider 처리
}
```

### Option 3: 설정 비활성화 (임시)

**현재 상황:**
- ✅ Subagent 기능 머지 완료
- ✅ System prompt 통합 완료
- ❌ CLI 설정 공유 미구현

**제안:**
```typescript
// state-helpers.ts:630
subagentsEnabled: subagentsEnabled ?? false,  // 기본값 false로 복구

// 나중에 CLI 설정 공유 구현 후 활성화
```

## 📋 TODO: Caret Subagent 완성

### Phase 1: 설정 공유 구현 (필수)
- [ ] `~/.caret/data/` 디렉토리 구조 생성
- [ ] Extension globalState → JSON 변환기 구현
- [ ] Secrets 암호화 처리
- [ ] CLI 실행 시 `CLINE_DIR` 환경변수 설정
- [ ] 설정 동기화 타이밍 결정

### Phase 2: Better-sqlite3 문제 해결
- [ ] Caret standalone CLI 빌드 문제 해결
- [ ] 옵션 A: better-sqlite3 제거
- [ ] 옵션 B: prebuilt binary 사용
- [ ] 옵션 C: sqlite3 (pure JS) 전환

### Phase 3: 테스트 & 검증
- [ ] Extension에서 Subagent 실행 테스트
- [ ] 설정 공유 확인
- [ ] 다중 Subagent 동시 실행
- [ ] 포트 충돌 방지 확인

### Phase 4: 문서화
- [ ] Caret CLI 설치 가이드
- [ ] Subagent 사용 가이드
- [ ] 트러블슈팅 가이드

## 🔍 참고: Cline CLI 명령어 치트시트

```bash
# 버전 확인
cline version

# 인증 (대화형)
cline auth

# 설정 확인
cline config list
cline config get <key>
cline config set <key=value>

# 작업 실행
cline "task prompt"
cline "prompt" --yolo              # 비대화형 모드
cline "prompt" --oneshot           # 완전 자율 모드
cline "prompt" -s key=value        # 설정 오버라이드

# 인스턴스 관리
cline instance list                # 실행 중인 인스턴스 확인
cline instance kill -a             # 모든 인스턴스 종료

# 로그
cline logs                         # 로그 확인

# 작업 관리
cline task list                    # 작업 목록
cline task inspect <id>            # 작업 상세
```

## 📊 결론

1. **JetBrains 방식이 검증된 해결책**: `~/.caret/data/` 디렉토리로 설정 공유
2. **계정 종속 아님**: OpenAI, Anthropic 등 BYOK 가능
3. **현재 Caret**: System prompt 통합 완료, 설정 공유만 구현하면 완성
4. **우선순위**: Phase 1 (설정 공유) 구현 → Phase 2 (CLI 빌드) 나중에

---

**마지막 업데이트:** 2025-10-31
**작성자:** Claude (Caret Development Assistant)
**소스:** Cline Discord #cli 채널 (2025-10-18 ~ 2025-10-31)
