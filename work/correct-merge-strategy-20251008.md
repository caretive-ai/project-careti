# 정확한 병합 전략 - 2025-10-08 (수정됨)

## ⚠️ **중요: Feature Config vs Feature Flags**

### Caret 고유 기능 (Level 1 - caret-src/)
- **FeatureConfig**: `caret-src/shared/FeatureConfig.ts`
- 빌드 시 기능 선택 시스템 (페르소나, 프로바이더 제어)
- ✅ **유지해야 함**

### Cline 원본 기능 (Level 0 - src/)
- **FeatureFlags**: `src/services/feature-flags/`
- PostHog 기반 런타임 feature flag
- ✅ **upstream 채택**

---

## 📊 충돌 파일 최종 분류 (총 23개)

### ✅ **Cline 원본 - upstream 채택 (16개)**

#### 1. Browser 관련 (3개)
- src/services/browser/BrowserSession.ts
- src/services/browser/UrlContentFetcher.ts
- src/services/browser/utils.ts

**이유**: 분석 문서에서 "브랜딩만 수정"으로 확인됨

#### 2. Feature Flags (3개) - **Cline 원본 기능!**
- src/services/feature-flags/FeatureFlagsProviderFactory.ts
- src/services/feature-flags/FeatureFlagsService.ts
- src/shared/services/feature-flags/feature-flags.ts

**이유**: Cline #5275, #6409 커밋에서 추가, PostHog 연동 기능

#### 3. Telemetry & Error (4개)
- src/services/error/ErrorProviderFactory.ts
- src/services/telemetry/TelemetryProviderFactory.ts
- src/services/telemetry/TelemetryService.test.ts
- src/services/posthog/PostHogClientProvider.ts

**이유**: Cline #5705 커밋에서 추가, PostHog 통합 기능

#### 4. 기타 서비스 (6개)
- src/shared/proto-conversions/models/api-configuration-conversion.ts
- src/shared/api.ts
- src/shared/mcp.ts
- src/standalone/vscode-context.ts
- src/dev/commands/tasks.ts
- src/integrations/checkpoints/index.ts

**이유**: Caret 고유 수정 없음 (타입 변경, 구조 변경만)

---

### ⚠️ **Caret 수정 유지 (7개)**

#### 1. 핵심 엔트리 (1개)
**src/extension.ts** - 19개 충돌
- Caret 브랜딩, CaretProvider 초기화
- **전략**: Cline 구조 + Caret 초기화 통합

#### 2. Tool Handlers (6개) - 각 3개 충돌
- ExecuteCommandToolHandler.ts
- ListCodeDefinitionNamesToolHandler.ts
- ListFilesToolHandler.ts
- ReadFileToolHandler.ts
- ReportBugHandler.ts
- WriteToFileToolHandler.ts

**패턴**: "Cline" → "Caret" 브랜딩 변경
**전략**: upstream + 브랜딩 문자열만 변경

---

## 🚀 실행 계획

### Phase 1: 대량 upstream 채택 (5분)
```bash
# Cline 원본 기능 16개 파일 일괄 채택
git checkout --theirs \
  src/services/browser/ \
  src/services/feature-flags/ \
  src/services/error/ \
  src/services/telemetry/ \
  src/services/posthog/ \
  src/shared/services/feature-flags/ \
  src/shared/proto-conversions/models/api-configuration-conversion.ts \
  src/shared/api.ts \
  src/shared/mcp.ts \
  src/standalone/vscode-context.ts \
  src/dev/commands/tasks.ts \
  src/integrations/checkpoints/

git add src/services/ src/shared/ src/standalone/ src/dev/ src/integrations/checkpoints/
```

### Phase 2: extension.ts 병합 (30분)
- Cline 구조 기반
- Caret 브랜딩/초기화 통합

### Phase 3: Tool Handlers 일괄 처리 (20분)
- 6개 파일 브랜딩 패턴 적용

### Phase 4: 검증
```bash
npm run compile
# 오류 0개 목표
```

**예상 총 소요**: ~1시간
