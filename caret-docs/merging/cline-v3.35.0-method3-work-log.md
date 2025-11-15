# Cline v3.35.0 머징 작업 로그 (Method 3)

**작성일**: 2025-11-15
**브랜치**: `merge/cline-v3.34.0-method3`
**타겟 버전**: Cline v3.35.0 (3698d23)
**베이스**: Caret main (93583bb → 82d3828)
**전략**: Method 3 - Analysis-based Staged Merging (13-stage)

---

## 📊 현재 상황

### 버전 정보
- **Cline 현재**: v3.35.0 (3698d23 - 2025-11-04)
- **Cline 최신**: v3.37.1 (111개 커밋 차이)
- **Caret 현재**: 93583bb (2025-11-04)
- **Caret 최신**: 82d3828 (4개 커밋 차이)

### 진행 상황
- ✅ **Stage 1 완료**: Task System Foundation (e84462fa2)
- ✅ **Stage 2 완료**: Feature flags & proto (7e236e6d2, 00c8bfb4a)
- 🔄 **Stage 3 진행 중**: TerminalManager, Controller, Telemetry 병합
- ⏳ **Stage 4-13 대기 중**

### 에러 현황
- **시작**: 93개 에러
- **Stage 1 후**: 60개 에러 (33개 감소)
- **Stage 2 후**: 35개 에러 (25개 감소)
- **현재**: 31개 에러 (4개 감소)
- **목표**: 0개 에러

---

## 📝 Stage별 작업 로그

### Stage 0: Phase 0 분석 및 준비 ✅

**완료일**: 2025-11-15
**커밋**: f7374d002

#### 작업 내용
- Phase 0 분석 문서 작성
- 13-stage 병합 계획 수립
- 서브디렉토리 설정 (caret-main, cline-latest)
- both-modified.txt 생성 (78개 충돌 파일)

#### 결과물
- 문서: Phase 0 분석 완료

---

### Stage 1: Task System Foundation ✅

**완료일**: 2025-11-15
**커밋**: e84462fa2
**에러 변화**: 93 → 60 (33개 감소)

#### 작업 내용

**1. 3-way diff 분석**
```bash
caret-main: src/core/task/index.ts (2643 lines)
cline-latest: src/core/task/index.ts (3315 lines, +672 lines)
current: src/core/task/index.ts (병합 전)
```

**2. Cline v3.35.0 베이스 적용**
- Cline 파일 복사: `cp cline-latest/src/core/task/index.ts src/core/task/index.ts`
- 주요 변경사항:
  - Native tool calling 지원 추가
  - Hooks 시스템 통합
  - Auto-retry with exponential backoff
  - Background command execution
  - CLI/Subagent 통합

**3. Caret 수정사항 재적용** (12개)

| 위치 | 수정 내용 | 이유 |
|------|----------|------|
| Line 18 | `import { getCurrentBrandName }` | Caret 브랜딩 |
| Line 724 | `"Caret instance aborted"` | 브랜드 중립 메시지 |
| Line 1172 | `"Caret instance aborted"` | 브랜드 중립 메시지 |
| Line 1243 | `.caretrules` 로딩 추가 | Caret 룰 시스템 |
| Line 1255 | `.caretrules` 우선순위 | Cline 룰보다 우선 |
| Line 2086 | `"Caret instance aborted"` | 브랜드 중립 메시지 |
| Line 2277 | `"Caret instance aborted"` | 브랜드 중립 메시지 |
| Line 2373 | `"Caret instance aborted"` | 브랜드 중립 메시지 |
| Line 2882 | Brand-neutral cancellation | 브랜드 중립 |
| Line 3043 | `.caretrules` 로딩 | Caret 룰 시스템 |
| Line 3055 | `.caretrules` 우선순위 | 우선순위 높음 |
| Line 3106 | Current brand name usage | 동적 브랜딩 |

#### 검증
```bash
npx tsc --noEmit  # 60 errors
git add src/core/task/index.ts
git commit -m "feat: Stage 1 - Merge Cline v3.35.0 Task System Foundation"
```

---

### Stage 2: API & Tool System, Feature Flags ✅

**완료일**: 2025-11-15
**커밋**: 7e236e6d2 (feature flags), 00c8bfb4a (remaining fixes)
**에러 변화**: 60 → 35 (25개 감소)

