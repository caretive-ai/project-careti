# IntelliJ 빌드 스크립트 조사 및 구현

**날짜**: 2025-10-17  
**담당**: Alpha  
**상태**: ⚠️ 중요 발견 - 아키텍처 오해 수정

## 🎯 목표

Cline에서 IntelliJ (JetBrains) 빌드를 지원하는 흔적이 있으므로, Caret에서도 이를 활용할 수 있는 빌드 스크립트를 만들고자 합니다.

## 📋 작업 계획

- [x] Git 히스토리에서 JetBrains 관련 커밋 조사
- [x] JetBrains 관련 워크플로우 파일 분석
- [x] esbuild.mjs의 JetBrains 빌드 설정 확인
- [x] package.json의 빌드 스크립트 확인 (JetBrains 관련 스크립트 없음)
- [ ] JetBrains 플러그인 저장소 구조 파악 (별도 저장소로 관리됨)
- [ ] Caret용 IntelliJ 빌드 스크립트 설계
- [ ] 빌드 스크립트 구현
- [ ] 테스트 및 검증
- [ ] 문서화

## 🔍 조사 결과

### 1. Git 히스토리 분석

주요 커밋:
- `30c121509`: JetBrains 테스트 트리거 워크플로우 추가
- `2687ae149`: esbuild에 JetBrains 빌드용 텔레메트리 환경 변수 설정
- `b5fde0adb`: JetBrains 인스턴스 목록 지원 및 kill all 기능

### 2. 워크플로우 분석 (`.github/workflows/trigger-jetbrains-tests.yml`)

**목적**: Cline 저장소의 PR이 생성/업데이트될 때 JetBrains 플러그인 저장소의 통합 테스트를 자동 트리거

**동작 방식**:
```yaml
- GitHub App 토큰 생성 (app-id: 1998650)
- API 호출로 cline/intellij-plugin 저장소에 dispatch 이벤트 전송
- client_payload로 PR 정보 전달:
  - pr_number
  - branch_name
  - action
  - sha
  - pr_title
  - pr_url
```

### 3. esbuild.mjs 환경 변수 설정

**JetBrains 빌드 관련 환경 변수**:
```javascript
// 프로덕션 빌드 감지
const production = process.argv.includes("--production") || 
                   process.env["IS_DEBUG_BUILD"] === "false"

// 텔레메트리 환경 변수
buildEnvVars["process.env.CLINE_ENVIRONMENT"] = JSON.stringify(process.env.CLINE_ENVIRONMENT)
buildEnvVars["process.env.TELEMETRY_SERVICE_API_KEY"] = JSON.stringify(process.env.TELEMETRY_SERVICE_API_KEY)
buildEnvVars["process.env.ERROR_SERVICE_API_KEY"] = JSON.stringify(process.env.ERROR_SERVICE_API_KEY)
buildEnvVars["process.env.POSTHOG_TELEMETRY_ENABLED"] = JSON.stringify(process.env.POSTHOG_TELEMETRY_ENABLED)
```

### 4. package.json 분석

**결과**: JetBrains 관련 빌드 스크립트가 `package.json`에 존재하지 않음

### 5. ⚠️ 중요 발견: 저장소 확인

마스터의 지적으로 중요한 사실 확인:

```bash
# GitHub API 확인 결과
curl -s https://api.github.com/repos/cline/intellij-plugin
# Response: "Not Found"
```

**결론**: `cline/intellij-plugin` 저장소는 **public이 아니거나 존재하지 않음**

### 6. Git 히스토리 재분석 - 새로운 발견

추가 커밋 조사 결과 **완전히 다른 아키텍처** 발견:

**HostBridge 패턴 관련 커밋들**:
- `625a2bc4b`: "migrate diff edit diagnostics to hostbridge; enable multi-host support (VS Code + IntelliJ)"
- `a231ee4d5`: "Remove references to vscode.env.uriScheme"
- `531a272a6`: "Remove uses of VSCode API"
- `5c878b5b8`: "Jetbrains docs (early access language tweaks)"
- `1cf62941c`: "Fix webview on IntelliJ"
- `372328825`: "Add a field to the HostProvider for extension install dir"

**핵심 발견**: Cline은 **별도 플러그인이 아니라**, **HostBridge 추상화 레이어**를 통해 VSCode와 IntelliJ를 모두 지원하는 **단일 확장 프로그램**입니다!

### 7. HostBridge 아키텍처 분석

**설계 개념**:
```
Cline Core
    ↓
HostBridge (추상화 레이어)
    ↓
├─ VSCode API
└─ IntelliJ API
```

