# Task 026: 최우선 머징 - 최신 모델 적용 및 ClineAccount → CaretAccount 구조 적용

## 📋 **작업 개요**

### **목적**
전체 머징을 하기 전에 **긴급히 필요한 핵심 기능만 선별적으로 머징**하여 즉시 사용 가능한 개선사항 확보

### **배경**
- 전체 머징은 복잡성이 높아 2-3일 소요 예상
- 하지만 **최신 모델 지원**과 **Account 구조 개선**은 즉시 필요
- 이 두 기능만 우선 머징하여 빠른 효과 확보

### **범위 (최소한만)**
1. **최신 AI 모델 지원 추가**
2. **ClineAccount 구조를 CaretAccount에 적용**
3. **관련 필수 의존성만 최소한으로 머징**

## 🎯 **구체적 작업 대상**

### **1. 최신 모델 지원**

#### **1-1. 새로 추가된 모델들**
```bash
# Cline latest에서 추가된 모델 확인
diff main-caret/src/shared/api.ts cline-latest/src/shared/api.ts | grep -A5 -B5 "Model\|Provider"
```

**예상 추가 모델들**:
- Claude 3.5 Sonnet (최신 버전)
- GPT-4o (최신)
- Gemini Pro 2.0
- 기타 새로운 Provider

#### **1-2. 머징 대상 파일들**
- `src/shared/api.ts` (새 모델 정의)
- `src/api/providers/` (새 Provider 구현)
- `webview-ui/src/components/settings/` (UI에서 새 모델 선택)
- `src/shared/ModelInfo.ts` (모델 메타데이터)

### **2. ClineAccount → CaretAccount 구조 적용**

#### **2-1. Account 시스템 개선사항**
```bash
# Account 관련 변경사항 확인
diff -r main-caret/src/services/account/ cline-latest/src/services/account/
diff main-caret/webview-ui/src/components/account/ cline-latest/webview-ui/src/components/account/
```

**예상 개선사항들**:
- Account 인증 플로우 개선
- 사용자 정보 관리 구조 개선
- 보안 강화
- UI/UX 개선

#### **2-2. 머징 대상 파일들**
- `src/services/account/` (백엔드 Account 서비스)
- `webview-ui/src/components/account/` (Account UI)
- `src/shared/AccountInfo.ts` (Account 타입 정의)
- `proto/cline/account.proto` (Account Proto 정의)

### **3. 필수 의존성 (최소한만)**
- Account와 Model이 의존하는 최소한의 공통 코드만
- **Proto 정의 최소 변경**
- **공통 유틸리티 필수 부분만**

## 🚀 **실행 계획**

### **Phase 1: 사전 분석** (30분)
```bash
# 1. 정확한 변경사항 파악
cd /d/dev/caret
git fetch upstream
git log --oneline main..upstream/main | grep -i "model\|account" | head -20

# 2. 파일별 차이 분석
diff main-caret/src/shared/api.ts cline-latest/src/shared/api.ts > model-changes.diff
diff -r main-caret/src/services/account/ cline-latest/src/services/account/ > account-changes.diff

# 3. 최소 의존성 파악
grep -r "import.*account\|import.*model" cline-latest/src/ | grep -v node_modules
```

### **Phase 2: 선택적 파일 머징** (1-2시간)
```bash
# 1. 모델 관련 파일 우선 머징
git checkout upstream/main -- src/shared/api.ts
git checkout upstream/main -- src/api/providers/

# 2. Account 관련 파일 머징
git checkout upstream/main -- src/services/account/
git checkout upstream/main -- webview-ui/src/components/account/

# 3. 관련 Proto 최소 변경
git checkout upstream/main -- proto/cline/account.proto
npm run protos
```

### **Phase 3: Caret 브랜딩 복원** (30분)
```typescript
// Account UI에서 Caret 브랜딩 복원
// "Cline Account" → "Caret Account" 변경
// Caret 로고 및 색상 적용
```

### **Phase 4: 즉시 검증** (30분)
```bash
# 1. 컴파일 확인
npm run compile

# 2. 새 모델 동작 확인
# Settings에서 새 모델 선택 가능한지 확인

# 3. Account 기능 확인
# Account 로그인/로그아웃 정상 동작 확인
```

## ✅ **완료 기준**

### **필수 조건**
- [ ] 새로 추가된 AI 모델들이 Settings에서 선택 가능
- [ ] 선택한 새 모델로 정상 대화 가능
- [ ] Account 로그인/로그아웃 정상 동작
- [ ] Caret 브랜딩 유지 (로고, 이름 등)
- [ ] `npm run compile` 성공
- [ ] `npm run build:webview` 성공

### **선택 조건**
- [ ] 기존 Caret 고유 기능들 정상 동작 (Rule Priority, 다국어 등)
- [ ] 전체 테스트 통과

## 🚨 **주의사항**

### **하지 말아야 할 것들**
- ❌ 전체 머징 시도 (복잡성 폭발)
- ❌ Mode 시스템 건드리기 (아직 시기상조)
- ❌ Proto 구조 대대적 변경
- ❌ WebView 전체 구조 변경

### **원칙**
- ✅ **최소한만**: Model + Account + 필수 의존성만
- ✅ **빠른 검증**: 각 단계마다 즉시 테스트
- ✅ **안전한 롤백**: 문제 시 즉시 되돌리기
- ✅ **Caret 정체성 유지**: 브랜딩 요소 보존

## 📈 **예상 효과**

### **즉시 얻을 수 있는 것들**
- 🚀 **최신 AI 모델 사용**: Claude 3.5 Sonnet, GPT-4o 등
- 🔐 **개선된 Account 시스템**: 더 안정적이고 기능이 풍부한 계정 관리
- ⚡ **빠른 적용**: 2-3시간 내 완료

### **장기적 가치**
- 📋 **머징 경험 축적**: 전체 머징 전 작은 규모로 연습
- 🔍 **문제점 사전 발견**: 큰 머징에서 발생할 수 있는 이슈 미리 파악
- 🎯 **사용자 만족**: 즉시 사용 가능한 개선사항 제공

---

**우선순위**: CRITICAL  
**예상 소요시간**: 2-3시간  
**작업 환경**: main 브랜치에서 직접 작업  
**후속 작업**: 027번 (새 브랜치에서 전체 머징)

**작성자**: Alpha (AI Assistant)  
**검토자**: Luke (Project Owner)  
**작성일**: 2025-01-23
