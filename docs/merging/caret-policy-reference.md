## 👇 Caret 정책/기능 참고

- **소스:** `caret-docs/features/index.md` 및 하위 문서(F01~F11), `caret-features-specification.md`, `merging/*` 가이드들.
- **문서 반영:** 프로바이더/온보딩/기능 문서에 캐럿 전용 `<Note>` 또는 별도 섹션으로 병기.

### F01~F12 (caret-docs/features)
- **F01 공통 유틸**: `caret-docs/features/f01-common-util.md` — 캐럿 전용 헬퍼/유틸 존재. 개발 가이드에 언급 가능.
- **F02 i18n**: `f02-multilingual-i18n.md` — 4개 언어(ko/en/ja/zh) 지원. UI 텍스트는 캐럿 번역 기준 유지.
- **F03 브랜딩/UI**: `f03-branding-ui.md` — 캐럿/CodeCenter 브랜딩 전환, 에셋 사용. 온보딩/커스터마이징 문서에 캐럿 에셋 우선 명시.
- **F04 계정 시스템**: `f04-caret-account.md` — 캐럿 계정/인증/조직 개념. 프로바이더/온보딩 문서에 계정/라우팅 차이 주석.
- **F06 Agent Standardization**: `f06-agent-standardization.md` — `.agents/context` SoT + AGENTS.md 계층 + `/init` 스캐폴드 표준화.
- **F07 캐럿 프롬프트 시스템**: `f07-caret-prompt-system.md` — 시스템/보조 프롬프트 차이. 기능 문서에 캐럿 프롬프트 구조 언급 가능.
- **F08 페르소나**: `f08-persona-system.md` — 페르소나 시스템/자산 경로. 온보딩/기능 문서에 페르소나 사용법 주석.
- **F09 Feature Config**: `f09-feature-config-system.md` — 기능 토글/설정. 관련 기능 문서에 캐럿 설정 경로 언급.
- **F10 Provider Setup 강화**: `f10-enhanced-provider-setup.md` — 프로바이더 설정 UX/검증 차이. 프로바이더 문서에 캐럿 추가 검증 언급.
- **F11 Input History**: `f11-input-history-system.md` — 입력 히스토리/복원. Tasks/UX 문서에 캐럿 입력 히스토리 존재 주석.
- **F12 지식 패리티**: `f12-ai-developer-knowledge-parity.md` — 캐럿 지식 동기화/정책. 필요 시 참고.

### 기타 소스
- `caret-features-specification.md`: Caret vs Cline 차별화 표 (Agent Standardization, Account/Org, i18n, Logging, Branding).
- `merging/v3.38.1/attempt-2-master.md`: 정책상 미이식 항목(예: 일부 Voice 스타일) 기록.
- `merging/merge-standard-guide.md`: 모델 버튼/설정 전파 확인, 정책 준수 검사 항목.
