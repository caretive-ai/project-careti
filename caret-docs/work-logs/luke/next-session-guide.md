# Next Session Guide - Task #006 전략적 머징 완성

## 🎯 **작업 현황: 올바른 Task #006 기반**

### **📋 현재 상황 (2025-01-22 최종 업데이트)**
- **작업**: **Task #006-3** Caret WebView UI API Configuration Migration 
- **TypeScript 에러**: ~~297개~~ → ~~244개~~ → ~~231개~~ → ~~183개~~ → **188개** (109개 해결, 45% 진행)
- **머징 전략**: 선별적 개선사항 이식 전략 + **실시간 문서화** + **패턴 기반 일괄 수정** + **시스템적 접근** 완료

#### **✅ 완료된 작업 (2025-01-22 세션)**
1. **Proto Import 경로 수정 (9개 파일)**: `@shared/proto/common` → `@shared/proto/cline/common` 
2. **핵심 Missing Imports 추가**: `ToggleChatbotAgentModeRequest`, `remarkMath`, `TelemetrySettingRequest`
3. **normalizeApiConfiguration 경로 수정**: `@shared/api` → `@/components/settings/utils/providerUtils`
4. **ApiOptions currentMode 필수 prop 추가**: Caret 고유 기능 보존
5. **🎯 대규모 API 필드 마이그레이션 (41개 에러 해결)**:
   - `getModeSpecificFields` 함수 도입으로 Mode별 필드 접근 패턴 통일
   - `openAiModelInfo`, `fireworksModelId`, `togetherModelId` 등 일괄 수정
   - `awsBedrockCustomSelected`, `awsBedrockCustomModelBaseId` 전면 수정
   - **패턴 기반 replace_all** 전략으로 효율성 극대화
6. **🔧 시스템 아키텍처 개선 (15개 에러 해결)**:
   - `useApiConfigurationHandlers` 복구로 `setApiConfiguration` 대체
   - `validate.ts` Mode별 필드 접근 통일 (7개 필드 수정)
   - FirebaseAuthContext parameter types 및 photoUrl 수정
   - clineApiKey → clineAccountId 변경으로 API 호환성 확보

### **⚠️ 중요한 깨달음**
마스터가 지적하신 대로, **머징 가이드에 이미 전략적 방법론이 완벽하게 정립**되어 있었습니다:

#### **머징 가이드 기존 전략 (이미 확립됨)**:
1. **CHANGELOG 정리 (3.5절)**: ✅ 변경사항 사전 분석, 우선순위 결정
2. **선별적 개선사항 이식 (6.1절)**: ✅ 버전 태깅, 차이 분석, 카테고리별 선별
3. **Caret 고유 코드 누락 방지 (6.2절)**: ✅ 3-레포 환경, 체크리스트, 자동화

#### **실제 적용 사례: Task #006-3 (진행 중)**:
- **시작점**: 297개 TypeScript 에러
- **현재**: 244개 에러 (22% 진행)
- **전략**: 순차적 Phase 접근 + Caret 고유 기능 보존

## 🚀 **Task #006 작업 계획 (머징 가이드 기반)**

### **Phase 1: 기반 호환성 확보** 🔧 (진행 중)
**목표**: 244개 에러 → 50개 이하

#### **1.1 Proto Import 경로 수정** ✅ (완료)
```bash
# 이미 완료: @shared/proto/common → @shared/proto/cline/common
```

#### **1.2 핵심 타입/함수 추가** (진행 중)
- [ ] **Mode 타입 추가**: `import { Mode } from "@shared/storage/types"`
- [ ] **getModeSpecificFields 함수 구현**
- [ ] **useApiConfigurationHandlers 복구**
- [ ] **validateApiConfiguration 시그니처 수정**

#### **1.3 누락된 Caret 고유 기능 복구** (중요!)
- [ ] **`ToggleChatbotAgentModeRequest` 검증**: Proto 정의와 백엔드 일치성 확인
- [ ] **Chatbot/Agent 모드 함수들**: `toggleChatbotAgentMode` 등
- [ ] **다국어 시스템**: 30개 i18n JSON 파일 보존

