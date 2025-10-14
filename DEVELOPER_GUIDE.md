# 🛠️ Caret 개발자 가이드

Caret 프로젝트의 빌드, 테스트, 패키징 등 개발과 관련된 상세 정보입니다.

## 빌드 및 패키징 🛠️

로컬 개발 환경을 설정하고 확장 프로그램을 빌드하려면 다음 단계를 따르세요.

### 1. 레파지토리 설정

Caret은 [Cline](https://github.com/cline/cline) 프로젝트의 **Fork 기반 아키텍처**를 채택하고 있습니다. Cline의 안정적인 코드베이스를 `src/` 디렉토리에 직접 포함하여, Caret만의 확장 기능을 `caret-src/`에서 개발하는 구조입니다.

1.  **Caret 레파지토리 클론**:
    ```bash
    git clone https://github.com/aicoding-caret/caret.git
    cd caret
    ```

2.  **아키텍처 구조 이해**:
    ```
    caret/
    ├── src/                    # Cline 원본 코드 (보존)
    │   ├── extension.ts        # Cline 메인 진입점
    │   └── core/              # Cline 핵심 로직
    ├── caret-src/             # Caret 확장 기능
    │   ├── extension.ts       # Caret 진입점 (src/ 모듈 활용)
    │   └── core/webview/      # Caret 전용 WebView Provider
    ├── assets/          # Caret 에셋 관리
    │   ├── template_characters/ # AI 캐릭터 템플릿
    │   ├── rules/             # 기본 모드 및 룰 정의
    │   └── icons/             # 프로젝트 아이콘
    ├── caret-docs/            # Caret 전용 문서
    └── webview-ui/            # 프론트엔드 (Cline 빌드 시스템 활용)
        ├── src/components/    # Cline 원본 컴포넌트
        └── src/caret/         # Caret 전용 컴포넌트
    ```
    
    이 구조를 통해 **Cline의 강력한 기능을 그대로 활용**하면서, **Caret만의 고유한 기능을 안전하게 확장**할 수 있습니다.

### 2. 개발 환경 설정 및 의존성 설치

Caret 프로젝트의 모든 의존성을 설치하는 방법입니다.

#### 2-1. 자동 설정 (권장) 🚀

**크로스 플랫폼 (모든 운영체제):**
```bash
# npm 스크립트로 자동 설정 (운영체제 자동 감지)
npm run setup
```

**운영체제별 직접 실행:**
```bash
# Linux/macOS
npm run setup:linux
# 또는
./scripts/setup-dev-env.sh

# Windows
npm run setup:windows
# 또는
scripts\setup-dev-env.bat
```

이 스크립트들은 다음 작업을 자동으로 수행합니다:
- ✅ Node.js 20 설치 및 설정
- ✅ 프로젝트 의존성 설치
- ✅ Protocol Buffer 컴파일
- ✅ TypeScript 컴파일 테스트
- ✅ WebView UI 빌드 테스트

#### 2-2. 수동 설정

**Node.js 버전 확인 및 업데이트 (필수):**

Caret은 Node.js 20.x를 요구합니다. 현재 버전을 확인하고 필요시 업데이트하세요:

**Linux/macOS:**
```bash
# 현재 Node.js 버전 확인
node --version

# Node.js 12.x 이하인 경우 업데이트 필요
# 권장 방법: nvm 사용 (프로젝트별 버전 관리)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# 또는 시스템 패키지 매니저 사용
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
```cmd
# 현재 Node.js 버전 확인
node --version

# nvm-windows 설치 (https://github.com/coreybutler/nvm-windows/releases)
# 설치 후 Node.js 20 설치
nvm install 20.19.4
nvm use 20.19.4

# 또는 Node.js 공식 사이트에서 직접 설치
# https://nodejs.org/en/download/
```

> **💡 팁**: 프로젝트에 `.nvmrc` 파일이 있으므로 `nvm use`만 실행해도 자동으로 Node.js 20으로 전환됩니다.

**의존성 설치:**

```bash
# 모든 플랫폼에서 권장 - 루트와 webview-ui 의존성을 한번에 설치
npm run install:all
```

이 명령어는 다음과 같은 작업을 수행합니다:
- 루트 프로젝트의 의존성 설치 (`npm install`)
- webview-ui 디렉토리의 의존성 설치 (`cd webview-ui && npm install`)

> **참고**: `npm run install:all`은 **의존성 설치 전용** 명령어입니다. VSIX 파일 빌드와는 별개의 작업입니다.

### 3. 수동 설정 (문제 발생 시)

만약 자동 설정 스크립트가 실패하거나 특정 단계를 직접 실행하고 싶을 경우, 아래의 수동 절차를 따르세요.

```bash
# 1. Node.js 버전 확인 (필수)
node --version  # 20.x 이상이어야 함

# 2. 의존성 설치
npm install
cd webview-ui && npm install && cd ..

# 3. Protocol Buffer 컴파일
npm run protos

# 4. TypeScript 컴파일 확인
npm run compile
```

#### 🔧 일반적인 문제 해결

**Node.js 버전 오류 (`ERR_MODULE_NOT_FOUND: Cannot find package 'fs'` 등):**
```bash
# Node.js 20 설치 후 재시도
nvm install 20 && nvm use 20
npm run install:all
npm run compile
```

**의존성 관련 오류:**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules webview-ui/node_modules
npm run install:all
```

**Windows에서 nvm 관련 오류:**
```cmd
# nvm이 인식되지 않는 경우
# 1. 새 명령 프롬프트 창 열기
# 2. 또는 시스템 환경 변수 확인
# 3. nvm-windows 재설치 고려
```

**Linux/macOS에서 npm_config_prefix 오류:**
```bash
# nvm 호환성 문제 해결
unset npm_config_prefix
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### 4. 개발 빌드

확장 프로그램의 TypeScript 코드를 컴파일합니다:

```bash
# Protocol Buffer 컴파일 (필요시)
npm run protos

# TypeScript 컴파일
npm run compile
```

### 5. 개발 환경에서 실행

VS Code에서 `F5` 키를 눌러 디버깅 세션을 시작하면, 새로운 `[Extension Development Host]` 창에서 확장 프로그램을 테스트할 수 있습니다.

**Caret 실행 방법:**
- 확장 프로그램이 실행되면 VS Code의 **Primary Sidebar**에 **Caret 아이콘**이 추가됩니다.
- 이 아이콘을 클릭하여 Caret 웹뷰를 열고 사용을 시작할 수 있습니다.

**개발 모드 특징:**
- **Hot Reload**: `npm run watch` 명령어로 코드 변경 시 자동 컴파일
- **디버깅**: VS Code 디버거를 통한 백엔드 코드 디버깅 지원
- **통합 로깅**: 개발/프로덕션 모드 자동 감지로 최적화된 로그 출력 (개발: DEBUG+콘솔, 프로덕션: INFO+VSCode만)

### 6. VSIX 릴리즈 패키징 🎯

개발된 확장 프로그램을 `.vsix` 파일로 패키징하여 로컬 설치 또는 배포할 수 있습니다. 
**모든 빌드 결과물은 `output/` 디렉토리에 `caret-{버전}-{날짜시간}.vsix` 형식으로 생성됩니다.**

> **⚠️ 중요**: `.vsix` 파일을 생성할 때는 항상 `npm run package:release` 명령어를 사용하세요. 이 명령어는 전체 빌드 과정을 포함하여 안정적인 패키지를 생성합니다. (`npm run package` 명령어는 더 이상 사용되지 않으므로 `package:release` 사용을 권장합니다.)

#### 6-1. JavaScript 스크립트 방식 (✅ 권장 - 모든 환경)

```bash
# 프로젝트 루트에서 실행
npm run package:release
```

**이 명령어로 생성되는 파일**: `output/caret-0.1.0-202501271545.vsix`

이 명령어는 다음 작업을 자동으로 수행합니다:
- ✅ `package.json`에서 버전 정보 읽기
- ✅ 타임스탬프 생성 (YYYYMMDDHHMM 형식)
- ✅ `output/` 디렉토리 생성 (없는 경우)
- ✅ 이전 빌드 정리 (`webview-ui/build/`, `dist/`)
- ✅ 전체 클린 빌드 (`npm run protos`, `npm run compile`, `npm run build:webview`)
- ✅ VSIX 패키징 (`vsce package --out output/caret-{버전}-{타임스탬프}.vsix`)
- ✅ 패키지 크기 분석 및 경고 (300MB/750MB 임계값)


#### 🚀 빌드 결과 확인

두 방법 모두 동일한 결과를 생성합니다:
- **위치**: `output/caret-{버전}-{날짜시간}.vsix`
- **예시**: `output/caret-0.1.0-202501271545.vsix`
- **설치**: `code --install-extension output/caret-0.1.0-202501271545.vsix`

## 🧪 테스트 및 품질 관리

Caret은 **TDD(Test-Driven Development) 방법론**을 채택하여 높은 코드 품질을 유지합니다.

### 📊 전체 테스트 + 커버리지 실행

```bash
# 🌟 권장: 전체 테스트 + 커버리지 분석 (한번에)
npm run test:all; npm run caret:coverage

# 또는 백엔드 상세 커버리지까지 포함
npm run test:all; npm run test:backend:coverage; npm run caret:coverage
```

### 🎯 개별 테스트 실행

**⚠️ 중요: 올바른 테스트 명령어 사용법**

**❌ 주의: `npm test` 사용 금지**
- `npm test`는 전체 빌드 + 컴파일 + 린트 + 모든 테스트를 실행하므로 매우 느림
- 개발 중에는 아래의 **개별 테스트 명령어** 사용 권장

**✅ 개발 중 권장 테스트 명령어:**

```bash
# 백엔드 개별 테스트 (특정 파일)
npm run test:backend caret-src/__tests__/your-test-file.test.ts

# 백엔드 개별 테스트 (특정 테스트 이름)
npm run test:backend caret-src/__tests__/your-test-file.test.ts -t "your test name"

# 프론트엔드 테스트
npm run test:webview

# 백엔드 감시 모드 (개발 중 자동 실행)
npm run test:backend:watch

# 빠른 개발 테스트 (웹뷰 제외, 실패 시 즉시 중단)
npm run dev:build-test:fast
```

**📊 전체 테스트 + 커버리지 (CI/CD 또는 최종 검증용):**

```bash
# 전체 테스트 + 커버리지 분석
npm run test:all && npm run caret:coverage

# 통합 테스트 (VSCode Extension 환경)
npm run test:integration
```

### 📈 커버리지 분석

```bash
# Caret 전용 코드 커버리지 분석 (파일별 상세)
npm run caret:coverage

# 백엔드 Vitest 커버리지 (라인별 상세)
npm run test:backend:coverage

# VSCode Extension 통합 커버리지
npm run test:coverage
```

### 🎯 테스트 현황 확인

위의 명령어들을 실행하면 현재 프로젝트의 테스트 통과율과 커버리지를 실시간으로 확인할 수 있습니다.

### 📋 TDD 원칙 및 커버리지 목표

Caret 프로젝트는 다음 TDD 원칙을 준수합니다:

1. **🔴 RED**: 실패하는 테스트를 먼저 작성
2. **🟢 GREEN**: 테스트를 통과하는 최소한의 코드 작성  
3. **🔄 REFACTOR**: 코드 품질 개선

#### 🎯 커버리지 목표 및 현실

- **🥕 Caret 신규 로직**: **100% 커버리지 필수** - 모든 새로운 기능과 비즈니스 로직은 테스트 우선 개발
- **🔗 기존 Re-export**: 일부 파일은 Cline 모듈의 단순 재내보내기로 별도 테스트 불필요
- **📦 Type 정의**: 인터페이스 정의만 포함한 파일은 런타임 로직이 없어 테스트 제외 가능

**새로운 기능 개발 시 반드시 테스트를 먼저 작성해야 합니다!**

자세한 테스트 가이드는 **[테스트 가이드](./caret-docs/development/testing-guide.mdx)**를 참조하세요.

## 🔄 개발 워크플로우

### 1. 새 기능 개발 (권장 프로세스)

#### 백엔드 확장 패턴
```typescript
// caret-src/core/feature/NewFeature.ts
import { WebviewProvider } from "../../../src/core/webview/WebviewProvider"

export class NewFeature extends WebviewProvider {
	// Cline 기능 확장
	override async handleRequest(request: any) {
		// Caret 고유 로직
		const caretResult = await this.processCaretSpecific(request)

		// Cline 기본 처리와 결합
		const baseResult = await super.handleRequest(request)

		return { ...baseResult, ...caretResult }
	}
}
```

#### 프론트엔드 확장 패턴
```typescript
// webview-ui/src/caret/components/NewComponent.tsx
import React from 'react'
import { useExtensionState } from '../../context/ExtensionStateContext'

export const NewComponent: React.FC = () => {
	const { state } = useExtensionState()
	
	// Caret 전용 UI 로직
	return <div>새로운 기능</div>
}
```

### 2. 개발 단계별 검증

1. **Phase 0**: 아키텍처 검토 및 문서 확인
2. **Phase 1**: TDD RED - 실패하는 테스트 작성
3. **Phase 2**: TDD GREEN - 최소 구현
4. **Phase 3**: TDD REFACTOR - 코드 품질 개선

### 3. 빌드 명령어 상세

```bash
# 📦 Protocol Buffer 컴파일 (gRPC 통신용)
npm run protos

# 🔧 TypeScript 컴파일 (전체 검증 포함)
npm run compile

# ⚡ 빠른 컴파일 (개발 중 빠른 빌드용)
npm run compile:fast

# 🌐 Webview UI 빌드 (프론트엔드)
cd webview-ui && npm run build && cd ..

# 🚀 VSIX 릴리즈 패키지 생성 (타임스탬프 포함)
npm run package:release

# 👀 개발용 watch 모드
npm run watch
```

#### 빌드 최적화 팁
- **`npm run compile`**: 완전한 빌드 (타입 체크 + 린팅 + 컴파일) - PR 제출 전 사용
- **`npm run compile:fast`**: 빠른 빌드 (컴파일만) - 개발 중 반복 사용
- **Protocol Buffer**: MCP 서버 통신을 위한 protobuf 컴파일 자동화
- **esbuild**: 빠른 TypeScript 번들링으로 개발 속도 향상

## 📚 상세 개발 가이드

### 🏗️ 아키텍처 & 설계 가이드
- **[Caret 아키텍처 가이드](./caret-docs/development/caret-architecture-and-implementation-guide.mdx)** - Fork 구조, 확장 전략, 설계 원칙
- **[개발 가이드 개요](./caret-docs/development/index.mdx)** - 전체 개발 가이드 네비게이션
- **[AI 작업 방법론](./caret-docs/guides/ai-work-method-guide.mdx)** - TDD, 아키텍처 검토, Phase 기반 작업

### 🔄 Frontend-Backend 통신 가이드
- **[상호작용 패턴](./caret-docs/development/frontend-backend-interaction-patterns.mdx)** - 순환 메시지 방지, Optimistic Update 패턴
- **[Webview 통신](./caret-docs/development/webview-extension-communication.mdx)** - 메시지 타입, 상태 관리, 통신 구조

### 🎨 UI/UX 개발 가이드
- **[컴포넌트 아키텍처](./caret-docs/development/component-architecture-principles.mdx)** - React 컴포넌트 설계 원칙
- **[i18n 시스템](./caret-docs/development/backend-i18n-system.mdx)** - 다국어 지원 구현 가이드

### 🔧 개발 도구 & 유틸리티
- **[로깅 시스템](./caret-docs/development/logging.mdx)** - 통합 로깅, 디버깅, 개발/프로덕션 모드
- **[문서화 가이드](./caret-docs/development/documentation-guide.mdx)** - MDX 형식, 문서 작성 표준

### 🎯 개발 시작 추천 순서

1. **아키텍처 이해**: [Caret 아키텍처 가이드](./caret-docs/development/caret-architecture-and-implementation-guide.mdx)
2. **개발 방법론**: [AI 작업 방법론](./caret-docs/guides/ai-work-method-guide.mdx)
3. **테스트 전략**: [테스트 가이드](./caret-docs/development/testing-guide.mdx)
4. **통신 패턴**: [상호작용 패턴](./caret-docs/development/frontend-backend-interaction-patterns.mdx)
5. **UI 컴포넌트**: [컴포넌트 아키텍처](./caret-docs/development/component-architecture-principles.mdx)

💡 **개발 시작 전 필독**: [AI 작업 방법론 가이드](./caret-docs/guides/ai-work-method-guide.mdx)에서 TDD 기반 개발 프로세스와 아키텍처 원칙을 먼저 숙지하시기 바랍니다.

## 🔬 특허 기술

### 핵심 기술
Caret의 **모듈형 시스템 프롬프트 아키텍처**는 CARETIVE INC의 특허 출원 기술("프롬프트 정보 최적화 방법 및 시스템")을 기반으로 구현되었습니다.

**주요 특징:**
- **이중 표현 방식**: 마크다운-JSON 구조로 인간과 AI 모두 최적화
- **모듈형 구조**: 하드코딩된 프롬프트를 JSON 모듈로 분해하여 관리
- **토큰 최적화**: 중복 요소 식별을 통한 API 비용 절감
- **자동 검증**: 기능 보존을 보장하는 안전성 시스템

### 라이센스
- **오픈소스**: Apache 2.0 라이센스로 자유로운 사용, 수정, 배포 가능
- **특허 보호**: 핵심 기술의 지적재산권은 CARETIVE INC 보유
- **상업적 이용**: 특허 관련 문의는 **support@caretive.ai**

## 📊 Telemetry (PostHog) 설정

Caret Community/Dev 빌드와 Release 빌드에서 **텔레메트리 활성 여부**를 완전히 분리했습니다.

| 빌드 종류 | 환경 변수 | 결과 |
|-----------|-----------|-------|
| dev / community | _(미설정)_ | PostHog **비활성화** (이벤트 0건) |
| release (enterprise) | `POSTHOG_API_KEY`, `POSTHOG_HOST`, `POSTHOG_UIHOST` | PostHog **활성화** – `posthog.caret.team` 으로 전송 |

빌드 예시:

```bash
# 🚧 Community/dev (VSCode F5)
npm run watch            # 텔레메트리 없음

# 🚀 Release / CI
export BUILD_FLAVOR=enterprise
export POSTHOG_API_KEY=phc_xxx            # PostHog UI에서 발급
export POSTHOG_HOST="https://posthog.caret.team"
export POSTHOG_UIHOST="https://posthog.caret.team"

npm run package:release   # output/caret-<ver>-<ts>.vsix
```

> 환경 변수를 설정하지 않으면 `PostHogClientProvider` 가 자동으로 더미 클라이언트로 폴백됩니다.
