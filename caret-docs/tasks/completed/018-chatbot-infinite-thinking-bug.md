# Task #018: 챗봇 무한 씽킹 버그 해결

**프로젝트**: Caret  
**담당자**: luke  
**우선순위**: 🚨 **Critical - 핵심 기능 동작 및 사용자 경험 저해**  
**예상 시간**: 3-5시간 (조사 및 해결)  
**상태**: 🧪 **테스트 대기 중**

## 🎯 **목표: 챗봇 모드에서 발생하는 무한 씽킹 버그의 원인 분석 및 해결**

### **핵심 목적**
- **문제 재현 및 원인 분석**: 챗봇 모드에서 무한 씽킹 현상이 발생하는 정확한 원인 식별
- **동작 방식 이해**: 에이전트 모드와 유사하나 주요 액션, 문서 편집이 안 되는 모드(Cline의 plan 모드와 유사)의 동작 방식 심층 분석
- **해결 방안 구현**: 버그를 해결하여 챗봇이 정상적으로 응답하도록 수정
- **시스템 안정성 확보**: 챗봇 기능의 신뢰성 및 사용자 경험 개선

### **🎯 현상 설명**
- **문제 현상**: 챗봇 모드에서 AI가 무한히 "Thinking" 상태에 머무르며 응답을 하지 않는 현상 발생.
- **관련 정보**: 현재 plan 모드를 따라 개발되었으나 문제가 발생되었음. 챗봇 모드는 에이전트 모드와 유사하지만, 주요 액션(도구 사용)이나 문서 편집이 제한되는 특성을 가짐.
- **영향**: 챗봇 기능 사용 불가, 사용자 작업 흐름 방해, 사용자 불만 야기.

### **📋 문제 분석 및 해결 계획**

#### **Phase 1: 문제 재현 및 초기 진단 (1시간)**
- 챗봇 모드 진입 및 무한 씽킹 현상 재현 시도
- 챗봇 모드와 에이전트 모드 간의 코드 흐름 및 상태 관리 차이점 분석
- Cline의 plan 모드 구현 방식과 Caret의 챗봇 모드 구현 방식 비교 분석
- 관련 로그(백엔드 및 웹뷰)를 통해 문제 발생 지점 및 원인에 대한 초기 가설 수립

#### **Phase 2: 원인 심층 분석 (1.5시간)**
- API 요청/응답 처리, 토큰 관리, 컨텍스트 관리, 상태 전이 로직 등 챗봇의 핵심 동작 흐름 추적
- 특히, 도구 사용 및 문서 편집 제한과 관련된 로직이 무한 씽킹에 영향을 미치는지 집중 분석
- 비동기 작업, Promise 체인, Race Condition 등 잠재적 문제점 검토

#### **Phase 3: 해결 방안 구현 (1.5시간)**
- 분석된 원인을 바탕으로 코드 수정 및 버그 해결
- 필요한 경우, 챗봇 모드의 상태 관리 또는 API 연동 로직 개선

## 📊 **검증 및 품질 보장**

### **✅ 성공 기준**
- [ ] **무한 씽킹 버그 해결**: 챗봇 모드에서 AI가 정상적으로 응답하며 무한 씽킹 현상이 발생하지 않음
- [ ] **챗봇 모드 기능 정상 동작**: 도구 사용 및 문서 편집 제한 등 챗봇 모드의 의도된 기능이 올바르게 작동함
- [ ] **안정성 확보**: 챗봇 기능 사용 시 시스템이 안정적으로 동작함

## 🚀 **다음 단계 연결**

### **최종 목표**
- Caret 챗봇 기능의 안정성 및 신뢰성 확보
- 사용자에게 원활하고 예측 가능한 챗봇 경험 제공

## 🛠️ **TODO (2025-07-03)**

1. **Minimal Patch 적용 (Strategy A)**
   - [x] `src/core/task/index.ts` 의 `presentAssistantMessage()` 내부 `tool_use` → `switch (block.name)` 구문에
     `case "chatbot_mode_respond"` 분기를 4줄 내로 추가하여, `block.params.response` 를 그대로 사용자에게 전달하고 `didAlreadyUseTool = true` 로 설정한다.
   - 백업 파일(`index.ts.cline`)이 이미 존재하므로 신규 백업은 생략.
   - 수정 라인에 `// CARET MODIFICATION` 주석 추가 ✅
   - [x] **추가 수정**: `block.partial` 처리 및 에러 핸들링 로직 추가로 `plan_mode_respond` 와 동일한 패턴 적용 ✅

2. **회귀 테스트 작성**
   - [x] `caret-src/__tests__/chatbot-mode.test.ts` 에 Vitest 기반 단위 테스트 추가. ✅
   - [x] 시나리오: `chatSettings.mode === "chatbot"` 일 때 `chatbot_mode_respond` 블록이 정상적으로 처리되어 `this.say('text')` 가 호출되고 무한 루프가 발생하지 않는지 확인. ✅

