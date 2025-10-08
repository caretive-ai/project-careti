# 최종 정확한 병합 전략 - 2025-10-08

## 📊 충돌 파일 분류 (총 23개)

---

## ✅ **Group A: upstream 그대로 채택 (14개) - Cline 원본/개선**

### 1. Browser (3개) - 주석 스타일만 변경
- src/services/browser/BrowserSession.ts
- src/services/browser/UrlContentFetcher.ts
- src/services/browser/utils.ts

### 2. Feature Flags (3개) - **Cline 신규 기능 (PostHog 기반)**
- src/services/feature-flags/FeatureFlagsProviderFactory.ts
- src/services/feature-flags/FeatureFlagsService.ts
- src/shared/services/feature-flags/feature-flags.ts

**중요**: Caret의 `FeatureConfig`와 다른 시스템!
- ❌ Caret: `caret-src/shared/FeatureConfig.ts` (빌드 시 기능 선택)
- ✅ Cline: `src/services/feature-flags/` (PostHog 런타임 flag)

### 3. Error/Telemetry (3개) - Cline 구조 개선
- src/services/error/ErrorProviderFactory.ts
  - `apiKey` → `errorTrackingApiKey` 분리
- src/services/telemetry/TelemetryProviderFactory.ts
  - PostHog 클라이언트 초기화 방식 개선
- src/services/telemetry/TelemetryService.test.ts

### 4. 기타 (5개) - Cline 구조 변경
- src/shared/api.ts - 타입 정의 변경
- src/shared/proto-conversions/models/api-configuration-conversion.ts
- src/standalone/vscode-context.ts
- src/dev/commands/tasks.ts
- src/integrations/checkpoints/index.ts

---

## ⚠️ **Group B: 브랜딩 적용 (8개) - Caret 수정 유지**

### 1. MCP (1개) - **Caret B2B 브랜딩 기능**
**src/shared/mcp.ts** - 1개 충돌
```typescript
// CARET: "brandMarketplace" 탭 추가 (B2B 기능)
export type McpViewTab = "marketplace" | "addRemote" | "installed" | "brandMarketplace"

// vs Cline: "configure"로 변경
export type McpViewTab = "marketplace" | "addRemote" | "configure"
```
**전략**: Caret의 "brandMarketplace" + Cline의 구조 병합

### 2. PostHog (1개) - Caret 설정 브랜딩
**src/services/posthog/PostHogClientProvider.ts**
```typescript
// 라인 35: "caret" 설정 조회
const config = vscode.workspace.getConfiguration("caret")
```
**전략**: upstream + `"caret"` 브랜딩 유지

### 3. Tool Handlers (6개) - "Cline" → "Caret" 메시지
- src/core/task/tools/handlers/ExecuteCommandToolHandler.ts
- src/core/task/tools/handlers/ListCodeDefinitionNamesToolHandler.ts
- src/core/task/tools/handlers/ListFilesToolHandler.ts
- src/core/task/tools/handlers/ReadFileToolHandler.ts
- src/core/task/tools/handlers/ReportBugHandler.ts
- src/core/task/tools/handlers/WriteToFileToolHandler.ts

**패턴**: 사용자 메시지에서 "Cline" → "Caret" 변경
**전략**: upstream + 브랜딩 패턴 스크립트 적용

---

## 🔴 **Group C: 수동 병합 (1개) - 핵심 엔트리**

### src/extension.ts - 19개 충돌
- Caret 브랜딩
- CaretProvider 초기화
- 명령어 등록

**전략**: Cline 구조 기반 + Caret 초기화 통합

---

## 🚀 실행 계획

### Phase 1: Group A upstream 채택 (5분)
```bash
git checkout --theirs \
  src/services/browser/ \
  src/services/feature-flags/ \
  src/services/error/ \
  src/services/telemetry/ \
  src/shared/services/feature-flags/ \
  src/shared/api.ts \
  src/shared/proto-conversions/models/api-configuration-conversion.ts \
  src/standalone/vscode-context.ts \
  src/dev/commands/tasks.ts \
  src/integrations/checkpoints/

git add src/services/ src/shared/ src/standalone/ src/dev/ src/integrations/checkpoints/
npm run compile  # 14개 충돌 해결 확인
```

### Phase 2: Group B 브랜딩 적용 (30분)
1. **MCP** - "brandMarketplace" 유지하며 병합
2. **PostHog** - "caret" 설정 유지
3. **Tool Handlers 6개** - 브랜딩 스크립트 적용

### Phase 3: Group C 수동 병합 (30분)
- **extension.ts** - 신중한 병합

### Phase 4: 검증
```bash
npm run compile  # 오류 0개 목표
```

**예상 총 소요**: ~1.5시간

---

## 📝 참고

**Feature Config vs Feature Flags**:
- ✅ Caret FeatureConfig: `caret-src/shared/FeatureConfig.ts` (빌드 시)
- ✅ Cline FeatureFlags: `src/services/feature-flags/` (PostHog 런타임)
- 둘은 **완전히 다른 시스템**이므로 혼동 주의!
