# Phase 1-A 실행 계획: Wrapper 및 Service 골격 생성

## 목표
컴파일 에러 그룹 A(핵심 API 및 아키텍처 변경) 문제 해결의 기반을 마련하기 위해, `caret-src` 내에 Wrapper와 Service 클래스의 기본 골격을 생성한다.

## 작업 단계

1.  **`CaretHostProviderWrapper` 생성**
    - **경로**: `caret-src/hosts/CaretHostProviderWrapper.ts`
    - **내용**: `HostProvider`의 구조적 변경을 흡수할 Wrapper 클래스의 기본 골격을 작성한다. 초기에는 빈 클래스로 시작하여 점진적으로 기능을 구현한다.
    - **예상 코드**:
      ```typescript
      import { HostProvider } from '@/hosts/host-provider';

      export class CaretHostProviderWrapper {
        constructor(private readonly hostProvider: HostProvider) {}

        // TODO: 변경된 HostProvider의 메서드를 호출하고
        // Caret에 필요한 인터페이스를 제공하는 메서드들을 구현할 예정
      }
      ```

2.  **`CaretDictationService` 생성**
    - **경로**: `caret-src/services/dictation/CaretDictationService.ts`
    - **내용**: `transcribeAudio` 기능 변경에 대응하기 위한 독립 서비스 클래스의 기본 골격을 작성한다.
    - **예상 코드**:
      ```typescript
      export class CaretDictationService {
        constructor() {}

        // TODO: 변경된 gRPC 호출 방식을 사용하여 오디오를 변환하는
        // public async transcribeAudio(...) 메서드를 구현할 예정
      }
      ```

## 다음 단계
골격 생성이 완료되면, 각 클래스의 내용을 구체적으로 구현하여 `HostProvider.watch` 분리 및 `transcribeAudio` 기능 변경에 대응한다.
