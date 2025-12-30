# 백엔드 작업 계획: /newrule 표준 경로 정리

## 1. 목표
`/newrule`는 **모드/브랜드와 무관하게** 규칙 파일을 `.agents/context/`에 생성해야 합니다. 레거시 규칙 경로 리디렉션은 제거하고, 단일 표준 경로만 사용합니다.

## 2. 분석
`src/core/prompts/commands.ts`를 직접 수정하는 방식은 Cline 원본 파일 변경이므로 지양합니다. 대신, 규칙 생성 로직은 이미 `GlobalFileNames.caretRules`와 `ensureLocalClineDirExists` 기반으로 표준 경로를 사용하도록 정리되어 있어야 합니다.

## 3. 실행 계획

### 1단계: 생성 경로 확인
- `src/core/context/instructions/user-instructions/rule-helpers.ts`에서 `createRuleFile`가 `.agents/context/`로 생성되는지 확인합니다.
- 하드코딩된 레거시 경로 또는 모드 분기 로직이 있다면 제거합니다.

### 2단계: 디렉토리 생성 보장
- `.agents/context/`가 없을 경우 자동 생성되도록 `ensureLocalClineDirExists` 경로를 확인합니다.

### 3단계: 검증
- `/newrule` 실행 시 파일이 항상 `.agents/context/`에 생성되는지 확인합니다.
- 레거시 경로로 생성/리디렉션되는 코드가 없는지 확인합니다.

## 4. 조사할 파일
- **규칙 생성 로직:** `src/core/context/instructions/user-instructions/rule-helpers.ts`
- **규칙 경로 상수:** `src/core/storage/disk.ts`
- **도구 실행 경로(확인용):** `src/core/task/ToolExecutor.ts`
