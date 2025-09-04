# I18n Unused Key Analysis Tool

**Caret 프론트엔드 i18n 시스템의 미사용 키 탐지 및 분석 도구**

## 📋 개요

`report-i18n-unused-key.js`는 Caret 프론트엔드의 i18n 시스템에서 정의되어 있지만 실제 컴포넌트에서 사용되지 않는 번역 키들을 자동으로 탐지하고 분석하는 도구입니다.

### 🎯 주요 기능

- **미사용 키 탐지**: locale 파일에 정의되어 있지만 컴포넌트에서 사용되지 않는 키 식별
- **누락 번역 분석**: 일부 언어에서만 번역이 누락된 키 탐지
- **사용률 통계**: 전체 i18n 시스템의 사용률 및 현황 분석
- **컴포넌트 분석**: 각 컴포넌트의 i18n 사용 패턴 분석
- **정리 권장사항**: 효율적인 i18n 유지보수를 위한 개선 제안

## 🚀 사용법

### 기본 실행
```bash
# Caret 프로젝트 루트에서 실행
node caret-scripts/tools/report-i18n-unused-key.js
```

### 출력 파일
- **보고서**: `caret-scripts/i18n-unused-keys-report.md`
- **형식**: 마크다운 형태의 상세 분석 보고서

## 📊 분석 결과 구성

### 1. 요약 통계
- **총 키 개수**: 모든 locale 파일에서 발견된 i18n 키의 총 개수
- **사용중인 키**: 실제 컴포넌트에서 참조되는 키 개수
- **미사용 키**: 정의만 되고 사용되지 않는 키 개수
- **스캔한 파일**: 분석 대상 컴포넌트 파일 개수
- **사용률**: 전체 키 중 실제 사용되는 비율

### 2. 미사용 키 목록
- 키 이름 및 네임스페이스 정보
- 번역이 존재하는 언어 목록
- 네임스페이스별 정렬된 테이블 형태

### 3. 누락 번역 분석
- 일부 언어에서만 번역이 누락된 키들
- 우선순위 표시 (사용중인 키는 높은 우선순위)
- 사용 빈도 기반 정렬

### 4. 컴포넌트 사용 분석
- i18n을 사용하는 컴포넌트 목록
- 각 컴포넌트별 사용 키 개수
- 샘플 키 표시

### 5. 정리 권장사항
- 미사용 키 제거 권장
- 누락 번역 완성 가이드
- 유지보수 모범 사례

## 🔧 기술 사양

### 지원 언어
- **ko** (Korean)
- **en** (English)  
- **ja** (Japanese)
- **zh** (Chinese)

### 지원 네임스페이스
- `announcement`: 공지사항
- `chat`: 채팅 관련
- `common`: 공통 요소
- `models`: AI 모델 관련
- `persona`: 페르소나 설정
- `settings`: 설정 화면
- `validate-api-conf`: API 설정 검증
- `welcome`: 환영 페이지

### 탐지 패턴
```javascript
// 패턴 1: t('namespace.key') 형태
t('settings.language')

// 패턴 2: t('key', 'namespace') 형태  
t('language', 'settings')

// 인식되는 따옴표: ' " `
```

### 파일 스캔 범위
- **대상**: `webview-ui/src/components/` 하위 모든 파일
- **확장자**: `.tsx`, `.ts`, `.jsx`, `.js`
- **재귀 탐색**: 모든 하위 디렉토리 포함

## 🏗️ 내부 구조

### 클래스: I18nUnusedKeyAnalyzer
```javascript
class I18nUnusedKeyAnalyzer {
  // 주요 메서드
  loadI18nKeys()           // locale 파일에서 키 로드
  scanComponentUsage()     // 컴포넌트에서 키 사용 스캔
  analyzeResults()         // 결과 분석 및 통계 생성
  generateReport()         // 마크다운 보고서 생성
}
```

### 데이터 구조
```javascript
// 키 정보 저장
allKeys: Map<string, {
  locales: Set<string>,      // 번역 존재 언어들
  usageCount: number,        // 사용 횟수
  namespaceKey: string,      // 네임스페이스 내 키명
  namespace: string          // 네임스페이스
}>

