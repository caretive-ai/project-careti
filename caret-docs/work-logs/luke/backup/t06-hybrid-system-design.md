# 설계안: 궁극의 하이브리드 프롬프트 시스템

## 1. 목표

Caret의 **'콘텐츠 관리 용이성(JSON)'**과 `cline-latest`의 **'기술적 유연성 및 안정성(TypeScript)'**이라는 두 시스템의 핵심 장점을 융합하여, 현존하는 가장 이상적인 프롬프트 시스템을 구축한다.

## 2. 핵심 아키텍처: `CaretJsonComponentProvider` (어댑터 패턴)

`caret-src/core/prompts/` 내부에 `CaretJsonComponentProvider.ts` 라는 어댑터 클래스를 구현한다. 이 클래스는 두 시스템을 연결하는 브릿지(bridge) 역할을 수행한다.

### `CaretJsonComponentProvider`의 역할

1.  **JSON 로딩**: `caret-src/core/prompts/sections/` 디렉토리 내의 모든 `.json` 파일을 로드한다.
2.  **컴포넌트 변환**: 각 JSON 파일을 `cline-latest`의 `PromptRegistry`가 이해할 수 있는 `ComponentFunction` 형태로 변환(wrapping)한다.
3.  **동적 데이터 주입**: 변환 과정에서, 각 컴포넌트에 필요한 동적 데이터(예: 현재 OS 정보, 작업 디렉토리 등)를 실시간으로 수집하여 주입하는 로직을 포함한다.
4.  **레지스트리 등록**: `PromptRegistry`에 변환된 모든 Caret 컴포넌트를 등록하는 단일 메소드(`registerAll()`)를 제공한다.

## 3. 구현 예시: `SYSTEM_INFORMATION` 컴포넌트

| `Caret` (JSON) | `CaretJsonComponentProvider` (Adapter) | `cline-latest` (TS) |
| :--- | :--- | :--- |
| `SYSTEM_INFORMATION.json` | `adaptSystemInfo()` | `PromptRegistry` |
| 템플릿 텍스트 제공 | 1. JSON에서 템플릿 로드<br>2. `getSystemEnv()`로 동적 데이터 수집<br>3. 템플릿과 데이터 결합 | 등록된 컴포넌트 사용 |

#### `SYSTEM_INFORMATION.json`
```json
{
  "template": "SYSTEM INFORMATION\n\nOperating System: {{os}}\nDefault Shell: {{shell}}\nHome Directory: {{homeDir}}\nCurrent Working Directory: {{workingDir}}"
}
```

#### `CaretJsonComponentProvider.ts` (의사 코드)
```typescript
import { PromptRegistry } from "cline-latest/src/core/prompts/system-prompt";
import { getSystemEnv } from "cline-latest/src/core/prompts/system-prompt/components/system_info";
import * as fs from 'fs';

class CaretJsonComponentProvider {
    private registry = PromptRegistry.getInstance();

    // 1. JSON 파일을 읽어 컴포넌트 함수로 변환
    private adaptSystemInfo(): ComponentFunction {
        return async (variant, context) => {
            const jsonPath = 'path/to/SYSTEM_INFORMATION.json';
            const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
            const template = jsonContent.template;

            const env = await getSystemEnv(context.cwd, context.isTesting);
            
            // 템플릿과 동적 데이터를 결합
            return new TemplateEngine().resolve(template, env);
        };
    }

    // ... 다른 JSON 파일들에 대한 어댑터 함수들 ...

    // 2. 모든 어댑터를 PromptRegistry에 등록
    public registerAll() {
        this.registry.registerComponent(
            SystemPromptSection.SYSTEM_INFO, 
            this.adaptSystemInfo()
        );
        // ... 다른 모든 컴포넌트 등록 ...
    }
}
```

## 4. 실행 계획

1.  **Phase 1: 어댑터 및 핵심 컴포넌트 구현**
    -   `CaretJsonComponentProvider.ts` 클래스의 기본 구조를 생성한다.
    -   가장 대표적인 `SYSTEM_INFORMATION.json`과 `OBJECTIVE.json` 두 개의 컴포넌트에 대한 어댑터 함수를 우선적으로 구현하여 기술적 가능성을 검증한다.

2.  **Phase 2: 전체 컴포넌트 확장**
    -   나머지 16개의 JSON 섹션에 대한 어댑터 함수를 모두 구현한다.

3.  **Phase 3: 시스템 통합**
    -   `extension.ts` 또는 관련 초기화 파일에서 `CaretJsonComponentProvider`를 인스턴스화하고 `registerAll()` 메소드를 호출하는 통합 코드를 추가한다.

4.  **Phase 4: 검증**
    -   기존 `cline-latest`의 기능이 정상 동작하는지 확인한다.
    -   Caret의 컴포넌트(JSON 기반)가 `cline-latest`의 프롬프트에 올바르게 포함되어 출력되는지 확인한다.
