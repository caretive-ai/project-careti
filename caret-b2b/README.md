# Caret B2B Solutions

**기업용 브랜딩 및 업스트림 머징 전문 솔루션**

## 📋 개요

이 저장소는 **2가지 핵심 영역**의 전문 솔루션을 관리합니다:

### 🔄 **업스트림 머징 관리** (`Cline ↔ Caret`)
- **목적**: Cline 원본 저장소와의 지속적인 동기화
- **사용 시점**: Cline 업데이트 머징 시
- **주요 기능**: 
  - 안전한 양방향 변환 (`cline ↔ caret`)
  - `// CARET MODIFICATION:` 주석 기반 변경점 추적
  - 머징 충돌 최소화 및 자동 해결
  - 업스트림 호환성 유지

### 🏢 **B2B 브랜딩 서비스** (`Caret ↔ CodeCenter`)
- **목적**: 기업 고객별 맞춤 브랜딩 솔루션 제공
- **사용 시점**: 기업용 배포 및 브랜딩 변환 시
- **주요 기능**:
  - 기업별 브랜드 아이덴티티 적용
  - 맞춤형 기능 추가/제거 (비용 숨김 등)
  - 다국어 i18n 브랜딩 지원
  - 기업 요구사항 기반 커스터마이징

## 🎯 **핵심 차별점**

### **업스트림 머징** vs **B2B 브랜딩**
| 구분 | 업스트림 머징 | B2B 브랜딩 |
|------|---------------|------------|
| **대상** | `Cline ↔ Caret` | `Caret ↔ CodeCenter` |
| **목적** | 원본 동기화 | 기업 맞춤화 |
| **빈도** | 정기적 (월 1-2회) | 프로젝트별 (일회성) |
| **범위** | 코어 기능 유지 | UI/UX 커스터마이징 |
| **복잡도** | 높음 (충돌 해결) | 중간 (브랜드 변환) |

## 🗂️ 디렉토리 구조

```
caret-b2b/
├── 🔄 업스트림 머징 관련
│   ├── caret-assets/              # Cline ↔ Caret 양방향 변환
│   │   └── brand-config.json      # 업스트림 머징용 브랜딩 설정
│   └── tools/
│       ├── brand-change-v2.js     # 업스트림 머징 엔진
│       └── brand-change.test.js   # 머징 테스트
│
├── 🏢 B2B 브랜딩 관련
│   ├── brands/                    # 기업별 브랜드 설정
│   │   └── codecenter/            # CodeCenter 브랜딩
│   │       ├── brand-config.json        # 백엔드 브랜딩 설정
│   │       └── brand-config-front.json  # 프론트엔드 브랜딩 설정
│   └── clients/                   # 클라이언트별 리소스
│       └── codecenter/            # CodeCenter 전용 리소스
│
├── 📚 공통 도구 및 문서
│   ├── tools/
│   │   └── brand-converter.js     # 통합 브랜딩 변환기
│   └── docs/                      # 매뉴얼 및 가이드
│       ├── branding-manual.md
│       ├── merging-i18n-workflow.md
│       └── i18n-unused-key-analyzer.md
```

## 🔧 핵심 기능

### 🔄 **업스트림 머징 관리** (Cline ↔ Caret)

#### **1. 양방향 변환 시스템**
```bash
# Cline → Caret (머징 후)
node tools/brand-change-v2.js --direction=forward

# Caret → Cline (머징 준비)
node tools/brand-change-v2.js --direction=reverse

# 테스트 모드
node tools/brand-change-v2.js --dry-run --verbose
```

#### **2. 머징 안전성 기능**
- **`// CARET MODIFICATION:` 주석 체계**: 변경점 자동 추적
- **충돌 최소화**: 코어 로직 보존하며 브랜드 요소만 변경
- **롤백 지원**: 머징 실패 시 안전한 복구
- **변경점 검증**: 의도하지 않은 수정 자동 감지

### 🏢 **B2B 브랜딩 서비스** (Caret ↔ CodeCenter)

#### **1. 백엔드 브랜딩**
```bash
# Caret → CodeCenter (백엔드)
node tools/brand-converter.js codecenter forward --backend

# CodeCenter → Caret (복구)
node tools/brand-converter.js codecenter backward --backend
```

#### **2. 프론트엔드 브랜딩** ⭐ **신규**
```bash
# Caret → CodeCenter (프론트엔드 + i18n)
node ../caret-scripts/tools/frontend-brand-converter.js brands/codecenter/brand-config-front.json forward

# CodeCenter → Caret (복구)
node ../caret-scripts/tools/frontend-brand-converter.js brands/codecenter/brand-config-front.json backward
```

#### **3. 기업 맞춤 기능** ⭐ **Opt-in 기능**