**장점**:
- 단일 코드베이스로 여러 IDE 지원
- VSCode API 직접 의존 제거
- 각 IDE별 어댑터 패턴

**증거**:
- "Remove uses of VSCode API" 커밋
- HostProvider 인터페이스 도입
- 환경별 webview 렌더링 수정

1. **별도 저장소**: JetBrains 플러그인은 `cline/intellij-plugin`이라는 별도 저장소로 관리됨
2. **빌드 시스템**: esbuild를 사용하며 환경 변수로 빌드 타입 제어
3. **CI/CD 통합**: GitHub Actions를 통한 자동화된 테스트 트리거
4. **환경 변수 주입**: 빌드 시 텔레메트리 및 환경 설정 주입

## 📝 다음 단계

1. **package.json 스크립트 확인**
   - JetBrains 관련 빌드 스크립트가 있는지 확인
   - 기존 빌드 프로세스 파악

2. **JetBrains 플러그인 저장소 조사**
   - `cline/intellij-plugin` 저장소 구조 파악
   - 빌드 방식 및 요구사항 분석

3. **Caret용 스크립트 설계**
   - Caret의 브랜딩 시스템과 통합
   - CodeCenter 브랜드 지원 고려
   - 환경 변수 관리 방안

4. **구현 및 테스트**
   - 빌드 스크립트 작성
   - 로컬 테스트
   - 문서 작성

## � 상세 구현 계획

### ✅ B2B 요구사항 확인
마스터 확인: **IntelliJ 지원은 B2B 필수 요구사항**

### 🏗️ HostBridge 아키텍처 분석 완료

#### 현재 Cline 구조
```
Cline Core
    ↓
HostProvider (Singleton)
    ├─ createWebviewProvider: () => WebviewProvider
    ├─ createDiffViewProvider: () => DiffViewProvider
    ├─ hostBridge: HostBridgeClientProvider
    │   ├─ workspaceClient (proto/host/workspace.proto)
    │   ├─ envClient (proto/host/env.proto)
    │   ├─ windowClient (proto/host/window.proto)
    │   └─ diffClient (proto/host/diff.proto)
    ├─ logToChannel: (message: string) => void
    ├─ getCallbackUrl: () => Promise<string>
    ├─ getBinaryLocation: (name: string) => Promise<string>
    ├─ extensionFsPath: string
    └─ globalStorageFsPath: string

초기화 위치:
src/extension.ts (VSCode)
    └─ setupHostProvider()
        └─ HostProvider.initialize(
            vscodeHostBridgeClient,  // VSCode 구현
            ...
        )

src/hosts/external/ (IntelliJ)
    ├─ ExternalWebviewProvider.ts
    ├─ ExternalDiffviewProvider.ts
    ├─ host-bridge-client-manager.ts
    └─ grpc-types.ts
```

#### Protocol Buffers 정의
- `proto/host/workspace.proto` - 파일 시스템 작업
- `proto/host/env.proto` - 환경 정보
- `proto/host/window.proto` - UI 인터랙션
- `proto/host/diff.proto` - Diff 뷰 관리
- `proto/host/testing.proto` - 테스트 지원

### 📋 구현 단계

#### Phase 1: IntelliJ Plugin 프로젝트 생성 (3-5일)
**목표**: IntelliJ 플러그인 기본 구조 생성

**작업**:
- [ ] IntelliJ IDEA 플러그인 프로젝트 스캐폴딩
  - `plugin.xml` 설정
  - Gradle 빌드 스크립트
  - Kotlin/Java 프로젝트 구조
- [ ] Cline의 IntelliJ 플러그인 참고 (비공개 저장소 접근 필요 시 대안 방안 수립)
- [ ] 기본 Tool Window 생성
- [ ] WebView 렌더링 확인
- [ ] 개발 환경 설정

**결과물**:
- IntelliJ 플러그인 기본 골격
- 빌드 스크립트
- 개발 환경 설정 문서

#### Phase 2: gRPC HostBridge 서버 구현 (5-7일)
**목표**: IntelliJ 플러그인에서 Caret Core와 통신할 gRPC 서버 구현

