# 브라우저 관련 파일 병합 충돌 해결 계획

## 1. 분석 요약

`src/core/task/tools/handlers/BrowserToolHandler.ts` 파일의 병합 충돌을 분석한 결과, Caret 브랜치에는 다음과 같은 세 가지 유형의 수정이 있었습니다.

1.  **디버깅용 `console.log`**: 병합 과정에서 제거 가능한 임시 코드입니다.
2.  **오류 처리 로직 개선**: 특정 오류 발생 시 브라우저 세션을 유지하도록 변경하여 안정성을 높인 기능 개선입니다.
3.  **브랜딩 문자열 수정**: 알림 메시지에 'Caret' 브랜드를 적용했습니다.

## 2. 병합 전략

"최소 침습 원칙"과 마스터의 지침에 따라, Cline 원본 소스를 최대한 보존하고 Caret의 고유 수정 사항은 최소한으로 적용합니다.

### 제안 전략: Cline 소스 기반 + 최소한의 브랜딩 적용

1.  **Cline 원본으로 복원**: 먼저 `BrowserToolHandler.ts` 파일을 `upstream/main` 버전으로 되돌립니다. 이렇게 하면 Cline의 최신 구조와 로직을 그대로 따르게 됩니다.
2.  **브랜딩만 재적용**: 복원된 파일에서, 알림 메시지 문자열만 Caret 버전으로 수정합니다. 이는 `CARET MODIFICATION` 주석과 함께 단 한 줄의 수정으로 관리됩니다.
3.  **기능 개선은 보류**: 안정성을 높이는 오류 처리 로직 개선은 이번 병합에서는 제외합니다. 이는 Cline과의 차이점을 최소화하여 향후 `upstream` 변경 사항을 더 쉽게 통합하기 위함입니다. 이 기능은 별도의 PR이나 작업으로 재논의할 수 있습니다.

## 3. 실행 계획

1.  `git checkout --theirs src/core/task/tools/handlers/BrowserToolHandler.ts` 명령을 사용하여 파일을 `upstream/main` 버전으로 덮어씁니다.
2.  `replace_in_file`을 사용하여 `showNotificationForApprovalIfAutoApprovalEnabled` 함수 호출 부분의 문자열을 Caret의 브랜딩에 맞게 수정합니다.
3.  다른 브라우저 관련 충돌 파일(`BrowserSession.ts` 등)에도 동일한 전략을 적용할지 검토합니다.
4.  수정 후 `npm run compile`을 실행하여 관련 오류가 해결되었는지 확인합니다.

이 전략은 Caret의 핵심 수정 사항인 브랜딩은 유지하면서도, 병합의 복잡성을 크게 낮추고 향후 유지보수성을 높일 수 있습니다.
