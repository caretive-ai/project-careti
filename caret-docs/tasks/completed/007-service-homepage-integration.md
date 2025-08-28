# Task #007: 서비스(caret.team) 및 회사 홈페이지(caretive.ai) 연동 및 연계 추가

## 1. 작업 개요
- **작업명**: 서비스 홈페이지(caret.team) 및 회사 홈페이지(caretive.ai) 구축 및 VSCode Extension 연동
- **담당자**: luke
- **예상 소요시간**: 4-6주 (웹사이트 개발 포함)
- **우선순위**: 높음 (서비스 런칭 핵심 요소)
- **의존성**: Task #001 (Caret Architecture Initialization) 완료 필요

## 2. 작업 목표
완전한 서비스 생태계 구축을 위해 caret.team 서비스 웹사이트와 caretive.ai 회사 홈페이지를 개발하고, VSCode Extension과의 원활한 연동을 통해 통합된 사용자 경험을 제공한다. 이를 통해 브랜드 신뢰성과 서비스 완성도를 높이고, 사용자 획득 및 유지에 기여한다.

## 3. 세부 작업 내용

### 3.1 서비스 페이지 구축 (caret.team)
현재 웰컴뷰에서 링크는 연결되어 있지만 실제 서비스 페이지들이 필요함

- **메인 랜딩 페이지**: `https://caret.team`
  - Caret 소개 및 핵심 기능 설명
  - VSCode Extension 다운로드 안내
  - 시작하기 가이드 제공
  - 사용자 후기 및 데모

- **서비스 앱 페이지**: `https://app.caret.team`
  - 로그인/회원가입: `/auth` 
  - 사용자 대시보드: `/credits`
  - 크레딧 구매: `/credits/#buy`
  - 사용 내역 관리
  - 계정 설정

- **문서 사이트**: `https://docs.caret.team`
  - 설치 가이드
  - API 문서  
  - 개발자 가이드
  - FAQ 및 트러블슈팅

- **정책 페이지들**: `https://caret.team`
  - 서비스 약관: `/tos`
  - 개인정보처리방침: `/privacy`
  - 지원 페이지: `/support`

### 3.2 회사 홈페이지 개선 (caretive.ai)
현재 웰컴뷰 Footer에 연결된 링크들의 실제 페이지 구축

- **회사 소개**: `https://caretive.ai`
  - 회사 비전 및 미션
  - 팀 소개
  - 연혁 및 성과

- **상세 페이지들**: 
  - 회사 소개: `/about`
  - 고객 지원: `/support`  
  - 청소년 보호: `/youth-protection`
  - 서비스 약관: `/terms`
  - 개인정보처리방침: `/privacy`

### 3.3 서비스 연동 기능 구현
- **caret.team 연동**
  - 웰컴 페이지에서 서비스 소개 및 링크 제공
  - 서비스 가입/로그인 연동 버튼 추가
  - 서비스 상태 확인 기능 구현
  - 사용자 계정 연동 준비 (향후 확장)

- **caretive.ai 회사 홈페이지 연동**
  - 회사 소개 및 비전 링크 제공
  - 팀 소개 페이지 연결
  - 채용 정보 연결 (있는 경우)
  - 고객 지원 채널 연결

### 3.2 UI/UX 개선
- **웰컴 페이지 개선**
  - 서비스 소개 섹션 강화
  - 회사 소개 섹션 추가
  - 시각적 브랜딩 일관성 확보
  - 반응형 디자인 적용

- **네비게이션 개선**
  - 메뉴에 서비스 링크 추가
  - 도움말 섹션에 회사 정보 추가
  - 설정 페이지에 계정 연동 옵션 준비

### 3.3 백엔드 연동 준비
- **API 연동 구조 설계**
  - caret.team API 연동을 위한 기본 구조
  - 인증 토큰 관리 시스템
  - 사용자 세션 관리
  - 오프라인 모드 지원

- **보안 및 프라이버시**
  - 사용자 데이터 보호
  - HTTPS 통신 보장
  - 토큰 암호화 저장
  - 개인정보 처리 방침 준수

## 4. 기술적 구현 사항

