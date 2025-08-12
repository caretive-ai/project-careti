# Task 026-3: caret.team 서버 API 요구사항 명세서 🚀

> **Target**: Caret Account 시스템 완전 구현을 위한 서버 API 개발 가이드  
> **Audience**: caret.team 서버 개발팀  
> **Priority**: HIGH - 026-1 클라이언트 구현 완료 후 서버 구현 필수  

## 📋 **개요**

Caret v0.1.1에서 **026-1 Account System 업그레이드**가 완료되었습니다. 클라이언트는 Cline v3.23.0과 100% 호환되는 고급 Account 기능을 지원하지만, **서버 API 구현이 필요**합니다.

### **현재 상태** ✅
- ✅ **클라이언트 구현 완료**: Proto, gRPC, UI 모든 구현 완료
- ✅ **Cline 호환성**: 100% 기능 호환 달성
- ❌ **서버 API**: caret.team 서버에서 새 API 구현 필요

### **구현 필요 API 목록**
1. **Enhanced Credits API** - 상세한 크레딧 정보
2. **Organizations API** - 조직 관리 기능  
3. **User Organizations API** - 사용자 조직 관리
4. **Auth State API** - 실시간 인증 상태

---

## 🔧 **API 상세 명세**

### **1. Enhanced User Credits API**

#### **GET `/api/auth/user/credits`**
기존 간단한 잔액 조회를 **상세한 크레딧 정보**로 확장

**Request Headers:**
```http
Authorization: Bearer {caretApiKey}
Content-Type: application/json
```

**Response Format:**
```typescript
interface UserCreditsData {
  balance: {
    currentBalance: number  // 현재 잔액 (달러 단위)
  }
  usageTransactions: UsageTransaction[]      // 사용 내역
  paymentTransactions: PaymentTransaction[]  // 결제 내역
}

interface UsageTransaction {
  ai_inference_provider_name: string  // "anthropic", "openai" 등
  ai_model_name: string              // "claude-3-5-sonnet", "gpt-4" 등  
  ai_model_type_name: string         // "chat", "completion" 등
  completion_tokens: number          // 응답 토큰 수
  cost_usd: number                  // USD 비용
  created_at: string                // ISO 8601 타임스탬프
  credits_used: number              // 사용된 크레딧
  generation_id: string             // 고유 생성 ID
  organization_id?: string          // 조직 ID (선택사항)
  prompt_tokens: number             // 프롬프트 토큰 수
  total_tokens: number              // 총 토큰 수
  user_id: string                   // 사용자 ID
}

interface PaymentTransaction {
  paid_at: string        // 결제 시각 (ISO 8601)
  creator_id: string     // 결제자 ID
  amount_cents: number   // 결제 금액 (센트 단위)
  credits: number        // 구매한 크레딧 수
}
```

**Sample Response:**
```json
{
  "balance": {
    "currentBalance": 75.50
  },
  "usageTransactions": [
    {
      "ai_inference_provider_name": "anthropic",
      "ai_model_name": "claude-3-5-sonnet-20241022",
      "ai_model_type_name": "chat",
      "completion_tokens": 500,
      "cost_usd": 2.50,
      "created_at": "2025-08-12T10:30:00Z",
      "credits_used": 2.50,
      "generation_id": "gen_abc123",
      "prompt_tokens": 200,
      "total_tokens": 700,
      "user_id": "user_xyz789"
    }
  ],
  "paymentTransactions": [
    {
      "paid_at": "2025-08-10T09:00:00Z",
      "creator_id": "user_xyz789",
      "amount_cents": 5000,
      "credits": 50.00
    }
  ]
}
```

---

### **2. User Organizations API**

#### **GET `/api/auth/user/organizations`**
사용자가 속한 조직 목록 조회

**Request Headers:**
```http
Authorization: Bearer {caretApiKey}
Content-Type: application/json
```

**Response Format:**
```typescript
interface UserOrganizationsResponse {
  organizations: UserOrganization[]
}

interface UserOrganization {
  active: boolean           // 현재 활성 조직 여부
  member_id: string        // 멤버십 ID
  name: string            // 조직 이름
  organization_id: string  // 조직 고유 ID
  roles: string[]         // ["owner", "admin", "member"]
}
```

**Sample Response:**
```json
{
  "organizations": [
    {
      "active": true,
      "member_id": "mem_abc123",
      "name": "Caret Development Team",
      "organization_id": "org_caret_dev",
      "roles": ["owner"]
    },
    {
      "active": false,
      "member_id": "mem_def456",
      "name": "AI Research Lab",
      "organization_id": "org_ai_lab",
      "roles": ["member"]
    }
  ]
}
```

