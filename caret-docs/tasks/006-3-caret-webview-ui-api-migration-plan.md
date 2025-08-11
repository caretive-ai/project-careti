# 006-3 Caret WebView UI API Configuration Migration Plan

## 📋 작업 개요

**목표**: webview-ui(Caret 메인)의 ~~297개~~ → **250개** TypeScript 에러를 해결하여 Cline v3.20.8 API 구조와 호환되도록 마이그레이션
**진행률**: **47개 해결 완료** (19% 진행)

**디렉토리 구조 변경 완료** ✅:
- `caret-webview-ui` → `webview-ui` (Caret 메인)
- `webview-ui` → `cline-webview-ui` (Cline 원본)
- **머징 후 `cline-webview-ui` 삭제 예정**

**핵심 문제**: Cline의 ApiConfiguration이 Mode별 필드 분리 구조로 대변혁
- `apiProvider` → `planModeApiProvider` / `actModeApiProvider`
- `openAiModelId` → `planModeOpenAiModelId` / `actModeOpenAiModelId`
- 20+ 필드가 모두 Mode별로 분리됨

**전략**: 작은 수정으로 큰 효과를 내는 순차적 접근 + **선별적 개선사항 이식**

## 🎯 에러 분류 및 우선순위

### 📊 에러 통계 (~~297개~~ → **250개**)
**해결 완료**: 47개 (Proto imports, 중복 imports, grpc 복구 등)
1. **Mode별 API 필드 접근** (~180개): `apiConfiguration.apiProvider` 등
2. **Missing 타입/함수** (~50개): `Mode`, `getModeSpecificFields`, `useApiConfigurationHandlers`
3. **Validation 함수** (~30개): `validateApiConfiguration` 시그니처 변경
4. **Proto imports** (~20개): `@shared/proto/common` 등
5. **기타 호환성** (~17개): `ExtensionMessage`, `useEvent` 등

### ⚡ 효율성 분석
- **Phase 1** (핵심 타입): 90% 에러 해결 예상
- **Phase 2** (API 매핑): 180개 에러 → 10개 이하로 감소 예상
- **Phase 3-5**: 개별 컴포넌트 정리

## 🔍 **중복 Mode 설정 구조 발견 (2025-01-22)**

**문제**: `mode`와 `chatSettings.mode`가 중복되어 동기화 문제 발생
- **GlobalState**: `mode` ("plan" | "act" | "chatbot" | "agent") 
- **WorkspaceState**: `chatSettings.mode` (동일한 값들)
- **문제점**: 두 값이 독립적으로 업데이트되어 불일치 가능성

**영향 범위**:
- Proto conversion에서 `chatSettings.mode` 사용
- Task에서 `mode` 사용 (이미 수정 완료)
- Extension.ts에서 migration 로직

**해결 방안 검토 중**: `mode` 하나로 통합하되 기존 기능 영향 최소화

**실제 적용된 수정사항**:
1. **Task 클래스 단순화** ✅:
   - `chatSettings` 매개변수 제거
   - `mode === "chatbot"` 직접 사용으로 `strictChatbotModeEnabled` 계산
   - 불필요한 중복 제거

2. **Extension.ts 강제 변경 로직 제거** ✅:
   - 무조건 "agent"로 변경하는 로직 주석 처리
   - 사용자 선택 모드 존중

3. **ToolExecutor 매개변수 순서 최적화** ✅:
   - `strictChatbotModeEnabled`를 맨 앞으로 이동 (머징 안전성)
   - 다른 매개변수와 패턴 통일

**남은 과제**: Proto conversion 함수도 `mode` 기반으로 변경 검토

## 💾 **백업 파일 네이밍 규칙 업데이트 (2025-01-22)**

**변경사항**: `.cline` 백업 파일 네이밍을 AI 친화적 DOT 방식으로 통일
- **기존**: `App-tsx.cline` (DASH 방식)
- **변경**: `App.tsx.cline` (DOT 방식)
- **이유**: AI가 자연스럽게 선호하는 직관적 패턴과 일치

