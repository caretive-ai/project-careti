# Caret B2B 브랜딩 시스템 매뉴얼

## 📋 시스템 개요

Caret B2B 브랜딩 시스템은 **통합된 단일 스크립트**를 통해 **cline ↔ caret ↔ codecenter** 등 다양한 브랜드 간 완전 자동화된 전환을 제공하는 기업용 솔루션입니다.

## 🚀 주요 기능

### 1. **통합 브랜드 변환 시스템**
- **단일 스크립트**: `brand-converter.js` 하나로 모든 브랜드 변환 처리
- **양방향 지원**: forward/backward 방식으로 직관적 변환
- **3-브랜드 완전 지원**: cline ↔ caret ↔ codecenter

### 2. **포괄적 변환 범위**
- **VS Code Extension 메타데이터**: package.json 전체 (42개+ 필드)
- **UI 브랜딩**: commands, walkthroughs, activitybar 등
- **터미널 브랜딩**: TerminalRegistry.ts 이름 및 확장 ID
- **이미지 자동 교체**: 브랜드별 아이콘 파일 실제 복사
- **규칙 시스템**: .clinerules ↔ .caretrules 자동 변환

### 3. **고급 기능**
- **자동 브랜드 감지**: 현재 상태 자동 인식
- **CHANGELOG 버전 매핑**: 동적 버전 정보 매핑
- **매핑 검증 시스템**: 중첩, 순환참조 등 포괄적 검증
- **자동 빌드 통합**: 변환 후 컴파일 자동 실행

## 💻 사용법

### **통합 브랜드 변환**
```bash
# 현재 브랜드 상태 확인
node caret-b2b/tools/brand-converter.js --status

# Caret 설정 기반 변환
node caret-b2b/tools/brand-converter.js caret forward   # caret → cline
node caret-b2b/tools/brand-converter.js caret backward  # cline → caret

# CodeCenter 기업 브랜딩 변환
node caret-b2b/tools/brand-converter.js codecenter forward   # caret → codecenter
node caret-b2b/tools/brand-converter.js codecenter backward  # codecenter → caret

# 옵션
node caret-b2b/tools/brand-converter.js caret forward --no-build  # 빌드 스킵
node caret-b2b/tools/brand-converter.js caret forward --dry-run   # 시뮬레이션
```

### **브랜드 설정 구조**
```
caret-b2b/brands/
├── caret/
│   ├── brand-config.json      # Caret ↔ Cline 매핑
│   └── assets/icons/          # Caret 브랜드 아이콘
├── cline/
│   ├── brand-config.json      # Cline ↔ Caret 매핑
│   └── assets/icons/          # Cline 원본 아이콘
└── codecenter/
    ├── brand-config.json      # CodeCenter ↔ Caret 매핑
    └── assets/icons/          # CodeCenter 기업 아이콘
```

## 🧪 품질 검증

### **TDD 테스트 시스템**
```bash
# 통합 브랜딩 시스템 테스트 (7개 테스트)
node caret-b2b/tools/brand-converter.test.js

# 테스트 항목
# ✅ 1. 브랜드 자동 감지
# ✅ 2. 브랜드 설정 로드
# ✅ 3. 텍스트 변환 로직
# ✅ 4. 이미지 파일 존재 확인
# ✅ 5. 백업 시스템
# ✅ 6. 터미널 아이콘 확인
# ✅ 7. 전체 변환 프로세스 (DRY-RUN)

# 성공률: 100% (7/7 테스트 통과)
```

## 🏢 기업 맞춤 브랜딩 확장

### **새 브랜드 추가 방법**
1. **브랜드 폴더 생성**: `caret-b2b/brands/[new-brand]/`
2. **설정 파일 작성**: `brand-config.json` (기존 형식 참조)
3. **아이콘 준비**: `assets/icons/` 디렉토리에 브랜드 아이콘 추가
4. **매핑 설정**: 텍스트, 경로, 터미널 매핑 정의
5. **테스트 검증**: 기존 테스트 체계로 검증

### **brand-config.json 예시**
```json
{
  "metadata": {
    "brand": "your-brand",
    "target": "caret",
    "description": "Your Brand ↔ Caret branding conversion"
  },
  "brand_mappings": {
    "package_json": {
      "Caret": "Your Brand",
      "caret": "yourbrand",
      "Caretive Inc.": "Your Company Inc."
    },
    "terminal": {
      "Caret": "Your Brand"
    }
  }
}
```

## 지원 문의

**Caretive 기업 솔루션팀**
- 📧 business@caretive.com
- 🌐 https://caretive.com/enterprise
- 📞 +82-2-XXXX-XXXX

---
*본 시스템은 Caretive의 독점 기술로 비공개 저장소를 통해서만 제공됩니다.*