# Cline 원본 파일 수정 - 안전한 통합 워크플로우

Cline 원본 파일을 안전하게 수정하기 위해 원자적 워크플로우 조합을 사용합니다.

## 사용되는 원자적 컴포넌트
- `/backup-protocol` - 파일 안전 절차
- `/modification-levels` - L1→L2→L3 결정 프레임워크
- `/comment-protocol` - `CARETI MODIFICATION` 추적
- `/verification-steps` - 테스트→컴파일→실행 검증

## 수정 전 단계

### 1단계: 수준 평가 (`/modification-levels`)
- [ ] Level 1 (`careti-src/`)으로 가능한가? → 그렇다면 여기서 중단하고 `careti-src/` 사용
- [ ] Level 2 (최소한의 Cline 변경)여야 하는가? → 워크플로우 계속 진행
- [ ] Level 3 (주요 변경)이 필요한가? → 전체 문서화 필요

## 수정 단계

### 2단계: 최소한의 수정
**Level 2 제약 조건 적용:**
- 파일당 최대 1-3줄 수정
- 기존 코드를 주석 처리하지 않고 완전히 교체
- 통합 지점에만 집중

### 3단계: 주석 추가 (`/comment-protocol`)
```typescript
// CARETI MODIFICATION: [무엇을 왜 변경했는지 명확한 설명]
const caretIntegration = new CaretFeature();
```

**주석 요구사항:**
- 변경된 내용 설명
- 변경이 필요했던 이유 설명
- 통합 접근 방식 명시

## 수정 후 단계

### 4단계: 검증 순서 (`/verification-steps`)
```bash
# 1. 테스트 (해당하는 경우)
npm run test:webview  # 웹뷰 변경 사항의 경우

# 2. 컴파일 (필수)
npm run compile

# 3. 실행 (필수)
npm run watch  # 그 다음 F5로 확장 프로그램 테스트
```

### 5단계: 유효성 검사 체크리스트
- [ ] 확장 프로그램이 오류 없이 로드됨
- [ ] 새로운 기능이 예상대로 작동함
- [ ] 기존 Cline 기능에 영향 없음
- [ ] 콘솔 오류나 경고 없음
- [ ] `CARETI MODIFICATION` 주석이 존재하고 명확함

## 복구 절차

### 검증 실패 시:
```bash
# git 기준으로 되돌립니다(예: git checkout -- filename.ext)
# 가능하다면 careti-src/에서 문제 수정 또는 최소한의 수정 접근법 재검토
```

### 통합 문제 발생 시:
1.  **첫 번째 시도**: 수정 범위를 더 줄임
2.  **두 번째 시도**: 로직을 `careti-src/` 래퍼로 이동
3.  **최후의 수단**: Level 3 요구사항으로 문서화

## 예제 워크플로우 실행

```typescript
// 예제: extension.ts에 Careti 제공자 통합 추가

// 1. 수준 평가: Cline 활성화와 통합해야 하므로 → Level 2
// 2. 주석: // CARETI MODIFICATION 주석 추가
// 3. 최소한의 수정:

export async function activate(context: vscode.ExtensionContext) {
  // CARETI MODIFICATION: 향상된 기능을 위해 Careti 래퍼 초기화
  const caretProvider = new CaretProviderWrapper(context);
  
  // 기존 Cline 활성화 계속...
  const provider = new ClineProvider(context);
  // ... 나머지 부분은 변경 없음
}

// 4. 검증: npm run compile && npm run watch
// 5. 테스트: F5 → Cline과 Careti 모두 작동하는지 확인
```

## 통합 참고사항

### 잘 작동하는 경우:
- 간단한 통합 지점
- 래퍼 패턴 구현
- 설정 추가
- 이벤트 핸들러 수정

### 피해야 할 경우:
- 복잡한 로직 변경
- 주요 아키텍처 수정
- 단일 기능을 위한 여러 파일 변경

## 관련 워크플로우
- 접근 방식이 불확실할 때 `/critical-verification` 사용
- 통합 지점 테스트를 위해 `/tdd-cycle` 고려
- 상태 관리 필요 시 `/storage-patterns` 적용
