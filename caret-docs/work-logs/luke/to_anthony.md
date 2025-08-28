# Luke → Anthony 인수인계 문서 (2025-08-25)

## 🎯 Anthony 미션: PRD 자동생성 기능 개발

**목표**: Agent 모드에서 사용자와 질의응답을 통해 프로젝트 PRD를 자동 생성하는 신규 기능

## 🚧 현재 상황

**문제**: Agent 모드 대화 기능이 완전히 작동하지 않음  
**대책**: Anthony님이 **병렬 작업**으로 PRD 기능을 개발하면서, Luke가 Agent 모드 수정 완료 시 통합

## 📋 Caret 도구 및 아키텍처 가이드

### 1. 핵심 아키텍처 이해

#### A. Mode System (모드 시스템)
```typescript
// 위치: caret-src/core/mode-system/ModeSystemRegistry.ts
export class ModeSystemRegistry {
    // Caret은 "caret" 시스템, Cline은 "cline" 시스템
    getAdapter(modeSystem: "caret" | "cline"): ModeSystemAdapter
    
    // 시스템 프롬프트 생성 (PRD 기능에서 중요!)
    async buildSystemPrompt(modeSystem: string, mode: string, context: any): Promise<string>
}
```

**PRD 활용법**: 시스템 프롬프트에 PRD 생성 로직 추가 가능

#### B. Message Handler System (메시지 처리)
```typescript
// 위치: caret-src/core/messaging/CaretMessageHandler.ts
export class CaretMessageHandler implements MessageHandlerInterface {
    async handleSendMessage(
        text: string,
        images: string[],
        files: string[],
        taskServiceClient: any,
        clineAsk?: string,
        messagesLength?: number
    ): Promise<void>
}
```

**PRD 활용법**: 사용자 메시지에서 PRD 생성 트리거 감지

### 2. JSON 기반 프롬프트 시스템 (🔥 핵심!)

#### A. JSON 섹션 구조
```typescript
// 위치: caret-src/core/prompts/JsonSectionAssembler.ts
export class JsonSectionAssembler {
    async assemblePureCaretPrompt(mode: string, context: any): Promise<string> {
        // JSON 파일들을 조합해서 시스템 프롬프트 생성
    }
}
```

#### B. JSON 파일 위치
```
caret-src/core/prompts/sections/
├── MODES_EXPLANATION.json      # 모드 설명
├── TOOL_DEFINITIONS.json       # 도구 정의  
├── RESPONSES.json              # 응답 형식
└── [새로 추가] PRD_GENERATION.json  # PRD 생성 로직
```

**PRD 구현 방법**:
```json
// caret-src/core/prompts/sections/PRD_GENERATION.json
{
  "section_name": "PRD_GENERATION",
  "content": {
    "trigger": "When user requests PRD generation or project planning",
    "process": [
      "1. Ask about project vision and goals",
      "2. Inquire about target users and use cases", 
      "3. Discuss technical requirements and constraints",
      "4. Generate structured PRD document"
    ],
    "output_format": "Structured PRD with sections: Vision, Users, Features, Requirements"
  }
}
```

### 3. 도구 시스템 (Tools)

#### A. 기존 도구 활용
```typescript
// 위치: src/core/task/ToolExecutor.ts
// PRD 생성에 활용 가능한 도구들:

- read_file: 기존 문서 읽기
- write_file: PRD 문서 작성
- list_files: 프로젝트 구조 파악
- search_files: 관련 파일 검색
```

#### B. 새 도구 추가 방법
```typescript
// 1. 도구 정의 (JSON)
// caret-src/core/prompts/sections/TOOL_DEFINITIONS.json에 추가:
{
  "prd_generator": {
    "description": "Generate PRD through interactive Q&A",
    "parameters": {
      "stage": "inquiry|generation|review",
      "data": "collected information"
    }
  }
}

// 2. 도구 실행 로직
// src/core/task/ToolExecutor.ts에 케이스 추가:
case "prd_generator": {
    // PRD 생성 로직 구현
    const stage = block.params.stage;
    const data = block.params.data;
    // 질의응답 또는 PRD 생성 처리
}
```

