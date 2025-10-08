# `.vscodeignore` 병합 분석 및 실행 로그

## 1. 개요
`master-merge-plan.md`의 `Phase 3-2`에 따라 `.vscodeignore`의 병합 충돌을 해결한다.

- **분석 대상**:
    - `HEAD`: `work/logs/vscodeignore-head.txt` (Caret)
    - `UPSTREAM`: `work/logs/vscodeignore-upstream.txt` (Cline)
    - `MERGE-BASE`: `work/logs/vscodeignore-base.txt` (공통 조상)

## 2. 충돌 해결 원칙 재확인
마스터 문서의 `0.4` 원칙에 따라 3-way 비교를 수행했다. 최종 병합 결과는 `UPSTREAM` 버전을 기준으로 하되, 'Caret 고유 항목'을 선별하여 추가/유지한다.

## 3. 항목별 3-Way 비교 분석

- **`UPSTREAM` 변경 사항**:
    - `standalone/**`, `**/*.ts`, Storybook 관련 파일 등 다수의 규칙을 추가/수정했다. 이는 블랙리스트(blacklist) 기반의 접근 방식이다.

- **`HEAD` 변경 사항 (Caret 고유 항목)**:
    - **Whitelist 접근 방식 채택**: `**`로 모든 파일을 먼저 무시하고, `!dist/**`, `!webview-ui/build/**`, `!assets/**` 등 확장 프로그램 패키지에 반드시 포함되어야 할 파일 및 디렉토리만 명시적으로 포함(`!`)하는 방식으로 전체 구조를 변경했다.
    - `caret-src/**`, `caret-b2b/**`, `caret-docs/**` 등 Caret 고유의 개발 디렉토리를 명시적으로 제외했다.

## 4. 최종 병합 결론
Caret의 Whitelist 접근 방식이 `UPSTREAM`의 블랙리스트 접근 방식보다 더 명시적이고 안정적이며, 의도치 않은 파일이 패키징에 포함될 위험을 원천적으로 차단한다. 또한, `UPSTREAM`에서 무시하고자 했던 소스 파일(`src/**`, `standalone/**` 등)들을 이미 포함하고 있다.

따라서, `UPSTREAM`의 변경 사항을 개별적으로 반영하는 대신, Caret의 고유한 전략적 개선 사항인 **`HEAD`의 Whitelist 방식 전체를 채택**하여 `.vscodeignore` 파일을 덮어쓴다.
