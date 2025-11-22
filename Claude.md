# Claude 작업 메모 (Caret-Cline 머지)

- `.caretrules/build-system.md`, `caret-docs/merging/merge-standard-guide.md`를 먼저 읽고 동일 원칙을 적용.
- **Cline 소스 최소 침습**: 린트/빌드 오류는 설정(override/제외)으로 우선 해결. 불가피한 코드 수정은 1~3줄 + `// CARET MODIFICATION: <이유>` 주석 필수.
- **Baseline 우선 복원**: 머지 시작 시 upstream `package.json`과 정적 자산(`assets/**`, 아이콘/배너 등`)을 먼저 복사해 빌드/런타임을 통과시킨 뒤 Caret 브랜딩을 덮어쓴다. (리소스 누락 방지)
- **Caret 소스 자유 수정**: `caret-src/`, `caret-scripts/`, `caret-docs/`, 자산은 필요 시 수정/추가 가능.
- **설정 변경 기록**: 빌드/린트 예외를 추가하면 머지 문서나 PR 노트에 이유/범위를 남긴다.
- **검증**: 완화 설정으로 테스트가 스킵되지 않았는지 `npm run compile`/테스트 결과로 확인.
