# 수정 프로토콜 - Cline 파일 안전성

Cline 원본 파일 변경을 위한 수정 프로토콜입니다.

## 핵심 원칙
**CARETI MODIFICATION 주석을 사용하여 Cline 원본 파일 수정 최소화**

## 수정 전 체크리스트
- [ ] Cline 원본 파일인가? (src/, webview-ui/, proto/, scripts/, evals/, docs/, locales/, configs/)
- [ ] careti-src/에서 대신 할 수 있는가? (항상 Level 1 선호)
- [ ] 수정이 절대적으로 필요한가?

## 수정 전략
```typescript
// CARETI MODIFICATION: [무엇을, 왜 하는지 명확한 설명]
// 예: 향상된 기능을 위한 Caret 래퍼 초기화
const caretIntegration = new CaretFeature();
```

## 수정 규칙
1. **주석 추가**: `// CARETI MODIFICATION: [명확한 설명]`
2. **최소 유지**: 파일당 최대 1-3줄
3. **완전 교체**: 절대 기존 코드를 주석 처리하지 않음
4. **즉시 검증**: 변경 후 `npm run compile`

## 검증 단계
- [ ] CARETI MODIFICATION 주석이 명확하게 존재
- [ ] 수정이 최소 (최대 1-3줄)
- [ ] 컴파일 성공
- [ ] 익스텐션이 오류 없이 로드
- [ ] Cline과 Caret 기능 모두 작동

## 대안적 접근
1. **먼저 시도**: careti-src/ 래퍼 사용 (Level 1)
2. **두번째 시도**: CARETI 주석과 함께 최소 수정 (Level 2)
3. **최후 수단**: 완전한 문서화와 함께 대규모 수정 (Level 3)

## 일반 가이드라인
이 프로토콜은 업스트림 변경을 병합하는 능력을 유지하면서 Cline 파일의 안전한 수정을 보장합니다. CARETI MODIFICATION 주석 접근 방식은 deprecated된 .cline 백업 방법을 대체합니다.

## 미러링 정책
- 이 파일 수정 시 `.agents/workflows/atoms/modification-protocol.md`도 동일하게 업데이트
