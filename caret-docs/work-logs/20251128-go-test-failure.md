# Go 테스트 실패 분석 및 대응

## 1. 현상
- Go 1.23.2 설치는 성공적으로 완료됨 (`go version go1.23.2 linux/amd64`).
- `go test` 실행 시 `src/generated/grpc-go/go.mod: no such file or directory` 에러 발생.

## 2. 원인 분석
- `go.work` 또는 `go.mod`에서 `replace` 지시자를 통해 로컬 경로 `src/generated/grpc-go`를 참조하고 있음.
- 해당 경로에 `go.mod` 파일이 없거나 디렉토리 자체가 존재하지 않아 의존성 해결에 실패함.
- **배경**: `src/generated`는 protobuf 컴파일 결과물이 위치하는 곳이며, CLI 테스트 전에 `npm run protos-go` 등을 통해 생성되어야 함.

## 3. 해결 방안
1. **gRPC Go Stubs 생성**:
   - `npm run protos-go` 스크립트를 실행하여 `src/generated/grpc-go` 디렉토리와 관련 파일들을 생성.
   - 선행 조건: `protoc` 컴파일러 필요 (또는 스크립트가 처리하는지 확인).
2. **테스트 재실행**:
   - Stub 생성 후 다시 `go test -short ./cli/...` 실행.

## 4. 실행 계획
1. `npm run protos-go` 실행
2. `go test -short ./cli/...` 재실행 (환경변수 유지 필요)
