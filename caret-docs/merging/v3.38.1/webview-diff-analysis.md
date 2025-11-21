# Webview Diff Analysis (cline v3.38.1 vs caret)

## 비교 기준
- base: v3.35.0 (comparison/base)
- cline: v3.38.1 (comparison/cline/webview-ui)
- caret: caret-main-latest (comparison/caret/webview-ui) / 현재 작업 트리
- 3-way 적용, git checkout 금지, CARET 주석 보존

## 주요 차이 포인트 (우선 분석 대상)
1) `src/context/ExtensionStateContext.tsx`
   - cline: Onboarding/Dictation/remote workflows, hicap/minimax/nousresearch 등 모델 필드, expandTaskHeader, PlatformContext 사용
   - caret: persona/i18n/inputHistory/caretUser/caretSettings, CaretSystemService 연동, caretBanner, modeSystem(chatbot/agent)
   - 액션: cline의 신규 모델/refresh/상태 개선을 Caret 구조에 맞춰 선별 이식. Onboarding/Dictation 등 불필요 시 보류. i18n/퍼소나/입력히스토리/모드/사이드바 브랜드는 유지.

2) 엔트리/랩퍼 (`App.tsx`, `Providers.tsx`, `main.tsx`)
   - cline PlatformProvider/Onboarding/Voice 등 변경, caret은 PersonaSelector/i18n 래핑.
   - 액션: PlatformProvider는 이미 복원. Onboarding/Voice는 Caret 요구사항에 맞춰 선택적 반영.

3) Settings utils/providers
   - cline: vercelAiGateway, hicap/minimax/nousresearch 등 새 필드, model pickers 개선.
   - caret: BizRouter/Caret provider 추가 및 i18n. 
   - 액션: cline 새 필드/버그픽스 반영하면서 Caret provider 유지. 불필요한 제거(hicap 등) 시 의도 확인.

4) Chat 영역 (예: `ChatTextArea`)
   - cline: Voice/Dictation, Remote workflows, input validation 개선.
   - caret: input history, persona i18n, tooltip 스타일 등.
   - 액션: 입력 검증/모델 리프레시 개선 등 cline 개선을 캐럿 기능과 충돌 안 하도록 병합.

## 적용 원칙
- 클라인 개선(버그수정/새 모델/상태 관리)은 이점이 있으면 적극 이식하되 Caret 핵심(i18n/Persona/InputHistory/Branding/Account) 유지.
- 적용 전 사용처 확인: 새 필드가 실제 UI/로직에서 참조되는지 추적 후 결정.
- CARET 주석 보존, 병합 시 CARET 추가 주석 필요하면 명시.
- 단계별로 `npm run check-types`로 검증.
