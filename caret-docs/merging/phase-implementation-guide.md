# Phase별 구현 가이드

이 문서는 Caret 머징의 각 Phase별 상세 구현 단계와 실행 가이드를 제공합니다.

## 📋 **Phase 구성 개요**

| Phase | 이름 | 기간 | 복잡도 | 위험도 |
|-------|------|------|--------|--------|
| **Phase 1** | 기초 환경 구축 | 0.5일 | 🟢 LOW | 🟢 LOW |
| **Phase 2** | 기본 브랜딩 | 1일 | 🟢 LOW | 🟡 MEDIUM |
| **Phase 3** | 핵심 Caret 기능 | 3-4일 | 🚨 HIGH | 🚨 HIGH |
| **Phase 4** | 고급 기능 | 2일 | 🟡 MEDIUM | 🟢 LOW |
| **Phase 5** | 로깅 시스템 | 1일 | 🟢 LOW | 🟢 LOW |
| **Phase 6** | UI 및 다국어 | 2일 | 🟡 MEDIUM | 🟢 LOW |
| **Phase 7** | 최종 검증 | 1일 | 🟡 MEDIUM | 🟡 MEDIUM |

**총 예상 기간**: **10-12일**

---

## 🔧 **Phase 1: 기초 환경 구축**

### **목표**
Clean Cline v3.25.2 기반으로 안정적인 개발 환경 구축

### **작업 단계**

#### **1.1 환경 덮어쓰기**
```bash
# 현재 작업 디렉토리 백업
git stash push -m "Phase 1 시작 전 백업"
git tag "backup-before-phase-1-$(date +%Y%m%d-%H%M%S)"

# Cline v3.25.2 소스로 덮어쓰기
rsync -av --exclude='.git' cline-latest/ ./

# Git 상태 확인
git status
```

#### **1.2 빌드 환경 검증**
```bash
# Node.js 의존성 설치
npm install

# TypeScript 컴파일 테스트
npm run compile

# 웹뷰 빌드 테스트
npm run build:webview

# 린트 검사
npm run lint
```

#### **1.3 테스트 환경 확인**
```bash
# 테스트 실행 환경 확인
npm run test:backend

# 기본 Extension Host 테스트
# F5 키로 새 Extension Host 창 실행
# "Hello World" 명령 실행 확인
```

### **완료 기준**
- [ ] Clean Cline v3.25.2 소스 덮어쓰기 완료
- [ ] `npm run compile` 성공
- [ ] `npm run build:webview` 성공  
- [ ] `npm run lint` 오류 없음
- [ ] F5 Extension Host 정상 실행
- [ ] 테스트 환경 정상 동작

### **예상 문제 및 해결**
- **Node.js 버전 불일치**: nvm으로 올바른 버전 사용
- **의존성 충돌**: package-lock.json 삭제 후 재설치
- **권한 문제**: Windows에서 관리자 권한 실행

---

## 🏷️ **Phase 2: 기본 브랜딩**

### **목표**
Cline → Caret 기본 브랜딩 적용 및 규칙 파일 우선순위 시스템 구축

### **작업 단계**

#### **2.1 앱명 변경 (027-201)**
```bash
# 백업 생성
git stash push -m "Phase 2-1 시작: 앱명 변경"

# package.json 수정
sed -i 's/"name": "cline"/"name": "caret"/g' package.json
sed -i 's/"displayName": "Cline"/"displayName": "Caret"/g' package.json

# extension.ts 수정 (명령어 ID 변경)
# cline.* → caret.* 로 변경

# 빌드 및 테스트
npm run compile
npm run build:webview
```

#### **2.2 규칙 파일명 변경 (027-202)**

##### **🧪 TDD 1단계: 테스트 코드 작성**
```typescript
// caret-src/__tests__/rule-priority.test.ts 생성
describe('Rule Priority System', () => {
    test('should prioritize .caretrules over .clinerules', () => {
        // 테스트 로직 구현
    })
    
    test('should load .clinerules when .caretrules not exists', () => {
        // 테스트 로직 구현  
    })
    
    // ... 6개 테스트 케이스
})
```

##### **🔧 우선순위 로직 구현**
```bash
# 백업 생성
cp src/core/context/instructions/user-instructions/external-rules.ts \
   src/core/context/instructions/user-instructions/external-rules.ts.cline

# CARET MODIFICATION 적용
# 우선순위 로직: .caretrules > .clinerules > .cursorrules > .windsurfrules
```

