# 작업 계획: `Controller`의 `Task` 생성자 호출 방식 수정

## 1. 목표

`cline/master` 병합으로 변경된 `Task` 클래스의 새로운 생성자(`TaskParams` 객체 사용)에 맞게, `src/core/controller/index.ts`에서 `Task` 객체를 생성하는 코드를 수정하여 관련 컴파일 에러를 해결한다.

## 2. 분석

- 현재 `Controller`의 `createTask` 메소드는 변경 전 `Task` 생성자처럼 26개의 인자를 순서대로 전달하고 있다.
- 새로운 `Task` 생성자는 모든 인자를 `TaskParams`라는 단일 객체에 담아 전달받도록 변경되었다.
- 이 불일치로 인해 `Expected 1 arguments, but got 26.` 라는 치명적인 컴파일 에러가 발생하고 있다.

## 3. 해결 전략

`controller/index.ts`의 `createTask` 메소드 내부에서 `new Task(...)`를 호출하는 부분을 새로운 `TaskParams` 객체 형식에 맞게 수정한다.

## 4. 작업 단계

### Step 1: `controller/index.ts` 파일 읽기

- 수정 대상인 `src/core/controller/index.ts` 파일의 전체 내용을 다시 확인한다.

### Step 2: `createTask` 메소드 수정 (`replace_in_file`)

- `createTask` 메소드 내에서 `new Task(...)` 부분을 찾는다.
- 26개의 인자를 나열하는 대신, `TaskParams` 객체 리터럴(`{ controller: this, mcpHub: this.mcpHub, ... }`)을 사용하여 `Task` 생성자를 호출하도록 코드를 수정한다.
- 각 속성에 올바른 변수가 매핑되도록 주의한다.

### Step 3: 검증

- `npm run compile`을 실행하여 `controller/index.ts`의 생성자 관련 에러가 해결되었는지 확인한다.
- 이 수정으로 인해 다른 파일들의 에러 개수도 줄어드는지 확인한다.
