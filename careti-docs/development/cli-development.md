# CLI 개발 가이드

이 문서는 Careti CLI (Command-Line Interface)의 개발, 빌드, 테스트 절차를 안내합니다. **`package.json`의 `scripts` 섹션이 모든 명령어의 유일한 진실 공급원(Single Source of Truth)입니다.**

## 목차
1. [개요](#개요)
2. [시작하기 전에](#시작하기-전에)
3. [🚨 중요: 브랜딩 정책](#-중요-브랜딩-정책)
4. [핵심 디렉토리 구조](#핵심-디렉토리-구조)
5. [주요 스크립트](#주요-스크립트)
    - [프로토콜 버퍼 (gRPC)](#프로토콜-버퍼-grpc)
    - [개발 및 테스트](#개발-및-테스트)
    - [빌드 및 컴파일](#빌드-및-컴파일)
6. [일반적인 개발 워크플로우](#일반적인-개발-워크플로우)

---

## 개요

Careti CLI는 Go 언어로 작성되었으며, 터미널 환경에서 Careti의 핵심 기능과 상호작용할 수 있는 강력한 도구입니다. VSCode 익스텐션과 gRPC를 통해 통신하며, 자동화된 작업, 계정 관리, 시스템 상태 확인 등의 기능을 제공합니다.

## 시작하기 전에

CLI 개발을 시작하기 전에 다음 요구사항이 충족되었는지 확인하세요.

- **Go 언어**: 시스템에 Go 최신 안정 버전이 설치되어 있어야 합니다.
- **Node.js 및 npm**: 프로젝트의 스크립트를 실행하기 위해 필요합니다.

## 🚨 중요: 브랜딩 정책

CLI 코드 작성 시, `Careti` 또는 `Cline`과 같은 브랜드명을 직접 하드코딩해서는 안 됩니다. B2B 브랜딩 요구사항을 지원하기 위해 반드시 아래의 공유 유틸리티 함수를 사용해야 합니다.

- **Go**: `cli/pkg/common/branding.go`

이 정책을 통해 코드 한 곳만 수정하여 모든 브랜드 관련 문자열을 일관되게 변경할 수 있습니다.

## 핵심 디렉토리 구조

- **`cli/`**: 모든 CLI 관련 Go 소스 코드가 위치합니다.
  - `cmd/`: CLI 명령어의 진입점(entrypoint) 파일들이 있습니다.
  - `pkg/`: 명령어의 실제 로직, 서비스 클라이언트, 공용 유틸리티 등 핵심 코드가 위치합니다.
- **`proto/`**: gRPC 서비스와 메시지를 정의하는 Protocol Buffers (`.proto`) 파일이 있습니다.
  - `careti/`: Careti 전용 서비스 정의가 위치합니다.
- **`src/generated/grpc-go/`**: `npm run protos-go` 실행 시 `.proto` 파일로부터 자동 생성되는 Go gRPC 클라이언트 코드가 저장되는 곳입니다. **이 디렉토리의 파일은 절대 직접 수정해서는 안 됩니다.**

---

## 주요 스크립트

### 프로토콜 버퍼 (gRPC)

gRPC 통신 인터페이스를 관리하는 스크립트입니다.

#### `npm run protos-go`
- **설명**: Go 언어로 작성된 CLI를 위한 gRPC 클라이언트 코드를 `src/generated/grpc-go/` 경로에 생성합니다.
- **사용 시기**: `proto/` 디렉토리 내 `.proto` 파일을 수정했거나 추가했을 경우, Go 코드를 빌드하기 전에 **반드시** 실행해야 합니다.

#### `npm run protos`
- **설명**: TypeScript/JavaScript를 포함한 모든 gRPC 관련 코드를 생성합니다.
- **사용 시기**: 익스텐션 백엔드와 CLI 양쪽의 통신 인터페이스를 함께 수정했을 때 사용합니다.

### 개발 및 테스트

개발 중 CLI를 실행하고 테스트하기 위한 스크립트입니다.

#### `npm run dev:cli:watch`
- **설명**: `cli/` 디렉토리의 Go 소스 코드 변경 사항을 감지하여 자동으로 CLI를 재빌드하고 실행하는 감시 모드를 실행합니다.
- **사용 시기**: CLI 기능을 지속적으로 수정하며 테스트할 때 매우 유용합니다.

#### 개발 중인 CLI에 인수 전달하기
- `package.json`에 정의된 스크립트를 통해 인수를 전달하려면 명령어 뒤에 `--`를 붙여 사용합니다.
- **예시**: `npm run dev:cli:watch -- auth login --method=github`

### 빌드 및 컴파일

개발이 완료된 CLI를 실행 파일로 만드는 스크립트입니다.

#### `npm run compile-cli`
- **설명**: 현재 운영체제에 맞는 CLI 실행 파일을 빌드합니다. 결과물은 `cli/bin/` 디렉토리에 생성됩니다.
- **사용 시기**: 개발이 완료된 후, 현재 시스템에서 사용할 실행 파일을 생성할 때 사용합니다.

#### `npm run compile-cli-all-platforms`
- **설명**: Windows, macOS (Intel/ARM), Linux (Intel/ARM) 등 모든 주요 플랫폼을 위한 실행 파일을 교차 컴파일합니다.
- **사용 시기**: 공식 릴리즈를 준비하거나 다른 운영체제의 사용자를 위해 실행 파일을 배포해야 할 때 사용합니다.

- **사용 시기**: 공식 릴리즈를 준비하거나 다른 운영체제의 사용자를 위해 실행 파일을 배포해야 할 때 사용합니다.

#### `npm run compile-cli-man-page`
- **설명**: Pandoc을 사용하여 `cli/man/cline.1.md` 마크다운 파일을 `man` 페이지 형식으로 변환합니다.
- **사용 시기**: CLI의 도움말 문서를 업데이트할 때 사용합니다.

### CLI 배포 (npm)

Careti CLI는 `cli-careti/` 패키지로 npm에 배포합니다. 실제 Go 소스는 `cli/`에 있으므로, 배포 전에 **standalone 코어 번들**을 먼저 생성해야 합니다.

#### 사전 조건
- `dist-standalone/cline-core.js`가 존재해야 합니다. (권장: `npm run compile-standalone-npm`)
 - `.env`에 `CARET_NPM_TOKEN`이 있어야 하며, `publish-careti-cli.sh`가 `.env`를 자동 로드합니다. (이미 export 되어 있으면 그 값을 사용)
- 배포 전 **버전 동기화**가 필요합니다.
  - `cli/package.json` → CLI 바이너리에 주입되는 버전
  - `cli-careti/package.json` → npm 패키지 버전

#### 배포 절차
```bash
# 프로젝트 루트에서 실행
## 1) 버전 올리기 (둘 다 동일하게 유지)
# cli/package.json
# cli-careti/package.json

## 2) standalone 번들 생성 (npm 배포용)
npm run compile-standalone-npm
bash cli-careti/scripts/publish-careti-cli.sh
```

- `publish-careti-cli.sh`는 `cli-careti/.npmrc`에 토큰을 주입하고 `npm pack` → `npm publish`를 수행합니다.
- 최초 공개 배포라면 `npm publish --access public` 옵션이 필요할 수 있습니다. 필요 시 스크립트에서 옵션을 추가하세요.
- 이 경로는 `TELEMETRY_SERVICE_API_KEY`/`ERROR_SERVICE_API_KEY`를 요구하지 않습니다. (해당 키는 standalone 번들에 주입될 수 있으므로 필요 시만 설정)
- 배포 완료 후에는 보안을 위해 `cli-careti/.npmrc`를 제거하세요.
  - 예시: `rm -f cli-careti/.npmrc`

#### 배포 후 확인
- `npm view @caretive/careti-cli version`
- `npm i -g @caretive/careti-cli@<version>`
- `careti version`로 CLI/코어 버전이 기대값인지 확인

### Careti 전용 헬퍼 스크립트 (scripts/)

`package.json`의 스크립트들은 개별 단계를 실행하는 데 유용하지만, 실제 개발 과정에서는 여러 단계를 조합하여 실행하는 경우가 많습니다. `scripts/` 디렉토리의 셸 스크립트들은 일반적인 개발 시나리오를 자동화하여 편의성을 높인 도구입니다.

이 스크립트들은 두 가지 주요 그룹으로 나뉩니다.

- **`build-*.sh`**: 소스 코드 변경 후, gRPC 코드 생성부터 Go 바이너리 컴파일까지 **전체 빌드 과정을 수행**하고 실행합니다.
- **`run-*.sh`**: 코드 변경 없이 **마지막으로 성공한 빌드 결과물을 즉시 재실행**하여 빠른 테스트를 지원합니다.

---

#### `scripts/careti-build-run.sh`

- **설명**: CLI 전체를 새로 빌드하고 실행하는 가장 일반적인 스크립트입니다.
- **실행 명령어**: `scripts/careti-build-run.sh [args...]`
- **주요 특징**:
    - `npm run protos-go`, `npm run compile-standalone`, `scripts/build-cli.sh`를 순차적으로 실행하여 모든 종속성을 포함한 클린 빌드를 수행합니다.
    - `npm run protos-go`, `npm run compile-standalone`, `scripts/build-cli.sh`를 순차적으로 실행하여 모든 종속성을 포함한 클린 빌드를 수행합니다.
    - 스크립트에 전달된 모든 인자(`$@`)를 최종 실행 파일에 그대로 전달합니다.
    - 인자가 없으면 기본값으로 `version` 명령어를 실행합니다.
- **사용 시기**: Go 소스 코드, `.proto` 파일 등 CLI에 영향을 주는 코드를 수정한 후 변경사항을 테스트할 때 사용합니다.

---

#### `scripts/careti-run.sh`

- **설명**: 빌드 과정을 건너뛰고 이전에 빌드된 실행 파일을 즉시 실행합니다.
- **실행 명령어**: `scripts/careti-run.sh [args...]`
- **주요 특징**:
    - 컴파일 과정을 생략하여 테스트 주기를 크게 단축시킵니다.
    - 스크립트에 전달된 모든 인자(`$@`)를 실행 파일에 그대로 전달합니다.
    - 인자가 없으면 기본값으로 `version` 명령어를 실행합니다.
- **사용 시기**: 코드 변경 없이 동일한 바이너리를 다른 인자로 반복 테스트할 때 매우 유용합니다.

---

#### `scripts/careti-build-auth.sh`

- **설명**: `auth` 명령어 테스트에 특화된 **빌드 및 실행** 스크립트입니다.
- **실행 명령어**: `scripts/careti-build-auth.sh`
- **주요 특징**:
    - 기본으로 실행 중인 `careti-host/cline-host/cline-core`를 종료하고 `.careti/.cline` locks DB를 정리한 뒤 빌드를 시작합니다. 기존 인스턴스를 보존하려면 `CARET_SKIP_KILL=1`을 설정하세요.
    - `careti-build-run.sh`와 동일하게 전체 빌드 과정을 수행합니다.
    - 빌드 후 `auth -v --no-version-check` 명령어를 고정적으로 실행합니다.
- **사용 시기**: `auth` 관련 기능을 수정한 후, 전체 빌드를 포함한 통합 테스트를 수행할 때 사용합니다.

---

#### `scripts/careti-run-auth.sh`

- **설명**: `auth` 명령어 테스트에 특화된 **빠른 재실행** 스크립트입니다.
- **실행 명령어**: `scripts/careti-run-auth.sh`
- **주요 특징**:
    - 빌드 과정 없이 `cli/bin/careti auth -v --no-version-check` 명령어를 즉시 실행합니다.
- **사용 시기**: `auth` 기능과 관련된 로직 변경 없이, 환경이나 설정 변경 후 빠르게 `auth` 명령어만 반복 테스트할 때 사용합니다.

---

## CLI 인증(서버 연동) 문서

CLI 인증을 서버팀에 이슈로 할당하거나, 목업으로 E2E 플로우를 검증해야 한다면 아래 문서를 우선 공유하세요.

- `careti-docs/development/careti-cli-auth-flow.md`

## 일반적인 개발 워크플로우

1.  **Go 코드 수정**: `cli/pkg/` 또는 `cli/cmd/` 내의 Go 소스 코드를 수정합니다.
2.  **gRPC 정의 수정 (필요시)**: 익스텐션과의 통신 인터페이스를 변경해야 할 경우, `proto/careti/` 내의 `.proto` 파일을 수정합니다.
3.  **gRPC 코드 재생성**: `.proto` 파일을 변경했다면, 터미널에서 `npm run protos-go`를 실행합니다.
