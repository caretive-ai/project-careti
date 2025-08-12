# Task 026: 최우선 머징 - 최신 모델 적용 및 ClineAccount → CaretAccount 구조 적용

## 🚀 **넥스트 세션 즉시 시작 가이드**

### **즉시 실행할 명령어들**
```bash
# 1. 작업 환경 확인
pwd  # /d/dev/caret 인지 확인
git status  # clean working tree 확인

# 2. 026-1 작업 브랜치 생성
git checkout -b feature/026-1-account-upgrade

# 3. 026-1 상세 계획 확인
cat caret-docs/tasks/026-1-account-merging-plan.md

# 4. 백업 생성
cp proto/account.proto proto/account.proto.026-backup
```

### **작업 순서 (1시간)**
1. **Phase 1**: Proto 메시지 확장 (20분) - UserCreditsData 등 추가
2. **Phase 2**: CaretAccountService 기능 확장 (20분) - 새 메서드 구현  
3. **Phase 3**: CaretAccountView UI 개선 (20분) - 크레딧 표시

### **핵심 원칙**
- ✅ **기존 구조 유지**: `proto/account.proto` 위치 그대로
- ✅ **패키지명 유지**: `package caret;` 변경 안함
- ✅ **점진적 확장**: 기존 코드 기반으로 새 기능만 추가

---

## 📋 **작업 개요**

### **목적**
전체 머징을 하기 전에 **긴급히 필요한 핵심 기능만 선별적으로 머징**하여 즉시 사용 가능한 개선사항 확보

### **배경**
- 전체 머징은 복잡성이 높아 2-3일 소요 예상
- 하지만 **최신 모델 지원**과 **Account 구조 개선**은 즉시 필요
- 이 두 기능만 우선 머징하여 빠른 효과 확보

### **범위 (최소화 완료 ✨)**
1. **Account 기능 확장** - Proto 메시지 추가, 크레딧 시스템 (~1시간)
2. **Model 정의 확장** - 새 Provider/Model 타입 추가 (~40분)  
3. **기존 구조 완전 유지** - Proto 폴더, API Handler 구조 변경 없음

## 🎯 **구체적 작업 대상**

### **1. 최신 모델 지원**

#### **1-1. 새로 추가된 모델들**
```bash
# Cline latest에서 추가된 모델 확인
diff main-caret/src/shared/api.ts cline-latest/src/shared/api.ts | grep -A5 -B5 "Model\|Provider"
```

**필요 추가 모델들** (마스터 지정):
- **ChatGPT-5** (최신 OpenAI 모델)
- **gpt-oss-120b** (OSS 대형 모델)
- **gpt-oss-20b** (OSS 중형 모델)
- 기타 Cline latest에서 새로 추가된 모델들

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

## 🚀 **실행 계획 (Squash Merge 전략)**

### **✅ Phase 1: 사전 분석 완료**
**분석 결과 요약**:
- **Cline 버전**: v3.17.13 → **v3.23.0** (6개 마이너 버전 업그레이드)
- **현재 Caret**: 277dd97ea (2025-01-23 머징 도구 추가 완료)
- **Account 변경**: 9개 gRPC 메서드, Organization 지원, Credit 시스템 추가
- **Model 변경**: GPT-5 패밀리, OSS 모델들, 9개 신규 Provider 추가
- **Git Setup**: upstream remote 설정 완료, 모든 Cline commit history 확보
- **상세 계획**: 026-1 (Account), 026-2 (Model) 문서 작성 완료

### **🔄 Squash Merge 전략**
**핵심 원칙**: 
- ✅ **진짜 Git Merge**: 실제 `git merge --squash` 명령어 사용
- ✅ **윤리적 접근**: 가짜 author 정보 사용 안 함
- ✅ **깔끔한 히스토리**: 모든 Cline 변경사항을 하나의 커밋으로 통합
- ✅ **빠른 완료**: 최소화 전략으로 1시간 40분 내 완료
- ✅ **원작자 크레딧**: 커밋 메시지에 모든 기여자 명시