### 4.1 웹사이트 개발 기술 스택
- **프론트엔드**: React/Next.js 또는 static site generator
- **호스팅**: Vercel, Netlify, 또는 AWS S3/CloudFront
- **도메인**: caret.team, app.caret.team, docs.caret.team
- **디자인**: VSCode 테마와 일관성 있는 디자인 시스템
- **백엔드 API**: Node.js/Express (인증, 크레딧 관리용)

### 4.2 웹사이트 구조
```
caret.team (메인 서비스 사이트)
├── / (랜딩 페이지)
├── /tos (서비스 약관)
├── /privacy (개인정보처리방침)
└── /support (고객 지원)

app.caret.team (서비스 앱)
├── /auth (로그인/회원가입)
├── /credits (크레딧 대시보드)
└── /credits/#buy (크레딧 구매)

docs.caret.team (문서 사이트)
├── / (문서 홈)
├── /getting-started (시작 가이드)
├── /api (API 문서)
└── /faq (FAQ)

caretive.ai (회사 홈페이지)
├── / (회사 소개)
├── /about (상세 소개)
├── /support (고객 지원)
├── /terms (약관)
├── /privacy (개인정보처리방침)
└── /youth-protection (청소년 보호)
```

### 4.3 VSCode Extension 연동 (webview-ui)
```typescript
// 기존 컴포넌트 활용 (이미 구현됨)
- webview-ui/src/caret/components/CaretFooter.tsx
- webview-ui/src/caret/constants/urls.ts
- webview-ui/src/caret/utils/i18n.ts

// 필요시 추가 컴포넌트
- CaretServiceStatus.tsx (서비스 상태 표시)
- CaretServiceNotification.tsx (서비스 알림)
```

### 4.4 Backend 연동 (caret-src)
```typescript
// API 클라이언트 (기존 Cline 구조 활용)
- src/services/account/ClineAccountService.ts → CaretAccountService.ts
- src/api/providers/cline.ts → caret.ts

// 설정 관리
- caret-src/config/CaretServiceConfig.ts (신규)
```

### 4.5 도메인 및 인프라 설정
```yaml
# DNS 설정
caret.team: 메인 서비스 사이트
app.caret.team: 서비스 애플리케이션  
docs.caret.team: 문서 사이트
api.caret.team: API 서버

# SSL 인증서
- Let's Encrypt 또는 CloudFlare SSL
- HTTPS 강제 적용

# CDN 설정
- 글로벌 콘텐츠 전송 최적화
- 이미지 및 정적 자산 캐싱
```

## 5. 테스트 계획

### 5.1 웹사이트 기능 테스트
**caret.team 메인 사이트**
- [ ] 랜딩 페이지 로딩 및 콘텐츠 표시
- [ ] VSCode Extension 다운로드 링크 동작
- [ ] 정책 페이지들 (TOS, Privacy) 접근성
- [ ] 고객 지원 폼 동작

**app.caret.team 서비스 앱**
- [ ] 로그인/회원가입 플로우
- [ ] 크레딧 대시보드 데이터 표시
- [ ] 크레딧 구매 프로세스
- [ ] 사용 내역 조회 기능

**docs.caret.team 문서 사이트**
- [ ] 문서 네비게이션 및 검색
- [ ] 코드 예제 복사/붙여넣기
- [ ] 다국어 지원 확인

**caretive.ai 회사 홈페이지**
- [ ] 회사 정보 페이지들 접근성
- [ ] 고객 지원 연락처 동작
- [ ] 법적 문서들 (약관, 개인정보처리방침)

### 5.2 VSCode Extension 연동 테스트
- [ ] 웰컴뷰 Footer 링크들 동작 확인
- [ ] 외부 브라우저 열기 테스트
- [ ] 계정 로그인 연동 테스트
- [ ] 크레딧 정보 실시간 동기화
- [ ] 다양한 OS 환경 테스트 (Windows, macOS, Linux)

### 5.3 웹사이트 성능 및 호환성 테스트
- [ ] 페이지 로딩 속도 (Google PageSpeed Insights)
- [ ] 모바일 반응형 디자인
- [ ] 브라우저 호환성 (Chrome, Firefox, Safari, Edge)
- [ ] SEO 최적화 확인
- [ ] 접근성 테스트 (WCAG 가이드라인)

