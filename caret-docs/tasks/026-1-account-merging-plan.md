# Task 026-1: Account System 최소 업그레이드 계획 ✨

> **Target**: Cline v3.23.0 → Caret v0.1.1  
> **Focus**: Account **기능만** 선택적 업그레이드 (**Proto 구조 변경 제외**)  
> **Deadline**: 026번 메인 작업의 첫 번째 단계  

## 🚨 **중요: 범위 제한**

### **❌ 포함되지 않는 작업 (027번으로 이관)**
- **Proto 디렉토리 구조 변경** (`proto/` → `proto/cline/`, `proto/host/`)  
- **전체 gRPC 시스템 재구성**  
- **패키지명 대규모 변경** (`package cline` → `package caret`)  

### **✅ 026-1번에서만 수행할 작업**
- **Account 새 기능 메시지 추가** (Credits, Organizations, AuthState)  
- **현재 proto 구조 유지하면서 메시지만 확장**  
- **CaretAccountService 기능 확장**  
- **CaretAccountView UI 개선**  

## 📋 **실제 필요한 기능 분석**

### **현재 Caret Account 상태** ✅
```typescript
// 이미 잘 작동하는 것들
✅ CaretAccountService (독립 서비스)
✅ CaretAccountView (독립 UI)
✅ caret.team API 엔드포인트
✅ caretApiKey 인증
✅ 기본 로그인/로그아웃
```

### **Cline v3.23.0에서 추가할 기능** 🆕
```proto
// 새로 추가할 주요 메시지들 (현재 proto/account.proto에)
+ UserCreditsData (잔액, 사용내역, 결제내역)
+ OrganizationCreditsData (조직 크레딧)
+ UserOrganization (조직 정보)
+ AuthState (실시간 인증 상태)
+ UsageTransaction (사용 내역)
+ PaymentTransaction (결제 내역)
```

## 🎯 **머징 전략: "기능 중심 최소 업그레이드"**

### **핵심 원칙**
1. **기존 구조 완전 유지**: Caret의 현재 proto 구조 (`proto/account.proto`) 그대로 사용
2. **기능만 선택적 추가**: Cline의 새 Account 메시지 복사해서 추가
3. **최소 변경**: 현재 잘 작동하는 CaretAccountService, CaretAccountView 기반으로 확장
4. **점진적 통합**: Message 추가 → 기능 확장 → UI 개선

### **예상 작업 시간**
- **총 소요 시간**: ~1시간 (대폭 단축!)
- **Phase 1 (Proto 메시지 추가)**: 20분
- **Phase 2 (Controller 기능 확장)**: 20분  
- **Phase 3 (UI 개선)**: 20분

## 🚀 **단계별 머징 계획**

### **Phase 1: Proto 메시지 확장 (20분)**

#### **1-1. 현재 account.proto에 새 메시지 추가**
```bash
# 1. 현재 백업 생성
cp proto/account.proto proto/account.proto.026-backup

# 2. Cline 새 메시지들만 복사 추가
# (패키지는 caret; 그대로 유지)
```

