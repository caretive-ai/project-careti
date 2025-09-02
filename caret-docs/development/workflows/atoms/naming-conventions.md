일관성을 위한 Cline 호환 naming convention을 따르고 있습니다.

<detailed_sequence_of_steps>
# Naming Conventions - Cline 호환성

## 핵심 원칙  
**일관성을 유지하고 머지 충돌을 피하기 위해 기존 Cline 패턴을 따릅니다**

## 파일 네이밍

### 유틸리티 (함수/서비스)
**패턴**: `kebab-case.ts`
```
✅ brand-utils.ts
✅ message-processor.ts  
✅ persona-service.ts
❌ brandUtils.ts
❌ MessageProcessor.ts
```

### 컴포넌트 (클래스/React 컴포넌트)
**패턴**: `PascalCase.ts/.tsx`
```
✅ CaretProvider.ts
✅ PersonaSelector.tsx
✅ MessageHandler.ts
❌ caretProvider.ts
❌ persona-selector.tsx  
```

### 테스트 파일
**패턴**: 소스 파일과 정확히 매칭 + `.test.ts`
```
✅ brand-utils.test.ts      (brand-utils.ts와 매칭)
✅ CaretProvider.test.tsx   (CaretProvider.tsx와 매칭)
❌ brandUtilsTest.ts
❌ test-brand-utils.ts
```

### 문서
**패턴**: `kebab-case.mdx` 또는 `kebab-case.md`
```
✅ new-developer-guide.mdx
✅ testing-guide.mdx
✅ ai-work-index.mdx
❌ NewDeveloperGuide.mdx
❌ Testing_Guide.mdx
```

## 디렉토리 구조

### Caret 확장
```
caret-src/
├── services/           (kebab-case 서비스)
├── controllers/        (kebab-case 컨트롤러)  
├── core/              (kebab-case 핵심 모듈)
└── __tests__/         (소스와 매칭되는 테스트 파일)
```

### Cline 보존
```
src/                   (기존 Cline 패턴 보존)
webview-ui/           (기존 Cline 패턴 보존)
```

## 변수/함수 네이밍

### TypeScript/JavaScript
```typescript
// 변수, 함수는 camelCase
const currentUser = getCurrentUser();
const chatSettings = getChatSettings();

// 클래스, 타입, 인터페이스는 PascalCase
class PersonaService implements IPersonaService {
  private readonly storageService: StorageService;
}

// 상수는 SCREAMING_SNAKE_CASE
const DEFAULT_PERSONA_NAME = 'Assistant';
const MAX_MESSAGE_LENGTH = 4000;
```

## 검증 예시

### 올바른 네이밍:
```
caret-src/services/persona-service.ts
caret-src/services/persona-service.test.ts
caret-src/core/messaging/MessageHandler.ts
caret-src/core/messaging/MessageHandler.test.ts
```

### 잘못된 네이밍:
```
❌ caret-src/services/personaService.ts     (kebab-case여야 함)
❌ caret-src/core/message-handler.ts        (클래스는 PascalCase여야 함)  
❌ caret-src/services/PersonaServiceTest.ts (소스 + .test.ts여야 함)
```

## 관련 Workflow
- `/modification-levels`로 새 파일 생성 시 적용
- `/tdd-cycle`로 테스트 작성 시 따르기
- `/verification-steps` 중 일관성 검증
</detailed_sequence_of_steps>

<general_guidelines>
이러한 convention들은 Caret 확장을 위한 명확한 패턴을 설정하면서 Cline의 기존 코드베이스와의 일관성을 유지합니다.

확실하지 않을 때는 기존 Cline 파일들을 참조 패턴으로 검토하세요.

네이밍의 일관성은 인지 부하를 줄이고 머지 충돌을 방지합니다.
</general_guidelines>