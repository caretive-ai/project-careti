# t03-4 CodeCenter 통합 및 리브랜딩 완성 작업

**작업 기간**: 2025-01-09 ~ 진행중  
**담당자**: Luke Yang  
**우선순위**: Critical  
**AI 어시스턴트**: Claude Code

## 🎯 작업 개요

t03 브랜딩 시스템, t06 JSON 시스템 프롬프트, t02 다국어 i18n 작업 완료 후 **CodeCenter 리브랜딩의 완전한 통합**을 목표로 한다. 기존 시스템들 간의 연동 문제를 해결하고 CodeCenter 브랜드로의 완전한 전환을 구현한다.

## 🚨 발견된 핵심 문제점

### 1. **백엔드 메시지 i18n 미연동**
- **현황**: `src/core/task/tools/handlers/*.ts`에 "Caret wants to..." 하드코딩 메시지 10개 이상
- **문제**: CodeCenter 변환 시 영어로만 표시, 다국어 지원 불가
- **영향**: 사용자 경험 일관성 부족

### 2. **CodeCenter 로케일 파일 구버전 사용**
- **현황**: t02에서 최신 i18n 완성 (11개 파일, 4개 언어)
- **문제**: CodeCenter 브랜드 폴더에 구버전 로케일 파일 사용
- **영향**: 최신 번역 및 기능 누락

### 3. **브랜딩 스크립트 프론트엔드 연동 부족**
- **현황**: backend 변환만 지원 (`brand-config.json`)
- **문제**: frontend i18n 자동 변환 미지원 (`brand-config-front.json`)
- **영향**: 수동 로케일 관리 필요

### 4. **JSON 프롬프트 시스템의 브랜드 종속성**
- **현황**: Caret 모드에서만 JSON 시스템 사용
- **문제**: CodeCenter도 동일한 JSON 시스템을 사용해야 하나 브랜드명에 종속적
- **영향**: 브랜드별 시스템 분리 현상

## 📋 작업 계획

### **Phase 1: CodeCenter 로케일 최신화** (우선순위: 1)
**목표**: 최신 i18n 시스템을 CodeCenter 브랜드에 완전 동기화

#### 1.1 현재 i18n 시스템 백업 및 분석
- ✅ **완료**: 현재 `webview-ui/src/caret/locale/` 상태 확인 (11개 파일, 4개 언어)
- ✅ **완료**: CodeCenter 브랜드 로케일과 차이점 분석
- ✅ **완료**: modeSystem i18n 구조 문제 해결 (nested → flat 구조 변경)
- ✅ **완료**: TaskHeader i18n 매개변수 순서 문제 해결 (`t(key, fallback)` → `t(key, namespace)`)
- 📋 **대상 파일들**:
  ```
  announcement.json, browser.json, chat.json, common.json, 
  history.json, models.json, persona.json, rules.json, 
  settings.json, validate-api-conf.json, welcome.json
  ```

#### 1.2 CodeCenter 로케일 파일 업데이트
- 📂 **소스**: `webview-ui/src/caret/locale/*`
- 📂 **타겟**: `caret-b2b/brands/codecenter/locale/*` 
- 🔧 **방법**: 브랜딩 변환 규칙 적용하여 동기화
  ```
  Caret → CodeCenter
  캐럿 → 코드센터
  caret → codecenter
  ```

#### 1.3 브랜딩 변환 검증
- ✅ **검증**: 모든 언어별 브랜딩 일관성 확인
- ✅ **테스트**: JSON 파일 유효성 검사
- ✅ **문서화**: 변환 규칙 및 프로세스 기록

### **Phase 2: 브랜딩 스크립트 프론트엔드 연동** (우선순위: 2)
**목표**: `brand-converter.js`가 frontend i18n 파일도 자동 변환하도록 개선

#### 2.1 Frontend 변환 로직 통합
- ✅ **완료**: `brand-converter.js`가 frontend + backend 통합 변환 지원
- ✅ **완료**: template_characters.json 자동 복사 시스템 구축
- ✅ **완료**: webview 빌드 시 assets 자동 복사 (`caret-scripts/build/copy-template-characters.cjs`)
- ✅ **완료**: .vscodeignore 수정으로 caret-src 디렉토리 VSIX 포함

#### 2.2 변환 워크플로우 개선
- 🚀 **명령어**: `node brand-converter.js codecenter --frontend`
- 📋 **동작**:
  1. Backend 파일 변환 (`brand-config.json`)
  2. Frontend i18n 파일 변환 (`brand-config-front.json`)
  3. 자동 빌드 및 검증
  4. 백업 생성

#### 2.3 전체 변환 테스트
- 🔄 **테스트 시나리오**: caret ↔ codecenter ↔ cline 순환 변환
- ✅ **검증**: 각 브랜드에서 UI 및 기능 정상 동작
- 📊 **성능**: 변환 시간 및 안정성 측정

