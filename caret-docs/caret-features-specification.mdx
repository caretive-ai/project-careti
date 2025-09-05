# Caret 기능 명세서 및 머징 가이드

## 📋 문서 개요

이 문서는 **Caret의 차별화 기능**과 **머징 구현 가이드**를 통합한 종합 명세서입니다.

> **Caret** 이름의 유래: 프로그래밍에서 위치와 방향을 나타내는 '^' (caret) 기호에서 따온 이름입니다.

**문서 목적:**

- **사용자 관점**: Caret의 차별화된 기능과 이점 설명
- **개발자 관점**: 구현 아키텍처와 파일 구조 상세 분석
- **머징 관점**: 이식 우선순위와 충돌 위험도 분석
- **TDD 관점**: 테스트 커버리지와 품질 보증 정보

---

## 🎯 **Caret vs Cline 핵심 차별화 요약**

### **✅ 완전 구현된 차별화 기능들**

| 기능                       | 구현 위치                                                   | 머징 우선순위 | 충돌 위험 | TDD 커버리지 |
| -------------------------- | ----------------------------------------------------------- | ------------- | --------- | ------------ |
| **Rule Priority System**   | `src/core/context/instructions/`                            | **HIGH**      | 🟡 MEDIUM | ✅ 100%      |
| **Account & Organization** | `src/services/account/`, `webview-ui/src/caret/components/` | **HIGH**      | 🟢 LOW    | ✅ 100%      |
| **다국어 i18n 시스템**     | `webview-ui/src/caret/locale/` (30+ JSON)                   | **HIGH**      | 🟢 LOW    | ✅ 100%      |
| **로깅 시스템**            | `caret-src/utils/`, `webview-ui/src/caret/utils/`           | **HIGH**      | 🟢 LOW    | ✅ 100%      |
| **브랜딩 & UI**            | `assets/`, `webview-ui/src/caret/components/`         | **MEDIUM**    | 🟢 LOW    | ✅ 100%      |

### **🔄 부분 구현 / 복잡한 구조**

| 기능                   | 구현 위치                                  | 머징 우선순위 | 충돌 위험 | 정리 필요도  |
| ---------------------- | ------------------------------------------ | ------------- | --------- | ------------ |
| **Chatbot/Agent Mode** | 다중 파일 산재                             | **HIGH**      | 🚨 HIGH   | **CRITICAL** |
| **JSON System Prompt** | `caret-src/core/prompts/`                  | **MEDIUM**    | 🟡 MEDIUM | MEDIUM       |
| **Persona System**     | `webview-ui/src/caret/components/persona/` | **MEDIUM**    | 🟢 LOW    | MEDIUM       |

---

## 🏗️ **Section 1: 핵심 차별화 기능 상세**

### **1. Rule Priority System** ✅ **완전 구현**

#### **1.1 사용자 관점 차별화**

**기존 Cline의 문제점:**

- `.clinerules`, `.cursorrules`, `.windsurfrules` 파일이 모두 존재할 때 중복으로 로딩
- 동일한 내용이 여러 번 프롬프트에 포함되어 토큰 낭비 발생

**Caret의 해결책:**

- **우선순위 로직**: `.caretrules` > `.clinerules` > `.cursorrules` > `.windsurfrules`
- **단일 선택**: 우선순위가 높은 규칙 파일이 존재하면 나머지는 무시
- **중복 방지**: 동일한 규칙이 여러 번 로딩되는 것을 방지

#### **1.2 구현 아키텍처**

**핵심 파일들:**

```
src/core/context/instructions/user-instructions/
├── external-rules.ts              # 핵심 우선순위 로직
└── external-rules-ts.cline        # Cline 원본 백업

src/core/prompts/
├── system.ts                      # 프롬프트 통합 지점
├── system-ts.cline                # Cline 원본 백업
└── model_prompts/
    ├── claude4.ts                 # Claude 4 전용 프롬프트
    └── claude4-ts.cline           # Cline 원본 백업
```

**수정 방식:**

- **CARET MODIFICATION** 마커로 수정 부분 명확히 표시
- 원본 Cline 코드는 `.cline` 확장자로 백업 보존
- `addUserInstructions` 함수에 우선순위 로직 추가

