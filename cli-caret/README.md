# caretive white-label CLI package

이 디렉토리는 **화이트라벨 CLI npm 패키지**를 빌드/배포하기 위한 래퍼입니다.
- 패키지명: `@caretive/<brand-slug>-cli`
- 커맨드명(바이너리): `<brand-slug>` / `<brand-slug>-host`
- `<brand-slug>`는 리포 루트 `package.json.displayName`에서 계산됩니다(예: `CodeCenter` → `codecenter`).

## 로컬 빌드 & 글로벌 설치

```bash
# 프로젝트 루트에서 실행 (brand slug 기반으로 자동 생성/설치됨)
cd cli-caret
./scripts/build-local.sh install   # npm pack 후 -g 설치까지 수행

# PATH 안내
export PATH="$HOME/.local/bin:$PATH"

# 확인
<brand-slug> version
<brand-slug> task new \"hello\"
```

## 주의
- 빌드는 상위 `cli/`의 Go 소스를 사용합니다. 먼저 `node scripts/build-go-proto.mjs`로 `src/generated/grpc-go`가 생성되어 있어야 합니다.
- npm 글로벌 설치(로컬 tarball)는 토큰이 필요하지 않습니다. 퍼블리시는 `cli-caret/scripts/publish-caret-cli.sh`를 사용합니다.
