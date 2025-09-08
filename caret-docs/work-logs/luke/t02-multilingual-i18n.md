# t02 - 다국어 지원 (i18n) 머징 작업

---

## 🚨 **현재 i18n 구조 수정 작업 계획 (2025-01-08)**

### **❌ 발견된 주요 문제들**
1. **잘못된 t() 함수 호출 패턴**: 많은 코드가 `t("settings.modeSystem.label")` 대신 올바른 `t("modeSystem.label", "settings")` 패턴을 사용하지 않음
2. **641개의 누락된 번역 키**: 한국어, 일본어, 중국어 번역이 누락됨
3. **956개의 미사용 키**: 코드에서 사용되지 않는 번역 키들이 대량 존재
4. **네임스페이스 혼재**: 일부 코드에서 네임스페이스를 키에 포함시키는 잘못된 패턴 사용

### **📋 단계별 수정 계획**

#### **Phase 1: 현황 조사 및 검증 (1일)**
1. **🚨 스크립트 검증 (필수)**
   - **누락 키 샘플링**: 641개 중 최소 50개 수동 확인
   - **미사용 키 샘플링**: 956개 중 최소 100개 실제 사용 여부 확인
   - 스크립트가 놓친 동적 키 사용 패턴 조사
   - 스크립트 오류 발견 시 수정 또는 대체 방법 적용

2. **실제 파일 교차 검증**
   - 리포트 결과와 실제 JSON 파일 직접 비교
   - 코드에서 실제 사용되는 키들과 리포트 비교
   - 네임스페이스별 키 구조 실제 확인

3. **문제 패턴 분석**
   - 잘못된 t() 호출 패턴 전수 조사
   - 누락된 키들의 네임스페이스별 분류  
   - 미사용 키들의 중요도 분석 (삭제 가능성 검토)

#### **Phase 2: 코드 패턴 표준화 (2-3일)**
1. **잘못된 t() 호출 수정**
   ```typescript
   // ❌ Before: t("browser.popover.title")
   // ✅ After: t("popover.title", "browser")
   ```
   - 모든 컴포넌트에서 올바른 패턴으로 변경
   - 네임스페이스가 누락된 호출들 수정

2. **네임스페이스 재정리**
   - 현재 사용 중인 네임스페이스 정리
   - 불필요한 네임스페이스 통합
   - 새로운 네임스페이스 구조 설계

#### **Phase 3: 번역 키 동기화 (2일)**
1. **누락된 키 추가**
   - 641개 누락 키를 모든 언어(ko, ja, zh)에 추가
   - 기계 번역 1차 작업 후 수동 검토
   - 한국어 조사 처리 적용

2. **번역 품질 검증**
   - 주요 키들에 대한 번역 품질 샘플링 검사
   - 한국어 자연스러움 검토
   - 일본어, 중국어 기본 검증

#### **Phase 4: 미사용 키 정리 (1일)**
1. **🔍 미사용 키 재검증 (스크립트 불신)**
   - **956개 전체 수동 재확인 필수**
   - 동적 키 사용 패턴 조사 (`t(dynamicKey, namespace)` 등)
   - 템플릿 문자열로 생성되는 키 확인
   - 조건부 렌더링에서만 사용되는 키 확인
   - 미래 사용 가능성이 있는 키 보존

2. **안전한 키 삭제**
   - **100% 확실한 미사용 키만** 선별적 삭제
   - 삭제 전 전체 locale 파일 백업 생성
   - 소량씩 단계적 삭제 후 빌드/실행 테스트

#### **Phase 5: 통합 테스트 및 검증 (1일)**
1. **전체 i18n 시스템 테스트**
   - 모든 언어 전환 테스트
   - UI 깨짐 현상 확인
   - 동적 번역 업데이트 확인

2. **스크립트 재검증**
   - 모든 i18n 검증 스크립트 재실행
   - 0개 누락, 0개 미사용 키 달성 목표
   - 최종 품질 검증

### **🛠 사용할 도구들**
- `npm run report:i18n-namespace` - 네임스페이스 검증
- `npm run report:i18n-keys` - 키 누락 검증  
- `npm run sync:i18n-keys` - 키 자동 동기화
- `node caret-scripts/tools/report-i18n-unused-key.js` - 미사용 키 검증
- `node caret-scripts/tools/remove-i18n-unused-keys.js` - 미사용 키 삭제

### **⚠️ 주의사항 (스크립트 완전성 부족)**
1. **🚨 스크립트 불신 원칙**: 모든 스크립트 결과는 부정확할 수 있음
   - **누락 키**: 실제로는 모든 언어에 존재할 수 있음
   - **미사용 키**: 동적 사용, 조건부 사용 패턴을 놓칠 수 있음
   - **반드시 수동 샘플링 검증 필수**

2. **백업 생성**: 대량 변경 전 모든 locale 파일 백업
3. **점진적 적용**: 한 번에 모든 변경을 적용하지 말고 단계별로 테스트  
4. **빌드 확인**: 각 단계마다 `npm run compile` 및 `npm run build:webview` 확인
5. **보수적 접근**: 의심스러운 키는 삭제하지 말고 보존

