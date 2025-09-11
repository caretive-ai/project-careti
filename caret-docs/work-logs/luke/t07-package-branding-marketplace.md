# t07-phase7-package-branding-marketplace.md

**작업 일시**: 2025-01-09  
**작업자**: Luke  
**목적**: Cline과의 패키지명 충돌 해결, 브랜딩 시스템 완성, VS Code Marketplace 페이지 개선

---

## 🔍 **검증 작업 지시서 (다른 AI용)**

### **Phase 1 검증 방법**:
```bash
# 1. 컴파일 검증
npm run compile

# 2. 명령어 네임스페이스 변경 확인
grep -r "cline\." package.json | wc -l    # 결과: 0개 (모두 변경됨)
grep -r "caret\." package.json | wc -l    # 결과: 42개+ (변경 완료)

# 3. 백엔드 컨텍스트 키 확인
grep "caret.isDevMode" src/extension.ts
grep "caret.isGeneratingCommit" src/integrations/git/commit-message-generator.ts

# 4. VS Code 확장 동시 설치 테스트 (수동)
# - Caret 확장과 Cline 확장 동시 설치 후 명령 팔레트에서 충돌 없는지 확인
```

### **검증 기준**:
- ✅ 컴파일 오류 없음
- ✅ package.json에서 `cline.*` 명령어 0개 확인  
- ✅ package.json에서 `caret.*` 명령어 42개+ 확인
- ✅ 백엔드 컨텍스트 키 `caret.*` 변경 확인

---

## 🎯 작업 목표

1. **패키지명 충돌 해결**: Cline과 동시 설치 시 명령어 충돌 문제 해결
2. **브랜딩 시스템 완성**: 기존 브랜드 전환 스크립트에 명령어 네임스페이스 변환 기능 추가
3. **Marketplace 페이지 개선**: GitHub README 대신 사용자 친화적 마켓플레이스 전용 페이지 생성

---

## 📋 Task 1: 패키지명 충돌 해결 및 브랜딩 시스템 완성

### **1.1 Phase 1: 기본 명령어 네임스페이스 변경**

#### **목적**: 
Cline extension과의 동시 설치를 위해 기본 명령어를 `cline.*`에서 `caret.*`로 변경

#### **변경 대상 파일들**:

**Core Configuration:**
- [ ] `package.json` - VS Code extension 정의 (commands, keybindings, menus, context keys)
- [ ] `src/extension.ts` - 컨텍스트 키 설정
- [ ] `src/integrations/git/commit-message-generator.ts` - 컨텍스트 키 사용

#### **기본 변경 패턴**:
```
cline.* → caret.*

예시:
- cline.plusButtonClicked → caret.plusButtonClicked
- cline.addToChat → caret.addToChat
- cline.isDevMode → caret.isDevMode
- cline.isGeneratingCommit → caret.isGeneratingCommit
```

### **1.2 Phase 2: 브랜드 전환 스크립트 확장**

#### **목적**: 
기존 `brand-converter.js`에 명령어 네임스페이스 변환 기능 추가하여 브랜딩 시스템 완성

#### **확장 대상**:
- [ ] `caret-b2b/tools/brand-converter.js` - 메인 브랜드 전환 스크립트
- [ ] `caret-b2b/brands/*/brand-config.json` - 각 브랜드별 설정에 명령어 매핑 추가

#### **브랜드별 명령어 매핑**:
```
브랜드별 명령어 네임스페이스:
- caret 브랜드: caret.*
- codecenter 브랜드: codecenter.*  
- cline 브랜드: cline.*
```

#### **구현 방식**:
```javascript
// brand-config.json 예시 확장
{
  "command_mappings": {
    "caret.plusButtonClicked": "codecenter.plusButtonClicked",
    "caret.addToChat": "codecenter.addToChat",
    "caret.isDevMode": "codecenter.isDevMode"
    // ... 모든 명령어 매핑
  }
}
```

