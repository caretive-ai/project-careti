# Caret CLI/프롬프트 이식 계획 (cline CLI 대비)

**작성자:** Codex  
**목적:** cline CLI 기능/프롬프트 개선을 Caret에 맞춰 독립 CLI로 제공하고, 웹뷰/프롬프트/설정/배너를 정합성 있게 이식하기 위한 단계별 계획.

## 1. 현황 정리 (cline 3.38.1)
- 코드/스펙 위치
  - CLI 코드: `cli/` (Go), 설치 스크립트: `scripts/install.sh`, `scripts/package-standalone.mjs` 등.
  - 웹뷰 배너: `webview-ui/src/components/common/CliInstallBanner.tsx`
  - 설치 감지: `src/utils/cli-detector.ts`
  - 컨트롤러: `src/core/controller/state/installClineCli.ts`, `checkCliInstallation.ts`
  - 프롬프트: `src/core/prompts/system-prompt/components/cli_subagents.ts`, `variants/*/overrides.ts` (CLI 설치/사용 지침 포함)
  - 시스템 설정/슬래시: `webview-ui/src/utils/slash-commands.ts` (CLI subagent 설명)
  - Docs: `docs/cline-cli/**` (overview, installation, samples, reference)
  - Samples/CI: `src/samples/cli/**`, GitHub Actions 시나리오
- 동작: macOS/Linux 우선, Windows “coming soon” 안내, Node20+ 요구, CLI 설치/인증 후 subagent/멀티 인스턴스 활용.

## 2. Caret 요구사항
- Cline CLI와 **독립**된 Caret CLI 제공 (명령어/설치 경로 분리; 동시 설치 가능).
- Caret 모드에서 Caret CLI 우선 사용, Cline 모드는 기존 Cline CLI 유지(모드/브랜딩 따라 분기).
- 프롬프트에도 Caret CLI 사용 지침 반영(적용 범위: system prompt, cli_subagents 컴포넌트).
- 웹뷰 배너/설정/슬래시 도움말 등에서 Caret CLI를 올바르게 안내하고 감지.

## 3. 작업 항목 (단계별)
### A) 코드/배너/감지
- [ ] `webview-ui/src/components/common/CliInstallBanner.tsx` 이식 → Caret 브랜딩/문구로 분기(모드/featureConfig에 따라 Caret CLI vs Cline CLI).
- [ ] `src/utils/cli-detector.ts` 이식/분기: Caret CLI 바이너리 네이밍, 버전 문자열 감지 수정.
- [ ] 컨트롤러 `installClineCli.ts` / `checkCliInstallation.ts` → Caret 전용 처리 추가(명령/설치 경로 분기).
- [ ] 슬래시 커맨드 안내(`webview-ui/src/utils/slash-commands.ts`)에 Caret CLI 설명 분기.

### B) 프롬프트
- [ ] `src/core/prompts/system-prompt/components/cli_subagents.ts`를 3-way 병합: cline 개선점 흡수 + Caret CLI 명칭/용도 반영.
- [ ] 프롬프트 variants overrides에 Caret CLI 안내 추가(모드/브랜딩 분기).

### C) 배포/설치 스크립트
- [ ] Caret CLI 설치 스크립트/패키징 경로 준비(`scripts/install.sh`, `scripts/package-standalone.mjs` 등)에서 Caret CLI 분기 추가.
- [ ] README/Docs(내부) 최소 안내 작성: Node20+, macOS/Linux 우선, Windows 추후.

### D) UI/사용자 문서
- [ ] Announcement: Caret CLI 소개(기능/설치 기본 안내)만 사용자 공지에 반영.
- [ ] CHANGELOG: cline CLI 개선점 이식, Caret CLI 분기/배너/감지 추가.
- [ ] 설정 화면: CLI 설치 상태 안내(필요 시 Feature/General 섹션에 배너 링크 정도).
- [ ] **Features 문서 분리/번호 재조정**: `features/f06-caret-prompt-system.md`를 2개로 분리 → F06(2중 지원 모드 + CLI 안내), F07(시스템 프롬프트). 이후 F08~ 번호+1 조정 및 모든 연관 링크/참조 업데이트.

### E) 테스트
- [ ] cli-detector가 Caret CLI/ Cline CLI 모두에서 올바로 동작하는지 확인(이름/버전 문자열).
- [ ] 배너 노출 조건(플랫폼/모드/설치 여부) 확인.
- [ ] 프롬프트 오동작 여부(Agent/CLI 모드 혼동) 점검.

## 4. Done 정의
- Caret 모드에서 Caret CLI 안내/감지/배너/프롬프트가 cline 수준으로 동작.
- Cline 모드에서는 기존 Cline CLI 흐름 유지(회귀 없음).
- CHANGELOG/announcement에 사용자 영향도 있는 부분만 반영.
