# B2B 브랜딩 워크플로우 - slexn-codecenter 전환 가이드

## 핵심 원칙
메인 Caret 저장소는 브랜드에 구애받지 않아야 합니다. 모든 브랜딩 관련 로직, 자산, 설정은 `slexn-codecenter` 서브모듈 내에 격리됩니다.

**복원**: 변경 사항을 되돌리는 주요 방법은 `git`입니다. 스크립트 기반 백업(`.backup-providers/`)은 제공자 설정을 위한 2차 안전장치입니다.

## 1. 사전 작업 분석
`b2b`, `brand`, `codecenter`, `conversion`과 같은 키워드가 나타나면, **이 문서를 가장 먼저 읽어야 합니다**.

## 2. 브랜드 전환 시스템

### 실행 방법
**직접 Node.js 실행** (npm 스크립트 아님):
```bash
# 전체 전환
node tools/brand-converter.js codecenter --all

# 드라이런 (시뮬레이션)
node tools/brand-converter.js codecenter --all --dry-run

# 백엔드만
node tools/brand-converter.js codecenter --backend

# 프론트엔드만
node tools/brand-converter.js codecenter --frontend
```

### 하이브리드 전환 접근법

브랜드 변환기는 **2단계 하이브리드 접근법**을 사용합니다:

**1단계: 블랙리스트 기반 전환 (광범위)**
- 프로젝트 전반의 브랜드 텍스트 교체
- **보호 영역**: 핵심 스크립트, 프로토콜 파일 (블랙리스트를 통해)
- 자동 UI 텍스트 및 브랜딩 요소 전환

**2단계: 화이트리스트 기반 미세 조정 (정밀)**
- 누락되거나 잘못 변환된 항목에 대한 정밀 수정
- 메타데이터 조정: GitHub URL, 회사명, 버전
- VSCode 명령어 매핑

### 14단계 전환 프로세스

1.  **브랜드 감지**: `package.json`의 displayName 자동 분석
2.  **설정 로딩**: `brand-config.json` 및 `brand-config-front.json` 로드
3.  **CHANGELOG 자동 버전 관리**:
    -   `CHANGELOG.md`에서 최신 버전 추출
    -   버전 매핑 자동 생성
4.  **백업**: 제공자 설정 → `.backup-providers/` (언어별)
5.  **하이브리드 전환**:
    -   **화이트리스트**: GitHub URL, 회사명, VSCode 명령어
    -   **블랙리스트**: 보호된 파일 제외, 모든 브랜드 텍스트 전환
6.  **프론트엔드 i18n**: 4개 언어 전환 (ko/en/ja/zh)
7.  **자산 복사**: 아이콘, 페르소나, 템플릿
8.  **메타데이터 교체**: `package.json`, `CHANGELOG.md`, `announcement.json`
9.  **제공자 시스템**: LiteLLM 설정 및 제공자 정책
10. **복원**: 백업된 제공자 설정 복원
11. **페르소나 플래그**: 브랜드별 페르소나 시스템 설정
12. **기본 제공자**: 기본 제공자 설정
13. **브랜드 설정**: 동적 브랜드 설정 파일 생성
14. **자동 빌드**: `npm run compile` 실행 및 검증

## 3. 설정 파일

### brand-config.json
```json
{
  "metadata": {
    "brand": "codecenter",
    "description": "CodeCenter branding configuration",
    "changelog_file": "CHANGELOG.md"
  },
  "protected_patterns": [
    "scripts/",
    "providers.internal"
  ],
  "brand_mappings": {
    "package_json": {
      "displayName": "CodeCenter",
      "name": "codecenter",
      "publisher": "slexn"
    }
  },
  "provider_settings": {
    "litellm_provider_name": "CodeCenter",
    "default_provider": "litellm"
  },
  "brand_settings": {
    "brandName": "codecenter",
    "showPersonaSettings": false,
    "defaultPersonaEnabled": false
  }
}
```

### brand-config-front.json
로케일 파일을 위한 프론트엔드 i18n 매핑 규칙

## 4. 백업/복원 시스템

### 보호된 제공자 설정
**백업 위치**: `.backup-providers/`
- `ko-settings.json`
- `en-settings.json`
- `ja-settings.json`
- `zh-settings.json`

**목적**: 브랜드 전환 중 내부 키 구조 보존

**프로세스**:
1.  백업 → 언어별로 제공자 설정 저장
2.  전환 → 브랜드 전환 실행
3.  복원 → 백업에서 필요한 섹션 추출 및 복원

## 5. 주요 파일 참조

### 전환 도구
- **메인 엔진**: `slexn-codecenter/tools/brand-converter.js`
- **유틸리티**: `slexn-codecenter/tools/converter-utils.js`
- **검증기**: `slexn-codecenter/tools/brand-config-validator.js`

### 설정
- **백엔드 설정**: `slexn-codecenter/brands/brand-config.json`
- **프론트엔드 설정**: `slexn-codecenter/brands/brand-config-front.json`
- **패키지 메타데이터**: `slexn-codecenter/brands/package.json`

### 자산
- **로케일 파일**: `slexn-codecenter/brands/files/locale/` (ko/en/ja/zh)
- **기능 설정**: `slexn-codecenter/brands/files/feature-config.json`
- **자산**: `slexn-codecenter/brands/assets/` (아이콘, 페르소나 등)

## 6. 품질 보증

- **매핑 검증**: 중첩, 순환 참조, 빈 값, URL 형식 자동 감지
- **블랙리스트 보호**: 핵심 스크립트 및 파일 보호
- **빌드 통합**: 전환 후 자동 컴파일로 즉각적인 오류 감지
- **Git 롤백**: 안전한 되돌리기 지원
