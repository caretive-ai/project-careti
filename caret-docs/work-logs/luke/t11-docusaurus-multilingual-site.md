# T11: Docusaurus 다국어 문서 사이트 구축

## 1. 목표
- `/docs` 폴더의 기존 문서를 기반으로 Docusaurus 사이트 구축
- 영어, 한국어, 중국어, 일본어 다국어 지원
- Caret 프로젝트의 문서화 시스템 강화

## 2. 현재 상태 분석
- `/docs` 폴더는 다양한 주제의 `.mdx` 파일과 하위 디렉터리로 구성되어 있음.
- Docusaurus 프로젝트는 `docusaurus-site` 폴더에 초기 설정 완료 (TypeScript).

## 3. 상세 계획

### Phase 1: Docusaurus 기본 설정 및 다국어 활성화
- [x] `docusaurus-site/docusaurus.config.ts` 파일 수정
  - [x] `i18n` 설정 추가 (locale: en, ko, zh-Hans, ja)
  - [x] `baseUrl` 및 `url` 설정 (Caret 프로젝트 통합 시 필요)
  - [ ] 사이드바 및 내비게이션 바 설정 (기존 `/docs` 구조 반영)
- [ ] `docusaurus-site/sidebars.ts` 파일 수정 (기존 `/docs` 구조에 맞춰 사이드바 구성)

### Phase 2: 기존 문서 마이그레이션 및 다국어 콘텐츠 준비
- [ ] `docusaurus-site/docs` 폴더 구조 정리
  - [ ] 기존 `/docs` 폴더의 내용을 `docusaurus-site/docs`로 복사 (우선 영어 버전으로)
  - [ ] `.mdx` 파일의 Front Matter (제목, ID 등) Docusaurus 형식에 맞게 조정
- [ ] 다국어 콘텐츠 폴더 생성 및 복사
  - [ ] `docusaurus-site/i18n/ko/docusaurus-plugin-content-docs/current`
  - [ ] `docusaurus-site/i18n/zh-Hans/docusaurus-plugin-content-docs/current`
  - [ ] `docusaurus-site/i18n/ja/docusaurus-plugin-content-docs/current`
  - [ ] 각 언어 폴더에 해당 언어로 번역된 문서 파일 복사 (초기에는 영어 문서 복사 후 번역 예정)
- [ ] `docusaurus-site/static` 폴더에 `docs/assets` 내용 복사

### Phase 3: Docusaurus 사이트 빌드 및 테스트
- [ ] `docusaurus-site` 디렉터리로 이동하여 `npm install` 실행 (종속성 재확인)
- [ ] `npm run start` 명령으로 개발 서버 실행 및 사이트 확인
  - [ ] 기본 문서 로드 확인
  - [ ] 사이드바 및 내비게이션 바 작동 확인
  - [ ] 다국어 전환 기능 작동 확인 (언어별 빈 페이지라도 전환되는지)
- [ ] `npm run build` 명령으로 프로덕션 빌드 테스트

### Phase 4: Caret 프로젝트 통합 (선택 사항)
- [ ] `package.json`에 Docusaurus 빌드 및 서빙 스크립트 추가
- [ ] Caret 프로젝트 내에서 Docusaurus 사이트에 접근할 수 있는 방법 모색 (예: 서브모듈, 빌드 결과물 복사)

## 4. 예상되는 문제점 및 해결 방안
- **`.mdx` 파일 호환성**: 기존 `.mdx` 파일에 Docusaurus에서 지원하지 않는 문법이 있을 경우 수정 필요.
- **다국어 번역**: 초기에는 영어 문서를 복사하고, 추후 번역 작업을 진행해야 함.
- **Caret 프로젝트 통합**: 빌드된 Docusaurus 사이트를 Caret 프로젝트와 어떻게 연동할지 결정 필요. (예: `caret-docs` 폴더를 Docusaurus의 `docs`로 사용하거나, 별도 빌드 후 `static`으로 포함)

## 5. TODO LIST (진행 상황) - 업데이트: 2025-09-11

### 🔍 Phase 1: 분석 완료 (2025-09-11)
- [x] 요구사항 분석 및 Docusaurus 사이트 구조 설계
  - [x] `/docs` 폴더의 현재 문서 구조 분석 (Mintlify 기반 확인)
  - [x] Docusaurus 프로젝트 초기 설정 (새로운 폴더에 생성)
  - [x] 다국어 지원 설정 (영, 한, 중, 일)
