Cline 원본 파일 수정을 위한 백업 프로토콜을 따르고 있습니다.

<detailed_sequence_of_steps>
# 백업 프로토콜 - Cline 파일 안전성

## 핵심 원칙
**백업과 주석 없이는 절대 Cline 원본 파일을 수정하지 않는다**

## 수정 전 체크리스트
- [ ] 이것이 Cline 원본 파일인가? (src/, webview-ui/, proto/, scripts/, evals/, docs/, locales/, configs/)
- [ ] .cline 백업이 이미 존재하는가? `ls filename.ext.cline`
- [ ] 존재한다면: 기존 .cline 백업을 **절대 덮어쓰지 않는다**

## 백업 생성
```bash
# 형식: {파일명-확장자}.cline
cp original.ts original.ts.cline
cp package.json package.json.cline
cp README.md README.md.cline
```

## 수정 규칙
1. **주석 추가**: `// CARET MODIFICATION: [명확한 설명]`
2. **최소한으로 유지**: 파일당 최대 1-3줄
3. **완전 교체**: 기존 코드를 주석 처리하지 않음
4. **즉시 검증**: 변경 후 `npm run compile` 실행

## 검증 단계
- [ ] 백업이 존재하며 원본 내용을 포함
- [ ] CARET MODIFICATION 주석이 존재
- [ ] 코드가 성공적으로 컴파일됨
- [ ] 수정이 최소한이며 집중적임

## 복구 과정
```bash
# 문제가 발생한 경우
cp filename.ext.cline filename.ext
```

## 관련 워크플로우
- L2/L3 결정을 위해 `/modification-levels`와 함께 사용
- 적절한 마킹을 위해 `/comment-protocol`과 함께 사용
- 변경 후 테스트를 위해 `/verification-steps`와 함께 사용
</detailed_sequence_of_steps>

<general_guidelines>
이 프로토콜은 업스트림 변경 사항을 병합할 수 있는 능력을 유지하면서 Cline 원본 파일의 안전한 수정을 보장합니다.

.cline 백업 형식은 쉬운 식별과 원본 내용 복구를 가능하게 합니다.

백업을 건너뛰지 마세요 - 병합 충돌을 방지하고 안전한 실험을 가능하게 합니다.
</general_guidelines>