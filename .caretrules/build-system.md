# Caret 빌드/린트 완화 원칙

- **Cline 소스 최소 침습**: upstream Cline에서 온 파일(`src/`, `webview-ui/` 등)에서 린트/포맷/빌드 오류가 날 때는 코드 수정보다 **도구 설정**(lint override, 빌드 스크립트 옵션, 파일 제외 등)을 우선 검토한다.
- **불가피한 수정 시**: Cline 소스에 손대야 한다면 1~3줄 이내로 축소하고 `// CARET MODIFICATION` 주석을 붙여 추적 가능하게 한다.
- **Caret 소스는 자유**: `caret-src/`, `caret-scripts/`, `caret-docs/` 등 Caret 전용 자산은 정책 범위 내에서 필요한 수정/추가를 수행한다.
- **머지 초기에 리소스 복사**: 빌드/런타임 깨짐을 막기 위해 upstream `package.json`/정적 자산(`assets/**`, public/icons 등)을 먼저 복사·적용한 뒤 Caret 브랜딩을 덮어쓴다. (누락된 CLI/아이콘 방지)
- **빌드 파이프라인**: 린트 예외가 필요한 파일은 `biome.jsonc` 등 빌드 설정에서 최소 범위로 제외/완화하고, 문서로 근거를 남긴다.
