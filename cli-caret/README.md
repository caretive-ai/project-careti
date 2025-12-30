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
- npm 글로벌 설치 시 토큰이 필요하지 않습니다. 퍼블리시가 필요한 경우 `.env`의 `CARET_NPM_TOKEN`을 export 해야 합니다. (쉘 스크립트는 `.env`를 자동으로 읽지 않습니다.)

## npm 퍼블리시 (CLI 배포)

```bash
# 프로젝트 루트에서 실행
set -a; source .env; set +a  # CARET_NPM_TOKEN 로드
npm run compile-standalone-npm
bash cli-caret/scripts/publish-caret-cli.sh
```

- `publish-caret-cli.sh`는 `cli-caret/.npmrc`를 생성해 토큰을 주입한 뒤 `npm pack`과 `npm publish`를 수행합니다.
- `dist-standalone/cline-core.js`가 없으면 빌드가 실패합니다. 반드시 `npm run compile-standalone-npm`을 먼저 실행하세요.
- 최초 공개 배포라면 `npm publish --access public` 옵션이 필요할 수 있습니다. 필요 시 스크립트를 조정하세요.
- 이 퍼블리시 경로는 `TELEMETRY_SERVICE_API_KEY`/`ERROR_SERVICE_API_KEY`를 요구하지 않습니다.