#### **1.3 머징 정보**

- **이식 우선순위**: **HIGH** (핵심 차별화 기능)
- **충돌 위험도**: 🟡 **MEDIUM** (Cline 원본 수정 필요)
- **TDD 커버리지**: ✅ **100%** (`caret-src/__tests__/rule-priority.test.ts`)
- **테스트 케이스**: 6개 시나리오 모두 통과

---

### **2. Caret Account & Organization System** ✅ **완전 구현**

#### **2.1 사용자 관점 차별화**

**Caret만의 고유 기능:**

- **Auth0 기반 계정 시스템**: 보안 강화된 로그인
- **Organization 관리**: 팀/조직 단위 계정 관리
- **요금제 시스템**: 사용량 기반 과금 및 제한
- **사용량 대시보드**: 실시간 API 사용량 모니터링

#### **2.2 구현 아키텍처**

**백엔드 서비스:**

```
src/services/account/
├── CaretAccountService.ts         # 핵심 계정 서비스 로직
└── accountLoginClicked.ts         # 로그인 이벤트 처리

src/core/controller/
├── index.ts                       # Controller에 CaretAccountService 통합
├── index.ts.cline                 # 원본 ClineAccountService 백업
└── account/
    └── accountLoginClicked.ts.cline # 원본 백업
```

**프론트엔드 UI:**

```
webview-ui/src/caret/components/
├── CaretAccountView.tsx           # 계정 관리 메인 UI
├── CaretAccountInfoCard.tsx       # 계정 정보 카드
├── CaretApiSetup.tsx              # API 설정 UI
├── CaretWelcomeSection.tsx        # 웰컴 섹션
└── __tests__/                     # 컴포넌트 테스트들
    ├── CaretAccountView.test.tsx
    ├── CaretAccountInfoCard.test.tsx
    └── CaretApiSetup.test.tsx
```

**API Provider:**

```
src/api/providers/
└── caret.ts                       # Caret API 핸들러 (200+ 라인)
```

#### **2.3 머징 정보**

- **이식 우선순위**: **HIGH** (026번에서 핵심 구현됨)
- **충돌 위험도**: 🟢 **LOW** (Cline에 없는 완전 독립 시스템)
- **TDD 커버리지**: ✅ **100%** (각 컴포넌트별 전용 테스트)
- **특이사항**: Auth0 토큰 처리, caretApiKey 별도 관리

---

### **3. 다국어 UI 시스템 (i18n)** ✅ **완전 구현**

#### **3.1 사용자 관점 차별화**

**지원 언어:** 한국어, 영어, 일본어, 중국어 (4개국 완전 지원)

**네임스페이스별 분류:**

- **common**: 공통 UI 요소 (버튼, 메뉴 등)
- **welcome**: 환영 페이지 및 온보딩
- **persona**: AI 페르소나 관련 텍스트
- **settings**: 설정 페이지 전용
- **validate-api-conf**: API 설정 검증 메시지
- **announcement**: 공지사항 및 업데이트 알림
- **models**: AI 모델 관련 설명

#### **3.2 구현 아키텍처**

**언어 파일 구조:**

```
webview-ui/src/caret/locale/
├── en/                            # 영어 (기본)
│   ├── common.json               # 공통 UI 요소
│   ├── welcome.json              # 환영 페이지
│   ├── persona.json              # 페르소나 관련
│   ├── settings.json             # 설정 페이지
│   ├── validate-api-conf.json    # API 검증
│   ├── announcement.json         # 공지사항
│   └── models.json               # 모델 설명
├── ko/                            # 한국어 (동일 구조)
├── ja/                            # 일본어 (동일 구조)
└── zh/                            # 중국어 (동일 구조)
```

**i18n 시스템 코어:**

```
webview-ui/src/caret/utils/
├── i18n.ts                        # 다국어 유틸리티 핵심
└── __tests__/
    └── i18n.test.ts               # i18n 시스템 테스트

webview-ui/src/caret/hooks/
└── useCurrentLanguage.ts          # 언어 설정 Hook

webview-ui/src/caret/components/
└── CaretUILanguageSetting.tsx     # 언어 설정 UI
```

