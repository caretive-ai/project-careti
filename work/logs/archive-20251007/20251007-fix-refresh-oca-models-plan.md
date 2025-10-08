# Plan: `refreshOcaModels` 타입 에러 해결

## 1. 목표

`OpenAiCompatibleModelInfo` 타입 변경으로 인해 `src/core/controller/models/refreshOcaModels.ts` 파일에서 발생하는 7개의 컴파일 에러를 해결합니다.

## 2. 분석

1.  `refreshOcaModels` 함수의 반환 타입이 `Promise<OpenAiCompatibleModelInfo>`로 잘못 지정되어 있습니다. 모델 목록을 반환해야 하므로 `Promise<OpenRouterCompatibleModelInfo>`가 올바른 타입입니다.
2.  에러 발생 시 `{ error: "..." }` 객체를 반환하고 있으나, 변경된 타입에는 `error` 속성이 없습니다. 에러는 예외(exception)를 통해 처리해야 합니다.
3.  `CaretModelInfo.create` 호출 시 `surveyContent`, `surveyId`, `banner`, `modelName` 등 더 이상 존재하지 않는 속성에 값을 할당하고 있습니다.

## 3. 수정 계획

### `src/core/controller/models/refreshOcaModels.ts` 파일 수정

1.  **Import 수정**: `OpenAiCompatibleModelInfo` 대신 `OpenRouterCompatibleModelInfo`를 import 합니다.
2.  **반환 타입 변경**: `refreshOcaModels` 함수의 반환 타입을 `Promise<OpenRouterCompatibleModelInfo>`로 수정합니다.
3.  **에러 처리 방식 변경**:
    -   `return OpenAiCompatibleModelInfo.create({ error: "..." })` 코드를 `throw new Error("...")`로 변경합니다.
4.  **`CaretModelInfo` 생성 로직 수정**:
    -   `CaretModelInfo.create` 함수에 전달되는 객체에서 `surveyContent`, `surveyId`, `banner`, `modelName` 속성 할당을 제거합니다.
5.  **최종 반환문 수정**:
    -   `return OpenAiCompatibleModelInfo.create({ models })`를 `return OpenRouterCompatibleModelInfo.create({ models })`로 수정합니다.

## 4. 검증

1.  파일 수정 후 `npm run compile`을 실행합니다.
2.  `src/core/controller/models/refreshOcaModels.ts` 관련 에러가 모두 해결되었는지 확인하고, 전체 에러 수가 감소했는지 확인합니다.
3.  결과를 마스터께 보고합니다.
