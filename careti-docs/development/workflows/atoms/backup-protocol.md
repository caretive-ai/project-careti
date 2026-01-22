> ⚠️ (Deprecated mirror) 최신 Atom은 `.agents/context/workflows/atoms/backup-protocol.yaml`를 기준으로 보세요.

Cline 원본 파일 수정을 위한 백업 프로토콜을 따르고 있습니다.

<detailed_sequence_of_steps>
# 백업 프로토콜 - Cline 파일 안전성

## 핵심 원칙
**`.cline` 백업은 Deprecated. `// CARETI MODIFICATION:` 주석 + git 기반 복구로 안전성을 확보한다**

## 수정 전 체크리스트
- [ ] 이것이 Cline 원본 파일인가? (src/, webview-ui/, proto/, scripts/, evals/, docs/, locales/, configs/)
- [ ] `.cline` 백업을 새로 만들지 않는다(Deprecated)

## 복구(문제 발생 시)
```bash
# git 기준으로 되돌립니다(예)
git checkout -- filename.ext
```

## 수정 규칙
1. **주석 추가**: `// CARETI MODIFICATION: [명확한 설명]`
2. **최소한으로 유지**: 파일당 최대 1-3줄
3. **완전 교체**: 기존 코드를 주석 처리하지 않음
4. **즉시 검증**: 변경 후 `npm run compile` 실행

## 검증 단계
- [ ] 백업이 존재하며 원본 내용을 포함
- [ ] CARETI MODIFICATION 주석이 존재
- [ ] 코드가 성공적으로 컴파일됨
- [ ] 수정이 최소한이며 집중적임

## 신규 파일 예외(테스트 등)
- 보호 디렉토리(`src/`, `webview-ui/` 등)에 신규 파일 추가가 불가피하면, 파일 최상단에 `// CARETI MODIFICATION:`으로 Careti 추가 파일임을 표시

## 관련 워크플로우
- L2/L3 결정을 위해 `/modification-levels`와 함께 사용
- 적절한 마킹을 위해 `/comment-protocol`과 함께 사용
- 변경 후 테스트를 위해 `/verification-steps`와 함께 사용
</detailed_sequence_of_steps>

<general_guidelines>
이 프로토콜은 업스트림 변경 사항을 병합할 수 있는 능력을 유지하면서 Cline 원본 파일의 안전한 수정을 보장합니다.

`.cline` 백업 생성 규칙은 더 이상 사용하지 않습니다(Deprecated).
</general_guidelines>