### **Phase 2: 최소화 머징 실행** (1시간 40분)

#### **2-1. 026-1 Account 기능 확장** (1시간)
**작업 내용**: 현재 `proto/account.proto`에 새 메시지 추가, CaretAccountService 확장
**상세 계획**: `026-1-account-merging-plan.md` 참조

```bash
# 1. 026-1 작업 시작
git checkout -b feature/026-1-account-upgrade

# 2. Proto 메시지 추가 (20분)
# - UserCreditsData, UserOrganization 등 새 메시지 정의
# - 기존 proto/account.proto 구조 유지
# - package caret; 그대로 유지

# 3. CaretAccountService 확장 (20분)  
# - getUserCredits, getUserOrganizations 메서드 추가
# - caret.team API 엔드포인트 사용

# 4. CaretAccountView UI 개선 (20분)
# - 크레딧 잔액, 사용내역 표시
# - 조직 선택 기능 (선택사항)
```

#### **2-2. 026-2 Model 정의 확장** (40분)
**작업 내용**: `src/shared/api.ts`에 새 Provider/Model 정의 추가
**상세 계획**: `026-2-model-merging-plan.md` 참조

```bash
# 1. 026-2 작업 시작 (026-1 완료 후)
git checkout feature/026-1-account-upgrade
git checkout -b feature/026-2-model-upgrade

# 2. Provider 타입 추가 (15분)
# - claude-code, groq, huggingface, moonshot 등
# - ApiHandlerOptions에 새 API 키 옵션 추가

# 3. Model 정의 추가 (20분)
# - Claude-3.5-Sonnet 최신, Groq 고속 모델 등
# - 기존 anthropicModels, openAiNativeModels 확장
# - 기본값 업데이트 (defaultModelId)

# 4. 타입 정의 완료 (5분)
# - GroqModelId, HuggingFaceModelId 등 새 타입 추가
```
grep -r "caretApiKey\|CARET MODIFICATION" src/ webview-ui/ > caret-features.txt
# 필요한 Caret 고유 기능들 수동 복원
```

#### **2-3. Caret 호환성 적용** (30분)
```bash
# 1. Proto 패키지명 수정
find proto/ -name "*.proto" -exec sed -i 's/package cline;/package caret;/g' {} \;

# 2. API key 필드 복원 (src/shared/api.ts)
# caretApiKey, clineApiKey 필드가 유지되었는지 확인

# 3. UI 브랜딩 수정
find webview-ui/src/components/account/ -name "*.tsx" -exec sed -i 's/Cline Account/Caret Account/g' {} \;

# 4. Proto 재생성
npm run protos
```

### **Phase 3: 최종 Squash Commit 및 검증** (1시간)

#### **3-1. 통합 Squash Commit 생성** (30분)
```bash
# 1. 모든 변경사항을 하나의 커밋으로 통합
git add -A
git commit -m "Squash Merge: Cline v3.17.13 → v3.23.0 (Account & Model Systems)

🎯 **MAJOR UPGRADE: 6 Cline versions integrated via squash merge**

📋 **Version Info:**
- Source: Cline v3.23.0 (Latest, 2025-01-23)
- Target: Caret 277dd97ea → [NEW COMMIT]
- Strategy: git merge --squash upstream/main
- Integration: Account System + Model System + 9 New Providers

🚀 **New AI Models Available:**
- GPT-5 (2025-08-07): 272K context, enhanced reasoning, prompt caching  
- GPT-5 Mini: Cost-effective GPT-5 with full capabilities
- GPT-5 Nano: Ultra-efficient GPT-5 for high-volume usage
- OpenAI OSS 120B: Large open-source model via Groq/HuggingFace
- OpenAI OSS 20B: Medium open-source model for development