### **Phase 3: 백엔드 메시지 i18n 연동** (우선순위: 3)  
**목표**: 백엔드 하드코딩 메시지를 i18n 시스템과 연동하여 다국어 지원

#### 3.1 백엔드 메시지 i18n 키 매핑 시스템 구축
- 📋 **대상 메시지들**:
  ```typescript
  "Caret wants to edit/create {filename}"
  "Caret wants to use a browser and launch {url}"
  "Caret wants to fetch content from {url}"
  "Caret wants to use {tool_name} on {server_name}"
  "Caret wants to access {uri} on {server_name}"
  "Caret wants to search files for {regex}"
  "Caret wants to create a github issue..."
  "Caret wants to read {filename}"
  ```

#### 3.2 i18n 키 직접 매핑 방식 구현 (방식 B)
- 🗃️ **구현**: `webview-ui/src/caret/locale/*/common.json`에 백엔드 메시지 키 추가
- 🔧 **키 구조**:
  ```json
  {
    "Caret wants to edit {{filename}}": "{{brand.appName}}이 {{filename}}을 편집하려고 합니다",
    "Caret wants to create {{filename}}": "{{brand.appName}}이 {{filename}}을 생성하려고 합니다",
    "Caret wants to use a browser": "{{brand.appName}}이 브라우저를 사용하려고 합니다"
  }
  ```

#### 3.3 프론트엔드 메시지 변환 로직 구현
- 📍 **구현 위치**: webview message handler
- 🔧 **변환 로직**:
  ```typescript
  const translateBackendMessage = (message: string) => {
    // 하드코딩 메시지를 i18n 키로 직접 사용
    const translatedMessage = t(message) || message;
    return translatedMessage;
  }
  ```

#### 3.4 브랜딩 템플릿 처리
- 🏷️ **브랜드 변수**: `{{brand.appName}}` 자동 치환
- 🌍 **다국어 지원**: 4개 언어별 번역 완료
- 🔄 **브랜드 독립**: Caret/CodeCenter 모두 동일한 키 사용

### **Phase 4: JSON 프롬프트 시스템 브랜드 독립화** (우선순위: 4)
**목표**: JSON 프롬프트 시스템이 모든 브랜드에서 동일하게 작동하도록 개선

#### 4.1 브랜드 독립적 모드 시스템 구현
- 🔧 **현재**: `CaretGlobalManager.currentMode === "caret"`으로 JSON 시스템 활성화
- ✨ **개선**: 브랜드와 무관하게 JSON 시스템 사용 가능
- 🎯 **목표**: CodeCenter에서도 JSON 프롬프트 시스템 사용

#### 4.2 브랜드별 JSON 템플릿 관리
- 📁 **구조**: 
  ```
  caret-src/core/prompts/templates/
  ├── caret/          # Caret 전용 템플릿
  ├── codecenter/     # CodeCenter 전용 템플릿  
  └── shared/         # 공통 템플릿
  ```

#### 4.3 동적 브랜드 감지 및 템플릿 로딩
- 🔍 **브랜드 감지**: 현재 package.json에서 브랜드 자동 인식
- 📋 **템플릿 로딩**: 브랜드별 또는 공통 템플릿 동적 로딩
- 🎨 **브랜딩 적용**: 템플릿 내 브랜드 변수 자동 치환

## 🚨 **현재 작업 상태 및 남은 작업** (2025-01-14 업데이트)

### 📌 **구현 완료된 부분**
1. ✅ **백엔드 브랜드 변환**: `brand-converter.js`가 백엔드 하드코딩 텍스트 replace 처리
2. ✅ **프론트엔드 변환 스크립트**: `brand-converter-frontend.js` 존재
3. ✅ **Caret 최신 i18n**: 14개 locale 파일, 4개 언어 완성
4. ✅ **빌드 시스템**: template_characters 자동 복사, VSIX 패키징

### ⚠️ **남은 작업 (우선순위 순)**

#### 1. **CodeCenter locale 파일 최신화** 🔴 긴급
- **현재 문제**: CodeCenter가 구버전 locale 사용 중 (settings.json 43KB vs 368B)
- **작업 내용**:
  1. Caret의 최신 locale 파일을 CodeCenter로 복사
  2. 브랜드명 일괄 변환 (Caret → CodeCenter, 캐럿 → 코드센터)
  3. 4개 언어 × 14개 파일 = 56개 파일 처리

#### 2. **locale 자동 변환 스크립트 구현** 🟡 중요
- **현재 문제**: locale 파일 수동 복사/변환 필요
- **작업 내용**:
  ```bash
  # 신규 스크립트 필요
  node caret-scripts/tools/locale-brand-converter.js caret codecenter
  ```
  - Caret locale → CodeCenter locale 자동 변환
  - 브랜드명 replace 규칙 적용
  - JSON 유효성 검증

