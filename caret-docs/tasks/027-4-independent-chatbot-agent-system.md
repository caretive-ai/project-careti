# 027-4: Agent/Chatbot 대화 흐름 완성 - v3.26.6 Plan Mode 활용

**작성일**: 2025-08-28  
**상태**: ✅ **최종 전략 확정 - Plan Mode 직접 활용**  
**우선순위**: ✨ **CRITICAL** - Agent 모드 대화 불가 문제 해결  
**마지막 업데이트**: 2025-08-28 오후 (전략 재정립 완료)

---

## 🎉 **최종 발견: v3.26.6 Plan Mode가 완벽한 솔루션**

### **핵심 발견사항**
- ✅ **v3.26.6 plan_mode_respond**: 정확히 우리가 원하는 연속 대화 기능
- ✅ **실시간 스트리밍**: `block.partial` 완벽 지원
- ✅ **옵션 선택**: `options` 파라미터로 사용자 선택지 제공
- ✅ **탐색 연속성**: `needs_more_exploration` 플래그로 대화 지속
- ✅ **최소 수정 원칙**: Handler 시스템 불필요, ToolExecutor만 수정

### **전략 전환 이유**
1. **Handler 시스템**: Caret 독자 구현이며 v3.26.6에 없음 → 제거 필요
2. **Plan Mode 완성도**: v3.26.6에서 우리가 원하는 모든 기능 제공
3. **Cline 호환성**: 최소 수정으로 향후 업스트림 머징 용이  

---

## 🎯 **문제 분석**

### **현재 상황**
- **Agent 모드**: AI 응답 후 대화 입력창이 비활성화되어 연속 대화 불가
- **Chatbot 모드**: 정상 동작하지만 최적화 여지 존재
- **근본 원인**: 현재 `ToolExecutor` 기반 구현 vs 최신 Cline `Handler` 아키텍처 간의 차이

### **최신 Cline 분석 결과 (2025-08-27)**
```typescript
// 최신 Cline: PlanModeRespondHandler 클래스
export class PlanModeRespondHandler implements IToolHandler {
    readonly name = "plan_mode_respond"
    
    // 버튼 제거 지원
    plan_mode_respond: {
        enableButtons: false,
        primaryText: undefined,
        secondaryText: undefined
    }
    
    // 스트리밍 지원
    async handlePartialBlock(block: ToolUse, uiHelpers: StronglyTypedUIHelpers) {
        // 실시간 스트리밍 처리
    }
}
```

**발견사항**: 최신 Plan Mode가 **정확히 우리가 원하는 Chatbot/Agent 모드 UX**를 제공합니다.

---

## 🚀 **최종 해결 전략: Plan Mode 직접 활용**

### **핵심 아이디어**
1. **plan_mode_respond 완벽한 기능**: v3.26.6에서 연속 대화, 스트리밍, 옵션 선택 모두 지원
2. **최소 수정 원칙**: ToolExecutor에 2개 case만 추가하여 Caret 모드 구현  
3. **기존 시스템 활용**: ModeSystemRegistry, MessageHandlerFactory 등 보존

### **최적 구현 방법**
```typescript
// ToolExecutor.ts에 최소 수정 추가
case "agent_mode_respond": 
case "chatbot_mode_respond": {
    // plan_mode_respond와 100% 동일한 로직
    // UI에서만 다른 스타일링 적용
    const response = block.params.response
    const options = block.params.options  
    const needsMoreExploration = block.params.needs_more_exploration === "true"
    // ... plan_mode_respond 로직 재사용
}
```

---

## 📋 **3단계 최적화된 실행 계획**

### **Phase 1: 환경 정리 및 시그니처 수정** ⏱️ 30분

#### **1.1 불필요한 Handler 시스템 제거**
```bash
# Caret에서 만든 Handler 파일들 제거 (v3.26.6에 없음)
rm -rf D:\dev\caret\src\core\task\tools\handlers\
rm -rf D:\dev\caret\caret-src\core\task\tools\handlers\
```

