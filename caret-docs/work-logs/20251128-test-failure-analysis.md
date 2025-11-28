# Hook 테스트 실패 분석 (2025-11-28)

## 1. 현상 분석
- `npm run test` 실행 시 `src/core/hooks/__tests__/taskresume.test.ts` 등 Hook 관련 테스트에서 61건의 실패가 지속적으로 발생 중.
- 주요 에러: `expected '' to match /.../` 또는 `expected '' to be '...'`
  - Hook 실행 결과(stdout)가 빈 문자열로 반환되는 증상.

## 2. 원인 추정
- **Hook 실행 실패**: 테스트 러너 환경에서 Hook 스크립트가 실행되지 않거나, 실행되었더라도 출력이 캡처되지 않음.
- **환경 변수/경로**: 테스트용 `fixtures` 경로 설정이나 실행 권한 문제일 가능성.
- **Node/OS 환경**: 로컬 머신(Bazzite)의 환경 특성.

## 3. 조치 계획 (D-1 TDD 진행을 위해)
- **Hook 테스트 격리**: ModeSystem 검증이 우선이므로, 문제가 되는 Hook 테스트를 임시로 제외(`skip`)하거나 ModeSystem 테스트만 선별 실행.
- **ModeSystem 테스트 실행**: `caret-src/__tests__/prompt-system/mode-system.test.ts` 등 관련 테스트만 실행하여 D-1 과제 완료 여부 검증.

## 4. 실행 명령
```bash
# 전체 테스트 대신 ModeSystem 관련 테스트만 실행
npx mocha "caret-src/__tests__/prompt-system/**/*.test.ts"