### 5.4 보안 및 인프라 테스트
- [ ] HTTPS/SSL 인증서 적용 확인
- [ ] API 엔드포인트 보안 테스트
- [ ] 사용자 데이터 암호화 검증
- [ ] CORS 정책 설정 확인
- [ ] 개인정보 처리 방침 준수 검증

### 5.5 통합 테스트
- [ ] VSCode Extension → 웹서비스 연동 플로우
- [ ] 계정 생성 → 크레딧 구매 → Extension 사용 전체 과정
- [ ] 다국어 사용자 시나리오 테스트
- [ ] 서비스 장애 시 Extension 동작 확인

## 6. 예상 결과물

### 6.1 웹사이트 및 서비스 인프라
- **caret.team** 완전 기능 서비스 사이트
- **app.caret.team** 사용자 대시보드 및 크레딧 관리 시스템
- **docs.caret.team** 통합 문서 사이트
- **caretive.ai** 회사 공식 홈페이지
- **api.caret.team** 백엔드 API 서버

### 6.2 VSCode Extension 통합
- VSCode Extension에서 서비스로의 원활한 연동
- 실시간 계정 상태 및 크레딧 정보 동기화
- 다국어 지원 및 일관된 브랜딩
- 웰컴뷰 및 설정 페이지 완전 통합

### 6.3 사용자 경험 향상
- 통합된 온보딩 프로세스
- 원스톱 서비스 접근성
- 브랜드 인지도 및 신뢰성 향상
- 고객 지원 채널 다양화

### 6.4 비즈니스 기반 구축
- 사용자 계정 관리 시스템
- 크레딧 기반 수익 모델
- 서비스 확장을 위한 API 인프라
- 마케팅 및 홍보 채널 확보

## 7. 위험 요소 및 대응 방안

### 7.1 기술적 위험
- **도메인 및 DNS 설정 문제**: 
  - 사전 도메인 구매 및 DNS 테스트
  - 단계적 도메인 연결 (개발 → 스테이징 → 프로덕션)
  
- **웹사이트 성능 이슈**:
  - CDN 사용으로 전역 성능 최적화
  - 이미지 및 자산 최적화
  - 로딩 상태 및 에러 처리 강화

- **API 서버 안정성**:
  - 로드 밸런싱 및 자동 스케일링
  - 서비스 모니터링 및 알림 시스템
  - 백업 및 장애 복구 계획

### 7.2 보안 위험
- **사용자 데이터 보안**:
  - HTTPS 강제 적용
  - 데이터 암호화 및 안전한 저장
  - 정기적 보안 감사

- **API 보안**:
  - JWT 토큰 기반 인증
  - Rate limiting 및 DDoS 방어
  - API 버전 관리 및 deprecation 정책

### 7.3 사용자 경험 위험
- **서비스 중단 시 Extension 동작**:
  - 오프라인 모드 및 캐싱 전략
  - 서비스 상태 알림 및 안내
  - 대체 API 엔드포인트 준비

- **사용자 마이그레이션 복잡성**:
  - 단계적 마이그레이션 계획
  - 기존 사용자 데이터 보존
  - 상세한 마이그레이션 가이드 제공

### 7.4 비즈니스 위험
- **초기 사용자 부족**:
  - 기존 GitHub 커뮤니티 활용
  - 교육 프로그램과 연계 마케팅
  - 인플루언서 및 개발자 커뮤니티 참여

- **경쟁사 대비 차별화**:
  - 고유한 AI 기능 및 한국어 지원 강화
  - 교육 및 학습 중심 포지셔닝
  - 커뮤니티 기반 생태계 구축

## 8. 작업 우선순위 및 단계

### Phase 1: 기본 인프라 구축 (1-2주)
1. **도메인 구매 및 DNS 설정**
   - caret.team, caretive.ai 도메인 확보
   - 서브도메인 설정 (app, docs, api)

2. **기본 웹사이트 구축**
   - caret.team 랜딩 페이지 (정적 사이트)
   - caretive.ai 회사 소개 페이지
   - 기본 정책 페이지들 (TOS, Privacy)

