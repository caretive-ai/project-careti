통합 우선 TDD 방법론을 따라 포괄적인 테스팅을 구현하고 있습니다.

<detailed_sequence_of_steps>
# Testing Work - 포괄적인 테스트 구현

## 사용되는 원자 컴포넌트
- `/tdd-cycle` - 통합 테스트 우선 RED→GREEN→REFACTOR
- `/verification-steps` - 테스트→컴파일→실행 검증 시퀀스
- `/naming-conventions` - 일관된 테스트 파일 명명과 구조

## 테스트 전 단계

### 단계 1: 테스트 전략 계획
**테스트 범위와 접근법 정의:**
- [ ] 테스트되는 주요 사용자 시나리오는?
- [ ] 통합 테스트가 필요한 시스템 컴포넌트는?
- [ ] 어떤 엣지 케이스와 오류 조건이 존재하는가?
- [ ] 성능이나 안정성 요구사항이 있는가?
- [ ] 모킹이 필요한 외부 종속성은?

### 단계 2: 테스트 환경 설정
```bash
# 테스트 인프라 확인
npm run test:webview     # 프론트엔드 테스트 기능
# npm run test:backend   # 백엔드 테스트 (계획된)
npm run test:coverage    # 커버리지 보고 가능
```

## TDD 구현 사이클

### 단계 3: RED - 통합 테스트 우선 (`/tdd-cycle`)
**실제 사용자 시나리오에 대한 실패하는 통합 테스트 작성:**

```typescript
// 예시: 완전한 기능 통합 테스트
describe('Persona 시스템 통합', () => {
  it('사용자가 페르소나를 선택하고, 선택을 지속하며, AI 응답에 영향을 주어야 함', async () => {
    // 실제와 유사한 환경 설정
    const mockContext = createMockExtensionContext();
    const mockAIService = createMockAIService();
    const mockWebview = createMockWebviewProvider();
    
    // 완전한 시스템 초기화
    const personaSystem = new PersonaSystem(mockContext, mockAIService);
    const ui = render(<PersonaSelector personaSystem={personaSystem} />);
    
    // 사용자 상호작용: 창의적 페르소나 선택
    const creativePersona = ui.getByText('Creative Assistant');
    fireEvent.click(creativePersona);
    
    // 비동기 작업 대기
    await waitFor(() => {
      // 저장소 지속성 확인  
      expect(mockContext.workspaceState.update).toHaveBeenCalledWith(
        'selectedPersona', 'creative'
      );
      
      // AI 시스템 업데이트 확인
      expect(mockAIService.updateSystemPrompt).toHaveBeenCalledWith(
        expect.stringContaining('creative and imaginative')
      );
      
      // UI 피드백 확인
      expect(ui.getByText('Creative Assistant Selected')).toBeInTheDocument();
    });
    
    // 새 페르소나로 AI 응답 테스트
    const chatInput = ui.getByPlaceholderText('Type your message...');
    fireEvent.change(chatInput, { target: { value: 'Help me write a story' } });
    fireEvent.submit(chatInput.closest('form'));
    
    await waitFor(() => {
      // 창의적 컨텍스트로 AI 호출 확인
      expect(mockAIService.query).toHaveBeenCalledWith({
        systemPrompt: expect.stringContaining('creative persona'),
        userQuery: 'Help me write a story',
        context: expect.objectContaining({ persona: 'creative' })
      });
    });
  });
});
```

### 단계 4: GREEN - 최소한의 구현
**통합 테스트를 통과시키는 최소한의 코드 생성:**

```typescript
// PersonaSystem - 최소한의 구현
export class PersonaSystem {
  constructor(
    private context: vscode.ExtensionContext,
    private aiService: AIService
  ) {}
  
  async selectPersona(personaId: string): Promise<void> {
    // 선택 지속
    await this.context.workspaceState.update('selectedPersona', personaId);
    
    // AI 시스템 업데이트
    const prompt = this.buildPersonaPrompt(personaId);
    await this.aiService.updateSystemPrompt(prompt);
    
    // UI 알림 (단순화)
    this.notifyUIUpdate(personaId);
  }
  
  private buildPersonaPrompt(personaId: string): string {
    const personas = {
      'creative': 'You are a creative and imaginative assistant...',
      'technical': 'You are a precise technical assistant...',
      'default': 'You are a helpful assistant...'
    };
    return personas[personaId] || personas.default;
  }
}
```

### 단계 5: REFACTOR - 포괄적인 테스트 추가
**구현을 개선하고 지원 테스트 추가:**

