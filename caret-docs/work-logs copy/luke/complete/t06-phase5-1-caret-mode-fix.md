# t06-phase5-1: Caret Mode System 정리 및 안정화

**작업 일자**: 2025-09-10  
**작업자**: Luke  
**작업 유형**: 모드 시스템 정리 및 문서화  

## 🎯 **작업 목적**

현재 Caret 모드 시스템(chatbot/agent)이 f06+f07 하이브리드 방식으로 구현되어 있으나, 아키텍처 문서와 실제 구현 간 불일치가 발생하고 있어 이를 정리하고 안정화하는 것이 목적입니다.

### **핵심 이슈**
1. **문서 불일치**: f06(JSON 프롬프트) vs f07(독립 시스템) 접근법 혼재
2. **UI-백엔드 동기화**: 초기화시 agent모드 UI vs chatbot모드 백엔드 로그 불일치  
3. **아키텍처 혼란**: 개발자가 현재 구현 방식을 명확히 이해하기 어려운 상태

## 📊 **현재 구현 상태 분석**

### **실제 구현 방식: f06+f07 하이브리드 (대체품 방식)**

```typescript
// src/core/prompts/system-prompt/index.ts:42-58
export async function getSystemPrompt(context: SystemPromptContext): Promise<string> {
    const currentMode = CaretGlobalManager.currentMode
    
    if (currentMode === "caret") {
        // f07 사용자 경험: chatbot/agent 용어
        // f06 기술 구현: plan/act 인프라 + JSON 프롬프트
        return await CaretPromptWrapper.getCaretSystemPrompt(context)
    } else {
        // 기존 Cline 시스템 100% 보존
        return await registry.get(context)
    }
}
```

### **현재 아키텍처 특징**
- ✅ **사용자 경험**: f07 방식 (chatbot/agent 용어)
- ✅ **기술 인프라**: f06 방식 (plan/act 재활용 + JSON 프롬프트)
- ✅ **안전성**: Cline 코어 로직 완전 보존
- ⚠️ **문서화**: f06/f07 구분 없이 혼재 기술

### **Cline 코드 수정 범위 (매우 안전한 수준)**
```
핵심 수정 파일: 3-5개
1. src/core/prompts/system-prompt/index.ts - 시스템 분기 (6라인)
2. webview-ui/src/components/chat/ChatTextArea.tsx - UI 라벨
3. src/extension.ts - 초기화
4. proto/ - 설정 필드
5. src/core/controller/index.ts - CaretGlobalManager 연동

완전 독립 구현: caret-src/ 전체
```

## 🚀 **구현 계획**

### **Phase 1: 문서 정리 및 통합**
**목표**: f06+f07 하이브리드 방식을 명확히 문서화

**작업 항목**:
1. **f06 문서 업데이트**: JSON 프롬프트 시스템을 기술 인프라로 정의
2. **f07 문서 업데이트**: 사용자 경험 레이어로 정의, 대체품 방식 명시
3. **통합 아키텍처 문서**: 하이브리드 방식의 장점과 구현 방법 설명

**TDD 접근**:
```typescript
// 테스트: 하이브리드 시스템 동작 검증
describe('Caret Hybrid Mode System', () => {
  test('사용자는 chatbot/agent 용어만 봄', () => {
    expect(UI.getModeLabel()).toBe('Agent Mode')
    expect(UI.getModeLabel()).not.toBe('Act Mode')
  })
  
  test('내부적으로는 plan/act 인프라 사용', () => {
    expect(backend.getInternalMode()).toBe('act')
    expect(backend.getSystemPrompt()).toContain('AGENT MODE')
  })
})
```

### **Phase 2: UI-백엔드 동기화 완전 해결**
**목표**: 초기화시 모드 불일치 문제 완전 해결

