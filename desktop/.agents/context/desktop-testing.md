# Desktop App Testing Guide

## Quick Start

```bash
# 1. 기존 vite 프로세스 종료 (중요!)
pkill -f "npm run dev:webview"

# 2. 실행
cd desktop
npm run tauri dev
```

## Prerequisites

1. **Rust 툴체인**
   ```bash
   rustup update stable
   ```

2. **Node.js 의존성** (루트에서)
   ```bash
   npm install
   ```

3. **cline-core 빌드** (필요시)
   ```bash
   npm run build:standalone
   ```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run tauri dev` | 개발 모드 (HMR) |
| `npm run tauri build` | 프로덕션 빌드 |
| `cd src-tauri && cargo check` | Rust 컴파일 체크 |
| `cd src-tauri && cargo clean` | 캐시 정리 |

## Manual Testing Checklist

### 1. 앱 시작
- [ ] 다크 모드로 표시됨 (흰색 아님)
- [ ] 창 크기 368x1024
- [ ] 상단에 아바타 표시됨
- [ ] Navbar 표시됨
- [ ] 콘솔: `[PLATFORM_CONFIG] Build platform: standalone`
- [ ] 콘솔: `[Careti] Standalone mode initialized`

### 2. cline-core 연동
- [ ] 콘솔: `[Careti] cline-core started successfully`
- [ ] 채팅 메시지 전송 가능
- [ ] 응답 수신됨
- [ ] 스트리밍 응답 실시간 표시

### 3. UI 기능
- [ ] 작업 폴더 선택 다이얼로그 동작
- [ ] 자동 승인 메뉴 (투명하지 않게 표시)
- [ ] 설정/히스토리 오버레이가 아바타 가리지 않음

### 4. 아바타 창 (별도)
- [ ] avatar 창 열림 (label: "avatar")
- [ ] 투명 배경
- [ ] 항상 위에 표시
- [ ] 300x400 크기

## Debugging

### 콘솔 로그 패턴

```
[Careti] ...                    # Tauri 측 로그
[PLATFORM_CONFIG] ...           # 플랫폼 감지
[Tauri←webview] ...            # webview → Tauri 메시지
[cline-core→Tauri] ...         # cline-core → Tauri 응답
[standalonePostMessage] ...     # 요청 전송 확인
```

### DevTools 열기
- 앱 창에서 `F12` 또는 우클릭 → Inspect

### Rust 로그 상세
```bash
RUST_LOG=debug npm run tauri dev
```

## Common Issues

### 1. 흰색 화면 / 다크모드 안 됨

**원인**: `npm run dev:webview`가 포트 25463 점유
```
Port 25463 is in use, trying another one...
```

**해결**:
```bash
pkill -f "npm run dev:webview"
# 또는
pkill -f "vite.*25463"
```

### 2. Client ID not found

**원인**: lib.rs에서 `window.clineClientId` 주입 안 됨

**확인**: lib.rs의 `main_window.eval()` 블록에서:
```javascript
window.clineClientId = 'standalone-' + Date.now();
```

### 3. 아바타 안 보임

**원인**: `IS_STANDALONE`이 false

**확인**:
1. 콘솔에서 `[PLATFORM_CONFIG] Build platform:` 확인
2. "standalone"이 아니면 PLATFORM 환경변수 문제

### 4. 캐시 문제 (아이콘/권한 에러)

```
failed to read plugin permissions
```

**해결**:
```bash
cd src-tauri && cargo clean
```

### 5. cline-core 시작 실패

```
[Careti] Failed to start cline-core
```

**확인**:
1. `dist-standalone/cline-core.js` 존재 확인
2. Node.js 설치 확인
3. 경로 하드코딩 확인 (lib.rs)

## Integration Testing (TODO)

```rust
// src-tauri/src/lib.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_grpc_request_parse() {
        let json = r#"{"type":"grpc_request","grpc_request":{}}"#;
        let parsed: WebviewMessage = serde_json::from_str(json).unwrap();
        assert!(parsed.grpc_request.is_some());
    }

    #[test]
    fn test_stdio_format() {
        let req = StdioRequest {
            msg_type: "grpc_request".to_string(),
            grpc_request: GrpcRequest { ... }
        };
        let json = serde_json::to_string(&req).unwrap();
        assert!(json.contains("grpc_request"));
    }
}
```

## Build Verification

```bash
npm run tauri build
ls -la src-tauri/target/release/bundle/
```

### 빌드 산출물
- **Linux**: `.deb`, `.AppImage`, `.rpm`
- **macOS**: `.dmg`, `.app`
- **Windows**: `.msi`, `.exe`

## Performance Profiling

### Rust 측
```bash
cargo build --release
RUST_LOG=trace ./target/release/careti-standalone
```

### Frontend 측
DevTools → Performance 탭

## Port Reference

| Port | Usage |
|------|-------|
| 25463 | webview-ui vite dev server (standalone) |
| 25464 | 충돌 시 대체 포트 |
