# Careti Desktop (Tauri)

VS Code 없이 독립 실행 가능한 Tauri 기반 데스크톱 앱입니다.

## Quick Start

```bash
# 1. 기존 vite 프로세스 종료 (포트 충돌 방지)
pkill -f "npm run dev:webview"

# 2. 실행
cd desktop
npm run tauri dev
```

## 구조

```
desktop/
├── src-tauri/              # Rust 백엔드
│   ├── src/lib.rs          # cline-core stdio 브릿지
│   └── tauri.conf.json     # 앱 설정
└── ...

../webview-ui/              # 공유 프론트엔드 (PLATFORM=standalone)
../dist-standalone/         # cline-core 번들
```

## 창 구성

| 창 | 크기 | 설명 |
|---|------|------|
| main | 368x1024 | 메인 UI (아바타 + Navbar + Chat) |
| avatar | 300x400 | VTuber 아바타 (투명, 항상 위에) |

## AI 문서

- `AGENTS.md` - AI 작업 진입점
- `.agents/context/desktop-architecture.md` - 아키텍처 상세
- `.agents/context/desktop-testing.md` - 테스트 가이드

## 트러블슈팅

### 흰색 화면
```bash
pkill -f "npm run dev:webview"
```
→ 기존 vite가 포트 점유해서 standalone 모드 안 됨

### 캐시 에러
```bash
cd src-tauri && cargo clean
```

## Modification Level

**L1_independent** - 자유롭게 수정 가능, CARETI MODIFICATION 주석 불필요
