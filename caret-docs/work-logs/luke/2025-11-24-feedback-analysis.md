# 2025-11-22 Merge Feedback 원인 분석

**분석 일시**: 2025-11-24
**대상 문서**: `caret-docs/work-logs/luke/2025-11-22-merge-feedback.md`

이 문서는 2025-11-22 보고된 6가지 머지 이슈에 대한 근본 원인(Root Cause) 분석 보고서입니다.

---

## 1. 페르소나 템플릿 이미지 미표시
- **증상**: 페르소나 선택 화면에서 템플릿 이미지가 엑스박스(Broken Image)로 표시됨.
- **원인**: **Webview 보안 정책(CSP) 및 경로 참조 오류**.
  - VS Code Webview는 로컬 파일 시스템 접근이 엄격히 제한됩니다.
  - `webview-ui` 빌드 시점에 이미지 경로가 해시되거나 변경되는데, 런타임에서 원본 경로(예: `/assets/images/...`)를 참조하려다 403 Forbidden 또는 404 Not Found가 발생했습니다.
- **해결 분석**: 이미지를 별도 파일 요청이 아닌 **Base64 Inline(`?inline`)** 방식으로 번들링하여, 경로 참조 문제 자체를 원천 차단했습니다.

## 2. 프로바이더 버튼 중복 (Caret/Cline)
- **증상**: 하단 프로바이더 설정 영역에 Caret과 Cline 버튼이 중복되어 표시됨.
- **원인**: **UI 리스트 구성 로직의 중복**.
  - `ApiOptions.tsx`에서 프로바이더 목록을 구성할 때, `baseOptions` 배열에 `cline`과 `caret`을 수동으로 추가하는 로직과, `featureConfig`에 의해 동적으로 추가되는 로직이 충돌했거나, 머지 과정에서 기존 Cline 리스트와 Caret 추가 리스트가 단순 병합(Concat)되었을 가능성이 큽니다.
- **해결 분석**: `ApiOptions.tsx` 내에 `Set`을 이용한 **명시적 중복 제거(Deduplication)** 로직이 추가되어 해결되었습니다.

## 3. 캐럿 로그인 후 모델 리스트 미표시
- **증상**: 로그인 성공 후에도 모델 목록에 'Claude'만 표시되고 Caret 모델이 로드되지 않음.
- **원인**: **Auth Token 파싱 실패 및 상태 동기화 타이밍 이슈**.
  - 1차 원인: `SharedUriHandler`가 URL의 `Query String`만 파싱하고 `Hash Fragment`(#)를 무시했으나, 실제 인증 서버는 토큰을 Hash에 담아 보냈을 가능성이 큽니다.
  - 2차 원인: 토큰이 저장된 직후, `CaretGlobalManager`가 사용자 정보(모델 목록 포함)를 즉시 fetch하지 않거나, fetch된 정보가 Webview의 `apiConfiguration`으로 전파(postMessage)되는 트리거가 누락되었습니다.
- **해결 분석**: `SharedUriHandler`가 Hash/Query를 모두 검사하도록 수정되었고, 토큰 설정 직후 강제 fetch 및 상태 전파 로직이 보강되었습니다.

## 4. 캐럿 미로그인 시 로그인 뷰 미노출
- **증상**: 로그아웃 상태에서 Caret 로그인 버튼/안내가 보이지 않음.
- **원인**: **Feature Flag 기본값 불일치 (`feature-config.json`)**.
  - Webview가 초기화될 때 백엔드로부터 `featureConfig`를 받는데, 이 설정의 기본값(Default)이 Cline 원본 기준인 "Caret 기능 비활성화(Disable)"로 설정되어 있었습니다.
  - 이로 인해 `ApiOptions` 등에서 Caret 관련 UI가 렌더링되지 않았습니다.
- **해결 분석**: `feature-config.json` 또는 백엔드 설정의 기본값을 "Caret Account Enabled"로 복원하여 해결되었습니다.

## 5. 클라인 로그인 실패
- **증상**: Cline 로그인 시도 시 아무 반응이 없거나 실패함.
- **원인**: **`SharedUriHandler`의 파라미터 파싱 로직 변경**.
  - Cline v3.38.1은 인증 콜백 시 `code` 등의 파라미터를 특정 방식(Query vs Hash)으로 전달하는데, 머지된 `SharedUriHandler`가 이를 처리하는 로직(기존 Caret 방식)과 호환되지 않았습니다.
  - 로그 상 `Processing URI`에는 파라미터가 보였으나, 핸들러 내부에서 `getParam`이 null을 반환했습니다.
- **해결 분석**: `SharedUriHandler.ts`의 `getParam` 함수가 Query와 Hash를 모두 탐색하도록 통합(Unified Getter)되어 해결되었습니다.

## 6. 캐럿 시스템 프롬프트 로딩 실패
- **증상**: Caret 모드에서도 Cline의 시스템 프롬프트가 적용됨.
- **원인**: **Context 전파 누락 (`modeSystem`)**.
  - `getSystemPrompt` 함수가 호출될 때, 현재 모드가 `caret`인지 `cline`인지 알려주는 `modeSystem` 값이 전달되지 않았습니다.
  - 이로 인해 분기 로직이 있어도 항상 기본값(Cline)으로 동작했습니다.
- **해결 분석**: `SystemPromptContext` 인터페이스에 `modeSystem` 필드를 추가하고, 호출부에서 이를 주입하도록 수정되었습니다.

---

**총평**: 대부분의 이슈는 **머지 과정에서의 설정 누락(Feature Flag)**, **URL 파싱 로직의 불완전한 통합(Auth)**, 그리고 **Webview 보안 정책(Image)** 에 기인했습니다. 현재 코드는 이러한 근본 원인들을 적절히 해결한 것으로 분석됩니다.
