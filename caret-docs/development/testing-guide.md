# Caret 테스팅 가이드

## 1. 개요

본 문서는 Caret 프로젝트의 테스팅 전략, 작성 방법, 실행 절차에 대한 종합 가이드입니다. Caret은 **100% 테스트 커버리지**를 목표로 하며, **테스트 주도 개발(TDD)** 방식을 권장합니다.

## 1.1 빠른 시작 - 테스트 실행 명령어

### 🚨 중요: 올바른 테스트 명령어 사용

**❌ 주의: `npm test` 사용 금지**

- `npm test` 명령어는 전체 빌드 + 컴파일 + 린트 + 모든 테스트를 실행하여 매우 느립니다.
- 개발 중에는 아래의 **개별 테스트 명령어**를 사용하는 것을 권장합니다.

### 🎯 개별 테스트 실행 (개발 시 권장)

```bash
# ✅ 특정 백엔드 테스트 파일 실행
npm run test:backend caret-src/__tests__/your-test-file.test.ts

# ✅ 특정 백엔드 테스트를 이름으로 실행
npm run test:backend caret-src/__tests__/your-test-file.test.ts -t "your test name"

# ✅ 프론트엔드 테스트 실행 (React 컴포넌트, UI 로직)
npm run test:webview

# ✅ 백엔드 워치 모드 실행 (변경 시 자동 실행)
npm run test:backend:watch

# ✅ 빠른 개발 테스트 (웹뷰 제외, 첫 실패 시 중단)
npm run dev:build-test:fast
```

### 📊 모든 테스트 + 커버리지 실행 (CI/CD 또는 최종 검증용)

```bash
# 🌟 강력 추천: 모든 테스트 + 커버리지 분석을 한 번에
npm run test:all; npm run caret:coverage

# 또는 상세한 백엔드 커버리지 포함
npm run test:all; npm run test:backend:coverage; npm run caret:coverage

# 통합 테스트 (VSCode Extension 환경)
npm run test:integration
```

### 📈 커버리지 분석

```bash
# Caret 전용 코드 커버리지 분석 (파일별 상세)
npm run caret:coverage

# 백엔드 Vitest 커버리지 (라인별 상세)
npm run test:backend:coverage

# VSCode Extension 통합 커버리지
npm run test:coverage
```

### 📝 실전 테스트 워크플로우 예시

```bash
# 1. 개발 중: 특정 기능 테스트
npm run test:backend caret-src/__tests__/json-overlay-real-files.test.ts

# 2. 개발 중: 특정 케이스만 테스트
npm run test:backend caret-src/__tests__/json-overlay-real-files.test.ts -t "should load and apply Alpha personality"

# 3. 워치 모드로 개발 (코드 변경 시 자동 테스트)
npm run test:backend:watch

# 4. 빠른 전체 검증 (첫 실패 시 중단)
npm run dev:build-test:fast

# 5. 최종 검증 (PR 전)
npm run test:all && npm run caret:coverage
```

## 2. 테스트 전략

### 2.1 테스트 커버리지 목표

**Caret 전용 코드 100% 커버리지 원칙:**

- **🥕 새로운 Caret 로직**: `caret-src/` 및 `webview-ui/src/caret/` 디렉토리의 비즈니스 로직 및 기능 코드는 **100% 테스트 커버리지 필수**입니다.
- **🔗 재수출 파일**: Cline 모듈의 단순 재수출 파일(예: `export { ... } from "..."`)은 테스트에서 제외 가능합니다.
- **📦 타입 정의**: 런타임 로직이 없는 TypeScript 인터페이스/타입 정의만 포함된 파일은 제외 가능합니다.
- **🤖 원본 Cline 코드**: `src/` 및 `webview-ui/src/` (caret 폴더 제외)는 Cline의 기존 테스트를 활용하며, 추가 테스트 작성을 강제하지 않습니다.
- **📊 커버리지 분석**: `caret-scripts/caret-coverage-check.js`를 사용하여 Caret vs. Cline 코드의 커버리지를 별도로 분석합니다.
- **🔍 Cline 코드 수정 테스트**: Cline 소스 코드 수정 시 추가 테스트가 필요한 경우, 가능한 한 `caret-src/__tests__/` 디렉토리에 별도의 테스트 파일을 생성하여 관리하고 테스트 범위의 과도한 확장을 방지합니다.

