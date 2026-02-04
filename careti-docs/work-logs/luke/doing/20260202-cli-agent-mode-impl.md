# CLI Agent Mode 구현

**날짜**: 2026-02-02
**상태**: 완료 (테스트 통과)

## 개요

CLI에서 `--mode agent` 옵션으로 Careti 프롬프트 시스템을 사용한 자율 실행 모드 구현.

## 구현 내용

### 1. `cli/pkg/cli/task/manager.go`

#### 1.1 `SetCaretAgentMode()` 메서드 추가
```go
func (m *Manager) SetCaretAgentMode(ctx context.Context) error {
    // 1. Set prompt system to careti
    _, err := m.client.Caretsystem.SetPromptSystemMode(ctx, &careti.SetPromptSystemModeRequest{Mode: "careti"})
    // 2. Set caret mode to agent
    _, err = m.client.Caretsystem.SetCaretMode(ctx, &careti.SetCaretModeRequest{Mode: "agent"})
    return nil
}
```

#### 1.2 `SetPersona()` 메서드 추가
```go
func (m *Manager) SetPersona(ctx context.Context, personaName string) error {
    _, err := m.client.Persona.UpdatePersona(ctx, &careti.UpdatePersonaRequest{
        Profile: &careti.PersonaProfile{Name: personaName},
    })
    return err
}
```

### 2. `cli/cmd/cline/main.go`

- `persona` 변수 추가
- `--persona`, `-p` 플래그 추가
- `--mode` 설명에 `agent` 추가: `mode (act|plan|agent)`
- `TaskOptions`에 `Persona` 전달

### 3. `cli/pkg/cli/task.go`

#### 3.1 `TaskOptions` struct 수정
```go
type TaskOptions struct {
    // ... 기존 필드
    Persona string
}
```

#### 3.2 `CreateAndFollowTask()` agent mode 처리
```go
if opts.Mode == "agent" {
    opts.Yolo = true  // 자율 실행
    if err := taskManager.SetCaretAgentMode(ctx); err != nil {
        return err
    }
    if opts.Persona != "" {
        if err := taskManager.SetPersona(ctx, opts.Persona); err != nil {
            return err
        }
    }
    opts.Mode = "act"  // 내부적으로 act 모드 사용
}
```

## 사용법

```bash
# 기본 agent 모드
careti --mode agent "echo hello world"

# Persona 지정
careti --mode agent --persona careti "create a simple script"

# 단축 플래그
careti -m agent -p careti "task description"
```

## 빌드 결과

```bash
scripts/careti-build-run.sh version  # ✅ 성공
scripts/careti-run.sh --help  # ✅ 플래그 확인됨
```

## 테스트 결과

```bash
# Agent 모드 테스트 (Gemini provider)
scripts/careti-run.sh --mode agent --verbose "echo hello from agent mode"

# 출력 확인:
# [DEBUG] Agent mode enabled with careti prompt system  ✅
# Task created with yolo_mode_toggled=true             ✅
# 명령어 자동 실행 (no approval needed)                 ✅
# Terminal output: hello from agent mode               ✅
# 정상 종료 (EOF 에러 없음)                            ✅
```

## 완료 항목

- [x] Gemini provider로 agent 모드 실행 테스트
- [x] 자율 실행 (yolo) 동작 확인
- [x] 정상 종료 확인

## 다음 단계 (선택적)

- [ ] Persona 설정 동작 확인
- [ ] Anthropic provider로 테스트

## 참고

- 사전 작업: `20260202-cli-bugfix-completion.md` (빌드/EOF 버그 수정)
- 계획 문서: `20260202-cli-agent-mode-plan.md`
