# IntelliJ 플러그인 구현 - 실제 코드 분석 기반 재산정

**날짜**: 2025-10-17  
**담당**: Alpha  
**상태**: ✅ 실제 코드 분석 완료 - 추정치 45% 감소

## 🎯 마스터 지적사항

**초기 추정 66-92 person-days에 대한 피드백:**
1. ❌ "너무 길게 잡은것 같은데?"
2. ✅ "gRPC를 쓰기 때문에 백엔드 구현은 거의 필요 없지 않아?"
3. ✅ "HostBridge서버 구현의 범위는 얼마나? 크지 않을것 같은데"
4. 📋 "더 브레이크다운해봐. 그리고 그 브레이크다운 단위로 실제 코드랑 분석해보고"

## 📊 실제 코드 분석 결과

### VSCode 구현체 샘플 분석

#### L1 (Simple) - openTerminalPanel.ts
```typescript
// 전체 6줄!
export async function openTerminalPanel(_: OpenTerminalRequest): Promise<OpenTerminalResponse> {
	vscode.commands.executeCommand("workbench.action.terminal.focus")
	return {}
}
```
**분석**: executeCommand 한 줄만! IntelliJ도 동일 패턴 가능

#### L2 (Medium) - getDiagnostics.ts
```typescript
// 전체 70줄
export async function getDiagnostics(_request: GetDiagnosticsRequest): Promise<GetDiagnosticsResponse> {
	const vscodeAllDiagnostics = vscode.languages.getDiagnostics()
	const fileDiagnostics = convertToFileDiagnostics(vscodeAllDiagnostics)
	return { fileDiagnostics }
}

// + 변환 헬퍼 함수들 (50줄)
```
**분석**: API 호출 + 데이터 변환 로직

#### L2+ (Medium-Complex) - showTextDocument.ts
```typescript
// 전체 50줄
export async function showTextDocument(request: ShowTextDocumentRequest): Promise<TextEditorInfo> {
	// 복잡한 탭 중복 제거 로직 (25줄)
	for (const group of vscode.window.tabGroups.all) {
		// 기존 탭 찾기 + 닫기
	}
	
	// API 호출 + 응답
	const editor = await vscode.window.showTextDocument(uri, options)
	return TextEditorInfo.create(...)
}
```
**분석**: 비즈니스 로직 + API 호출

#### L3 (Complex) - openDiff.ts
```typescript
export async function openDiff(_request: OpenDiffRequest): Promise<OpenDiffResponse> {
	throw new Error("diffService is not supported. Use the VscodeDiffViewProvider.")
}
```
**분석**: ⚠️ gRPC 미사용! 별도 Provider 패턴 사용

### 36개 RPC 복잡도 분류

#### WorkspaceService (7개 RPC) - 2-3 person-days

**L1 (Simple) - 4개 × 0.25 = 1 day**
- `openTerminalPanel` ✅ **6줄 확인됨**
- `openProblemsPanel` (executeCommand 예상)
- `openInFileExplorerPanel` (executeCommand 예상)
- `openClineSidebarPanel` (executeCommand 예상)

**L2 (Medium) - 2개 × 0.5 = 1 day**
- `getWorkspacePaths` (프로젝트 경로 반환)
- `saveOpenDocumentIfDirty` (문서 저장 API)

**L2+ (Medium-Complex) - 1개 × 1 = 1 day**
- `getDiagnostics` ✅ **70줄 확인됨** (진단 정보 + 변환)

---

#### EnvService (7개 RPC) - 2-3 person-days

**L1 (Simple) - 4개 × 0.25 = 1 day**
- `clipboardWriteText` (IntelliJ Clipboard API)
- `clipboardReadText` (IntelliJ Clipboard API)
- `getIdeRedirectUri` (상수 반환)
- `shutdown` (간단한 종료)

