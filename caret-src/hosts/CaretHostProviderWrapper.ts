import { HostProvider } from '@/hosts/host-provider';

export class CaretHostProviderWrapper {
  constructor(private readonly hostProvider: HostProvider) {}

  // TODO: 변경된 HostProvider의 메서드를 호출하고
  // Caret에 필요한 인터페이스를 제공하는 메서드들을 구현할 예정
}
