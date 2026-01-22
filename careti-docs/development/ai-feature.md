# AI 기능 - AI 통합 개발 워크플로우

> **⚠️ 주의: 개념적 가이드**
> 이 문서는 AI 관련 기능을 개발할 때 따라야 할 **방법론과 워크플로우**를 설명합니다. 여기에 포함된 코드 예제(`AIPersonaFeature` 등)는 실제 코드베이스에 존재하지 않는 **개념적 예시**이며, 아이디어를 전달하기 위한 목적으로 사용되었습니다. 실제 구현 시에는 이 문서의 원칙을 바탕으로 프로젝트의 기존 코드 구조(예: `Task` 클래스)에 맞게 적용해야 합니다.

적절한 메시지 흐름과 테스트를 통해 AI 관련 기능을 구현합니다.

## 사용되는 원자적 컴포넌트
- `/message-flow` - 프론트엔드 ↔ 백엔드 ↔ AI 통신 패턴
- `/tdd-cycle` - 통합 우선 테스트 방법론
- `/verification-steps` - 전체 시스템 검증
- `/storage-patterns` - AI 컨텍스트 및 설정 지속성

## 개발 전 단계

### 1단계: AI 기능 아키텍처
**AI 통합 지점 정의:**
- [ ] 이 기능은 어떤 AI 서비스를 사용합니까? (Claude, GPT, 로컬 모델)
- [ ] 기존 AI 컨텍스트와 어떻게 통합됩니까?
- [ ] 어떤 사용자 상호작용이 AI 요청을 트리거합니까?
- [ ] AI 응답은 어떻게 처리되고 표시됩니까?
- [ ] 대화 간에 어떤 컨텍스트가 지속되어야 합니까?

### 2단계: 메시지 흐름 설계 (`/message-flow`)
```typescript
// AI 기능에 대한 메시지 타입 정의
interface AIFeatureMessages {
  // 프론트엔드 → 백엔드
  'ai-feature-request': {
    userInput: string;
    context: FeatureContext;
    settings: FeatureSettings;
  };
  
  // 백엔드 → 프론트엔드
  'ai-feature-response': {
    aiOutput: string;
    updatedContext: FeatureContext;
    status: 'success' | 'error' | 'partial';
  };
  
  // 백엔드 → AI 서비스
  'ai-service-query': {
    systemPrompt: string;
    userQuery: string;
    conversationContext: AIContext;
  };
}
```

## TDD 구현 단계

### 3단계: RED - AI 통합 테스트 (`/tdd-cycle`)
**전체 AI 상호작용 흐름에 대한 통합 테스트 작성:**

```typescript
describe('AI 페르소나 기능 통합', () => {
  it('페르소나 컨텍스트를 사용하여 AI를 통해 사용자 입력을 처리하고 형식화된 응답을 반환해야 합니다', async () => {
    // 설정: 사용자가 창의적 페르소나를 선택함
    const mockContext = createMockExtensionContext();
    await mockContext.workspaceState.update('selectedPersona', 'creative');
    
    const aiFeature = new AIPersonaFeature(mockContext);
    
    // 사용자 상호작용: AI에게 질문
    const userInput = "창의적인 이야기를 쓰는 것을 도와주세요";
    const response = await aiFeature.processUserRequest(userInput);
    
    // 예상 AI 통합 흐름:
    expect(mockAIService.query).toHaveBeenCalledWith({
      systemPrompt: expect.stringContaining('창의적 페르소나'),
      userQuery: userInput,
      conversationContext: expect.objectContaining({
        persona: 'creative'
      })
    });
    
    // 예상 출력 형식
    expect(response.content).toBeDefined();
    expect(response.persona).toBe('creative');
    expect(response.formatted).toBe(true);
  });
});
```

### 4단계: GREEN - AI 서비스 통합
**적절한 메시지 흐름으로 AI 서비스 통합 구현:**

