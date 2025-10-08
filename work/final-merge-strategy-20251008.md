# 최종 병합 전략 - 2025-10-08

## 📊 충돌 파일 분류 (총 23개)

### ✅ **Cline 원본 기능 - upstream 채택 (16개)**

이 파일들은 **Caret 고유 기능이 아니므로** upstream (Cline) 버전 그대로 채택:

#### Browser (3개) - 브랜딩만 수정, upstream 채택
- src/services/browser/BrowserSession.ts
- src/services/browser/UrlContentFetcher.ts
- src/services/browser/utils.ts

#### Feature Flags (3개) - Cline 신규 기능, upstream 채택
- src/services/feature-flags/FeatureFlagsProviderFactory.ts
- src/services/feature-flags/FeatureFlagsService.ts
- src/shared/services/feature-flags/feature-flags.ts

#### Telemetry & Error (4개) - Cline 신규 기능, upstream 채택
- src/services/error/ErrorProviderFactory.ts
- src/services/telemetry/TelemetryProviderFactory.ts
- src/services/telemetry/TelemetryService.test.ts
- src/services/posthog/PostHogClientProvider.ts

#### 기타 (6개) - upstream 채택
- src/shared/proto-conversions/models/api-configuration-conversion.ts
- src/shared/api.ts (일부 타입만 확인)
- src/shared/mcp.ts (일부 타입만 확인)
- src/standalone/vscode-context.ts
- src/dev/commands/tasks.ts
- src/integrations/checkpoints/index.ts (확인 필요)

---

### ⚠️ **Caret 수정 유지 필요 (7개)**

#### 최우선 - 핵심 엔트리 포인트 (1개)
**1. src/extension.ts** - 19개 충돌
- Caret 브랜딩, 명령어 등록, CaretProvider 초기화
- **전략**: Cline 구조 + Caret 브랜딩/초기화 로직 통합

#### 툴 핸들러 - 브랜딩 수정 (6개, 각 3개 충돌)
- src/core/task/tools/handlers/ExecuteCommandToolHandler.ts
- src/core/task/tools/handlers/ListCodeDefinitionNamesToolHandler.ts
- src/core/task/tools/handlers/ListFilesToolHandler.ts
- src/core/task/tools/handlers/ReadFileToolHandler.ts
- src/core/task/tools/handlers/ReportBugHandler.ts
- src/core/task/tools/handlers/WriteToFileToolHandler.ts

**패턴**: 모두 "Cline" → "Caret" 브랜딩 변경
**전략**: upstream + 브랜딩 문자열만 Caret으로 변경

---

## 🚀 **실행 계획**

### Phase 1: 대량 upstream 채택 (10분)
```bash
# 16개 파일을 upstream 버전으로 일괄 채택
git checkout --theirs src/services/browser/
git checkout --theirs src/services/feature-flags/
git checkout --theirs src/services/error/
git checkout --theirs src/services/telemetry/
git checkout --theirs src/services/posthog/
git checkout --theirs src/shared/services/feature-flags/
git checkout --theirs src/shared/proto-conversions/models/api-configuration-conversion.ts
git checkout --theirs src/standalone/vscode-context.ts
git checkout --theirs src/dev/commands/tasks.ts

# 검증
npm run compile
```

### Phase 2: 핵심 파일 병합 (30분)
1. **extension.ts** - 신중한 수동 병합
2. **checkpoints, api, mcp** - 검토 후 결정

### Phase 3: 툴 핸들러 일괄 처리 (20분)
- 6개 파일 브랜딩 패턴 스크립트 적용

### Phase 4: 컴파일 검증
- 전체 컴파일 성공 확인
- 오류 제로 달성

**예상 총 소요**: ~1시간
