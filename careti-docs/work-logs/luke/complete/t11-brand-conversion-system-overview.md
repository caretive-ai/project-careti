# T11: 브랜드 변환 시스템 개요 및 문제 분석

## 📌 작업 배경
- **일시**: 2025-01-14
- **문제**: 브랜드 변환 시스템이 복잡하고 중복되어 있으며, locale 변환이 실제 프로젝트에 적용되지 않는 치명적 결함 발견
- **목표**: 통합된 프론트엔드 브랜드 변환 도구 개발 및 시스템 정리

## 🔍 현재 시스템 분석

### 1. 브랜드 변환 체계
```
cline ↔ careti ↔ codecenter
```

### 2. 현재 도구 현황

#### 백엔드 도구 (정상 동작 ✅)
- **`careti-b2b/tools/brand-converter.js`** - 메인 통합 도구
  - package.json 텍스트 변환
  - 백엔드 소스 규칙 경로 변환
  - assets 폴더 교체
  - 자동 빌드 실행

#### 프론트엔드 도구 (문제 있음 ❌)
1. **`careti-b2b/tools/brand-converter-frontend.js`**
   - JSON 매핑 기반 텍스트 치환
   - 파일별 .backup 생성
   - cline ↔ careti만 지원

2. **`careti-scripts/tools/locale-brand-converter.js`**
   - ⚠️ **치명적 문제**: brands 폴더에만 결과 저장, 실제 프로젝트 미적용
   - 다국어 매핑 지원
   - JSON 유효성 검증

3. **`careti-scripts/tools/frontend-brand-converter.js`**
   - 미완성 코드
   - 로그 파일 생성 기능

4. **`careti-scripts/tools/codecenter-locale-replacer.js`**
   - 한국어 조사 처리
   - 단방향만 지원

## 🚨 핵심 문제점

### 1. Locale 변환 미적용 문제
**현재 동작 (잘못됨):**
```
webview-ui/src/careti/locale/ → 변경 없음 ❌
brands/codecenter/locale/ → 여기에만 변환 결과 저장
```

**올바른 동작:**
```
1. webview-ui/src/careti/locale/ → brands/careti/locale-backup/ (백업)
2. brands/codecenter/locale/ → webview-ui/src/careti/locale/ (적용) ✅
```

### 2. 복원 시스템 부재
- git checkout에 의존하여 수정 내용 손실
- 체계적인 백업/복원 메커니즘 없음

### 3. 도구 중복 및 혼란
- 프론트엔드 변환 도구 4개 중복
- 각 도구마다 다른 방식과 기능
- 문서화 부족

### 4. README.md 오류
- forward/backward 방향 설명 혼란
- 실제 동작과 설명 불일치

## 💡 해결 방안

### 1. 통합 프론트엔드 도구 개발
- 모든 기능을 하나의 도구로 통합
- 실제 프로젝트 경로에 적용
- 체계적인 백업/복원 시스템

### 2. 올바른 변환 플로우
```javascript
// Careti → CodeCenter
1. 현재 상태 백업 (brands/{brand}/backup/)
2. 새 브랜드 적용 (webview-ui/src/careti/locale/, assets/)

// 복원
1. 백업에서 복원 (brands/{brand}/backup/ → 프로젝트)
```

### 3. 디렉토리 구조 정리
```
careti-b2b/
├── brands/
│   ├── careti/
│   │   ├── locale/           # 기본 locale
│   │   ├── locale-backup/    # 백업
│   │   ├── assets/           # 기본 assets
│   │   └── assets-backup/    # 백업
│   └── codecenter/
│       ├── locale/           # codecenter locale
│       └── assets/           # codecenter assets
└── tools/
    ├── brand-converter.js           # 백엔드 (유지)
    └── frontend-brand-converter.js  # 프론트엔드 (통합)
```

## 📊 현재 브랜드별 설정

### careti
- **대상**: cline ↔ careti
- **설정**: `brands/careti/brand-config.json`
- **버전**: 0.1.3

### codecenter
- **대상**: careti ↔ codecenter
- **설정**: `brands/codecenter/brand-config.json`
- **회사명**: Caretive → Slexn

### cline
- **대상**: 원본 Cline
- **설정**: `brands/cline/brand-config.json`
- **버전**: 3.26.6

## 🔧 통합 도구 기능 명세

### 명령어
```bash
# 변환
node frontend-brand-converter.js careti codecenter

# 복원
node frontend-brand-converter.js --restore careti

# 상태 확인
node frontend-brand-converter.js --status

# 옵션
--dry-run       # 시뮬레이션
--verbose       # 상세 로그
--locale-only   # locale만
--assets-only   # assets만
```

### 지원 기능
1. **다국어 매핑** - 한/영/중/일
2. **한국어 조사 처리** - 캐러티가→코드센터가
3. **회사명 변경** - Caretive→Slexn
4. **JSON 유효성 검증**
5. **백업/복원 시스템**
6. **통계 및 로깅**

## 📝 작업 계획
→ [t11-brand-conversion-work-checklist.md](t11-brand-conversion-work-checklist.md) 참조