#### **1.2 buildSystemPrompt 시그니처 수정**
```typescript
// caret-src/core/mode-system/ModeSystemRegistry.ts
// v3.26.6 시그니처에 맞춰 수정 (7인자 → 6인자)
return buildSystemPrompt(
    context.cwd,
    context.supportsBrowserUse, 
    context.mcpHub,
    context.browserSettings,
    context.apiConfiguration,
    context.focusChainSettings,
)
```

### **Phase 2: ToolExecutor에 Caret 모드 추가** ⏱️ 1시간

#### **2.1 plan_mode_respond 로직 복사**
```typescript 
// src/core/task/ToolExecutor.ts에 추가
case "agent_mode_respond": 
case "chatbot_mode_respond": {
    // plan_mode_respond 케이스와 동일한 로직
    const response = block.params.response
    const optionsRaw = block.params.options  
    const needsMoreExploration = block.params.needs_more_exploration === "true"
    
    const sharedMessage = {
        response: this.removeClosingTag(block, "response", response),
        options: parsePartialArrayString(this.removeClosingTag(block, "options", optionsRaw)),
    } satisfies ClinePlanModeResponse
    
    // 동일한 처리 로직...
}
```

#### **2.2 ExtensionMessage 타입 추가**
```typescript
// src/shared/ExtensionMessage.ts
export type ClineAsk = 
    | "attempt_completion"
    | "plan_mode_respond" 
    | "agent_mode_respond"    // CARET MODIFICATION 
    | "chatbot_mode_respond"  // CARET MODIFICATION
    // ... 기존 타입들
```

### **Phase 3: UI 연동 및 테스트** ⏱️ 30분

#### **3.1 ButtonConfig 업데이트**
```typescript
// webview-ui/src/components/chat/buttonConfig.ts
agent_mode_respond: {
    sendingDisabled: false,
    enableButtons: false,  // Plan Mode 스타일
    primaryText: undefined,
    secondaryText: undefined,
}
```

#### **3.2 실제 환경 테스트**
- F5 디버그 실행
- Agent 모드에서 연속 대화 확인 
- 기존 기능 회귀 테스트

---

## 🎯 **예상 성과**

### **기능적 개선**
- ✅ **Agent 모드 연속 대화**: AI 응답 후 즉시 추가 질문 가능  
- ✅ **v3.26.6 Plan Mode UX**: 연속 대화, 실시간 스트리밍, 옵션 선택 완벽 적용
- ✅ **기존 시스템 보존**: ModeSystemRegistry, MessageHandlerFactory 등 활용

### **기술적 혜택**
- ✅ **최소 수정 원칙**: ToolExecutor 2개 case 추가로 완성
- ✅ **Forward Compatibility**: v3.26.6 구조 그대로 사용으로 향후 머징 용이  
- ✅ **코드 중복 제거**: plan_mode_respond 로직 100% 재사용
- ✅ **안정성**: 검증된 Cline 로직 활용

### **아키텍처 개선**  
- ✅ **Cline 호환성**: 원본 구조 최대 보존
- ✅ **확장성**: 새로운 Caret 모드 쉽게 추가 가능
- ✅ **유지보수성**: 기존 Caret 시스템과 완벽 통합

---

## ⚠️ **위험 요소 및 대응**

### **컴파일 에러 위험**
- **문제**: buildSystemPrompt 시그니처 변경으로 인한 타입 에러
- **대응**: ✅ **이미 수정 완료** - v3.26.6 시그니처로 업데이트

### **기존 Caret 기능 영향**
- **문제**: ToolExecutor 수정으로 기존 동작 영향 가능
- **대응**: plan_mode_respond 로직 완전 복사로 안전성 확보

### **UI 연동 실패**
- **문제**: ButtonConfig나 MessageHandler에서 새 타입 인식 실패
- **대응**: 기존 Caret 시스템의 잘 정의된 인터페이스 활용

---

## 📊 **성공 기준**

