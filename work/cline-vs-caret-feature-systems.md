# Cline FeatureFlags vs Caret FeatureConfig 비교

## 🎯 핵심 요약

**두 시스템은 완전히 다른 목적과 구조를 가진 별개의 시스템입니다!**

---

## 📊 비교표

| 항목 | Cline FeatureFlags | Caret FeatureConfig |
|-----|-------------------|---------------------|
| **위치** | `src/services/feature-flags/` | `caret-src/shared/` |
| **파일명** | FeatureFlagsService.ts | FeatureConfig.ts |
| **제어 시점** | 🔴 **런타임 (동적)** | 🟢 **빌드타임 (정적)** |
| **데이터 소스** | PostHog 서버 (원격) | JSON 파일 (로컬) |
| **변경 방법** | PostHog 대시보드에서 변경 | JSON 수정 + 재빌드 |
| **업데이트** | 앱 재시작 없이 즉시 반영 | 재빌드 필요 |
| **주 용도** | A/B 테스트, 점진적 롤아웃 | 배포 환경별 커스터마이징 |
| **의존성** | PostHog SDK | 없음 (순수 JSON) |
| **Caret 병합** | ✅ upstream 채택 (Cline 기능) | ✅ 유지 (Caret 고유 기능) |

---

## 🔴 **Cline FeatureFlags** (PostHog 기반 동적 제어)

### 목적
- **A/B 테스트**: 사용자 그룹별로 다른 기능 제공
- **점진적 롤아웃**: 신규 기능을 일부 사용자에게만 먼저 공개
- **긴급 중단**: 문제 발생 시 서버에서 기능 즉시 비활성화

### 구조
```typescript
// src/shared/services/feature-flags/feature-flags.ts
export enum FeatureFlag {
    MULTI_ROOT_WORKSPACE = "multi-root-workspace",
    FOCUS_CHAIN = "focus-chain",
    CLINE_AUTH_PROVIDER = "cline-auth-provider"
}

// src/services/feature-flags/FeatureFlagsService.ts
class FeatureFlagsService {
    async isFeatureFlagEnabled(flag: FeatureFlag): Promise<boolean> {
        // PostHog 서버에서 실시간으로 값 조회
        return await this.provider.getFeatureFlag(flag)
    }
}
```

### 사용 예시
```typescript
// 런타임에 PostHog 서버 조회
const isMultiRootEnabled = await featureFlagsService.isFeatureFlagEnabled(
    FeatureFlag.MULTI_ROOT_WORKSPACE
)

if (isMultiRootEnabled) {
    // 멀티 루트 워크스페이스 기능 활성화
}
```

### 제어 방법
1. PostHog 대시보드 접속
2. Feature Flag 값 변경 (On/Off, % 롤아웃 등)
3. 사용자 앱 재시작 시 자동 반영 (또는 폴링으로 즉시 반영)

---

## 🟢 **Caret FeatureConfig** (JSON 기반 정적 제어)

### 목적
- **배포 환경별 커스터마이징**: 일반/엔터프라이즈 버전 구분
- **화이트 레이블링**: 고객사별 브랜딩 및 기능 선택
- **간소화 모드**: 특정 기능만 노출하는 간단한 버전

### 구조
```typescript
// caret-src/shared/FeatureConfig.ts
export interface FeatureConfig {
    showPersonaSettings: boolean
    defaultPersonaEnabled: boolean
    redirectAfterApiSetup: "persona" | "home"
    defaultModeSystem: "caret" | "cline"
    firstListingProvider: string
    defaultProvider: string
    showOnlyDefaultProvider: boolean
    showCostInformation: boolean
}

// caret-src/shared/feature-config.json (정적 import)
import featureConfigData from "./feature-config.json"

export function getCurrentFeatureConfig(): FeatureConfig {
    return { ...defaultFeatures, ...featureConfigData }
}
```

### 사용 예시
```typescript
// 빌드 시 JSON 파일에서 로드 (한 번만)
const config = getCurrentFeatureConfig()

// 페르소나 설정 표시 여부
{config.showPersonaSettings && (
    <PersonaSettings />
)}

// 프로바이더 목록 필터링
if (config.showOnlyDefaultProvider) {
    return [defaultProviderOption]
}
```

### 제어 방법
1. `caret-src/shared/feature-config.json` 수정
   ```json
   {
       "showPersonaSettings": false,
       "defaultProvider": "litellm",
       "showOnlyDefaultProvider": true
   }
   ```
2. `npm run compile` 실행 (재빌드)
3. 패키징 및 배포

---

## 🎯 **실제 사용 시나리오**

### Cline FeatureFlags 시나리오
```
상황: 신규 "멀티 루트 워크스페이스" 기능 출시

1주차: 10% 사용자에게만 공개 (PostHog에서 10% 설정)
2주차: 버그 없으면 50%로 확대
3주차: 심각한 버그 발견 → 즉시 0%로 변경 (앱 재시작 불필요)
4주차: 수정 후 100% 공개
```

### Caret FeatureConfig 시나리오
```
상황: 엔터프라이즈 고객사 A에게 간소화 버전 제공

일반 버전 빌드:
- feature-config.json: 모든 기능 활성화
- 페르소나, 비용 정보, 모든 프로바이더 표시

고객사 A 빌드:
- feature-config.json: LiteLLM만 표시
- {
    "showPersonaSettings": false,
    "defaultProvider": "litellm",
    "showOnlyDefaultProvider": true,
    "showCostInformation": false
  }
- 별도 VSIX 파일로 패키징
```

---

## 🔧 **병합 전략 결정**

### Cline FeatureFlags → **upstream 채택**
- Cline 원본 기능
- PostHog 인프라 필요
- Caret이 별도로 PostHog 사용 안 함
- **결론**: `src/services/feature-flags/` 전체를 upstream으로 대체

### Caret FeatureConfig → **유지**
- Caret 고유 기능
- B2B 커스터마이징에 필수
- Cline과 충돌 없음 (위치 분리됨)
- **결론**: `caret-src/shared/FeatureConfig.ts` 그대로 유지

---

## 📝 **혼동 방지 체크리스트**

- [ ] `src/services/feature-flags/` → Cline 것 (upstream 채택)
- [ ] `caret-src/shared/FeatureConfig.ts` → Caret 것 (유지)
- [ ] 이름 비슷하지만 **완전히 다른 시스템**
- [ ] 둘 다 필요한 경우 **공존 가능** (서로 다른 디렉토리)

---

**작성일**: 2025-10-08
**작성자**: Luke Yang + Claude Code