##### **🧪 TDD 2단계: 테스트 검증**
```bash
# 테스트 실행
npm run test:backend -- rule-priority

# 커버리지 확인
npm run test:coverage -- rule-priority

# 통합 테스트
npm run compile
F5 Extension Host 테스트
```

### **완료 기준**
- [ ] 앱명 Cline → Caret 변경 완료
- [ ] 규칙 우선순위 시스템 100% 테스트 통과
- [ ] .caretrules 파일 우선 로딩 확인
- [ ] 기존 .clinerules 호환성 유지
- [ ] 브랜딩 변경 후 정상 빌드

---

## ⚡ **Phase 3: 핵심 Caret 기능**

### **목표**
Caret의 핵심 차별화 기능인 모드 시스템과 JSON 프롬프트 이식

### **⚠️ 중요 사항**
**이 Phase는 가장 복잡하고 위험도가 높습니다. 특히 Chatbot/Agent Mode는 아키텍처 정리가 우선 필요합니다.**

### **작업 단계**

#### **3.1 Chatbot/Agent Mode 시스템 (027-301)**

##### **🚨 사전 작업: 아키텍처 분석**
```bash
# 현재 복잡성 분석
find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "chatbot\|agent\|plan\|act" | head -20

# 의존성 매핑
node caret-scripts/analyze-mode-dependencies.js

# 복잡도 측정
wc -l src/core/task/index.ts  # 1700+ 라인 확인
```

##### **🛠️ 아키텍처 단순화 (권장)**
```typescript
// 새로운 파일: src/core/mode/mode-manager.ts 생성
export class ModeManager {
    private static modeMapping = {
        caret: { plan: "chatbot", act: "agent" },
        cline: { chatbot: "plan", agent: "act" }
    }
    
    static mapMode(from: string, toSystem: "caret" | "cline"): string {
        return this.modeMapping[toSystem][from] || from
    }
    
    static syncStates(newMode: string, system: string): void {
        // 중복 상태 관리 문제 해결
    }
}
```

##### **🧪 TDD 1단계: 통합 테스트 작성**
```typescript
// caret-src/__tests__/mode-system-integration.test.ts
describe('Mode System Integration', () => {
    test('Caret chatbot mode should map to Cline plan mode', () => {
        // 매핑 테스트
    })
    
    test('Mode toggle should sync all states', () => {
        // 상태 동기화 테스트
    })
    
    test('System prompt should change with mode system', () => {
        // 프롬프트 선택 테스트
    })
})
```

##### **🔧 점진적 이식**
```bash
# 1. 핵심 타입 정의 이식
cp caret-main/src/shared/ChatSettings.ts src/shared/

# 2. Proto 변환 로직 이식  
cp caret-main/src/shared/proto-conversions/state/chat-settings-conversion.ts \
   src/shared/proto-conversions/state/

# 3. 단순화된 모드 관리자 생성
# (위에서 설계한 ModeManager 구현)

# 4. 기존 복잡한 로직을 단순화된 로직으로 교체
# - ChatTextArea.tsx 모드 토글 로직
# - task/index.ts 모드 분기 로직
# - ExtensionStateContext.tsx 상태 관리
```

#### **3.2 JSON 시스템 프롬프트 (027-302)**

##### **🧪 TDD 1단계: JSON 프롬프트 테스트**
```typescript
// caret-src/core/prompts/__tests__/json-prompt-system.test.ts
describe('JSON System Prompt', () => {
    test('should load base JSON prompt correctly', () => {
        // JSON 로딩 테스트
    })
    
    test('should apply persona overrides', () => {
        // 페르소나 커스터마이징 테스트
    })
    
    test('should build text prompt from JSON', () => {
        // JSON → 텍스트 변환 테스트
    })
})
```

##### **🔧 JSON 프롬프트 시스템 이식**
```bash
# 1. JSON 프롬프트 파일들 이식
mkdir -p caret-src/core/prompts/json-system-prompts/mode-specific
cp -r caret-main/caret-src/core/prompts/json-system-prompts/* \
      caret-src/core/prompts/json-system-prompts/

# 2. 프롬프트 빌더 시스템 이식
cp caret-main/caret-src/core/prompts/prompt-builder.ts \
   caret-src/core/prompts/

# 3. 시스템 프롬프트 선택기 이식
cp caret-main/caret-src/core/prompts/system-prompt-selector.ts \
   caret-src/core/prompts/

# 4. task/index.ts에 extensionPath 조건부 분기 추가
```

