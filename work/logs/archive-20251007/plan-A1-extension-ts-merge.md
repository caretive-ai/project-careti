# 작업 A1: `src/extension.ts` 재병합 상세 계획

**목표**: `cline-latest/src/extension.ts`의 최신 아키텍처를 기반으로 Caret의 고유 기능을 통합하여, 안정적인 확장 프로그램 진입점을 재구축한다.

**기본 전략**: `cline-latest/src/extension.ts` 파일을 기준으로 삼고, 여기에 Caret의 수정 사항(`CARET MODIFICATION`)을 하나씩 신중하게 이식한다.

---

## 단계별 실행 계획

### 1. 기반 파일 준비
- `cline-latest/src/extension.ts` 파일의 내용을 `src/extension.ts`에 덮어쓴다. (이 작업은 마지막에 `write_to_file`로 한 번에 진행)

### 2. Caret 고유 Import 구문 추가
- `CaretProviderWrapper`, `CaretGlobalManager`, `PersonaInitializer` 등 Caret 기능에 필수적인 모듈들을 import 목록에 추가한다.

```typescript
// 예시: 추가될 Import 구문
import { JsonTemplateLoader } from "@caret/core/prompts/system/JsonTemplateLoader";
import { CaretProviderWrapper } from "@caret/core/webview/CaretProviderWrapper";
import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager";
import { PersonaInitializer } from "@caret/services/persona/persona-initializer";
```

### 3. `activate` 함수 수정

#### 3.1. Caret 웹뷰 래퍼 적용
- `initialize(context)` 직후, Cline의 `webview`를 `CaretProviderWrapper`로 감싸는 로직을 추가한다.
- **(중요)** 이후 `registerWebviewViewProvider` 등 `webview` 변수를 사용하는 모든 곳에서 Caret의 래퍼(`sidebarWebview`)를 사용하도록 수정한다.

```typescript
// 변경 전 (Cline)
const webview = (await initialize(context)) as VscodeWebviewProvider;

// 변경 후 (Caret 통합)
const clineWebview = (await initialize(context)) as VscodeWebviewProvider;
const sidebarWebview = new CaretProviderWrapper(context, clineWebview); // Caret 래퍼 적용
```

#### 3.2. Caret 서비스 초기화 코드 이식
- `CaretGlobalManager`, `CaretModeManager`, `JsonTemplateLoader`, `PersonaInitializer` 등 Caret 전용 서비스들의 초기화 코드를 `activate` 함수 상단(웹뷰 초기화 이후)에 추가한다.

#### 3.3. 브랜딩 및 컨텍스트 키 변경
- `setContext`의 키를 `cline.isDevMode`에서 `caret.isDevMode`로 변경한다.
- `createOutputChannel`의 이름을 "Cline"에서 "Caret"으로 변경한다.
- 코드 내 사용자에게 표시되는 문자열("Add to Cline", "Explain with Cline" 등)을 "Caret"으로 변경한다.

#### 3.4. 명령어(Command) 재등록 및 수정
- **네임스페이스 변경**: Cline의 `commands.CommandName` 형식을 사용하되, 등록되는 실제 명령어 ID는 `caret.*`으로 변경한다. (예: `commands.PlusButton` -> `"caret.plusButtonClicked"`)
- **Caret 전용 명령어 추가**: `popoutButtonClicked`, `openInNewTab` 등 Caret에만 존재하는 명령어를 다시 추가한다.
- **핸들러 로직 병합**: `plusButtonClicked` 등 공통 명령어의 경우, Cline의 간결한 구조를 유지하면서 Caret의 멀티-웹뷰(사이드바/탭) 처리 로직을 신중하게 병합한다.

#### 3.5. Git 커밋 메시지 생성기 교체
- 기존 Caret의 `GitCommitGenerator` 클래스 방식 대신, Cline의 새로운 함수 기반 방식(`generateCommitMessage`, `abortCommitGeneration`)을 채택하여 관련 코드를 교체한다.

### 4. 최종 코드 생성
- 위의 모든 변경 사항을 종합하여 `src/extension.ts` 파일의 최종 버전을 생성한다.

---

이 계획에 따라 `src/extension.ts` 파일을 수정하겠습니다. 진행해도 될까요?
