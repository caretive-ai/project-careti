# CLI Agent Mode 작업 기록

**날짜**: 2026-02-02
**상태**: 롤백 후 재작업 필요

## 개요

CLI에서 `--mode agent` 옵션과 `--persona` 플래그를 추가하여 Careti 프롬프트 시스템을 사용한 자율 실행 모드를 구현하려 했으나, 문서를 먼저 확인하지 않고 작업하여 롤백 결정.

## 변경사항 요약

### 1. 빌드 관련 수정 (버그 수정 - 재적용 필요)

#### `esbuild.mjs`
```javascript
// standaloneConfig.external에 native 모듈 추가
external: ["vscode", "@grpc/reflection", "grpc-health-check", "better-sqlite3", "@ohah/hwpjs", "sharp", "@napi-rs/wasm-runtime"],
```
**이유**: hwpjs, sharp 등 native 모듈이 번들링되면 .node 파일 로딩 실패

#### `scripts/proto-shared-utils.mjs`
```javascript
// 변경 전
const protoPackage = protoFilePath.startsWith("caret/") ? "careti" : "cline"
// 변경 후
const protoPackage = protoFilePath.startsWith("careti/") ? "careti" : "cline"
```
**이유**: careti 폴더의 proto 파일이 잘못된 패키지로 생성됨

### 2. Auth 패키지 수정 (빌드 에러 해결 - 재적용 필요)

#### Import alias 추가 (여러 파일)
```go
// 변경 전
"github.com/cline/grpc-go/caret"
// 변경 후
careti "github.com/cline/grpc-go/caret"
```
**영향 파일**:
- `cli/pkg/cli/auth/auth_careti_provider_test.go`
- `cli/pkg/cli/auth/auth_careti_subscription.go`
- `cli/pkg/cli/auth/models_list_fetch.go`
- `cli/pkg/cli/auth/models_list_fetch_test.go`
- `cli/pkg/cli/task/manager.go`

#### Enum 값 수정
```go
// 변경 전
cline.ApiProvider_CARET
// 변경 후
cline.ApiProvider_CARETI
```
**영향 파일**:
- `cli/pkg/cli/auth/auth_menu.go`
- `cli/pkg/cli/auth/models_careti.go`
- `cli/pkg/cli/auth/update_api_configurations.go`
- `cli/pkg/cli/auth/wizard_byo.go`
- 기타 테스트 파일들

### 3. Agent Mode 구현 (새 기능 - 검토 후 재구현 필요)

#### `cli/cmd/cline/main.go`
- `persona` 변수 추가
- `--persona`, `-p` 플래그 추가
- `--mode` 설명에 `agent` 추가
- `TaskOptions`에 `Persona` 전달

#### `cli/pkg/cli/task.go`
- `TaskOptions.Persona` 필드 추가
- `CreateAndFollowTask`에서 agent mode 처리:
  - `opts.Yolo = true` 설정
  - `taskManager.SetPersona()` 호출

#### `cli/pkg/cli/task/manager.go`
- `SetCaretMode()` 메서드 추가 - careti 프롬프트 시스템 설정
- `SetPersona()` 메서드 추가 - 페르소나 설정
- `SetMode()`에서 agent mode 처리
- `processStateUpdate*`에서 completion 감지 수정 (cost info 없어도 종료)

## 발견된 문제점

1. **Core 즉시 종료**: `dist-standalone/extension/careti-src` 경로 부재
   - `vscode-context.ts`에서 `EXTENSION_DIR = path.join(INSTALL_DIR, "extension")`
   - 개발 환경에서 이 경로에 필요한 파일들이 없음
   - `JsonTemplateLoader` 초기화 실패 → `ErrorService` 미초기화 → Core 종료

2. **문서 미확인**: `careti-docs/development/cli-development.md` 존재
   - `scripts/careti-build-run.sh` 등 헬퍼 스크립트 제공
   - 표준 개발 워크플로우 정의됨

## 재작업 시 확인 사항

1. 기존 코드베이스에 유사한 기능이 있는지 확인
2. `cli-development.md` 워크플로우 따르기
3. `scripts/careti-*.sh` 스크립트 활용
4. gRPC 서비스 정의 확인 (`proto/careti/`)
5. 테스트 코드 작성

## 참고 문서

- `careti-docs/development/cli-development.md`
- `cli/README.md`
- `scripts/careti-build-run.sh`
