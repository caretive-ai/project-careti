# 테스트 작업 - 포괄적인 테스트 구현

> **⚠️ 주의: 개념적 가이드**
> 이 문서는 테스트 작업을 수행하는 **방법론과 워크플로우**를 설명합니다. 여기에 포함된 코드 예제(`PersonaSystem` 등)는 실제 코드베이스에 존재하지 않는 **개념적 예시**이며, 아이디어를 전달하기 위한 목적으로 사용되었습니다. 실제 테스트 코드 작성 시에는 이 문서의 원칙을 바탕으로 테스트 대상이 되는 실제 코드의 구조에 맞게 적용해야 합니다.

통합 우선 TDD 방법론에 따라 포괄적인 테스트를 구현합니다.

## 사용되는 원자적 컴포넌트
- `/tdd-cycle` - 통합 테스트를 우선하는 RED→GREEN→REFACTOR
- `/verification-steps` - 테스트→컴파일→실행 검증 순서
- `/naming-conventions` - 일관된 테스트 파일 이름 및 구조

## 테스트 전 단계

### 1단계: 테스트 전략 계획
**테스트 범위 및 접근 방식 정의:**
- [ ] 테스트할 주요 사용자 시나리오는 무엇입니까?
- [ ] 어떤 시스템 컴포넌트에 통합 테스트가 필요합니까?
- [ ] 어떤 엣지 케이스와 오류 조건이 존재합니까?
- [ ] 성능 또는 안정성 요구사항이 있습니까?
- [ ] 어떤 외부 종속성을 모의(mocking)해야 합니까?

### 2단계: 테스트 환경 설정
```bash
# 테스트 인프라 확인
npm run test:webview     # 프론트엔드 테스트 기능
npm run test:unit        # 백엔드(Extension) 단위 테스트(Mocha)
npm run test:integration # VSCode 통합 테스트(vscode-test)
```

## TDD 구현 주기

### 3단계: RED - 통합 테스트 우선 (`/tdd-cycle`)
**실제 사용자 시나리오에 대한 실패하는 통합 테스트 작성:**

```typescript
// 예시: 전체 기능 통합 테스트
describe('페르소나 시스템 통합', () => {
  it('사용자가 페르소나를 선택하고, 선택을 유지하며, AI 응답에 영향을 미칠 수 있어야 합니다', async () => {
    // 실제와 유사한 환경 설정
    const mockContext = createMockExtensionContext();
    const mockAIService = createMockAIService();
    const mockWebview = createMockWebviewProvider();
    
    // 전체 시스템 초기화
    const personaSystem = new PersonaSystem(mockContext, mockAIService);
    const ui = render(<PersonaSelector personaSystem={personaSystem} />);
    
    // 사용자 상호작용: 창의적 페르소나 선택
    const creativePersona = ui.getByText('창의적 어시스턴트');
    fireEvent.click(creativePersona);
    
    // 비동기 작업 대기
    await waitFor(() => {
      // 스토리지 지속성 확인
      expect(mockContext.workspaceState.update).toHaveBeenCalledWith(
        'selectedPersona', 'creative'
      );
      
      // AI 시스템 업데이트 확인
      expect(mockAIService.updateSystemPrompt).toHaveBeenCalledWith(
        expect.stringContaining('창의적이고 상상력이 풍부한')
      );
      
      // UI 피드백 확인
      expect(ui.getByText('창의적 어시스턴트 선택됨')).toBeInTheDocument();
    });
    
    // 새 페르소나로 AI 응답 테스트
    const chatInput = ui.getByPlaceholderText('메시지를 입력하세요...');
    fireEvent.change(chatInput, { target: { value: '이야기 쓰는 것을 도와주세요' } });
    fireEvent.submit(chatInput.closest('form'));
    
    await waitFor(() => {
      // 창의적 컨텍스트로 AI가 호출되었는지 확인
      expect(mockAIService.query).toHaveBeenCalledWith({
        systemPrompt: expect.stringContaining('창의적 페르소나'),
        userQuery: '이야기 쓰는 것을 도와주세요',
        context: expect.objectContaining({ persona: 'creative' })
      });
    });
  });
});
```

### 4단계: GREEN - 최소 구현
**통합 테스트를 통과할 만큼의 최소 코드 작성:**

```typescript
// PersonaSystem - 최소 구현
export class PersonaSystem {
  constructor(
    private context: vscode.ExtensionContext,
    private aiService: AIService
  ) {}
  
  async selectPersona(personaId: string): Promise<void> {
    // 선택 유지
    await this.context.workspaceState.update('selectedPersona', personaId);
    
    // AI 시스템 업데이트
    const prompt = this.buildPersonaPrompt(personaId);
    await this.aiService.updateSystemPrompt(prompt);
    
    // UI에 알림 (간소화)
    this.notifyUIUpdate(personaId);
  }
  
  private buildPersonaPrompt(personaId: string): string {
    const personas = {
      'creative': '당신은 창의적이고 상상력이 풍부한 어시스턴트입니다...',
      'technical': '당신은 정확한 기술 어시스턴트입니다...',
      'default': '당신은 도움이 되는 어시스턴트입니다...'
    };
    return personas[personaId] || personas.default;
  }
}
```