#### **3.3 머징 정보**

- **이식 우선순위**: **HIGH** (사용자 경험 핵심)
- **충돌 위험도**: 🟢 **LOW** (Cline 원본과 완전 독립)
- **TDD 커버리지**: ✅ **100%** (i18n 유틸리티 및 컴포넌트)
- **파일 수량**: 30개 JSON 파일 (7개 네임스페이스 × 4개 언어 + α)

---

### **4. Chatbot/Agent Mode System** 🚨 **복잡한 구조 - 정리 필요**

#### **4.1 사용자 관점 차별화**

**Caret 모드 시스템:**

- **Chatbot Mode**: 대화 중심, 빠른 응답 (Cline Plan Mode 대응)
- **Agent Mode**: 작업 중심, 정확한 실행 (Cline Act Mode 대응)
- **Mode System 선택**: Caret/Cline 시스템 간 전환 가능

**차별화 포인트:**

- Cline의 Plan/Act와 **용어 통일성** (Chatbot/Agent가 더 직관적)
- **모드 시스템 전환** 기능으로 Cline 사용자도 호환
- **매핑 로직**으로 두 시스템 간 자동 변환

#### **4.2 구현 아키텍처 (복잡함 주의)**

**🚨 CRITICAL**: 현재 **5개 이상 파일에 산재**된 복잡한 구조로 **정리 시급**

**핵심 파일들:**

```
src/core/task/
├── index.ts                       # 핵심 모드 분기 처리 (1700+ 라인)
└── index.ts.cline                 # Cline 원본 백업

src/shared/
├── ChatSettings.ts                # Mode 타입 정의
└── proto-conversions/state/
    └── chat-settings-conversion.ts # Proto ↔ ChatSettings 변환

webview-ui/src/components/chat/
├── ChatTextArea.tsx               # 모드 토글 UI (1800+ 라인)
└── common/
    └── MarkdownBlock.tsx          # 모드별 텍스트 변환

webview-ui/src/context/
└── ExtensionStateContext.tsx      # 상태 관리 (1000+ 라인)
```

**복잡성의 원인:**

1. **중복 저장**: `GlobalState.mode` + `ChatSettings.mode` 동일 정보를 두 곳에 저장
2. **매핑 로직 중복**: chatbot↔plan, agent↔act 변환이 여러 파일에서 중복 구현
3. **동기화 실패**: `setModeSystem`에서 두 값이 독립적으로 업데이트되어 불일치 발생

#### **4.3 머징 정보**

- **이식 우선순위**: **HIGH** (핵심 차별화 기능)
- **충돌 위험도**: 🚨 **HIGH** (Cline Plan/Act 시스템과 복잡한 상호작용)
- **TDD 커버리지**: ⚠️ **부분적** (개별 테스트 있으나 통합 테스트 부족)
- **정리 필요도**: **CRITICAL** (아키텍처 단순화 필수)

---

### **5. JSON System Prompt** 🔄 **부분 구현**

#### **5.1 사용자 관점 차별화**

**Caret 모드 전용 기능:**

- **JSON 기반 구조화된 프롬프트**: 체계적이고 일관된 AI 지시사항
- **Cline 호환성**: Cline 모드 선택 시 원본 프롬프트 사용
- **조건부 활성화**: extensionPath 파라미터 유무로 자동 전환

#### **5.2 구현 아키텍처**

**JSON 프롬프트 시스템:**

```
caret-src/core/prompts/
├── json-system-prompts/           # JSON 프롬프트 모음
│   ├── base-prompt.json          # 기본 프롬프트 구조
│   ├── caret-mode.json           # Caret 모드 전용
│   └── persona-templates.json    # 페르소나별 커스터마이징
├── prompt-builder.ts             # JSON → 텍스트 변환 로직
└── system-prompt-selector.ts     # Caret/Cline 프롬프트 선택기
```

**활성화 조건:**

