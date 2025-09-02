Cline 원본 파일 변경을 위한 수정 프로토콜을 따르고 있습니다.

<detailed_sequence_of_steps>
# 수정 프로토콜 - Cline 파일 안전성

## 핵심 원칙
**CARET MODIFICATION 주석을 사용하여 Cline 원본 파일 수정을 최소화**

## 수정 전 체크리스트
- [ ] Cline 원본 파일인가? (src/, webview-ui/, proto/, scripts/, evals/, docs/, locales/, configs/)
- [ ] caret-src/에서 대신 할 수 있는가? (항상 Level 1 선호)
- [ ] 수정이 절대적으로 필요한가?

## 수정 전략
```typescript
// CARET MODIFICATION: [무엇을 왜 하는지 명확한 설명]
// 예시: 향상된 기능을 위한 Caret 래퍼 초기화
const caretIntegration = new CaretFeature();
```

## 수정 규칙
1. **주석 추가**: `// CARET MODIFICATION: [명확한 설명]`
2. **최소한 유지**: 파일당 최대 1-3줄
3. **완전 교체**: 기존 코드를 주석 처리하지 않음
4. **즉시 검증**: 변경 후 `npm run compile`

## 검증 단계
- [ ] CARET MODIFICATION 주석이 존재하고 명확함
- [ ] 수정이 최소한임 (최대 1-3줄)
- [ ] 컴파일 성공
- [ ] 확장이 오류 없이 로드됨
- [ ] Cline과 Caret 기능 모두 작동함

## 대안 접근법
1. **첫 번째 시도**: caret-src/ 래퍼 사용 (Level 1)
2. **두 번째 시도**: CARET 주석과 함께 최소 수정 (Level 2)
3. **최후 수단**: 완전한 문서화와 함께 주요 수정 (Level 3)
</detailed_sequence_of_steps>

<general_guidelines>
이 프로토콜은 업스트림 변경사항을 병합할 수 있는 능력을 유지하면서 Cline 파일을 안전하게 수정하도록 보장합니다. CARET MODIFICATION 주석 접근법이 폐기된 .cline 백업 방법을 대체합니다.
</general_guidelines>