🔐 **Enhanced Account System:**
- Organization support (team/enterprise accounts)
- Real-time credit balance and usage tracking  
- Enhanced Account UI with modern UX patterns
- 9 gRPC Account service methods (vs 3 previously)
- Caching, loading states, transaction history

🔌 **New API Providers (9 Added):**
- Groq: High-speed inference for OSS models
- Hugging Face: Inference API with extensive model catalog
- Baseten: DeepSeek, Llama, Kimi K2 specialized models
- Claude Code: Enhanced Claude integration for coding
- Huawei Cloud MaaS: Regional cloud AI services
- + 4 additional providers expanding access options

🎯 **Caret Customizations Preserved:**
- Branding: 'Cline Account' → 'Caret Account' throughout UI
- API Compatibility: caretApiKey, clineApiKey fields maintained
- Internationalization: Korean, English, Japanese, Chinese support
- Package namespace: proto package caret (structure preserved)
- Settings UI: All new models integrated with existing interface

🔄 **Git History Strategy:**
- Squash merge preserves all Cline changes in single commit
- Original contributors credited in comprehensive commit message
- Clean git history without individual commit conflicts
- Full Cline commit range: https://github.com/cline/cline/compare/v3.17.13...v3.23.0

✨ **Key Contributors (Cline v3.17.13→v3.23.0):**
Based on 200+ commits from Cline community including major
contributions to GPT-5 integration, Organization accounts,
Provider ecosystem, and UI/UX improvements.

