> ⚠️ (Deprecated mirror) 최신 워크플로우는 `.agents/context/workflows/cline-modification.md`를 기준으로 보세요.

원자 워크플로우 조합을 사용하여 Cline 원본 파일을 안전하게 수정하고 있습니다.

<detailed_sequence_of_steps>
# Cline 수정 - 안전한 통합 워크플로우

## 사용된 원자 컴포넌트
- `/modification-levels` - L1→L2→L3 결정 프레임워크
- `/comment-protocol` - CARET MODIFICATION 추적
- `/verification-steps` - Test→Compile→Execute 검증

## 수정 전 단계

### 1단계: 레벨 평가 (`/modification-levels`)
- [ ] Level 1 (caret-src/)로 가능한가? → 가능하면 여기서 중단, caret-src/ 사용
- [ ] Level 2 (최소한의 Cline 변경)여야 하는가? → 워크플로우 계속
- [ ] Level 3 (대규모 변경) 필요한가? → 완전한 문서화 필요

### 2단계: 백업 정책
- `.cline` 백업 생성은 Deprecated (새로 만들지 않음)
- 안전장치는 `// CARET MODIFICATION:` + 최소 변경 + 테스트/컴파일 검증으로 대체

## 수정 단계

### 3단계: 최소한의 수정
**Level 2 제약 적용:**
- 파일당 최대 1-3줄
- 완전한 교체, 오래된 코드 주석 처리 금지
- 통합 포인트에만 집중

### 4단계: 주석 추가 (`/comment-protocol`)
```typescript
// CARET MODIFICATION: [무엇을 왜 변경했는지 명확한 설명]
const caretIntegration = new CaretFeature();
```

**주석 요구사항:**
- 무엇이 변경되었는지 설명
- 왜 필요했는지 설명
- 통합 접근법 명시

## 수정 후 단계

### 5단계: 검증 순서 (`/verification-steps`)
```bash
# 1. 테스트 (해당하는 경우)
npm run test:webview  # webview 변경사항용

# 2. 컴파일 (필수)
npm run compile

# 3. 실행 (필수)
npm run watch  # 그 다음 F5로 확장 테스트
```

### 6단계: 검증 체크리스트
- [ ] 확장이 오류 없이 로드됨
- [ ] 새 기능이 예상대로 작동함
- [ ] 기존 Cline 기능에 영향 없음
- [ ] 콘솔 오류나 경고 없음
- [ ] CARET MODIFICATION 주석이 존재하고 명확함

## 복구 절차

### 검증 실패 시:
```bash
# git 기준으로 되돌립니다(예: git checkout -- filename.ext)
# 가능하면 caret-src/에서 문제 수정 또는 최소 수정 접근법 재검토
```

### 통합 문제 시:
1. **첫 번째 시도**: 수정 범위를 더 줄임
2. **두 번째 시도**: 로직을 caret-src/ 래퍼로 이동
3. **최후의 수단**: Level 3 요구사항으로 문서화

## 워크플로우 실행 예시

```typescript
// 예시: extension.ts에 Caret 프로바이더 통합 추가

// 1. 레벨 평가: Cline 활성화와 통합해야 함 → Level 2
// 2. 최소 수정:

export async function activate(context: vscode.ExtensionContext) {
  // CARET MODIFICATION: 향상된 기능을 위한 Caret 래퍼 초기화
  const caretProvider = new CaretProviderWrapper(context);
  
  // 원본 Cline 활성화 계속...
  const provider = new ClineProvider(context);
  // ... 나머지 변경 없음
}

// 4. 검증: npm run compile && npm run watch
// 5. 테스트: F5 → Cline과 Caret 모두 작동 확인
```

## 통합 참고사항

### 잘 작동하는 경우:
- 단순한 통합 포인트
- 래퍼 패턴 구현
- 설정 추가
- 이벤트 핸들러 수정

### 피해야 할 경우:
- 복잡한 로직 변경
- 주요 아키텍처 수정

## 신규 파일 예외(테스트 등)
- 보호 디렉토리(`src/`, `webview-ui/` 등)에 신규 파일 추가가 불가피하면, 파일 최상단에 `// CARET MODIFICATION:`으로 Caret 추가 파일임을 표시
- 단일 기능을 위한 여러 파일 변경

## 관련 워크플로우
- 접근법이 불확실할 때 `/critical-verification` 사용
- 통합 포인트 테스트를 위해 `/tdd-cycle` 고려
- 상태 관리 필요시 `/storage-patterns` 적용
</detailed_sequence_of_steps>

<general_guidelines>
이 워크플로우는 업스트림 변경사항 병합 가능성을 유지하면서 Cline 파일을 안전하게 수정하도록 보장합니다.

원자적 접근법은 각 단계에서 명확한 절차를 제공하여 버그나 충돌 도입 위험을 줄입니다.

의심스러울 때는 Cline 파일 수정보다 caret-src/ 구현을 선호하세요.
</general_guidelines>