**작업 항목**:
1. **ExtensionStateContext 동기화 강화**:
   ```typescript
   // 백엔드 상태 변경시 localStorage 즉시 동기화
   if (newState.modeSystem !== undefined) {
       localStorage.setItem(STORAGE_KEYS.MODE_SYSTEM, newState.modeSystem)
   }
   if (newState.mode !== undefined) {
       localStorage.setItem(STORAGE_KEYS.CURRENT_MODE, newState.mode)
   }
   ```

2. **ButtonConfig ExtensionState 우선 참조**:
   ```typescript
   // localStorage보다 ExtensionState 우선 참조
   const modeSystem = extensionState?.modeSystem || 
       localStorage.getItem(STORAGE_KEYS.MODE_SYSTEM) || 
       MODE_SYSTEMS.CARET
   ```

3. **기본값 통일**: 모든 컴포넌트에서 CARET 기본값 사용

**TDD 접근**:
```typescript
describe('Mode Synchronization', () => {
  test('초기화시 UI와 백엔드 모드 일치', async () => {
    await initializeApp()
    
    const uiMode = UI.getCurrentMode()
    const backendMode = await Backend.getCurrentMode()
    const loggedMode = Logger.getLastModeLog()
    
    expect(uiMode).toBe(backendMode)
    expect(loggedMode).toBe(uiMode)
  })
})
```

### **Phase 3: 기존 잘못된 흔적 검증 및 정리**
**목표**: f07 독립시스템 접근법의 잘못된 구현 흔적 제거

**검증 항목**:
1. **독립 모드 시스템 흔적**: 
   - `CaretModeSystem` 완전 독립 구현 코드 확인
   - plan/act 우회 코드 흔적 제거
   
2. **복잡한 매핑 로직**:
   - plan→agent, act→chatbot 혼란스러운 매핑 정리
   - 단순 해석 변환으로 통일

3. **중복 상태 관리**:
   - 3중 모드 시스템(Cline plan/act, CaretGlobalManager, CaretModeManager) 정리
   - 단일 진실 원천(Single Source of Truth) 확립

**정리 작업**:
```typescript
// 기존: 복잡한 3중 시스템
CaretModeManager.chatbot → CaretGlobalManager.caret → Cline.plan

// 개선: 단순한 해석 변환
CaretGlobalManager.caret + mode → CaretPromptWrapper → JSON 프롬프트
```

#### **3-1. 잘못된 독립 시스템 흔적 탐지**

**자동 검증 스크립트**:
```bash
#!/bin/bash
echo "=== 잘못된 독립 시스템 패턴 탐지 ==="
grep -r "완전.*독립\|plan.*우회\|act.*우회" caret-src/
grep -r "CaretIndependentModeSystem\|ComplexMappingSystem" caret-src/
grep -r "3중.*모드.*시스템\|triple.*mode" caret-docs/

echo "=== 올바른 대체품 패턴 확인 ==="  
grep -r "대체품.*방식\|어댑터.*패턴" caret-src/
grep -r "plan/act.*재활용\|인프라.*활용" caret-docs/
```

#### **3-2. 코드 정리 체크리스트**

**제거 대상 코드 패턴들**:
```typescript
// ❌ 제거: 완전 독립 실행 패턴
class CaretIndependentModeSystem {
    async executeWithoutPlanAct() { 
        // plan/act 우회하는 독립 실행 로직
    }
}

// ❌ 제거: 복잡한 다단계 매핑
const COMPLEX_MODE_MAPPING = {
    'ui-chatbot': 'internal-consultation',
    'internal-consultation': 'cline-plan',
    'cline-plan': 'backend-execution'
}

// ✅ 유지: 단순한 해석 변환
const SIMPLE_MODE_INTERPRETATION = {
    'chatbot': 'plan',  // 단순 1:1 매핑
    'agent': 'act'
}
```

#### **3-3. TDD 검증 테스트**

