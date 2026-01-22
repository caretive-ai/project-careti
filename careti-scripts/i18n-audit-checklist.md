# i18n 점검 작업 체크리스트

**생성일**: 2026-01-18
**목적**: 미사용 키 정리 및 누락 번역 확인
**주의**: 삭제 전 반드시 수동 검증 필수 (이전에 동적 키 삭제로 문제 발생한 적 있음)

---

## 1. 현재 상태 요약

| 항목 | 수치 |
|------|------|
| 총 키 | 1,939개 |
| 사용 중 | 974개 (50.2%) |
| 미사용 | 965개 (49.8%) |
| 누락 번역 | 121개 |

---

## 2. 동적 키 참조 (삭제 금지)

### 2.1 확인 완료된 동적 참조

| 상태 | 파일 | 패턴 | 실제 사용되는 키 |
|------|------|------|-----------------|
| [x] | `Announcement.tsx` | `t(\`bullets.current.${i}\`)` | `bullets.current.1~5`, `.1-desc~5-desc` |
| [x] | `Announcement.tsx` | `t(\`bullets.previous.${i}\`)` | `bullets.previous.1~5`, `.1-desc~5-desc` |
| [x] | `QwenProvider.tsx` | `t(\`...apiLineOptions.${line}\`)` | `providers.qwen.apiLineOptions.china`, `.international` |
| [x] | `SlashCommandMenu.tsx` | `t(title, "chat")` | `slashCommandMenu.defaultCommands`, `.workflowCommands` |
| [x] | `FeatureSettingsSection.tsx` | `t(installWarningKey)` | `features.subagents.caretWarning`, `.clineWarning` |

### 2.2 추가 확인 완료

| 상태 | 파일 | 패턴 | 실제 사용되는 키 |
|------|------|------|-----------------|
| [x] | `FeatureSettingsSection.tsx` | 조건부 키 | `features.subagents.installed`, `.notInstalled` |

### 2.3 확인 결과: 추가 동적 패턴 없음
- `t(variable)` 패턴: SlashCommandMenu, FeatureSettingsSection만 (이미 확인됨)
- 조건부 키: FeatureSettingsSection만 (위에서 확인됨)

---

## 3. 네임스페이스별 분석

### 3.1 announcement (28개 키)

| 상태 | 키 | 사용 여부 | 조치 |
|------|-----|----------|------|
| [x] | `bullets.current.0`, `0-desc` | 미사용 (i=1부터 시작) | 삭제 가능 |
| [x] | `bullets.current.1~5`, `1-desc~5-desc` | 동적 사용 | 유지 |
| [x] | `bullets.previous.0`, `0-desc` | 미사용 (i=1부터 시작) | 삭제 가능 |
| [x] | `bullets.previous.1~5`, `1-desc~5-desc` | 동적 사용 | 유지 |
| [x] | `links.korean/japanese/chinese/english` | 미사용 | 삭제 가능 |
| [ ] | `header`, `previousHeader` | 확인 필요 | |

### 3.2 common - apiOptions (74개 키)

| 상태 | 키 그룹 | 사용 여부 | 조치 |
|------|---------|----------|------|
| [x] | `common.apiOptions.*` 전체 | 미사용 (settings에 중복) | 삭제 가능 |

**상세**:
- `settings.json`에 `apiOptions` 4개 존재
- 코드에서 `t("apiOptions.*", "settings")` 사용
- common.json의 74개는 레거시

### 3.3 common - account (45개 키) ✅ 확인 완료

| 상태 | 키 | 사용 여부 | 조치 |
|------|-----|----------|------|
| [x] | 29개 (addCredits, dashboard, title 등) | 사용 중 | 유지 |
| [x] | `subscription`, `subscriptionFree`, `subscriptionBasic` | **미사용** | 삭제 가능 |
| [x] | `payAsYouGo`, `payAsYouGoDescription` | **미사용** | 삭제 가능 |
| [x] | `viewBillingUsage`, `organization` | **미사용** | 삭제 가능 |
| [x] | `usageSummary`, `timeframe`, `totalTokens` | 백업 파일만 사용 (*.tsx_) | 삭제 가능 |
| [x] | `dailyUsage`, `monthlyUsage` | 백업 파일만 사용 (*.tsx_) | 삭제 가능 |
| [x] | `promptTokens`, `completionTokens` | **미사용** | 삭제 가능 |
| [x] | `userHistory`, `paymentHistory` | **미사용** | 삭제 가능 |

