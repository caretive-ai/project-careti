Agent SDK 참조 - TypeScript

페이지 복사

모든 함수, 타입, 인터페이스를 포함한 TypeScript Agent SDK의 완전한 API 참조입니다.

​
설치

Copy
npm install @anthropic-ai/claude-agent-sdk
​
함수
​
query()
Claude Code와 상호작용하기 위한 주요 함수입니다. 메시지가 도착하는 대로 스트리밍하는 비동기 제너레이터를 생성합니다.

Copy
function query({
  prompt,
  options
}: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query
​
매개변수
매개변수	타입	설명
prompt	string | AsyncIterable<SDKUserMessage>	문자열 또는 스트리밍 모드를 위한 비동기 이터러블로서의 입력 프롬프트
options	Options	선택적 구성 객체 (아래 Options 타입 참조)
​
반환값
추가 메서드가 있는 AsyncGenerator<SDKMessage, void>를 확장하는 Query 객체를 반환합니다.
​
tool()
SDK MCP 서버와 함께 사용할 타입 안전한 MCP 도구 정의를 생성합니다.

Copy
function tool<Schema extends ZodRawShape>(
  name: string,
  description: string,
  inputSchema: Schema,
  handler: (args: z.infer<ZodObject<Schema>>, extra: unknown) => Promise<CallToolResult>
): SdkMcpToolDefinition<Schema>
​
매개변수
매개변수	타입	설명
name	string	도구의 이름
description	string	도구가 수행하는 작업에 대한 설명
inputSchema	Schema extends ZodRawShape	도구의 입력 매개변수를 정의하는 Zod 스키마
handler	(args, extra) => Promise<CallToolResult>	도구 로직을 실행하는 비동기 함수
​
createSdkMcpServer()
애플리케이션과 동일한 프로세스에서 실행되는 MCP 서버 인스턴스를 생성합니다.

Copy
function createSdkMcpServer(options: {
  name: string;
  version?: string;
  tools?: Array<SdkMcpToolDefinition<any>>;
}): McpSdkServerConfigWithInstance
​
매개변수
매개변수	타입	설명
options.name	string	MCP 서버의 이름
options.version	string	선택적 버전 문자열
options.tools	Array<SdkMcpToolDefinition>	tool()로 생성된 도구 정의 배열
​
타입
​
Options
query() 함수를 위한 구성 객체입니다.
속성	타입	기본값	설명
abortController	AbortController	new AbortController()	작업 취소를 위한 컨트롤러
additionalDirectories	string[]	[]	Claude가 접근할 수 있는 추가 디렉터리
agents	Record<string, [AgentDefinition](#agentdefinition)>	undefined	프로그래밍 방식으로 하위 에이전트 정의
allowedTools	string[]	모든 도구	허용된 도구 이름 목록
canUseTool	CanUseTool	undefined	도구 사용을 위한 사용자 정의 권한 함수
continue	boolean	false	가장 최근 대화 계속하기
cwd	string	process.cwd()	현재 작업 디렉터리
disallowedTools	string[]	[]	허용되지 않는 도구 이름 목록
env	Dict<string>	process.env	환경 변수
executable	'bun' | 'deno' | 'node'	자동 감지	사용할 JavaScript 런타임
executableArgs	string[]	[]	실행 파일에 전달할 인수
extraArgs	Record<string, string | null>	{}	추가 인수
fallbackModel	string	undefined	주 모델이 실패할 경우 사용할 모델
forkSession	boolean	false	resume으로 재개할 때 원래 세션을 계속하는 대신 새 세션 ID로 분기
hooks	Partial<Record<HookEvent, HookCallbackMatcher[]>>	{}	이벤트를 위한 훅 콜백
includePartialMessages	boolean	false	부분 메시지 이벤트 포함
maxThinkingTokens	number	undefined	사고 과정을 위한 최대 토큰
maxTurns	number	undefined	최대 대화 턴
mcpServers	Record<string, [McpServerConfig](#mcpserverconfig)>	{}	MCP 서버 구성
model	string	CLI 기본값	사용할 Claude 모델
pathToClaudeCodeExecutable	string	자동 감지	Claude Code 실행 파일 경로
permissionMode	PermissionMode	'default'	세션을 위한 권한 모드
permissionPromptToolName	string	undefined	권한 프롬프트를 위한 MCP 도구 이름
resume	string	undefined	재개할 세션 ID
settingSources	SettingSource[]	[] (설정 없음)	로드할 파일시스템 설정을 제어합니다. 생략하면 설정이 로드되지 않습니다. 참고: CLAUDE.md 파일을 로드하려면 'project'를 포함해야 합니다
stderr	(data: string) => void	undefined	stderr 출력을 위한 콜백
strictMcpConfig	boolean	false	엄격한 MCP 검증 강제
systemPrompt	string | { type: 'preset'; preset: 'claude_code'; append?: string }	undefined (빈 프롬프트)	시스템 프롬프트 구성. 사용자 정의 프롬프트의 경우 문자열을 전달하거나, Claude Code의 시스템 프롬프트를 사용하려면 { type: 'preset', preset: 'claude_code' }를 전달합니다. 프리셋 객체 형식을 사용할 때 append를 추가하여 추가 지침으로 시스템 프롬프트를 확장할 수 있습니다
​
Query
query() 함수에서 반환되는 인터페이스입니다.

Copy
interface Query extends AsyncGenerator<SDKMessage, void> {
  interrupt(): Promise<void>;
  setPermissionMode(mode: PermissionMode): Promise<void>;
}
​
메서드
메서드	설명
interrupt()	쿼리를 중단합니다 (스트리밍 입력 모드에서만 사용 가능)
setPermissionMode()	권한 모드를 변경합니다 (스트리밍 입력 모드에서만 사용 가능)
​
AgentDefinition
프로그래밍 방식으로 정의된 하위 에이전트를 위한 구성입니다.

Copy
type AgentDefinition = {
  description: string;
  tools?: string[];
  prompt: string;
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
}
필드	필수	설명
description	예	이 에이전트를 언제 사용할지에 대한 자연어 설명
tools	아니오	허용된 도구 이름 배열. 생략하면 모든 도구를 상속
prompt	예	에이전트의 시스템 프롬프트
model	아니오	이 에이전트를 위한 모델 재정의. 생략하면 주 모델 사용
​
SettingSource
SDK가 설정을 로드하는 파일시스템 기반 구성 소스를 제어합니다.

Copy
type SettingSource = 'user' | 'project' | 'local';
값	설명	위치
'user'	전역 사용자 설정	~/.claude/settings.json
'project'	공유 프로젝트 설정 (버전 제어됨)	.claude/settings.json
'local'	로컬 프로젝트 설정 (gitignore됨)	.claude/settings.local.json
​
기본 동작
settingSources가 생략되거나 undefined일 때, SDK는 파일시스템 설정을 로드하지 않습니다. 이는 SDK 애플리케이션에 격리를 제공합니다.
​
settingSources를 사용하는 이유?
모든 파일시스템 설정 로드 (레거시 동작):

Copy
// SDK v0.0.x처럼 모든 설정 로드
const result = query({
  prompt: "이 코드를 분석해",
  options: {
    settingSources: ['user', 'project', 'local']  // 모든 설정 로드
  }
});
특정 설정 소스만 로드:

Copy
// 프로젝트 설정만 로드, 사용자 및 로컬 설정 무시
const result = query({
  prompt: "CI 검사 실행",
  options: {
    settingSources: ['project']  // .claude/settings.json만
  }
});
테스트 및 CI 환경:

Copy
// 로컬 설정을 제외하여 CI에서 일관된 동작 보장
const result = query({
  prompt: "테스트 실행",
  options: {
    settingSources: ['project'],  // 팀 공유 설정만
    permissionMode: 'bypassPermissions'
  }
});
SDK 전용 애플리케이션:

Copy
// 모든 것을 프로그래밍 방식으로 정의 (기본 동작)
// 파일시스템 종속성 없음 - settingSources 기본값은 []
const result = query({
  prompt: "이 PR 검토",
  options: {
    // settingSources: []가 기본값이므로 지정할 필요 없음
    agents: { /* ... */ },
    mcpServers: { /* ... */ },
    allowedTools: ['Read', 'Grep', 'Glob']
  }
});
CLAUDE.md 프로젝트 지침 로드:

Copy
// CLAUDE.md 파일을 포함하기 위해 프로젝트 설정 로드
const result = query({
  prompt: "프로젝트 규칙에 따라 새 기능 추가",
  options: {
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code'  // CLAUDE.md 사용에 필요
    },
    settingSources: ['project'],  // 프로젝트 디렉터리에서 CLAUDE.md 로드
    allowedTools: ['Read', 'Write', 'Edit']
  }
});
​
설정 우선순위
여러 소스가 로드될 때, 설정은 다음 우선순위로 병합됩니다 (높음에서 낮음):
로컬 설정 (.claude/settings.local.json)
프로젝트 설정 (.claude/settings.json)
사용자 설정 (~/.claude/settings.json)
프로그래밍 방식 옵션 (agents, allowedTools 등)은 항상 파일시스템 설정을 재정의합니다.
​
PermissionMode

Copy
type PermissionMode =
  | 'default'           // 표준 권한 동작
  | 'acceptEdits'       // 파일 편집 자동 승인
  | 'bypassPermissions' // 모든 권한 검사 우회
  | 'plan'              // 계획 모드 - 실행 없음
​
CanUseTool
도구 사용을 제어하기 위한 사용자 정의 권한 함수 타입입니다.

Copy
type CanUseTool = (
  toolName: string,
  input: ToolInput,
  options: {
    signal: AbortSignal;
    suggestions?: PermissionUpdate[];
  }
) => Promise<PermissionResult>;
​
PermissionResult
권한 검사의 결과입니다.

Copy
type PermissionResult = 
  | {
      behavior: 'allow';
      updatedInput: ToolInput;
      updatedPermissions?: PermissionUpdate[];
    }
  | {
      behavior: 'deny';
      message: string;
      interrupt?: boolean;
    }
​
McpServerConfig
MCP 서버를 위한 구성입니다.

Copy
type McpServerConfig = 
  | McpStdioServerConfig
  | McpSSEServerConfig
  | McpHttpServerConfig
  | McpSdkServerConfigWithInstance;
​
McpStdioServerConfig

Copy
type McpStdioServerConfig = {
  type?: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
}
​
McpSSEServerConfig

Copy
type McpSSEServerConfig = {
  type: 'sse';
  url: string;
  headers?: Record<string, string>;
}
​
McpHttpServerConfig

Copy
type McpHttpServerConfig = {
  type: 'http';
  url: string;
  headers?: Record<string, string>;
}
​
McpSdkServerConfigWithInstance

Copy
type McpSdkServerConfigWithInstance = {
  type: 'sdk';
  name: string;
  instance: McpServer;
}
​
메시지 타입
​
SDKMessage
쿼리에서 반환되는 모든 가능한 메시지의 유니온 타입입니다.

Copy
type SDKMessage = 
  | SDKAssistantMessage
  | SDKUserMessage
  | SDKUserMessageReplay
  | SDKResultMessage
  | SDKSystemMessage
  | SDKPartialAssistantMessage
  | SDKCompactBoundaryMessage;
​
SDKAssistantMessage
어시스턴트 응답 메시지입니다.

Copy
type SDKAssistantMessage = {
  type: 'assistant';
  uuid: UUID;
  session_id: string;
  message: APIAssistantMessage; // Anthropic SDK에서
  parent_tool_use_id: string | null;
}
​
SDKUserMessage
사용자 입력 메시지입니다.

Copy
type SDKUserMessage = {
  type: 'user';
  uuid?: UUID;
  session_id: string;
  message: APIUserMessage; // Anthropic SDK에서
  parent_tool_use_id: string | null;
}
​
SDKUserMessageReplay
필수 UUID가 있는 재생된 사용자 메시지입니다.

Copy
type SDKUserMessageReplay = {
  type: 'user';
  uuid: UUID;
  session_id: string;
  message: APIUserMessage;
  parent_tool_use_id: string | null;
}
​
SDKResultMessage
최종 결과 메시지입니다.

Copy
type SDKResultMessage = 
  | {
      type: 'result';
      subtype: 'success';
      uuid: UUID;
      session_id: string;
      duration_ms: number;
      duration_api_ms: number;
      is_error: boolean;
      num_turns: number;
      result: string;
      total_cost_usd: number;
      usage: NonNullableUsage;
      permission_denials: SDKPermissionDenial[];
    }
  | {
      type: 'result';
      subtype: 'error_max_turns' | 'error_during_execution';
      uuid: UUID;
      session_id: string;
      duration_ms: number;
      duration_api_ms: number;
      is_error: boolean;
      num_turns: number;
      total_cost_usd: number;
      usage: NonNullableUsage;
      permission_denials: SDKPermissionDenial[];
    }
​
SDKSystemMessage
시스템 초기화 메시지입니다.

Copy
type SDKSystemMessage = {
  type: 'system';
  subtype: 'init';
  uuid: UUID;
  session_id: string;
  apiKeySource: ApiKeySource;
  cwd: string;
  tools: string[];
  mcp_servers: {
    name: string;
    status: string;
  }[];
  model: string;
  permissionMode: PermissionMode;
  slash_commands: string[];
  output_style: string;
}
​
SDKPartialAssistantMessage
스트리밍 부분 메시지 (includePartialMessages가 true일 때만).

Copy
type SDKPartialAssistantMessage = {
  type: 'stream_event';
  event: RawMessageStreamEvent; // Anthropic SDK에서
  parent_tool_use_id: string | null;
  uuid: UUID;
  session_id: string;
}
​
SDKCompactBoundaryMessage
대화 압축 경계를 나타내는 메시지입니다.

Copy
type SDKCompactBoundaryMessage = {
  type: 'system';
  subtype: 'compact_boundary';
  uuid: UUID;
  session_id: string;
  compact_metadata: {
    trigger: 'manual' | 'auto';
    pre_tokens: number;
  };
}
​
SDKPermissionDenial
거부된 도구 사용에 대한 정보입니다.

Copy
type SDKPermissionDenial = {
  tool_name: string;
  tool_use_id: string;
  tool_input: ToolInput;
}
​
훅 타입
​
HookEvent
사용 가능한 훅 이벤트입니다.

Copy
type HookEvent = 
  | 'PreToolUse'
  | 'PostToolUse'
  | 'Notification'
  | 'UserPromptSubmit'
  | 'SessionStart'
  | 'SessionEnd'
  | 'Stop'
  | 'SubagentStop'
  | 'PreCompact';
​
HookCallback
훅 콜백 함수 타입입니다.

Copy
type HookCallback = (
  input: HookInput, // 모든 훅 입력 타입의 유니온
  toolUseID: string | undefined,
  options: { signal: AbortSignal }
) => Promise<HookJSONOutput>;
​
HookCallbackMatcher
선택적 매처가 있는 훅 구성입니다.

Copy
interface HookCallbackMatcher {
  matcher?: string;
  hooks: HookCallback[];
}
​
HookInput
모든 훅 입력 타입의 유니온 타입입니다.

Copy
type HookInput = 
  | PreToolUseHookInput
  | PostToolUseHookInput
  | NotificationHookInput
  | UserPromptSubmitHookInput
  | SessionStartHookInput
  | SessionEndHookInput
  | StopHookInput
  | SubagentStopHookInput
  | PreCompactHookInput;
​
BaseHookInput
모든 훅 입력 타입이 확장하는 기본 인터페이스입니다.

Copy
type BaseHookInput = {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode?: string;
}
​
PreToolUseHookInput

Copy
type PreToolUseHookInput = BaseHookInput & {
  hook_event_name: 'PreToolUse';
  tool_name: string;
  tool_input: ToolInput;
}
​
PostToolUseHookInput

Copy
type PostToolUseHookInput = BaseHookInput & {
  hook_event_name: 'PostToolUse';
  tool_name: string;
  tool_input: ToolInput;
  tool_response: ToolOutput;
}
​
NotificationHookInput

Copy
type NotificationHookInput = BaseHookInput & {
  hook_event_name: 'Notification';
  message: string;
  title?: string;
}
​
UserPromptSubmitHookInput

Copy
type UserPromptSubmitHookInput = BaseHookInput & {
  hook_event_name: 'UserPromptSubmit';
  prompt: string;
}
​
SessionStartHookInput

Copy
type SessionStartHookInput = BaseHookInput & {
  hook_event_name: 'SessionStart';
  source: 'startup' | 'resume' | 'clear' | 'compact';
}
​
SessionEndHookInput

Copy
type SessionEndHookInput = BaseHookInput & {
  hook_event_name: 'SessionEnd';
  reason: 'clear' | 'logout' | 'prompt_input_exit' | 'other';
}
​
StopHookInput

Copy
type StopHookInput = BaseHookInput & {
  hook_event_name: 'Stop';
  stop_hook_active: boolean;
}
​
SubagentStopHookInput

Copy
type SubagentStopHookInput = BaseHookInput & {
  hook_event_name: 'SubagentStop';
  stop_hook_active: boolean;
}
​
PreCompactHookInput

Copy
type PreCompactHookInput = BaseHookInput & {
  hook_event_name: 'PreCompact';
  trigger: 'manual' | 'auto';
  custom_instructions: string | null;
}
​
HookJSONOutput
훅 반환값입니다.

Copy
type HookJSONOutput = AsyncHookJSONOutput | SyncHookJSONOutput;
​
AsyncHookJSONOutput

Copy
type AsyncHookJSONOutput = {
  async: true;
  asyncTimeout?: number;
}
​
SyncHookJSONOutput

Copy
type SyncHookJSONOutput = {
  continue?: boolean;
  suppressOutput?: boolean;
  stopReason?: string;
  decision?: 'approve' | 'block';
  systemMessage?: string;
  reason?: string;
  hookSpecificOutput?:
    | {
        hookEventName: 'PreToolUse';
        permissionDecision?: 'allow' | 'deny' | 'ask';
        permissionDecisionReason?: string;
      }
    | {
        hookEventName: 'UserPromptSubmit';
        additionalContext?: string;
      }
    | {
        hookEventName: 'SessionStart';
        additionalContext?: string;
      }
    | {
        hookEventName: 'PostToolUse';
        additionalContext?: string;
      };
}
​
도구 입력 타입
모든 내장 Claude Code 도구의 입력 스키마 문서입니다. 이러한 타입은 @anthropic-ai/claude-agent-sdk에서 내보내지며 타입 안전한 도구 상호작용에 사용할 수 있습니다.
​
ToolInput
참고: 이는 명확성을 위한 문서 전용 타입입니다. 모든 도구 입력 타입의 유니온을 나타냅니다.

Copy
type ToolInput = 
  | AgentInput
  | BashInput
  | BashOutputInput
  | FileEditInput
  | FileReadInput
  | FileWriteInput
  | GlobInput
  | GrepInput
  | KillShellInput
  | NotebookEditInput
  | WebFetchInput
  | WebSearchInput
  | TodoWriteInput
  | ExitPlanModeInput
  | ListMcpResourcesInput
  | ReadMcpResourceInput;
​
Task
도구 이름: Task

Copy
interface AgentInput {
  /**
   * 작업에 대한 짧은 (3-5단어) 설명
   */
  description: string;
  /**
   * 에이전트가 수행할 작업
   */
  prompt: string;
  /**
   * 이 작업에 사용할 전문 에이전트 타입
   */
  subagent_type: string;
}
복잡한 다단계 작업을 자율적으로 처리하기 위해 새 에이전트를 시작합니다.
​
Bash
도구 이름: Bash

Copy
interface BashInput {
  /**
   * 실행할 명령
   */
  command: string;
  /**
   * 선택적 타임아웃 (밀리초, 최대 600000)
   */
  timeout?: number;
  /**
   * 이 명령이 수행하는 작업에 대한 명확하고 간결한 5-10단어 설명
   */
  description?: string;
  /**
   * 이 명령을 백그라운드에서 실행하려면 true로 설정
   */
  run_in_background?: boolean;
}
선택적 타임아웃과 백그라운드 실행이 가능한 지속적인 셸 세션에서 bash 명령을 실행합니다.
​
BashOutput
도구 이름: BashOutput

Copy
interface BashOutputInput {
  /**
   * 출력을 검색할 백그라운드 셸의 ID
   */
  bash_id: string;
  /**
   * 출력 라인을 필터링할 선택적 정규식
   */
  filter?: string;
}
실행 중이거나 완료된 백그라운드 bash 셸에서 출력을 검색합니다.
​
Edit
도구 이름: Edit

Copy
interface FileEditInput {
  /**
   * 수정할 파일의 절대 경로
   */
  file_path: string;
  /**
   * 교체할 텍스트
   */
  old_string: string;
  /**
   * 교체할 새 텍스트 (old_string과 달라야 함)
   */
  new_string: string;
  /**
   * old_string의 모든 발생을 교체 (기본값 false)
   */
  replace_all?: boolean;
}
파일에서 정확한 문자열 교체를 수행합니다.
​
Read
도구 이름: Read

Copy
interface FileReadInput {
  /**
   * 읽을 파일의 절대 경로
   */
  file_path: string;
  /**
   * 읽기를 시작할 라인 번호
   */
  offset?: number;
  /**
   * 읽을 라인 수
   */
  limit?: number;
}
텍스트, 이미지, PDF, Jupyter 노트북을 포함하여 로컬 파일시스템에서 파일을 읽습니다.
​
Write
도구 이름: Write

Copy
interface FileWriteInput {
  /**
   * 쓸 파일의 절대 경로
   */
  file_path: string;
  /**
   * 파일에 쓸 내용
   */
  content: string;
}
로컬 파일시스템에 파일을 쓰며, 존재하면 덮어씁니다.
​
Glob
도구 이름: Glob

Copy
interface GlobInput {
  /**
   * 파일과 매치할 glob 패턴
   */
  pattern: string;
  /**
   * 검색할 디렉터리 (기본값은 cwd)
   */
  path?: string;
}
모든 코드베이스 크기에서 작동하는 빠른 파일 패턴 매칭입니다.
​
Grep
도구 이름: Grep

Copy
interface GrepInput {
  /**
   * 검색할 정규식 패턴
   */
  pattern: string;
  /**
   * 검색할 파일 또는 디렉터리 (기본값은 cwd)
   */
  path?: string;
  /**
   * 파일을 필터링할 Glob 패턴 (예: "*.js")
   */
  glob?: string;
  /**
   * 검색할 파일 타입 (예: "js", "py", "rust")
   */
  type?: string;
  /**
   * 출력 모드: "content", "files_with_matches", 또는 "count"
   */
  output_mode?: 'content' | 'files_with_matches' | 'count';
  /**
   * 대소문자 구분 없는 검색
   */
  '-i'?: boolean;
  /**
   * 라인 번호 표시 (content 모드용)
   */
  '-n'?: boolean;
  /**
   * 각 매치 전에 표시할 라인 수
   */
  '-B'?: number;
  /**
   * 각 매치 후에 표시할 라인 수
   */
  '-A'?: number;
  /**
   * 각 매치 전후에 표시할 라인 수
   */
  '-C'?: number;
  /**
   * 출력을 첫 N개 라인/항목으로 제한
   */
  head_limit?: number;
  /**
   * 멀티라인 모드 활성화
   */
  multiline?: boolean;
}
정규식 지원이 있는 ripgrep 기반의 강력한 검색 도구입니다.
​
KillBash
도구 이름: KillBash

Copy
interface KillShellInput {
  /**
   * 종료할 백그라운드 셸의 ID
   */
  shell_id: string;
}
ID로 실행 중인 백그라운드 bash 셸을 종료합니다.
​
NotebookEdit
도구 이름: NotebookEdit

Copy
interface NotebookEditInput {
  /**
   * Jupyter 노트북 파일의 절대 경로
   */
  notebook_path: string;
  /**
   * 편집할 셀의 ID
   */
  cell_id?: string;
  /**
   * 셀의 새 소스
   */
  new_source: string;
  /**
   * 셀의 타입 (code 또는 markdown)
   */
  cell_type?: 'code' | 'markdown';
  /**
   * 편집 타입 (replace, insert, delete)
   */
  edit_mode?: 'replace' | 'insert' | 'delete';
}
Jupyter 노트북 파일의 셀을 편집합니다.
​
WebFetch
도구 이름: WebFetch

Copy
interface WebFetchInput {
  /**
   * 콘텐츠를 가져올 URL
   */
  url: string;
  /**
   * 가져온 콘텐츠에서 실행할 프롬프트
   */
  prompt: string;
}
URL에서 콘텐츠를 가져와 AI 모델로 처리합니다.
​
WebSearch
도구 이름: WebSearch

Copy
interface WebSearchInput {
  /**
   * 사용할 검색 쿼리
   */
  query: string;
  /**
   * 이 도메인의 결과만 포함
   */
  allowed_domains?: string[];
  /**
   * 이 도메인의 결과는 절대 포함하지 않음
   */
  blocked_domains?: string[];
}
웹을 검색하고 형식화된 결과를 반환합니다.
​
TodoWrite
도구 이름: TodoWrite

Copy
interface TodoWriteInput {
  /**
   * 업데이트된 할 일 목록
   */
  todos: Array<{
    /**
     * 작업 설명
     */
    content: string;
    /**
     * 작업 상태
     */
    status: 'pending' | 'in_progress' | 'completed';
    /**
     * 작업 설명의 능동형
     */
    activeForm: string;
  }>;
}
진행 상황 추적을 위한 구조화된 작업 목록을 생성하고 관리합니다.
​
ExitPlanMode
도구 이름: ExitPlanMode

Copy
interface ExitPlanModeInput {
  /**
   * 사용자 승인을 위해 실행할 계획
   */
  plan: string;
}
계획 모드를 종료하고 사용자에게 계획 승인을 요청합니다.
​
ListMcpResources
도구 이름: ListMcpResources

Copy
interface ListMcpResourcesInput {
  /**
   * 리소스를 필터링할 선택적 서버 이름
   */
  server?: string;
}
연결된 서버에서 사용 가능한 MCP 리소스를 나열합니다.
​
ReadMcpResource
도구 이름: ReadMcpResource

Copy
interface ReadMcpResourceInput {
  /**
   * MCP 서버 이름
   */
  server: string;
  /**
   * 읽을 리소스 URI
   */
  uri: string;
}
서버에서 특정 MCP 리소스를 읽습니다.
​
도구 출력 타입
모든 내장 Claude Code 도구의 출력 스키마 문서입니다. 이러한 타입은 각 도구에서 반환되는 실제 응답 데이터를 나타냅니다.
​
ToolOutput
참고: 이는 명확성을 위한 문서 전용 타입입니다. 모든 도구 출력 타입의 유니온을 나타냅니다.

Copy
type ToolOutput = 
  | TaskOutput
  | BashOutput
  | BashOutputToolOutput
  | EditOutput
  | ReadOutput
  | WriteOutput
  | GlobOutput
  | GrepOutput
  | KillBashOutput
  | NotebookEditOutput
  | WebFetchOutput
  | WebSearchOutput
  | TodoWriteOutput
  | ExitPlanModeOutput
  | ListMcpResourcesOutput
  | ReadMcpResourceOutput;
​
Task
도구 이름: Task

Copy
interface TaskOutput {
  /**
   * 하위 에이전트의 최종 결과 메시지
   */
  result: string;
  /**
   * 토큰 사용 통계
   */
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
  /**
   * USD 단위 총 비용
   */
  total_cost_usd?: number;
  /**
   * 실행 지속 시간 (밀리초)
   */
  duration_ms?: number;
}
위임된 작업을 완료한 후 하위 에이전트의 최종 결과를 반환합니다.
​
Bash
도구 이름: Bash

Copy
interface BashOutput {
  /**
   * stdout과 stderr 출력 결합
   */
  output: string;
  /**
   * 명령의 종료 코드
   */
  exitCode: number;
  /**
   * 타임아웃으로 인해 명령이 종료되었는지 여부
   */
  killed?: boolean;
  /**
   * 백그라운드 프로세스용 셸 ID
   */
  shellId?: string;
}
종료 상태와 함께 명령 출력을 반환합니다. 백그라운드 명령은 shellId와 함께 즉시 반환됩니다.
​
BashOutput
도구 이름: BashOutput

Copy
interface BashOutputToolOutput {
  /**
   * 마지막 확인 이후 새로운 출력
   */
  output: string;
  /**
   * 현재 셸 상태
   */
  status: 'running' | 'completed' | 'failed';
  /**
   * 종료 코드 (완료 시)
   */
  exitCode?: number;
}
백그라운드 셸에서 증분 출력을 반환합니다.
​
Edit
도구 이름: Edit

Copy
interface EditOutput {
  /**
   * 확인 메시지
   */
  message: string;
  /**
   * 수행된 교체 수
   */
  replacements: number;
  /**
   * 편집된 파일 경로
   */
  file_path: string;
}
교체 수와 함께 성공적인 편집의 확인을 반환합니다.
​
Read
도구 이름: Read

Copy
type ReadOutput = 
  | TextFileOutput
  | ImageFileOutput
  | PDFFileOutput
  | NotebookFileOutput;

interface TextFileOutput {
  /**
   * 라인 번호가 있는 파일 내용
   */
  content: string;
  /**
   * 파일의 총 라인 수
   */
  total_lines: number;
  /**
   * 실제로 반환된 라인 수
   */
  lines_returned: number;
}

interface ImageFileOutput {
  /**
   * Base64 인코딩된 이미지 데이터
   */
  image: string;
  /**
   * 이미지 MIME 타입
   */
  mime_type: string;
  /**
   * 파일 크기 (바이트)
   */
  file_size: number;
}

interface PDFFileOutput {
  /**
   * 페이지 내용 배열
   */
  pages: Array<{
    page_number: number;
    text?: string;
    images?: Array<{
      image: string;
      mime_type: string;
    }>;
  }>;
  /**
   * 총 페이지 수
   */
  total_pages: number;
}

interface NotebookFileOutput {
  /**
   * Jupyter 노트북 셀
   */
  cells: Array<{
    cell_type: 'code' | 'markdown';
    source: string;
    outputs?: any[];
    execution_count?: number;
  }>;
  /**
   * 노트북 메타데이터
   */
  metadata?: Record<string, any>;
}
파일 타입에 적합한 형식으로 파일 내용을 반환합니다.
​
Write
도구 이름: Write

Copy
interface WriteOutput {
  /**
   * 성공 메시지
   */
  message: string;
  /**
   * 쓰여진 바이트 수
   */
  bytes_written: number;
  /**
   * 쓰여진 파일 경로
   */
  file_path: string;
}
파일을 성공적으로 쓴 후 확인을 반환합니다.
​
Glob
도구 이름: Glob

Copy
interface GlobOutput {
  /**
   * 매치되는 파일 경로 배열
   */
  matches: string[];
  /**
   * 찾은 매치 수
   */
  count: number;
  /**
   * 사용된 검색 디렉터리
   */
  search_path: string;
}
수정 시간으로 정렬된 glob 패턴과 매치되는 파일 경로를 반환합니다.
​
Grep
도구 이름: Grep

Copy
type GrepOutput = 
  | GrepContentOutput
  | GrepFilesOutput
  | GrepCountOutput;

interface GrepContentOutput {
  /**
   * 컨텍스트가 있는 매치되는 라인
   */
  matches: Array<{
    file: string;
    line_number?: number;
    line: string;
    before_context?: string[];
    after_context?: string[];
  }>;
  /**
   * 총 매치 수
   */
  total_matches: number;
}

interface GrepFilesOutput {
  /**
   * 매치를 포함하는 파일
   */
  files: string[];
  /**
   * 매치가 있는 파일 수
   */
  count: number;
}

interface GrepCountOutput {
  /**
   * 파일별 매치 수
   */
  counts: Array<{
    file: string;
    count: number;
  }>;
  /**
   * 모든 파일의 총 매치 수
   */
  total: number;
}
output_mode에서 지정한 형식으로 검색 결과를 반환합니다.
​
KillBash
도구 이름: KillBash

Copy
interface KillBashOutput {
  /**
   * 성공 메시지
   */
  message: string;
  /**
   * 종료된 셸의 ID
   */
  shell_id: string;
}
백그라운드 셸을 종료한 후 확인을 반환합니다.
​
NotebookEdit
도구 이름: NotebookEdit

Copy
interface NotebookEditOutput {
  /**
   * 성공 메시지
   */
  message: string;
  /**
   * 수행된 편집 타입
   */
  edit_type: 'replaced' | 'inserted' | 'deleted';
  /**
   * 영향을 받은 셀 ID
   */
  cell_id?: string;
  /**
   * 편집 후 노트북의 총 셀 수
   */
  total_cells: number;
}
Jupyter 노트북을 수정한 후 확인을 반환합니다.
​
WebFetch
도구 이름: WebFetch

Copy
interface WebFetchOutput {
  /**
   * 프롬프트에 대한 AI 모델의 응답
   */
  response: string;
  /**
   * 가져온 URL
   */
  url: string;
  /**
   * 리디렉션 후 최종 URL
   */
  final_url?: string;
  /**
   * HTTP 상태 코드
   */
  status_code?: number;
}
가져온 웹 콘텐츠에 대한 AI의 분석을 반환합니다.
​
WebSearch
도구 이름: WebSearch

Copy
interface WebSearchOutput {
  /**
   * 검색 결과
   */
  results: Array<{
    title: string;
    url: string;
    snippet: string;
    /**
     * 사용 가능한 경우 추가 메타데이터
     */
    metadata?: Record<string, any>;
  }>;
  /**
   * 총 결과 수
   */
  total_results: number;
  /**
   * 검색된 쿼리
   */
  query: string;
}
웹에서 형식화된 검색 결과를 반환합니다.
​
TodoWrite
도구 이름: TodoWrite

Copy
interface TodoWriteOutput {
  /**
   * 성공 메시지
   */
  message: string;
  /**
   * 현재 할 일 통계
   */
  stats: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
  };
}
현재 작업 통계와 함께 확인을 반환합니다.
​
ExitPlanMode
도구 이름: ExitPlanMode

Copy
interface ExitPlanModeOutput {
  /**
   * 확인 메시지
   */
  message: string;
  /**
   * 사용자가 계획을 승인했는지 여부
   */
  approved?: boolean;
}
계획 모드를 종료한 후 확인을 반환합니다.
​
ListMcpResources
도구 이름: ListMcpResources

Copy
interface ListMcpResourcesOutput {
  /**
   * 사용 가능한 리소스
   */
  resources: Array<{
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
    server: string;
  }>;
  /**
   * 총 리소스 수
   */
  total: number;
}
사용 가능한 MCP 리소스 목록을 반환합니다.
​
ReadMcpResource
도구 이름: ReadMcpResource

Copy
interface ReadMcpResourceOutput {
  /**
   * 리소스 내용
   */
  contents: Array<{
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: string;
  }>;
  /**
   * 리소스를 제공한 서버
   */
  server: string;
}
요청된 MCP 리소스의 내용을 반환합니다.
​
권한 타입
​
PermissionUpdate
권한 업데이트를 위한 작업입니다.

Copy
type PermissionUpdate = 
  | {
      type: 'addRules';
      rules: PermissionRuleValue[];
      behavior: PermissionBehavior;
      destination: PermissionUpdateDestination;
    }
  | {
      type: 'replaceRules';
      rules: PermissionRuleValue[];
      behavior: PermissionBehavior;
      destination: PermissionUpdateDestination;
    }
  | {
      type: 'removeRules';
      rules: PermissionRuleValue[];
      behavior: PermissionBehavior;
      destination: PermissionUpdateDestination;
    }
  | {
      type: 'setMode';
      mode: PermissionMode;
      destination: PermissionUpdateDestination;
    }
  | {
      type: 'addDirectories';
      directories: string[];
      destination: PermissionUpdateDestination;
    }
  | {
      type: 'removeDirectories';
      directories: string[];
      destination: PermissionUpdateDestination;
    }
​
PermissionBehavior

Copy
type PermissionBehavior = 'allow' | 'deny' | 'ask';
​
PermissionUpdateDestination

Copy
type PermissionUpdateDestination = 
  | 'userSettings'     // 전역 사용자 설정
  | 'projectSettings'  // 디렉터리별 프로젝트 설정
  | 'localSettings'    // Gitignore된 로컬 설정
  | 'session'          // 현재 세션만
​
PermissionRuleValue

Copy
type PermissionRuleValue = {
  toolName: string;
  ruleContent?: string;
}
​
기타 타입
​
ApiKeySource

Copy
type ApiKeySource = 'user' | 'project' | 'org' | 'temporary';
​
ConfigScope

Copy
type ConfigScope = 'local' | 'user' | 'project';
​
NonNullableUsage
모든 nullable 필드가 non-nullable로 만들어진 Usage 버전입니다.

Copy
type NonNullableUsage = {
  [K in keyof Usage]: NonNullable<Usage[K]>;
}
​
Usage
토큰 사용 통계 (@anthropic-ai/sdk에서).

Copy
type Usage = {
  input_tokens: number | null;
  output_tokens: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}
​
CallToolResult
MCP 도구 결과 타입 (@modelcontextprotocol/sdk/types.js에서).

Copy
type CallToolResult = {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    // 추가 필드는 타입에 따라 다름
  }>;
  isError?: boolean;
}
​
AbortError
중단 작업을 위한 사용자 정의 오류 클래스입니다.

Copy
class AbortError extends Error {}
​
