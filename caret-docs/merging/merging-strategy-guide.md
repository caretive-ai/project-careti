# Caret 머징 전략 가이드

이 문서는 Caret 기능들을 Cline 기반 시스템으로 머징하는 포괄적인 전략과 실행 가이드를 제공합니다.

## 🎯 **머징 목표**

### **핵심 목표**
**Cline 소스코드와 최소한의 겹침으로 독립적인 Caret 구조 달성**

- **Cline 코드 보존**: 원본 최소 수정으로 호환성 유지
- **독립적 Caret 모듈**: `caret-src/`, `assets/` 중심의 분리된 구조
- **간편한 향후 업데이트**: Cline 새 버전을 쉽게 머징할 수 있는 구조
- **충돌 최소화**: 머징 시 충돌 포인트 최소화

### **성공 기준**
- [ ] **90% 이상 독립성**: Caret 기능의 90% 이상이 Cline 코드 수정 없이 동작
- [ ] **Cline 호환성**: 기존 Cline 사용자 워크플로우 100% 보존
- [ ] **안전한 롤백**: 문제 시 Cline 원본 상태로 즉시 복원 가능
- [ ] **미래 호환성**: 새로운 Cline 버전과 자동 머징 가능

## 📊 **머징 우선순위 매트릭스**

### **✅ 완료된 기능**
| 기능 | 상태 | v3.26.6 머지 결과 |
|------|------|------------------|
| **Rule Priority System** | ✅ **완료** | 성공적 보존 (.caretrules 우선순위) |
| **Persona System** | ✅ **완료** | 상태 키 및 설정 보존 |
| **브랜딩 시스템** | ✅ **완료** | 무충돌 완료 |
| **기본 아키텍처** | ✅ **완료** | Wrapper 패턴 유지 |

### **🎯 다음 우선순위 (Handler 아키텍처 기반)**
| 기능 | 이유 | 난이도 | v3.26.6 혜택 |
|------|------|--------|---------------|
| **Handler 아키텍처 전환** | 🚨 **CRITICAL** | 중간 | 최신 시스템 프롬프트 활용 |
| **Agent/Chatbot Mode 재구현** | 핵심 차별화 기능 | 높음 | 최신 PlanModeHandler 기반 |
| **Account & Organization** | 비즈니스 로직 | 낮음 | 최신 Auth 시스템 활용 |
| **다국어 i18n (30 파일)** | 사용자 경험 핵심 | 중간 | 최신 UI 컴포넌트 활용 |

### **MEDIUM 우선순위 (안정성 확인 후)**
| 기능 | 이유 | 충돌 위험 | 이식 복잡도 |
|------|------|-----------|-------------|
| **JSON System Prompt** | Caret 모드 핵심 | 🟡 MEDIUM | 중간 |
| **Persona System** | 차별화 기능 | 🟢 LOW | 낮음 |
| **브랜딩 & UI** | 시각적 정체성 | 🟢 LOW | 낮음 |

## 🏗️ **아키텍처 전략**

### **Caret 전용 gRPC 서비스 원칙 (Backend ↔ Webview 통신)**
> **CRITICAL**: `cline`의 원본 `proto` 파일은 절대 수정하지 않습니다. Caret 고유의 통신은 반드시 별도의 `proto` 파일을 생성하여 독립적인 gRPC 서비스를 구현합니다.

**필수 구현 절차:**
1.  **`proto/caret/` 디렉토리 생성**: Caret 전용 `.proto` 파일을 위한 네임스페이스를 확보합니다.
2.  **신규 `.proto` 파일 정의**: `proto/caret/persona.proto`와 같이 기능별로 파일을 분리하여 `service`와 `message`를 정의합니다.
3.  **독립 서비스 구현**: `caret-src` 내에 해당 서비스의 gRPC 핸들러(`controller`)를 구현합니다.
4.  **`extension.ts`에 등록**: `activate` 함수에서 `cline`의 `UiService`와는 별개로, 새로 만든 Caret 전용 서비스를 gRPC 서버에 등록합니다.
5.  **웹뷰 클라이언트 사용**: 웹뷰에서는 해당 서비스의 gRPC 클라이언트를 사용하여 백엔드와 통신합니다.

