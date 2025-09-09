# t07-phase7-package-branding-marketplace.md

**작업 일시**: 2025-01-09  
**작업자**: Luke  
**목적**: Cline과의 패키지명 충돌 해결, VS Code Marketplace 페이지 개선, CodeCenter 브랜드 통합 후속 작업

---

## 🎯 작업 목표

1. **패키지명 충돌 해결**: Cline과 동시 설치 시 메뉴 중복 문제 해결
2. **Marketplace 페이지 개선**: GitHub README 대신 사용자 친화적 마켓플레이스 전용 페이지 생성
3. **CodeCenter 브랜딩 통합**: 기존 Caret 브랜드에서 CodeCenter로의 완전한 전환

---

## 📋 Task 1: 패키지명 충돌 해결 (Package Name Conflicts)

### **1.1 VS Code Extension Commands 변경**

#### **주요 충돌점**: 
현재 `cline.*` 명령어들이 VS Code에서 Cline extension과 충돌 발생

#### **변경 대상 파일들**:

**Core Configuration:**
- [ ] `package.json` - VS Code extension 정의 (commands, menus, context keys)
- [ ] `src/extension.ts` - 명령어 등록 및 컨텍스트 키

**State Management:**
- [ ] `src/core/storage/state-keys.ts` - 스토리지 키 정의
- [ ] `src/core/storage/utils/state-helpers.ts` - 상태 헬퍼 함수
- [ ] `src/core/controller/state/updateSettings.ts` - 설정 업데이트

**Service & Provider:**
- [ ] `src/core/controller/index.ts` - 메인 컨트롤러
- [ ] `src/core/task/index.ts` - 태스크 시스템
- [ ] `src/hosts/vscode/VscodeWebviewProvider.ts` - VS Code 웹뷰 제공자
- [ ] `src/services/test/TestServer.ts` - 테스트 서버

**Frontend:**
- [ ] `webview-ui/src/services/grpc-client.ts` - gRPC 클라이언트
- [ ] `webview-ui/src/utils/validate.ts` - 검증 유틸리티
- [ ] `webview-ui/src/constants.ts` - 상수 정의 (문서 링크)
- [ ] `webview-ui/src/components/settings/utils/providerUtils.ts` - 설정 유틸리티

#### **변경 패턴**:
```
cline.* → codecenter.*

예시:
- cline.plusButtonClicked → codecenter.plusButtonClicked
- cline.addToChat → codecenter.addToChat
- cline.isDevMode → codecenter.isDevMode
- cline.isGeneratingCommit → codecenter.isGeneratingCommit
- "cline-" prefix → "codecenter-" prefix (storage keys)
```

#### **Migration 고려사항**:
- [ ] 기존 사용자 설정 마이그레이션 로직 구현
- [ ] 스토리지 키 변경에 따른 데이터 이전 처리
- [ ] 테스트 코드 업데이트

---

## 📋 Task 2: VS Code Marketplace 페이지 개선

### **2.1 마켓플레이스 전용 README 생성**

#### **현재 문제**:
- GitHub README.md가 개발자/기여자용 기술 문서에 치중
- 일반 사용자에게는 복잡하고 마케팅 효과 부족
- 언어별 지원이 수동 링크에 의존

#### **생성할 파일 구조**:
```
marketplace/
├── README.md           # 마켓플레이스용 메인 (영어)
├── README.ko.md        # 한국어판
├── README.ja.md        # 일본어판
├── README.zh.md        # 중국어판
├── CHANGELOG.md        # 버전 히스토리
├── screenshots/        # 스크린샷
│   ├── en/
│   ├── ko/
│   ├── ja/
│   └── zh/
└── demo.gif           # 데모 영상
```

#### **마켓플레이스 README 콘텐츠 구조**:
- [ ] **Hero Section**: 임팩트 있는 제목, 핵심 가치 제안
- [ ] **Key Features**: 3-5개 핵심 기능 (시각적 강조)
- [ ] **Screenshots/GIF**: 실제 사용 화면 (각 언어별)
- [ ] **Quick Start**: 3-step 설치 및 시작 가이드
- [ ] **Why Choose CodeCenter**: 경쟁 제품 대비 장점
- [ ] **Community & Support**: 지원 채널 링크

### **2.2 package.json 마켓플레이스 설정 개선**

```json
{
  "readme": "./marketplace/README.md",
  "changelog": "./marketplace/CHANGELOG.md",
  "qna": "https://codecenter.ai/support",
  "bugs": {
    "url": "https://github.com/aicoding-caret/caret/issues",
    "email": "support@codecenter.ai"
  },
  "galleryBanner": {
    "color": "#2d2d2d",
    "theme": "dark"
  },
  "badges": [
    {
      "url": "https://img.shields.io/github/stars/aicoding-caret/caret",
      "href": "https://github.com/aicoding-caret/caret",
      "description": "GitHub Stars"
    }
  ]
}
```

### **2.3 언어별 마켓플레이스 대응**

#### **접근법**: 단일 README + 언어 섹션 (VS Code Marketplace 제한사항으로 인해)
- [ ] 영어 섹션을 상단에 배치 (기본)
- [ ] 한국어, 일본어, 중국어 섹션 순차 배치
- [ ] 각 언어별 스크린샷 및 설명 포함
- [ ] 목차 링크로 빠른 탐색 지원