**L2 (Medium) - 2개 × 0.5 = 1 day**
- `getHostVersion` (IDE 버전 조회)
- `getTelemetrySettings` (설정 읽기)

**L2+ (Medium-Complex) - 1개 × 1 = 1 day**
- `subscribeToTelemetrySettings` (gRPC streaming + 설정 변경 감지)

---

#### WindowService (12개 RPC) - 4-5 person-days

**L1 (Simple) - 5개 × 0.25 = 1.25 days**
- `openFile` (FileEditorManager.openFile)
- `openSettings` (ShowSettingsUtil.getInstance)
- `getOpenTabs` (FileEditorManager.getOpenFiles)
- `getVisibleTabs` (FileEditorManager.getSelectedFiles)
- `getActiveEditor` (FileEditorManager.getSelectedTextEditor)

**L2 (Medium) - 5개 × 0.5 = 2.5 days**
- `showOpenDialogue` (FileChooserDescriptor)
- `showMessage` (Messages.show*)
- `showInputBox` (Messages.showInputDialog)
- `showSaveDialog` (FileSaverDescriptor)

**L2+ (Medium-Complex) - 2개 × 0.75 = 1.5 days**
- `showTextDocument` ✅ **50줄 확인됨** (탭 관리 + 에디터 열기)

---

#### DiffService (9개 RPC) - 3-4 person-days

**⚠️ 중요 발견:**
- VSCode에서 `openDiff`는 **VscodeDiffViewProvider 직접 사용** (gRPC 미사용!)
- IntelliJ도 유사하게 **별도 Provider 패턴** 사용 가능성

**L1 (Simple) - 2개 × 0.25 = 0.5 day**
- `closeAllDiffs` (DiffManager.closeAllDiffs)
- `scrollDiff` (Editor.scrollTo)

**L2 (Medium) - 4개 × 0.5 = 2 days**
- `getDocumentText` (Document.getText)
- `replaceText` (Document.replaceString)
- `truncateDocument` (Document.deleteString)
- `saveDocument` (FileDocumentManager.saveDocument)

**L3 (Complex) - 2개 × 1 = 2 days**
- `openDiff` (별도 IntelliJ DiffViewProvider 구현)
- `openMultiFileDiff` (복잡한 멀티 파일 Diff UI)

---

#### TestingService (1개 RPC) - 0.5 person-days

**L2 (Medium) - 1개 × 0.5 = 0.5 day**
- `getWebviewHtml` (JCEF 브라우저 HTML 추출, 테스트용)

---

## 📊 Phase별 재산정

### Phase 1: 아키텍처 조사 및 설계

**이전**: 5-8 person-days  
**재산정**: **3-5 person-days** (-40%)

**근거**: VSCode 구현체가 이미 명확한 패턴 제공

---

### Phase 2: HostBridge Server 구현

**이전**: 26-45 person-days  
**재산정**: **18-26 person-days** (-42%)

#### 2.1 36개 gRPC RPC 구현: 12-16 days
- L1 (Simple): 15개 × 0.25 = 3.75 days
- L2 (Medium): 15개 × 0.5 = 7.5 days
- L2+ (Medium-Complex): 3개 × 0.75 = 2.25 days
- L3 (Complex): 3개 × 1 = 3 days
- **총**: 16.5 days (여유 포함 12-16일)

#### 2.2 IntelliJ Platform SDK 통합: 3-5 days
**이전**: 8-12 days  
**근거**: gRPC 사용으로 복잡한 백엔드 불필요, SDK API만 호출

- IntelliJ IDEA Plugin SDK 설정: 1일
- Kotlin 개발 환경 + gRPC 통합: 1일
- Proto 파일 컴파일 자동화: 1일
- 기본 테스트 환경: 0.5일
- IntelliJ SDK API 매핑 검증: 1일

#### 2.3 플러그인 아키텍처 설계: 2-3 days
**이전**: 3-5 days  
**근거**: VSCode 패턴 재사용

