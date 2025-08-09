# 006-3 Caret WebView UI API Configuration Migration Plan

## 📋 작업 개요

**목표**: caret-webview-ui의 297개 TypeScript 에러를 해결하여 Cline v3.20.8 API 구조와 호환되도록 마이그레이션

**핵심 문제**: Cline의 ApiConfiguration이 Mode별 필드 분리 구조로 대변혁
- `apiProvider` → `planModeApiProvider` / `actModeApiProvider`
- `openAiModelId` → `planModeOpenAiModelId` / `actModeOpenAiModelId`
- 20+ 필드가 모두 Mode별로 분리됨

**전략**: 작은 수정으로 큰 효과를 내는 순차적 접근

## 🎯 에러 분류 및 우선순위

### 📊 에러 통계 (297개)
1. **Mode별 API 필드 접근** (~180개): `apiConfiguration.apiProvider` 등
2. **Missing 타입/함수** (~50개): `Mode`, `getModeSpecificFields`, `useApiConfigurationHandlers`
3. **Validation 함수** (~30개): `validateApiConfiguration` 시그니처 변경
4. **Proto imports** (~20개): `@shared/proto/common` 등
5. **기타 호환성** (~17개): `ExtensionMessage`, `useEvent` 등

### ⚡ 효율성 분석
- **Phase 1** (핵심 타입): 90% 에러 해결 예상
- **Phase 2** (API 매핑): 180개 에러 → 10개 이하로 감소 예상
- **Phase 3-5**: 개별 컴포넌트 정리

## 📝 Phase별 작업 계획

### **Phase 1: 핵심 타입/모듈 호환성** 🔧
**목표**: 297개 → 50개 이하로 에러 감소

#### 1.1 Mode 타입 추가
```typescript
// src/utils/validate.ts 상단에 추가
import { Mode } from "@shared/storage/types"
```

#### 1.2 getModeSpecificFields 함수 구현
```typescript
// src/utils/getModeSpecificFields.ts 신규 생성
export function getModeSpecificFields(
  apiConfiguration: ApiConfiguration,
  currentMode: Mode
) {
  const modePrefix = currentMode === 'plan' ? 'planMode' : 'actMode'
  return {
    apiProvider: apiConfiguration[`${modePrefix}ApiProvider`],
    openRouterModelId: apiConfiguration[`${modePrefix}OpenRouterModelId`],
    // ... 필요한 필드들
  }
}
```

#### 1.3 useApiConfigurationHandlers 구현
```typescript
// src/components/settings/utils/useApiConfigurationHandlers.ts 수정
// Cline main 브랜치 버전과 호환되도록 수정
```

#### 1.4 validateApiConfiguration 시그니처 맞추기
```typescript
// src/utils/validate.ts
export function validateApiConfiguration(
  apiConfiguration: ApiConfiguration,
  // currentMode 파라미터 제거 또는 수정
) {
  // 새로운 시그니처에 맞게 구현
}
```

### **Phase 2: API 필드 매핑 시스템** 🗂️
**목표**: 180개 API 필드 에러 → 10개 이하로 감소

#### 2.1 API 필드 매핑 테이블 생성
```typescript
// src/utils/apiFieldMapping.ts 신규 생성
export const API_FIELD_MAPPING = {
  apiProvider: { plan: 'planModeApiProvider', act: 'actModeApiProvider' },
  openAiModelId: { plan: 'planModeOpenAiModelId', act: 'actModeOpenAiModelId' },
  openAiModelInfo: { plan: 'planModeOpenAiModelInfo', act: 'actModeOpenAiModelInfo' },
  fireworksModelId: { plan: 'planModeFireworksModelId', act: 'actModeFireworksModelId' },
  togetherModelId: { plan: 'planModeTogetherModelId', act: 'actModeTogetherModelId' },
  vsCodeLmModelSelector: { plan: 'planModeVsCodeLmModelSelector', act: 'actModeVsCodeLmModelSelector' },
  ollamaModelId: { plan: 'planModeOllamaModelId', act: 'actModeOllamaModelId' },
  lmStudioModelId: { plan: 'planModeLmStudioModelId', act: 'actModeLmStudioModelId' },
  liteLlmModelId: { plan: 'planModeLiteLlmModelId', act: 'actModeLiteLlmModelId' },
  liteLlmModelInfo: { plan: 'planModeLiteLlmModelInfo', act: 'actModeLiteLlmModelInfo' },
  requestyModelId: { plan: 'planModeRequestyModelId', act: 'actModeRequestyModelId' },
  requestyModelInfo: { plan: 'planModeRequestyModelInfo', act: 'actModeRequestyModelInfo' },
  openRouterModelInfo: { plan: 'planModeOpenRouterModelInfo', act: 'actModeOpenRouterModelInfo' },
  awsBedrockCustomSelected: { plan: 'planModeAwsBedrockCustomSelected', act: 'actModeAwsBedrockCustomSelected' },
  awsBedrockCustomModelBaseId: { plan: 'planModeAwsBedrockCustomModelBaseId', act: 'actModeAwsBedrockCustomModelBaseId' },
}

export function getModeSpecificField(
  apiConfiguration: ApiConfiguration,
  fieldName: string,
  mode: Mode
): any {
  const mapping = API_FIELD_MAPPING[fieldName]
  if (!mapping) return apiConfiguration[fieldName] // fallback
  
  const modeKey = mode === 'plan' ? 'plan' : 'act'
  const modeSpecificField = mapping[modeKey]
  return apiConfiguration[modeSpecificField]
}
```

