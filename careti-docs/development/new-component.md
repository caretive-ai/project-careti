# 새 컴포넌트 - TDD 컴포넌트 생성 워크플로우

TDD와 일관된 패턴을 사용하여 새 컴포넌트를 생성합니다.

> **⚠️ 주의: 개념적 가이드**
> 이 문서에 포함된 코드 예제(`PersonaSelector`, `PersonaService` 등)는 실제 코드베이스에 존재하지 않는 **개념적 예시**이며, 워크플로우를 설명하기 위한 목적으로 사용되었습니다. 실제 구현 시에는 이 문서의 원칙을 바탕으로 프로젝트의 실제 코드 구조에 맞게 적용해야 합니다.

## 사용되는 원자적 컴포넌트
- `/tdd-cycle` - RED→GREEN→REFACTOR 방법론
- `/naming-conventions` - 일관된 파일 및 변수 이름 지정
- `/storage-patterns` - 적절한 상태 관리
- `/verification-steps` - 전체 테스트 검증

## 개발 전 단계

### 1단계: 컴포넌트 계획
**컴포넌트 목적 및 통합 정의:**
- [ ] 이 컴포넌트는 어떤 사용자 상호작용을 처리합니까?
- [ ] 기존 시스템과 어떻게 통합됩니까?
- [ ] 어떤 스토리지 범위가 필요합니까 (작업 공간 vs 전역)?
- [ ] 이것은 React 컴포넌트(.tsx)입니까, 아니면 서비스 클래스(.ts)입니까?

### 2단계: 이름 지정 결정 (`/naming-conventions`)
```
// React 컴포넌트 (프론트엔드)
PersonaSelector.tsx → PersonaSelector.test.tsx

// 서비스 클래스 (백엔드)
persona-service.ts → persona-service.test.ts

// 유틸리티 함수
message-processor.ts → message-processor.test.ts
```

## TDD 구현 단계

### 3단계: RED - 통합 테스트 우선 (`/tdd-cycle`)
**고립된 단위가 아닌 실제 사용자 시나리오에 대한 테스트 작성:**

```typescript
// 예시: React 컴포넌트 통합 테스트
describe('PersonaSelector 컴포넌트', () => {
  it('사용자가 새 페르소나를 선택하면 AI 동작을 업데이트해야 합니다', async () => {
    render(<PersonaSelector />);
    
    // 사용자 상호작용
    const personaOption = screen.getByText('창의적 어시스턴트');
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
  it('페르소나 선택을 유지하고 AI 컨텍스트를 업데이트해야 합니다', async () => {
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

### 4단계: GREEN - 구현 (`/storage-patterns`)
**통합 테스트를 통과하기 위한 최소 구현 생성:**

```typescript
// 스토리지 패턴을 적절히 적용
export class PersonaService {
  constructor(private context: vscode.ExtensionContext) {}
  
  async selectPersona(personaId: string): Promise<void> {
    // 작업 공간 스토리지 - 페르소나 선택은 프로젝트별
    await this.context.workspaceState.update('selectedPersona', personaId);
    
    // 새 컨텍스트로 AI 시스템 업데이트
    await this.aiService.updateSystemPrompt(this.buildPrompt(personaId));
  }
  
  getSelectedPersona(): string {
    // 일관된 스토리지 패턴
    return this.context.workspaceState.get('selectedPersona', 'default');
  }
}
```

### 5단계: REFACTOR - 품질 개선
**테스트를 통과하는 상태를 유지하며 구현 개선:**
- 공통 패턴 추출
- 오류 처리 추가
- 성능 최적화
- 부산물로서 단위 테스트 추가 (시작점이 아님)

## 구현 후 단계

### 6단계: 전체 검증 (`/verification-steps`)
```bash
# 테스트 검증
npm run test:webview      # React 컴포넌트용
# npm run test:unit        # (서비스/백엔드 unit) Mocha 기준

# 컴파일 검증
npm run compile
npm run check-types

# 실행 검증
npm run watch            # 개발 시작
# VSCode에서 F5로 확장 프로그램 테스트
```

### 7단계: 통합 유효성 검사
- [ ] 컴포넌트가 기존 UI/시스템과 통합됨
- [ ] 스토리지 패턴이 올바르게 작동함 (데이터 지속/로드)
- [ ] 메모리 누수나 성능 문제 없음
- [ ] 오류 처리가 적절하게 작동함
- [ ] 이름 지정이 프로젝트 규칙을 따름

## 파일 구조 예시

### React 컴포넌트 생성:
```
webview-ui/src/careti/components/
├── PersonaSelector.tsx
├── PersonaSelector.test.tsx
└── PersonaSelector.module.css (필요 시)
```

### 서비스 클래스 생성:
```
careti-src/services/
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

### `/modification-levels`와 함께 사용:
- **Level 1**: `careti-src/` 또는 `careti` 컴포넌트의 새 컴포넌트
- **Level 2**: 기존 Cline 컴포넌트와의 통합 지점
- **Level 3**: 기존 Cline 컴포넌트의 주요 수정 (피할 것)

## 관련 워크플로우
- 컴포넌트 디자인이 복잡할 때 `/critical-verification` 적용
- Cline 컴포넌트와의 통합이 필요할 경우 `/cline-modification` 사용
- 프론트엔드-백엔드 통신을 위해 `/message-flow` 고려