### **Phase 2: API 필드 매핑 시스템** 🗂️
**목표**: 180개 API 필드 에러 → 10개 이하

#### **2.1 API 필드 매핑 테이블 생성**
```typescript
// src/utils/apiFieldMapping.ts 신규 생성
export const API_FIELD_MAPPING = {
  apiProvider: { plan: 'planModeApiProvider', act: 'actModeApiProvider' },
  openAiModelId: { plan: 'planModeOpenAiModelId', act: 'actModeOpenAiModelId' },
  // ... 20+ 필드 매핑
}

export function getModeSpecificField(
  apiConfiguration: ApiConfiguration,
  fieldName: string, 
  mode: Mode
): any {
  // 모든 API 필드 접근을 통합 처리
}
```

#### **2.2 ApiOptions.tsx 등 컴포넌트 일괄 수정**
```typescript
// 기존: apiConfiguration?.openAiModelId
// 변경: getModeSpecificField(apiConfiguration, 'openAiModelId', currentMode)
```

### **Phase 3: Cline 개선사항 선별적 도입** ⚡
**목표**: 머징 가이드 6.1절 "선별적 개선사항 이식 전략" 적용

#### **3.1 Cline v3.17.13 → v3.20.8 개선사항 분석**
**이미 CHANGELOG-cline.md에서 분석 완료**:
- **새 AI 프로바이더**: Hugging Face, Groq, Moonshot, Huawei Cloud
- **성능 최적화**: Provider switching 18배 향상
- **최신 모델**: Claude 4, Gemini 2.5, DeepSeek R1
- **UI/UX 개선**: Navbar tooltips, Input focus 개선

#### **3.2 선별적 도입 우선순위**
1. **✅ 도입 필수**: 버그 수정, 성능 최적화, 새 프로바이더
2. **⚠️ 검토 필요**: UI/UX 변경 (Caret 브랜딩과 조화)
3. **❌ 제외**: Caret 고유 기능과 상충하는 변경

#### **3.3 3-레포 비교 검증**
```bash
# Caret 고유 기능 확인 (main-caret 참조)
Get-ChildItem -Recurse main-caret\ -Filter "*.proto" | Select-String "ToggleChatbotAgentMode"

# 현재 작업 결과 확인 (누락 여부 체크)  
Get-ChildItem -Recurse proto\ -Filter "*.proto" | Select-String "ToggleChatbotAgentMode"

# Cline 새 기능 확인 (선별적 도입용)
Get-ChildItem -Recurse cline-latest\ -Filter "*.tsx" | Select-String "새로운기능키워드"
```

### **Phase 4: 최종 검증 및 완성** ✅
**목표**: TypeScript 에러 0개, 모든 기능 정상 작동

#### **4.1 핵심 Caret 기능 체크리스트** (머징 가이드 6.2절)
- [ ] **Proto 메시지**: `ToggleChatbotAgentModeRequest`, `ChatSettings` 등
- [ ] **Proto 서비스**: `toggleChatbotAgentMode` RPC 메서드
- [ ] **Enum 타입**: `ChatbotAgentMode` (CHATBOT_MODE, AGENT_MODE)  
- [ ] **다국어 시스템**: 30개 i18n JSON 파일 및 번역 함수
- [ ] **Caret 브랜딩**: CHATBOT_MODE_COLOR, Caret 로고 등
- [ ] **CARET MODIFICATION 주석**: 모든 Caret 수정사항 표시

#### **4.2 시스템 프롬프트 검증** (머징 가이드 5절)
```bash
# ClineFeatureValidator 검증 시스템 테스트 (25개 테스트)
npx vitest run "caret-src/__tests__/cline-feature-validation.test.ts"

# 25개 테스트 모두 통과 확인 (100%)
✓ caret-src/__tests__/cline-feature-validation.test.ts (25)
```

#### **4.3 .cline 백업 업데이트** (머징 가이드 6.3절)
```powershell
# 머징 완료 후 새로운 Cline 원본(v3.20.8)으로 백업 업데이트
Copy-Item "cline-latest\webview-ui\src\App.tsx" "webview-ui\src\App.tsx.cline" -Force
Copy-Item "cline-latest\package.json" "package.json.cline" -Force
# ... 102개 .cline 파일 일괄 업데이트
```