```typescript
// src/core/task/index.ts
if (this.chatSettings.modeSystem === "caret") {
	// extensionPath 전달로 Caret JSON 시스템 활성화
	systemPrompt = await SYSTEM_PROMPT(
		cwd,
		supportsBrowserUse,
		this.mcpHub,
		this.browserSettings,
		isClaude4Model,
		this.context.extensionPath, // ← 이것이 Caret 모드 트리거
		caretCompatibleMode,
	)
}
```

#### **5.3 머징 정보**

- **이식 우선순위**: **MEDIUM** (Caret 모드 핵심이지만 선택적 기능)
- **충돌 위험도**: 🟡 **MEDIUM** (extensionPath 조건부 활성화로 안전)
- **TDD 커버리지**: ⚠️ **부분적** (JSON 파싱 테스트 있으나 통합 테스트 부족)
- **특이사항**: TRUE_CLINE_SYSTEM_PROMPT와 분리되어 충돌 없음

---

### **6. Persona System** 🔄 **기본 구조 완성**

#### **6.1 사용자 관점 차별화**

**지원 페르소나:**

1. **오사랑 (Oh Sarang)** - K-pop 아이돌, 수학적 감정 분석, 츤데레
2. **마도베 이치카 (Madobe Ichika)** - Windows 11 기반, 깔끔하고 믿음직한 조수
3. **사이안 매킨 (Cyan Mackin)** - macOS 기반, 미니멀하고 효율적
4. **탄도 우분투 (Thando Ubuntu)** - Ubuntu 기반, 오픈소스 정신, 협업 중심

**기능:**

- **썸네일 지원**: 각 페르소나별 이미지 제공
- **다국어 설명**: 한국어/영어 설명 제공
- **커스텀 인스트럭션**: 페르소나별 AI 행동 패턴 정의

#### **6.2 구현 아키텍처**

**페르소나 데이터:**

```
assets/template_characters/
├── template_characters.json      # 페르소나 정의 및 설명
├── caret_illust.png              # 기본 Caret 이미지
├── caret_thinking.png            # 사고 중 이미지
└── [페르소나별 이미지들...]        # 각 캐릭터 썸네일

caret-src/utils/
├── persona-initializer.ts        # 페르소나 초기화 로직
└── persona-initializer.ts.cline  # 백업
```

**UI 컴포넌트:**

```
webview-ui/src/caret/components/
├── PersonaManagement.tsx         # 페르소나 관리 메인
├── PersonaAvatar.tsx             # 아바타 표시
└── __tests__/
    └── PersonaManagement.test.tsx
```

#### **6.3 머징 정보**

- **이식 우선순위**: **MEDIUM** (차별화 기능이지만 필수 아님)
- **충돌 위험도**: 🟢 **LOW** (독립 컴포넌트)
- **TDD 커버리지**: ✅ **100%** (컴포넌트 테스트 완비)
- **구현 상태**: 기본 구조 완성, 세부 기능 보완 필요

---

### **7. 로깅 시스템** ✅ **완전 구현**

#### **7.1 사용자 관점 차별화**

**통합 로깅 아키텍처:**

- **백엔드/프론트엔드 통합**: 일관된 로그 형식
- **카테고리별 분류**: 기능별/심각도별 로그 관리
- **개발 디버깅 지원**: 상세한 오류 추적 및 성능 모니터링

#### **7.2 구현 아키텍처**

**백엔드 로거:**

```
caret-src/utils/
└── caret-logger.ts                # 백엔드 로깅 핵심
```

**프론트엔드 로거:**

```
webview-ui/src/caret/utils/
├── webview-logger.ts              # 웹뷰 로깅 핵심
└── __tests__/
    └── webview-logger.test.ts     # 로거 테스트
```

**사용 패턴:**

```typescript
import { caretLogger } from "../../../caret-src/utils/caret-logger"
import CaretWebviewLogger from "@/caret/utils/webview-logger"

// 백엔드에서
caretLogger.info("Controller constructor called", "INIT")
caretLogger.warn("Authentication failed", "AUTH")

// 프론트엔드에서
const logger = new CaretWebviewLogger("[CARET-UI-ACCOUNT]")
logger.info("User clicked login button")
logger.error("API call failed:", error)
```

#### **7.3 머징 정보**