**기대 효과**:
-   **독립성**: `cline`의 통신 규약을 전혀 건드리지 않으므로 향후 `cline` 업데이트 시 발생할 수 있는 충돌을 원천적으로 방지합니다.
-   **명확성**: Caret 고유의 API가 명확하게 분리되어 코드 이해도와 유지보수성이 향상됩니다.

### **웹뷰-백엔드 타입 공유 원칙 (tsconfig)**
> **CRITICAL**: 웹뷰(`webview-ui`)가 백엔드(`src`, `caret-src`)의 소스 코드를 직접 참조하는 것은 금지됩니다. 타입 정보 공유는 반드시 `src/shared` 디렉토리를 통해서만 이루어져야 합니다.

**`webview-ui/tsconfig.app.json` 설정 규칙:**
1.  **`@shared` 경로 별칭 사용**: 백엔드와 공통으로 사용하는 타입 정의(gRPC 생성 타입 포함)는 반드시 `@shared/*": ["../src/shared/*"]` 경로 별칭을 통해 참조합니다.
2.  **백엔드 경로 직접 참조 금지**: `@/`, `@caret/*` 등 백엔드의 소스 디렉토리를 직접 가리키는 경로 별칭을 추가해서는 안 됩니다. 이는 프론트엔드와 백엔드 간의 의존성을 높여 예기치 않은 빌드 오류를 유발할 수 있습니다.
3.  **`cline` 표준 준수**: `tsconfig.app.json` 파일의 전체적인 구조와 설정은 항상 `cline-latest`의 설정을 기준으로 유지합니다.

**기대 효과**:
- **명확한 의존성**: 프론트엔드와 백엔드 간의 의존성이 `src/shared`로 단일화되어 코드 구조가 명확해집니다.
- **빌드 안정성**: 불필요한 의존성을 제거하여 웹뷰 빌드의 안정성을 높이고 잠재적인 오류를 방지합니다.

### **독립성 우선 원칙**

#### **🎯 Level 1: 완전 독립 모듈 (권장)**
```
caret-src/           # Caret 전용 로직
assets/        # Caret 전용 리소스
webview-ui/src/caret/ # Caret 전용 UI
```
- **장점**: Cline 코드와 완전 분리, 충돌 없음
- **적용**: Account, i18n, 로깅, 브랜딩, Persona

#### **🔗 Level 2: 조건부 통합 (주의 필요)**
```
src/core/prompts/    # CARET MODIFICATION 마커로 수정
+ 백업 파일(.cline)
```
- **장점**: 기존 시스템과 자연스러운 통합
- **주의**: 백업 필수, 충돌 가능성 관리
- **적용**: Rule Priority, JSON Prompt

#### **⚠️ Level 3: 복잡한 통합 (정리 후 적용)**
```
다중 파일 산재 + 복잡한 의존성
```
- **문제**: 높은 충돌 위험, 유지보수 어려움
- **해결**: 아키텍처 단순화 후 이식
- **적용**: Chatbot/Agent Mode (정리 필요)

### **파일 수정 전략**

#### **🔴 Cline 원본 수정 시 (최소화)**
```bash
# 1. 백업 생성
cp original.ts original.ts.cline

# 2. CARET MODIFICATION 마커 추가
# CARET MODIFICATION: [간단한 설명]
# 수정된 코드...

# 3. 수정 부분 최소화
# 조건문으로 Caret 기능을 optional하게 구현
```

#### **⚠️ 코드 고고학 원칙 (신규 추가)**
> **CRITICAL**: `caret-main` 코드는 과거 Cline 버전을 기반으로 하므로, **맹목적인 복사-붙여넣기는 절대 금지**됩니다.