3. **VSCode Extension URL 업데이트**
   - 기존 cline.bot URL을 caret.team으로 변경
   - 설정 파일 및 상수 업데이트

### Phase 2: 서비스 기능 구현 (2-3주)  
1. **백엔드 API 서버 구축**
   - 사용자 인증 시스템
   - 크레딧 관리 API
   - 데이터베이스 설계 및 구축

2. **app.caret.team 서비스 앱**
   - 로그인/회원가입 페이지
   - 크레딧 대시보드
   - 사용 내역 관리

3. **VSCode Extension 연동**
   - API 클라이언트 업데이트
   - 실시간 데이터 동기화

### Phase 3: 고도화 및 최적화 (1-2주)
1. **docs.caret.team 문서 사이트**
   - API 문서 자동 생성
   - 사용자 가이드 및 튜토리얼
   - 검색 및 네비게이션 기능

2. **성능 및 보안 최적화**
   - CDN 설정 및 캐싱 전략
   - 보안 검토 및 취약점 패치
   - 모니터링 및 로그 시스템

3. **사용자 경험 개선**
   - A/B 테스트 기반 UI 개선
   - 다국어 지원 완성
   - 접근성 및 모바일 최적화

## 9. 향후 확장 계획

### 9.1 서비스 고도화
- **팀 협업 기능**: 프로젝트 공유 및 협업 도구
- **클라우드 동기화**: 설정 및 히스토리 클라우드 백업
- **AI 모델 허브**: 커스텀 모델 업로드 및 공유
- **플러그인 마켓플레이스**: 써드파티 확장 기능

### 9.2 비즈니스 확장
- **기업용 서비스**: 엔터프라이즈 기능 및 사이트 라이센스
- **교육 파트너십**: 대학 및 교육기관 협력 프로그램
- **API 개방**: 써드파티 개발자를 위한 공개 API
- **모바일 앱**: iOS/Android 네이티브 앱 개발

### 9.3 글로벌 확장
- **다국가 서비스**: 지역별 특화 서비스 및 로컬라이제이션
- **글로벌 파트너십**: 해외 개발자 커뮤니티 및 기업 협력
  - **현지화 지원**: 각국 법규 및 문화적 요소 반영
  
  ## 10. cline.bot API 분석 및 caret.team 연동 필요 API 목록
  
### 10.1 메인 API 서비스
- **Base URL**: `https://api.cline.bot/v1` → `https://api.caret.team/v1`로 변경 예정
- **인증 방식**: Bearer Token (Authorization: Bearer {apiKey})
- **주요 헤더**: 
  - `Content-Type: application/json`
  - `HTTP-Referer`: 랭킹/통계를 위한 앱 식별
  - `X-Title`: 서비스명 표시
  - `X-Task-ID`: 작업 ID 추적

### 10.2 Account Service APIs

#### 10.2.1 크레딧 잔액 조회
- **URL**: `GET /user/credits/balance`
- **호출 위치**: `src/services/account/ClineAccountService.ts:49-66`
- **리턴 타입**: `BalanceResponse`
  ```typescript
  interface BalanceResponse {
    currentBalance: number
  }
  ```
- **사용처**: `webview-ui/src/components/account/AccountView.tsx:47-52`

#### 10.2.2 사용 내역 조회  
- **URL**: `GET /user/credits/usage`
- **호출 위치**: `src/services/account/ClineAccountService.ts:68-85`
- **리턴 타입**: `UsageTransaction[]`
  ```typescript
  interface UsageTransaction {
    spentAt: string
    credits: string
    modelProvider: string
    model: string
    promptTokens: string
    completionTokens: string
  }
  ```
- **사용처**: `webview-ui/src/components/account/AccountView.tsx:49-51`

#### 10.2.3 결제 내역 조회
- **URL**: `GET /user/credits/payments`
- **호출 위치**: `src/services/account/ClineAccountService.ts:87-104`
- **리턴 타입**: `PaymentTransaction[]`
  ```typescript
  interface PaymentTransaction {
    paidAt: string
    amountCents: string
    credits: string
  }
  ```
- **사용처**: `webview-ui/src/components/account/AccountView.tsx:52-54`

### 10.3 AI Generation API