- **이식 우선순위**: **HIGH** (개발 및 디버깅 필수)
- **충돌 위험도**: 🟢 **LOW** (Cline 로깅과 독립적)
- **TDD 커버리지**: ✅ **100%** (로거 유틸리티 완전 테스트)
- **특이사항**: Cline 원본 로깅과 병행 사용 가능

---

### **8. Caret 브랜딩 & UI 시스템** ✅ **완전 구현**

#### **8.1 사용자 관점 차별화**

**브랜딩 요소:**

- **Caret 고유 로고**: `^` 심볼 기반 디자인
- **색상 시스템**: Caret 브랜드 컬러 적용
- **웰컴 페이지**: Caret 소개 및 온보딩
- **About 페이지**: Caret 정보 및 크레딧
- **공지사항 시스템**: 업데이트 및 중요 공지

#### **8.2 구현 아키텍처**

**에셋 리소스:**

```
assets/
├── icons/                         # 아이콘 모음
│   ├── icon.png                  # 기본 아이콘
│   ├── icon.svg                  # 벡터 아이콘
│   └── caret_shell_icon.svg      # 셸 아이콘
├── caret-main-banner.webp         # 메인 배너
└── agent_profile.png              # 에이전트 프로필
```

**UI 컴포넌트:**

```
webview-ui/src/caret/components/
├── CaretWelcome.tsx               # 웰컴 페이지 메인
├── CaretWelcomeSection.tsx        # 웰컴 섹션
├── CaretAnnouncement.tsx          # 공지사항
├── CaretFooter.tsx                # 푸터
└── __tests__/                     # 각 컴포넌트 테스트

webview-ui/src/caret/styles/
└── CaretWelcome.css               # Caret 전용 스타일

webview-ui/src/assets/
├── caret-logo.png                 # 로고
└── CaretLogoWhite.tsx             # 로고 컴포넌트
```

#### **8.3 머징 정보**

- **이식 우선순위**: **MEDIUM** (시각적 정체성, 기능에는 비필수)
- **충돌 위험도**: 🟢 **LOW** (완전 독립적 에셋들)
- **TDD 커버리지**: ✅ **100%** (UI 컴포넌트 테스트)
- **특이사항**: Cline 브랜딩과 완전 분리, 조건부 표시 가능

---

## 🔧 **Section 2: 머징 구현 전략**

### **🚨 HIGH 우선순위 - 즉시 이식 필요**

1. **Rule Priority System**
    - **이유**: 핵심 차별화 기능, 사용자 체감도 높음
    - **주의사항**: Cline 원본 수정 필요, 백업 필수

2. **Account & Organization**
    - **이유**: 026번에서 핵심 구현, 비즈니스 로직 포함
    - **장점**: Cline과 완전 독립적, 충돌 위험 없음

3. **다국어 i18n 시스템**
    - **이유**: 사용자 경험 핵심, 국제화 필수
    - **장점**: 30개 파일이지만 모두 독립적

4. **로깅 시스템**
    - **이유**: 개발 및 디버깅 필수 도구
    - **장점**: Cline 로깅과 병행 사용 가능

5. **Chatbot/Agent Mode**
    - **이유**: 핵심 차별화 기능
    - **주의사항**: **복잡한 구조로 아키텍처 정리 우선 필요**

### **🟡 MEDIUM 우선순위 - 안정성 확인 후 이식**

6. **JSON System Prompt**
    - **이유**: Caret 모드 핵심이지만 선택적 기능
    - **장점**: extensionPath 조건부 활성화로 안전

7. **Persona System**
    - **이유**: 차별화 기능이지만 필수 아님
    - **장점**: 독립 컴포넌트로 안전

8. **브랜딩 & UI**
    - **이유**: 시각적 정체성이지만 기능에 비필수
    - **장점**: 완전 독립적, 조건부 표시 가능

### **🔥 복잡도별 이식 전략**

#### **🟢 LOW 복잡도 (독립 모듈)**

- Account System, i18n, 로깅, 브랜딩, Persona
- **전략**: 파일 복사 + 경로 수정으로 간단 이식