**머징 전 필수 검증 절차:**
1.  **출처 확인**: `caret-main`에서 가져올 코드(설정, 변수, 함수 등)를 식별합니다.
2.  **`cline-latest`와 교차 검증**: 해당 코드가 `cline-latest`에 여전히 존재하는지, 타입이나 구조가 변경되지 않았는지 `grep`으로 반드시 확인합니다.
3.  **판단 후 적용**:
    - **제거된 코드**: 이식하지 않습니다.
    - **변경된 코드**: 최신 구조에 맞게 수정하여 이식합니다.
    - **동일한 코드**: `CARET MODIFICATION` 주석과 함께 이식합니다.

**실제 실패 사례 (`initialState.ts`):**
-   **문제**: `organization`, `searchEngine` 등 `cline-latest`에서 제거된 속성을 그대로 이식하여 타입 에러 발생.
-   **교훈**: 항상 최신 버전을 기준으로 코드의 유효성을 검증해야 합니다.

#### **🟢 Caret 전용 파일 (권장)**
```bash
# 독립적인 Caret 전용 디렉토리 활용
caret-src/feature-name/
├── feature-core.ts
├── feature-types.ts
└── __tests__/
    └── feature.test.ts
```

## 🌐 **다국어 i18n 머징 전략**

### **정적 번역 문제 해결 패턴**
모듈 로딩 시점의 번역 고정 문제는 다국어 시스템에서 가장 흔한 문제입니다.

#### **🔍 문제 감지 방법**
```bash
# 정적 상수에서 t() 함수 사용 패턴 검색
grep -r "export const.*=" webview-ui/src/ | grep "t("

# 모듈 최상위에서 번역 함수 호출 검색  
grep -r "^.*t(" webview-ui/src/ --include="*.ts" --include="*.tsx"
```

#### **⚠️ 문제가 있는 패턴**
```typescript
// ❌ 모듈 로딩 시점에 영어로 고정
export const MENU_ITEMS = [
    { name: t("menu.file", "common") },  // 언어 변경 불가
    { name: t("menu.edit", "common") }
]
```

#### **✅ 올바른 해결 패턴**
```typescript
// 1. 동적 함수로 변경
export const getMenuItems = () => [
    { name: t("menu.file", "common") },  // 호출 시점에 번역
    { name: t("menu.edit", "common") }
]

// 2. 컴포넌트에서 언어 변경 감지
function Component() {
    const { language } = useCaretI18nContext()
    const menuItems = useMemo(() => getMenuItems(), [language])
    // ...
}
```

#### **🔧 적용된 수정사항**
- ✅ `AutoApproveBar.tsx`: ACTION_METADATA → getActionMetadata()
- ✅ `SettingsView.tsx`: SETTINGS_TABS → getSettingsTabs()
- ✅ `ApiOptions.tsx`: providerOptions useMemo 의존성에 [language] 추가
- 🔄 향후 확장: ChatTextArea, 기타 정적 번역 패턴

### **번역 누락 체크리스트**
```bash
# 1. Plan/Act 버튼 번역 확인
grep -r "mode\..*\.label" webview-ui/src/

# 2. Placeholder 텍스트 확인  
grep -r "placeholderHint\|typeTaskHere" webview-ui/src/

# 3. 설정 페이지 탭 번역 확인
grep -r "tabs\..*\.name" webview-ui/src/components/settings/
```

## 🧪 **TDD 머징 전략**

### **Test-First 머징 워크플로우**

#### **1단계: 테스트 환경 준비**
```bash
# 테스트 실행 환경 확인
npm run test:backend
npm run test:frontend

# 커버리지 도구 설정
npm run test:coverage
```

#### **2단계: 기능별 테스트 이식**
```bash
# 각 기능별로 테스트 먼저 이식
cp caret-main/caret-src/__tests__/feature.test.ts \
   caret-src/__tests__/

# 테스트 실행 (실패 확인)
npm run test:backend -- feature

# 최소 구현으로 테스트 통과
# 구현 완료 후 100% 커버리지 확인
```

#### **3단계: 기능 구현**
```bash
# 테스트를 통과하도록 기능 구현
# 리팩토링으로 코드 품질 향상
# 최종 커버리지 100% 달성 확인
```