#### 10.3.1 생성 세부정보 조회
- **URL**: `GET /generation?id={generationId}`
- **호출 위치**: `src/api/providers/cline.ts:111-133`
- **용도**: API 사용량 및 비용 정보 조회
- **리턴 데이터**:
  ```typescript
  {
    native_tokens_cached: number
    native_tokens_prompt: number
    native_tokens_completion: number
    total_cost: number
  }
  ```

### 10.4 MCP (Model Context Protocol) APIs

#### 10.4.1 MCP 마켓플레이스
- **URL**: `GET /mcp/marketplace`
- **호출 위치**: `src/core/controller/index.ts:888, 922`
- **용도**: MCP 서버 목록 및 정보 조회

#### 10.4.2 MCP 다운로드
- **URL**: `POST /mcp/download`
- **호출 위치**: `src/core/controller/mcp/downloadMcp.ts:32`
- **용도**: MCP 서버 패키지 다운로드

### 10.5 웹 서비스 URLs

#### 10.5.1 인증/로그인
- **URL**: `https://app.cline.bot/auth` → `https://app.caret.team/auth`
- **호출 위치**: `src/core/controller/account/accountLoginClicked.ts:26`
- **파라미터**: 
  - `state`: nonce 값 (보안 검증용)
  - `callback_url`: VSCode extension callback URL
- **사용처**: `webview-ui/src/components/account/AccountView.tsx:74-77`

#### 10.5.2 크레딧 대시보드
- **URL**: `https://app.cline.bot/credits` → `https://app.caret.team/credits`
- **호출 위치**: `webview-ui/src/components/account/AccountView.tsx:113`
- **용도**: 사용자 크레딧 관리 대시보드

#### 10.5.3 크레딧 구매
- **URL**: `https://app.cline.bot/credits/#buy` → `https://app.caret.team/credits/#buy`
- **호출 위치**: 
  - `webview-ui/src/components/account/AccountView.tsx:145`
  - `webview-ui/src/components/chat/CreditLimitError.tsx:32`
- **용도**: 크레딧 구매 페이지

### 10.6 정적 링크들

#### 10.6.1 문서 및 정책
- **서비스 약관**: `https://cline.bot/tos` → `https://caret.team/tos`
- **개인정보 처리방침**: `https://cline.bot/privacy` → `https://caret.team/privacy`
- **호출 위치**: `webview-ui/src/components/account/AccountView.tsx:171-172`

### 10.7 caret.team 연동을 위한 주요 변경 파일

#### 10.7.1 Backend 변경 필요 파일
1. **`src/services/account/ClineAccountService.ts`**
   - Line 5: `baseUrl` 변경
   - 클래스명을 `CaretAccountService`로 변경

2. **`src/api/providers/cline.ts`**
   - Line 18: `baseURL` 변경
   - Line 21-22: HTTP-Referer, X-Title 헤더 값 변경
   - 클래스명을 `CaretHandler`로 변경

3. **`src/core/controller/account/accountLoginClicked.ts`**
   - Line 26: 인증 URL 변경

#### 10.7.2 Frontend 변경 필요 파일
1. **`webview-ui/src/components/account/AccountView.tsx`**
   - Line 113: 대시보드 URL 변경
   - Line 145: 크레딧 구매 URL 변경
   - Line 171-172: 정책 링크 변경

2. **`webview-ui/src/components/chat/CreditLimitError.tsx`**
   - Line 32: 크레딧 구매 URL 변경

### 10.8 설정 파일 변경
- **`caret-src/config/CaretServiceConfig.ts`** (신규 생성)
  ```typescript
  export const CARET_SERVICE_CONFIG = {
    API_BASE_URL: "https://api.caret.team/v1",
    APP_BASE_URL: "https://app.caret.team",
    SERVICE_NAME: "Caret",
    REFERER_URL: "https://caret.team"
  }
  ```

## 11. 참고 자료
- [Caret Service Documentation](https://caret.team/docs) (예정)
- [Caretive Company Information](https://caretive.ai)
- [VSCode Extension API](https://code.visualstudio.com/api)
- [웹뷰 통신 가이드](../../development/webview-extension-communication.mdx) 