### **완료 기준**
- [ ] 아키텍처 단순화 완료 (ModeManager 중앙화)
- [ ] Caret ↔ Cline 모드 시스템 seamless 전환
- [ ] 모든 모드 조합 정상 동작
- [ ] JSON 프롬프트 시스템 정상 동작
- [ ] 통합 테스트 100% 통과

### **⚠️ Phase 3 위험 관리**
- **복잡성 폭발**: 아키텍처 정리 없이 이식 금지
- **상태 불일치**: ModeManager로 중앙 관리 필수
- **프롬프트 충돌**: TRUE_CLINE vs CARET_JSON 분리 확인

---

## ✨ **Phase 4: 고급 기능**

### **목표**
페르소나 시스템과 계정 시스템 같은 고급 기능 이식

### **작업 단계**

#### **4.1 페르소나 템플릿 시스템 (027-401)**

##### **🧪 TDD 1단계: 페르소나 테스트**
```bash
# 테스트 이식
cp caret-main/webview-ui/src/caret/components/__tests__/PersonaManagement.test.tsx \
   webview-ui/src/caret/components/__tests__/

cp caret-main/caret-src/utils/__tests__/persona-initializer.test.ts \
   caret-src/utils/__tests__/
```

##### **🔧 페르소나 시스템 이식**
```bash
# 1. 페르소나 에셋 이식
cp -r caret-main/caret-assets/template_characters/ \
      caret-assets/template_characters/

# 2. 페르소나 초기화 로직 이식
cp caret-main/caret-src/utils/persona-initializer.ts \
   caret-src/utils/

# 3. UI 컴포넌트 이식
cp caret-main/webview-ui/src/caret/components/PersonaManagement.tsx \
   webview-ui/src/caret/components/
```

#### **4.2 계정 & 조직 시스템 (선택적)**
```bash
# HIGH 우선순위이지만 Phase 4에서 안정성 확인 후 이식
# Account 시스템은 완전 독립적이므로 충돌 위험 낮음

# 1. 백엔드 서비스 이식
mkdir -p src/services/account/
cp caret-main/src/services/account/CaretAccountService.ts \
   src/services/account/

# 2. 프론트엔드 UI 이식
cp -r caret-main/webview-ui/src/caret/components/CaretAccount* \
      webview-ui/src/caret/components/
```

### **완료 기준**
- [ ] 모든 페르소나 정상 로딩 및 선택 가능
- [ ] 페르소나별 AI 행동 변화 확인
- [ ] 계정 시스템 로그인/관리 정상 동작 (구현 시)
- [ ] 100% 테스트 커버리지 달성

---

## 📋 **Phase 5: 로깅 시스템**

### **목표**
통합 로깅 시스템으로 개발 및 디버깅 환경 강화

### **작업 단계**

#### **5.1 로깅 시스템 이식**
```bash
# 1. 백엔드 로거 이식
cp caret-main/caret-src/utils/caret-logger.ts \
   caret-src/utils/

# 2. 프론트엔드 로거 이식
cp caret-main/webview-ui/src/caret/utils/webview-logger.ts \
   webview-ui/src/caret/utils/

# 3. 테스트 이식
cp caret-main/webview-ui/src/caret/utils/__tests__/webview-logger.test.ts \
   webview-ui/src/caret/utils/__tests__/
```

#### **5.2 기존 시스템에 로깅 통합**
```typescript
// 주요 컴포넌트와 서비스에 로깅 추가
import { caretLogger } from "../../../caret-src/utils/caret-logger"
import CaretWebviewLogger from "@/caret/utils/webview-logger"

// 사용 예시
caretLogger.info("Controller initialized", "INIT")
logger.info("User clicked button")
```

### **완료 기준**
- [ ] 백엔드/프론트엔드 로깅 시스템 정상 동작
- [ ] 주요 기능에 적절한 로깅 추가
- [ ] 개발자 도구에서 로그 가독성 확인
- [ ] 100% 테스트 커버리지 달성

---

## 🌍 **Phase 6: UI 및 다국어**

### **목표**
다국어 지원과 Caret 브랜딩 UI 완성

### **작업 단계**

#### **6.1 다국어 i18n 시스템 (027-601)**

##### **🧪 TDD 1단계: i18n 테스트**
```bash
# i18n 테스트 이식
cp caret-main/webview-ui/src/caret/utils/__tests__/i18n.test.ts \
   webview-ui/src/caret/utils/__tests__/
```