### **커버리지 요구사항**
- **Caret 전용 코드**: 100% 커버리지 필수
- **수정된 Cline 코드**: 수정 부분만 테스트 추가
- **통합 테스트**: 기능별 E2E 테스트 포함

## 🔄 **Phase별 머징 전략**

### **✅ Phase 1-3: v3.26.6 머징 완료** (2025-08-28)

#### **주요 성과**
- ✅ **v3.26.6 코어 기능 통합**: 29개 충돌 파일 성공적 해결
- ✅ **Caret 핵심 기능 보존**: .caretrules 우선순위, 페르소나 시스템, mode_system 설정
- ✅ **최신 시스템 아키텍처**: 새로운 시스템 프롬프트, Biome 코드 품질 도구 도입
- ✅ **충돌 최소화 전략 검증**: 예상 58개 → 실제 29개 충돌로 50% 감소 달성

#### **머지 완료 내역** 
```bash
# ✅ 의존성 시스템: ESLint → Biome 전환 완료
# ✅ 프로토콜 필드: mode_system = 20 (충돌 해결)
# ✅ 시스템 프롬프트: v3.26.6 최신 아키텍처 도입
# ✅ 브랜딩 시스템: 무충돌 완전 보존
# ✅ 규칙 시스템: .caretrules 우선순위 완전 보존
```

### **🎯 Phase 4: Handler 아키텍처 전환** (진행중)
- **참조 문서**: [027-4 Handler Architecture Plan](../tasks/027-4-independent-chatbot-agent-system.md)
- **핵심 목표**: 최신 Cline Handler 패턴으로 Agent/Chatbot 모드 재구현

**Phase 2 완료 내역** (2025-08-16):
- ✅ package.json: name, displayName, homepage, repository, author, keywords 변경
- ✅ walkthrough: 모든 "Cline" → "Caret" 설명 변경
- ✅ commands: 모든 category, title "Cline" → "Caret" 변경
- ✅ .clinerules → .caretrules 디렉토리명 변경
- ✅ 아이콘 브랜딩: Caret 전용 아이콘 교체 (icon.png, icon.svg, caret_shell_icon.svg 등)
- ✅ 아이콘 최적화: 적절한 크기로 압축 및 최적화
- ✅ 빌드 테스트 성공 확인

### **🎯 브랜딩 변경 원칙**
**핵심 원칙**: **사용자에게 보이는 부분만 Caret으로 변경, 내부 코드는 Cline 유지**

#### **✅ 변경 대상 (사용자 노출)**
- `package.json`: displayName, title, description, walkthrough 내용
- UI 텍스트: commands의 title, category 표시명
- 사용자 문서: README, 가이드, 설명서
- 파일명: `.caretrules` (사용자 설정 파일)

#### **❌ 변경 금지 (내부 구현)**
- **기존 Cline 코드**: Command ID, Context 변수, Proto 구조, 함수/클래스명 → 모두 유지
- **호환성 우선**: VSCode API, Protos, Extension 구조 → 변경 금지

#### **🆕 신규 기능 원칙**
- **새로 추가하는 Caret 고유 기능**: `caret.` 네임스페이스 사용
- **기존 Cline 기능 확장**: 기존 구조 유지하며 기능만 추가
- **혼용 방지**: 한 기능 내에서 `cline.`과 `caret.` 혼용 금지

### **📝 Caret 기능 개발 & 업데이트 원칙**

#### **🏷️ 주석 표준 (필수)**
- **모든 Caret 수정**: `// CARET MODIFICATION: [간단한 설명]` 주석 필수
- **기능별 상세**: `// CARET MODIFICATION: Rule priority system implementation`
- **위치**: 수정된 함수, 변수, import 위에 명시
- **목적**: 나중에 코드 추적 및 머징 시 구분 용이

