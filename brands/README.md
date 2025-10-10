# Caret B2B 브랜드 설정

## 📁 브랜드 구조

### 지원 브랜드
- **`caret/`** - Caret 브랜드 (원본)
- **`codecenter/`** - CodeCenter 브랜드 (B2B 버전)
- **`cline/`** - Cline 브랜드 (레퍼런스)

## 🔧 각 브랜드별 구성

### 필수 파일들
- **`brand-config.json`** - 브랜드 기본 설정
  - displayName, target, version 등
- **`feature-config.json`** - 기능 설정
  - showPersonaSettings, defaultProvider, showCostInformation 등

### 선택적 파일들
- **`assets/`** - 브랜드별 이미지 리소스
- **`backup/`** - 변환 과정에서 생성되는 백업 파일들
- **개별 교체 파일들** - 특정 파일의 브랜드별 버전

## 📋 브랜드별 특징

### Caret (원본 브랜드)
- 개발자 중심의 AI 코딩 어시스턴트
- 모든 기능 활성화
- providers.caret 지원
- 비용 정보 표시

### CodeCenter (B2B 브랜드)
- 기업용 코딩 솔루션
- 간소화된 UI
- litellm 기본 제공업체
- 비용 정보 숨김
- 페르소나 설정 비활성화

### Cline (레퍼런스)
- 원본 Cline 브랜드 설정
- 호환성 유지용

## 🔄 브랜드 변환 과정

1. **백업 단계** (T12)
   - 현재 설정 및 providers.caret 키 백업
   - `backup/` 디렉토리에 저장

2. **변환 단계**
   - `feature-config.json` 교체
   - 텍스트 매핑 변환
   - 에셋 파일 교체

3. **복구 단계** (T12)
   - providers.caret 키 복원
   - 데이터 무결성 유지

## 📝 설정 예시

### brand-config.json
```json
{
  "displayName": "CodeCenter",
  "target": "caret",
  "version": {
    "from": "0.1.3",
    "to": "1.1.0"
  }
}
```

### feature-config.json (CodeCenter)
```json
{
  "showPersonaSettings": false,
  "defaultPersonaEnabled": false,
  "redirectAfterApiSetup": "home",
  "defaultModeSystem": "codecenter",
  "firstListingProvider": "litellm",
  "defaultProvider": "litellm",
  "showOnlyDefaultProvider": false,
  "showCostInformation": false
}
```

---
*마지막 업데이트: 2025-10-02*