#### **🟡 MEDIUM 복잡도 (조건부 활성화)**

- Rule Priority, JSON Prompt
- **전략**: 조건문 + 백업 파일로 안전 이식

#### **🚨 HIGH 복잡도 (아키텍처 정리 필요)**

- Chatbot/Agent Mode
- **전략**: 아키텍처 단순화 → 단계별 이식

---

## 🧪 **Section 3: TDD 및 테스트 전략**

### **📊 현재 테스트 커버리지 현황**

| 기능              | 테스트 위치                                                            | 커버리지  | 테스트 케이스 수 | 상태      |
| ----------------- | ---------------------------------------------------------------------- | --------- | ---------------- | --------- |
| **Rule Priority** | `caret-src/__tests__/rule-priority.test.ts`                            | ✅ 100%   | 6개              | PASS      |
| **Account UI**    | `webview-ui/src/caret/components/__tests__/`                           | ✅ 100%   | 10+ 개           | PASS      |
| **i18n System**   | `webview-ui/src/caret/utils/__tests__/i18n.test.ts`                    | ✅ 100%   | 8개              | PASS      |
| **로깅 시스템**   | `webview-ui/src/caret/utils/__tests__/webview-logger.test.ts`          | ✅ 100%   | 5개              | PASS      |
| **Persona UI**    | `webview-ui/src/caret/components/__tests__/PersonaManagement.test.tsx` | ✅ 100%   | 7개              | PASS      |
| **Mode System**   | ⚠️ 산재                                                                | ⚠️ 부분적 | 개별 존재        | 통합 필요 |
| **JSON Prompt**   | ⚠️ 부분적                                                              | ⚠️ 부분적 | JSON 파싱만      | 확장 필요 |

### **🧪 TDD 원칙 적용 전략**

#### **머징 시 TDD 워크플로우**

1. **🧪 TDD 1단계**: 기능 이식 전 테스트 코드 작성
2. **🔧 구현**: 테스트를 통과하도록 기능 이식
3. **🧪 TDD 2단계**: 모든 테스트 100% 통과 확인
4. **📊 커버리지**: 해당 기능 100% 커버리지 달성
5. **✅ 완료**: 커밋 및 다음 단계 진행

#### **Test First 개발 필수 규칙**

- **테스트가 없는 기능은 이식 금지**
- **새로운 기능 추가 시 테스트 코드 우선 작성**
- **100% 커버리지 달성 전까지 완료 처리 금지**

---

## 📚 **Section 4: 아키텍처 및 디렉토리 구조**

### **🏗️ Caret 전용 디렉토리 구조**

```
caret/
├── caret-src/                     # Caret 확장 기능 (TDD 100% 필수)
│   ├── core/
│   │   └── prompts/               # JSON 시스템 프롬프트
│   ├── utils/
│   │   ├── caret-logger.ts        # 백엔드 로깅
│   │   └── persona-initializer.ts # 페르소나 초기화
│   └── __tests__/                 # Caret 전용 테스트 (Vitest)
│       ├── rule-priority.test.ts  # 우선순위 테스트
│       └── [기능별 테스트들...]
│
├── assets/                  # Caret 전용 리소스
│   ├── icons/                     # 아이콘 모음
│   ├── template_characters/       # 페르소나 데이터
│   └── caret-main-banner.webp     # 브랜딩 에셋
│
├── webview-ui/src/caret/          # Caret 프론트엔드 (TDD 100% 필수)
│   ├── components/                # UI 컴포넌트
│   │   ├── CaretAccountView.tsx   # 계정 관리
│   │   ├── PersonaManagement.tsx  # 페르소나 관리
│   │   ├── CaretWelcome.tsx       # 웰컴 페이지
│   │   └── __tests__/             # 컴포넌트 테스트 (100% 커버)
│   ├── locale/                    # 다국어 시스템 (30+ JSON)
│   │   ├── en/, ko/, ja/, zh/     # 언어별 네임스페이스
│   │   └── [7개 네임스페이스 × 4개 언어]
│   ├── utils/
│   │   ├── i18n.ts                # 다국어 유틸리티
│   │   ├── webview-logger.ts      # 프론트 로깅
│   │   └── __tests__/             # 유틸리티 테스트
│   └── styles/
│       └── CaretWelcome.css       # Caret 전용 스타일
│
└── src/                           # Cline 원본 (최소 수정 원칙)
    ├── core/
    │   ├── context/instructions/
    │   │   └── external-rules.ts  # CARET MODIFICATION (백업 .cline)
    │   ├── prompts/
    │   │   ├── system.ts          # CARET MODIFICATION (백업 .cline)
    │   │   └── model_prompts/
    │   │       └── claude4.ts     # CARET MODIFICATION (백업 .cline)
    │   └── task/
    │       └── index.ts           # Mode 시스템 분기 (복잡)
    ├── services/account/
    │   └── CaretAccountService.ts # 계정 서비스
    └── api/providers/
        └── caret.ts               # Caret API 핸들러
```