- [x] **NEW**: caret.team/caret-frontend 푸터 소스코드 조사 완료
  - [x] Footer.tsx 컴포넌트 분석 (React + Next.js + i18n)
  - [x] Tailwind CSS 스타일링 구조 파악
  - [x] 다국어 번역 파일 구조 확인 (en, ko, zh, ja)
  - [x] Caretive INC 회사 정보 및 브랜딩 요소 파악

### 🚀 Phase 2: 실행 계획
- [ ] **NEW**: Docusaurus 푸터 컴포넌트 Swizzling 및 caret-frontend 푸터 통합
  - [ ] `npm run swizzle @docusaurus/theme-classic Footer -- --wrap` 실행
  - [ ] Footer.tsx를 Docusaurus용 React 컴포넌트로 변환
  - [ ] Tailwind CSS → CSS Modules/styled-components 변환
  - [ ] Next.js i18n → Docusaurus i18n 시스템 적응
  - [ ] 회사 정보, 링크, 연락처 다국어 지원 구현
- [ ] 기존 `/docs` 문서 Docusaurus 형식으로 마이그레이션
  - [ ] 각 언어별 문서 폴더 구조 생성
  - [ ] 기존 `.mdx` 파일을 Docusaurus 형식에 맞게 변환 및 복사
  - [ ] Mintlify navigation 구조 → Docusaurus sidebars 변환
- [ ] Docusaurus 사이트 빌드 및 테스트
  - [ ] 개발 서버 실행 및 기본 기능 확인
  - [ ] 다국어 전환 기능 확인
  - [ ] 푸터 통합 및 스타일링 검증
- [ ] Caret 프로젝트에 Docusaurus 사이트 통합 (선택 사항, 필요시)
  - [ ] 기존 `package.json`에 Docusaurus 관련 스크립트 추가
  - [ ] 빌드된 Docusaurus 사이트를 Caret 프로젝트 내에서 접근 가능하도록 설정

## 6. 🔍 상세 기술 분석 (2025-09-11 업데이트)

### 6.1 기존 문서 구조 분석

**Mintlify 기반 문서 시스템**:
- **설정 파일**: `docs/docs.json` (Mintlify 메타데이터)
- **주요 카테고리**:
  - Getting Started (10개 페이지)
  - Features (20+ 페이지, 하위 그룹 포함)
  - Provider Configuration (15+ 프로바이더)
  - MCP Servers (7개 페이지)
  - Enterprise Solutions (4개 페이지)
  - Troubleshooting (2개 페이지)

**문서 형식**:
- `.mdx` 파일 (React 컴포넌트 지원)
- Front Matter: title, description 포함
- 이미지: `/assets/` 폴더에 저장

### 6.2 caret-frontend 푸터 기술 분석

**컴포넌트 구조**:
```typescript
// Footer.tsx 주요 기능
- React 함수형 컴포넌트
- useTranslation('common') 훅 사용
- useRouter() 로케일 감지
- Tailwind CSS 클래스 기반 스타일링
```

**회사 정보**:
- **회사명**: Caretive INC
- **사업자번호**: 459-81-03703  
- **주소**: 경기도 화성시 연천동 동탄순환대로 823, 409-681 4층
- **고객지원**: support@caretive.ai

**링크 구조**:
- GitHub: https://github.com/aicoding-caret/caret
- 서비스: https://caret.team
- 회사: https://caretive.ai  
- 약관/개인정보처리방침: Next.js Link 컴포넌트 사용

**다국어 지원**:
- 4개 언어: en, ko, zh, ja
- 중국어/일본어는 영어 링크로 리다이렉트
- 번역키: `footer.companyInfo.*` 구조

### 6.3 Docusaurus 통합 전략

**푸터 통합 방법**:
1. **Swizzling**: `@docusaurus/theme-classic Footer` 컴포넌트 래핑
2. **스타일 변환**: Tailwind → CSS Modules
3. **i18n 변환**: Next.js → Docusaurus 시스템

**예상 구현 코드**:
```typescript
// src/theme/Footer/index.tsx
import React from 'react';
import {useColorMode} from '@docusaurus/theme-common';
import {translate} from '@docusaurus/Translate';

export default function Footer() {
  const {colorMode} = useColorMode();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer footer--dark">
      <div className="container">
        <div className="footer__row">
          <div className="footer__col">
            <p className="footer__company">
              {translate({
                message: 'ⓒ Caretive INC',
                id: 'footer.company.name'
              })}
            </p>
            <p className="footer__business">
              {translate({
                message: 'Business Registration Number: 459-81-03703',
                id: 'footer.company.businessNumber'  
              })}
            </p>
            {/* ... 추가 정보 */}
          </div>
        </div>
      </div>
    </footer>
  );
}
```