### **1.3 Phase 3: 동적 명령어 시스템**

#### **목적**: 
런타임에 현재 브랜드에 맞는 명령어를 사용하도록 백엔드 수정

#### **수정 대상 파일들**:
- [ ] `src/extension.ts` - 동적 컨텍스트 키 설정
- [ ] `src/integrations/git/commit-message-generator.ts` - 동적 컨텍스트 키 사용
- [ ] 기타 하드코딩된 명령어 참조 파일들 (코드 분석 후 확정)

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

## 📋 Task 3: 브랜드 전환 시스템 통합 검증

### **3.1 기존 브랜딩 시스템 활용**

#### **현재 구현된 기능들**:
- ✅ `caret-b2b/tools/brand-converter.js` - 완전 구현된 브랜드 전환 스크립트
- ✅ `caret ↔ cline` 양방향 브랜드 전환 지원
- ✅ `caret ↔ codecenter` 양방향 브랜드 전환 지원  
- ✅ 텍스트, 이미지, 터미널, i18n 자동 변환
- ✅ 100% 테스트 통과 (7/7 테스트 성공률)

#### **추가 필요 기능**:
- [ ] **명령어 네임스페이스 변환**: VS Code commands, keybindings, menus 섹션
- [ ] **컨텍스트 키 변환**: package.json의 when 조건들
- [ ] **백엔드 동적 처리**: extension.ts, commit-message-generator.ts

### **3.2 통합 검증 계획**

#### **브랜드별 완전성 검증**:
```bash
# 각 브랜드 전환 후 확인사항
node caret-b2b/tools/brand-converter.js caret forward    # → cline 브랜드
node caret-b2b/tools/brand-converter.js caret backward   # → caret 브랜드  
node caret-b2b/tools/brand-converter.js codecenter forward   # → codecenter 브랜드
node caret-b2b/tools/brand-converter.js codecenter backward  # → caret 브랜드
```

#### **검증 항목**:
- [ ] **시각적 브랜딩**: 로고, 색상, 이미지 일치
- [ ] **텍스트 브랜딩**: 제품명, 회사명, URL 일치
- [ ] **명령어 브랜딩**: VS Code 명령 팔레트에서 일관된 네임스페이스
- [ ] **터미널 브랜딩**: 터미널 이름과 아이콘 일치
- [ ] **i18n 브랜딩**: 모든 언어에서 브랜드명 일치

---

## 🚀 실행 순서 (Execution Order)

### **Phase 1: 기본 명령어 네임스페이스 변경** (우선순위: 최고)
1. package.json commands 섹션 변경 (`cline.*` → `caret.*`)
2. src/extension.ts 컨텍스트 키 변경
3. src/integrations/git/commit-message-generator.ts 컨텍스트 키 변경
4. 컴파일 및 기본 테스트
5. Cline과 동시 설치 테스트

### **Phase 2: 브랜드 전환 스크립트 확장** (우선순위: 높음)
1. 코드베이스 분석 - 모든 명령어 참조 파일 파악
2. brand-config.json에 command_mappings 섹션 추가
3. brand-converter.js에 명령어 변환 로직 구현
4. 각 브랜드별 명령어 변환 테스트
5. 동적 명령어 시스템 백엔드 구현

### **Phase 3: 마켓플레이스 페이지 생성** (우선순위: 중간)
1. marketplace/ 디렉토리 생성
2. 언어별 README 작성
3. 스크린샷 및 데모 콘텐츠 준비
4. package.json 마켓플레이스 설정 업데이트

### **Phase 4: 통합 검증** (우선순위: 중간)
1. 전체 브랜딩 시스템 테스트
2. 사용자 시나리오 기반 검증
3. 성능 및 안정성 테스트
4. 문서 업데이트

---

## ⚠️ 주의사항 및 리스크