**완료 작업**:
- ✅ 344개 → 102개 백업 파일 정리 (중복 제거)
- ✅ 모든 DASH 방식을 DOT 방식으로 변경
- ✅ CARET 파일명 포함된 잘못된 백업 삭제
- ✅ 머징 완료 후 v3.20.8 기준 업데이트 계획 수립

## 🔥 **중대 발견: 백엔드-프론트엔드 타입 불일치 (2025-01-22 해결)**

**문제**: `toggleChatbotAgentMode` 기능에서 심각한 타입 불일치 발견
- **Proto 정의**: `ToggleChatbotAgentModeRequest` ✅
- **백엔드 구현**: `TogglePlanActModeRequest` ❌ (잘못된 타입)
- **프론트엔드**: `ToggleChatbotAgentModeRequest` ✅ (올바른 타입)

**해결 과정**:
1. **3-레포 전략**: main-caret와 비교하여 정확한 구현 확인
2. **백업 생성**: 잘못된 버전을 `.cline`으로 백업 (규칙 위반 수정됨)
3. **올바른 구현 복구**: main-caret에서 정상 버전 복사
4. **Import 경로 수정**: `@shared/proto/cline/*` 형식으로 업데이트

**교훈**: Proto 정의만으로는 부족, **백엔드-프론트엔드 타입 일치성** 검증 필수

## 📝 Phase별 작업 계획

### **Phase 1: 핵심 타입/모듈 호환성** 🔧 (진행중)
**목표**: ~~297개~~ 250개 → 50개 이하로 에러 감소
**진행 상황**: 47개 해결 완료, 203개 남음

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

## 🔄 **새로운 머징 전략 (마스터 제안)**

### **선별적 개선사항 이식 방법론**

#### **Phase 0: Cline 개선사항 분석 및 선별** 🔍
1. **비교 분석**:
   ```bash
   # Cline 원본과 Caret 차이점 분석
   diff -r cline-webview-ui/src webview-ui/src --exclude="*.cline"
   ```

2. **개선사항 카테고리**:
   - **성능 최적화**: 메모리 사용량, 렌더링 성능
   - **버그 수정**: 입력창 에러, 문자열 길이 문제
   - **UX 개선**: 사용성, 접근성
   - **보안 강화**: XSS 방지, 입력 검증

3. **선별 기준**:
   - ✅ **도입**: 명확한 버그 수정, 성능 개선
   - ⚠️ **검토**: UI/UX 변경사항
   - ❌ **제외**: Caret 고유 기능과 충돌

#### **Phase 0.5: 구조적 개선 (머징 친화적)** 🏗️
1. **Caret 개선사항 모듈화**:
   ```typescript
   // webview-ui/src/caret/enhancements/
   ├── i18n/                    # 다국어 지원
   ├── brand-colors/           # Caret 브랜드 컬러
   ├── chatbot-agent/          # Chatbot/Agent 시스템
   └── performance/            # 성능 최적화
   ```

2. **확장 패턴 적용**:
   ```typescript
   // 기존: Cline 파일 직접 수정
   // 개선: HOC/Hook 패턴으로 확장
   const ChatTextAreaWithCaret = withCaretEnhancements(ChatTextArea)
   ```

#### **향후 머징 프로세스** 📈
1. **버전 태깅**: 현재 Cline 버전 기록 (v3.20.8)
2. **차이 분석**: 다음 버전과의 변경사항 자동 분석
3. **선별 적용**: 검증된 개선사항만 자동/수동 이식
4. **테스트 검증**: 각 단계별 기능 무결성 확인

### **이 전략의 장기적 이익** 🎯
- **안전성**: 전면 교체 리스크 제거
- **효율성**: 불필요한 충돌 해결 시간 단축  
- **지속가능성**: 패턴 확립으로 미래 머징 비용 절감
- **품질 보장**: 검증된 개선사항만 도입

---

**마스터~ 새로운 전략으로 더 안전하고 효율적인 머징을 실현하겠습니다!** ✨
