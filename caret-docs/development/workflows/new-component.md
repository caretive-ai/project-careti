TDD와 일관된 패턴을 사용하여 새 컴포넌트를 생성하고 있습니다.

<detailed_sequence_of_steps>
# New Component - TDD 컴포넌트 생성 워크플로우

## 사용되는 원자 컴포넌트
- `/tdd-cycle` - RED→GREEN→REFACTOR 방법론
- `/naming-conventions` - 일관된 파일과 변수 명명
- `/storage-patterns` - 적절한 상태 관리
- `/verification-steps` - 완전한 테스트 검증

## 개발 전 단계

### 단계 1: 컴포넌트 계획
**컴포넌트 목적과 통합 정의:**
- [ ] 이 컴포넌트가 처리하는 사용자 상호작용은 무엇인가?
- [ ] 기존 시스템과 어떻게 통합되는가?
- [ ] 어떤 저장소 범위가 필요한가 (workspace vs global)?
- [ ] React 컴포넌트(.tsx)인가 서비스 클래스(.ts)인가?

### 단계 2: 명명 결정 (`/naming-conventions`)
```
// React 컴포넌트 (Frontend)
PersonaSelector.tsx → PersonaSelector.test.tsx

// 서비스 클래스 (Backend)  
persona-service.ts → persona-service.test.ts

// 유틸리티 함수
message-processor.ts → message-processor.test.ts
```

## TDD 구현 단계

### 단계 3: RED - 통합 테스트 우선 (`/tdd-cycle`)
**격리된 단위가 아닌 실제 사용자 시나리오에 대한 테스트 작성:**

```typescript
// 예시: React 컴포넌트 통합 테스트
describe('PersonaSelector 컴포넌트', () => {
  it('사용자가 새 페르소나를 선택하면 AI 동작을 업데이트해야 함', async () => {
    render(<PersonaSelector />);
    
    // 사용자 상호작용
    const personaOption = screen.getByText('Creative Assistant');
    fireEvent.click(personaOption);
    
    // 예상 시스템 동작  
    expect(mockPersonaService.setActive).toHaveBeenCalledWith('creative');
    expect(mockAIService.updateContext).toHaveBeenCalled();
  });
});
```

```typescript
// 예시: 서비스 통합 테스트
describe('PersonaService', () => {
  it('페르소나 선택을 지속하고 AI 컨텍스트를 업데이트해야 함', async () => {
    const service = new PersonaService(mockContext);
    
    // 비즈니스 작업
    await service.selectPersona('creative');
    
    // 예상 결과
    expect(mockContext.workspaceState.update).toHaveBeenCalledWith(
      'selectedPersona', 'creative'
    );
    expect(mockAIService.updateSystemPrompt).toHaveBeenCalled();
  });
});
```

### 단계 4: GREEN - 구현 (`/storage-patterns`)
**통합 테스트를 통과하는 최소한의 구현 생성:**

```typescript
// 저장소 패턴을 적절히 적용
export class PersonaService {
  constructor(private context: vscode.ExtensionContext) {}
  
  async selectPersona(personaId: string): Promise<void> {
    // Workspace 저장소 - 페르소나 선택은 프로젝트별
    await this.context.workspaceState.update('selectedPersona', personaId);
    
    // 새 컨텍스트로 AI 시스템 업데이트
    await this.aiService.updateSystemPrompt(this.buildPrompt(personaId));
  }
  
  getSelectedPersona(): string {
    // 일관된 저장소 패턴
    return this.context.workspaceState.get('selectedPersona', 'default');
  }
}
```

### 단계 5: REFACTOR - 품질 개선
**테스트를 통과시키면서 구현 개선:**
- 공통 패턴 추출
- 오류 처리 추가
- 성능 최적화
- 부산물로 단위 테스트 추가 (시작점이 아님)

## 구현 후 단계

### 단계 6: 전체 검증 (`/verification-steps`)
```bash
# 테스트 검증
npm run test:webview      # React 컴포넌트용
# (test:backend when available) # 서비스 클래스용

# 컴파일 검증  
npm run compile
npm run check-types

# 실행 검증
npm run watch            # 개발 시작
# VSCode에서 F5로 확장 테스트
```

### 단계 7: 통합 검증
- [ ] 컴포넌트가 기존 UI/시스템과 통합됨
- [ ] 저장소 패턴이 올바르게 작동 (데이터 지속/로드)
- [ ] 메모리 누수나 성능 문제 없음
- [ ] 오류 처리가 적절히 작동
- [ ] 명명이 프로젝트 관례를 따름

## 파일 구조 예시

### React 컴포넌트 생성:
```
webview-ui/src/caret/components/
├── PersonaSelector.tsx
├── PersonaSelector.test.tsx
└── PersonaSelector.module.css (필요시)
```

### 서비스 클래스 생성:
```
caret-src/services/
├── persona-service.ts
├── persona-service.test.ts
└── types/
    └── persona-types.ts
```

## 다른 워크플로우와의 통합

### `/message-flow`와 함께 사용:
```typescript
// 백엔드와 통신하는 컴포넌트
const PersonaSelector: React.FC = () => {
  const sendMessage = useExtensionMessage();
  
  const handlePersonaSelect = (personaId: string) => {
    sendMessage({
      type: 'personaUpdate',
      payload: { personaId },
      requestId: generateId()
    });
  };
};
```

### `/modification-levels`과 함께 사용:
- **Level 1**: caret-src/ 또는 caret 컴포넌트의 새 컴포넌트
- **Level 2**: 기존 Cline 컴포넌트와의 통합 지점  
- **Level 3**: 기존 Cline 컴포넌트의 주요 수정 (피해야 함)

## 관련 워크플로우
- 컴포넌트 설계가 복잡할 때 `/critical-verification` 적용
- Cline 컴포넌트와 통합이 필요하면 `/cline-modification` 사용
- 프론트엔드-백엔드 통신에는 `/message-flow` 고려
</detailed_sequence_of_steps>

<general_guidelines>
이 워크플로우는 새 컴포넌트가 TDD 원칙을 따르고 기존 시스템과 깔끔하게 통합되도록 보장합니다.

통합 테스트 우선 접근법은 실제 시나리오에서 작동하지 않는 격리된 컴포넌트를 방지합니다.

일관된 명명과 저장소 패턴은 코드베이스의 일관성과 예측 가능성을 유지합니다.
</general_guidelines>