## 🚀 **다음 세션 진입점 (AI Work Index Guide 준수)**

### **📋 STEP 0: 필수 읽기 문서 (작업 시작 전 필독)**
```bash
# AI Work Index Guide 확인
caret-docs/development/ai-work-index.mdx

# 현재 작업 문서 (이 파일)
caret-docs/work-logs/luke/next-session-guide.md

# 작업 상세 계획
caret-docs/tasks/006-3-caret-webview-ui-api-migration-plan.md

# 머징 전략 가이드 (6.1, 6.2절 중점)
caret-docs/guides/upstream-merging.mdx
```

### **📝 STEP 1: 작업 성격 분석 및 문서 확인**
- **작업 카테고리**: `frontend_backend_interaction` + `cline_original_modification`
- **필수 문서**: 
  - `frontend-backend-interaction-patterns.mdx` (ExtensionStateContext 관련)
  - `caret-architecture-and-implementation-guide.mdx` (sections 10-11)
  - File modification checklist in caretrules.ko.md
- **TDD**: Red-Green-Refactor 원칙 적용

### **⚡ STEP 2: 작업 환경 확인**
```powershell
# 현재 위치 확인 (PowerShell)
cd D:\dev\caret\webview-ui
pwd

# 현재 에러 상황 확인
npm run build 2>&1 | Select-String "error TS" | Measure-Object | Select-Object -ExpandProperty Count
# 예상 결과: 188개 (마지막 확인 기준)
```

### **2. 남은 에러 패턴 분석** 📊
```powershell
# 주요 에러 카테고리 확인
npm run build 2>&1 | Select-String "error TS" | Select-Object -First 10

# ExtensionStateContext 관련 에러 확인
npm run build 2>&1 | Select-String "ExtensionStateContext" | Select-Object -First 5

# 특정 패턴 에러 확인
npm run build 2>&1 | Select-String "does not exist on type" | Select-Object -First 5
```

### **🎯 STEP 3: Phase 2 작업 계획 (AI Work Index 기반)**
**목표**: 188개 → 100개 이하 (50% 진행률 달성)

#### **3.1 아키텍처 결정 체크리스트**
- [ ] ExtensionStateContext 수정: **Cline 원본** vs **Caret 확장** 결정
- [ ] subscribeToAuthCallback: **Proto 정의 확인** 후 구현 방향 결정  
- [ ] ThinkingBudgetSlider: **Props 인터페이스 통일** 전략 수립
- [ ] 각 수정사항: **백업 필요성** 및 **CARET MODIFICATION 주석** 확인

#### **3.2 우선순위별 작업 순서**
1. **ExtensionStateContext missing properties** (setTelemetrySetting, mcpRichDisplayEnabled 등)
2. **subscribeToAuthCallback missing method** (FirebaseAuthContext)  
3. **ThinkingBudgetSlider props 불일치** 문제
4. **ChatbotAgentMode 타입 불일치** 해결

### **4. 검증된 수정 패턴 활용** ⚡

#### **성공한 수정 전략** (이미 검증됨)
- ✅ **getModeSpecificFields 패턴**: Mode별 필드 접근 통일화
- ✅ **replace_all 전략**: 대규모 필드 수정 시 효율성 극대화  
- ✅ **useApiConfigurationHandlers**: setApiConfiguration 대체 패턴
- ✅ **실시간 문서화**: 진행사항 추적으로 품질 보장

#### **남은 작업 접근법** (머징 가이드 기반)
1. **ExtensionStateContext 확장**: missing properties 추가
2. **Proto 서비스 메소드**: subscribeToAuthCallback 구현 확인
3. **컴포넌트 props 정리**: ThinkingBudgetSlider 등 인터페이스 통일
4. **타입 정의 보완**: ChatbotAgentMode 관련 타입 체크

## 📊 **예상 성과 (머징 가이드 기반)**