**비용 숨김 기능** (CodeCenter 전용)
```json
// brand-config-front.json
{
  "features": {
    "cost_hiding": {
      "enabled": true,        // 기업별 ON/OFF 제어
      "targets": [
        ".task-cost-display",  // Task 윈도우 우측 상단
        ".api-request-cost"    // API Request 옆 비용
      ]
    }
  }
}
```

**확장 가능한 기능 시스템**
- **Feature Flag 기반**: 기업별 요구사항에 따른 선택적 적용
- **복구 지원**: 완전 삭제가 아닌 숨김 처리로 안전한 복구
- **CSS 기반**: 비침습적 UI 변경으로 코어 로직 보존
- **검증 시스템**: 변환 전후 JSON/CSS 문법 자동 검증

## 🚀 워크플로우 및 사용법

### **전체 브랜딩 흐름**
```
Cline (원본) ──머징──► Caret (포크) ──B2B──► CodeCenter (기업용)
      ▲                    │                      │
      └────── 업스트림 ─────┘        └─── 브랜딩 ───┘
```

### **🔄 업스트림 머징 워크플로우**
```bash
# 1. 머징 전 준비: Caret → Cline
node tools/brand-change-v2.js --direction=reverse --dry-run
node tools/brand-change-v2.js --direction=reverse

# 2. Cline 원본과 머징 작업 수행
git merge upstream/main

# 3. 머징 후 복구: Cline → Caret
node tools/brand-change-v2.js --direction=forward --dry-run  
node tools/brand-change-v2.js --direction=forward

# 4. i18n 시스템 정리 (머징 후)
node ../caret-scripts/tools/report-i18n-unused-key.js
```

### **🏢 B2B 브랜딩 워크플로우**
```bash
# 1. 백엔드 브랜딩: Caret → CodeCenter
node tools/brand-converter.js codecenter forward --backend --dry-run
node tools/brand-converter.js codecenter forward --backend

# 2. 프론트엔드 브랜딩: i18n + 맞춤 기능
node ../caret-scripts/tools/frontend-brand-converter.js brands/codecenter/brand-config-front.json forward --dry-run
node ../caret-scripts/tools/frontend-brand-converter.js brands/codecenter/brand-config-front.json forward

# 3. 통합 변환 (백엔드 + 프론트엔드)
node tools/brand-converter.js codecenter forward --all

# 4. 복구 (필요시)
node tools/brand-converter.js codecenter backward --all
```

### **🆕 새 B2B 클라이언트 추가**
```bash
# 1. 브랜드 디렉토리 생성
mkdir -p brands/new-client

# 2. 백엔드 브랜딩 설정 복사
cp brands/codecenter/brand-config.json brands/new-client/
# 브랜드명, 로고, 색상 등 수정

# 3. 프론트엔드 브랜딩 설정 복사  
cp brands/codecenter/brand-config-front.json brands/new-client/
# i18n 브랜드 매핑, 맞춤 기능 설정

# 4. 맞춤 기능 설정 (Opt-in)
# brand-config-front.json에서 features 섹션 수정:
{
  "features": {
    "cost_hiding": {"enabled": false},     // 비용 표시 (기본값)
    "custom_theme": {"enabled": true},     // 커스텀 테마
    "enterprise_mode": {"enabled": true}   // 기업용 모드
  }
}

# 5. 테스트 및 배포
node tools/brand-converter.js new-client forward --dry-run --verbose
node ../caret-scripts/tools/frontend-brand-converter.js brands/new-client/brand-config-front.json forward --dry-run
```

## 🎯 **Opt-in 기능 상세**

### **기업별 맞춤 기능 목록**

#### **✅ 현재 지원 기능**
| 기능 | 설명 | 대상 기업 | 구현 방식 |
|------|------|-----------|-----------|
| **비용 숨김** | UI에서 비용 정보 완전 숨김 | CodeCenter | CSS + Feature Flag |
| **브랜드 매핑** | 로고, 색상, 텍스트 일괄 변환 | 전체 | JSON 매핑 |
| **다국어 i18n** | 기업 브랜드 기반 다국어 지원 | 전체 | Locale 교체 |

#### **🔄 개발 예정 기능** 
| 기능 | 설명 | 예상 대상 |
|------|------|-----------|
| **커스텀 테마** | 기업 CI 기반 색상/폰트 테마 | Samsung, LG |
| **기업용 모드** | 고급 보안 기능, 관리자 패널 | 대기업 |
| **로고 치환** | 동적 로고 교체 시스템 | 전체 |
| **메뉴 커스터마이징** | 기업별 메뉴 구조 조정 | 맞춤형 |

