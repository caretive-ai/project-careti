# Task 026-2: Model System 최소 업그레이드 계획 ✨

> **Target**: Cline v3.23.0 → Caret v0.1.1  
> **Focus**: Model **정의만** 선택적 업그레이드 (**API 시스템 재구성 제외**)  
> **Deadline**: 026번 메인 작업의 두 번째 단계  

## 🚨 **중요: 범위 제한**

### **❌ 포함되지 않는 작업 (027번으로 이관)**
- **API Provider 구조 대규모 변경** (handler 재구성, interface 변경)  
- **전체 API 시스템 재설계**  
- **복잡한 새 Provider 통합** (설정 변경이 큰 것들)  

### **✅ 026-2번에서만 수행할 작업**
- **새 API Provider 타입 추가** (claude-code, moonshot, groq, huggingface, baseten)  
- **새 Model 정의 추가** (Claude-3.5-Sonnet 최신, GPT-4o 업데이트 등)  
- **기존 api.ts 구조 유지하면서 정의만 확장**  
- **기본값 업데이트** (defaultModelId 등)  

## 📋 **실제 추가할 기능 분석**

### **현재 Caret API 상태** ✅
```typescript
// 이미 잘 작동하는 것들
✅ 기본 Provider들 (anthropic, openai, gemini 등)
✅ 기존 Model 정의들 
✅ API Handler 구조
✅ Provider 선택 UI
```

### **Cline v3.23.0에서 추가할 것들** 🆕
```typescript
// 새로 추가된 API Provider들
+ "claude-code"      // Claude Code 전용
+ "moonshot"         // Moonshot AI
+ "groq"             // Groq 추론 엔진  
+ "huggingface"      // Hugging Face Inference
+ "baseten"          // Baseten 플랫폼
+ "huawei-cloud-maas" // Huawei Cloud

// 새로 추가된 주요 Model들
+ Claude-3.5-Sonnet-20241022 (최신 버전)
+ GPT-4o 업데이트된 정의
+ 새로운 Anthropic, OpenAI 모델들
+ Groq 고속 추론 모델들
+ Hugging Face 오픈소스 모델들
```

## 🎯 **머징 전략: "정의 중심 최소 확장"**

### **핵심 원칙**
1. **기존 구조 완전 유지**: `src/shared/api.ts` 파일 구조 그대로 사용
2. **정의만 선택적 추가**: 새 Provider 타입과 Model 정의만 복사
3. **최소 변경**: 기존 API Handler 로직은 건드리지 않음
4. **점진적 확장**: Provider 타입 추가 → Model 정의 추가 → 기본값 업데이트

### **예상 작업 시간**
- **총 소요 시간**: ~40분 (대폭 단축!)
- **Phase 1 (Provider 타입 추가)**: 15분
- **Phase 2 (Model 정의 추가)**: 20분  
- **Phase 3 (기본값 업데이트)**: 5분

## 🚀 **단계별 머징 계획**

### **Phase 1: API Provider 타입 확장 (15분)**

#### **1-1. ApiProvider 타입에 새 Provider 추가**
```typescript
// src/shared/api.ts에서 기존 타입 확장
export type ApiProvider =
	| "anthropic"
	| "openrouter"
	// ... 기존 Provider들 유지 ...
	| "caret" // 기존 Caret Provider 유지
	| "cline" // 기존 Cline Provider 유지
	// ✨ 새로 추가할 Provider들
	| "claude-code"      // Claude Code 전용
	| "moonshot"         // Moonshot AI
	| "groq"             // Groq 고속 추론
	| "huggingface"      // Hugging Face
	| "baseten"          // Baseten
	| "huawei-cloud-maas" // Huawei Cloud (필요시)
```