### **명령어 네임스페이스 변경 관련**:
- 기존 브랜드 전환 시스템과의 호환성 보장 필수
- 모든 브랜드에서 명령어 일관성 유지 필요
- 백엔드 동적 처리 시 성능 영향 최소화

### **브랜드 전환 스크립트 확장 관련**:
- 기존 텍스트 변환과 명령어 변환의 충돌 방지
- JSON 구조 파싱 시 오류 처리 강화
- 롤백 기능 완전성 보장

### **마켓플레이스 관련**:
- VS Code Marketplace 정책 준수 확인
- 스크린샷 품질 및 크기 제한 준수
- 마켓플레이스 승인 프로세스 고려

---

## 📊 성공 지표 (Success Metrics)

### **기술적 지표**:
- [ ] Cline과 동시 설치 시 충돌 없음
- [ ] 모든 브랜드에서 명령어 일관성 100% 달성
- [ ] 브랜드 전환 시 모든 기능 정상 작동
- [ ] 기존 브랜딩 시스템 100% 호환성 유지

### **사용자 경험 지표**:
- [ ] 브랜드별 명령어 네임스페이스 일관성
- [ ] 마켓플레이스 페이지 이탈률 감소
- [ ] 설치 후 활성 사용률 증가
- [ ] 다국어 사용자 피드백 긍정적

### **브랜딩 지표**:
- [ ] 완전한 브랜드 일관성 달성 (시각적 + 기능적)
- [ ] 사용자 브랜드 인지도 개선
- [ ] 마케팅 메시지 통일성 확보

---

## 📅 예상 일정

**Week 1**: 기본 명령어 네임스페이스 변경 (Phase 1)
**Week 2**: 브랜드 전환 스크립트 확장 (Phase 2)  
**Week 3**: 마켓플레이스 페이지 생성 (Phase 3)
**Week 4**: 통합 검증 및 배포 준비 (Phase 4)

---

**작업 완료 후 체크리스트**:
- [ ] 모든 변경사항 컴파일 및 테스트 통과
- [ ] 3개 브랜드 모두에서 완전한 명령어 일관성 달성
- [ ] 기존 브랜드 전환 시스템과 100% 호환성 유지
- [ ] 사용자 가이드 문서 업데이트
- [ ] 팀 리뷰 및 승인 완료
- [ ] 배포 계획 수립 완료

---

## 📊 코드베이스 분석 완료 - 주요 발견사항

### **✅ 기존 브랜딩 시스템 현황**:
- `caret-b2b/tools/brand-converter.js` - **완전 구현됨** (40,257 라인)
- `cline ↔ caret ↔ codecenter` 3-way 브랜드 전환 지원
- 50+ 파일에 대한 세밀한 텍스트 매핑 관리
- 자동 브랜드 감지 및 검증 시스템

### **❌ 현재 시스템의 한계점**:
- **VS Code 명령어 네임스페이스 변환 기능 없음**
- `package.json`의 `commands`, `keybindings`, `menus` 섹션 처리 안됨
- 현재는 단순 텍스트 변환만 지원, JSON 구조 변환 없음

### **🎯 실제 작업 범위 (수정됨)**:
1. **Phase 1**: 기본 명령어를 `cline.*` → `caret.*`로 변경 (Cline 동시설치용)
2. **Phase 2**: `brand-converter.js`에 **명령어 네임스페이스 변환 기능 추가**
   - `brand-config.json`에 `command_mappings` 섹션 추가
   - JSON 구조 파싱 및 선별적 변환 로직 구현
   - 3개 브랜드별 명령어 자동 변환 지원
3. **Phase 3**: 백엔드 동적 처리 (extension.ts, commit-message-generator.ts)
4. **Phase 4**: 마켓플레이스 페이지 개선

### **💡 핵심 인사이트**:
브랜드 전환 시스템이 **99% 완성**되어 있어서, 명령어 네임스페이스 변환 기능만 추가하면 **완전한 브랜딩 일관성** 달성 가능