#### **📄 문서 동기화 (필수)**
- **기능 문서 업데이트**: `caret-docs/features/[feature-name].mdx` 필수 업데이트
- **수정 파일 목록**: 모든 변경된 파일 경로와 변경 내용 기록
- **아키텍처 반영**: 실제 구현된 구조로 문서 업데이트
- **테스트 현황**: 단위/통합 테스트 상태 명시

#### **🔄 완전성 체크리스트**
```bash
# 1. 주석 확인
grep -r "CARET MODIFICATION" src/ webview-ui/src/ proto/

# 2. 문서 업데이트 확인
ls caret-docs/features/[feature-name].mdx

# 3. 빌드 테스트
npm run compile && npm run test:unit

# 4. 커밋 메시지
git commit -m "feat: [feature] - CARET MODIFICATION applied with docs"
```

### **Phase 3: 핵심 기능 (HIGH 우선순위)**
```bash
# Rule Priority System (조건부 통합)
# Chatbot/Agent Mode (아키텍처 정리 후)
# JSON System Prompt (조건부 통합)
```

### **Phase 4-6: 고급 기능 (MEDIUM 우선순위)**
```bash
# Account System (완전 독립)
# Persona System (완전 독립)  
# 로깅 시스템 (완전 독립)
# i18n 시스템 (완전 독립)
# 브랜딩 & UI (완전 독립)
```

### **Phase 7: 통합 검증**
```bash
# 전체 기능 통합 테스트
# 성능 및 안정성 검증
# 문서 업데이트
```

## 🚨 **리스크 관리**

### **✅ 해결된 위험 요소**

#### **Proto 시스템 충돌** → **✅ 해결완료**
- **문제**: mode_system 필드 번호 충돌 (18번)
- **해결**: mode_system = 20으로 이동하여 충돌 회피
- **결과**: v3.26.6 신기능과 Caret 기능 모두 보존

#### **의존성 충돌** → **✅ 해결완료** 
- **문제**: ESLint vs Biome, package.json 충돌
- **해결**: Biome 전환으로 v3.26.6 표준 준수
- **결과**: 최신 코드 품질 도구 도입 + Vitest 보존

### **🟡 남은 위험 요소**

#### **🟡 MEDIUM 위험**
1. **Handler 아키텍처 전환**: 기존 ToolExecutor → Handler 패턴 변경
2. **Agent/Chatbot Mode 재구현**: 최신 PlanModeHandler 기반 재작성
3. **UI 컴포넌트 재통합**: v3.26.6에서 변경된 프론트엔드 구조 적응

#### **🟡 MEDIUM 위험**
1. **규칙 시스템**: Cline 원본 파일 수정 필요
2. **프롬프트 시스템**: extensionPath 조건부 분기

#### **🟢 LOW 위험**
1. **독립 모듈들**: Account, i18n, 로깅, 브랜딩, Persona

### **🔧 머징 작업 최적화 전략** ✅ **신규 추가**

#### **브랜딩 자동화를 활용한 충돌 최소화**
> **핵심 아이디어**: 머징 작업 시 브랜딩 차이로 인한 충돌을 **완전 제거**하여 실질적 기능 충돌만 해결

**1단계: 머징 전 Cline 변환**
```bash
# 현재 Caret 상태에서 Cline으로 변환 (충돌 최소화)
node caret-b2b/tools/brand-converter.js caret forward  # caret → cline

# Git 상태 확인 (브랜딩 요소 모두 Cline으로 정리됨)
git status
```

**2단계: Cline 최신 버전 머징**
```bash
# 이제 브랜딩 차이 없이 순수 기능만 머징
git fetch upstream
git merge upstream/vX.XX.X

# 충돌 해결 (브랜딩 관련 충돌 제거로 50-70% 충돌 감소 예상)
```

**3단계: 머징 후 Caret 복원**
```bash
# 머징 완료 후 다시 Caret 브랜딩 적용
node caret-b2b/tools/brand-converter.js caret backward  # cline → caret
```

**4단계: 신기능 매핑 업데이트**
```bash
# 새로 추가된 UI 요소/명령어가 있다면 brand-config.json에 매핑 추가
# 예: 새로운 명령어 "New Feature with Cline" → "New Feature with Caret"
```

