# Careti CLI

```
/_____/\ /_/\      /_______/\/__/\ /__/\ /_____/\
\:::__\/ \:\ \     \__.::._\/\::\_\\  \ \\::::_\/_
 \:\ \  __\:\ \       \::\ \  \:. `-\  \ \\:\/___/\
  \:\ \/_/\\:\ \____  _\::\ \__\:. _    \ \\::___\/_
   \:\_\ \ \\:\/___/\/__\::\__/\\. \`-\  \ \\:\____/\
    \_____\/ \_____\/\________\/ \__\/ \__\/ \_____\/
```

Autonomous coding agent CLI - capable of creating/editing files, running commands, using the browser, and more.

## Installation

Install Careti globally using npm:

```bash
npm install -g @caretive/careti-cli
```

## Local Development

Build from source:

```bash
# Backend 컴파일
npm run compile

# CLI 컴파일 (현재 플랫폼용)
npm run compile-cli

# 실행
./caret                          # 대화형 모드
./caret "your prompt here"       # 직접 프롬프트
```

빌드된 바이너리는 `cli/bin/`에 생성됩니다.

## Usage

```bash
careti
```

This will start the Careti CLI interface where you can interact with the autonomous coding agent.

### 실행 모드

```bash
./caret                          # 대화형 모드 (기본: plan)
./caret --mode plan              # Plan 모드 (노란색)
./caret --mode act               # Act 모드 (파란색)
./caret --mode agent             # Agent 모드 (초록색)
./caret --mode chatbot           # Chatbot 모드 (마젠타)
./caret -y                       # Yolo 모드 (비대화형)
./caret -o                       # Oneshot 모드 (완전 자율)
```

### 옵션 선택

CLI에서 followup 질문에 옵션이 있을 때:
- **숫자 키 (1-9)**: 해당 옵션 선택
- **화살표 키**: 옵션 탐색
- **Enter**: 선택 확인
- **직접 입력**: 커스텀 응답

## Features

-   **Autonomous Coding**: AI-powered code generation, editing, and refactoring
-   **File Operations**: Create, read, update, and delete files and directories
-   **Command Execution**: Run shell commands and scripts
-   **Browser Automation**: Interact with web pages and applications
-   **Multi-Model Support**: Works with Anthropic Claude, OpenAI GPT, and other AI models
-   **MCP Integration**: Extensible through Model Context Protocol servers
-   **Project Understanding**: Analyzes codebases to provide context-aware assistance

## Requirements

-   Node.js 20.0.0 or higher
-   Supported platforms: macOS, Linux. Windows soon
-   Supported architectures: x64, arm64

## Configuration

Careti can be configured through:

-   Environment variables
-   Configuration files
-   Command-line arguments

See the [main documentation](https://careti.ai) for detailed configuration options.

## Links

-   **Website**: [https://careti.ai](https://careti.ai)
-   **Documentation**: [https://docs.careti.ai](https://docs.careti.ai)
-   **GitHub**: [https://github.com/aicoding-careti/careti](https://github.com/aicoding-careti/careti)
-   **VSCode Extension**: Available in the VSCode Marketplace
-   **JetBrains Extension**: Available in the JetBrains Marketplace

## License

Apache-2.0 - see [LICENSE](https://github.com/aicoding-careti/careti/blob/main/LICENSE) for details.

## Support

-   Report issues: [GitHub Issues](https://github.com/aicoding-careti/careti/issues)
-   Community: [GitHub Discussions](https://github.com/aicoding-careti/careti/discussions)
-   Documentation: [docs.careti.ai](https://docs.careti.ai)