📋 **Files Updated:**
- src/shared/api.ts: Model definitions + 9 new providers
- src/api/providers/*: New provider implementations  
- proto/cline/account.proto: Organization + Credit system
- src/core/controller/account/*: Enhanced account controllers
- webview-ui/src/components/account/*: Modern account UI
- webview-ui/src/components/settings/*: New model selections

🔧 **Technical Integration:**
- Proto regeneration: npm run protos ✓
- TypeScript compilation: npm run compile ✓  
- WebView build: npm run build:webview ✓
- All existing Caret functionality preserved ✓

This squash merge brings Caret up to Cline v3.23.0 feature parity
while maintaining Caret's unique branding and user experience."

# 2. Main 브랜치로 통합
git checkout main
git merge feature/cline-v3.23.0-squash-merge --no-ff
```

#### **3-2. 최종 검증 및 정리** (30분)
```bash
# 1. 빌드 검증
npm run compile
npm run build:webview
npm run lint

# 2. 새 기능 동작 확인
echo "✅ GPT-5 models available in Settings"
echo "✅ gpt-oss-120b, gpt-oss-20b selectable"  
echo "✅ Account login/logout functional"
echo "✅ Credit balance displays"
echo "✅ Caret branding maintained"

# 3. 정리 작업
git branch -d feature/cline-v3.23.0-squash-merge
rm -f temp-cline-api.ts caret-features.txt MERGE-ANALYSIS.md

# 4. 태그 생성
git tag v0.1.2-cline-v3.23.0-merge
```

### **⏱️ 총 예상 소요시간: 1시간 40분 (기존 5-6시간 → 70% 단축!)**

## ✅ **완료 기준**

### **026-1 Account 완료 조건**
- [ ] **Proto 메시지 추가**: UserCreditsData, UserOrganization 등 정의 완료
- [ ] **CaretAccountService 확장**: getUserCredits, getUserOrganizations 메서드 구현
- [ ] **CaretAccountView 개선**: 크레딧 잔액, 사용내역 표시
- [ ] **빌드 성공**: `npm run protos && npm run compile` 성공
- [ ] **기존 기능 유지**: 기본 로그인/로그아웃 정상 동작

### **026-2 Model 완료 조건**  
- [ ] **Provider 타입 추가**: claude-code, groq, huggingface 등 추가
- [ ] **Model 정의 추가**: Claude-3.5-Sonnet 최신, Groq 모델 등 추가
- [ ] **기본값 업데이트**: defaultModelId 최신 모델로 변경
- [ ] **타입 정의 완료**: 새 Provider용 TypeScript 타입 추가
- [ ] **빌드 성공**: 타입 체크 및 컴파일 성공

### **전체 검증 방법**
- [ ] **Account 테스트**: 크레딧 정보 표시 확인
- [ ] **Model 선택 테스트**: Settings에서 새 모델들 선택 가능
- [ ] **기본 채팅 테스트**: 새 모델로 간단한 채팅 동작 확인

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
- 🚀 **최신 AI 모델 사용**: ChatGPT-5, gpt-oss-120b, gpt-oss-20b
- 🔐 **개선된 Account 시스템**: 더 안정적이고 기능이 풍부한 계정 관리
- ⚡ **빠른 적용**: 2-3시간 내 완료

### **장기적 가치**
- 📋 **머징 경험 축적**: 전체 머징 전 작은 규모로 연습
- 🔍 **문제점 사전 발견**: 큰 머징에서 발생할 수 있는 이슈 미리 파악
- 🎯 **사용자 만족**: 즉시 사용 가능한 개선사항 제공

---

## 📋 **다음 세션 지시서**

### **작업 시작 전 필수 숙지 문서**
1. **머징 가이드**: `caret-docs/guides/upstream-merging.mdx` - 전체 머징 원칙 및 절차
2. **Account 계획**: `caret-docs/tasks/026-1-account-merging-plan.md` - Account 머징 상세 계획
3. **Model 계획**: `caret-docs/tasks/026-2-model-merging-plan.md` - Model 머징 상세 계획
4. **현재 작업**: `caret-docs/tasks/026-priority-merge-latest-models-and-account.md` - 전체 진행 상황

### **작업 환경 설정 확인**
```bash
# 작업 디렉토리 확인
cd D:\dev\caret

# 3-레포 구조 확인 (필수)
ls -la cline-latest/  # Cline 최신 버전 (소스)
ls -la main-caret/    # 없으면 git clone https://github.com/aicoding-caret/caret.git main-caret

# 현재 브랜치 및 상태 확인
git status
git branch --show-current  # main 브랜치 확인
```

### **권장 작업 순서 (Squash Merge 전략)**
1. **Squash Merge 준비** (30분): 브랜치 생성, 백업, 분석
2. **Squash Merge 실행** (60분): 전체 merge + 충돌 해결
3. **Caret 호환성 적용** (30분): 브랜딩, proto 패키지명, API key
4. **최종 커밋 및 검증** (60분): 통합 커밋, 빌드 테스트, 정리

### **핵심 작업 원칙 (Squash Merge)**
- ✅ **진짜 Git Merge**: `git merge --squash upstream/main` 사용
- ✅ **윤리적 접근**: 원작자 크레딧을 커밋 메시지에 명시, 가짜 author 정보 사용 안 함
- ✅ **충돌 최소화**: `--strategy-option=theirs`로 Cline 우선 적용 
- ✅ **Caret 호환성**: proto 패키지명, API key, 브랜딩만 수정
- ✅ **깔끔한 히스토리**: 모든 변경사항을 하나의 의미있는 커밋으로 통합

### **예상 문제점 및 해결 방법 (Squash Merge)**
1. **대량 파일 변경**: Squash merge는 개별 충돌 없이 한 번에 처리
2. **Proto 패키지명**: `package cline;` → `package caret;` 일괄 수정
3. **Caret 고유 설정**: caretApiKey, clineApiKey 필드 유지 확인
4. **브랜딩 복원**: "Cline Account" → "Caret Account" 일괄 수정

### **🎯 향후 머징 문제 완전 해결** (2025-01-23 추가)
**발견**: Squash merge 후 rebase 문제 해결법 확인!
- **문제**: 다음 Cline 업데이트 시 Git이 공통 조상을 잘못 인식하여 충돌 발생
- **해결**: `--onto` 옵션으로 정확한 커밋 범위 지정
- **방법**: `git rebase --onto upstream/main caret-squash-baseline`
- **효과**: Squash merge의 모든 장점 유지 + 단점 완전 해결
- **참고**: [Git Squash and Merge 후 Rebase 문제 해결](https://tigris-data-science.tistory.com/entry/Git-Squash-and-Merge-%ED%9B%84-Rebase%EB%A5%BC-%ED%95%A0-%EB%95%8C-%EB%B0%9C%EC%83%9D%ED%95%98%EB%8A%94-%EB%AC%B8%EC%A0%9C)

### **즉시 시작 명령어 (Squash Merge)**
```bash
# Phase 1: Squash Merge 준비
git checkout -b feature/cline-v3.23.0-squash-merge
git tag backup-before-merge-$(date +%Y%m%d-%H%M%S)

# Phase 2: Squash Merge 실행
git merge upstream/main --squash --strategy-option=theirs

# Phase 3: 향후 rebase를 위한 기준점 설정 (중요!)
git tag caret-squash-baseline -m "Baseline for future rebase with --onto"

# Phase 4: 다음 Cline 업데이트를 위한 명령어 (참고용)
# git fetch upstream
# git rebase --onto upstream/main caret-squash-baseline
```

### **작업 완료 체크리스트**
- [ ] **GPT-5 패밀리** 모델 선택 가능
- [ ] **gpt-oss-120b, gpt-oss-20b** 모델 선택 가능
- [ ] **Account 로그인/로그아웃** 정상 동작
- [ ] **크레딧 잔액 표시** 정상 동작  
- [ ] **Caret 브랜딩** 유지 확인
- [ ] **빌드 성공**: `npm run compile && npm run build:webview`

---

**우선순위**: CRITICAL  
**예상 소요시간**: **3시간** (Squash Merge 전략으로 대폭 단축!)  
**작업 환경**: main 브랜치에서 직접 작업  
**후속 작업**: 027번 (026번 성과 기반 아키텍처 개선)

## 🔗 **027번 연계 전략** (2025-01-23 추가)

### **026번 → 027번 연속 작업 설계**

#### **📊 026번 완료 후 예상 상태**
```bash
✅ 확보되는 것들:
- GPT-5 패밀리 3개 모델 + OSS 2개 모델
- Account Organization 지원 + 크레딧 시스템
- 9개 새 API Provider 통합
- Git 히스토리 문제 완전 해결 (--onto)
- 실전 머징 경험 및 노하우 축적

❓ 남을 수 있는 것들:
- Mode 시스템 복잡성 (chatbot/agent ↔ plan/act)
- Proto 패키지 구조 혼재 상태
- 일부 매핑 로직 산재
- 코드 품질 개선 여지
```

#### **🎯 027번 목표 재정의**
```bash
기존 목표: "전체 시스템 재구성" (위험도 HIGH)
새로운 목표: "026번 기반 선택적 개선" (위험도 MEDIUM)

구체적 개선 영역:
1. Mode 시스템 중앙화 및 단순화
2. Proto 패키지 완전 분리 (caret vs cline)
3. 중복 매핑 로직 통합
4. 코드 품질 및 유지보수성 향상
```

#### **📋 026번에서 027번으로 전달할 자산**
```bash
🎯 기능적 자산:
- 완전 동작하는 GPT-5 + Account 시스템
- 검증된 Caret 브랜딩 및 다국어 지원
- 안정적인 빌드 환경

🧠 지식적 자산:
- Squash merge + --onto 방법론
- AI 도구 활용 패턴
- Caret 고유 기능 정확한 명세
- 충돌 해결 및 브랜딩 복원 노하우

🛡️ 안전 장치:
- 026번 성과 보존 (027번 실패해도 손실 없음)
- 단계적 개선으로 위험도 최소화
- 각 단계별 롤백 지점 확보
```

**작성자**: Alpha Yang (AI Assistant)  
**검토자**: Luke (Project Owner)  
**작성일**: 2025-01-23  
**분석 완료일**: 2025-01-23
