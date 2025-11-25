# @caretive/caret-cli

Caret CLI (minimal Cline fork) 패키지입니다. 로컬 빌드/설치를 위한 스크립트만 포함하며, 소스는 상위 `cli/`를 그대로 사용합니다.

## 로컬 빌드 & 글로벌 설치

```bash
# 프로젝트 루트에서 실행
cd cli-caret
./scripts/build-local.sh           # bin/caret, bin/caret-host 생성
./scripts/install-local.sh         # npm pack 후 -g 설치

# PATH 안내
export PATH="$HOME/.local/bin:$PATH"

# 확인
caret version
caret task new \"hello\"
```

## 주의
- 빌드는 상위 `cli/`의 Go 소스를 사용합니다. 먼저 `node scripts/build-go-proto.mjs`로 `src/generated/grpc-go`가 생성되어 있어야 합니다.
- npm 글로벌 설치 시 토큰이 필요하지 않습니다. 퍼블리시가 필요한 경우 `.env`의 `CARET_NPM_TOKEN`을 설정한 뒤 수동으로 `npm publish`를 수행하세요. (현 스크립트는 퍼블리시를 자동화하지 않습니다.)
