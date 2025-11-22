# 캐럿 vs Cline 문서 차이 요약 (2025-11-23)

## 상위 요약
- Cline v3.38.1 머지본 기준으로, CLI/온보딩/모델·프로바이더/기능 문서가 대량 추가 또는 갱신됨.
- 캐럿 전용 정책/차이(모델 지원/차단, 인증/라우팅, 브랜딩)는 본 요약에 빈 자리로 남김; 실제 정책 확인 후 `<Note>`로 표기 필요.

## 주요 변경 범주
- **온보딩/소개**: `introduction/overview.mdx`, `getting-started/*`가 Cline 최신 카피/카드 구성을 포함. 캐럿 브랜딩 병기 필요 여부 검토.
- **CLI**: `cline-cli/overview.mdx`, `installation.mdx`, `three-core-flows.mdx`, `samples/*`, `cli-reference.mdx` 추가/확장. 캐럿 빌드 기준 노트 이미 추가됨.
- **기능**: `features/cline-rules.mdx`에 AGENTS.md 지원 문구 추가. `dictation.mdx`, `hooks.mdx`, `customization/opening-cline-in-sidebar.mdx`, `tasks/*` 등 업데이트 필요.
- **모델/프로바이더**: `model-config/*`, `provider-config/*`(Anthropic, OpenAI, Cerebras, Baseten, Claude Code 등) 최신 모델/옵션 반영 필요. 캐럿에서 비활성/제한 모델은 `<Note>`로 명시.
- **로컬 실행**: `running-models-locally/overview.mdx`, `read-me-first.mdx` 최신화.
- **엔터프라이즈**: `enterprise-solutions/*` 일부 추가/수정(overview, security-concerns 등).
- **네비/메타**: `docs/docs.json`, `docs/styles.css`, `docs/assets/*` 갱신. 새 문서가 네비에 포함됐는지 확인 필요.

## 캐럿 전용 정책/기능(확인 필요)
- 모델 지원/차단 목록(예: 특정 지역/계정 제한, 무료/유료 분기) → 해당 프로바이더 문서에 `<Note>`로 “캐럿 전용” 표기.
- 인증/라우팅 차이(예: 캐럿 자체 라우터, 로컬 엔드포인트, 조직 정책) → 설치/프로바이더/엔터프라이즈 섹션에 주석.
- 브랜딩/UX 차이(아이콘, 버튼 레이블, 지원 플랫폼) → 온보딩/CLI/설정 문서에 병기.
- 데이터/보안 정책(로그/텔레메트리/비밀 관리) → `more-info/telemetry` 또는 엔터프라이즈 섹션에 캐럿 기준 추가.

## 후속 작업 제안
- 우선순위 반영: 온보딩/CLI/모델·프로바이더 → 기능/엔터프라이즈 → 나머지.
- 네비 업데이트: 새 문서(`introduction/overview`, `cline-cli/*`, `merging/*`)가 메뉴에 모두 반영됐는지 확인.
- 프리뷰 검증: `npm run docs` 등으로 링크/에셋 깨짐 확인.
- 완료 후 워크로그에 반영(처리/미처리/TODO 명시).