### **최소 성공 기준 (MVP)**
- [x] ✅ v3.26.6 머징 및 환경 정리 완료
- [x] ✅ buildSystemPrompt 시그니처 v3.26.6 적용
- [x] ✅ TypeScript Buffer Type 에러 완전 해결
- [x] ✅ Large Extension State 경고 부분 해결 (persona 이미지 디스크 저장)
- [ ] **🚨 CRITICAL** UI 탭 표시 문제 해결
- [ ] **🚨 CRITICAL** AI 모드 인식 문제 해결

### **완전 성공 기준**  
- [x] ✅ 환경 세부사항에 Caret 모드 추가 완료
- [x] ✅ ApiConfigurationSection 조건 로직 수정 완료
- [ ] UI에서 "Chatbot Mode"/"Agent Mode" 탭 실제 표시
- [ ] AI가 "CHATBOT MODE"로 올바르게 인식
- [ ] v3.26.6 Plan Mode의 모든 기능 (스트리밍, 옵션) 활용
- [ ] 기존 Persona, ModeSystem 등 모든 Caret 기능 100% 보존

---

## 🔗 **참고 문서**

### **핵심 가이드**
- **[027 Clean Migration Strategy](./027-clean-migration-strategy.md)**: 전체 마이그레이션 맥락
- **[Merging Strategy Guide](../guides/merging-strategy-guide.md)**: 머징 전략 및 위험 관리
- **[Caret Independent System](../features/caret-independent-system.mdx)**: 독립 시스템 설계 원칙

### **작업 로그**
- **[Next Session Guide](../work-logs/luke/next-session-guide.md)**: 이전 세션 분석 및 계획

### **아키텍처 참조**
- **[Caret Architecture Guide](../development/caret-architecture-and-implementation-guide.mdx)**: 전체 아키텍처 가이드

---

## 🚨 **중요 발견: 기존 완성된 시스템 존재**

### **⚠️ 실수 방지 - 중복 구현 금지**

**중대한 발견**: `@caret-docs\features\caret-independent-system.mdx`에 따르면 이미 **완전한 Agent/Chatbot 시스템이 구현 완료**되어 있습니다!

#### **✅ 기존 완성된 시스템 (Level 1 독립 모듈)**
- **ModeSystemRegistry**: 어댑터 패턴으로 중앙 집중화
- **MessageHandlerFactory**: Factory 패턴으로 완전 분리  
- **JSON 프롬프트 시스템**: 18개 섹션으로 구조화
- **이중 보안 레이어**: 42개 테스트로 검증 완료

#### **✅ 최소 수정 달성**
- **Cline 파일 수정**: 단 **5개 핵심 파일**
- **수정 라인**: 총 **13라인 이하**
- **아키텍처**: **Level 1 독립 모듈** 등급

### **🚫 실수한 중복 작업들 (즉시 되돌리기)**

1. **ToolExecutor에 case 추가**: ❌ **불필요** - MessageHandlerFactory가 처리
2. **ExtensionMessage 타입 추가**: ❌ **불필요** - 이미 chatbot_mode_respond 존재  
3. **ButtonConfig 수정**: ❌ **불필요** - ButtonConfigFactory가 처리

### **✅ 올바른 다음 작업**

**기존 완성된 시스템의 v3.26.6 적용**만 필요:

```bash
# 1. 기존 시스템 컴파일 에러 해결
npm run compile  # buildSystemPrompt 시그니처 이미 수정됨

# 2. 기존 시스템 동작 테스트
# F5 디버그 → Agent/Chatbot 모드 확인

# 3. 문서 정리 및 완료
```

### **예상 완료 시간**: ⏱️ **30분** (컴파일 에러 해결만)

---

**✨ v3.26.6 Plan Mode를 직접 활용하여 최소 수정으로 Caret Agent/Chatbot 모드의 연속 대화 기능을 완벽 구현합니다!**

---

**작성**: Claude Code Assistant  
**검토**: 다음 세션에서 실행 예정  
**예상 완료**: 2025-08-29