### **기능 추가 프로세스**
1. **요구사항 수집**: 기업별 특수 요구사항 분석
2. **Feature Flag 추가**: `brand-config-front.json`에 새 기능 섹션 추가
3. **구현 및 테스트**: 비침습적 방식으로 기능 구현
4. **검증 시스템**: 자동 테스트 및 롤백 기능 확보
5. **배포 및 모니터링**: 단계적 배포 및 안정성 모니터링

## 📞 비즈니스 문의

### **🏢 B2B 브랜딩 서비스**
- **이메일**: business@caretive.com
- **실적**: Samsung Dev, LG Code 등 다수 기업 제공
- **서비스 범위**: 
  - 브랜드 아이덴티티 적용
  - 맞춤 기능 개발
  - 기업용 배포 및 유지보수

### **🔄 업스트림 머징 컨설팅**
- **대상**: Cline 포크 프로젝트 운영 기업
- **서비스**: 
  - 안전한 머징 전략 수립
  - 충돌 해결 자동화
  - 업스트림 호환성 유지

## 📚 매뉴얼 및 문서

- **[브랜딩 시스템 매뉴얼](docs/branding-manual.md)** - 브랜딩 도구 사용법 및 기능 가이드
- **[I18n 자동화 도구](docs/i18n-script-manual.md)** - 머징을 위한 프론트엔드 국제화 자동 탐지 및 보고서 생성
- **[I18n 미사용 키 분석기](docs/i18n-unused-key-analyzer.md)** - i18n 시스템의 미사용 키 탐지 및 정리 도구
- **[머징 후 I18n 관리 워크플로우](docs/merging-i18n-workflow.md)** - Cline 머징 작업 후 i18n 시스템 체계적 관리 가이드

### Brand Converter 통합 도구

`tools/brand-converter.js`는 cline ↔ caret ↔ codecenter 간의 통합 브랜딩 변환을 수행하는 핵심 도구입니다.
  * cline ↔ caret : backend, asset 
  * caret  ↔ codecenter :  backend, asset, front-i18n

#### 주요 기능
- **동적 브랜드 감지**: package.json을 분석하여 현재 브랜드 자동 감지
- **양방향 변환**: forward/backward 방향 변환 지원
- **백엔드/프론트엔드 분리**: 각각 독립적으로 변환 가능
- **매핑 검증**: 중첩, 순환참조, 빈 값 등 자동 검증
- **동적 버전 매핑**: CHANGELOG에서 버전 정보 추출하여 자동 매핑

#### 사용법
```bash
# 기본 사용법
node tools/brand-converter.js [브랜드] [방향] [옵션]

# 예시: caret 브랜드로 forward 변환
node tools/brand-converter.js caret forward

# 예시: codecenter 브랜드로 backward 변환  
node tools/brand-converter.js codecenter backward

# 옵션
--dry-run          # 실제 변경 없이 시뮬레이션
--no-build         # 변환 후 빌드 스킵
--backend          # 백엔드만 변환
--frontend         # 프론트엔드만 변환 
--all              # 백엔드 + 프론트엔드 변환 (기본값)
--status           # 현재 브랜드 상태 확인
```

#### 변환 프로세스
1. **브랜드 감지**: package.json의 displayName 분석
2. **설정 로드**: `brands/[브랜드]/brand-config.json` 로드
3. **텍스트 변환**: package.json 필드 매핑 적용
4. **규칙 경로 변환**: 백엔드 파일의 규칙 경로 수정
5. **이미지 복사**: 브랜드별 아이콘 및 에셋 복사
6. **빌드 실행**: compile/build 스크립트 자동 실행

#### 설정 파일 구조
```json
{
  "metadata": {
    "brand": "caret",
    "target": "cline", 
    "description": "cline → caret 변환"
  },
  "brand_mappings": {
    "package_json": {
      "Cline": "Caret",
      "cline": "caret"
    },
    "rule_paths": {
      ".cline": ".caret",
      "cline-rules": "caret-rules"
    }
  },
  "file_paths": {
    "src/core/storage/disk.ts": "rule_paths",
    "src/integrations/terminal/TerminalRegistry.ts": "rule_paths"
  }
}
```

#### 매핑 검증 기능
- **중첩 매핑 감지**: 긴 문자열 안에 짧은 문자열 포함 여부
- **순환참조 검증**: A→B, B→A 형태의 순환 매핑 감지  
- **빈 값 검증**: 매핑 키나 값이 비어있는 경우 감지
- **URL 형식 검증**: URL 매핑의 일관성 확인

## ⚠️ 중요 사항

이 저장소는 **비공개 B2B 노하우**를 포함합니다:
- 공개 저장소에 절대 커밋 금지
- 브랜딩 기술 및 전략 보호
- 클라이언트 정보 보안 유지

---
**© 2025 Caret Team - B2B Solutions**