### 4. 상태 관리 및 대화 흐름

#### A. Task 상태 관리
```typescript
// 위치: src/core/task/index.ts (Task 클래스)
export class Task {
    // PRD 생성 상태를 저장할 수 있는 필드들
    private prdGenerationState?: {
        currentStage: string;
        collectedData: any;
        questions: string[];
    }
}
```

#### B. clineAsk 패턴 활용
```typescript
// PRD 생성 중 사용자 입력 대기
await this.ask("prd_generation", JSON.stringify({
    question: "프로젝트의 주요 목표는 무엇인가요?",
    stage: "goal_inquiry",
    progress: "1/5"
}))
```

## 🛠️ PRD 기능 개발 가이드

### Phase 1: JSON 기반 프롬프트 추가 (1시간)

```bash
# 1. PRD 섹션 파일 생성
touch caret-src/core/prompts/sections/PRD_GENERATION.json

# 2. TOOL_DEFINITIONS.json에 prd_generator 도구 추가

# 3. JsonSectionAssembler.ts에서 PRD 섹션 로드 확인
```

### Phase 2: 도구 실행 로직 구현 (2시간)

```typescript
// src/core/task/ToolExecutor.ts에 추가:
case "prd_generator": {
    const stage = block.params.stage || "start";
    
    switch(stage) {
        case "start":
            return await this.startPrdGeneration();
        case "collect":
            return await this.collectPrdData(block.params);
        case "generate":
            return await this.generatePrdDocument(block.params);
    }
}

private async startPrdGeneration() {
    const questions = [
        "프로젝트의 비전과 목표는 무엇인가요?",
        "주요 타겟 사용자는 누구인가요?",
        "핵심 기능은 무엇인가요?",
        "기술적 제약사항이 있나요?"
    ];
    
    await this.ask("prd_generation", JSON.stringify({
        type: "question",
        question: questions[0],
        progress: "1/" + questions.length
    }));
}
```

### Phase 3: 테스트 환경 구축 (30분)

```typescript
// caret-src/core/prompts/__tests__/PRDGeneration.test.ts
describe("PRD Generation", () => {
    it("should trigger PRD generation from user request", async () => {
        // 테스트 로직
    });
    
    it("should collect user requirements through Q&A", async () => {
        // 질의응답 플로우 테스트
    });
    
    it("should generate structured PRD document", async () => {
        // PRD 문서 생성 테스트
    });
});
```

## 🚀 빠른 프로토타입 방법

### 1. 기존 chatbot_mode_respond 활용
Agent 모드가 수정되기 전까지 **Chatbot 모드**에서 PRD 기능 테스트:

```typescript
// Chatbot 모드는 현재 작동하므로 PRD 프로토타입 가능
// 시스템 프롬프트에 PRD 생성 로직 추가하여 테스트
```

### 2. 독립적 PRD 도구 개발
```typescript
// 별도 명령어로 PRD 생성 가능하게
// 예: "PRD 생성해줘" → prd_generator 도구 실행
```

## 📁 핵심 파일 위치 정리

### 개발 대상 파일
```
caret-src/core/prompts/sections/PRD_GENERATION.json          # 새로 생성
caret-src/core/prompts/sections/TOOL_DEFINITIONS.json       # 수정
src/core/task/ToolExecutor.ts                               # 수정 (prd_generator 케이스 추가)
caret-src/core/prompts/__tests__/PRDGeneration.test.ts      # 새로 생성
```

### 참고 파일
```
caret-src/core/prompts/JsonSectionAssembler.ts              # JSON 로딩 방식 참고
caret-src/core/messaging/CaretMessageHandler.ts             # 메시지 처리 방식 참고
src/core/task/index.ts                                      # Task 상태 관리 참고
```

## 🧪 테스트 방법