**검증 완료 (2026-01-18)**: grep으로 `t("account.*"` 패턴 전체 검색 완료
- 실제 사용: title, dashboard, logOut, addCredits, currentBalance 등 29개
- 미사용 확정: subscription, payAsYouGo, tokens 관련 16개

### 3.4 chat (확인 완료)

| 상태 | 키 그룹 | 사용 여부 | 조치 |
|------|---------|----------|------|
| [x] | `brandMarketplace.*` | 미사용 | 삭제 가능 |
| [x] | `checkmarkControl.*` | 미사용 (컴포넌트에서 t() 미사용) | 삭제 가능 |
| [x] | `creditLimitError.*` | 미사용 | 삭제 가능 |
| [x] | `mcpMarketplaceCard.*` | 미사용 (mcp.* 사용) | 삭제 가능 |
| [x] | `telemetryBanner.*` | 미사용 (common.telemetry.* 사용) | 삭제 가능 |
| [x] | `tool.commandApprovalRequired` 등 | 미사용 (tool. 없이 사용) | 삭제 가능 |
| [x] | `slashCommandMenu.*` | 동적 사용 | **유지** |
| [x] | `tool.editFile`, `tool.readFile` 등 | 사용 중 | **유지** |

### 3.5 settings (확인 완료)

| 상태 | 키 그룹 | 사용 여부 | 조치 |
|------|---------|----------|------|
| [x] | `basetenModelPicker.*` | 미사용 (`providers.baseten.*` 사용) | 삭제 가능 |
| [x] | `vertex.*` | 미사용 (`providers.vertex.*` 사용) | 삭제 가능 |
| [x] | `requestyModelPicker.*` | 미사용 (`providers.requesty.*` 사용) | 삭제 가능 |
| [x] | `providers.cline.sortUnderlyingProviderRouting` 등 | 미사용 (`clineProvider.*` 사용) | 삭제 가능 |
| [x] | `providers.baseten.*` | 사용 중 | **유지** |
| [x] | `providers.vertex.*` | 사용 중 | **유지** |
| [x] | `providers.requesty.*` | 사용 중 | **유지** |
| [x] | `providers.qwen.apiLineOptions.*` | 동적 사용 | **유지** |
| [x] | `clineProvider.*` | 사용 중 | **유지** |

**참고**: 누락 리포트의 키들과 실제 사용 키들의 경로가 다름
- 누락: `basetenModelPicker.*` → 실제: `providers.baseten.*`
- 누락: `vertex.*` → 실제: `providers.vertex.*`
- 누락: `providers.cline.*` → 실제: `clineProvider.*`

---

## 4. 누락 번역 (121개) - 재분석

### 4.1 실제 번역 필요 (사용 중인 키) - ✅ 완료

| 상태 | 언어 | 키 | 조치 |
|------|------|-----|------|
| [x] | ja, zh | `features.enableYoloMode` | ✅ 번역 추가 완료 |
| [x] | ja, zh | `features.enableYoloModeDescription` | ✅ 번역 추가 완료 |
| [ ] | ko, ja, zh | `providers.openrouter.modelPicker.switchTo200K` | 확인 필요 (미사용 가능성) |
| [x] | ko, ja, zh | `rulesModal.tooltip.manageRulesWorkflows` | ✅ 번역 추가 완료 |
| [x] | ko, ja, zh | `rulesModal.ariaLabel.CaretRulesButton` | ✅ 번역 추가 완료 |

**추가된 번역 (2026-01-18):**
- ja/settings.json: `enableYoloMode`, `enableYoloModeDescription`
- zh/settings.json: `enableYoloMode`, `enableYoloModeDescription`
- ko/common.json: `rulesModal.*` (2개)
- ja/common.json: `rulesModal.*` (2개)
- zh/common.json: `rulesModal.*` (2개)

### 4.2 번역 불필요 (미사용 키 - en에서도 삭제 대상)

| 키 그룹 | 개수 | 이유 |
|---------|------|------|
| `basetenModelPicker.*` | 6개 | `providers.baseten.*` 사용 |
| `vertex.*` | 6개 | `providers.vertex.*` 사용 |
| `requestyModelPicker.*` | 4개 | `providers.requesty.*` 사용 |
| `providers.cline.*` (일부) | 8개 | `clineProvider.*` 사용 |
| `account.*` (일부) | 10개 | 미사용 (이전 버전 잔재) |