##### **🔧 i18n 시스템 이식**
```bash
# 1. 언어 파일 이식 (30개 JSON)
cp -r caret-main/webview-ui/src/caret/locale/ \
      webview-ui/src/caret/locale/

# 2. i18n 유틸리티 이식
cp caret-main/webview-ui/src/caret/utils/i18n.ts \
   webview-ui/src/caret/utils/

# 3. 언어 설정 Hook 이식
cp caret-main/webview-ui/src/caret/hooks/useCurrentLanguage.ts \
   webview-ui/src/caret/hooks/

# 4. 언어 설정 UI 이식
cp caret-main/webview-ui/src/caret/components/CaretUILanguageSetting.tsx \
   webview-ui/src/caret/components/
```

#### **6.2 브랜딩 UI 이식 (027-602)**

##### **🔧 브랜딩 시스템 이식**
```bash
# 1. 브랜딩 에셋 이식
cp -r caret-main/caret-assets/ caret-assets/
cp -r caret-main/webview-ui/src/assets/ webview-ui/src/assets/

# 2. 스타일 시스템 이식
cp -r caret-main/webview-ui/src/caret/styles/ \
      webview-ui/src/caret/styles/

# 3. 브랜딩 컴포넌트 이식
cp caret-main/webview-ui/src/caret/components/CaretWelcome.tsx \
   webview-ui/src/caret/components/
```

### **완료 기준**
- [ ] 4개 언어 간 실시간 전환 동작
- [ ] 모든 UI 요소에서 번역 정상 표시
- [ ] Caret 브랜딩 컴포넌트 정상 렌더링
- [ ] 다크/라이트 모드 지원
- [ ] 100% UI 테스트 커버리지 달성

---

## 🚀 **Phase 7: 최종 검증**

### **목표**
전체 시스템 통합 검증 및 문서 완성

### **작업 단계**

#### **7.1 전체 기능 통합 테스트**
```bash
# 1. 모든 Caret 기능 동작 확인
npm run test:backend
npm run test:frontend
npm run test:integration

# 2. E2E 테스트
F5 Extension Host 실행
- 계정 로그인 테스트
- 페르소나 선택 테스트  
- 언어 변경 테스트
- 모드 전환 테스트
- AI 대화 테스트

# 3. 성능 테스트
npm run test:performance
```

#### **7.2 문서 업데이트**
```bash
# 1. 차별화 문서 최종 업데이트
# 모든 구현 상태를 "완성"으로 변경

# 2. 사용자 가이드 업데이트
# 새로운 기능들에 대한 사용법 추가

# 3. 개발자 문서 업데이트
# 아키텍처 변경사항 반영
```

#### **7.3 최종 빌드 및 패키지**
```bash
# 1. 프로덕션 빌드
npm run build:production

# 2. VSIX 패키지 생성
vsce package

# 3. 배포 준비
# 릴리스 노트 작성
# 변경 사항 문서화
```

### **완료 기준**
- [ ] 모든 Caret 기능 100% 동작
- [ ] 성능 저하 없음 (5% 이내)
- [ ] 메모리 사용량 증가 최소화 (10% 이내)
- [ ] 모든 문서 업데이트 완료
- [ ] VSIX 패키지 정상 생성

---

## 📊 **진행 상황 추적**

### **일일 체크리스트**
```markdown
## Day X Progress

### Completed
- [ ] Phase X.Y: [작업명]
- [ ] 테스트 통과: [테스트명]
- [ ] 문서 업데이트: [문서명]

### Issues
- Issue: [문제 설명]
- Solution: [해결 방법]
- Status: [해결/보류/에스컬레이션]

### Next Day Plan
- [ ] [다음 작업 1]
- [ ] [다음 작업 2]
```

### **Phase 완료 보고서**
```markdown
## Phase X Completion Report

### Summary
- Duration: X days
- Complexity: [실제 복잡도]
- Issues: X issues resolved

### Key Achievements
- [주요 성과 1]
- [주요 성과 2]

### Lessons Learned
- [배운 점 1]
- [배운 점 2]

### Recommendations for Next Phase
- [다음 Phase를 위한 권장사항]
```

---

**작성자**: Alpha (AI Assistant)  
**검토자**: Luke (Project Owner)  
**작성일**: 2025-08-16  
**마지막 업데이트**: 2025-08-16 17:55 KST  
**문서 유형**: Phase별 구현 가이드  
**적용 범위**: 027번 Clean Migration 전체 Phase