#### **브랜딩 설정 확장 가이드**
**Cline 신규 기능이 브랜딩 대상인 경우:**

1. **`caret-b2b/brands/caret/brand-config.json` 업데이트**:
```json
{
  "brand_mappings": {
    "package_json": {
      "기존 매핑들...",
      "New Cline Feature": "New Caret Feature"
    }
  }
}
```

2. **역방향 매핑도 추가 (`caret-b2b/brands/cline/brand-config.json`)**:
```json
{
  "brand_mappings": {
    "package_json": {
      "기존 매핑들...",
      "New Caret Feature": "New Cline Feature"
    }
  }
}
```

3. **자동화 스크립트 확장 (필요시)**:
- `brand-converter.js`에 새로운 변환 로직 추가
- 특수한 패턴이나 파일 처리가 필요한 경우

### **🏢 B2B 브랜딩 확장 가이드** ✅ **신규 추가**

#### **기업 브랜드 추가 시**
Caret에 신규 기능이 추가되어 기업 브랜딩에 반영해야 하는 경우:

**1단계: 브랜드 설정 확장**
```bash
# 기업 브랜드 설정 파일 수정
# 예: CodeCenter 브랜딩에 새 기능 추가
vim caret-b2b/brands/codecenter/brand-config.json
```

**2단계: 매핑 업데이트**
```json
{
  "brand_mappings": {
    "package_json": {
      "기존 매핑들...",
      "Caret New Feature": "CodeCenter New Feature",
      "Caret AI Assistant": "CodeCenter Business AI"
    }
  }
}
```

**3단계: 테스트 및 검증**
```bash
# 변환 테스트 (DRY-RUN)
node caret-b2b/tools/brand-converter.js codecenter forward --dry-run

# 실제 변환 적용
node caret-b2b/tools/brand-converter.js codecenter forward

# 복원 테스트
node caret-b2b/tools/brand-converter.js codecenter backward
```

**4단계: 고급 확장 (필요시)**
- **복잡한 변환 로직**: `brand-converter.js`에 기업별 특수 처리 추가
- **새로운 파일 형식**: `convertRulePaths()` 메소드에 추가 파일 처리
- **이미지 자동화**: `copyAssets()` 메소드에 기업 로고 자동 교체

### **리스크 완화 전략**

#### **사전 예방**
- [x] **브랜딩 자동화**: 머징 시 브랜딩 충돌 완전 제거 ✅
- [ ] **아키텍처 리뷰**: 복잡한 기능은 정리 후 이식
- [x] **백업 체계**: 브랜드 변환 시 자동 백업 ✅
- [x] **점진적 적용**: 브랜드별 독립적 변환 ✅
- [ ] **롤백 준비**: 각 Phase별 롤백 포인트 설정

#### **문제 발생 시**
```bash
# 브랜딩 복원
node caret-b2b/tools/brand-converter.js caret backward  # 즉시 Caret 복원

# 기존 Git 롤백
git reset --hard backup-before-phase-X

# 스테이징 복구
git stash apply stash@{N}

# 태그 기반 복구
git checkout backup-before-phase-X
```

## 📋 **머지 분석 문서 시리즈**

### **버전별 머지 분석 문서**
> **중요**: 각 버전 머지마다 충돌 파일 분석 및 전략 기록 유지

- **[v3.26.6 머지 분석](../tasks/027-04-01-v3-26-6-merge-analysis.md)** ✅ 완료
  - 29개 충돌 파일 분석
  - Caret 기능 보존 전략
  - 실제 머지 결과 검증

### **📊 머지 분석 템플릿**
```markdown
# Task #027-04-XX: vX.XX.X 머지를 위한 파일 차이 분석

## 개요
- 작업 일시: YYYY-MM-DD
- 목표: vX.XX.X 머지 전 충돌 예상 파일 분석
- 목적: 충돌 범위 파악 및 Caret 기능 보존 전략 수립

## 충돌 분석
### 예상 충돌: XX개 파일
### 실제 충돌: XX개 파일
### 해결 전략: [세부 전략 기록]

## 결과 검증
- ✅/❌ Caret 핵심 기능 보존
- ✅/❌ 새버전 기능 도입
- ✅/❌ 빌드 및 테스트 통과
```

