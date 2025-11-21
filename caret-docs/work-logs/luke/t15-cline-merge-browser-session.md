# T15 Cline 최신 버전 머징 및 브라우저 세션 문제 해결

**작성일:** 2025-09-21
**담당자:** Caret (AI), Luke
**상태:** 계획 수립

## 1. 작업 배경

Caret은 Cline v3.26.6 (커밋 `c6aa47095ee47036946c6a51339a4fa22aaa073c`)을 기반으로 개발되었습니다. 그러나 Cline은 이후 여러 중요한 버그 수정을 진행했으며, 특히 브라우저 세션 관련 문제가 포함되어 있습니다.

## 2. 발견된 주요 문제

### 브라우저 세션 지속성 문제
- **증상:** 브라우저를 실행한 후 클릭 등의 액션을 수행하려고 하면 "Browser is not launched" 에러 발생
- **원인:** browser_action 도구 호출 간 브라우저 세션이 유지되지 않음
- **관련 Cline 수정:** commit `8f93e9cc` "Fix browser session not being persisted between browser tool calls (#5901)"
  - 날짜: 2025-08-30 (Caret이 fork한 v3.26.6 이후)

### 문제 상세 분석
1. **현재 Caret 코드 (문제 있음):**
   ```typescript
   // BrowserToolHandler.ts
   config.services.browserSession = new BrowserSession(config.context, config.browserSettings, useWebp)
   ```
   - launch할 때마다 새 BrowserSession 인스턴스를 생성
   - 이전 세션의 page/browser 객체가 손실됨

2. **Cline 수정 사항:**
   ```typescript
   // ToolExecutor.ts에 applyLatestBrowserSettings() 메서드 추가
   // BrowserToolHandler.ts에서 호출
   config.services.browserSession = await config.callbacks.applyLatestBrowserSettings()
   ```
   - ToolExecutor 레벨에서 세션을 중앙 관리
   - 세션 객체가 도구 호출 간에 유지됨

## 3. 머징 계획

### 우선순위 1: 브라우저 세션 수정 (긴급)
1. **파일 수정 필요:**
   - `src/core/task/ToolExecutor.ts` - applyLatestBrowserSettings() 메서드 추가
   - `src/core/task/tools/handlers/BrowserToolHandler.ts` - 새 메서드 호출로 변경
   - `src/core/task/tools/types/TaskConfig.ts` - TaskCallbacks 인터페이스 업데이트

2. **예상 작업량:** 약 50줄 수정

### 우선순위 2: 기타 Cline 개선사항 검토
- commit `4f66126a` - BrowserSession 중복 코드 정리
- 기타 브라우저 관련 개선사항들

## 4. 임시 해결책 (머징 전)

머징 작업 전까지 사용 가능한 임시 방법:
1. browser_action 사이에 다른 도구를 사용하지 않도록 주의
2. 브라우저 작업을 한 번에 연속적으로 수행
3. 에러 발생 시 브라우저를 닫고 다시 시작

## 5. 작업 추적

- [ ] Cline 최신 커밋과 차이점 분석
- [ ] 브라우저 세션 패치 적용
- [ ] 테스트 및 검증
- [ ] 다른 중요 패치 검토 및 적용

## 6. 참고 사항

- Cline 저장소의 날짜가 2025년으로 표시되는 것은 Git 설정 문제로 보임
- 실제로는 2024년 8-9월경의 수정사항으로 추정
- 머징 시 Caret의 독자적인 수정사항들이 덮어쓰이지 않도록 주의 필요

## 7. 관련 파일

- **Cline 패치 커밋:** `8f93e9cc408f6b22e8611be7ad85e5599b4f445d`
- **영향받는 파일:**
  - `src/core/task/ToolExecutor.ts`
  - `src/core/task/tools/handlers/BrowserToolHandler.ts`
  - `src/core/task/tools/types/TaskConfig.ts`
  - `src/services/browser/BrowserSession.ts`