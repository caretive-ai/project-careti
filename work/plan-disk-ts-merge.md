# `src/core/storage/disk.ts` 병합 충돌 해결 계획

## 1. 충돌 분석

`disk.ts` 파일의 충돌은 두 가지 주요 원인으로 발생했습니다.

1.  **브랜딩 차이**: 파일 경로에 'Caret'을 사용할지 'Cline'을 사용할지에 대한 차이입니다.
2.  **구조적 리팩토링**: `upstream/main` (Cline)에서 `HostProvider`를 도입하여 전역 저장소 경로를 관리하는 방식이 근본적으로 변경되었습니다. 또한, 태스크별 설정을 저장하는 새로운 기능이 추가되었습니다.

## 2. 병합 전략

Cline의 구조 개선을 수용하면서 Caret의 브랜딩 정체성을 유지하는 방향으로 병합합니다.

1.  **Cline의 구조(HostProvider) 수용**: `HostProvider`를 사용하는 `upstream/main`의 코드를 기본으로 채택합니다. 이는 Cline의 중요한 아키텍처 개선 사항을 따르기 위함이며, 향후 유지보수성을 높여줍니다. `ensureStateDirectoryExists`, `readTaskHistoryFromState` 등의 함수는 모두 `HostProvider`를 사용하는 Cline 버전을 따릅니다.
2.  **Caret 브랜딩 유지**: Cline 코드를 기반으로 하되, 파일 경로에 포함된 'Cline' 문자열은 모두 'Caret'으로 수정하여 브랜딩 일관성을 유지합니다.
3.  **Caret 고유 기능 유지**: `GlobalFileNames` 객체에 추가된 페르소나 관련 파일(`persona.md` 등) 정의와 같은 Caret의 고유 기능은 그대로 유지합니다.

## 3. 실행 계획

1.  `disk.ts` 파일의 내용을 `upstream/main`의 리팩토링된 구조를 기반으로 재구성합니다.
2.  재구성된 코드에서 다음 부분을 Caret에 맞게 수정합니다.
    -   `ensureRulesDirectoryExists` 함수 내 경로를 'Caret'으로 수정합니다.
    -   `ensureWorkflowsDirectoryExists` 함수 내 경로를 'Caret'으로 수정합니다.
    -   `ensureMcpServersDirectoryExists` 함수 내 경로를 'Caret'으로 수정합니다.
    -   `GlobalFileNames` 객체에 있는 Caret의 고유 수정 사항을 유지합니다.
3.  `replace_in_file` 도구를 사용하여 한 번에 전체 파일을 올바른 내용으로 덮어씁니다.
4.  수정 후 `npm run compile`을 실행하여 `disk.ts`와 관련된 컴파일 오류가 해결되었는지 확인합니다.
