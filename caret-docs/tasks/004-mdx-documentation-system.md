# Task #004: Git Submodule 기반 통합 문서 시스템 구축 (Docusaurus i18n)

**작업 기간**: 2025년 7월 3일 업데이트  
**담당자**: luke, 오사랑  
**우선순위**: 높음  
**관련 작업**: Task #001 (아키텍처 초기화)

## 📋 **작업 개요**

Caret의 문서 시스템을 **Docusaurus 기반으로 구축**하고 `docs.caret.team`으로 서비스합니다. 이 프로젝트는 현재 `caret` 레포지토리의 `docs/` 디렉토리를 **별도의 신규 Git 레포지토리(`caret-docs-repo`)로 분리**하고, 메인 프로젝트에는 **Git Submodule**로 다시 연동하여 독립성을 확보합니다.

향후 Cline 원본 프로젝트의 문서 변경사항을 동기화하기 위한 기반을 마련합니다.

### **목표**
1.  **독립된 문서 레포지토리 구축**: `caret` 프로젝트의 `docs/` 디렉토리 내용을 기반으로 `caret-docs-repo` 신규 레포지토리 생성.
2.  **Git Submodule 연동**: 메인 `caret` 레포지토리의 기존 `docs/`를 `caret-docs-repo` Submodule로 대체.
3.  **Upstream 동기화 전략 수립**: 원본 Cline 프로젝트의 문서 업데이트를 반영하기 위한 수동 동기화 절차 정의.
4.  **Caret 콘텐츠 통합**: 기존 `caret-docs`의 개발 문서를 새로운 시스템에 통합.
5.  **Docusaurus i18n 다국어 지원**: 한국어, 영어, 일본어, 중국어 (4개 국어) 지원.
6.  **Caret 브랜딩 및 도메인 연결**: `https://docs.caret.team`으로 배포.

## 🎯 **상세 계획**

### **Phase 0: 다국어 번역을 위한 사전 준비 (우선 실행)**
- [x] **언어별 디렉토리 생성**: `docs/` 폴더 내에 `en`, `ko`, `ja`, `zh` 디렉토리 생성.
- [x] **원본 문서 이전**: `docs/` 최상위의 모든 `.md` 파일 및 관련 디렉토리를 `docs/en/`으로 이동.
- [x] **번역본 기본 틀 복사**: `docs/en/`의 전체 내용을 `docs/ko/`, `docs/ja/`, `docs/zh/`에 각각 복사.
- [ ] **작업 내용 커밋**: 사전 준비 완료 후, 변경사항을 커밋하여 버전 관리.

### **Phase 1: `caret-docs-repo` 생성 및 콘텐츠 이전**
- [ ] **신규 `caret-docs-repo` 레포지토리 생성**: GitHub에 비어있는 레포지토리를 생성.
- [ ] **Docusaurus 초기화**: 로컬에 `temp-docs` 디렉토리를 만들고 Docusaurus 프로젝트(`npx create-docusaurus@latest . classic`)를 설정.
- [ ] **기존 `docs` 콘텐츠 복사**: 현재 `caret` 프로젝트의 `docs/` 내용을 `temp-docs/docs`로 복사. (Phase 0에서 정리된 구조 포함)
- [ ] **`caret-docs-repo`에 Push**: `temp-docs`의 내용을 `caret-docs-repo`의 `main` 브랜치로 Push.
- [ ] **임시 디렉토리 정리**: 로컬의 `temp-docs` 디렉토리 삭제.

### **Phase 2: Submodule 연동 및 기존 디렉토리 정리**
- [ ] **기존 `docs` 디렉토리 백업 및 삭제**: `mv docs docs-old` 실행 후, `rm -rf docs-old`.
- [ ] **메인 레포지토리에 Submodule 추가**: `git submodule add <caret-docs-repo-url> docs` 명령어로 `docs` 디렉토리에 연동.
- [ ] **Upstream remote 설정**: `docs` Submodule 디렉토리 내에서 `git remote add upstream <aicoding/cline-repo-url>` 실행.