### 5단계: REFACTOR - 포괄적인 테스트 추가
**구현을 개선하고 지원 테스트 추가:**

```typescript
// 엣지 케이스 테스트 추가
describe('페르소나 시스템 엣지 케이스', () => {
  it('유효하지 않은 페르소나 선택을 정상적으로 처리해야 합니다', async () => {
    const personaSystem = new PersonaSystem(mockContext, mockAIService);
    
    // 유효하지 않은 페르소나 ID 테스트
    await expect(personaSystem.selectPersona('invalid-persona')).resolves.not.toThrow();
    
    // 기본값으로 대체되어야 함
    expect(mockAIService.updateSystemPrompt).toHaveBeenCalledWith(
      expect.stringContaining('도움이 되는 어시스턴트')
    );
  });
  
  it('스토리지 실패를 정상적으로 처리해야 합니다', async () => {
    mockContext.workspaceState.update.mockRejectedValue(new Error('스토리지 실패'));
    
    const personaSystem = new PersonaSystem(mockContext, mockAIService);
    
    // 스토리지 실패 시 충돌하지 않아야 함
    await expect(personaSystem.selectPersona('creative')).resolves.not.toThrow();
    
    // 오류를 적절히 기록해야 함
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('스토리지 실패'));
  });
});

// 성능 테스트 추가
describe('페르소나 시스템 성능', () => {
  it('합리적인 시간 내에 페르소나를 선택해야 합니다', async () => {
    const personaSystem = new PersonaSystem(mockContext, mockAIService);
    
    const startTime = performance.now();
    await personaSystem.selectPersona('creative');
    const duration = performance.now() - startTime;
    
    expect(duration).toBeLessThan(100); // 100ms 제한
  });
});
```

## 테스트 검증 단계

### 6단계: 테스트 커버리지 확인 (`/verification-steps`)
```bash
# 포괄적인 테스트 스위트 실행
npm run test:webview
npm run test:coverage

# 커버리지가 요구사항을 충족하는지 확인
# 목표: 새 기능에 대한 90% 이상의 라인 커버리지
# 목표: 사용자 흐름에 대한 100% 통합 테스트 커버리지
```

### 7단계: 테스트 품질 검증
- [ ] **통합 테스트가 실제 사용자 시나리오를 커버하는가** (고립된 단위뿐만 아니라)
- [ ] **엣지 케이스가 테스트되었는가** (유효하지 않은 입력, 네트워크 실패, 스토리지 오류)
- [ ] **오류 처리가 검증되었는가** (정상적인 성능 저하, 사용자 피드백)
- [ ] **성능 요구사항이 충족되었는가** (응답 시간, 메모리 사용량)
- [ ] **크로스 브라우저/플랫폼 호환성** (해당하는 경우)

### 8단계: 테스트 이름 지정 확인 (`/naming-conventions`)
```
✅ PersonaSystem.test.ts          (PersonaSystem.ts와 일치)
✅ persona-service.test.ts        (persona-service.ts와 일치)
✅ PersonaSelector.test.tsx       (PersonaSelector.tsx와 일치)

❌ TestPersonaSystem.ts           (잘못된 패턴)
❌ persona-system-test.ts         (잘못된 패턴)
❌ PersonaSelectorTests.tsx       (잘못된 패턴)
```

## 테스트 후 단계

### 9단계: 전체 검증 주기 완료 (`/verification-steps`)
```bash
# 전체 검증 순서
npm run test:coverage     # 포괄적인 테스트 실행
npm run compile          # TypeScript 컴파일
npm run check-types      # 타입 유효성 검사
npm run watch           # 런타임 테스트 (VSCode에서 F5)
```

### 10단계: 테스트 유지보수 설정
- [ ] **테스트 문서** - 테스트 실행 지침이 포함된 README
- [ ] **CI 통합** - 모든 커밋 시 테스트 실행
- [ ] **테스트 데이터 관리** - 모의 데이터 및 픽스처 정리
- [ ] **불안정한 테스트 모니터링** - 불안정한 테스트 처리 프로세스

## 테스트 패턴 및 모범 사례

### 효과적인 테스트 구조:
```typescript
describe('기능 통합', () => {
  // 테스트 스위트당 한 번 설정
  beforeEach(() => {
    // 모의 및 상태 재설정
  });
  
  describe('정상 경로 시나리오', () => {
    it('일반적인 사용자 워크플로우를 처리해야 합니다', () => {
      // 주요 성공 경로 테스트
    });
  });
  
  describe('엣지 케이스', () => {
    it('유효하지 않은 입력을 정상적으로 처리해야 합니다', () => {
      // 오류 조건 테스트
    });
  });
  
  describe('성능', () => {
    it('시간 제한 내에 작업을 완료해야 합니다', () => {
      // 성능 요구사항 테스트
    });
  });
});
```

## 관련 워크플로우
- `/new-component` 개발의 필수 완료 단계
- `/ai-feature` 구현의 중요 검증
- `/cline-modification` 변경 전 필수
- 테스트 전략이 복잡할 때 `/critical-verification` 적용