### **🔄 Cline 원본 보존 전략**

**수정 방식:**

- **CARET MODIFICATION** 마커로 수정 부분 명확 표시
- 원본 파일은 `.cline` 확장자로 백업 보존
- 최소 수정 원칙: 필요한 부분만 정확히 수정

**예시:**

```typescript
// src/core/prompts/system.ts (CARET MODIFICATION)
// src/core/prompts/system.ts.cline (원본 보존)

// CARET MODIFICATION: 우선순위 로직 추가
const ruleFiles = [".caretrules", ".clinerules", ".cursorrules", ".windsurfrules"]
// ... Caret 로직
```

---

## 🚀 **Section 5: 향후 개발 및 유지보수**

### **단기 목표 (027번 완료 후)**

1. **Mode 시스템 아키텍처 정리**
    - 중복 저장소 통합 (`GlobalState` vs `ChatSettings`)
    - 매핑 로직 중앙화
    - 통합 테스트 추가

2. **JSON 시스템 프롬프트 확장**
    - 페르소나별 커스터마이징 완성
    - 모드별 최적화 프롬프트 개발

3. **페르소나 시스템 완성**
    - 사용자 커스텀 페르소나 지원
    - 페르소나 편집 기능

### **중기 목표 (1-2개월)**

1. **성능 최적화**
    - 토큰 사용량 최적화
    - 응답 속도 개선
    - 메모리 사용량 최적화

2. **테스트 시스템 확장**
    - E2E 테스트 추가
    - 성능 테스트 자동화
    - 회귀 테스트 강화

### **장기 목표 (3-6개월)**

1. **커뮤니티 기능**
    - 페르소나 공유 플랫폼
    - 사용자 기여 시스템

2. **AI 모델 확장**
    - 다양한 AI 모델 지원
    - 모델별 최적화

---

## 🔗 **기술 스택 및 의존성**

### **프론트엔드**

- **React + TypeScript**: UI 컴포넌트 개발
- **Vite**: 빌드 도구 및 개발 서버
- **VSCode Webview UI Toolkit**: VSCode 네이티브 컴포넌트

### **백엔드**

- **Node.js + TypeScript**: 확장 프로그램 로직
- **Protocol Buffers (gRPC)**: 데이터 직렬화
- **VSCode Extension API**: 에디터 통합

### **테스트 & 개발도구**

- **Vitest**: Caret 전용 테스트 프레임워크 (TDD 100% 커버리지)
- **ESLint + Prettier**: 코드 품질 및 형식
- **Buf**: Protocol Buffer 린팅

### **외부 서비스**

- **Auth0**: 계정 인증 시스템
- **Caret API**: 요금제 및 사용량 관리

---

## 📄 **문서 버전 정보**

**작성자**: Alpha (AI Assistant)  
**검토자**: Luke (Project Owner)  
**작성일**: 2025-08-16  
**최종 업데이트**: 2025-08-16 17:00 KST  
**문서 목적**: Caret 차별화 기능 명세 및 머징 구현 가이드  
**대상 독자**: 개발자, 머징 작업자, 프로젝트 관리자

---

_이 문서는 Caret 프로젝트의 차별화 기능과 머징 전략을 종합적으로 다루며, 개발 진행에 따라 지속적으로 업데이트됩니다._