#### **1-2. 새로 추가할 메시지들**
```proto
// proto/account.proto에 추가 (기존 구조 유지)
package caret;  // 변경 안함!
import "common.proto";  // 기존 그대로

// 기존 서비스에 새 메서드 추가
service AccountService {
  // 기존 메서드들 유지
  rpc accountLoginClicked(EmptyRequest) returns (String);
  rpc accountLogoutClicked(EmptyRequest) returns (Empty);
  rpc subscribeToAuthCallback(EmptyRequest) returns (stream String);
  
  // ✨ 새로 추가할 메서드들
  rpc subscribeToAuthStatusUpdate(EmptyRequest) returns (stream AuthState);
  rpc authStateChanged(AuthStateChangedRequest) returns (AuthState);
  rpc getUserCredits(EmptyRequest) returns (UserCreditsData);
  rpc getUserOrganizations(EmptyRequest) returns (UserOrganizationsResponse);
  rpc setUserOrganization(UserOrganizationUpdateRequest) returns (Empty);
}

// ✨ 새로 추가할 메시지들
message AuthStateChangedRequest {
  Metadata metadata = 1;
  UserInfo user = 2;
}

message AuthState {
  optional UserInfo user = 1;
}

message UserInfo {
  string uid = 1;
  optional string display_name = 2;
  optional string email = 3;
  optional string photo_url = 4;
  optional string app_base_url = 5; // Caret app base URL
}

message UserCreditsData {
  UserCreditsBalance balance = 1;
  repeated UsageTransaction usage_transactions = 2;
  repeated PaymentTransaction payment_transactions = 3;
}

message UserCreditsBalance {
  double current_balance = 1;
}

message UsageTransaction {
  string ai_inference_provider_name = 1;
  string ai_model_name = 2;
  string ai_model_type_name = 3;
  int32 completion_tokens = 4;
  double cost_usd = 5;
  string created_at = 6;
  double credits_used = 7;
  string generation_id = 8;
  string organization_id = 9;
  int32 prompt_tokens = 10;
  int32 total_tokens = 11;
  string user_id = 12;
}

message PaymentTransaction {
  string paid_at = 1;
  string creator_id = 2;
  int32 amount_cents = 3;
  double credits = 4;
}

message UserOrganization {
  bool active = 1;
  string member_id = 2;
  string name = 3;
  string organization_id = 4;
  repeated string roles = 5; // ["admin", "member", "owner"]
}

message UserOrganizationsResponse {
  repeated UserOrganization organizations = 1;
}

message UserOrganizationUpdateRequest {
  optional string organization_id = 1;
}
```

#### **1-3. Proto 재생성**
```bash
npm run protos
```

### **Phase 2: CaretAccountService 기능 확장 (20분)**

#### **2-1. 기존 CaretAccountService에 새 메서드 추가**
```typescript
// caret-src/services/account/CaretAccountService.ts
// 기존 코드 유지하면서 새 기능만 추가

export class CaretAccountService {
  // 기존 메서드들 유지
  async accountLoginClicked() { /* 기존 코드 */ }
  async accountLogoutClicked() { /* 기존 코드 */ }
  
  // ✨ 새로 추가할 메서드들 (Cline에서 복사)
  async getUserCredits(): Promise<UserCreditsData> {
    // Cline 로직 복사하되 caret.team API 사용
    const response = await fetch('https://api.caret.team/credits', {
      headers: { Authorization: `Bearer ${await this.getApiKey()}` }
    })
    return response.json()
  }
  
  async getUserOrganizations(): Promise<UserOrganizationsResponse> {
    // Cline 로직 복사하되 caret.team API 사용
    const response = await fetch('https://api.caret.team/organizations', {
      headers: { Authorization: `Bearer ${await this.getApiKey()}` }
    })
    return response.json()
  }
  
  async setUserOrganization(orgId: string): Promise<void> {
    // Cline 로직 복사하되 caret.team API 사용
  }
}
```

#### **2-2. Controller에 새 Handler 추가**
```typescript
// src/core/controller/account/ 디렉토리에 새 파일들 추가
// getUserCredits.ts, getUserOrganizations.ts 등
// 기존 accountLoginClicked.ts 패턴 따라서 작성
```

### **Phase 3: CaretAccountView UI 개선 (20분)**

#### **3-1. 기존 CaretAccountView 확장**
```typescript
// webview-ui/src/caret/components/CaretAccountView.tsx
// 기존 컴포넌트 유지하면서 새 기능만 추가

export const CaretAccountView = () => {
  // 기존 상태들 유지
  const [balance, setBalance] = useState(0)
  const [usageData, setUsageData] = useState<UsageTransaction[]>([])
  const [paymentsData, setPaymentsData] = useState<PaymentTransaction[]>([])
  
  // ✨ 새로 추가할 상태들
  const [organizations, setOrganizations] = useState<UserOrganization[]>([])
  const [activeOrg, setActiveOrg] = useState<UserOrganization>()
  
  // 기존 useEffect 유지하면서 새 데이터 요청 추가
  useEffect(() => {
    if (user) {
      // 기존 요청들 유지
      vscode.postMessage({ type: "fetchUserCreditsData" })
      
      // ✨ 새 요청들 추가
      vscode.postMessage({ type: "fetchUserOrganizations" })
    }
  }, [user])
  
  // 기존 렌더링 유지하면서 새 UI 추가
  return (
    <div>
      {/* 기존 UI 유지 */}
      {user && (
        <>
          {/* 기존 크레딧 정보 */}
          <div>Balance: {balance}</div>
          
          {/* ✨ 새로 추가: 조직 선택 (선택사항) */}
          {organizations.length > 1 && (
            <VSCodeDropdown>
              {organizations.map(org => (
                <VSCodeOption key={org.organization_id}>
                  {org.name}
                </VSCodeOption>
              ))}
            </VSCodeDropdown>
          )}
          
          {/* 기존 사용내역 테이블 유지 */}
          <CreditsHistoryTable 
            usageData={usageData} 
            paymentsData={paymentsData} 
          />
        </>
      )}
    </div>
  )
}
```