---

## 🚨 **2025-08-28 19:15 현재 상황 업데이트**

### **✅ 이번 세션 성과**
1. **TypeScript 컴파일 에러 완전 해결** - persona 관련 Buffer ↔ string 타입 불일치 모두 수정
2. **Large Extension State 경고 해결** - persona 이미지를 디스크 저장으로 변경 (1.3MB → 디스크)
3. **환경 세부사항 수정** - Caret 모드 시 "CHATBOT MODE"/"AGENT MODE" 표시 추가
4. **UI 로직 수정** - ApiConfigurationSection 조건 로직 개선 및 디버그 로그 추가

### **🔧 여전히 해결되지 않은 CRITICAL 문제들**

#### **1. UI 탭 표시 문제** 
**현상**: Caret 모드에서도 여전히 "Plan Mode"/"Act Mode" 탭으로 표시됨
**원인 분석**: 
- ApiConfigurationSection 디버그 로그가 전혀 출력되지 않음 → 설정 페이지 미접근 가능성
- 코드 수정 및 빌드는 완료되었으나 실제 렌더링 확인 필요
- `planActSeparateModelsSetting`이 false일 경우 조건 미충족 가능성

#### **2. AI 모드 인식 문제**
**현상**: AI가 여전히 "PLAN MODE"/"ACT MODE"로 인식하고 응답
**원인 분석**:
- 환경 세부사항은 수정했으나 시스템 프롬프트는 여전히 Cline 방식 사용
- CaretSystemPrompt 클래스가 실제로 사용되지 않고 있음
- JSON 프롬프트 시스템이 활성화되지 않음

### **🔍 다음 세션 즉시 행동 계획**

#### **Step 1: UI 문제 진단 (10분)**
1. VSCode 확장 리로드 후 설정 페이지(톱니바퀴) 접근
2. 개발자 도구에서 `localStorage.getItem('caret.modeSystem')` 확인
3. ApiConfigurationSection 디버그 로그 출력 여부 확인

#### **Step 2: 문제별 해결 (1-2시간)**
**UI 문제 해결**:
- 설정 페이지에서 실제 탭 상태 확인
- `planActSeparateModelsSetting` 체크박스 상태 확인
- 필요시 강제 렌더링 로직 추가

**AI 인식 문제 해결**:
- 현재 시스템 프롬프트 소스 파악
- CaretSystemPrompt 실제 사용 연결 또는
- 기존 formatResponse에 Caret 모드 추가

#### **Step 3: 최종 검증 (30분)**
1. UI에서 "Chatbot Mode"/"Agent Mode" 탭 표시 확인
2. AI에게 "현재 어떤 모드야?" 질문으로 "CHATBOT MODE" 인식 확인
3. 기존 Caret 기능 회귀 테스트

### **📁 현재까지 수정된 파일들**
```
✅ 수정 완료:
- src/core/storage/state-keys.ts
- src/core/storage/CacheService.ts  
- src/core/task/index.ts
- caret-src/services/persona/persona-storage.ts
- caret-src/services/persona/simple-persona.ts
- webview-ui/src/components/settings/sections/ApiConfigurationSection.tsx
- 모든 persona 관련 controller, test 파일들

✅ 빌드 완료:
- npm run compile ✅
- npm run build:webview ✅
```

### **⚠️ 핵심 이슈**
**UI 탭이 바뀌지 않는 이유**:
1. 설정 페이지 미접근 (가장 가능성 높음)
2. localStorage 상태 불일치  
3. 조건 로직 미작동

**AI 모드 인식이 안 되는 이유**:
1. 환경 세부사항 vs 시스템 프롬프트 불일치
2. CaretSystemPrompt 미사용
3. formatResponse 기본 로직 사용

---

**다음 세션 첫 번째 명령어**:
```javascript
// 브라우저 개발자 도구에서 실행
localStorage.getItem('caret.modeSystem')  // "caret" 확인
```