# Task #006-3: `ClineAccount` 타입 변경 분석 및 대응 전략 수립

- **상위 작업:** [Task #006: 업스트림 병합 충돌 해결 계획](./006-upstream-merge-conflict-resolution-plan.md)
- **목표:** `upstream` 병합으로 인해 변경된 `ClineAccount` 관련 타입의 상세 내역을 분석하고, Caret 프로젝트의 아키텍처 방향성에 부합하는 최적의 대응 전략을 수립한다.

---

## 1. 배경

`upstream/main` 병합 과정에서, `CaretAccountService`와 관련된 다수의 타입 불일치 오류가 발생했다. 이는 Caret이 사용하는 기존 계정 관련 타입(`caret-src/shared/CaretAccount.ts`)과 `Cline`의 최신 타입(`src/shared/ClineAccount.ts`) 간의 차이 때문에 발생한 문제이다.

이 문제를 해결하기에 앞서, 섣부른 코드 수정이 Caret 백엔드 서버 팀의 작업에 미칠 수 있는 영향을 최소화하고, 장기적인 관점에서 올바른 아키텍처를 선택하기 위해 본 분석을 수행한다.

## 2. 타입별 상세 변경 내역

| 타입 | 기존 Caret 타입 (`CaretAccount.ts`) | 새로운 Cline 타입 (`ClineAccount.ts`) | 변경 내용 요약 |
| :--- | :--- | :--- | :--- |
| **`BalanceResponse`** | `currentBalance: number` | `balance: number`<br>`userId: string` | 필드명 변경 (`currentBalance`→`balance`), `userId` 필드 추가. |
| **`PaymentTransaction`** | `paidAt: string`<br>`amountCents: string`<br>`credits: string` | `paidAt: string`<br>`amountCents: number`<br>`credits: number`<br>`creatorId: string` | 숫자 관련 필드의 타입 변경 (`string`→`number`), `creatorId` 필드 추가. |
| **`UsageTransaction`** | `spentAt: string`<br>`credits: string`<br>`modelProvider: string`<br>`model: string`<br>`promptTokens: string`<br>`completionTokens: string` | `createdAt: string`<br>`creditsUsed: number`<br>`aiInferenceProviderName: string`<br>`aiModelName: string`<br>`promptTokens: number`<br>`completionTokens: number`<br>... 외 9개 필드 추가 | **전면 개편 수준.** 필드명, 타입이 대거 변경되고, 상세 분석을 위한 수많은 필드가 추가됨. |

## 3. 아키텍처 선택지 분석

### 선택지 1: 타입 동기화 (Cline 종속성 수용)
- **실행 방안:** `CaretAccount.ts`를 `ClineAccount.ts`와 완전히 일치시키고, Caret 백엔드 팀에 API 응답 형식 변경을 요청한다.
- **장점:** 클라이언트 코드가 단순해지고, 향후 `upstream` 병합이 용이하다.
- **단점:** Caret 서버가 `Cline`의 변경에 종속되며, 다른 팀의 개발 로드맵에 영향을 준다.

### 선택지 2: 데이터 변환 계층 구현 (Caret 독립성 유지)
- **실행 방안:** `CaretAccount.ts`는 현재 상태를 유지한다. 대신 `CaretAccountService` 내부에, Caret API 응답을 `Cline` 타입으로 변환하는 로직을 추가한다.
- **장점:** Caret 서버의 완전한 독립성을 보장한다. 다른 팀에 영향을 주지 않는다.
- **단점:** 클라이언트 코드에 변환 로직이 추가되어 복잡성이 소폭 증가하고, 향후 `Cline` 타입 변경 시마다 해당 로직을 유지보수해야 한다.

## 4. 최종 결정 및 전략

**서버 개발팀과의 협의 결과**, Caret 백엔드 API가 Cline의 데이터 모델을 따르기로 결정되었습니다. 이에 따라, 클라이언트-서버 간의 데이터 정합성과 장기적인 유지보수 효율성을 위해 **선택지 1 (타입 동기화)** 을 최종 전략으로 채택합니다.

-   **실행 방안:**
    1.  `caret-src/shared/CaretAccount.ts`의 모든 타입을 `src/shared/ClineAccount.ts`의 최신 타입 정의와 완전히 일치시킵니다.
    2.  `CaretAccountService` 등 관련 서비스에서 새로운 타입을 사용하도록 코드를 수정합니다.
    3.  이 변경 사항은 Caret 백엔드 팀이 API 응답을 새로운 형식에 맞춰 업데이트하는 것을 전제로 합니다.

-   **기대 효과:**
    -   클라이언트 측의 복잡한 데이터 변환 로직이 제거되어 코드가 단순해집니다.
    -   향후 Cline `upstream` 변경 사항을 통합할 때 발생할 수 있는 충돌을 최소화합니다.
    -   클라이언트와 서버 간의 명확한 단일 데이터 모델을 확립합니다.

이 전략을 통해, 당면한 컴파일 오류를 근본적으로 해결하고, 프로젝트 전체의 기술적 일관성을 확보합니다.