---

### **3. Set User Organization API**

#### **POST `/api/auth/user/organization`**
활성 조직 변경

**Request Headers:**
```http
Authorization: Bearer {caretApiKey}
Content-Type: application/json
```

**Request Body:**
```typescript
interface UserOrganizationUpdateRequest {
  organization_id?: string  // null이면 개인 계정으로 변경
}
```

**Sample Request:**
```json
{
  "organization_id": "org_ai_lab"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization updated successfully"
}
```

---

### **4. Organization Credits API**

#### **GET `/api/auth/organization/{organizationId}/credits`**
조직 크레딧 정보 조회 (조직 멤버만 접근 가능)

**Request Headers:**
```http
Authorization: Bearer {caretApiKey}
Content-Type: application/json
```

**Response Format:**
```typescript
interface OrganizationCreditsData {
  balance: {
    currentBalance: number
  }
  usageTransactions: OrganizationUsageTransaction[]
}

interface OrganizationUsageTransaction {
  // UsageTransaction과 동일하지만 organization_id 필수
  ai_inference_provider_name: string
  ai_model_name: string
  ai_model_type_name: string
  completion_tokens: number
  cost_usd: number
  created_at: string
  credits_used: number
  generation_id: string
  organization_id: string  // 필수
  prompt_tokens: number
  total_tokens: number
  user_id: string         // 실제 사용자
}
```

---

### **5. Auth State API**

#### **GET `/api/auth/user/profile`**
현재 인증된 사용자 정보 (실시간 상태 확인용)

**Request Headers:**
```http
Authorization: Bearer {caretApiKey}
Content-Type: application/json
```

**Response Format:**
```typescript
interface AuthState {
  user?: UserInfo
}

interface UserInfo {
  uid: string                // 사용자 고유 ID
  display_name?: string      // 표시 이름
  email?: string            // 이메일
  photo_url?: string        // 프로필 사진 URL
  app_base_url?: string     // Caret 앱 베이스 URL
}
```

**Sample Response:**
```json
{
  "user": {
    "uid": "user_xyz789",
    "display_name": "Luke Yang",
    "email": "luke@caret.team",
    "photo_url": "https://avatar.caret.team/user_xyz789.jpg",
    "app_base_url": "https://app.caret.team"
  }
}
```

---

## 🔐 **인증 및 보안**

### **API 키 인증**
- 모든 API는 기존 `caretApiKey` 사용
- Header: `Authorization: Bearer {caretApiKey}`

### **권한 관리**
- **개인 데이터**: 본인만 접근 가능
- **조직 데이터**: 조직 멤버만 접근 가능  
- **역할 확인**: `roles` 배열로 권한 체크

### **에러 응답**
```json
{
  "error": "unauthorized",
  "message": "Invalid API key",
  "code": 401
}

{
  "error": "forbidden", 
  "message": "Not a member of this organization",
  "code": 403
}

{
  "error": "not_found",
  "message": "Organization not found", 
  "code": 404
}
```

---

## 🚀 **구현 우선순위**

### **Phase 1: 필수 API (HIGH Priority)**
1. ✅ **Enhanced Credits API** - 가장 중요한 기능
2. ✅ **Auth State API** - 실시간 상태 확인

### **Phase 2: 조직 기능 (MEDIUM Priority)**  
3. ✅ **User Organizations API** - 조직 목록
4. ✅ **Set User Organization API** - 조직 변경

### **Phase 3: 고급 기능 (LOW Priority)**
5. ✅ **Organization Credits API** - 조직 크레딧 (시간이 있으면)

---

## 📊 **데이터베이스 설계 제안**

### **새로 필요한 테이블들**

#### **`usage_transactions` 테이블**
```sql
CREATE TABLE usage_transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  organization_id VARCHAR(36) NULL,
  ai_inference_provider_name VARCHAR(50) NOT NULL,
  ai_model_name VARCHAR(100) NOT NULL,  
  ai_model_type_name VARCHAR(50) NOT NULL,
  prompt_tokens INT NOT NULL,
  completion_tokens INT NOT NULL,
  total_tokens INT NOT NULL,
  cost_usd DECIMAL(10,4) NOT NULL,
  credits_used DECIMAL(10,4) NOT NULL,
  generation_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_org_created (organization_id, created_at)
);
```

