# CLI Agent Mode 구현 계획

**날짜**: 2026-02-02
**상태**: 계획 수립

## 목표

CLI에서 `--mode agent` 옵션으로 Careti 프롬프트 시스템을 사용한 자율 실행 모드 구현

## 사전 조건

### 인증 (Auth)
- **기존 설정 사용**: VSCode 확장에서 이미 로그인한 경우 `~/.caret/data/`에 저장된 인증 정보 사용
- **CLI Quick Setup**: `careti auth -p <provider> -k <apikey> -m <model>`
- **CLI Interactive**: `careti auth` (메뉴 선택)

### 현재 지원 Provider
- `caret` (Careti 계정) - 현재 설정됨
- `anthropic`, `openai-native`, `openai-compatible`, `gemini`, `openrouter`, `xai`, `cerebras`, `ollama`

## 기존 인프라 (이미 구현됨)

### Proto 정의 (`proto/careti/`)
| 서비스 | RPC | 용도 |
|--------|-----|------|
| `CaretSystemService` | `SetPromptSystemMode(mode)` | "careti" / "cline" 프롬프트 시스템 |
| `CaretSystemService` | `SetCaretMode(mode)` | "agent" / "chatbot" 모드 |
| `PersonaService` | `UpdatePersona(profile)` | Persona 설정 |

### Go 클라이언트 (자동 생성됨)
- `client.Caretsystem.SetPromptSystemMode()`
- `client.Caretsystem.SetCaretMode()`
- `client.Persona.UpdatePersona()`

### 기존 패턴 (`cli/pkg/cli/task/manager.go`)
```go
// 라인 141-149: setClineMode 패턴
func (m *Manager) setClineMode(ctx context.Context) {
    if m == nil || m.client == nil || m.client.Caretsystem == nil {
        return
    }
    _, err := m.client.Caretsystem.SetPromptSystemMode(ctx, &careti.SetPromptSystemModeRequest{Mode: "cline"})
    // ...
}
```

## 구현 계획

### 1단계: 빌드 문제 수정

#### 1.1 `esbuild.mjs` - Native 모듈 처리
```javascript
// standaloneConfig.external에 추가
external: ["vscode", "@grpc/reflection", "grpc-health-check", "better-sqlite3", "@ohah/hwpjs", "sharp", "@napi-rs/wasm-runtime"],
```
**이유**: hwpjs, sharp 등 native 모듈이 번들링되면 .node 파일 로딩 실패

#### 1.2 `scripts/proto-shared-utils.mjs` - Proto 경로 수정
```javascript
// 변경
const protoPackage = protoFilePath.startsWith("careti/") ? "careti" : "cline"
```
**이유**: "caret/" → "careti/" 폴더명 불일치

#### 1.3 Auth 패키지 Import 수정
- `careti "github.com/cline/grpc-go/caret"` alias 추가
- `ApiProvider_CARET` → `ApiProvider_CARETI`

### 2단계: Agent Mode 구현

#### 2.1 `cli/pkg/cli/task/manager.go`
```go
// setClineMode 패턴을 따라 추가
func (m *Manager) setCaretAgentMode(ctx context.Context) error {
    // 1. 프롬프트 시스템을 careti로 설정
    _, err := m.client.Caretsystem.SetPromptSystemMode(ctx, &careti.SetPromptSystemModeRequest{Mode: "careti"})
    if err != nil {
        return err
    }
    // 2. Caret 모드를 agent로 설정
    _, err = m.client.Caretsystem.SetCaretMode(ctx, &careti.SetCaretModeRequest{Mode: "agent"})
    return err
}

func (m *Manager) SetPersona(ctx context.Context, personaName string) error {
    _, err := m.client.Persona.UpdatePersona(ctx, &careti.UpdatePersonaRequest{
        Profile: &careti.PersonaProfile{Name: personaName},
    })
    return err
}
```

#### 2.2 `cli/cmd/cline/main.go`
```go
// 플래그 추가
var persona string
rootCmd.Flags().StringVarP(&persona, "persona", "p", "", "persona name for agent mode")
rootCmd.Flags().StringVarP(&mode, "mode", "m", "plan", "mode (act|plan|agent)")

// TaskOptions에 전달
Persona: persona,
```

#### 2.3 `cli/pkg/cli/task.go`
```go
type TaskOptions struct {
    // ... 기존 필드
    Persona string
}

func CreateAndFollowTask(ctx context.Context, prompt string, opts TaskOptions) error {
    // agent mode 처리
    if opts.Mode == "agent" {
        opts.Yolo = true  // 자율 실행
        if err := taskManager.setCaretAgentMode(ctx); err != nil {
            return err
        }
        if opts.Persona != "" {
            if err := taskManager.SetPersona(ctx, opts.Persona); err != nil {
                return err
            }
        }
    }
    // ...
}
```

### 3단계: Completion 감지 수정 (선택적)

API가 cost info를 반환하지 않을 때 무한 대기 방지:
```go
// processStateUpdate에서 completion 감지 로직 개선
if completionChan != nil && foundCompletion {
    if displayedUsage {
        completionChan <- true
    } else if lastMsg.Say == string(types.SayTypeCompletionResult) && !lastMsg.Partial {
        completionChan <- true  // cost info 없어도 종료
    }
}
```

## 테스트 계획

### 빌드 테스트
```bash
scripts/careti-build-run.sh version
```

### Auth 테스트
```bash
scripts/careti-run.sh auth  # 기존 설정 확인
```

### Agent Mode 테스트
```bash
# 기본 테스트
scripts/careti-run.sh --mode agent "echo hello world"

# Persona 테스트
scripts/careti-run.sh --mode agent --persona careti "create a simple python script"
```

## 참고 문서

- `careti-docs/development/cli-development.md`
- `proto/careti/system.proto`
- `proto/careti/persona.proto`
- `cli/pkg/cli/task/manager.go` (setClineMode 패턴)

## 이전 작업 기록

- `careti-docs/work-logs/luke/doing/20260202-cli-agent-mode-changes.md`