### 4.3 결론

**실제 번역 필요: ~5개** (121개 중 대부분은 미사용 키)

---

## 5. 작업 순서

### Phase 1: 추가 동적 키 확인 ✅ 완료
- [x] 변수 기반 t() 호출 전체 검색
- [x] 조건부 키 패턴 검색
- [x] 결과를 이 문서에 추가

### Phase 2: 네임스페이스별 상세 확인 ✅ 완료
- [x] chat 네임스페이스 확인
- [x] settings 네임스페이스 확인
- [x] 각 프로바이더 컴포넌트 확인

### Phase 3: 삭제 대상 확정 ✅ 완료
- [x] 확실한 미사용 키 목록 최종 검토
- [x] account.* 키 검증 (subscription, payAsYouGo 등 → 미사용 확정, 삭제 대상)
- [x] 최종 삭제 목록 확정 (~166개)

### Phase 4: 실행 (대기 중)
- [ ] 미사용 키 삭제
- [ ] 누락 번역 추가 (사용 중인 키만)
- [ ] 테스트 및 빌드 확인

---

## 6. 최종 분석 요약

### 삭제 가능한 미사용 키 (확정)

| 네임스페이스 | 키 그룹 | 개수 | 확신도 |
|-------------|---------|------|--------|
| common | `apiOptions.*` | 74개 | 높음 (settings에 중복) |
| announcement | `bullets.*.0`, `links.*` | 8개 | 높음 |
| chat | `brandMarketplace.*` | ~10개 | 높음 |
| chat | `checkmarkControl.*` | ~10개 | 높음 |
| chat | `creditLimitError.*` | ~5개 | 높음 |
| chat | `mcpMarketplaceCard.*` | ~10개 | 높음 |
| chat | `telemetryBanner.*` | ~10개 | 높음 |
| settings | `basetenModelPicker.*` | 6개 | 높음 |
| settings | `vertex.*` (루트) | 6개 | 높음 |
| settings | `requestyModelPicker.*` | 4개 | 높음 |
| settings | `providers.cline.*` (일부) | 8개 | 높음 |
| **합계** | | **~150개** | |

### 추가 삭제 대상 (account 키) - ✅ 검증 완료

| 키 그룹 | 개수 | 이유 |
|---------|------|------|
| `account.subscription*` | 3개 | **미사용** (grep 검증 완료) |
| `account.payAsYouGo*` | 2개 | **미사용** (grep 검증 완료) |
| `account.*Usage*`, `*Tokens` | 8개 | **미사용** (백업파일 *.tsx_에서만 참조) |
| `account.userHistory`, `paymentHistory` 등 | 3개 | **미사용** (grep 검증 완료) |
| **소계** | **~16개** | |

### 유지해야 할 동적 키

| 파일 | 키 패턴 |
|------|---------|
| Announcement.tsx | `bullets.current.1~5`, `bullets.previous.1~5` |
| QwenProvider.tsx | `providers.qwen.apiLineOptions.*` |
| SlashCommandMenu.tsx | `slashCommandMenu.*` |
| FeatureSettingsSection.tsx | `features.subagents.*` |

### 실제 번역 필요

| 키 | 언어 |
|----|------|
| `features.enableYoloMode` | ja, zh |
| `features.enableYoloModeDescription` | ja, zh |
| `rulesModal.tooltip.manageRulesWorkflows` | ja, zh |
| `rulesModal.ariaLabel.CaretRulesButton` | ja, zh |

---

## 6. 사용 스크립트

```bash
# 미사용 키 분석
node careti-scripts/tools/report-i18n-unused-key.js

# 누락 키 분석
node careti-scripts/tools/report-i18n-missing-keys.js

# 미사용 키 제거 (주의!)
node careti-scripts/tools/remove-i18n-unused-keys.js
```

---

## 7. 주의사항

1. **동적 키 삭제 금지**: 이전에 동적 참조 키 삭제로 문제 발생
2. **백업 필수**: 삭제 전 locale 파일 백업
3. **테스트 필수**: 삭제 후 모든 언어에서 UI 확인
4. ~~**구현된 기능 유지**~~ → subscription, payment 키는 미사용 확정 (삭제 대상)

---

*마지막 업데이트: 2026-01-18*
*분석 완료: Phase 1, 2, 3 / 번역 누락 수정 완료 / 실행 대기: Phase 4*
