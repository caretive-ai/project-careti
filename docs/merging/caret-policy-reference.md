## 👇 Caret 정책/기능 참고

- **소스:** `caret-docs/features/index.md` 및 하위 문서(F01~F11), `caret-features-specification.md`, `merging/*` 가이드들.
- **문서 반영:** 프로바이더/온보딩/기능 문서에 캐럿 전용 `<Note>` 또는 별도 섹션으로 병기.

### F01~F11 (caret-docs/features)
- **F01 공통 유틸**: `caret-docs/features/f01-common-util.md` — 캐럿 전용 헬퍼/유틸 존재. 개발 가이드에 언급 가능.
- **F02 i18n**: `f02-multilingual-i18n.md` — 4개 언어(ko/en/ja/zh) 지원. UI 텍스트는 캐럿 번역 기준 유지.
- **F03 브랜딩/UI**: `f03-branding-ui.md` — 캐럿/CodeCenter 브랜딩 전환, 에셋 사용. 온보딩/커스터마이징 문서에 캐럿 에셋 우선 명시.
- **F04 계정 시스템**: `f04-caret-account.md` — 캐럿 계정/인증/조직 개념. 프로바이더/온보딩 문서에 계정/라우팅 차이 주석.
- **F05 Rule Priority**: `f05-rule-priority-system.md` — 캐럿 규칙 우선순위. Cline Rules/AGENTS.md 사용 시 캐럿 룰 우선 적용을 명시.
- **F06 캐럿 프롬프트 시스템**: `f06-caret-prompt-system.md` — 시스템/보조 프롬프트 차이. 기능 문서에 캐럿 프롬프트 구조 언급 가능.
- **F07 페르소나**: `f07-persona-system.md` — 페르소나 시스템/자산 경로. 온보딩/기능 문서에 페르소나 사용법 주석.
- **F08 Feature Config**: `f08-feature-config-system.md` — 기능 토글/설정. 관련 기능 문서에 캐럿 설정 경로 언급.
- **F09 Provider Setup 강화**: `f09-enhanced-provider-setup.md` — 프로바이더 설정 UX/검증 차이. 프로바이더 문서에 캐럿 추가 검증 언급.
- **F10 Input History**: `f10-input-history-system.md` — 입력 히스토리/복원. Tasks/UX 문서에 캐럿 입력 히스토리 존재 주석.
- **F11 지식 패리티**: `f11-ai-developer-knowledge-parity.md` — 캐럿 지식 동기화/정책. 필요 시 참고.

### 기타 소스
- `caret-features-specification.md`: Caret vs Cline 차별화 표 (Rule Priority, Account/Org, i18n, Logging, Branding).
- `merging/v3.38.1/attempt-2-master.md`: 정책상 미이식 항목(예: 일부 Voice 스타일) 기록.
- `merging/merge-standard-guide.md`: 모델 버튼/설정 전파 확인, 정책 준수 검사 항목.