#### Stage 2.1: 신규 파일 복사 (Cline-only)

| 파일 | 크기 | 설명 |
|------|------|------|
| `src/core/api/transform/tool-use-handler.ts` | 4402B | Native tool calling 핸들러 |
| `src/core/task/TaskLockUtils.ts` | 1416B | Multi-root 폴더 잠금 |
| `src/core/hooks/*` | 48 files | Hooks 시스템 |
| `src/core/locks/*` | 3 files | Lock 관리 |
| `src/standalone/lock-manager.ts` | 826B | Standalone lock manager |

#### Stage 2.2: 양쪽 수정 파일 병합 (3-way diff)

**ExtensionMessage.ts**
```typescript
// 추가된 항목
export const COMMAND_CANCEL_TOKEN = "__cline_command_cancel__"
export type ClineSay = ... | "error_retry" | "shell_integration_warning_with_suggestion"
```

**mcp.ts**
```typescript
export const CLINE_MCP_TOOL_IDENTIFIER = "0mcp0"
```

**task/utils.ts**
```typescript
export function extractProviderDomainFromUrl(url: string | undefined): string | undefined
```

**TaskState.ts**
```typescript
// 추가
toolUseIdMap: Map<string, string> = new Map()
autoRetryAttempts: number = 0

// 제거 (Auto-approval 재설계)
consecutiveAutoApprovedRequestsCount: number = 0
```

**state-keys.ts**
```typescript
export interface GlobalState {
  nativeToolCallEnabled: boolean // Cline v3.35.0
  lastDismissedCliBannerVersion: number // Cline v3.35.0
}
```

**SystemPromptContext**
```typescript
export interface SystemPromptContext {
  readonly enableNativeToolCalls?: boolean // Cline v3.35.0
}
```

**disk.ts**
```typescript
// Hooks 디렉토리 함수 추가
export async function ensureHooksDirectoryExists(): Promise<string>
export async function getGlobalHooksDir(): Promise<string | undefined>
export async function getAllHooksDirs(): Promise<string[]>
export async function getWorkspaceHooksDirs(): Promise<string[]>
```

**Tool Handlers** (10개 파일)
- 3-way diff로 검증: Caret에 `consecutiveAutoApprovedRequestsCount++` 존재
- Cline v3.35.0에서 제거됨 (auto-approval 재설계)
- 올바르게 제거 확인:
  - AccessMcpResourceHandler.ts
  - BrowserToolHandler.ts
  - ExecuteCommandToolHandler.ts
  - ListCodeDefinitionNamesToolHandler.ts
  - ListFilesToolHandler.ts
  - ReadFileToolHandler.ts
  - SearchFilesToolHandler.ts
  - UseMcpToolHandler.ts
  - WebFetchToolHandler.ts
  - WriteToFileToolHandler.ts

#### Stage 2.3: Feature Flags 병합 (3-way diff)

**feature-flags.ts** (Caret + Cline 통합)
```typescript
export enum FeatureFlag {
  // Caret 유지
  MULTI_ROOT_WORKSPACE = "multi_root_workspace", // CARET MODIFICATION

  // Cline v3.35.0 추가
  HOOKS = "hooks",
  NATIVE_TOOL_CALLS_NEXT_GEN_MODELS = "native_tool_calls_next_gen",
}

export const FeatureFlagDefaultValue: Partial<Record<FeatureFlag, boolean>> = {
  [FeatureFlag.WORKOS_AUTH]: true,
  [FeatureFlag.DO_NOTHING]: false,
  [FeatureFlag.HOOKS]: false,
  [FeatureFlag.NATIVE_TOOL_CALLS_NEXT_GEN_MODELS]: process.env.IS_DEV === "true",
}
```

