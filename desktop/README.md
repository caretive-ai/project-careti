# Careti Desktop (Tauri)

VS Code 없이 독립 실행 가능한 Tauri v2 기반 데스크톱 앱입니다.

## 아키텍처

```
┌──────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│   Webview    │────▶│   Tauri (Rust)       │────▶│  cline-core     │
│  React SPA   │◀────│   lib.rs 브릿지       │◀────│  Node.js stdio  │
└──────────────┘     └─────────────────────┘     └─────────────────┘
  webview-ui/          desktop/src-tauri/          dist-standalone/
```

### 통신 흐름

```
webview → standalonePostMessage(json)
  → Tauri invoke('proto_bus_message')
  → cline-core stdin (JSON)
  → stdio-adapter.ts → gRPC handler
  → stdout → Rust BufReader
  → emit("grpc_response") → webview window.postMessage
```

### 핵심 파일

| 파일 | 역할 |
|------|------|
| `src-tauri/src/lib.rs` | Tauri ↔ cline-core stdio 브릿지, 윈도우 생성 |
| `src-tauri/tauri.conf.json` | Tauri 앱 설정 (devUrl, 번들 등) |
| `src-tauri/capabilities/default.json` | Tauri v2 권한 설정 |
| `../src/standalone/stdio-adapter.ts` | cline-core JSON stdio 핸들러 |
| `../src/standalone/cline-core.ts` | standalone 엔트리포인트 |
| `../webview-ui/src/main.tsx` | Tauri 브릿지 초기화 (standalone 모드) |
| `../webview-ui/src/config/platform.config.ts` | 플랫폼별 메시지 전략 |

## 빌드 및 실행

### 사전 요구사항

- Node.js 18+
- Rust & Cargo (rustup)
- Tauri v2 CLI: `cargo install tauri-cli --version "^2"`
- 시스템 의존성 (Linux):
  ```bash
  sudo dnf install webkit2gtk4.1-devel openssl-devel  # Fedora
  sudo apt install libwebkit2gtk-4.1-dev libssl-dev   # Ubuntu
  ```

### 1단계: cline-core 빌드 (필수 선행)

```bash
# 프로젝트 루트에서
npm run compile-standalone
# → dist-standalone/cline-core.js (약 46MB)
```

이 단계를 건너뛰면 데스크톱 앱이 cline-core를 찾지 못해 백엔드 없이 실행됩니다.

### 2단계: 개발 실행

```bash
# 기존 vite 프로세스 종료 (포트 25463 충돌 방지)
pkill -f "npm run dev:webview" 2>/dev/null

# desktop 디렉토리에서 실행
cd desktop
npm install  # 최초 1회
npm run tauri dev
```

자동으로 수행되는 작업:
- `webview-ui/`에서 `PLATFORM=standalone npm run dev` (Vite dev server, 포트 25463)
- `src-tauri/` Rust 컴파일 (최초 약 2분, 이후 증분 빌드 약 5초)
- `node dist-standalone/cline-core.js --stdio` 프로세스 자동 시작
- 메인 윈도우(368x1024) 생성

### 3단계: 프로덕션 빌드

```bash
cd desktop
npm run tauri build
# → src-tauri/target/release/bundle/ 에 패키지 생성 (deb/rpm/AppImage 등)
```

## 창 구성

| 창 | 크기 | 설명 |
|---|------|------|
| main | 368x1024 | 메인 UI (아바타 + Navbar + Chat) |
| avatar | 300x400 | VTuber 아바타 (투명, 항상 위에) — 현재 비활성 |

메인 윈도우는 `lib.rs`에서 `WebviewWindowBuilder`로 프로그래밍 방식 생성됩니다.
`initialization_script`를 통해 Tauri IPC 브릿지가 HTML 파싱 전에 주입됩니다.

## VRM 아바타

3D 아바타 모델은 VRM 형식을 사용합니다.

- 모델 파일: `webview-ui/public/models/avatar.vrm`
- VRM 파일은 용량이 크므로 Git에 포함되지 않습니다
- 샘플 모델: [pixiv/three-vrm examples](https://github.com/pixiv/three-vrm)에서 다운로드 가능
- `@pixiv/three-vrm`, `@react-three/fiber`(v8), `@react-three/drei`(v9) 사용 (React 18 호환)

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `CLINE_CORE_PATH` | `node` | cline-core 실행 바이너리 |
| `CLINE_CORE_SCRIPT` | `dist-standalone/cline-core.js` | cline-core 스크립트 경로 |

## 트러블슈팅

### 흰색 화면
```bash
# 기존 vite 프로세스가 포트를 점유하고 있음
pkill -f "npm run dev:webview"
# Vite 캐시 정리
rm -rf ../webview-ui/node_modules/.vite
```

### Rust 빌드 에러
```bash
cd src-tauri && cargo clean
```

### React 런타임 에러 (x2.S undefined 등)
```bash
# @react-three 패키지의 React 버전 호환성 확인
# React 18 → @react-three/fiber@8.x, @react-three/drei@9.x 필요
cd ../webview-ui
npm ls react  # invalid peer dep 확인
rm -rf node_modules/.vite  # Vite 캐시 정리
```

### cline-core 연결 안 됨
```bash
# dist-standalone/cline-core.js 존재 여부 확인
ls -la ../dist-standalone/cline-core.js
# 없으면 프로젝트 루트에서 빌드
npm run compile-standalone
```

## E2E 검증 체크리스트

데스크톱 자동 테스트는 미구현. 수동 검증:

1. `npm run compile-standalone` — 빌드 성공, `dist-standalone/cline-core.js` 생성
2. `cd desktop && npm run tauri dev` — Tauri 창 표시
3. 콘솔에서 `[Careti] cline-core started successfully` 확인
4. `subscribeToState` / `initializeWebview` 요청 로그 확인
5. 메시지 입력 → 응답 표시 (round-trip 검증)
6. 스트리밍 응답 정상 표시
7. 아바타 영역 VRM 캐릭터 렌더링
8. 워크스페이스 폴더 선택 동작

## Modification Level

**L1_independent** — 자유롭게 수정 가능, CARETI MODIFICATION 주석 불필요