#### 현재 제외된 파일 (근거 포함)

- `caret-src/core/prompts/system.ts` - Cline 모듈의 재수출.
- `caret-src/shared/providers/types.ts` - TypeScript 인터페이스 정의만 포함.
- `caret-src/core/task/index.ts` - 일부 래퍼 로직 (향후 테스트 추가 예정).

### 2.2 테스트 유형

#### 2.2.1 단위 테스트

- **대상**: 개별 함수, 클래스, 컴포넌트.
- **도구**: Vitest (백엔드/프론트엔드 통합).
- **위치**: `__tests__/` 폴더 또는 `.test.ts/.test.tsx` 파일.

#### 2.2.2 통합 테스트

- **대상**: 여러 모듈 간의 상호작용, 실제 빌드 검증, 전체 시스템 동작.
- **도구**: Vitest (백엔드), VSCode Extension Test Runner, React Testing Library.
- **위치**: `caret-src/__tests__/integration.test.ts`, `src/test/`, `webview-ui/src/__tests__/`.
- **특징**: 실제 명령어 실행을 통한 빌드/컴파일 검증 (2025-01-21 업데이트).
- **새로운 접근법**: 모킹된 환경에서 실제 빌드 프로세스 검증으로 전환.

#### 2.2.3 E2E (End-to-End) 테스트

- **대상**: 전체 워크플로우.
- **도구**: VSCode Extension Development Host.
- **방법**: F5 디버깅을 통한 수동/자동화 테스트.

### 2.3 TDD (테스트 주도 개발) 방식 ⚡ **필수**

Caret은 **TDD 방식을 필수**로 합니다:

1. **Red**: 실패하는 테스트 작성.
2. **Green**: 테스트를 통과시키는 최소한의 코드 작성.
3. **Refactor**: 테스트를 통과시키면서 코드 품질 개선.

**🚨 AI 개발자를 위한 필수 원칙**:

- ❌ **구현 우선 금지**: 항상 코드보다 테스트를 먼저 작성합니다.
- ✅ **테스트 우선**: "테스트를 먼저 작성하겠습니다"라고 선언해야 합니다.
- ✅ **단계별 진행**: RED → GREEN → REFACTOR 사이클을 엄격히 준수합니다.

**실전 예시 (UI 언어 설정)**:

```typescript
// RED: 실패하는 테스트 작성
it("should update only uiLanguage without affecting other settings", async () => {
	await setUILanguage("ja");
	expect(mockUpdateSettings).toHaveBeenCalledWith({
		uiLanguage: "ja", // 이것만
	});
	expect(state.chatSettings.model).toBe("claude-3"); // 다른 설정에 영향 없음
});

// GREEN: 최소한의 구현
const setUILanguage = async (language: string) => {
	await StateServiceClient.updateSettings({ uiLanguage: language });
};

// REFACTOR: 에러 처리, 상태 업데이트 등 개선
```

#### 2.3.1 핵심 TDD 규칙 (Kent Beck)

1. **실패하는 단위 테스트를 통과시키기 위한 경우가 아니면 프로덕션 코드를 작성하지 마십시오.**
2. **실패에 충분한 것 이상의 단위 테스트를 작성하지 마십시오.**
3. **하나의 실패하는 단위 테스트를 통과하기에 충분한 것 이상의 프로덕션 코드를 작성하지 마십시오.**

#### 2.3.2 TDD 단계별 체크리스트

**Red 단계 체크리스트:**

- [ ] 테스트가 실제로 실패하는가?
- [ ] 실패 이유가 예상한 것과 같은가?
- [ ] 테스트 이름이 구체적이고 명확한가?
- [ ] 하나의 동작만 테스트하는가?
- [ ] 테스트가 간단하고 이해하기 쉬운가?

**Green 단계 체크리스트:**

- [ ] 테스트가 통과하는가?
- [ ] 최소한의 코드로 구현했는가?
- [ ] 다른 모든 테스트도 여전히 통과하는가?
- [ ] 하드코딩이나 임시 해결책을 피하지 않았는가?