---

## 📋 Task 3: CodeCenter 브랜딩 통합 후속 작업

### **3.1 패키지 메타데이터 업데이트**

#### **package.json 브랜딩 변경**:
- [ ] `displayName`: "Caret" → "CodeCenter"
- [ ] `description`: Caret 언급 → CodeCenter로 변경
- [ ] `homepage`: caret.team → codecenter.ai
- [ ] `repository`: 필요시 새 저장소로 변경
- [ ] `publisher`: caretive → codecenter (필요시)
- [ ] `keywords`: caret → codecenter 포함

#### **예상 package.json 변경**:
```json
{
  "name": "codecenter",
  "displayName": "CodeCenter",
  "description": "An autonomous coding AI agent that thinks like a developer. For context-aware pair programming with customizable AI personas. Supports: 한국어, 日본語, 中文.",
  "homepage": "https://codecenter.ai",
  "publisher": "codecenter"
}
```

### **3.2 아이콘 및 비주얼 에셋 업데이트**

- [ ] `assets/icons/icon.png` - CodeCenter 로고로 교체
- [ ] `assets/template_characters/` - CodeCenter 브랜딩 적용
- [ ] Walkthrough 이미지들 브랜드 업데이트
- [ ] 마켓플레이스 스크린샷에 CodeCenter UI 반영

### **3.3 문서 및 URL 참조 업데이트**

#### **내부 문서**:
- [ ] `walkthrough/` 디렉토리 내 모든 .md 파일
- [ ] `docs/` 관련 참조들
- [ ] `caret-docs/` 내 브랜드 참조

#### **외부 링크**:
- [ ] `webview-ui/src/constants.ts` - 문서 링크들
- [ ] 각종 설정 파일의 URL 참조들
- [ ] 도움말 및 지원 페이지 링크

### **3.4 i18n 번역 업데이트**

#### **브랜드명 번역 파일들**:
- [ ] `webview-ui/src/caret/locale/en/*.json`
- [ ] `webview-ui/src/caret/locale/ko/*.json`
- [ ] `webview-ui/src/caret/locale/ja/*.json`
- [ ] `webview-ui/src/caret/locale/zh/*.json`

#### **업데이트 항목**:
- 제품명: Caret → CodeCenter
- 회사명: Caretive → CodeCenter (필요시)
- 브랜드 관련 설명 텍스트들

---

## 🚀 실행 순서 (Execution Order)

### **Phase 1: 패키지명 충돌 해결** (우선순위: 높음)
1. package.json commands 섹션 변경
2. src/extension.ts 명령어 등록 변경
3. 스토리지 키 및 컨텍스트 키 변경
4. 마이그레이션 로직 구현
5. 테스트 및 검증

### **Phase 2: 마켓플레이스 페이지 생성** (우선순위: 중간)
1. marketplace/ 디렉토리 생성
2. 언어별 README 작성
3. 스크린샷 및 데모 콘텐츠 준비
4. package.json 마켓플레이스 설정 업데이트

### **Phase 3: CodeCenter 브랜딩 통합** (우선순위: 낮음)
1. 패키지 메타데이터 업데이트
2. 비주얼 에셋 교체
3. 문서 및 링크 업데이트
4. i18n 번역 업데이트

---

## ⚠️ 주의사항 및 리스크

### **패키지명 변경 관련**:
- 기존 사용자의 설정 손실 방지를 위한 마이그레이션 필수
- VS Code 재시작 후 정상 작동 확인 필요
- 키보드 단축키 충돌 검사 필요

### **마켓플레이스 관련**:
- VS Code Marketplace 정책 준수 확인
- 스크린샷 품질 및 크기 제한 준수
- 마켓플레이스 승인 프로세스 고려

### **브랜딩 관련**:
- CodeCenter 브랜드 가이드라인 준수
- 기존 Caret 사용자들의 혼란 최소화
- 법적 문제 (상표권 등) 사전 검토

---

## 📊 성공 지표 (Success Metrics)

### **기술적 지표**:
- [ ] Cline과 동시 설치 시 충돌 없음
- [ ] 모든 명령어 정상 작동
- [ ] 기존 사용자 설정 마이그레이션 100% 성공

### **사용자 경험 지표**:
- [ ] 마켓플레이스 페이지 이탈률 감소
- [ ] 설치 후 활성 사용률 증가
- [ ] 다국어 사용자 피드백 긍정적

### **브랜딩 지표**:
- [ ] CodeCenter 브랜드 일관성 달성
- [ ] 사용자 브랜드 인지도 개선
- [ ] 마케팅 메시지 통일성 확보

---

## 📅 예상 일정

**Week 1**: 패키지명 충돌 해결 (Phase 1)
**Week 2**: 마켓플레이스 페이지 생성 (Phase 2)  
**Week 3**: CodeCenter 브랜딩 통합 (Phase 3)
**Week 4**: 통합 테스트 및 배포 준비

---

**작업 완료 후 체크리스트**:
- [ ] 모든 변경사항 컴파일 및 테스트 통과
- [ ] 사용자 가이드 문서 업데이트
- [ ] 팀 리뷰 및 승인 완료
- [ ] 배포 계획 수립 완료