**FeatureFlagsService.ts** (Caret + Cline 통합)
```typescript
// Cline의 유연한 캐시 타입 채택
private cache: Map<FeatureFlag, unknown> = new Map()

// Cline의 FeatureFlagDefaultValue 활용
private async getFeatureFlag(flagName: FeatureFlag): Promise<unknown> {
  const value = flagValue ?? FeatureFlagDefaultValue[flagName]
  return value
}

// Caret 메서드 유지
public getMultiRootEnabled(): boolean {
  return this.getBooleanFlagEnabled(FeatureFlag.MULTI_ROOT_WORKSPACE)
}

// Cline v3.35.0 메서드 추가
public getHooksEnabled(): boolean {
  return this.getBooleanFlagEnabled(FeatureFlag.HOOKS)
}

public getNativeToolCallEnabled(): boolean {
  return this.getBooleanFlagEnabled(FeatureFlag.NATIVE_TOOL_CALLS_NEXT_GEN_MODELS)
}
```

**사용 현황 검증**
```bash
$ grep -rn "getMultiRootEnabled" src/
src/core/workspace/multi-root-utils.ts:15
src/core/controller/index.ts:918
src/core/workspace/__tests__/setup.test.ts:103
src/core/workspace/__tests__/setup.test.ts:173
```
→ Caret에서 사용 중, 유지 필요

#### Stage 2.4: Proto 업데이트

**proto/cline/ui.proto**
```protobuf
enum ClineSay {
  // ... 기존 항목들
  ERROR_RETRY = 28; // Cline v3.35.0: Auto-retry
}
```

**proto/cline/hooks.proto** (신규 파일)
- Hooks 시스템 proto 정의 (1875 bytes)

**proto 재생성**
```bash
npm run protos
```

#### Stage 2.5: Proto Conversions

**cline-message.ts** (양방향 매핑 추가)
```typescript
const mapping: Record<AppClineSay, ClineSay> = {
  error_retry: ClineSay.ERROR_RETRY,
  shell_integration_warning_with_suggestion: ClineSay.SHELL_INTEGRATION_WARNING,
  // ... 기존 매핑들
}

const reverseMapping: Record<Exclude<ClineSay, ClineSay.UNRECOGNIZED>, AppClineSay> = {
  [ClineSay.ERROR_RETRY]: "error_retry",
  // ... 기존 매핑들
}
```

#### Stage 2.6: 나머지 수정사항

**updateAutoApprovalSettings.ts** (3-way 비교)
- Caret: convertProtoToAutoApprovalSettings 사용 + reset 로직
- Cline v3.35.0: 인라인 merge + reset 로직 제거
- 선택: Cline 버전 채택 (auto-approval 재설계)

**state-helpers.ts** (누락 필드 추가)
```typescript
const lastDismissedCliBannerVersion = context.globalState.get<...>("lastDismissedCliBannerVersion")
const nativeToolCallEnabled = context.globalState.get<...>("nativeToolCallEnabled")

return {
  // ...
  lastDismissedCliBannerVersion: lastDismissedCliBannerVersion ?? 0,
  nativeToolCallEnabled: nativeToolCallEnabled ?? false,
}
```

#### 검증
```bash
npx tsc --noEmit  # 35 errors
git add -A
git commit -m "feat: Stage 2 partial - Feature flags and proto-conversions merge"
git commit -m "fix: Stage 2 remaining fixes - state-helpers, lock-manager"
```

---

### Stage 3: TerminalManager, Controller, Telemetry 🔄

**시작일**: 2025-11-15
**에러 시작**: 35개
**에러 현재**: 31개

#### Stage 3.1: TerminalManager 병합 ✅

**에러 변화**: 35 → 31 (4개 감소)

**3-way 분석**
```
caret-main: 442 lines
cline-latest: 471 lines (+29 lines)
current: 442 lines
```

**Caret 수정사항**
```typescript
// Line 67: CARET MODIFICATION 주석
// VSCode type extensions moved to src/types/vscode-extensions.d.ts
```

**머징 결정**
- ✅ Cline v3.35.0 TerminalManager.ts 복사 (subagent 지원 포함)
- ✅ Caret의 타입 분리 전략 포기 (Cline 우선 원칙)
- ✅ vscode-extensions.d.ts에서 Terminal/Window 타입 제거 (충돌 방지)

**추가된 기능** (Cline v3.35.0)
```typescript
private subagentTerminalOutputLineLimit: number = 2000

setSubagentTerminalOutputLineLimit(limit: number): void {
  this.subagentTerminalOutputLineLimit = limit
}
```