## 🔧 **도구 및 자동화**

### **머징 지원 도구**

#### **3-레포 비교 도구**
```bash
# caret-scripts/merging-task/analyze-merge-differences.js
# 현재 상태와 목표 상태 비교 분석
node caret-scripts/merging-task/analyze-merge-differences.js
```

#### **에러 분석 도구**
```bash
# 빌드 에러 자동 분석 및 해결책 제시
npm run analyze:errors
```

#### **커버리지 체크**
```bash
# caret-scripts/caret-coverage-check.js
# Caret 소스 100% 커버리지 검증
npm run coverage:caret
```

### **🔗 Cline 참조 소스 설정**

#### **참조 소스 준비 (필수)**
```bash
# Caret 프로젝트 내부에 Cline 최신 소스 받기
cd D:\dev\caret
git clone https://github.com/cline/cline.git cline-reference
cd cline-reference && git checkout v3.26.6

# .gitignore에 추가하여 git 추적 방지
echo "cline-reference/" >> .gitignore
```

**활용 방법:**
```bash
# 1. v3.26.6의 실제 파일 구조 확인
ls cline-reference/src/core/task/

# 2. 우리가 없는 파일이 v3.26.6에 있는지 확인
ls cline-reference/src/core/task/ToolExecutor.ts

# 3. 파일 내용 비교 및 교체
diff src/core/task/ToolExecutor.ts cline-reference/src/core/task/ToolExecutor.ts
cp cline-reference/src/core/task/ToolExecutor.ts src/core/task/ToolExecutor.ts

# 4. 누락된 파일 확인 및 복사
find cline-reference/src -name "*.ts" | grep -v node_modules
```

**중요 원칙:**
- ⚠️ **v3.26.6에 없는 파일은 절대 추가하지 않음**
- ✅ **v3.26.6 실제 구조를 따라 정확히 복사**
- 🔍 **항상 cline-reference와 대조하여 검증**

### **자동화 스크립트**

#### **백업 자동화**
```bash
#!/bin/bash
# scripts/auto-backup.sh
PHASE=$1
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Git 태그 생성
git tag "backup-before-${PHASE}-${TIMESTAMP}"

# Stash 생성
git stash push -m "Before ${PHASE}: ${TIMESTAMP}"

echo "Backup created: backup-before-${PHASE}-${TIMESTAMP}"
```

#### **테스트 자동화**
```bash
#!/bin/bash
# scripts/auto-test.sh
echo "Running comprehensive test suite..."

# 단위 테스트
npm run test:backend
npm run test:frontend

# 통합 테스트
npm run test:integration

# E2E 테스트
npm run test:e2e

# 커버리지 검증
npm run test:coverage
```

## 📈 **품질 보증 현황**

### **✅ v3.26.6 머징 완료 기준 달성**

#### **기능적 요구사항**
- ✅ **핵심 Caret 기능 보존**: .caretrules 우선순위, 페르소나, 브랜딩
- ✅ **기존 Cline 기능 100% 보존**: v3.26.6 신기능 완전 도입
- ✅ **충돌 최소화**: 29개 파일만 충돌, 95% 자동 머지 성공
- ✅ **아키텍처 업그레이드**: 최신 시스템 프롬프트, Biome 도구

### **🎯 다음 단계 품질 기준**

#### **Handler 아키텍처 전환 기준**
- [ ] Agent 모드 연속 대화 기능 구현 (핵심 목표)
- [ ] Chatbot 모드 기존 기능 100% 보존
- [ ] 최신 PlanModeHandler 기반 구현
- [ ] 모든 기존 테스트 통과