---

## 기능 개요
- **목적**: 한국어, 영어, 일본어, 중국어 4개 언어 완전 지원

## 작업범위
 * caret-compare 에서 이식 해오기, 구동 시스템과 다국어 데이터
  - 실제 모든 웹뷰 페이지는 이후에 작업
 * General 설정에 UI다국어 기능과 설정 가져오기   
  - caret-compare에서 가져울것 
  - 'caret-compare/caret-docs/features/caret-i18n-system.mdx' 이 문서 꼭 참고하여 가져오기 

## ✅ 작업 완료 상황

### 🎯 Cline 충돌 위험: 없음 (완전 독립 구현)
- **Cline 원본에는 i18n 시스템이 전혀 없음** (영어 단일 언어만 지원)
- **모든 파일이 `webview-ui/src/caret/` 디렉토리 내에 위치**
- **Cline 소스 경로(`src/`, `webview-ui/src/`)에 i18n 파일 0개 확인**
- **Cline 코드 수정 없이 순수 추가 기능으로 구현**

### 📁 이식된 파일 목록 (총 40개 파일)

#### 1. 다국어 locale 파일 (30개 JSON) ✅
```
webview-ui/src/caret/locale/
├── en/ (7개 파일)
│   ├── common.json, welcome.json, persona.json
│   ├── settings.json, validate-api-conf.json 
│   ├── announcement.json, models.json
├── ko/ (7개 파일)
│   ├── common.json, welcome.json, persona.json
│   ├── settings.json, validate-api-conf.json
│   ├── announcement.json, models.json
├── ja/ (8개 파일)
│   ├── common.json, welcome.json, persona.json
│   ├── settings.json, validate-api-conf.json
│   ├── announcement.json, models.json, rules.json
└── zh/ (8개 파일)
    ├── common.json, welcome.json, persona.json
    ├── settings.json, validate-api-conf.json
    ├── announcement.json, models.json, rules.json
```

#### 2. i18n 시스템 코어 유틸리티 (3개 파일) ✅
```
webview-ui/src/caret/utils/
├── i18n.ts                    # 메인 i18n 유틸리티 (성능 모니터링 통합)
├── i18n-performance.ts        # 성능 모니터링 및 캐싱 시스템
└── lazy-i18n.ts              # 지연 로딩 시스템
```

#### 3. React Hook과 Context (2개 파일) ✅
```
webview-ui/src/caret/hooks/
└── useCaretI18n.ts            # i18n Hook (Context 통합, 지연 로딩)

webview-ui/src/caret/context/
└── CaretI18nContext.tsx       # i18n Context Provider
```

#### 4. UI 컴포넌트 (1개 파일) ✅
```
webview-ui/src/caret/components/
└── CaretUILanguageSetting.tsx # 언어 설정 UI 컴포넌트
```

#### 5. 테스트 파일 (3개 파일) ✅
```
webview-ui/src/caret/utils/__tests__/
└── i18n.test.ts               # i18n 유틸리티 테스트

webview-ui/src/caret/components/__tests__/
└── CaretUILanguageSetting.test.tsx # UI 컴포넌트 테스트

webview-ui/src/caret/hooks/__tests__/
└── useCaretI18n.test.tsx      # Hook 테스트
```

### 🚀 구현된 주요 기능

1. **다국어 번역 시스템**
   - 4개 언어 (ko, en, ja, zh) 완전 지원
   - 7개 네임스페이스 체계적 관리 (common, welcome, persona, settings, validate-api-conf, announcement, models)
   - 영어 fallback 시스템

2. **성능 최적화**
   - 번역 결과 캐싱 시스템
   - 성능 모니터링 및 메트릭 수집
   - 지연 로딩으로 초기 로딩 시간 단축

3. **한국어 특수 기능**
   - 조사 자동 처리 ("을/를", "이/가", "은/는" 등)
   - 받침 검사 알고리즘

4. **React 통합**
   - Context 기반 언어 상태 관리
   - Hook 기반 편리한 사용법
   - UI 컴포넌트 즉시 사용 가능

### ✅ 검증 완료 사항
- ✅ **TypeScript 타입 체크 통과** (`npm run check-types`)
- ✅ **웹뷰 빌드 성공** (`npm run build:webview`)
- ✅ **JSON 파일 유효성 확인** (30개 모두 유효)
- ✅ **모든 파일 정상 이식 완료** (40개 파일)
- ✅ **Cline 코드와 충돌 없음 확인** (Cline 소스 경로에 i18n 파일 0개)

### ✅ **UI 통합 작업 완료** (t02에서 추가 진행)
- **Settings 페이지에 언어 설정 UI 추가** ✅ 
  - CaretGeneralSettingsSection.tsx 생성
  - GeneralSettingsSection.tsx에서 Caret 버전 사용
- **App.tsx에 i18n Context Provider 추가** ✅
  - CaretI18nProvider로 전체 앱 감싸기 완료