// 컴포넌트별 사용 키
componentUsage: Map<string, Set<string>>
```

## 📈 활용 사례

### 1. i18n 시스템 현황 파악
```bash
# 현재 상태 확인
node caret-scripts/tools/report-i18n-unused-key.js

# 보고서 확인
cat caret-scripts/i18n-unused-keys-report.md
```

### 2. 정기적인 정리 작업
- **월간 실행**: 미사용 키 정기 점검
- **번역 작업 전**: 누락 번역 우선순위 확인
- **리팩토링 전**: 현재 사용률 파악

### 3. 개발 워크플로우 통합
```bash
# 새 기능 개발 후 i18n 정리
npm run dev:feature
node caret-scripts/tools/report-i18n-unused-key.js
# 보고서 기반 정리 작업
```

## ⚙️ 설정 옵션

### 경로 설정 (config 객체)
```javascript
const config = {
  localeDir: '../../webview-ui/src/caret/locale',
  componentsDir: '../../webview-ui/src/components', 
  outputFile: '../i18n-unused-keys-report.md',
  supportedLocales: ['ko', 'en', 'ja', 'zh'],
  namespaces: [/* ... */]
};
```

### 커스터마이징
필요에 따라 다음 항목들을 수정할 수 있습니다:
- 스캔 대상 디렉토리
- 지원 언어 목록
- 네임스페이스 목록
- 출력 파일 위치

## 🔍 문제 해결

### 일반적인 문제들

#### 1. 경로 오류
```bash
⚠️ Locale directory not found: [경로]
```
**해결법**: 프로젝트 루트에서 실행하거나 config.localeDir 경로 확인

#### 2. JSON 파싱 오류
```bash
❌ Error reading [파일]: JSON parse error
```
**해결법**: 해당 JSON 파일의 구문 오류 수정 (trailing comma 등)

#### 3. 권한 오류
```bash
Error: permission denied
```
**해결법**: 적절한 파일 읽기 권한 확인

### 디버깅 팁
- 스크립트 실행 중 콘솔 출력으로 진행 상황 확인
- 경고 메시지로 누락된 파일들 파악
- 생성된 보고서의 통계 섹션으로 전체 현황 파악

## 🚦 제한사항

### 탐지 한계
- **동적 키**: 템플릿 리터럴이나 변수로 생성된 키는 탐지 불가
- **주석 내 키**: 주석 처리된 코드의 키도 사용중으로 인식
- **외부 라이브러리**: node_modules 내 키 사용은 탐지 안됨

### 예시: 탐지되지 않는 패턴
```javascript
// 동적 키 생성 (탐지 안됨)
const key = `settings.${type}`;
t(key);

// 템플릿 리터럴 (탐지 안됨)  
t(`common.${action}Button`);

// 변수 사용 (탐지 안됨)
const namespace = 'chat';
t('title', namespace);
```

## 🔄 업데이트 히스토리

### v1.0.0 (2025-09-03)
- **초기 릴리즈**: 기본 미사용 키 탐지 기능
- **지원 언어**: ko, en, ja, zh
- **네임스페이스**: 8개 지원
- **분석 기능**: 사용률, 누락 번역, 컴포넌트 분석
- **보고서**: 마크다운 형태 상세 리포트

## 🤝 기여 및 개선

### 개선 아이디어
- **동적 키 탐지**: AST 분석을 통한 고급 패턴 탐지
- **시각화**: 그래프 형태의 사용률 차트
- **자동 정리**: 미사용 키 자동 제거 옵션
- **통계 트렌드**: 시간별 사용률 변화 추적

### 코드 기여
1. 기능 개선 사항 제안
2. 버그 리포트 및 수정
3. 새로운 탐지 패턴 추가
4. 성능 최적화

---

**© 2025 Caret Team - I18n Analysis Tools**

## 📚 관련 문서

- **[브랜딩 시스템 매뉴얼](branding-manual.md)** - 브랜딩 도구 사용법
- **[메인 README](../README.md)** - Caret B2B 전체 개요
- **[t03-3 작업 로그](../../caret-docs/work-logs/luke/t03-3-프론트i18n및상호이식개선.md)** - 관련 작업 진행사항