**충돌 해결**
```typescript
// src/types/vscode-extensions.d.ts
// CARET MODIFICATION: Terminal Integration types removed to prevent conflict
// Terminal and Window interfaces are now defined in TerminalManager.ts (Cline v3.35.0)
```

**검증**
```bash
npx tsc --noEmit  # 31 errors
```

#### Stage 3.2: Controller TaskParams 수정 🔄

**현재 상태**: 진행 중

**에러**
```
src/core/controller/index.ts(328,24): error TS2345:
Type is missing the following properties from type 'TaskParams':
  - subagentTerminalOutputLineLimit
  - vscodeTerminalExecutionMode
  - taskLockAcquired
```

**TaskParams 인터페이스** (src/core/task/index.ts:105)
```typescript
type TaskParams = {
  controller: Controller
  mcpHub: McpHub
  updateTaskHistory: (historyItem: HistoryItem) => Promise<HistoryItem[]>
  postStateToWebview: () => Promise<void>
  reinitExistingTaskFromId: (taskId: string) => Promise<void>
  cancelTask: () => Promise<void>
  shellIntegrationTimeout: number
  terminalReuseEnabled: boolean
  terminalOutputLineLimit: number
  subagentTerminalOutputLineLimit: number  // Cline v3.35.0 - 누락
  defaultTerminalProfile: string
  vscodeTerminalExecutionMode: "vscodeTerminal" | "backgroundExec"  // 누락
  cwd: string
  stateManager: StateManager
  workspaceManager?: WorkspaceRootManager
  task?: string
  images?: string[]
  files?: string[]
  historyItem?: HistoryItem
  taskId: string
  taskLockAcquired: boolean  // Cline v3.35.0 - 누락
}
```

**다음 작업**
- [ ] controller/index.ts에서 Task 생성 시 누락 필드 추가
- [ ] vscodeTerminalExecutionMode 값 결정
- [ ] taskLockAcquired 값 결정

---

## 🎯 남은 작업 (Stage 4-13)

### Stage 4: Controller 메서드 추가
- [ ] updateBackgroundCommandState() 메서드
- [ ] shouldShowBackgroundTerminalSuggestion() 메서드

### Stage 5: TelemetryService 업데이트
- [ ] captureSubagentExecution() 메서드

### Stage 6: McpHub 업데이트
- [ ] getMcpServerByKey() 메서드

### Stage 7: ExtensionMessage 업데이트
- [ ] commandCompleted 필드 추가

### Stage 8: Native Tool Calling
- [ ] tool_calls 타입 처리
- [ ] tool-use-handler.ts 통합

### Stage 9-13: 나머지 파일들
- [ ] 기타 양쪽 수정 파일 병합
- [ ] 최종 검증
- [ ] 문서 업데이트

---

## 📊 통계

### 에러 감소 추이
```
Stage 0:  93 errors  (시작)
Stage 1:  60 errors  (-33, Task System)
Stage 2:  35 errors  (-25, Feature flags & proto)
Stage 3:  31 errors  (-4,  TerminalManager)
...
Target:   0 errors
```

### 커밋 이력
```
f7374d002  docs: Update Phase 0 analysis
e84462fa2  feat: Stage 1 - Merge Cline v3.35.0 Task System Foundation
bb2a59e30  feat: Stage 2 - API & Tool System Foundation (33 errors resolved)
7e236e6d2  feat: Stage 2 partial - Feature flags and proto-conversions merge
00c8bfb4a  fix: Stage 2 remaining fixes - state-helpers, lock-manager
```

### 파일 변경 통계
- **Stage 1**: 1개 파일 (src/core/task/index.ts)
- **Stage 2**: 30개 파일 (신규 복사 + 양쪽 수정 + proto)
- **Stage 3**: 2개 파일 (TerminalManager.ts, vscode-extensions.d.ts)

---

## 🔄 다음 세션 체크리스트

### 새 버전 확인
- [ ] Cline 새 버전 확인: `cd cline-latest && git fetch && git log HEAD..origin/main | wc -l`
- [ ] Caret 새 버전 확인: `cd caret-main && git fetch && git log HEAD..origin/main | wc -l`

### 현재 작업 확인
- [ ] 에러 수: `npx tsc --noEmit 2>&1 | grep "error TS" | wc -l`
- [ ] 브랜치: `git status`
- [ ] 최근 커밋: `git log --oneline -5`

