# Go 툴체인 설정 및 테스트 실행 계획

## 1. 현상 분석
- **문제**: 현재 환경에 Go 툴체인이 설치되어 있지 않음 (`command -v go` 실패).
- **목표**: `/tmp/go` 경로에 Go를 설치하고 `cli` 패키지 테스트를 수행.

## 2. 설치 전략
- **Go 버전**: 1.23.2 (Linux AMD64)
- **설치 위치**: `/tmp/go` (사용자 권한 내 실행, 시스템 불변성 고려)
- **도구**: `curl`, `tar`

## 3. 실행 단계
1. **다운로드 및 설치**:
   ```bash
   cd /tmp
   curl -L -O https://go.dev/dl/go1.23.2.linux-amd64.tar.gz
   tar -xzf go1.23.2.linux-amd64.tar.gz
   ```
2. **환경 변수 설정 및 검증**:
   ```bash
   export GOROOT=/tmp/go
   export PATH=$GOROOT/bin:$PATH
   go version
   ```
3. **테스트 실행**:
   ```bash
   export GOROOT=/tmp/go
   export PATH=$GOROOT/bin:$PATH
   cd /home/luke/dev/caret-merging
   go test -short ./cli/...
   ```

## 4. 완료 조건
- `go version` 출력 확인
- `go test` 실행 결과 확인 (Pass/Fail)
- 결과 보고서 작성
