# Phase 2 병합 기록 - MCP & PostHog

## 완료 시각
2025-10-08

## 병합 파일 (2개)

### 1. src/shared/mcp.ts ✅
**충돌 내용**:
- HEAD: `"marketplace" | "addRemote" | "installed" | "brandMarketplace"`
- upstream: `"marketplace" | "addRemote" | "configure"`

**병합 전략**:
- Cline의 "configure" 탭 추가
- Caret의 "brandMarketplace" 유지
- "installed" → "configure"로 변경 (Cline 구조 개선)

**최종 결과**:
```typescript
// CARET MODIFICATION: Add brandMarketplace tab type for B2B branding
export type McpViewTab = "marketplace" | "addRemote" | "configure" | "brandMarketplace"
```

---

### 2. src/services/posthog/PostHogClientProvider.ts ✅
**충돌 내용**:
- HEAD: Caret의 복잡한 텔레메트리 설정 로직
  - vscode.workspace.getConfiguration("caret")
  - telemetrySettings.cline 플래그
  - TelemetryService, ErrorService, FeatureFlagsService 초기화
- upstream: Cline의 간소화된 구조
  - PostHog 클라이언트만 초기화
  - enableExceptionAutocapture 설정
  - eventFilter 추가

**병합 전략**:
- **upstream 구조 전면 채택**
- Caret의 복잡한 로직 제거 (서비스 초기화는 별도 위치에서)
- 간소화된 Cline 구조가 더 나은 설계

**최종 결과**:
```typescript
private constructor() {
    // Initialize PostHog client
    this.client = posthogConfig.apiKey
        ? new PostHog(posthogConfig.apiKey, {
                host: posthogConfig.host,
                enableExceptionAutocapture: false,
                before_send: (event) => PostHogClientProvider.eventFilter(event),
            })
        : null
}
```

---

## 결과

- **MCP**: Cline + Caret 병합 ✅
- **PostHog**: upstream 채택 ✅
- **남은 충돌**: 7개 (extension.ts + tool handlers 6개)