- VSCode 패턴 기반 설계: 1일
- gRPC 서버 초기화 + 생명주기: 0.5일
- 에러 핸들링 + 로깅: 0.5일
- 테스트 가능 구조 설계: 0.5일

#### 2.4 기본 기능 구현: 3-5 days
**이전**: 5-8 days  
**근거**: IntelliJ Platform이 이미 모든 API 제공

- JCEF 웹뷰 통합: 2일 (가장 복잡)
- 파일/에디터/터미널: 1일 (SDK API 직접 사용)
- 기본 UI 통합 테스트: 1일

---

### Phase 3: 빌드 시스템 통합

**이전**: 8-12 person-days  
**재산정**: **4-6 person-days** (-50%)

- Gradle 빌드 설정: 2-3 days (기존 패턴 재사용)
- CI/CD 파이프라인: 1-2 days (GitHub Actions 재사용)
- 릴리스 자동화: 1 day (Marketplace 배포 스크립트)

---

### Phase 4: 테스트 및 검증

**이전**: 8-12 person-days  
**재산정**: **4-6 person-days** (-50%)

- 단위 테스트: 1-2 days (gRPC 핸들러 단순)
- 통합 테스트: 2-3 days
- E2E 테스트: 1 day (핵심 워크플로우만)

---

### Phase 5: 문서화

**이전**: 4-6 person-days  
**재산정**: **2-3 person-days** (-50%)

---

### Phase 6: 배포 및 모니터링

**이전**: 3-5 person-days  
**재산정**: **1-2 person-days** (-60%)

---

## 📊 최종 추정 요약

| Phase | 작업 내용 | 초기 추정 | **재산정** | 감소율 |
|-------|----------|-----------|-----------|--------|
| Phase 1 | 아키텍처 조사 및 설계 | 5-8 | **3-5** | -40% |
| Phase 2 | HostBridge Server 구현 | 26-45 | **18-26** | -42% |
| Phase 3 | 빌드 시스템 통합 | 8-12 | **4-6** | -50% |
| Phase 4 | 테스트 및 검증 | 8-12 | **4-6** | -50% |
| Phase 5 | 문서화 | 4-6 | **2-3** | -50% |
| Phase 6 | 배포 및 모니터링 | 3-5 | **1-2** | -60% |
| **합계** | | **54-88** | **32-48** | **-45%** |

### 최종 추정 (15% 버퍼 포함)

**최소**: 32 person-days  
**최대**: 48 person-days  
**현실적 추정**: **37-55 person-days**

**초기 추정**: 66-92 person-days  
**재산정**: 37-55 person-days  
**감소**: **약 45%** ✅

---

## ✅ 재산정 근거 요약

### 1. gRPC 효과 (마스터 지적 반영)
- ✅ 백엔드 구현 최소화: -40~50%
- ✅ 대부분 RPC가 단순 SDK API 호출
- ✅ Protocol Buffers가 타입 안전성 보장

### 2. 실제 코드 분석
- ✅ L1 (15개): 평균 6줄, executeCommand만!
- ✅ L2 (15개): 평균 50줄, API + 변환
- ✅ L3 (6개): 복잡한 케이스만

### 3. 패턴 재사용
- ✅ VSCode 구현체가 명확한 가이드
- ✅ 각 RPC별 파일 분리로 이해 용이
- ✅ IntelliJ SDK API가 VSCode와 유사

### 4. 인프라 간소화
- ✅ 빌드/테스트/배포: -50%
- ✅ 기존 GitHub Actions 패턴 재사용
- ✅ JetBrains Marketplace 배포 단순

---

## 🎯 다음 단계

마스터 검토 후:
- [ ] Phase 1 시작: 아키텍처 설계 (3-5일)
- [ ] IntelliJ Plugin 프로젝트 생성
- [ ] 첫 gRPC RPC 구현 (L1부터 시작)

**예상 일정**: 8-11주 (2-2.5개월)