```typescript
export class AIPersonaFeature {
  constructor(
    private context: vscode.ExtensionContext,
    private aiService: AIService,
    private messageHandler: MessageHandler
  ) {}
  
  async processUserRequest(userInput: string): Promise<AIResponse> {
    // 스토리지 패턴 적용 - 페르소나 컨텍스트 가져오기
    const selectedPersona = this.getSelectedPersona(); // 작업 공간별
    const userPreferences = this.getUserPreferences(); // 전역 설정
    
    // 페르소나로 AI 컨텍스트 구축
    const aiContext = this.buildAIContext(selectedPersona, userPreferences);
    
    // 컨텍스트로 AI 서비스 쿼리
    const aiResponse = await this.aiService.query({
      systemPrompt: this.buildPersonaPrompt(selectedPersona),
      userQuery: userInput,
      conversationContext: aiContext
    });
    
    // 응답 처리 및 형식화
    const formattedResponse = this.formatAIResponse(aiResponse, selectedPersona);
    
    // 대화 컨텍스트 업데이트 (작업 공간 스토리지)
    await this.updateConversationHistory(userInput, formattedResponse);
    
    return formattedResponse;
  }
  
  private getSelectedPersona(): string {
    return this.context.workspaceState.get('selectedPersona', 'default');
  }
  
  private getUserPreferences(): UserPreferences {
    return this.context.globalState.get('userPreferences', defaultPreferences);
  }
}
```

### 5단계: 프론트엔드 통합 (`/message-flow`)
**적절한 메시지 처리로 프론트엔드 컴포넌트 구현:**

```typescript
const AIPersonaChat: React.FC = () => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage, onMessage } = useExtensionMessage();
  
  // AI 응답 처리
  useEffect(() => {
    const handleAIResponse = (message: ExtensionMessage) => {
      if (message.type === 'ai-feature-response') {
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: message.payload.aiOutput,
          persona: message.payload.context.persona
        }]);
        setIsLoading(false);
      }
    };
    
    onMessage(handleAIResponse);
  }, [onMessage]);
  
  const handleUserInput = async (input: string) => {
    setIsLoading(true);
    setConversation(prev => [...prev, { role: 'user', content: input }]);
    
    // 백엔드 AI 기능으로 전송
    sendMessage({
      type: 'ai-feature-request',
      payload: {
        userInput: input,
        context: getConversationContext(),
        settings: getUserSettings()
      },
      requestId: generateRequestId()
    });
  };
  
  return (
    <div className="ai-persona-chat">
      <ConversationView messages={conversation} />
      <UserInput onSubmit={handleUserInput} disabled={isLoading} />
    </div>
  );
};
```

### 6단계: REFACTOR - AI 성능 및 오류 처리
```typescript
// 적절한 오류 처리 및 성능 최적화 추가
class AIPersonaFeature {
  async processUserRequest(userInput: string): Promise<AIResponse> {
    try {
      // 속도 제한
      await this.rateLimiter.checkLimit();
      
      // 컨텍스트 최적화 - 대화 기록 크기 제한
      const optimizedContext = this.optimizeContext(this.getConversationHistory());
      
      // 타임아웃 및 재시도를 사용한 AI 쿼리
      const aiResponse = await this.aiService.queryWithRetry({
        systemPrompt: this.buildPersonaPrompt(selectedPersona),
        userQuery: userInput,  
        conversationContext: optimizedContext,
        timeout: 30000
      });
      
      return this.formatAIResponse(aiResponse);
      
    } catch (error) {
      this.logger.error('AI 기능 요청 실패', { error, userInput });
      return this.createErrorResponse(error);
    }
  }
}
```

## 구현 후 단계

### 7단계: AI 기능 검증 (`/verification-steps`)
```bash
# AI 통합 종단 간 테스트
npm run test:webview  # 프론트엔드 컴포넌트 테스트
# npm run test:unit / npm run test:integration  # AI 관련 단위/통합 테스트(있는 범위 내)

# 컴파일 검증
npm run compile
npm run check-types

# 실시간 테스트
npm run watch  # F5로 전체 AI 상호작용 흐름 테스트
```

### 8단계: AI 성능 검증
- [ ] AI 응답이 UI에 올바르게 렌더링됨
- [ ] 대화 컨텍스트가 올바르게 지속됨
- [ ] 오류 상태가 정상적으로 처리됨
- [ ] 속도 제한이 올바르게 작동함
- [ ] 긴 대화 중 메모리 사용량이 안정적임
- [ ] AI 서비스 통합이 API 실패에 강건함

## 관련 워크플로우
- 대화 및 컨텍스트 지속성을 위해 `/storage-patterns` 사용
- 복잡한 AI 통합 결정에 `/critical-verification` 적용
- AI 관련 UI 컴포넌트 생성 시 `/new-component` 고려
- AI 시스템 통합 지점에 `/cline-modification`을 드물게 사용