#### **3-2. 다국어 지원 확장**
```json
// webview-ui/src/caret/locale/en/common.json
{
  "account": {
    // 기존 번역들 유지
    "signUpWithCaret": "Login & Sign Up",
    "viewBillingUsage": "View Billing & Usage",
    
    // ✨ 새로 추가할 번역들
    "currentBalance": "Current Balance",
    "organization": "Organization",
    "usageHistory": "Usage History",
    "paymentHistory": "Payment History"
  }
}
```

## ✅ **완료 기준**

### **필수 조건**
- [ ] **Proto 메시지 추가**: UserCreditsData, UserOrganization 등 새 메시지 정의
- [ ] **Service 확장**: CaretAccountService에 새 메서드 추가
- [ ] **UI 개선**: 크레딧 잔액, 사용내역 표시
- [ ] **빌드 성공**: 컴파일 및 WebView 빌드 통과
- [ ] **기존 기능 유지**: 로그인/로그아웃 정상 동작

### **선택 조건 (시간이 있으면)**
- [ ] **조직 선택**: 여러 조직이 있을 때 드롭다운
- [ ] **실시간 업데이트**: AuthState 구독
- [ ] **에러 처리**: 네트워크 오류 등 예외 상황

## 🚨 **주의사항**

### **하지 말아야 할 것들**
- ❌ **Proto 디렉토리 구조 변경**: `proto/cline/` 같은 폴더 생성 금지
- ❌ **패키지명 변경**: `package caret;` 유지
- ❌ **기존 코드 대폭 수정**: CaretAccountService, CaretAccountView 기반 확장만
- ❌ **복잡한 Organization 기능**: 단순히 표시만 하고 로직은 최소화

### **해야 할 것들**
- ✅ **메시지만 추가**: 새 proto 메시지 정의
- ✅ **기능 점진적 확장**: 기존 코드 기반으로 새 기능 추가
- ✅ **Caret 브랜딩 유지**: caret.team API, Caret 로고 등
- ✅ **최소 수정**: CARET MODIFICATION 주석으로 변경사항 표시

## 📈 **예상 효과**

### **즉시 얻을 수 있는 것들**
- 🔐 **크레딧 관리**: 잔액 표시, 사용내역 확인
- 📊 **사용량 시각화**: 상세한 사용 통계
- 🏢 **조직 지원**: 기본적인 조직 정보 표시
- ⚡ **실시간 인증**: AuthState 기반 상태 관리

### **027번으로 미룰 것들**
- 🏗️ **Proto 구조 정리**: `proto/cline/`, `proto/host/` 폴더 구조
- 🔧 **전체 gRPC 재구성**: 패키지명 통일, import 경로 정리
- 🎨 **UI 완전 개편**: Cline의 고급 UI 컴포넌트들

---

**우선순위**: HIGH  
**예상 소요시간**: 1시간  
**의존성**: 없음  
**후속 작업**: 026-2 Model 머징  

**작성자**: Alpha Yang (AI Assistant)  
**검토자**: Luke (Project Owner)  
**작성일**: 2025-08-12  

### **핵심 결정사항**

1. **Proto 구조 변경 제외**: 027번으로 이관하여 026번 범위 최소화
2. **기능만 선택적 추가**: 메시지 정의와 API 호출만 구현
3. **기존 코드 기반 확장**: CaretAccountService, CaretAccountView 유지
4. **점진적 구현**: 복잡한 기능은 단계적으로 나누어 구현

이 계획을 통해 026번은 **1시간 내에 완료**할 수 있으면서도 Caret의 Account 시스템을 크게 개선할 수 있습니다~ ✨