**작업**:
- [ ] proto/host/*.proto 기반 gRPC 서버 생성
  - WorkspaceService 구현
  - EnvService 구현
  - WindowService 구현
  - DiffService 구현
- [ ] IntelliJ IDEA API를 gRPC 서비스로 어댑팅
  - FileSystem API → WorkspaceService
  - Application/Project API → EnvService
  - ToolWindow/Notification API → WindowService
  - Editor/Document API → DiffService
- [ ] 연결 관리 및 에러 핸들링
- [ ] 로깅 시스템 통합

**결과물**:
- gRPC 서버 구현 코드
- IntelliJ API 어댑터
- 통합 테스트

#### Phase 3: Caret Core 통합 (3-4일)
**목표**: Caret Core가 IntelliJ 플러그인과 통신하도록 수정

**작업**:
- [ ] `src/hosts/external/` 활용
  - ExternalWebviewProvider 적용
  - ExternalDiffviewProvider 적용
  - host-bridge-client-manager 설정
- [ ] 환경 감지 로직
  - VSCode vs IntelliJ 자동 감지
  - 빌드 타임 vs 런타임 설정
- [ ] Caret 브랜딩 적용
  - UI 텍스트
  - 아이콘
  - 플러그인 메타데이터

**결과물**:
- Caret Core 수정 사항
- 환경 감지 로직
- 브랜딩 적용 완료

#### Phase 4: WebView UI 통합 (4-5일)
**목표**: Caret의 React UI를 IntelliJ WebView에 렌더링

**작업**:
- [ ] IntelliJ JCEF (Java Chromium Embedded Framework) 통합
- [ ] React 빌드 산출물 로딩
- [ ] VSCode Webview API → IntelliJ JCEF 메시지 브리지
- [ ] Hot reload 지원 (개발 모드)
- [ ] UI 반응형 조정 (IntelliJ Tool Window 크기)

**결과물**:
- WebView 통합 완료
- 메시지 브리지
- UI 반응형 수정

#### Phase 5: 빌드 & 배포 시스템 (2-3일)
**목표**: 빌드 및 배포 자동화

**작업**:
- [ ] Gradle 빌드 스크립트 완성
  - Caret Core 빌드 통합
  - WebView UI 빌드 통합
  - 플러그인 패키징
- [ ] 브랜딩 스크립트 통합
  - Caret vs CodeCenter 전환
- [ ] CI/CD 설정
  - GitHub Actions 워크플로우
  - JetBrains Marketplace 배포
- [ ] 버전 관리 전략

**결과물**:
- 빌드 스크립트
- CI/CD 파이프라인
- 배포 문서

#### Phase 6: 테스트 & QA (3-4일)
**목표**: 통합 테스트 및 품질 보증

**작업**:
- [ ] 통합 테스트 작성
  - gRPC 통신 테스트
  - UI 인터랙션 테스트
  - 파일 작업 테스트
- [ ] IntelliJ 버전 호환성 테스트
  - IntelliJ IDEA (Community/Ultimate)
  - PyCharm, WebStorm, etc.
- [ ] 성능 테스트
- [ ] 버그 수정

**결과물**:
- 테스트 코드
- 호환성 매트릭스
- 버그 리포트 및 수정

### � 작업 규모 산정

#### 인원 및 기간
- **예상 기간**: 20-28 작업일 (4-6주)
- **필요 인력**:
  - IntelliJ 플러그인 개발자 1명 (Kotlin/Java, IntelliJ Platform SDK 경험)
  - 백엔드 개발자 1명 (gRPC, Protocol Buffers 경험)
  - 프론트엔드 개발자 0.5명 (React, WebView 통합 경험)

#### 작업 분담
| Phase | 작업자 | 기간 | 의존성 |
|-------|--------|------|--------|
| Phase 1 | IntelliJ Dev | 3-5일 | 없음 |
| Phase 2 | Backend Dev | 5-7일 | Phase 1 완료 |
| Phase 3 | Backend Dev | 3-4일 | Phase 2 완료 |
| Phase 4 | Frontend Dev | 4-5일 | Phase 3 완료 |
| Phase 5 | IntelliJ Dev | 2-3일 | Phase 4 완료 |
| Phase 6 | All | 3-4일 | Phase 5 완료 |

#### 위험 요소
1. **🔴 높음**: Cline의 IntelliJ 플러그인 코드가 비공개
   - **완화 방안**: Cline 문서 참고, 커밋 히스토리 분석, 역공학
2. **🟡 중간**: IntelliJ Platform SDK 학습 곡선
   - **완화 방안**: JetBrains 공식 문서, 샘플 프로젝트 참고
3. **🟡 중간**: gRPC 성능 및 안정성
   - **완화 방안**: 충분한 테스트, 에러 핸들링 강화
4. **🟢 낮음**: 브랜딩 시스템 통합
   - **완화 방안**: 기존 Caret 브랜딩 시스템 재사용

### 💰 예상 비용 (초기 추정)
- **개발 비용**: 20-28 작업일 × 2.5 인력 = **50-70 인일**
- **테스트 및 QA**: 추가 10% = **55-77 인일**
- **마진 (20%)**: **66-92 인일**

---

## ⚠️ 2025-10-17 추정치 재산정

**마스터 지적사항:**
- ❌ "너무 길게 잡은것 같은데?"
- ✅ "gRPC를 쓰기 때문에 백엔드 구현은 거의 필요 없지 않아?"
- ✅ "HostBridge서버 구현의 범위는 얼마나? 크지 않을것 같은데"

**실제 코드 분석 결과:**

VSCode 구현체를 상세 분석한 결과:
- **L1 (Simple)**: 15개 RPC - 평균 6줄, `executeCommand` 한 줄!
  - 예: `openTerminalPanel` - 전체 6줄
- **L2 (Medium)**: 15개 RPC - 평균 50줄, API + 변환
  - 예: `getDiagnostics` - 전체 70줄
- **L3 (Complex)**: 6개 RPC - 복잡한 케이스만
  - 예: `openDiff` - 별도 Provider 패턴

### 📊 재산정 요약

| Phase | 초기 추정 | **재산정** | 감소율 |
|-------|-----------|-----------|--------|
| Phase 1: 아키텍처 조사 | 5-8일 | **3-5일** | -40% |
| Phase 2: HostBridge 구현 | 26-45일 | **18-26일** | -42% |
| Phase 3: 빌드 시스템 | 8-12일 | **4-6일** | -50% |
| Phase 4: 테스트 및 검증 | 8-12일 | **4-6일** | -50% |
| Phase 5: 문서화 | 4-6일 | **2-3일** | -50% |
| Phase 6: 배포 및 모니터링 | 3-5일 | **1-2일** | -60% |
| **합계** | **54-88일** | **32-48일** | **-45%** |

**최종 추정 (15% 버퍼 포함):**
- **최소**: 32 person-days
- **최대**: 48 person-days
- **현실적**: **37-55 person-days**

**초기 대비**: 66-92일 → 37-55일 (**45% 감소**)

### 📝 상세 재산정 문서

상세한 분석 내용은 다음 문서 참조:
- **[2025-10-17-intellij-revised-estimate.md](./2025-10-17-intellij-revised-estimate.md)**
  - 36개 RPC별 복잡도 분류
  - VSCode 구현 샘플 코드 분석
  - Phase별 상세 재산정 근거

### 🎯 다음 단계

마스터 검토 후:
- [ ] 재산정 결과 승인 대기
- [ ] Phase 1 시작: 아키텍처 설계 (3-5일)
- [ ] IntelliJ Plugin 프로젝트 생성
- [ ] 첫 gRPC RPC 구현 (L1부터 시작)

**예상 일정**: 8-11주 (2-2.5개월)

---

## ✅ Phase 2 완료 (2025-10-17)

### 구현 완료 내역

**실제 소요 시간**: 약 1.5시간 (예상: 2-2.5시간)

#### 구현 항목
1. **WorkspaceServiceImpl.kt** (236 lines)
   - 7개 RPC 메서드 완전 구현
   - IntelliJ Platform API 통합
   - Kotlin Coroutines 기반 async 처리

2. **EnvServiceImpl.kt** (242 lines)
   - 7개 RPC 메서드 완전 구현
   - System integration (클립보드, 버전 정보)
   - Telemetry streaming 지원

3. **HostBridgeServer.kt**
   - WorkspaceServiceImpl 등록
   - EnvServiceImpl 등록
   - gRPC 서버 빌더 통합

#### 통계
- **코드**: ~480 lines
- **RPC Methods**: 14 methods
- **Services**: 2 services
- **Commit**: `00cdbe123`

#### 검증 필요
- [ ] IntelliJ IDEA에서 프로젝트 열기
- [ ] Gradle 빌드 성공 확인
- [ ] Proto 파일 컴파일 확인
- [ ] HostBridgeServer 인스턴스 생성 가능 확인

#### 다음 단계
- **Phase 3**: JCEF Webview 통합 (예상: 1-1.5시간)
- **Phase 4**: E2E 테스트 및 검증

**상세 보고서**: [2025-10-17-intellij-phase2-completion-report.md](./2025-10-17-intellij-phase2-completion-report.md)

## 📚 참고 자료

- JetBrains 플러그인 저장소: `https://github.com/cline/intellij-plugin`
- 관련 커밋: `30c121509`, `2687ae149`, `b5fde0adb`
- 워크플로우: `.github/workflows/trigger-jetbrains-tests.yml`
- **Phase 2 완료 보고서**: [2025-10-17-intellij-phase2-completion-report.md](./2025-10-17-intellij-phase2-completion-report.md)
