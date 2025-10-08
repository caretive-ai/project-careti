# Phase 0: 긴급 복구 실행 계획

이 문서는 `work/plan-recovery-and-migration-v2.md`에 명시된 Phase 0 작업을 실행하기 위한 계획입니다.

## Step 0.1: `HostProvider` 파일 복원

- **명령어**: `cp cline-latest/src/hosts/host-provider.ts src/hosts/host-provider.ts`
- **목표**: 잘못 수정된 `host-provider.ts` 파일을 Cline 원본으로 복원하여 문제의 근원을 제거합니다.

## Step 0.2: 컴파일 에러 재확인

- **명령어**: `npm run compile`
- **목표**: 파일 복원 후 남은 컴파일 에러의 수와 종류를 확인하여 다음 단계의 범위를 명확히 합니다.
- **로그 저장**: 결과는 `work/logs/20251007-2-compile-after-recovery.log` 파일에 저장될 것입니다.
