참조
CLI 참조

페이지 복사

Claude Code 명령줄 인터페이스의 완전한 참조, 명령어와 플래그 포함.

​
CLI 명령어
명령어	설명	예시
claude	대화형 REPL 시작	claude
claude "query"	초기 프롬프트로 REPL 시작	claude "explain this project"
claude -p "query"	SDK를 통해 쿼리 후 종료	claude -p "explain this function"
cat file | claude -p "query"	파이프된 콘텐츠 처리	cat logs.txt | claude -p "explain"
claude -c	가장 최근 대화 계속	claude -c
claude -c -p "query"	SDK를 통해 계속	claude -c -p "Check for type errors"
claude -r "<session-id>" "query"	ID로 세션 재개	claude -r "abc123" "Finish this PR"
claude update	최신 버전으로 업데이트	claude update
claude mcp	Model Context Protocol (MCP) 서버 구성	Claude Code MCP 문서를 참조하세요.
​
CLI 플래그
이러한 명령줄 플래그로 Claude Code의 동작을 사용자 정의하세요:
플래그	설명	예시
--add-dir	Claude가 액세스할 추가 작업 디렉토리 추가 (각 경로가 디렉토리로 존재하는지 검증)	claude --add-dir ../apps ../lib
--agents	JSON을 통해 사용자 정의 서브에이전트를 동적으로 정의 (형식은 아래 참조)	claude --agents '{"reviewer":{"description":"Reviews code","prompt":"You are a code reviewer"}}'
--allowedTools	settings.json 파일에 추가로, 사용자 권한 요청 없이 허용되어야 하는 도구 목록	"Bash(git log:*)" "Bash(git diff:*)" "Read"
--disallowedTools	settings.json 파일에 추가로, 사용자 권한 요청 없이 허용되지 않아야 하는 도구 목록	"Bash(git log:*)" "Bash(git diff:*)" "Edit"
--print, -p	대화형 모드 없이 응답 출력 (프로그래밍 방식 사용 세부사항은 SDK 문서 참조)	claude -p "query"
--append-system-prompt	시스템 프롬프트에 추가 (--print와 함께만 사용)	claude --append-system-prompt "Custom instruction"
--output-format	출력 모드의 출력 형식 지정 (옵션: text, json, stream-json)	claude -p "query" --output-format json
--input-format	출력 모드의 입력 형식 지정 (옵션: text, stream-json)	claude -p --output-format json --input-format stream-json
--include-partial-messages	출력에 부분 스트리밍 이벤트 포함 (--print와 --output-format=stream-json 필요)	claude -p --output-format stream-json --include-partial-messages "query"
--verbose	자세한 로깅 활성화, 전체 턴별 출력 표시 (출력 및 대화형 모드 모두에서 디버깅에 도움)	claude --verbose
--max-turns	비대화형 모드에서 에이전트 턴 수 제한	claude -p --max-turns 3 "query"
--model	최신 모델의 별칭(sonnet 또는 opus) 또는 모델의 전체 이름으로 현재 세션의 모델 설정	claude --model claude-sonnet-4-5-20250929
--permission-mode	지정된 권한 모드로 시작	claude --permission-mode plan
--permission-prompt-tool	비대화형 모드에서 권한 프롬프트를 처리할 MCP 도구 지정	claude -p --permission-prompt-tool mcp_auth_tool "query"
--resume	ID로 특정 세션 재개, 또는 대화형 모드에서 선택	claude --resume abc123 "query"
--continue	현재 디렉토리에서 가장 최근 대화 로드	claude --continue
--dangerously-skip-permissions	권한 프롬프트 건너뛰기 (주의해서 사용)	claude --dangerously-skip-permissions
--output-format json 플래그는 스크립팅과 자동화에 특히 유용하며, Claude의 응답을 프로그래밍 방식으로 파싱할 수 있게 해줍니다.
​
Agents 플래그 형식
--agents 플래그는 하나 이상의 사용자 정의 서브에이전트를 정의하는 JSON 객체를 허용합니다. 각 서브에이전트는 고유한 이름(키로 사용)과 다음 필드를 가진 정의 객체가 필요합니다:
필드	필수	설명
description	예	서브에이전트가 언제 호출되어야 하는지에 대한 자연어 설명
prompt	예	서브에이전트의 동작을 안내하는 시스템 프롬프트
tools	아니오	서브에이전트가 사용할 수 있는 특정 도구 배열 (예: ["Read", "Edit", "Bash"]). 생략하면 모든 도구를 상속
model	아니오	사용할 모델 별칭: sonnet, opus, 또는 haiku. 생략하면 기본 서브에이전트 모델 사용
예시:

Copy
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "Debugging specialist for errors and test failures.",
    "prompt": "You are an expert debugger. Analyze errors, identify root causes, and provide fixes."
  }
}'
서브에이전트 생성 및 사용에 대한 자세한 내용은 서브에이전트 문서를 참조하세요.
출력 형식, 스트리밍, 자세한 로깅, 프로그래밍 방식 사용을 포함한 출력 모드(-p)에 대한 자세한 정보는 SDK 문서를 참조하세요.
​
참조
대화형 모드 - 단축키, 입력 모드, 대화형 기능
슬래시 명령어 - 대화형 세션 명령어
빠른 시작 가이드 - Claude Code 시작하기
일반적인 워크플로 - 고급 워크플로와 패턴
설정 - 구성 옵션
SDK 문서 - 프로그래밍 방식 사용 및 통합