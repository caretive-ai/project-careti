# t04 - Caret Account 시스템 완전 구현

## 🎯 작업 목표
- **핵심 목적**: ClineAccount 완전 대체 (진입점 변경 방식)
- **전략**: Cline 코드 보존 + Caret 독립 구현
- **우선순위**: HIGH - 비즈니스 핵심 기능

## 📋 현재 상황 분석

### ✅ 구현된 기능들
- `CaretApiProvider.ts` - Caret API 서버 연동 완료
- `CaretGlobalManager` - 전역 상태 관리 (기존 CaretProvider 개명)
- 기본 Settings UI - API 키 입력 및 로그인

### ❌ 누락된 핵심 기능들 (ClineAccount 대체용)
- `CaretAccountView.tsx` - 계정 관리 메인 UI
- `CaretAccountInfoCard.tsx` - 계정 정보 카드
- `caretUser` 상태 관리 및 진입점 분기 로직

## 🔧 구현 전략: ClineAccount 완전 대체

### 핵심 아이디어
```typescript
// 현재: Cline만 처리
{clineUser?.uid ? <ClineAccountView /> : <AccountWelcomeView />}

// 목표: 진입점만 변경하여 Caret 우선 처리
{caretUser?.uid ? <CaretAccountView /> : 
 clineUser?.uid ? <ClineAccountView /> : <AccountWelcomeView />}
```

### 필수 구현 컴포넌트
```
webview-ui/src/caret/components/
├── CaretAccountView.tsx        # ⚠️ 미구현 - Cline 대체 핵심
├── CaretAccountInfoCard.tsx    # ⚠️ 미구현 - Settings 통합 필요
├── CaretApiSetup.tsx          # ✅ 구현완료
└── CaretWelcomeSection.tsx    # ✅ 구현완료
```

## 🎯 작업 단계 (우선순위별)

### Phase 1: caretUser 상태 관리 구현 (최우선)
- [ ] `ExtensionStateContext`에 `caretUser` 추가
- [ ] `CaretGlobalManager`에서 Auth0 토큰 → caretUser 변환
- [ ] `AccountView.tsx`에서 진입점 분기 로직 추가
  ```typescript
  {caretUser?.uid ? <CaretAccountView /> : 
   clineUser?.uid ? <ClineAccountView /> : <AccountWelcomeView />}
  ```

### Phase 2: CaretAccountView 구현 (핵심)
- [ ] `CaretAccountView.tsx` 생성
  ```typescript
  // ClineAccountView와 동일한 인터페이스
  // 하지만 Caret API 서버 호출
  // 사용량, 결제, 조직 관리 등
  ```
- [ ] Caret 사용량 API 연동
- [ ] 결제 및 조직 관리 UI

### Phase 3: Settings 통합 (CaretAccountInfoCard)
- [ ] `CaretAccountInfoCard.tsx` 구현
- [ ] Settings에서 "View Account" 버튼 추가
- [ ] 기존 `CaretProvider.tsx` 개선 또는 대체

### Phase 4: 최종 통합 및 테스트
- [ ] Cline 기능 영향 없음 확인
- [ ] 타입스크립트 컴파일 검증
- [ ] 실제 Auth0 로그인 플로우 테스트


## 🔑 핵심 기술 요구사항

### Caret vs Cline 아키텍처 차이
```typescript
// Cline: AuthService + ClineAccountService
class ClineHandler {
  private clineAccountService = ClineAccountService.getInstance()
  private _authService: AuthService
}

// Caret: CaretGlobalManager (독립적)
class CaretApiProvider {
  private globalManager = CaretGlobalManager.get()  // Caret 전용
  private readonly _baseUrl = "https://api.caret.team"  // Caret 서버
}
```

### 필수 API 엔드포인트 (서버팀 구현 필요)
- `POST /api/v1/chat/completions` - OpenAI 호환 채팅 API
- `GET /generation?id={id}` - 사용량 조회 API
- `POST /auth/login` - Auth0 로그인
- `GET /account/usage` - 계정 사용량 대시보드

## ⚠️ 주의사항
- **Cline 코드 보존**: 기존 Cline 기능에 영향 없음
- **진입점만 변경**: `AccountView.tsx`에서 조건 분기만 추가
- **독립적 구현**: Caret 전용 컴포넌트와 서비스 별도 구현