#### **비기능적 요구사항**
- [ ] 빌드 시간 증가 최소화 (10% 이내)
- [ ] 메모리 사용량 증가 최소화 (10% 이내)
- [ ] 번들 크기 증가 관리 (20% 이내)
- [ ] 호환성 유지 (모든 지원 플랫폼)

### **검증 체크리스트**

#### **개발 환경**
- [ ] VSCode Extension Host 정상 실행
- [ ] 디버깅 기능 정상 동작
- [ ] Hot reload 정상 동작
- [ ] 로깅 시스템 정상 출력

#### **사용자 기능**
- [ ] 모든 UI 요소 정상 렌더링
- [ ] 다국어 전환 정상 동작
- [ ] 페르소나 선택 및 적용
- [ ] 계정 시스템 로그인/관리
- [ ] AI 모드 전환 (Chatbot/Agent)

## 🔮 **향후 유지보수 전략**

### **Cline 업데이트 대응**

#### **자동 머징 전략**
```bash
# 1. Cline 새 버전 확인
git fetch upstream
git log --oneline HEAD..upstream/main

# 2. 충돌 분석
node scripts/analyze-conflicts.js

# 3. 자동 머징 (충돌 없는 경우)
git merge upstream/main

# 4. 수동 해결 (충돌 있는 경우)
# 백업된 .cline 파일과 비교하여 수동 머징
```

#### **독립성 유지**
- **Caret 전용 디렉토리**: 항상 독립적 유지
- **수정 마커**: CARET MODIFICATION 마커로 변경점 추적
- **백업 파일**: .cline 백업으로 원본 추적 가능

### **장기 전략**
- **독립성 증대**: 점진적으로 Cline 의존성 감소
- **모듈화**: Caret 기능의 플러그인화
- **자동화 확대**: 머징 프로세스 완전 자동화

---

## **🔄 Cline 업스트림 머징 시 Caret 동기화 가이드**

### **⚠️ 필수 확인 사항: Rules 시스템 동기화**

**cline rules 관련 변경 감지 시 반드시 확인:**

1. **`.clinerules` 관련 변경사항**이 있으면 **`.caretrules`도 동일하게 적용** 필요
   - `toggleClineRule.ts` 변경 → `toggleCaretRule.ts` 동기화
   - `refreshClineRulesToggles` 로직 변경 → `refreshExternalRulesToggles`의 caret 로직 검토
   - Cline rules UI 변경 → Caret rules UI 동기화

2. **현재 Caret Rules 구현 상태** (동일 기능 복사본):
   ```
   Cline Rules                    Caret Rules (복사본)
   ├── toggleClineRule.ts    →   ├── toggleCaretRule.ts
   ├── .clinerules 파일      →   ├── .caretrules 파일  
   ├── localClineRulesToggles →   ├── localCaretRulesToggles
   └── 우선순위: 2순위          └── 우선순위: 1순위 (최고)
   ```

3. **로깅 시스템 변경사항**:
   - **Cline**: `Logger` 클래스 유지 (기존 시스템)
   - **Caret**: `CaretLogger` 클래스 사용 (분리된 시스템)
   - **충돌 방지**: Caret 기능에는 절대 `Logger` 사용 금지

4. **머징 체크리스트**:
   - [ ] `src/core/controller/file/toggleClineRule.ts` 변경 확인
   - [ ] `src/core/context/instructions/user-instructions/` 내 cline rules 로직 확인  
   - [ ] 동일한 변경사항을 `toggleCaretRule.ts`와 caret 관련 로직에 적용
   - [ ] **로깅**: Caret 코드에 `CaretLogger` 사용 확인
   - [ ] 우선순위 시스템 유지 확인 (`.caretrules > .clinerules`)
   - [ ] UI 토글 동작 테스트

---

**작성자**: Alpha (AI Assistant)  
**검토자**: Luke (Project Owner)  
**작성일**: 2025-08-16  
**마지막 업데이트**: 2025-08-16 17:50 KST  
**문서 유형**: 머징 전략 가이드  
**적용 범위**: 모든 Caret 기능 머징
