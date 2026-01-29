# Careti Desktop (Tauri)

VS Code 없이 독립 실행 가능한 Tauri 기반 데스크톱 앱입니다.

## 필수 읽기 파일

1. `.agents/context/desktop-architecture.md` - 아키텍처 및 통신 구조
2. `.agents/context/desktop-testing.md` - 테스트 가이드

## Quick Start

```bash
# 기존 vite 프로세스 종료 (포트 충돌 방지)
pkill -f "npm run dev:webview"

# 실행
cd desktop
npm run tauri dev
```

**주의**: 루트에서 `npm run dev:webview`가 실행 중이면 포트 25463이 충돌해서 PLATFORM=standalone이 적용 안 됨!

## 구조

```
desktop/
├── src/                    # 로컬 React 소스 (사용 안 함)
├── src-tauri/              # Rust 백엔드 (Tauri)
│   ├── src/lib.rs          # 핵심: cline-core stdio 브릿지
│   ├── tauri.conf.json     # 앱/창 설정
│   └── icons/              # 앱 아이콘
└── ...

# 실제 프론트엔드 (공유)
../webview-ui/              # PLATFORM=standalone 모드로 빌드
../dist-standalone/         # cline-core 번들 (46MB)
```

## 창 구성

| 창 | 크기 | 설명 |
|---|------|------|
| main | 368x1024 | 메인 채팅 UI (아바타 + Navbar + ChatView) |
| avatar | 300x400 | VTuber 아바타 (투명, 항상 위에) - 별도 창 |

## 통신 흐름

```
webview-ui (React)
    │
    │ standalonePostMessage()
    ▼
Tauri (Rust) - lib.rs
    │
    │ stdin (JSON)
    ▼
cline-core (Node.js)
    │
    │ stdout (JSON)
    ▼
Tauri - grpc_response 이벤트
    │
    │ window.postMessage()
    ▼
webview-ui
```

## 주요 브릿지 함수

Tauri가 webview에 주입하는 전역 함수:

```javascript
window.__is_standalone__ = true           // standalone 모드 플래그
window.clineClientId = 'standalone-xxx'   // 클라이언트 ID
window.standalonePostMessage(json)        // gRPC 요청 전송
window.cancelStream(requestId)            // 스트림 취소
window.selectWorkspaceFolder()            // 폴더 선택 다이얼로그
```

## Standalone 모드 감지

```typescript
// webview-ui에서
import { IS_STANDALONE } from "@/config/platform.config"

if (IS_STANDALONE) {
  // Tauri 전용 코드
}
```

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run tauri dev` | 개발 모드 (HMR) |
| `npm run tauri build` | 프로덕션 빌드 |
| `cd src-tauri && cargo clean` | Rust 캐시 정리 |

## Modification Level

**L1_independent** - Cline/Careti 소스와 완전히 분리, 자유롭게 수정 가능

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `src-tauri/src/lib.rs` | cline-core stdio 브릿지, Tauri 커맨드 |
| `src-tauri/tauri.conf.json` | 앱 설정, 창 구성, 빌드 명령 |
| `../webview-ui/src/App.tsx` | IS_STANDALONE일 때 아바타+Navbar 표시 |
| `../webview-ui/src/standalone-theme.css` | 다크 테마 CSS 변수 |
| `../webview-ui/src/config/platform.config.ts` | 플랫폼별 분기 |

## 트러블슈팅

### 흰색 화면 / 다크모드 안 됨
- 원인: `npm run dev:webview`가 이미 25463 포트 점유
- 해결: `pkill -f "npm run dev:webview"` 후 다시 시작

### Client ID not found
- 원인: `window.clineClientId` 주입 안 됨
- 해결: lib.rs의 eval 블록에서 주입 확인

### 아바타 안 보임
- 원인: IS_STANDALONE이 false
- 확인: 콘솔에서 `[PLATFORM_CONFIG] Build platform: standalone` 출력 확인