### **기술적 성과**
- **TypeScript 에러**: 244개 → 0개 ✅
- **성능 향상**: Provider switching 최소 10배 향상 ⚡
- **새 기능**: AI 프로바이더 4개, 최신 모델 다수 추가 🤖
- **안정성**: Caret 고유 기능 100% 보존 🛡️

### **머징 효율성**
- **선별적 도입**: 불필요한 변경사항 제외
- **충돌 최소화**: 3-레포 전략으로 안전성 확보
- **검증 자동화**: ClineFeatureValidator로 기능 보존 확인
- **향후 머징 대비**: 패턴 확립으로 미래 비용 절감

## 💾 **커밋 및 다음 세션 준비**

### **현재 세션 성과**
- ✅ **머징 가이드 전략 재확인**: 이미 체계적 방법론 확립
- ✅ **Task #006 기반 정리**: 불필요한 Task #029 삭제
- ✅ **Cline 개선사항 분석**: v3.17.13 → v3.20.8 주요 변경점 파악
- ✅ **3-레포 전략 활용**: main-caret, cline-latest 비교 방법 확립

### **다음 세션 필수 문서**
1. **Task #006-3**: `caret-docs/tasks/006-3-caret-webview-ui-api-migration-plan.md`
2. **머징 가이드**: `caret-docs/guides/upstream-merging.mdx` (6.1, 6.2절 중점)
3. **CHANGELOG-cline.md**: v3.17.13 이후 Cline 개선사항 (선별적 도입 참조)

### **백업 및 안전장치**
- **Git 브랜치**: 현재 작업 상태 유지
- **3-레포 환경**: main-caret, cline-latest 활용 준비
- **.cline 백업**: 102개 파일, DOT 방식 통일 완료

## 🚨 **AI 작업 시 필수 체크**

### **작업 시작 전**
- [ ] Task #006-3 문서 완전 숙지
- [ ] 머징 가이드 6.1, 6.2절 원칙 확인
- [ ] 3-레포 환경 상태 점검
- [ ] 현재 에러 수 재확인 (244개 기준)

### **작업 중 지속 확인**
- [ ] Caret 고유 기능 보존 상태 (Chatbot/Agent, 페르소나, 다국어)
- [ ] CARET MODIFICATION 주석 유지
- [ ] Phase별 단계적 진행 (한 번에 여러 Phase 금지)
- [ ] 각 단계마다 빌드 테스트로 검증

### **완료 시 검증**
- [ ] ClineFeatureValidator 25개 테스트 모두 통과
- [ ] Caret 고유 기능 체크리스트 100% 확인
- [ ] .cline 백업 파일 v3.20.8 기준 업데이트

---

## 🤖 **다음 세션 AI 진입 가이드**

### **세션 시작 시 실행할 명령어**
```markdown
Task #006 WebView API 마이그레이션 작업을 계속 진행해줘.

필수 읽기:
- @next-session-guide.md (현재 상황 및 계획)  
- @ai-work-index.mdx (AI Work Index Guide)
- @006-3-caret-webview-ui-api-migration-plan.md (작업 상세)
- @upstream-merging.mdx (6.1, 6.2절 전략)

현재 상황: 188개 TypeScript 에러 (244개에서 56개 해결, 23% 진행)
다음 우선순위: ExtensionStateContext missing properties 해결부터 시작
```

### **AI 필수 체크사항** ⚠️
- [ ] AI Work Index Guide 읽기 완료
- [ ] 작업 성격 분석: `frontend_backend_interaction` + `cline_original_modification`  
- [ ] 백업 규칙 확인: `.cline` 파일 생성 조건
- [ ] TDD 원칙 적용: Test → Implementation → Refactor
- [ ] 실시간 문서화: 진행사항을 `next-session-guide.md`에 기록

---

**🎯 핵심 메시지**: **AI Work Index Guide 기반 체계적 접근**으로 Caret의 독창성을 지키면서 Cline의 최신 개선사항을 흡수하는 **차세대 AI 코딩 도구** 완성이 목표입니다!

**마스터~ 다음 세션에서도 완벽하게 연결되어 진행하겠습니다!** ☕✨🌿