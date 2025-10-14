통합 우선 접근법을 사용한 TDD (Test-Driven Development) 사이클을 따르고 있습니다.

<detailed_sequence_of_steps>
# TDD 사이클 - 통합 우선 방법론

## 핵심 원칙
**단위 테스트가 아닌 통합 테스트를 먼저 작성하여 RED → GREEN → REFACTOR**

## Phase 1: RED (실패하는 테스트 작성)
**격리된 단위가 아닌 실제 사용 시나리오에 대한 통합 테스트**

### 올바른 접근법 ✅:
- **WebView 기능**: "사용자가 버튼 클릭 → 예상 결과 표시"
- **Backend 기능**: "설정 변경 → 시스템 동작 변경"  
- **파일 작업**: "사용자가 파일 저장 → 적절한 저장 + 검색"

### 잘못된 접근법 ❌:
- `isValidInput()` 단위 테스트로 시작
- 컨텍스트 없이 격리된 함수 테스트
- 모든 것을 모킹해서 테스트가 실제 사용을 나타내지 않음

### 테스트 생성:
```typescript
// 통합 테스트 예시
describe('User Persona Selection', () => {
  it('should update AI behavior when user selects new persona', async () => {
    // 실제 사용 시나리오 테스트
  })
})
```

## Phase 2: GREEN (테스트 통과시키기)
**통합 테스트를 통과시키기 위한 최소 코드 구현**

- 필요한 모든 구성요소, 서비스, 유틸리티 작성
- 통합 시나리오가 작동하도록 집중
- 아직 최적화하지 말고 - 작동하게만 만들기

## Phase 3: REFACTOR (테스트를 유지하면서 개선)
**기능을 깨지지 않게 하면서 코드 품질 향상**

- 공통 패턴 추출
- 성능 개선
- 코드 구조 정리  
- 부산물로 단위 테스트 추가 (시작점이 아님)

## 테스트 파일 위치
- **Backend 테스트**: `caret-src/__tests__/`
- **Webview 테스트**: `webview-ui/src/**/*.test.tsx`
- **통합 테스트**: 완전한 플로우 테스트

## 관련 워크플로우
- TDD 후 유효성 검사를 위해 `/verification-steps`와 함께 사용
- 테스트 파일 명명을 위해 `/naming-conventions`와 함께 사용
- Cline 파일 테스트를 위해 `/modification-levels`와 결합
</detailed_sequence_of_steps>

<general_guidelines>
이 TDD 접근법은 격리된 상태가 아닌 실제 시나리오에서 코드가 작동하도록 보장합니다.

통합 테스트를 먼저 하면 잘 테스트된 단위들이 함께 작동하지 않는 일반적인 문제를 방지합니다.

단위 테스트는 통합 테스트를 통과시키는 과정의 자연스러운 부산물이 됩니다.
</general_guidelines>