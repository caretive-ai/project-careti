# Task #005-2: Claude 전용 프롬프트 JSON 변환

**프로젝트**: Caret  
**담당자**: luke  
**우선순위**: 🔥 **Critical - Claude 사용자 최적화**  
**예상 시간**: 4-5시간  
**상태**: 📋 **계획됨**  
**의존성**: 

## 📋 **프로젝트 개요**

Claude 4 전용 프롬프트 파일들을 JSON 시스템으로 변환하여 Claude 4 사용자에게 system.ts급 최적화 효과를 제공합니다.

## 🎯 **목표**

### **Primary Goal**
Claude 4 사용자 대상 90%+ 토큰 절약 달성 (투두리스트급 효과)

### **Secondary Goals**
1. **누적 효과 극대화**: 매 API 호출마다 적용되는 최적화
2. **고비용 모델 효율화**: Claude 4 Opus/Sonnet 비용 절감
3. **아키텍처 일관성**: system.ts 패턴과 동일한 구조 유지

## 📊 **변환 대상**

### **🔥 Priority 1: claude4.ts (최고 효과)**
```typescript
현황:
├── 크기: 53,388글자 (13,347토큰)
├── 사용: Claude 4 모델 매 API 호출
├── 구조: system.ts와 동일한 반복 패턴
└── 예상 절약: 90-95% (투두리스트급)

변환 계획:
├── CaretClaude4Prompt.ts 클래스 개발
├── JSON 템플릿 15-20개 분할
├── 조건부 렌더링 (browser, MCP 등)
└── 동적 매개변수 처리 (cwd, viewport 등)
```

### **🎯 Priority 2: claude4-experimental.ts**
```typescript
현황:
├── 크기: 31,144글자 (7,786토큰)  
├── 사용: Claude 4 Experimental 매 API 호출
└── 예상 절약: 85-90%

변환 계획:
├── CaretClaude4ExperimentalPrompt.ts 클래스
├── Experimental 기능별 JSON 분할
└── claude4.ts와 공통 템플릿 재사용
```

## 🔧 **기술 설계**

### **Phase 1: claude4.ts JSON 변환 (3시간)**
```typescript
// 현재: src/core/prompts/model_prompts/claude4.ts (715줄)
export const SYSTEM_PROMPT_CLAUDE4 = async (...) => {
  return `You are Cline, a highly skilled...
    // 13,347 토큰의 거대한 프롬프트
  `
}

// 목표: 하이브리드 시스템
export const SYSTEM_PROMPT_CLAUDE4 = async (
  cwd: string,
  supportsBrowserUse: boolean, 
  mcpHub: McpHub,
  browserSettings: BrowserSettings,
  extensionPath?: string // CARET 확장
) => {
  if (extensionPath) {
    // Caret JSON 시스템 사용
    const caretClaude4 = new CaretClaude4Prompt(extensionPath)
    return await caretClaude4.generatePrompt(cwd, supportsBrowserUse, mcpHub, browserSettings)
  }
  
  // 원본 Cline 프롬프트 보존
  return originalClaude4Prompt(cwd, supportsBrowserUse, mcpHub, browserSettings)
}
```

### **Phase 2: claude4-experimental.ts 변환 (1.5시간)**
```typescript
📁 구현 파일들:
├── caret-src/core/prompts/CaretClaude4Prompt.ts
├── caret-src/core/prompts/CaretClaude4ExperimentalPrompt.ts
├── caret-src/core/prompts/sections/claude4/ (JSON 템플릿들)
│   ├── CLAUDE4_BASE_IDENTITY.json
│   ├── CLAUDE4_TOOL_DEFINITIONS.json
│   ├── CLAUDE4_BROWSER_TOOLS.json (조건부)
│   ├── CLAUDE4_MCP_TOOLS.json (조건부)
│   └── CLAUDE4_INSTRUCTIONS.json
└── caret-src/core/prompts/sections/claude4-experimental/
    ├── EXPERIMENTAL_FEATURES.json
    ├── EXPERIMENTAL_TOOLS.json
    └── ... (claude4 템플릿 상속)
```

### **Phase 3: 통합 & 테스트 (0.5시간)**
```typescript
📁 테스트 & 검증:
├── caret-src/__tests__/005-2-claude4-conversion.test.ts
├── 토큰 절약 효과 측정
├── Claude 4 모델별 동작 검증
└── 기존 기능 호환성 확인
```

## 🔄 **변환 과정**

### **Step 1: 백업 생성**
```bash
cp src/core/prompts/model_prompts/claude4.ts src/core/prompts/model_prompts/claude4.ts.cline
cp src/core/prompts/model_prompts/claude4-experimental.ts src/core/prompts/model_prompts/claude4-experimental.ts.cline
```

### **Step 2: JSON 템플릿 분할**
- 도구 정의 블록들을 개별 JSON으로 분리
- 조건부 컨텐츠 (browser, MCP) 별도 템플릿화
- 동적 매개변수 플레이스홀더 적용

### **Step 3: 하이브리드 래퍼 구현**
- extensionPath 유무로 Cline/Caret 모드 분기
- 원본 함수 시그니처 완전 유지
- 오류시 원본 프롬프트로 안전한 fallback

## 📋 **체크리스트**

### **Phase 1: claude4.ts 변환**
- [ ] 백업 파일 생성 (claude4.ts.cline)
- [ ] JSON 템플릿 15-20개 분할 작성
- [ ] CaretClaude4Prompt.ts 클래스 구현
- [ ] 하이브리드 래퍼 패턴 적용
- [ ] 조건부 렌더링 (browser, MCP) 구현

### **Phase 2: claude4-experimental.ts 변환**
- [ ] 백업 파일 생성 (claude4-experimental.ts.cline)
- [ ] Experimental 전용 JSON 템플릿
- [ ] CaretClaude4ExperimentalPrompt.ts 구현
- [ ] claude4.ts 템플릿 재사용 최적화

### **Phase 3: 테스트 & 검증**
- [ ] TDD 테스트 완성 (100% 커버리지)
- [ ] 토큰 절약 효과 실측 (90%+ 목표)
- [ ] Claude 4 모델별 동작 검증
- [ ] 기존 Cline 기능 호환성 확인
- [ ] 에러 핸들링 및 fallback 테스트

## 🎯 **성공 기준**

1. **토큰 효율성**: claude4.ts 90%+ 절약 달성
2. **호환성**: 기존 Claude 4 사용자 100% 호환
3. **안정성**: fallback 시스템으로 0% 다운타임
4. **성능**: JSON 생성 1ms 이하 (캐싱 활용)

## 💡 **핵심 전략**

### **🔥 system.ts 성공 패턴 완전 재활용**
- 검증된 JsonSectionAssembler 활용
- 동일한 캐싱 및 오류 처리 로직
- 백업 보호 및 점진적 배포

### **🎯 Claude 4 특화 최적화**
- 고비용 모델 특성상 ROI 극대화
- JSON 오버헤드 < 실제 절약 효과 확실
- 소수 사용자 대상 집중 최적화 가능

### **⚡ 점진적 배포 전략**
1. claude4.ts 먼저 변환 (더 높은 사용률)
2. 효과 검증 후 claude4-experimental.ts 진행
3. 사용자 피드백 기반 추가 최적화 