# Caret B2B Solutions

**Caret 기업용 브랜딩 및 커스터마이징 솔루션**

## 📋 개요

이 저장소는 Caret의 **B2B 노하우와 기업용 솔루션**을 관리합니다:
- 브랜딩 자동화 도구
- 머징 전략 및 업스트림 호환성 기술
- 클라이언트별 커스터마이징 템플릿
- 기업용 배포 및 관리 도구

## 🗂️ 디렉토리 구조 (2025-08-31 재구조화)

```
caret-b2b/
├── caret-assets/                   # 기본 cline ↔ caret 양방향 변환
│   └── brand-config.json          # 기본 브랜딩 설정
├── b2b-brands/                    # B2B 확장 브랜딩 (덮어쓰기 방식)
│   └── code-center/
│       └── brand-config.json      # caret → codecenter 변환
├── tools/                         # 브랜딩 및 자동화 도구
│   ├── brand-change-v2.js         # TDD 기반 양방향 브랜딩 엔진  
│   ├── brand-change-legacy.js     # 레거시 스크립트
│   └── brand-change.test.js       # 테스트 스위트
└── clients/                       # 클라이언트별 리소스
    └── codecenter/                # CodeCenter 리소스 백업
```

## 🔧 주요 기능

### 1. 기본 양방향 브랜딩 (cline ↔ caret)
```bash
# 정방향: cline → caret
node tools/brand-change-v2.js --direction=forward

# 역방향: caret → cline (머징용)
node tools/brand-change-v2.js --direction=reverse

# 테스트 모드
node tools/brand-change-v2.js --dry-run --verbose
```

### 2. B2B 클라이언트 브랜딩 (덮어쓰기 방식)
```bash
# caret → codecenter
node tools/brand-change-v2.js --config=b2b-brands/code-center/brand-config.json --direction=forward

# codecenter → caret 
node tools/brand-change-v2.js --config=b2b-brands/code-center/brand-config.json --direction=reverse
```

### 3. 업스트림 머징 지원
- Cline 원본과의 안전한 머징
- `// CARET MODIFICATION:` 주석 체계
- 변경점 추적 및 롤백 기능

## 🚀 사용법 (사용자 피드백 반영)

### 브랜딩 워크플로우
```
cline → caret (기본) → codecenter (B2B 덮어쓰기)
```

### 기본 사용법
```bash
# 1. 기본 브랜딩: cline → caret
node tools/brand-change-v2.js --direction=forward --dry-run
node tools/brand-change-v2.js --direction=forward

# 2. B2B 브랜딩: caret → codecenter  
node tools/brand-change-v2.js --config=b2b-brands/code-center/brand-config.json --direction=forward --dry-run
node tools/brand-change-v2.js --config=b2b-brands/code-center/brand-config.json --direction=forward
```

### 새 B2B 클라이언트 추가
```bash
# 1. 디렉토리 생성
mkdir -p b2b-brands/new-client

# 2. 설정 파일 복사 및 수정
cp b2b-brands/code-center/brand-config.json b2b-brands/new-client/
# brand-config.json 수정 (caret → new-client 매핑)

# 3. 테스트
node tools/brand-change-v2.js --config=b2b-brands/new-client/brand-config.json --dry-run
```

## 📞 비즈니스 문의

기업용 브랜딩 및 커스터마이징 서비스:
- 이메일: business@caretive.com
- 서비스: Samsung Dev, LG Code 등 다수 기업 제공

## 📚 매뉴얼 및 문서

- **[브랜딩 시스템 매뉴얼](docs/branding-manual.md)** - 브랜딩 도구 사용법 및 기능 가이드

## ⚠️ 중요 사항

이 저장소는 **비공개 B2B 노하우**를 포함합니다:
- 공개 저장소에 절대 커밋 금지
- 브랜딩 기술 및 전략 보호
- 클라이언트 정보 보안 유지

---
**© 2025 Caret Team - B2B Solutions**