#### **1-2. ApiHandlerOptions에 새 설정 추가**
```typescript
// src/shared/api.ts의 ApiHandlerOptions 인터페이스 확장
export interface ApiHandlerOptions {
	// 기존 옵션들 유지...
	caretApiKey?: string // 기존 Caret 키 유지
	clineApiKey?: string // 기존 Cline 키 유지
	
	// ✨ 새로 추가할 설정들 (Cline에서 복사)
	claudeCodePath?: string           // Claude Code 경로
	moonshotApiKey?: string          // Moonshot API 키
	groqApiKey?: string              // Groq API 키
	huggingFaceApiKey?: string       // Hugging Face API 키
	basetenApiKey?: string           // Baseten API 키
	huaweiCloudMaasApiKey?: string   // Huawei Cloud API 키 (필요시)
}
```

### **Phase 2: Model 정의 확장 (20분)**

#### **2-1. 우선순위 높은 새 Model들 추가**
```typescript
// src/shared/api.ts에 새 Model 정의 추가

// ✨ Claude Code Models (Cline에서 복사)
export const claudeCodeModels = {
	"claude-3-5-sonnet-20241022": {
		...anthropicModels["claude-3-5-sonnet-20241022"], // 기존 정의 재사용
		description: "Latest Claude 3.5 Sonnet via Claude Code",
	},
} as const satisfies Record<string, ModelInfo>

// ✨ Moonshot Models (Cline에서 복사)
export const moonshotModels = {
	"moonshot-v1-8k": {
		maxTokens: 8192,
		contextWindow: 8192,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.012,
		outputPrice: 0.012,
		description: "Moonshot v1 8K context model",
	},
	"moonshot-v1-32k": {
		maxTokens: 32768,
		contextWindow: 32768,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.024,
		outputPrice: 0.024,
		description: "Moonshot v1 32K context model",
	},
} as const satisfies Record<string, ModelInfo>

// ✨ Groq Models (고속 추론에 특화)
export const groqModels = {
	"llama-3.1-70b-versatile": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.59,
		outputPrice: 0.79,
		description: "Llama 3.1 70B on Groq (ultra-fast inference)",
	},
	"llama-3.1-8b-instant": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.05,
		outputPrice: 0.08,
		description: "Llama 3.1 8B on Groq (instant response)",
	},
} as const satisfies Record<string, ModelInfo>

// ✨ Hugging Face Models (오픈소스 모델들)
export const huggingFaceModels = {
	"meta-llama/Meta-Llama-3.1-70B-Instruct": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.0006,
		outputPrice: 0.0006,
		description: "Llama 3.1 70B Instruct via Hugging Face",
	},
	"microsoft/DialoGPT-medium": {
		maxTokens: 4096,
		contextWindow: 4096,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.0001,
		outputPrice: 0.0001,
		description: "Microsoft DialoGPT medium",
	},
} as const satisfies Record<string, ModelInfo>
```

#### **2-2. 기존 Model 정의 업데이트**
```typescript
// 기존 anthropicModels에 최신 Claude 추가 (있다면)
export const anthropicModels = {
	// 기존 모델들 유지...
	
	// ✨ 새로 추가된 Claude 모델 (Cline에서 확인 후)
	"claude-3-5-sonnet-20241022": {
		maxTokens: 8192,
		contextWindow: 200000,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 3.0,
		outputPrice: 15.0,
		description: "Latest Claude 3.5 Sonnet (October 2024)",
	},
} as const satisfies Record<string, ModelInfo>

// GPT-4o 정의 업데이트 (가격이나 기능이 변경되었다면)
export const openAiNativeModels = {
	// 기존 모델들 유지...
	"gpt-4o": {
		maxTokens: 16384,  // 업데이트된 값
		contextWindow: 128000,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 2.5,   // 업데이트된 가격
		outputPrice: 10.0,
		description: "Updated GPT-4o with enhanced capabilities",
	},
} as const satisfies Record<string, ModelInfo>
```

### **Phase 3: 기본값 및 타입 업데이트 (5분)**