**Refactor 단계 체크리스트:**

- [ ] 모든 테스트가 여전히 통과하는가?
- [ ] 코드 중복이 제거되었는가?
- [ ] 코드가 더 읽기 쉬워졌는가?
- [ ] 성능이 개선되었는가?
- [ ] 설계가 개선되었는가?

### 2.4 테스트 코드 아키텍처 원칙 🏗️ **필수**

#### 2.4.1 테스트 전용 코드 분리 원칙

**🚨 엄격 금지: 서비스 코드에 테스트 전용 메서드 포함.**

```typescript
// ❌ 엄격 금지: 서비스 클래스에 테스트 전용 메서드
export class CaretSystemPrompt {
  // ✅ 프로덕션 메서드
  generateFromJsonSections() { ... }

  // ❌ 금지: 테스트 전용 메서드가 서비스 클래스에 존재
  generateSystemPrompt() { ... }          // 테스트에서만 사용
  generateSystemPromptWithTemplates() { ... } // 테스트에서만 사용
  callOriginalSystemPrompt() { ... }      // 테스트에서만 사용
}
```

**✅ 올바른 접근법: TestHelper 클래스로 분리.**

```typescript
// ✅ 서비스 클래스: 프로덕션 코드만
export class CaretSystemPrompt {
  generateFromJsonSections() { ... }
  getMetrics() { ... }
  clearMetrics() { ... }
}

// ✅ 테스트 헬퍼: 테스트 전용 메서드
export class CaretSystemPromptTestHelper {
  generateSystemPrompt() { ... }          // 테스트 전용
  generateSystemPromptWithTemplates() { ... } // 테스트 전용
  callOriginalSystemPrompt() { ... }      // 테스트 전용
}
```

### 2.5 테스트 파일 구조 및 명명 규칙

#### 2.5.1 테스트 파일 위치 규칙

**백엔드 테스트 (`caret-src/`)**

```
caret-src/
├── core/
│   ├── webview/
│   │   ├── CaretProvider.ts
│   │   └── __tests__/
│   │       └── CaretProvider.test.ts
│   └── utils/
│       ├── caret-logger.ts
│       └── caret-logger.test.ts  // 동일 디렉토리 허용
```

**프론트엔드 테스트 (`webview-ui/src/caret/`)**

```
webview-ui/src/caret/
├── components/
│   ├── CaretWelcome.tsx
│   └── __tests__/
│       └── CaretWelcome.test.tsx
├── hooks/
│   ├── useCaretState.ts
│   └── useCaretState.test.ts
└── utils/
    ├── i18n.ts
    └── __tests__/
        └── i18n.test.ts
```

### 2.6 테스트 코드 구조 표준

#### 2.6.2 테스트 그룹화 (`describe` 블록)

**클래스 테스트 그룹화:**

```typescript
describe("CaretLogger", () => {
	describe("constructor", () => {
		// 생성자 관련 테스트
	})

	describe("info method", () => {
		// info 메서드 관련 테스트
	})
})
```

**기능 기반 그룹화:**

```typescript
describe("i18n utility", () => {
	describe("translation", () => {
		// 번역 기능 테스트
	})

	describe("language detection", () => {
		// 언어 감지 기능 테스트
	})
})
```

### 2.7 테스트 케이스 작성 표준

#### 2.7.1 테스트 이름 규칙

**명명 패턴:**

```typescript
// 패턴: should {예상 결과} when {조건}
it("should return user data when valid ID is provided", () => {})
it("should throw error when invalid ID is provided", () => {})
```

#### 2.7.2 AAA 패턴 (Arrange-Act-Assert) **필수**

```typescript
it("should format log message with context", () => {
	// Arrange
	const logger = new CaretLogger("test-context");
	const message = "test message";

	// Act
	const result = logger.formatMessage("INFO", message);

	// Assert
	expect(result).toBe("[INFO][test-context] test message");
})
```

---
**최종 업데이트**: 2025-09-06 - 한국어로 번역 및 현재 표준에 맞춤.
**작성자**: Alpha (AI 어시스턴트)
**검토자**: Luke (개발자)
