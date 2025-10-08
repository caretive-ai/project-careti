# 수정된 병합 우선순위 - 2025-10-08

## 총 23개 충돌 파일 - 난이도별 분류

---

## 🔴 **최우선 (4개) - 핵심 아키텍처**

### 1. `src/extension.ts` - 19개 충돌 ⚠️
- **중요도**: 가장 높음 (엔트리 포인트)
- **예상 수정**: Caret 브랜딩, 명령어 등록
- **전략**: Cline 구조 + Caret 기능 통합

### 2. `src/integrations/checkpoints/index.ts` - 4개 충돌
- **예상**: Cline 체크포인트 시스템 변경
- **전략**: upstream 채택 예상

### 3. `src/shared/api.ts` - 2개 충돌
- **예상**: API 타입 정의 충돌
- **전략**: 양쪽 타입 병합

### 4. `src/shared/mcp.ts` - 1개 충돌
- **예상**: MCP 타입 정의
- **전략**: upstream 채택 예상

---

## 🟢 **쉬운 해결 (3개) - 브라우저 파일**
**분석 결과: 브랜딩만 수정, 모두 upstream 채택**

### 5-7. Browser 파일들 (각 1개 충돌)
- `src/services/browser/BrowserSession.ts`
- `src/services/browser/UrlContentFetcher.ts`
- `src/services/browser/utils.ts`

**전략**: 3개 모두 upstream 그대로 채택 (5분 내 해결)

---

## 🟡 **중간 난이도 (6개) - 툴 핸들러**
**패턴: 모두 브랜딩 수정 (Cline → Caret)**

### 8-13. Tool Handlers (각 3개 충돌)
- ExecuteCommandToolHandler.ts
- ListCodeDefinitionNamesToolHandler.ts
- ListFilesToolHandler.ts
- ReadFileToolHandler.ts
- ReportBugHandler.ts
- WriteToFileToolHandler.ts

**전략**: 일괄 처리 - 브랜딩 문자열만 Caret 유지

---

## 🟠 **Caret 신규 기능 (3개) - Feature Flags**
**위치는 src/이지만 Caret 고유 기능**

### 14-16. Feature Flags System
- `src/services/feature-flags/FeatureFlagsProviderFactory.ts` (3 conflicts)
- `src/services/feature-flags/FeatureFlagsService.ts` (2 conflicts)
- `src/shared/services/feature-flags/feature-flags.ts` (1 conflict)

**전략**: Caret HEAD 유지 + Cline 개선사항 선택적 통합

---

## 🟢 **낮은 우선순위 (7개) - 기타 서비스**

### 17-23. 나머지 서비스 파일들
- Error: ErrorProviderFactory.ts
- Telemetry: TelemetryProviderFactory.ts, TelemetryService.test.ts
- PostHog: PostHogClientProvider.ts
- Proto: api-configuration-conversion.ts
- Standalone: vscode-context.ts
- Dev: tasks.ts

**전략**: 대부분 upstream 채택 예상

---

## 🎯 **권장 작업 순서**

### Phase 1: 쉬운 승리 (Quick Wins)
1. **브라우저 3개** → upstream 채택 (5분)
2. **MCP, API** → upstream 채택 예상 (5분)

### Phase 2: 핵심 파일
3. **extension.ts** → 신중한 병합 (30분)
4. **checkpoints** → 검토 후 병합 (15분)

### Phase 3: 일괄 처리
5. **툴 핸들러 6개** → 브랜딩 패턴 적용 (20분)
6. **Feature flags 3개** → Caret 기능 유지 (15분)

### Phase 4: 정리
7. **나머지 7개** → upstream 채택 (15분)

**예상 총 소요 시간**: ~2시간