```bash
# 1. JSON 프롬프트 테스트
npx vitest run caret-src/core/prompts/__tests__/

# 2. 도구 실행 테스트  
npx vitest run src/core/task/__tests__/

# 3. 통합 테스트 (Agent 모드 수정 후)
# VSCode F5로 Extension Development Host 실행
# "PRD 생성해줘" 메시지로 테스트
```

## 🎨 **UI 상호작용 시스템 (PRD 기능 필수 지식)**

### 버튼 시스템 완전 가이드
**문서 위치**: `caret-docs/development/button-system-architecture-guide.md`

PRD 자동생성 기능에서 **질문-응답 UI**를 구현할 때 필수적인 지식:

#### A. ActionButtons (전역 액션 버튼)
```typescript
// 위치: webview-ui/src/components/chat/chat-view/shared/buttonConfig.ts
// PRD 단계별 진행 시 활용
BUTTON_CONFIGS.chatbot_mode_respond: {
    primaryText: "Continue PRD",
    secondaryText: "Start Over",
    primaryAction: "proceed",
    secondaryAction: "new_task"
}
```

#### B. ChatRow 인터랙션 버튼들
```typescript
// 위치: webview-ui/src/components/chat/OptionsButtons.tsx
// PRD 질문에 대한 선택지 제공 시 사용
<OptionsButtons 
    options={["웹 애플리케이션", "모바일 앱", "데스크톱 소프트웨어"]}
    selected={selectedOption}
    isActive={true}
/>
```

#### C. PRD 기능에서 활용 가능한 패턴
1. **질문-응답 시퀀스**: `OptionsButtons` 패턴
2. **단계별 진행**: `ButtonConfig` 동적 변경
3. **텍스트 인용**: `QuoteButton` 패턴
4. **피드백 수집**: `TaskFeedbackButtons` 응용

**⚡ 중요**: 이 버튼 시스템을 이해해야 PRD 기능의 사용자 경험을 올바르게 구현할 수 있음!

## 🔥 중요한 Caret 특화 지식

### 1. Caret vs Cline 차이점 이해
```typescript
// Caret의 핵심 차별점: JSON 기반 동적 프롬프트
// Cline: TypeScript 하드코딩 방식
// Caret: JSON 파일로 프롬프트 구성 → 유연성과 확장성

// PRD 기능도 이 철학에 맞춰 JSON으로 구성해야 함!
```

### 2. 시스템 프롬프트 생성 플로우
```typescript
// 1. JsonTemplateLoader가 JSON 파일들 로드
// 2. JsonSectionAssembler가 섹션들을 조합
// 3. CaretModeAdapter.buildSystemPrompt()에서 최종 프롬프트 생성

// PRD_GENERATION.json → TOOL_DEFINITIONS.json 연동 중요!
```

### 3. 실제 사용자 워크플로우 시뮬레이션
```
사용자: "새 프로젝트 PRD 만들어줘"
→ AI: prd_generator 도구 실행 (stage: "start")
→ AI: "프로젝트 비전은 무엇인가요?" (질문 1/5)
→ 사용자: "사용자 맞춤형 AI 챗봇 서비스"
→ AI: prd_generator 도구 실행 (stage: "collect", data: {vision: "..."})
→ AI: "주요 타겟 사용자는?" (질문 2/5)
...
→ AI: prd_generator 도구 실행 (stage: "generate")
→ AI: write_file로 PRD 문서 생성
```

### 4. Caret 로깅 패턴 준수
```typescript
// Caret 스타일 로깅 (기존 코드 패턴 따르기)
console.log("[PRD-Generator] Starting PRD generation process")
console.log("[PRD-Generator] Collected data:", JSON.stringify(collectedData))
console.log("[PRD-Generator] Generated PRD document:", filePath)
```

### 5. JSON 섹션 구조 설계 원칙
```json
{
  "section_name": "PRD_GENERATION",
  "version": "1.0",
  "content": {
    "description": "Interactive PRD generation through structured Q&A",
    "workflow": {
      "stages": ["inquiry", "collection", "generation", "review"],
      "questions": {
        "vision": "What is your project's vision and main goals?",
        "users": "Who are your target users?",
        "features": "What are the core features?",
        "constraints": "Any technical constraints or requirements?"
      }
    },
    "output_format": {
      "sections": ["Executive Summary", "Vision", "Target Users", "Features", "Requirements", "Success Metrics"]
    }
  }
}
```

