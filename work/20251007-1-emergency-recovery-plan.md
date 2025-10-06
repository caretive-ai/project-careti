# 긴급 복구 계획 (Phase 0)

## 목표
잘못 수정된 `src/hosts/host-provider.ts` 파일을 Cline 원본으로 복원하여 대규모 컴파일 에러의 근본 원인을 제거하고, 복구 상태를 확인합니다.

## 단계

1.  **`host-provider.ts` 파일 복원**: `cline-latest` 서브모듈에 있는 원본 파일로 `src/hosts/host-provider.ts`를 덮어씁니다.
    -   **명령어**: `cp cline-latest/src/hosts/host-provider.ts src/hosts/host-provider.ts`

2.  **컴파일 재시도 및 결과 확인**: 파일 복원 후 `npm run compile`을 실행하여 116개 이상의 컴파일 에러가 얼마나 감소했는지 확인합니다.
    -   **명령어**: `npm run compile`

3.  **결과 분석**: 컴파일 결과를 분석하여 남은 에러의 종류와 수를 파악하고, `work/plan-recovery-and-migration-v2.md`의 다음 단계를 준비합니다.
