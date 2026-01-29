# Careti Desktop Architecture

## Overview

VS Code 없이 독립 실행 가능한 Tauri 기반 데스크톱 앱.
webview-ui를 프론트엔드로 사용하고, cline-core와 stdio로 통신.

## Directory Structure

```
project-careti-standalone/
├── desktop/                  # Tauri 앱 (이 디렉토리)
│   ├── src-tauri/           # Rust 백엔드
│   │   ├── src/lib.rs       # 핵심 브릿지 로직
│   │   ├── tauri.conf.json  # 앱 설정
│   │   └── icons/           # 앱 아이콘
│   └── src/                 # 로컬 React (미사용)
│
├── webview-ui/              # 공유 프론트엔드
│   ├── src/App.tsx          # IS_STANDALONE 분기
│   ├── src/standalone-theme.css  # 다크 테마
│   └── src/config/platform.config.ts
│
└── dist-standalone/         # cline-core 번들
    └── cline-core.js        # 46MB Node.js 번들
```

## Tech Stack

### Rust (Tauri 2.x)
```toml
[dependencies]
tauri = "2"
tauri-plugin-shell = "2"
tauri-plugin-dialog = "2"
tauri-plugin-opener = "2"
tokio = { version = "1", features = ["sync", "io-util", "process"] }
serde_json = "1"
```

### Frontend (webview-ui)
- React 19
- TailwindCSS 4
- Vite (PLATFORM=standalone)
- Three.js + @pixiv/three-vrm (아바타)

## Window Configuration

### tauri.conf.json
```json
{
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "Careti",
        "width": 368,
        "height": 1024
      },
      {
        "label": "avatar",
        "title": "Caret VTuber",
        "width": 300,
        "height": 400,
        "transparent": true,
        "decorations": false,
        "alwaysOnTop": true
      }
    ]
  }
}
```

## Communication Architecture

### Message Flow
```
┌─────────────────────────────────────────────────────────────┐
│                      webview-ui (React)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  standalonePostMessage(json)                         │   │
│  │  → window.__TAURI__.core.invoke('proto_bus_message') │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Tauri (Rust) - lib.rs                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  proto_bus_message() → send_to_cline_core()          │   │
│  │  → writeln!(stdin, json)                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 cline-core (Node.js stdio)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  stdin: JSON 요청 수신                                │   │
│  │  stdout: JSON 응답 발신                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Tauri - stdout reader                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  BufReader → serde_json::from_str()                  │   │
│  │  → app_handle.emit("grpc_response", response)        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      webview-ui (React)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  window.__TAURI__.event.listen('grpc_response')      │   │
│  │  → window.postMessage(payload, '*')                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Tauri Commands

| Command | Signature | Description |
|---------|-----------|-------------|
| `proto_bus_message` | `(app, message, state) -> Result<String>` | gRPC 요청 전달 |
| `cancel_stream` | `(app, request_id, state) -> Result<()>` | 스트림 취소 |
| `get_cline_core_status` | `(state) -> Result<bool>` | 프로세스 상태 |
| `select_workspace_folder` | `(app) -> Result<Option<String>>` | 폴더 선택 |

## Global Bridge (lib.rs setup)

Tauri가 main_window.eval()로 주입:

```javascript
// Standalone 모드 플래그
window.__is_standalone__ = true;
window.clineClientId = 'standalone-' + Date.now();

// gRPC 응답 리스너
window.__TAURI__.event.listen('grpc_response', (event) => {
    window.postMessage(event.payload, '*');
});

// 요청 전송 함수
window.standalonePostMessage = async (json) => {
    await window.__TAURI__.core.invoke('proto_bus_message', { message: json });
};

// 스트림 취소
window.cancelStream = async (requestId) => {
    await window.__TAURI__.core.invoke('cancel_stream', { requestId });
};

// 폴더 선택
window.selectWorkspaceFolder = async () => {
    return await window.__TAURI__.core.invoke('select_workspace_folder');
};
```

## gRPC Message Format

### Request (webview → cline-core)
```json
{
  "type": "grpc_request",
  "grpc_request": {
    "service": "cline.ChatService",
    "method": "sendMessage",
    "message": { "content": "Hello" },
    "request_id": "uuid-xxx",
    "is_streaming": true
  }
}
```

### Response (cline-core → webview)
```json
{
  "type": "grpc_response",
  "grpc_response": {
    "message": { "content": "Hi!" },
    "request_id": "uuid-xxx",
    "is_streaming": false,
    "error": null
  }
}
```

## Platform Detection

### Build Time (vite.config.ts)
```typescript
const platform = process.env.PLATFORM || "vscode"
define: {
  __PLATFORM__: JSON.stringify(platform)
}
```

### Runtime (platform.config.ts)
```typescript
export const IS_STANDALONE = PLATFORM_CONFIG.type === PlatformType.STANDALONE
```

### CSS (main.tsx)
```typescript
if (__PLATFORM__ === "standalone") {
  document.body.classList.add("platform-standalone")
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLINE_CORE_PATH` | 실행 경로 | `node` |
| `CLINE_CORE_SCRIPT` | cline-core.js 경로 | 하드코딩된 개발 경로 |
| `PLATFORM` | 빌드 플랫폼 | `vscode` |

## Auto-Restart Logic

cline-core 프로세스가 죽으면 자동 재시작:

1. `send_to_cline_core()` 호출
2. `process.child.try_wait()` 로 상태 확인
3. 종료됐으면 `restart_cline_core()` 호출
4. 500ms 대기 후 원래 메시지 재전송