### 6. Agent 모드 수정 대기 중 개발 전략
```typescript
// 현재 Chatbot 모드에서 개발 시작
// CaretModeAdapter.buildSystemPrompt()에서 mode === "plan"일 때 PRD 로직 추가
// Agent 모드 수정 완료 후 mode === "act"에도 동일 로직 적용

if (mode === "plan") {  // 현재 작동하는 Chatbot 모드
    const prdSection = await templateLoader.loadSection("PRD_GENERATION");
    // PRD 로직 추가
}
```

### 7. 실전 디버깅 가이드
```typescript
// 1. JSON 로딩 확인
console.log("[PRD-DEBUG] JsonTemplateLoader sections:", await templateLoader.getAllSections());

// 2. 시스템 프롬프트 생성 확인  
console.log("[PRD-DEBUG] Generated system prompt contains PRD:", systemPrompt.includes("prd_generator"));

// 3. 도구 실행 추적
console.log("[PRD-TOOL] Tool executed:", toolName, "Stage:", stage, "Success:", success);

// 4. 사용자 입력 수집 확인
console.log("[PRD-COLLECT] User response:", userInput, "Progress:", currentStage);
```

## 💡 추가 개발 팁

### JSON 섹션 디버깅
```typescript
// JsonSectionAssembler.ts에서 로그 확인
console.log("[PRD-DEBUG] Loaded sections:", loadedSections);
```

### 도구 실행 디버깅  
```typescript  
// ToolExecutor.ts에서 PRD 케이스 디버깅
console.log("[PRD-TOOL] Stage:", stage, "Params:", block.params);
```

## 🎯 Luke가 tonight 해결할 Agent 문제 (참고용)

**문제**: `CaretMessageHandler.isNewConversation()` 로직 오류
```typescript
// 현재 문제 (caret-src/core/messaging/CaretMessageHandler.ts:120-131)
private isNewConversation(messagesLength?: number): boolean {
    if (messagesLength !== undefined) {
        return messagesLength === 0  // 이 로직이 문제
    }
    // 기존 대화도 새 대화로 잘못 판단
}

// Luke가 수정할 방향
private isNewConversation(messagesLength?: number, clineAsk?: string): boolean {
    // clineAsk 상태도 고려하거나
    // controller.task 존재 여부도 확인
    // ClineMessageHandler 방식 차용
}
```

**Anthony는 이 문제와 무관하게 PRD 기능 개발 가능!** ✅

---

## 📞 개발 중 막힐 때

### 🔍 자주 발생할 수 있는 이슈들

1. **JSON 파일 로딩 실패**
   - 파일 경로 확인: `caret-src/core/prompts/sections/`
   - JSON 문법 검증: `JSON.parse()` 테스트

2. **도구 실행이 안됨**
   - TOOL_DEFINITIONS.json에 prd_generator 정의 확인
   - ToolExecutor.ts의 case문 추가 확인

3. **시스템 프롬프트에 PRD 로직이 안 나타남**
   - JsonSectionAssembler.ts에서 PRD_GENERATION 섹션 로딩 확인
   - CaretModeAdapter.buildSystemPrompt()에서 섹션 조합 확인

### 🚨 긴급 시 우회 방법
PRD 기능이 복잡하면 **단계적 접근**:
1. 먼저 간단한 질문 1개만 (프로젝트 이름)
2. 작동 확인 후 점진적 확장
3. 최종적으로 5-7개 질문으로 완전한 PRD 생성

---

**Anthony님, 이제 완벽한 지식과 방법론을 갖추셨습니다! 🚀**

**Caret의 JSON 기반 철학을 활용한 혁신적인 PRD 자동생성 기능을 만들어보세요!**

**Luke는 밤에 Agent 모드를 고치고, 두 작업이 만나면 완벽한 시너지가 될 것입니다! 🎉**