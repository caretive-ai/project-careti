# CLI 버그 수정: 빌드 에러 및 EOF 에러

**날짜**: 2026-02-02
**상태**: 완료 (테스트 통과)

## 개요

CLI 빌드 에러와 act 모드 실행 시 EOF 에러를 수정했습니다.

## 수정 사항

### 1. 빌드 에러 수정

#### 1.1 `cli/pkg/cli/task/manager.go`
- **문제**: `careti.` 사용하지만 import alias 없음
- **수정**: `careti "github.com/cline/grpc-go/caret"` alias 추가
- **원인**: rebrand 커밋 `e341d4350`에서 import alias 누락

#### 1.2 `cli/pkg/cli/auth/*.go` (7개 파일)
- **문제**: `careti.` import alias 누락 + `ApiProvider_CARET` (잘못된 enum 값)
- **수정**:
  - import alias 추가
  - `ApiProvider_CARET` → `ApiProvider_CARETI`
- **영향 파일**:
  - `auth_careti_provider_test.go`
  - `auth_careti_subscription.go`
  - `models_list_fetch.go`
  - `models_list_fetch_test.go`
  - `auth_menu.go`
  - `models_careti.go`
  - `providers_list.go`
  - `providers_list_test.go`
  - `update_api_configurations.go`
  - `update_api_configurations_careti_test.go`
  - `wizard_byo.go`

#### 1.3 `esbuild.mjs`
- **문제**: hwpjs, sharp 등 native 모듈이 번들링되면 .node 파일 로딩 실패
- **수정**: `standaloneConfig.external`에 추가
```javascript
external: ["vscode", "@grpc/reflection", "grpc-health-check", "better-sqlite3", "@ohah/hwpjs", "sharp", "@napi-rs/wasm-runtime"],
```

#### 1.4 `scripts/proto-shared-utils.mjs`
- **문제**: `"caret/"` 폴더 경로가 `"careti/"`와 불일치
- **수정**:
```javascript
protoFilePath.startsWith("careti/") ? "careti" : "cline"
```

### 2. EOF 에러 수정

#### `cli/pkg/cli/task/manager.go` - completion 감지 로직

**문제**:
- API가 cost 정보를 반환하지 않으면 `displayedUsage`가 false
- `foundCompletion && displayedUsage` 조건으로 인해 completion 신호 미전송
- Core 종료 시 CLI가 스트림 읽다가 EOF 에러

**수정** (두 곳):
```go
// 변경 전
if completionChan != nil && foundCompletion && displayedUsage {
    completionChan <- true
}

// 변경 후
if completionChan != nil && foundCompletion {
    if displayedUsage {
        completionChan <- true
    } else {
        lastMsg := messages[len(messages)-1]
        if lastMsg.Say == string(types.SayTypeCompletionResult) && !lastMsg.Partial {
            completionChan <- true
        }
    }
}
```

**위치**:
- `processStateUpdateJsonMode()` (라인 ~951)
- `processStateUpdate()` (라인 ~1091)

## 테스트 결과

```bash
# 빌드 테스트
scripts/careti-build-run.sh version  # ✅ 성공

# act 모드 테스트 (gemini provider)
careti auth -p gemini -k $GEMINI_TOKEN -m gemini-2.5-flash  # ✅
careti --mode act --yolo "echo hello"  # ✅ 정상 실행 + 깔끔한 종료
```

## 다음 단계

- [ ] agent mode 구현 (`--mode agent`, `--persona` 플래그)
- [ ] plan mode 테스트

## 참고

- rebrand 커밋: `e341d4350 feat(rebrand): Caret → Careti 브랜드 전환`
- 관련 계획 문서: `20260202-cli-agent-mode-plan.md`