## 7. 🚀 구체적인 실행 단계

### Step 1: 푸터 Swizzling 및 구현
```bash
cd docusaurus-site
npm run swizzle @docusaurus/theme-classic Footer -- --wrap
```

### Step 2: 번역 파일 생성
```bash
# 각 언어별 번역 파일 생성
npm run write-translations -- --locale ko
npm run write-translations -- --locale zh-Hans  
npm run write-translations -- --locale ja
```

### Step 3: 문서 마이그레이션 
```bash
# 기존 docs 폴더 백업 및 복사
cp -r ../docs/* ./docs/
# 각 언어별 폴더에 복사
cp -r ./docs/* ./i18n/ko/docusaurus-plugin-content-docs/current/
# ... 다른 언어들도 동일하게
```

### Step 4: 사이드바 설정
```typescript
// sidebars.ts 업데이트
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/what-is-cline',
        'getting-started/installing-cline',
        // ... 추가 페이지들
      ],
    },
    // ... 기타 카테고리들
  ],
};
```

## 8. 📋 품질 기준 및 검증 방법

### 기능 검증
- [ ] 4개 언어 전환 정상 작동
- [ ] 모든 링크 정상 작동 (내부/외부)
- [ ] 푸터 정보 정확성 (회사정보, 연락처)
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)

### 성능 기준
- [ ] 첫 페이지 로딩 < 3초
- [ ] 언어 전환 < 1초
- [ ] 번들 사이즈 최적화
- [ ] 이미지 최적화 (WebP 포맷 지원)

### SEO 최적화
- [ ] 각 언어별 메타데이터 설정
- [ ] sitemap.xml 생성
- [ ] robots.txt 설정
- [ ] Open Graph 메타태그

---

### 현재까지의 작업 상세 내용

1.  **`/docs` 폴더 구조 분석**: `ls -R docs` 명령을 통해 기존 `/docs` 폴더의 하위 디렉터리 및 `.mdx` 파일 구조를 확인했습니다.
2.  **Docusaurus 프로젝트 초기 설정**: `npx create-docusaurus@latest docusaurus-site classic --typescript` 명령을 사용하여 `docusaurus-site` 폴더에 TypeScript 기반 Docusaurus 프로젝트를 생성했습니다.
3.  **Docusaurus 다국어 설정**: `docusaurus-site/docusaurus.config.ts` 파일을 수정하여 `title`, `tagline`, `url`, `baseUrl`, `organizationName`, `projectName`을 Caret 프로젝트에 맞게 업데이트하고, `i18n` 설정에 `en`, `ko`, `zh-Hans`, `ja` 로케일을 추가했습니다. 또한, `navbar.items`에 `localeDropdown`을 추가하여 언어 선택 드롭다운을 활성화했습니다.
4.  **Docusaurus README.md 업데이트**: `docusaurus-site/README.md` 파일에 "Document Update, Synchronization, and Translation Strategy" 섹션을 추가하여 문서 업데이트, 동기화 및 번역 워크플로우에 대한 상세 설명을 포함했습니다.
5.  **Docusaurus 초기 파일 정리**:
    *   `docusaurus-site/docs/intro.mdx` 파일 삭제를 시도했으나, 파일이 존재하지 않아 실패했습니다. (이미 삭제되었거나 생성되지 않은 것으로 추정)
    *   `docusaurus-site/blog/*` 폴더 내용 삭제를 시도했으나, `rm -rf` 명령이 Windows 환경에서 올바르게 작동하지 않아 `Remove-Item -Path docusaurus-site/blog/* -Recurse -Force` 명령으로 성공적으로 삭제했습니다.
    *   `docusaurus-site/static/img` 폴더를 생성했습니다. (이미 존재하여 오류가 발생했지만, 성공적으로 처리됨)
6.  **기존 문서 복사 (진행 중)**:
    *   `docs/enterprise-solutions` 폴더를 `docusaurus-site/docs/`로 복사했습니다.
    *   `docs/exploring-clines-tools` 폴더를 `docusaurus-site/docs/`로 복사했습니다.
    *   `docs/features` 폴더를 `docusaurus-site/docs/`로 복사했습니다.
    *   `docs/getting-started` 폴더를 `docusaurus-site/docs/`로 복사했습니다.
    *   `docs/mcp` 폴더를 `docusaurus-site/docs/`로 복사하는 중 마스터의 지시로 중단되었습니다.
