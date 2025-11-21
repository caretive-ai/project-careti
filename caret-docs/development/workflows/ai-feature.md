적절한 메시지 플로우와 테스팅으로 AI 관련 기능을 구현하고 있습니다.

<detailed_sequence_of_steps>
# AI Feature - AI 통합 개발 워크플로우

## 사용되는 원자 컴포넌트
- `/atoms/message-flow` - Frontend ↔ Backend ↔ AI 통신 패턴
- `/atoms/tdd-cycle` - 통합 우선 테스팅 방법론
- `/atoms/verification-steps` - 완전한 시스템 검증
- `/atoms/storage-patterns` - AI 컨텍스트 및 설정 지속성

## 개발 전 단계

### 단계 1: AI 기능 아키텍처
**AI 통합 지점 정의:**
- [ ] 이 기능이 사용하는 AI 서비스는? (Claude, GPT, Local model)
- [ ] 기존 AI 컨텍스트와 어떻게 통합되는가?
- [ ] AI 요청을 트리거하는 사용자 상호작용은?
- [ ] AI 응답은 어떻게 처리되고 표시되는가?
- [ ] 대화 간에 지속되어야 하는 컨텍스트는?

### 단계 2: 메시지 플로우 설계 (`/atoms/message-flow`)

**전체 AI 메시지 송수신 아키텍처:**
```
사용자 입력 → ChatView → TaskServiceClient → WebviewProvider 
→ Task → AI API → Task → WebviewProvider → ChatView → UI 렌더링
```

**각 계층별 역할:**
- **ChatView.tsx**: 사용자 입력 수집, 메시지 전송
- **TaskServiceClient**: Proto 기반 통신 처리
- **WebviewProvider**: Extension과 WebView 간 메시지 라우팅
- **Task.ts**: AI 작업 실행, 시스템 프롬프트 생성
- **AI API**: 실제 AI 모델 호출 (Claude, GPT 등)
- **ChatRow.tsx**: AI 응답 렌더링

### 단계 2.1: AI 메시지 플로우 구현
```typescript
// AI 기능을 위한 메시지 타입 정의
interface AIFeatureMessages {
  // Frontend → Backend
  'ai-feature-request': {
    userInput: string;
    context: FeatureContext;
    settings: FeatureSettings;
  };
  
  // Backend → Frontend  
  'ai-feature-response': {
    aiOutput: string;
    updatedContext: FeatureContext;
    status: 'success' | 'error' | 'partial';
  };
  
  // Backend → AI Service
  'ai-service-query': {
    systemPrompt: string;
    userQuery: string;
    conversationContext: AIContext;
  };
}
```

## TDD 구현 단계  

### 단계 3: RED - AI 통합 테스트 (`/tdd-cycle`)
**완전한 AI 상호작용 플로우에 대한 통합 테스트 작성:**

```typescript
describe('AI Persona 기능 통합', () => {
  it('페르소나 컨텍스트로 사용자 입력을 AI를 통해 처리하고 포맷된 응답을 반환해야 함', async () => {
    // 설정: 사용자가 창의적 페르소나를 선택함
    const mockContext = createMockExtensionContext();
    await mockContext.workspaceState.update('selectedPersona', 'creative');
    
    const aiFeature = new AIPersonaFeature(mockContext);
    
    // 사용자 상호작용: AI에 질문
    const userInput = "Help me write a creative story";
    const response = await aiFeature.processUserRequest(userInput);
    
    // 예상 AI 통합 플로우:
    expect(mockAIService.query).toHaveBeenCalledWith({
      systemPrompt: expect.stringContaining('creative persona'),
      userQuery: userInput,
      conversationContext: expect.objectContaining({
        persona: 'creative'
      })
    });
    
    // 예상 출력 포맷팅
    expect(response.content).toBeDefined();
    expect(response.persona).toBe('creative');
    expect(response.formatted).toBe(true);
  });
});
```

### 단계 4: GREEN - AI 서비스 통합
**적절한 메시지 플로우로 AI 서비스 통합 구현:**

```typescript
export class AIPersonaFeature {
  constructor(
    private context: vscode.ExtensionContext,
    private aiService: AIService,
    private messageHandler: MessageHandler
  ) {}
  
  async processUserRequest(userInput: string): Promise<AIResponse> {
    // 저장소 패턴 적용 - 페르소나 컨텍스트 가져오기
    const selectedPersona = this.getSelectedPersona(); // workspace별
    const userPreferences = this.getUserPreferences(); // 전역 설정
    
    // 페르소나로 AI 컨텍스트 구성
    const aiContext = this.buildAIContext(selectedPersona, userPreferences);
    
    // 컨텍스트로 AI 서비스 쿼리
    const aiResponse = await this.aiService.query({
      systemPrompt: this.buildPersonaPrompt(selectedPersona),
      userQuery: userInput,
      conversationContext: aiContext
    });
    
    // 응답 처리 및 포맷팅
    const formattedResponse = this.formatAIResponse(aiResponse, selectedPersona);
    
    // 대화 컨텍스트 업데이트 (workspace 저장소)
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

### 단계 5: Frontend 통합 (`/message-flow`)
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

### 단계 6: REFACTOR - AI 성능 & 오류 처리
```typescript
// 적절한 오류 처리와 성능 최적화 추가
class AIPersonaFeature {
  async processUserRequest(userInput: string): Promise<AIResponse> {
    try {
      // 속도 제한
      await this.rateLimiter.checkLimit();
      
      // 컨텍스트 최적화 - 대화 기록 크기 제한
      const optimizedContext = this.optimizeContext(this.getConversationHistory());
      
      // 타임아웃과 재시도를 포함한 AI 쿼리
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

### 단계 7: AI 기능 검증 (`/verification-steps`)
```bash
# AI 통합 end-to-end 테스트
npm run test:webview  # 프론트엔드 컴포넌트 테스트
# npm run test:backend (when available) # AI 서비스 통합 테스트

# 컴파일 검증
npm run compile
npm run check-types

# 라이브 테스트
npm run watch  # 전체 AI 상호작용 플로우 테스트를 위해 F5
```

### 단계 8: AI 성능 검증  
- [ ] AI 응답이 UI에서 올바르게 렌더링됨
- [ ] 대화 컨텍스트가 적절히 지속됨
- [ ] 오류 상태가 우아하게 처리됨
- [ ] 속도 제한이 올바르게 작동함
- [ ] 긴 대화 중 메모리 사용량이 안정적임
- [ ] AI API 실패에 대해 AI 서비스 통합이 견고함

## 관련 워크플로우
- 대화 및 컨텍스트 지속성을 위해 `/storage-patterns` 사용
- 복잡한 AI 통합 결정에 `/critical-verification` 적용
- AI 관련 UI 컴포넌트 생성 시 `/new-component` 고려
- AI 시스템 통합 지점에 `/cline-modification`을 조심스럽게 사용
</detailed_sequence_of_steps>

<general_guidelines>
AI 기능은 메시지 플로우, 컨텍스트 관리, 오류 처리에 세심한 주의가 필요합니다.

통합 우선 테스팅 접근법은 완전한 AI 상호작용 플로우가 올바르게 작동하도록 보장합니다.

적절한 저장소 패턴은 대화 컨텍스트 손실을 방지하고 사용자 경험을 유지합니다.
</general_guidelines>