#### 3. **통합 브랜드 변환 워크플로우 검증** 🟢 필수
- **시나리오**:
  1. `node brand-converter.js codecenter` - 백엔드 변환
  2. locale 파일 변환 (위 스크립트 실행)
  3. `node brand-converter-frontend.js codecenter` - 프론트엔드 변환
  4. 빌드 및 테스트

#### 4. **백엔드 메시지 처리 방식 확정** 🔵 선택
- **현재 방식**: 하드코딩 유지, brand-converter.js가 replace
- **대안 검토**: i18n 시스템 연동 (Phase 3 내용)
- **결정 필요**: 현재 방식 유지 vs i18n 연동

## 🎯 최종 목표

### ✅ **완성 후 기대 효과**

1. **완전한 브랜드 전환**:
   - 3개 명령어로 caret ↔ codecenter 완전 변환
   - UI, 백엔드 메시지, locale 모두 일관된 브랜딩

2. **다국어 일관성**:
   - 모든 사용자 대면 텍스트가 선택한 언어로 표시
   - 백엔드 메시지도 브랜드에 맞게 표시

3. **개발 생산성**:
   - 브랜드별 수동 관리 불필요
   - 자동화된 변환 및 검증 시스템

4. **시스템 안정성**:
   - 브랜드 독립적 핵심 기능
   - 일관된 사용자 경험

### 📊 **성공 기준**

- [ ] **locale 최신화**: CodeCenter locale 파일 56개 최신 버전으로 업데이트
- [ ] **자동 변환**: locale 브랜드 변환 스크립트 구현 및 검증
- [ ] **통합 테스트**: 전체 브랜드 변환 시나리오 성공
- [ ] **성능**: 변환 시간 2분 이내
- [ ] **안정성**: 순환 변환 (caret ↔ codecenter) 무오류

## 🔧 사용할 도구 및 스크립트

### **기존 도구**
- `caret-b2b/tools/brand-converter.js` - 통합 브랜딩 변환
- `caret-b2b/tools/brand-converter-frontend.js` - 프론트엔드 변환 (통합 예정)
- `caret-scripts/tools/i18n-key-synchronizer.js` - i18n 키 동기화

### **새로 개발할 도구**
- `caret-scripts/tools/backend-message-i18n-mapper.js` - 백엔드 메시지 i18n 매핑
- `caret-scripts/tools/brand-locale-sync.js` - 브랜드별 로케일 동기화
- `caret-scripts/tools/json-prompt-template-manager.js` - JSON 템플릿 관리

### **Phase 5: 추가 발견 및 해결된 문제들** (2025-01-09 추가)

#### 5.1 VSIX 빌드 시스템 개선
- ✅ **완료**: `package:release` 스크립트 경로 수정 (`codecenter-scripts` → `caret-scripts`)
- ✅ **완료**: `@types/lodash` 의존성 누락 해결
- ✅ **완료**: `.vscodeignore` whitelist 방식에서 `caret-src` 디렉토리 누락 해결
- ✅ **완료**: 15.44MB 크기의 정상 VSIX 패키지 생성

#### 5.2 Template Characters 시스템 개선
- ✅ **완료**: 브랜드 변환 시 불필요한 webview 복사 제거
- ✅ **완료**: 빌드 시 자동 복사 시스템으로 변경 (개발 중 수정 가능)
- ✅ **완료**: `caret-scripts/build/copy-template-characters.cjs` 스크립트 생성
- ✅ **완료**: ES Module 호환성 문제 해결 (`.js` → `.cjs`)

#### 5.3 Extension 활성화 오류 해결
- 🚨 **발견**: VS Code Extension Host에서 `caret-src\core\prompts\sections` 디렉토리 누락 오류
- ✅ **해결**: `.vscodeignore`에 `!caret-src/**` 추가하여 VSIX 포함
- ✅ **검증**: 새 VSIX 패키지에서 `caret-src/ (43 files) [102.73 KB]` 포함 확인

## 🗂️ 관련 문서

- **t03 브랜딩 시스템**: `t03--브랜딩 ui 변경 작업.md`
- **t06 JSON 시스템**: `t06-json-system-prompt.md`  
- **t02 다국어 i18n**: `t02-multilingual-i18n.md`
- **브랜딩 규칙**: `caret-b2b/brands/codecenter/brand-config.json`
- **i18n 시스템**: `caret-docs/features/f02-multilingual-i18n.mdx`

---

**⚠️ 주의사항**
- 모든 변경 전 현재 상태 백업 필수
- 각 Phase 완료 후 빌드 및 테스트 검증
- CARET MODIFICATION 규칙 준수
- 기존 t02, t03, t06 작업 결과 보존