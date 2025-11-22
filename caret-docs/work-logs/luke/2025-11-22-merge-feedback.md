1. 페르소나 템플릿 이미지 여전히 안나옴. 첨부 이미지 참고

2. 하단의 프로바이더 설정에 캐럿과 클라인 버튼이 두개 보임. 첨부 이미지 참고

3. 캐럿 로그인 모델리스트 정상 표기 되지 않음
 - 로그인 정상 처리 되지만, 캐럿 로그인 후 모델리스트 정상적으로 나오지 않고, calude모델만 나옴
   * 혹시 이전에는 하드 코딩되었다가 이번에 서버에서 내려받는 방식으로 바뀐건지 (git log확인)

4, 캐럿 로그인 되어 있지 않은 경우, 계정 영역에는 캐럿 로그인 페이지 떠 있어야함. 3-way비교

5. 클라인 로그인
 - 정상 처리 되지 않음. 아래는 로그인
 LOG [NoOpTelemetryProvider] user.auth_started: {"provider":"cline","extension_version":"3.38.1","platform":"Visual Studio Code","platform_version":"1.106.2","os_type":"linux","os_version":"#1 SMP PREEMPT_DYNAMIC Sat Nov 15 23:48:58 UTC 2025","is_dev":"true"}
LOG [NoOpTelemetryProvider] user.auth_started: {"provider":"cline","extension_version":"3.38.1","platform":"Visual Studio Code","platform_version":"1.106.2","os_type":"linux","os_version":"#1 SMP PREEMPT_DYNAMIC Sat Nov 15 23:48:58 UTC 2025","is_dev":"true"}
INFO SharedUriHandler: Processing URI:{"path":"/auth","query":{},"scheme":"vscode:"}
INFO SharedUriHandler - Auth callback received for null - /auth



6. 캐럿모드의 json 시스템 프롬프트 로딩
 - 역시 동작하지 않음. 제대로 이식되었는지 확인
 - 아래는 로그
 LOG [NoOpTelemetryProvider] task.conversation_turn: {"ulid":"01KAP3WB94CK3QG3A59HHAM2S5","provider":"gemini","model":"gemini-2.5-flash","source":"assistant","mode":"plan","timestamp":"2025-11-22T15:48:55.118Z","tokensIn":14509,"tokensOut":27,"cacheWriteTokens":0,"cacheReadTokens":0,"totalCost":0.004735199999999999,"isNativeToolCall":false,"extension_version":"3.38.1","platform":"Visual Studio Code","platform_version":"1.106.2","os_type":"linux","os_version":"#1 SMP PREEMPT_DYNAMIC Sat Nov 15 23:48:58 UTC 2025","is_dev":"true"}
