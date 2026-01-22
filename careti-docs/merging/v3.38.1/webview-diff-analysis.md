# Webview Diff Analysis (cline v3.38.1 vs careti)

## 비교 기준
- base: v3.35.0 (comparison/base)
- cline: v3.38.1 (comparison/cline/webview-ui)
- careti: careti-main-latest (comparison/careti/webview-ui) / 현재 작업 트리
- 3-way 적용, git checkout 금지, CARETI 주석 보존

## 주요 차이 포인트 (우선 분석 대상)
1) `src/context/ExtensionStateContext.tsx`
   - cline: Onboarding/Dictation/remote workflows, hicap/minimax/nousresearch 등 모델 필드, expandTaskHeader, PlatformContext 사용
   - careti: persona/i18n/inputHistory/caretUser/caretSettings, CaretSystemService 연동, caretBanner, modeSystem(chatbot/agent)
   - 액션: cline의 신규 모델/refresh/상태 개선을 Careti 구조에 맞춰 선별 이식. Onboarding/Dictation 등 불필요 시 보류. i18n/퍼소나/입력히스토리/모드/사이드바 브랜드는 유지.

2) 엔트리/랩퍼 (`App.tsx`, `Providers.tsx`, `main.tsx`)
   - cline PlatformProvider/Onboarding/Voice 등 변경, careti은 PersonaSelector/i18n 래핑.
   - 액션: PlatformProvider는 이미 복원. Onboarding/Voice는 Careti 요구사항에 맞춰 선택적 반영.

3) Settings utils/providers
   - cline: vercelAiGateway, hicap/minimax/nousresearch 등 새 필드, model pickers 개선.
   - careti: BizRouter/Careti provider 추가 및 i18n. 
   - 액션: cline 새 필드/버그픽스 반영하면서 Careti provider 유지. 불필요한 제거(hicap 등) 시 의도 확인.

4) Chat 영역 (예: `ChatTextArea`)
   - cline: Voice/Dictation, Remote workflows, input validation 개선.
   - careti: input history, persona i18n, tooltip 스타일 등.
   - 액션: 입력 검증/모델 리프레시 개선 등 cline 개선을 캐러티 기능과 충돌 안 하도록 병합.

## 적용 원칙
- 클라인 개선(버그수정/새 모델/상태 관리)은 이점이 있으면 적극 이식하되 Careti 핵심(i18n/Persona/InputHistory/Branding/Account) 유지.
- 적용 전 사용처 확인: 새 필드가 실제 UI/로직에서 참조되는지 추적 후 결정.
- CARETI 주석 보존, 병합 시 CARETI 추가 주석 필요하면 명시.
- 단계별로 `npm run check-types`로 검증.