#### **3-1. 기본 Model ID 업데이트 (필요시)**
```typescript
// 더 나은 기본값으로 업데이트 (Cline 참조)
export const anthropicDefaultModelId: AnthropicModelId = "claude-3-5-sonnet-20241022"
export const groqDefaultModelId = "llama-3.1-70b-versatile"
export const huggingFaceDefaultModelId = "meta-llama/Meta-Llama-3.1-70B-Instruct"
```

#### **3-2. 타입 정의 추가**
```typescript
// 새 Provider용 타입 정의 추가
export type GroqModelId = keyof typeof groqModels
export type HuggingFaceModelId = keyof typeof huggingFaceModels
export type MoonshotModelId = keyof typeof moonshotModels
export type ClaudeCodeModelId = keyof typeof claudeCodeModels
```

## ✅ **완료 기준**

### **필수 조건**
- [ ] **Provider 타입 추가**: claude-code, groq, huggingface, moonshot 등
- [ ] **핵심 Model 추가**: Claude-3.5-Sonnet 최신, Groq 고속 모델 등
- [ ] **기본값 업데이트**: 더 나은 기본 모델로 변경
- [ ] **타입 정의 완료**: 새 Provider용 TypeScript 타입
- [ ] **빌드 성공**: 컴파일 및 타입 체크 통과

### **선택 조건 (시간이 있으면)**
- [ ] **Baseten 모델**: 고급 모델 플랫폼 지원
- [ ] **Huawei Cloud**: 중국 시장용 Provider
- [ ] **가격 정보 업데이트**: 기존 모델들의 최신 가격

## 🚨 **주의사항**

### **하지 말아야 할 것들**
- ❌ **API Handler 구조 변경**: Provider별 handler 로직 수정 금지
- ❌ **설정 UI 대폭 수정**: 기존 Provider 선택 UI 구조 유지
- ❌ **복잡한 인증 로직**: 단순한 API 키 방식만 지원
- ❌ **실험적 Provider**: 안정적이지 않은 Provider 제외

### **해야 할 것들**
- ✅ **정의만 추가**: Model 정보와 타입 정의만 확장
- ✅ **기존 구조 활용**: 현재 api.ts 패턴 그대로 사용
- ✅ **점진적 확장**: 핵심 Provider/Model 우선, 나머지는 추후
- ✅ **Caret 호환성**: 기존 Caret Provider와 충돌 없이

## 📈 **예상 효과**

### **즉시 얻을 수 있는 것들**
- 🚀 **고속 추론**: Groq를 통한 초고속 AI 응답
- 🆓 **오픈소스 모델**: Hugging Face 무료/저가 모델 접근
- 🎯 **전문화된 모델**: Claude Code, Moonshot 등 특화 모델
- 💰 **다양한 가격대**: 저가부터 고성능까지 선택권 확대

### **027번으로 미룰 것들**
- 🔧 **Provider Handler 최적화**: 각 Provider별 특화 로직
- 🎨 **UI 고도화**: Provider별 고급 설정 옵션
- 📊 **사용량 추적**: Provider별 상세 통계
- 🔐 **고급 인증**: OAuth, 다중 키 관리 등

---

**우선순위**: HIGH  
**예상 소요시간**: 40분  
**의존성**: 026-1 Account 완료  
**후속 작업**: 026번 통합 테스트  

**작성자**: Alpha Yang (AI Assistant)  
**검토자**: Luke (Project Owner)  
**작성일**: 2025-08-12  

### **핵심 결정사항**

1. **API 구조 변경 제외**: Handler 로직은 027번으로 미룸
2. **정의만 선택적 추가**: Provider 타입과 Model 정의만 확장
3. **고속 추론 우선**: Groq 같은 실용적 Provider 우선 구현
4. **점진적 확장**: 핵심 기능부터 구현, 나머지는 단계적으로

이 계획을 통해 026번은 **40분 내에 완료**할 수 있으면서도 Caret의 AI 모델 지원을 크게 확장할 수 있습니다~ ✨