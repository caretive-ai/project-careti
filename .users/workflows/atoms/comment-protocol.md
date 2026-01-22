# 주석 프로토콜 - CARETI MODIFICATION 추적

Cline 파일 수정 추적을 위한 주석 프로토콜입니다.

## 핵심 원칙
**모든 Cline 원본 파일 수정은 명확하게 표시하고 문서화해야 합니다**

## 주석 형식
**필수 형식**: `// CARETI MODIFICATION: [명확한 설명]`

### 좋은 예시:
```typescript
// CARETI MODIFICATION: 페르소나 시스템을 위한 Caret 래퍼 초기화
const caretWrapper = new CaretProviderWrapper(context, clineProvider);

// CARETI MODIFICATION: 동적 브랜드 전환을 위한 브랜딩 토글 추가
const brandName = getBrandName();

// CARETI MODIFICATION: i18n 메시지 필터링 통합
const filteredMessage = filterBackendMessage(originalMessage);
```

### 나쁜 예시:
```typescript
❌ // Added Caret stuff
❌ // CARET: persona
❌ // Modified for branding
❌ // TODO: Caret integration
```

## 배치 규칙

### 단일 줄 수정:
```typescript
export function initialize(context: vscode.ExtensionContext) {
  // CARETI MODIFICATION: Caret 프로바이더 초기화 추가
  const caretProvider = new CaretProvider(context);
  return originalInitialize(context);
}
```

### 다중 줄 수정 (최대 1-3줄):
```typescript
export class MessageProcessor {
  process(message: string): string {
    // CARETI MODIFICATION: 백엔드 메시지 필터링 및 브랜딩 적용
    const filteredMessage = applyBackendFilter(message);
    const brandedMessage = applyBrandReplacement(filteredMessage);
    return brandedMessage;
  }
}
```

### 복잡한 변경을 위한 블록 주석:
```typescript
/*
 * CARETI MODIFICATION: 페르소나 인식 메시지 처리 통합
 * - 페르소나 컨텍스트 검색 추가
 * - 선택된 페르소나에 따른 메시지 포맷팅 수정
 * - 원본 플로우와의 하위 호환성 유지
 */
```

## 문서화 요구사항

### 주석 내용에 포함해야 할 것:
- **무엇을** 변경했는지 (구체적인 기능)
- **왜** 필요했는지 (비즈니스 목적)
- **어떻게** 통합되는지 (기술적 접근)

### 좋은 설명:
```typescript
// CARETI MODIFICATION: 멀티테넌트 지원을 위한 동적 브랜딩 활성화
// CARETI MODIFICATION: careti-src 테스트를 위한 TDD 통합 테스트 러너 추가
// CARETI MODIFICATION: 시스템 프롬프트 생성에 페르소나 컨텍스트 구현
```

### 나쁜 설명:
```typescript
❌ // CARETI MODIFICATION: 버그 수정함
❌ // CARETI MODIFICATION: 기능 추가함
❌ // CARETI MODIFICATION: 코드 업데이트함
```

## 추적 통합

### Modification Protocol과 함께:
1. 수정 접근 방식 검증
2. CARETI MODIFICATION 주석 추가
3. 최소한의 변경 수행
4. 기능 검증

### 버전 관리와 함께:
```bash
git log --grep="CARETI MODIFICATION" --oneline
# 히스토리 전체에서 모든 Caret 수정 표시
```

## 유지보수 가이드라인

### 수정 업데이트 시:
- 원본 CARETI MODIFICATION 주석 유지
- 중요한 변경 시 새 타임스탬프나 버전 추가
- CARETI MODIFICATION 마커 절대 삭제 금지

### 수정 제거 시:
- 코드와 주석 함께 제거
- 커밋 메시지에 제거 이유 문서화
- 남은 의존성 없는지 검증

## 관련 워크플로우
- `/modification-levels` L2 변경 시 필수
- `/modification-protocol`과 함께 안전하게 사용
- `/verification-steps` 컴파일 중 검증

## 일반 가이드라인
이 프로토콜은 코드베이스 전체에서 모든 Caret 수정을 추적할 수 있게 합니다.

명확한 주석은 디버깅, 유지보수, 업스트림 병합 충돌 해결에 도움이 됩니다.

표준화된 형식은 자동화 도구가 수정을 식별하고 관리할 수 있게 합니다.

## 미러링 정책
- 이 파일 수정 시 `.agents/workflows/atoms/comment-protocol.md`도 동일하게 업데이트
