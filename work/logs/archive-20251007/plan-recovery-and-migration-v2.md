# 작업 계획: Cline 병합 문제 복구 및 API 마이그레이션 (v2)

## 1. 목표

마스터의 정확한 교차 검증 결과를 바탕으로, `src/hosts/host-provider.ts` 파일의 잘못된 수정을 긴급 복구하고, Cline v3.32.6의 실제 API 변경 사항을 반영하여 116개의 컴파일 에러를 해결한다.

## 2. 핵심 작업 원칙 (Master's Directives)

- **머징 영향 중심 사고**: 단순 디버깅에 매몰되지 않고, 항상 Cline 변경이 Caret에 미치는 구조적 영향을 중심으로 문제를 분석하고 해결한다.
- **Caret 주석 원칙 준수**: Cline의 `src/` 디렉토리 내 파일을 수정할 때는, 반드시 `// CARET MODIFICATION:` 주석과 함께 명확한 변경 사유를 기재한다.
- **최소 침습 및 `caret-src` 우선**: 신규 기능 구현이나 대규모 수정이 필요할 경우, Cline 코드 직접 수정을 최소화하고 `caret-src/` 내에 독립적인 모듈로 구현하는 것을 최우선으로 한다.

## 2.1. 기본 원칙

- **폐기**: 이전의 모든 계획(`plan-merge-reintegration.md`, `plan-cline-api-migration.md`)은 완전히 폐기한다. 이 계획들은 근본 원인을 잘못 진단했다.
- **근거**: 이 계획은 마스터께서 제공한 "올바른 해결 전략 (수정안)"을 기반으로 한다.
- **최우선 과제**: 잘못 수정된 `host-provider.ts` 파일 복구를 최우선으로 진행하여 전역적인 에러의 근원을 제거한다.

---

### **Phase 0: 긴급 복구 (Emergency Recovery)**

> **목표**: 116개 에러의 근본 원인인 `host-provider.ts` 파일을 즉시 복원하여 컴파일 에러의 상당수를 제거하고, 문제 해결의 기반을 마련한다.

- **Step 0.1: `HostProvider` 파일 복원**
  - **명령어**: `cp cline-latest/src/hosts/host-provider.ts src/hosts/host-provider.ts`
  - **설명**: Caret 코드베이스에서 잘못 수정된 `host-provider.ts`를 Cline의 원본 파일로 덮어써서 긴급 복구한다.

- **Step 0.2: 컴파일 에러 재확인**
  - **명령어**: `npm run compile`
  - **설명**: `HostProvider` 복원 후 남은 에러의 개수와 종류를 다시 확인하여, 다음 단계의 정확한 범위를 설정한다.

---

### **Phase 1: 핵심 API 수정**

> **목표**: `HostProvider` 복원 후 남은 에러들 중, 핵심적인 API 변경 사항과 관련된 문제들을 해결한다.

- **Step 1.1: `PostHog` 설정 구조 변경 대응 (유지)**
  - **대상**: `src/services/telemetry/`
  - **작업**: `isPostHogConfigValid` 함수 제거, `PostHogClientConfig` → `posthogConfig` 상수 변경 등 실제 Cline의 변경 사항을 적용한다.

- **Step 1.2: `Feature Flag` 이터레이션 수정**
  - **대상**: `src/services/feature-flags/`
  - **작업**: `FEATURE_FLAGS`가 더 이상 iterable하지 않으므로, `for...of` 루프를 사용하는 코드를 `Object.values()`나 다른 적절한 방식으로 수정한다.

- **Step 1.3: Proto `OCA` 타입 추가**
  - **대상**: `proto/` 및 관련 생성된 파일
  - **작업**: `OcaCompatibleModelInfo`, `OcaModelInfo` 등의 타입이 존재하지 않는 문제를 해결하기 위해, 관련 proto 파일을 수정하거나, 타입 이름이 변경되었다면 (예: `OpenAiCompatibleModelInfo`) 해당 이름으로 코드를 수정한다.

---

### **Phase 2: 남은 에러의 체계적 해결**

> **목표**: Phase 0과 1에서 해결되지 않은 나머지 에러들을 마스터의 분석에 따라 체계적으로 해결한다.

- **Step 2.1: `src/core/commands/` 신규 파일 관련 에러 처리**
- **Step 2.2: `src/integrations/checkpoints/` 업데이트 관련 에러 처리**
- **Step 2.3: `src/core/workspace/` 업데이트 관련 에러 처리**
- **Step 2.4: 테스트 파일(`src/services/uri/SharedUriHandler.test.ts` 등) 에러 수정**

---

### **Phase 3: 전체 시스템 검증 (유지)**

> **목표**: 모든 에러가 해결된 후, 시스템이 안정적으로 동작하는지 최종 검증한다.

- **Step 3.1: 전체 컴파일 성공**
  - **명령어**: `npm run compile`

- **Step 3.2: 자동화 테스트 실행**
  - **명령어**: `npm run test:webview`

- **Step 3.3: 수동 E2E 테스트**
  - **작업**: VSCode에서 확장 프로그램을 직접 실행하여 기능 동작을 최종 확인한다.