```typescript
// 엣지 케이스 테스트 추가
describe('PersonaSystem 엣지 케이스', () => {
  it('잘못된 페르소나 선택을 우아하게 처리해야 함', async () => {
    const personaSystem = new PersonaSystem(mockContext, mockAIService);
    
    // 잘못된 페르소나 ID 테스트
    await expect(personaSystem.selectPersona('invalid-persona')).resolves.not.toThrow();
    
    // 기본값으로 폴백해야 함
    expect(mockAIService.updateSystemPrompt).toHaveBeenCalledWith(
      expect.stringContaining('helpful assistant')
    );
  });
  
  it('저장소 실패를 우아하게 처리해야 함', async () => {
    mockContext.workspaceState.update.mockRejectedValue(new Error('Storage failed'));
    
    const personaSystem = new PersonaSystem(mockContext, mockAIService);
    
    // 저장소 실패 시 크래시하지 않아야 함
    await expect(personaSystem.selectPersona('creative')).resolves.not.toThrow();
    
    // 오류를 적절히 로깅해야 함
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Storage failed'));
  });
});

// 성능 테스트 추가
describe('PersonaSystem 성능', () => {
  it('합리적인 시간 내에 페르소나를 선택해야 함', async () => {
    const personaSystem = new PersonaSystem(mockContext, mockAIService);
    
    const startTime = performance.now();
    await personaSystem.selectPersona('creative');
    const duration = performance.now() - startTime;
    
    expect(duration).toBeLessThan(100); // 100ms 제한
  });
});
```

## 테스트 검증 단계

### 단계 6: 테스트 커버리지 검증 (`/verification-steps`)
```bash
# 포괄적인 테스트 스위트 실행
npm run test:webview
npm run test:coverage

# 커버리지가 요구사항을 충족하는지 확인
# 목표: 새 기능의 >90% 라인 커버리지
# 목표: 사용자 플로우의 100% 통합 테스트 커버리지
```

### 단계 7: 테스트 품질 검증
- [ ] **통합 테스트가 실제 사용자 시나리오를 포함** (격리된 단위가 아님)
- [ ] **엣지 케이스 테스트** (잘못된 입력, 네트워크 실패, 저장소 오류)
- [ ] **오류 처리 확인** (우아한 저하, 사용자 피드백)
- [ ] **성능 요구사항 충족** (응답 시간, 메모리 사용량)
- [ ] **크로스 브라우저/플랫폼 호환성** (해당하는 경우)

### 단계 8: 테스트 명명 검증 (`/naming-conventions`)
```
✅ PersonaSystem.test.ts          (PersonaSystem.ts와 일치)
✅ persona-service.test.ts        (persona-service.ts와 일치) 
✅ PersonaSelector.test.tsx       (PersonaSelector.tsx와 일치)

❌ TestPersonaSystem.ts           (잘못된 패턴)
❌ persona-system-test.ts         (잘못된 패턴)
❌ PersonaSelectorTests.tsx       (잘못된 패턴)
```

## 테스트 후 단계

### 단계 9: 완전한 검증 사이클 (`/verification-steps`)
```bash
# 전체 검증 시퀀스
npm run test:coverage     # 포괄적인 테스트 실행
npm run compile          # TypeScript 컴파일
npm run check-types      # 타입 검증
npm run watch           # 런타임 테스트 (VSCode에서 F5)
```

### 단계 10: 테스트 유지보수 설정
- [ ] **테스트 문서화** - 테스트 실행 지침이 있는 README
- [ ] **CI 통합** - 모든 커밋에서 테스트 실행
- [ ] **테스트 데이터 관리** - Mock 데이터와 fixture 정리
- [ ] **불안정한 테스트 모니터링** - 불안정한 테스트를 처리하는 프로세스

## 테스트 패턴 & 모범 사례

### 효과적인 테스트 구조:
```typescript
describe('기능 통합', () => {
  // 테스트 스위트당 한 번 설정
  beforeEach(() => {
    // Mock과 상태 초기화
  });
  
  describe('Happy Path 시나리오', () => {
    it('일반적인 사용자 워크플로우를 처리해야 함', () => {
      // 주요 성공 경로 테스트
    });
  });
  
  describe('엣지 케이스', () => {
    it('잘못된 입력을 우아하게 처리해야 함', () => {
      // 오류 조건 테스트
    });
  });
  
  describe('성능', () => {
    it('시간 제한 내에 작업을 완료해야 함', () => {
      // 성능 요구사항 테스트
    });
  });
});
```

## 관련 워크플로우
- `/new-component` 개발의 필수 완료 단계
- `/ai-feature` 구현의 중요한 검증  
- `/cline-modification` 변경 전 필수
- 테스트 전략이 복잡할 때 `/critical-verification` 적용
</detailed_sequence_of_steps>

<general_guidelines>
포괄적인 테스팅은 회귀를 방지하고 안정적인 사용자 경험을 보장합니다.

통합 우선 테스팅은 단위 테스트가 종종 놓치는 실제 문제를 포착합니다.

좋은 테스트 커버리지는 자신 있는 리팩터링과 기능 개발을 가능하게 합니다.
</general_guidelines>