```typescript
describe('Architecture Cleanup Validation', () => {
  test('중복 모드 관리 시스템 완전 제거', async () => {
    const modeManagers = await scanForModeManagers()
    
    // 오직 2개만 존재해야 함
    expect(modeManagers).toEqual([
      'CaretGlobalManager',  // 시스템 선택 (caret/cline)
      'Cline StateManager'   // 기존 모드 관리
    ])
    
    // 잘못된 독립 시스템 완전 제거 확인
    expect(modeManagers).not.toContain('CaretIndependentModeSystem')
    expect(modeManagers).not.toContain('ComplexMappingSystem')
  })
  
  test('plan/act 우회 코드 완전 제거', async () => {
    const bypassPatterns = await searchForPatterns([
      /plan.*우회/,
      /act.*우회/, 
      /독립.*실행/,
      /완전.*독립.*모드/
    ])
    
    expect(bypassPatterns).toHaveLength(0)
  })
  
  test('단순한 해석 변환만 존재', async () => {
    const conversionComplexity = await analyzeConversionLogic()
    
    expect(conversionComplexity.maxDepth).toBeLessThan(3)
    expect(conversionComplexity.mappingSteps).toBeLessThan(2)
    expect(conversionComplexity.cyclomaticComplexity).toBeLessThan(5)
  })
  
  test('상태 관리 단일 진실 원천 확보', async () => {
    const stateManagers = await findStateManagers()
    
    // ExtensionState가 주 진실 원천
    expect(stateManagers.primary).toBe('ExtensionState')
    expect(stateManagers.secondary).toEqual([
      'localStorage', // 동기화용만
      'CaretGlobalManager.currentMode' // 캐시용만  
    ])
  })
})

### **Phase 4: TDD 및 표준 로깅 시스템 적용**
**목표**: 완전한 TDD 적용 및 Caret 표준 로깅으로 모드 관련 로그 통일

#### **4-1. TDD 테스트 전략**

**통합 테스트 (Integration Test)**:
```typescript
// 실제 사용자 시나리오 기반 테스트 (Top-down TDD)
describe('Caret Mode System E2E', () => {
  test('사용자가 Agent 모드로 코드 작성 요청시 전체 플로우', async () => {
    // 1. RED: 실제 사용 시나리오 테스트 작성
    const user = await setupTestUser()
    await user.selectMode('agent')
    const response = await user.sendMessage('JWT 인증 시스템 구현해줘')
    
    // 2. GREEN: 필요한 모든 구현 완료 후
    expect(response).toContain('JWT 인증 시스템을 구현하겠습니다')
    expect(await user.getExecutedTools()).toContain('write_file')
    expect(await user.getCreatedFiles()).toContain('auth.js')
  })

  test('Chatbot 모드에서 위험한 도구 사용 차단', async () => {
    const user = await setupTestUser()
    await user.selectMode('chatbot')
    const response = await user.sendMessage('package.json 삭제해줘')
    
    expect(response).toContain('파일 삭제는 Agent 모드에서만')
    expect(await user.getExecutedTools()).not.toContain('execute_command')
  })
})
```

**단위 테스트 (Unit Test)**:
```typescript
// 핵심 컴포넌트 테스트 (Bottom-up TDD 보완)
describe('CaretPromptWrapper', () => {
  test('plan 모드를 chatbot 프롬프트로 변환', async () => {
    const context = createTestContext({ mode: 'plan' })
    const prompt = await CaretPromptWrapper.getCaretSystemPrompt(context)
    
    expect(prompt).toContain('CHATBOT MODE')
    expect(prompt).toContain('Expert consultation and guidance')
  })
  
  test('act 모드를 agent 프롬프트로 변환', async () => {
    const context = createTestContext({ mode: 'act' })
    const prompt = await CaretPromptWrapper.getCaretSystemPrompt(context)
    
    expect(prompt).toContain('AGENT MODE')
    expect(prompt).toContain('Collaborative development')
  })
})
```

**상태 동기화 테스트**:
```typescript
describe('UI-Backend Mode Sync', () => {
  test('초기화시 UI-백엔드 모드 완벽 일치', async () => {
    // TDD RED: 현재 실패하는 시나리오
    await initializeExtension()
    
    const uiMode = await getUIDisplayedMode()
    const backendMode = await getBackendLoggedMode()
    const storageMode = await getStorageMode()
    
    // TDD GREEN: 모든 레이어 일치 보장
    expect(uiMode).toBe(backendMode)
    expect(backendMode).toBe(storageMode)
    expect(uiMode).toBe('agent') // 기본값 통일
  })
})
```

#### **4-2. 표준 로깅 시스템**

**로깅 표준화**:
```typescript
// 기존 산재된 console.log → 표준 Logger 통일
import { Logger } from '@/services/logging/Logger'

