# t09 - i18n UI 통합 및 전체 번역 점검 작업

## 기능 개요
- **목적**: 모든 웹뷰 컴포넌트에 i18n 시스템 통합 및 번역 품질 점검
- **의존성**: t02 완료 필요 (i18n 시스템 기반 구축 완료)

## 작업 범위

### Phase 1: 핵심 인프라 통합
- App.tsx에 CaretI18nProvider 추가
- ExtensionStateContext와 i18n 시스템 연동
- 초기 언어 설정 로직 구현

### Phase 2: Settings 페이지 통합  
- GeneralSettingsSection에 언어 설정 UI 추가
- CaretUILanguageSetting 컴포넌트 통합
- 언어 변경 시 즉시 반영 확인

### Phase 3: 주요 페이지 i18n 적용
- **WelcomeView**: 환영 페이지 번역 적용
- **ChatView**: 채팅 인터페이스 번역 적용  
- **SettingsView**: 설정 페이지 전체 번역 적용
- **TaskHeader**: 작업 헤더 번역 적용

### Phase 4: 컴포넌트별 세부 번역
- **공통 UI 요소**: 버튼, 메뉴, 알림 등
- **오류 메시지**: 검증 및 API 오류 메시지
- **모델 설명**: AI 모델 관련 텍스트
- **페르소나**: AI 캐릭터 관련 텍스트

### Phase 5: 번역 품질 점검
- **한국어**: 조사 처리, 자연스러운 표현 확인
- **일본어**: 존댓말/반말, 카타카나 표기 확인  
- **중국어**: 간체 표기, 기술 용어 번역 확인
- **영어**: 문법, 일관된 용어 사용 확인

### Phase 6: 자동화 도구 구현
- **키 일관성 검증 도구**: 모든 언어 파일 키 구조 일치 확인
- **사용되지 않는 키 탐지**: 실제 사용되는 번역 키 vs JSON 파일 대조
- **누락된 번역 탐지**: 영어 기준 다른 언어 번역 누락 확인  
- **번역 품질 검증**: 한국어 조사, 변수 placeholder 확인

### Phase 7: 테스트 및 최적화
- 언어 전환 기능 테스트
- 성능 메트릭 확인 (캐시 적중률, 로딩 시간)
- 자동화 도구로 사용되지 않는 번역 키 정리
- 자동화 도구로 누락된 번역 키 추가

## 작업 대상 파일 (예상)

### 핵심 인프라
- `webview-ui/src/App.tsx` - i18n Provider 추가
- `webview-ui/src/context/ExtensionStateContext.tsx` - 언어 상태 연동

### 주요 컴포넌트  
- `webview-ui/src/components/welcome/WelcomeView.tsx`
- `webview-ui/src/components/chat/ChatView.tsx`
- `webview-ui/src/components/settings/SettingsView.tsx`
- `webview-ui/src/components/settings/sections/GeneralSettingsSection.tsx`
- `webview-ui/src/components/chat/task-header/TaskHeader.tsx`

### 세부 컴포넌트
- `webview-ui/src/components/common/` 하위 모든 컴포넌트
- `webview-ui/src/components/chat/` 하위 채팅 관련 컴포넌트
- `webview-ui/src/components/settings/` 하위 설정 관련 컴포넌트

### 자동화 도구 (신규 구현)
- `scripts/i18n-validate.js` - 키 일관성 검증 스크립트
- `scripts/i18n-unused.js` - 사용되지 않는 키 탐지 스크립트
- `scripts/i18n-missing.js` - 누락된 번역 탐지 스크립트
- `scripts/i18n-quality.js` - 번역 품질 검증 스크립트
- `package.json` - npm 스크립트 추가

## 작업 완료 기준

### ✅ 기능 동작 확인
- [ ] 4개 언어 간 실시간 전환 동작
- [ ] 설정 저장 및 재시작 시 복원
- [ ] 모든 UI 요소에서 번역 정상 표시
- [ ] fallback 시스템 정상 동작 (영어)

### ✅ 성능 확인
- [ ] 초기 로딩 시간 3초 이내
- [ ] 언어 전환 1초 이내
- [ ] 캐시 적중률 80% 이상
- [ ] 메모리 사용량 증가 10MB 이내

### ✅ 품질 확인
- [ ] 한국어 조사 자동 처리 정상 동작
- [ ] 각 언어별 문법 및 표현 자연스러움
- [ ] 기술 용어 일관된 번역
- [ ] UI 레이아웃 깨짐 없음

### ✅ 자동화 도구 동작 확인
- [ ] `npm run i18n:validate` - 키 일관성 검증 정상 동작
- [ ] `npm run i18n:unused` - 사용되지 않는 키 탐지 정상 동작
- [ ] `npm run i18n:missing` - 누락된 번역 탐지 정상 동작
- [ ] `npm run i18n:quality` - 번역 품질 검증 정상 동작

### ✅ 코드 품질
- [ ] TypeScript 타입 체크 통과
- [ ] 웹뷰 빌드 성공
- [ ] 테스트 커버리지 90% 이상
- [ ] 자동화 도구로 사용되지 않는 번역 키 0개 달성

## 현재 상태
- ✅ **i18n 시스템 기반**: Hook, Context, 유틸리티 구축 완료
- ✅ **언어 설정 컴포넌트**: CaretUILanguageSetting.tsx 이식 완료  
- ❌ **실제 UI 통합**: 아직 설정 페이지나 다른 컴포넌트에 미적용
- ❌ **자동화 도구**: 아직 구현 안됨

## 주의사항
- Cline 원본 코드 수정 시 반드시 `// CARET MODIFICATION:` 주석 추가
- 모든 하드코딩된 텍스트를 t() 함수로 교체
- 기존 컴포넌트 동작에 영향주지 않도록 점진적 적용
- 각 Phase별로 빌드 및 동작 확인 필수

## 작업 완료 후
- **f02-multilingual-i18n.mdx 문서 업데이트** 필수
  - 현재 상태를 "기반 시스템"에서 "완전 구현"으로 변경
  - 자동화 도구 섹션 추가 및 사용법 업데이트
  - 실제 UI 통합 완료 상태 반영
  - 성능 메트릭 및 품질 지표 업데이트