- **텔레메트리 설정 다국어 처리** ✅
  - 설정 관련 텍스트를 t() 함수로 교체

### 🔄 향후 통합 작업 (t09에서 진행)
- 각 웹뷰 페이지에서 i18n Hook 사용하도록 수정
- 자동화 도구 구현 (키 관리, 사용되지 않는 키 정리)

### 🔗 t03 브랜딩 시스템과 연계 작업

#### **🎯 최종 아키텍처 설계**

1. **brand.json + 스크립트**: VS Code 확장 설정값 교체
   - `package.json` 메타데이터 (displayName, author.name 등)
   - walkthrough, command 설정
   - 파일/디렉토리명 (`.clinerules` → `.caretrules`)

2. **i18n 시스템**: 모든 사용자 표시 텍스트
   - UI 브랜드 텍스트 (`brand.appName` 등)
   - 백엔드 하드코딩 메시지 → i18n 직접 매핑 (방식 B 채택)

#### **📋 작업 계획 및 범위**

##### **Phase 1: 백엔드 하드코딩 메시지 조사** 
- **작업 범위**: `src/` 전체에서 브랜드명 포함 하드코딩 텍스트 검색
- **검색 패턴**: `"Cline wants"`, `"Cline has"`, `"Cline is"`, `"Cline cannot"` 등
- **예상 대상 파일들**:
  ```
  src/common.ts: "Cline has been updated to v${version}"
  src/core/task/index.ts: "Cline is having trouble", "Cline has auto-approved"
  src/core/task/tools/handlers/*.ts: 각종 제안 메시지들
  ```

##### **Phase 2: i18n 직접 매핑 키 생성**
- **구현 방식**: i18n 키를 하드코딩 스트링 자체로 사용 (방식 B)
- **추가할 파일**: `webview-ui/src/caret/locale/*/common.json`
- **키 구조**:
  ```json
  {
    "Cline wants to open browser": "{{brand.appName}} wants to open browser",
    "Cline has been updated to v": "{{brand.appName}} has been updated to v{{version}}",
    "Cline is having trouble. Would you like to continue the task?": "{{brand.appName}} is having trouble. Would you like to continue the task?",
    "Cline has auto-approved": "{{brand.appName}} has auto-approved {{count}} API requests",
    "Cline is suggesting to condense your conversation with": "{{brand.appName}} is suggesting to condense your conversation with: {{context}}",
    "Cline is suggesting to start a new task with": "{{brand.appName}} is suggesting to start a new task with: {{context}}",
    "Cline is suggesting to create a github issue with the title": "{{brand.appName}} is suggesting to create a github issue with the title: {{title}}",
    "Cline has a question": "{{brand.appName}} has a question..."
  }
  ```

##### **Phase 3: 다국어 번역 작업**
- **한국어 번역**:
  ```json
  {
    "Cline wants to open browser": "{{brand.appName}}이 브라우저를 열기 원합니다",
    "Cline has been updated to v": "{{brand.appName}}이 v{{version}}으로 업데이트되었습니다",
    "Cline is having trouble. Would you like to continue the task?": "{{brand.appName}}에 문제가 발생했습니다. 작업을 계속하시겠습니까?",
    "Cline has auto-approved": "{{brand.appName}}이 {{count}}개의 API 요청을 자동 승인했습니다"
  }
  ```
- **일본어, 중국어 번역** 동일 패턴으로 추가

##### **Phase 4: 프론트엔드 변환 로직 구현**
- **구현 위치**: 백엔드 메시지 수신하는 부분 (webview message handler)
- **변환 로직**:
  ```typescript
  const handleBackendMessage = (message: string) => {
    // 하드코딩 메시지를 i18n 키로 직접 사용
    const translatedMessage = t(message) || message;
    return translatedMessage;
  }
  ```

#### **🔄 작업 순서**

1. **Step 1**: 백엔드 하드코딩 메시지 전체 조사 및 리스트업
2. **Step 2**: 조사된 메시지들을 기반으로 i18n 키 생성 (영어 base)
3. **Step 3**: 한국어, 일본어, 중국어 번역 작업
4. **Step 4**: 프론트엔드 메시지 변환 로직 구현
5. **Step 5**: 테스트 및 검증 (브랜딩 스크립트 연동 테스트)

#### **✅ 장점**
- ✅ **백엔드 코드 수정 없음**: 기존 하드코딩 메시지 그대로 사용
- ✅ **브랜딩 + 다국어 동시 처리**: `{{brand.appName}}` 자동 변환
- ✅ **완전 가역적**: 브랜딩 스크립트로 언제든지 Cline ↔ Caret 전환
- ✅ **관리 편의성**: 별도 매핑 파일 없이 i18n에서 통합 관리
- ✅ **확장성**: 새로운 백엔드 메시지 추가 시 i18n만 업데이트

## 작업 완료 후
- 'caret-docs/features/f02-multilingual-i18n.mdx' 에 기능에 대한 설명과 구현 범위에 두어 기입해 둘것  ('caret-compare/caret-docs/features/caret-i18n-system.mdx' 수준으로 기입하면 됨) ✅