### 재시작 프로토콜
- [ ] 현재 진행률 평가 (Stage X/13)
- [ ] 새 버전 변경사항 분석
- [ ] 계속 vs 재시작 결정
- [ ] 작업 로그 업데이트

---

**최종 업데이트**: 2025-11-15
**다음 작업**: Stage 3.2 - Controller TaskParams 수정


#### Stage 3.2: Controller TaskParams 수정 ✅

**에러 변화**: 31 → 29 (2개 감소)

**작업 내용**

1. **import 추가**
```typescript
import { tryAcquireTaskLockWithRetry } from "@core/task/TaskLockUtils"
```

2. **설정 값 가져오기** (controller/index.ts:290-298)
```typescript
const vscodeTerminalExecutionMode = this.stateManager.getGlobalStateKey("vscodeTerminalExecutionMode")
const subagentTerminalOutputLineLimit = this.stateManager.getGlobalSettingsKey("subagentTerminalOutputLineLimit")
```

3. **Task Lock 획득** (controller/index.ts:326-342)
```typescript
let taskLockAcquired = false
const lockResult = await tryAcquireTaskLockWithRetry(taskId)

if (!lockResult.acquired && !lockResult.skipped) {
  const errorMessage = lockResult.conflictingLock
    ? `Task locked by instance (${lockResult.conflictingLock.held_by})`
    : "Failed to acquire task lock"
  throw new Error(errorMessage)
}

taskLockAcquired = lockResult.acquired
```

4. **Task 생성 시 필드 추가** (controller/index.ts:349-371)
```typescript
this.task = new Task({
  // ... 기존 필드들
  subagentTerminalOutputLineLimit: subagentTerminalOutputLineLimit ?? 2000,
  vscodeTerminalExecutionMode,
  taskLockAcquired,
})
```

5. **state-keys.ts 업데이트**
```typescript
export interface GlobalState {
  vscodeTerminalExecutionMode: "vscodeTerminal" | "backgroundExec" // line 36
  hooksEnabled: boolean // line 44
  lastDismissedCliBannerVersion: number // line 47
}
```

**검증**
```bash
npx tsc --noEmit  # 29 errors (31 → 29, -2)
```

---



### Stage 4: Controller 메서드 추가 ✅

**완료일**: 2025-11-15
**에러 변화**: 29 → 25 (4개 감소)

#### 추가된 필드
```typescript
// src/core/controller/index.ts

private backgroundCommandRunning = false // line 77
private backgroundCommandTaskId?: string // line 78

private shellIntegrationWarningTracker: {
  timestamps: number[]
  lastSuggestionShown?: number
} = { timestamps: [] } // lines 81-84
```

#### 추가된 메서드

**1. updateBackgroundCommandState()** (line 392)
```typescript
updateBackgroundCommandState(running: boolean, taskId?: string) {
  const nextTaskId = running ? taskId : undefined
  if (this.backgroundCommandRunning === running && this.backgroundCommandTaskId === nextTaskId) {
    return
  }
  this.backgroundCommandRunning = running
  this.backgroundCommandTaskId = nextTaskId
  void this.postStateToWebview()
}
```

**2. cancelBackgroundCommand()** (line 402)
```typescript
async cancelBackgroundCommand(): Promise<void> {
  const didCancel = await this.task?.cancelBackgroundCommand()
  if (!didCancel) {
    this.updateBackgroundCommandState(false)
  }
}
```

**3. shouldShowBackgroundTerminalSuggestion()** (line 413)
```typescript
shouldShowBackgroundTerminalSuggestion(): boolean {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  
  // Clean old timestamps
  this.shellIntegrationWarningTracker.timestamps = 
    this.shellIntegrationWarningTracker.timestamps.filter((ts) => ts > oneHourAgo)
  
  // Add current warning
  this.shellIntegrationWarningTracker.timestamps.push(Date.now())
  
  // Show suggestion if 3+ warnings in last hour
  if (this.shellIntegrationWarningTracker.timestamps.length >= 3) {
    this.shellIntegrationWarningTracker.lastSuggestionShown = Date.now()
    return true
  }
  
  return false
}
```

**검증**
```bash
npx tsc --noEmit  # 25 errors (29 → 25, -4)
```

---