// 모드 초기화
Logger.info('[CARET-MODE] 🚀 Initializing with mode: ${mode}')

// 상태 동기화
Logger.debug('[CARET-MODE] 🔄 UI-Backend sync: ${uiMode} ↔ ${backendMode}')

// 모드 변경
Logger.info('[CARET-MODE] 📝 Mode change: ${oldMode} → ${newMode}')

// 에러 상황
Logger.warn('[CARET-MODE] ⚠️ Mode mismatch detected: UI(${ui}) vs Backend(${backend})')
Logger.error('[CARET-MODE] ❌ Mode initialization failed: ${error.message}')
```

**로깅 카테고리**:
- `[CARET-MODE-INIT]`: 초기화 관련 로그
- `[CARET-MODE-SYNC]`: UI-백엔드 동기화 로그  
- `[CARET-MODE-CHANGE]`: 모드 변경 로그
- `[CARET-MODE-ERROR]`: 에러 및 예외 상황

**성능 모니터링 로깅**:
```typescript
Logger.performance('[CARET-MODE] 📊 Prompt generation time: ${duration}ms')
Logger.performance('[CARET-MODE] 🎯 Token usage: ${tokens} (${efficiency}% efficient)')
```

## ⚡ **예상 작업 시간**

- **Phase 1 (문서 정리)**: 2-3시간
- **Phase 2 (동기화 수정)**: 1-2시간  
- **Phase 3 (흔적 정리)**: 2-4시간
- **Phase 4 (로깅 표준화)**: 1시간

**총 예상 시간**: 6-10시간

## 🎯 **완료 기준**

### **기능적 완료**
1. ✅ UI-백엔드 모드 100% 일치 (초기화 포함)
2. ✅ 모든 모드 전환 시나리오 정상 동작
3. ✅ TDD 테스트 95% 이상 통과

### **아키텍처적 완료**  
1. ✅ f06+f07 하이브리드 방식 명확한 문서화
2. ✅ 중복 모드 시스템 완전 제거
3. ✅ Cline 코어 수정 최소화 (5개 파일 이하)

### **품질 완료**
1. ✅ 표준 로깅 시스템 100% 적용
2. ✅ 기존 잘못된 구현 흔적 0개
3. ✅ 코드 리뷰 및 문서 검증 완료

## 📝 **위험 요소 및 대응**

### **위험 요소**
1. **Cline 업스트림 충돌**: f06+f07 하이브리드가 복잡할 경우
2. **성능 영향**: 프롬프트 생성 오버헤드
3. **사용자 혼란**: 모드 용어 변경으로 인한 학습 비용

### **대응 방안**
1. **최소 수정 원칙**: Cline 코어 파일 3-5개만 수정
2. **캐싱 적용**: JSON 프롬프트 캐싱으로 성능 최적화
3. **점진적 전환**: Cline 모드 유지 옵션 제공

## 📋 **다음 단계**

이 작업 완료 후:
1. **다른 AI에게 검토 요청**: 아키텍처 일관성 및 구현 품질 확인
2. **사용자 테스트**: 실제 사용 시나리오에서 동작 검증  
3. **성능 모니터링**: 프롬프트 생성 시간 및 토큰 사용량 측정
4. **문서화 완료**: 개발자 가이드 및 사용자 매뉴얼 업데이트