### **Phase 3: Docusaurus 설정 및 Caret 콘텐츠 통합**
- [ ] **"Cline" → "Caret" 브랜딩 변경**: `docs` Submodule 내에서 스크립트를 활용하여 일괄 변경.
- [ ] **`caret-docs` 콘텐츠 이전**: 기존 `caret-docs`의 `development/`, `guides/` 등의 개발 문서를 `docs/docs` 디렉토리의 해당 경로로 이전.
- [ ] **네비게이션 구조 설계 (`sidebars.js`)**: 사용자 문서와 개발자 문서를 명확히 구분하는 사이드바 구성.
- [ ] **다국어 (i18n) 기본 설정**: `docusaurus.config.js`에 4개 국어(ko, en, ja, zh) 설정.

### **Phase 4: 다국어 번역 시스템 구축**
- [ ] **Docusaurus i18n 설정**: 4개 언어(ko, en, ja, zh) 지원 활성화.
- [ ] **영문 문서를 기본으로 번역 진행**:
  - `i18n/ko/docusaurus-plugin-content-docs/current/...` 경로에 한국어 번역본 생성.
  - (이후) 일본어, 중국어 번역본 추가.
- [ ] **번역 워크플로우 구축**: GitHub Actions를 이용한 자동화 고려.

### **Phase 5: 배포 및 도메인 연결**
- [ ] **GitHub Pages 배포 설정**: `caret-docs-repo`에서 GitHub Actions를 통해 빌드 및 배포.
- [ ] **`docs.caret.team` 도메인 연결**.
- [ ] **CI/CD 자동 배포**: `main` 브랜치 Push 시 자동 배포.

## 🔄 **마이그레이션 및 동기화 전략**

### **Git Submodule 및 Upstream 동기화 워크플로우**
1.  **초기 설정**:
    - GitHub에 `caret-docs-repo` 신규 생성.
    - 로컬 `caret` 프로젝트의 `docs/` 내용을 `caret-docs-repo`에 이전 및 Push.
    - 기존 `docs/` 디렉토리 삭제 후, `git submodule add`로 `caret-docs-repo`를 `docs/`에 연결.
2.  **Caret 문서 작업**:
    - 모든 문서 관련 작업은 `docs` Submodule 내에서 수행.
    - 작업 완료 후 `caret-docs-repo`에 Push.
    - `caret` 메인 레포지토리에서 `git add docs` 및 `git commit`으로 Submodule의 버전을 업데이트.
3.  **Upstream(Cline) 업데이트 동기화 (수동)**:
    - Cline 원본 프로젝트의 `docs` 디렉토리 변경사항을 확인.
    - 필요한 변경사항을 `caret-docs-repo`에 수동으로 복사 및 적용.
    - (향후) `git subtree` 또는 스크립트를 이용한 반자동화 고려.

## 🔗 **관련 파일**
- `docs/` (Git Submodule로 대체될 디렉토리)
- `caret-docs/` (내용을 `docs/`로 이전 후 제거 대상)
- `webview-ui/src/components/welcome/WelcomeView.tsx` (API 가이드 연동 대상)

## ⚠️ **주의사항**
1.  **Git Submodule 관리**: `git submodule update --init --recursive` 등 Submodule 명령어에 대한 이해 필요.
2.  **수동 동기화**: Cline 업데이트 시 수동 작업으로 인한 누락 또는 오류 발생 가능성에 주의.
3.  **번역 품질**: 전문 용어 일관성 확보를 위한 가이드라인 필요.
4.  **빌드/배포 분리**: 문서의 빌드 및 배포는 `caret-docs-repo`에서 독립적으로 처리됨.

## 💰 **비용 효율성**
- **Mintlify**: 월 $120+ (Pro 플랜)
- **Docusaurus + GitHub Pages**: **완전 무료** ✅
- **도메인 비용만**: docs.caret.team 연결 비용만 발생