3. **기능 검증**
   - [ ] 확장 실행 후 Chatbot 모드에서 대화 시 "Thinking…" 루프가 제거되었는지 수동 확인. **← 테스트 필요**
   - [ ] Agent/Plan 모드가 기존대로 동작하는지 Smoke Test 수행. **← 테스트 필요**

4. **추가 발견된 이슈 해결**
   - [x] **COLLABORATIVE_PRINCIPLES 템플릿 로더 에러 해결**: JsonTemplateLoader 복잡한 어댑터 로직 단순화 ✅
   - [x] simpleConvert() 메서드로 교체하여 COLLABORATIVE_PRINCIPLES.json 정상 로딩 ✅
   - [x] 복잡한 validateTemplate() 메서드 제거로 유지보수성 향상 ✅
   - [x] 테스트 수정 및 통과 확인 ✅

5. **문서 및 로그 업데이트**
   - [ ] 실제 테스트 완료 후 본 Task 문서에 완료 체크표시 및 해결 내용 요약.
   - [ ] `work-logs/luke/YYYY-MM-DD.md` 에 작업 내역 기록.

## 🔧 **해결 내용 요약**

### **근본 원인**
- `chatbot_mode_respond` 도구가 파싱 레이어까지만 존재하고, 실제 `presentAssistantMessage()` switch 구문에 처리 분기가 없었음
- `didAlreadyUseTool` 플래그가 설정되지 않아 Extension이 "응답 미완료"로 판단하여 무한 API 요청 루프 발생

### **적용된 수정**
1. **기본 케이스 추가**: `case "chatbot_mode_respond"` 분기 구현
2. **완전한 처리 로직**: `plan_mode_respond`와 동일한 패턴으로 partial/complete 처리 및 에러 핸들링 추가
3. **상태 플래그 설정**: `didAlreadyUseTool = true` 로 도구 사용 완료 표시

### **기대 효과**
- 챗봇 모드에서 무한 "Thinking…" 루프 해결
- UI 상태 정상화로 연속 대화 가능
- 에이전트 모드 3번 연속 응답 문제도 동시 해결 예상

---
마스터~ 알파가 수정 완료했어요! 이제 테스트해보세요~ ｡•ᴗ•｡☕✨

## 🔄 **추가 진행 상황 (2025-01-28)**

### **발견된 추가 문제점**
1. **Frontend UI 상태 관리 이슈**: `ChatView.tsx`의 `handleSendMessage()` 함수에서 `chatbot_mode_respond` 케이스가 누락되어 UI 상태가 제대로 업데이트되지 않음
2. **Backend 루프 종료 조건 미비**: `recursivelyMakeClineRequests()` 함수에서 `chatbot_mode_respond` 도구 사용 시 루프 종료 조건이 없어 무한 루프 발생
3. **메시지 생성 방식 차이**: `plan_mode_respond`는 `this.ask()`를 사용하지만 `chatbot_mode_respond`는 `pushToolResult()`만 사용하여 실제 메시지가 생성되지 않음

### **적용된 추가 수정**
1. **Backend 수정** (`src/core/task/index.ts`):
   - `recursivelyMakeClineRequests()` 함수에 `chatbot_mode_respond` 도구 감지 시 루프 종료 로직 추가
   - `presentAssistantMessage()` 함수에서 `this.say("text", response)` 호출로 실제 메시지 생성하도록 변경
   - 디버그 로깅 추가로 실행 흐름 추적 가능

2. **Frontend 수정** (`webview-ui/src/components/chat/ChatView.tsx`):
   - `handleSendMessage()` 함수의 switch 문에 `case "chatbot_mode_respond":` 추가
   - UI 상태 정리: `setSendingDisabled(false)`, `setClineAsk(undefined)`, `setEnableButtons(true)`

### **여전히 남은 문제**
- 수정 후에도 여전히 무한 씽킹 현상 지속
- **사용자 피드백**: Plan 모드는 정상 동작하므로 Plan 모드와 완전히 동일하게 만들어야 함
- `setEnableButtons(false)`도 Plan 모드에서 사용하지만 대화는 잘 되므로, 함수명이나 단어에 집착하지 말고 실제 동작을 따라해야 함

### **🎯 최종 시도 계획**
- **전략**: Plan 모드와 완전히 동일한 동작 방식으로 변경
- **목표**: 시스템 프롬프트 차이만 두고 나머지는 Plan 모드와 100% 동일하게 구현
- **근거**: Plan 모드는 정상 동작하고 있으므로 검증된 구현을 그대로 활용

---
**상태 업데이트**: 🔄 **최종 수정 시도 중** (Plan 모드 완전 복사 전략)