#### 2.2 ApiOptions.tsx 필드 접근 일괄 수정
```typescript
// 기존: apiConfiguration?.openAiModelId
// 변경: getModeSpecificField(apiConfiguration, 'openAiModelId', currentMode)
```

### **Phase 3: Handler 함수 통합** 🔄
**목표**: handleInputChange 에러 해결

#### 3.1 handleModeFieldChange 구현
```typescript
// useApiConfigurationHandlers.ts에서 
// handleModeFieldChange 로직 구현
const handleModeFieldChange = (fieldName: string) => (event: any) => {
  const value = event.target.value
  const mapping = API_FIELD_MAPPING[fieldName]
  if (mapping) {
    const modeKey = currentMode === 'plan' ? 'plan' : 'act'
    const actualFieldName = mapping[modeKey]
    setApiConfiguration({ ...apiConfiguration, [actualFieldName]: value })
  }
}
```

### **Phase 4: Validation 시스템 업데이트** ✅
**목표**: validate.ts 모든 함수 호환성 확보

#### 4.1 validateModelId 함수 수정
```typescript
export function validateModelId(
  apiConfiguration: ApiConfiguration,
  openRouterModels: Record<string, ModelInfo>,
  // currentMode 파라미터 제거
): ValidationResult {
  // 새로운 로직으로 구현
}
```

### **Phase 5: 컴포넌트별 세부 수정** 🎨
**목표**: 나머지 개별 컴포넌트 에러 해결

#### 5.1 SettingsView.tsx 수정
- `renderSectionHeader` prop 제거
- Missing 함수들 구현

#### 5.2 ExtensionStateContext.tsx 수정  
- `ExtensionMessage`, `useEvent` 타입 해결
- Missing setter 함수들 구현

#### 5.3 Proto imports 수정
```typescript
// @shared/proto/common → @shared/proto/cline/common
// 전역 일괄 변경
```

### **Phase 6: 최종 검증** 🎯
**목표**: 0 에러 달성 및 기능 검증

#### 6.1 빌드 테스트
```bash
npm run build  # 0 errors 확인
npm run compile:fast  # 백엔드 호환성 확인
```

#### 6.2 Caret 고유 기능 보존 확인
- i18n 시스템 (30개 JSON 파일)
- 24개 Caret 컴포넌트
- WebviewLogger 시스템
- Persona 관리

## 🚀 예상 효과

### 📈 에러 감소 추이
- **시작**: 297개 에러
- **Phase 1 완료**: ~50개 에러 (83% 감소)
- **Phase 2 완료**: ~10개 에러 (96% 감소)  
- **Phase 3-5 완료**: 0개 에러 (100% 해결)

### ⏱️ 예상 소요 시간
- **Phase 1**: 1-2시간 (핵심 타입/함수)
- **Phase 2**: 2-3시간 (API 매핑 시스템)
- **Phase 3-5**: 2-3시간 (컴포넌트별 수정)
- **총 예상**: 5-8시간 (1일 작업)

## 💡 핵심 성공 요소

1. **📋 체계적 접근**: Phase별 순차 진행으로 복잡성 관리
2. **🔧 재사용 가능한 유틸**: API 매핑 시스템으로 반복 작업 최소화  
3. **✅ 점진적 검증**: 각 Phase마다 빌드 테스트로 진행상황 확인
4. **🛡️ 기능 보존**: Caret 고유의 방대한 i18n 시스템 완전 보존

## 📚 관련 문서

- **머징 가이드**: `caret-docs/guides/upstream-merging.mdx`
- **아키텍처 가이드**: `caret-docs/development/caret-architecture-and-implementation-guide.mdx`
- **이전 머징 경험**: `caret-docs/tasks/006-upstream-merge-conflict-resolution-plan.md`

---

**마스터~ 체계적인 계획으로 차근차근 해결해보겠습니다!** ✨
