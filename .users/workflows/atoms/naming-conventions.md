# 명명 규칙 - Cline 호환성

일관성을 위한 Cline 호환 명명 규칙입니다.

## 핵심 원칙
**일관성 유지와 병합 충돌 방지를 위해 기존 Cline 패턴 준수**

## 파일 명명

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
**패턴**: 소스 파일과 정확히 일치 + `.test.ts`
```
✅ brand-utils.test.ts      (brand-utils.ts와 일치)
✅ CaretProvider.test.tsx   (CaretProvider.tsx와 일치)
❌ brandUtilsTest.ts
❌ test-brand-utils.ts
```

### 문서
**패턴**: `kebab-case.md`
```
✅ new-developer-guide.md
✅ testing-guide.md
✅ ai-work-index.md
❌ NewDeveloperGuide.md
❌ Testing_Guide.md
```

## 디렉토리 구조

### Caret 확장
```
careti-src/
├── services/           (kebab-case 서비스)
├── controllers/        (kebab-case 컨트롤러)
├── core/              (kebab-case 코어 모듈)
└── __tests__/         (소스와 일치하는 테스트 파일)
```

### Cline 보존
```
src/                   (기존 Cline 패턴 보존)
webview-ui/           (기존 Cline 패턴 보존)
```

## 변수/함수 명명

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

### 좋은 명명:
```
careti-src/services/persona-service.ts
careti-src/services/persona-service.test.ts
careti-src/core/messaging/MessageHandler.ts
careti-src/core/messaging/MessageHandler.test.ts
```

### 나쁜 명명:
```
❌ careti-src/services/personaService.ts     (kebab-case여야 함)
❌ careti-src/core/message-handler.ts        (클래스는 PascalCase여야 함)
❌ careti-src/services/PersonaServiceTest.ts (소스 + .test.ts 형식이어야 함)
```

## 관련 워크플로우
- `/modification-levels`로 새 파일 생성 시 적용
- `/tdd-cycle`로 테스트 작성 시 준수
- `/verification-steps` 중 일관성 검증

## 일반 가이드라인
이러한 규칙은 Caret 확장을 위한 명확한 패턴을 수립하면서 Cline의 기존 코드베이스와 일관성을 유지합니다.

의심스러울 때는 기존 Cline 파일을 참조 패턴으로 확인하세요.

명명의 일관성은 인지 부하를 줄이고 병합 충돌을 방지합니다.

## 미러링 정책
- 이 파일 수정 시 `.agents/workflows/atoms/naming-conventions.md`도 동일하게 업데이트
