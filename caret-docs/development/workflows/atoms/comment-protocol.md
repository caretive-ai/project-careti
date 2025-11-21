Cline 파일 수정 사항 추적을 위한 주석 protocol을 따르고 있습니다.

<detailed_sequence_of_steps>
# Comment Protocol - CARET MODIFICATION 추적

## 핵심 원칙
**모든 Cline 원본 파일 수정 사항은 명확하게 표시하고 문서화해야 합니다**

## 주석 형식
**필수 형식**: `// CARET MODIFICATION: [명확한 설명]`

### 올바른 예시:
```typescript
// CARET MODIFICATION: persona 시스템을 위한 Caret wrapper 초기화
const caretWrapper = new CaretProviderWrapper(context, clineProvider);

// CARET MODIFICATION: 동적 브랜드 전환을 위한 브랜딩 토글 추가  
const brandName = getBrandName();

// CARET MODIFICATION: i18n 메시지 필터링 통합
const filteredMessage = filterBackendMessage(originalMessage);
```

### 잘못된 예시:
```typescript
❌ // Added Caret stuff
❌ // CARET: persona
❌ // Modified for branding
❌ // TODO: Caret integration
```

## 배치 규칙

### 단일 라인 수정:
```typescript
export function initialize(context: vscode.ExtensionContext) {
  // CARET MODIFICATION: Caret provider 초기화 추가
  const caretProvider = new CaretProvider(context);
  return originalInitialize(context);
}
```

### 다중 라인 수정 (최대 1-3라인):
```typescript
export class MessageProcessor {
  process(message: string): string {
    // CARET MODIFICATION: 백엔드 메시지 필터링 및 브랜딩 적용
    const filteredMessage = applyBackendFilter(message);
    const brandedMessage = applyBrandReplacement(filteredMessage);
    return brandedMessage;
  }
}
```

### 복잡한 변경사항을 위한 블록 주석:
```typescript
/*
 * CARET MODIFICATION: persona 인식 메시지 처리 통합
 * - persona context 검색 추가
 * - 선택된 persona에 따른 메시지 포맷팅 수정
 * - 원래 flow와의 하위 호환성 유지
 */
```

## 문서화 요구사항

### 주석 내용에 포함되어야 할 사항:
- **무엇을** 변경했는지 (구체적인 기능)
- **왜** 필요했는지 (비즈니스 목적)
- **어떻게** 통합되는지 (기술적 접근법)

### 좋은 설명:
```typescript
// CARET MODIFICATION: 다중 테넌트 지원을 위한 동적 브랜딩 활성화
// CARET MODIFICATION: caret-src 테스트를 위한 TDD 통합 테스트 러너 추가
// CARET MODIFICATION: 시스템 프롬프트 생성에 persona context 구현
```

### 나쁜 설명:
```typescript
❌ // CARET MODIFICATION: Fixed bug
❌ // CARET MODIFICATION: Added feature  
❌ // CARET MODIFICATION: Updated code
```

## 추적 통합

### Modification Protocol과 함께:
1. 수정 접근법 확인
2. CARET MODIFICATION 주석 추가
3. 최소한의 변경 실행
4. 기능 검증

### Version Control과 함께:
```bash
git log --grep="CARET MODIFICATION" --oneline
# 히스토리 전체에서 모든 Caret 수정사항을 보여줍니다
```

## 유지보수 가이드라인

### 수정사항 업데이트 시:
- 원래 CARET MODIFICATION 주석 유지
- 중요한 변경사항일 경우 새 타임스탬프나 버전 추가
- CARET MODIFICATION 마커 제거 금지

### 수정사항 제거 시:
- 코드와 주석을 함께 제거
- 커밋 메시지에 제거 이유 문서화
- 남은 의존성이 없는지 확인

## 관련 Workflow  
- `/modification-levels` L2 변경사항에 필수
- 안전성을 위해 `/modification-protocol`과 함께 사용
- `/verification-steps` 컴파일 중 검증됨
</detailed_sequence_of_steps>

<general_guidelines>
이 protocol은 코드베이스 전체에서 모든 Caret 수정사항의 추적을 가능하게 합니다.

명확한 주석은 디버깅, 유지보수, 그리고 업스트림 병합 충돌 해결에 도움이 됩니다.

표준화된 형식은 자동화된 도구가 수정사항을 식별하고 관리할 수 있게 합니다.
</general_guidelines>