#### **`payment_transactions` 테이블**
```sql
CREATE TABLE payment_transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  creator_id VARCHAR(36) NOT NULL,
  amount_cents INT NOT NULL,
  credits DECIMAL(10,4) NOT NULL,
  paid_at TIMESTAMP NOT NULL,
  INDEX idx_user_paid (user_id, paid_at)
);
```

#### **`user_organizations` 테이블**
```sql
CREATE TABLE user_organizations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  member_id VARCHAR(36) NOT NULL,
  roles JSON NOT NULL, -- ["owner", "admin", "member"]
  active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_org (user_id, organization_id),
  INDEX idx_user_active (user_id, active)
);
```

#### **`organizations` 테이블**
```sql
CREATE TABLE organizations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);
```

---

## 🧪 **테스트 가이드**

### **API 테스트 시나리오**

#### **1. Credits API 테스트**
```bash
# 정상 케이스
curl -H "Authorization: Bearer valid_api_key" \
     https://api.caret.team/api/auth/user/credits

# 예상 응답: 200 OK with UserCreditsData
```

#### **2. Organizations API 테스트**  
```bash
# 조직이 있는 사용자
curl -H "Authorization: Bearer user_with_orgs_key" \
     https://api.caret.team/api/auth/user/organizations

# 조직이 없는 사용자
curl -H "Authorization: Bearer individual_user_key" \
     https://api.caret.team/api/auth/user/organizations
# 예상: {"organizations": []}
```

#### **3. Set Organization 테스트**
```bash
# 조직 변경
curl -X POST \
     -H "Authorization: Bearer valid_api_key" \
     -H "Content-Type: application/json" \
     -d '{"organization_id": "org_test"}' \
     https://api.caret.team/api/auth/user/organization

# 개인으로 변경  
curl -X POST \
     -H "Authorization: Bearer valid_api_key" \
     -H "Content-Type: application/json" \
     -d '{"organization_id": null}' \
     https://api.caret.team/api/auth/user/organization
```

### **클라이언트 테스트**
```bash
# Caret에서 새 기능 테스트
cd caret
npm run compile
# F5로 Extension 실행
# Account View에서 크레딧, 조직 정보 확인
```

---

## 📈 **예상 Impact**

### **사용자 경험 개선**
- 📊 **상세한 사용량 분석**: 토큰별, 모델별 사용 내역
- 💰 **투명한 비용 추적**: 실시간 크레딧 소모 현황
- 🏢 **조직 관리**: 팀 단위 크레딧 관리 및 사용량 분석

### **비즈니스 가치**
- 📈 **사용량 증가**: 투명한 비용으로 신뢰도 향상
- 🎯 **조직 고객 확보**: 팀/기업 고객 타겟팅 가능
- 🔍 **데이터 분석**: 사용 패턴 분석으로 제품 개선

---

## ⚠️ **주의사항**

### **API 호환성**
- 기존 API는 **절대 변경하지 말 것** (하위 호환성 유지)
- 새 API는 **추가만** 수행

### **성능 고려사항**
- `usage_transactions`는 대용량 데이터가 될 수 있음
- 페이지네이션 고려 (기본 최근 100개 제한)
- 적절한 인덱싱 필요

### **보안 고려사항**
- 조직 권한 검증 철저히 수행
- API 키 유효성 검증
- SQL Injection 방지

---

## 🎯 **완료 기준**

### **필수 조건**
- [ ] Enhanced Credits API 구현 및 테스트
- [ ] Organizations API 구현 및 테스트  
- [ ] Set Organization API 구현 및 테스트
- [ ] Auth State API 구현 및 테스트
- [ ] Caret 클라이언트와 연동 테스트 완료

### **선택 조건** 
- [ ] Organization Credits API 구현
- [ ] 페이지네이션 적용
- [ ] API 문서화 (Swagger)
- [ ] 모니터링 및 로깅 설정

---

**작성자**: Alpha Yang (AI Assistant)  
**검토자**: Luke Yang (Project Owner)  
**작성일**: 2025-08-12  
**클라이언트 버전**: Caret v0.1.1 (026-1 완료)  
**서버 타겟**: caret.team API v2  

### **연락처**
**개발 문의**: 서버팀 → Luke Yang  
**API 테스트**: Caret 클라이언트와 실시간 연동 테스트 필요  
**우선순위**: HIGH - 클라이언트 완성, 서버 구현만 남음 ✨
