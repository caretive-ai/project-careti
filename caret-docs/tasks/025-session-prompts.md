# Task 025: AI 컨텍스트 최적화 실험을 위한 세션별 프롬프트

**실험 목표:** 각 작업을 독립적인 세션으로 분리하여, AI의 문서 분석 및 변환에 소요되는 비용(토큰)을 정밀하게 측정합니다.

---

## ❏ Session 1: 분석 대상 문서 식별 및 데이터시트 생성

**[Session 1 AI에게 전달할 프롬프트]**

**임무:**
주어진 `.caretrules` 파일 내용을 시작으로, 참조된 모든 마크다운(`.md`, `.mdx`) 파일을 재귀적으로 탐색하여 최종 목록을 식별하고, 그 결과를 지정된 경로에 **데이터시트 파일**로 생성하라.

**작업 절차:**
1.  아래에 제공된 `.caretrules` 파일 내용을 분석하여, 값(value)에 포함된 `.md` 또는 `.mdx` 파일 경로를 모두 추출하여 1차 목록을 만든다.
2.  1차 목록에 있는 각 파일의 내용을 읽는다.
3.  파일 내용에서 `(./.../file.md)` 또는 `(file.mdx)`와 같은 형식의 상대 경로 마크다운 파일 참조를 모두 찾아 목록에 추가한다.
4.  새롭게 추가된 파일이 없을 때까지 2-3번 과정을 반복한다.
5.  모든 과정이 끝나면, 수집된 모든 파일 경로에서 중복을 제거한 최종 목록을 만든다.
6.  아래 **출력 형식**에 따라, 최종 목록을 마크다운 테이블로 변환하여, `caret-docs/reports/프로젝트 규칙 문서 비용 최적화 실험/document-list-for-conversion.md` 파일에 저장하라.

**출력 형식 (`document-list-for-conversion.md`):**
```markdown
# AI 문서 변환 실험 데이터시트

## 분석 대상 문서 목록

| No. | 파일 경로 | 원본 토큰 | JSON 토큰 | 감소량 |
| --- | --------- | --------- | --------- | ------ |
| 1   | [파일 경로 1] |           |           |        |
| 2   | [파일 경로 2] |           |           |        |
| ... | ...       |           |           |        |

## 총계

- **총 원본 토큰:** 
- **총 JSON 토큰:** 
- **총 감소량:** 
```

**시작 데이터 (`.caretrules`):**
```json
{
  "project_overview": {
    "name": "Caret",
    "description": "VSCode AI coding assistant extension - Cline-based Fork project",
    "repository_url": "https://github.com/aicoding-caret/caret",
    "naming_convention": "Caret refers to the '^' (caret) symbol used in programming, representing position and direction in programming contexts. NOT a carrot (🥕)."
  },
  "ai_task_protocol": {
    "task_start_protocol": [
      "STEP 1: Read caret-docs/development/ai-work-index.en.mdx (AI Work Index Guide)"
    ],
    "task_nature_mandatory_documents": {
      "frontend_backend_interaction": [
        "caret-docs/development/frontend-backend-interaction-patterns.mdx",
        "caret-docs/development/caret-architecture-and-implementation-guide.mdx (sections 10-11)"
      ],
      "cline_original_modification": [
        "File modification checklist in caret-docs/caretrules.ko.md"
      ],
      "component_ui_development": [
        "caret-docs/development/component-architecture-principles.mdx"
      ],
      "testing_related": [
        "caret-docs/development/testing-guide.mdx"
      ]
    }
  },
  "key_reference_files": {
    "config_files": [".caretrules", "caret-docs/caretrules.ko.md", "caret-docs/development/index.mdx"],
    "entry_points": ["caret-src/extension.ts", "caret-src/core/webview/CaretProvider.ts", "src/extension.ts"],
    "frontend": ["webview-ui/src/App.tsx", "webview-ui/src/context/ExtensionStateContext.tsx", "webview-ui/src/caret/"]
  }
}
```
*(.caretrules의 내용은 설명을 위해 일부만 발췌함)*

---

## ❏ Session 2 ~ N: 개별 문서 JSON 변환

**[Session 1에서 얻은 각 파일별로 아래 프롬프트 템플릿을 사용하여 개별 세션을 실행]**

**임무:**
주어진 마크다운 파일의 내용을 분석하여, 핵심 의미를 담은 **영문 JSON 형식**으로 변환하라.

**변환 규칙:**
1.  **구조화:** 제목(Headings)을 기준으로 내용을 계층적으로 구조화한다.
2.  **의미 보존 및 재구성:** 각 문단과 목록의 핵심 의미(semantics)를 보존하면서, AI가 이해하기 쉬운 간결한 영문 키-값 형태로 재구성한다. 불필요한 미사여구나 반복적인 설명은 제거한다.
3.  **코드 블록:** 코드 블록은 **이스케이프 처리된 단일 문자열**로 변환하여 `code` 필드에 포함시킨다. (예: 줄바꿈은 `\n`, 큰따옴표는 `\"`로 변환)
4.  **참조 링크 변환:** 내용에 포함된 다른 마크다운 파일(`.md`, `.mdx`) 참조는 다음 규칙에 따라 변환한다.
    - `(./path/to/file.md)` → `(./path/to/file.json.md)`
    - `(./path/to/file.mdx)` → `(./path/to/file.json.mdx)`
5.  최종 결과물은 오직 JSON 객체만을 출력한다. 다른 설명은 덧붙이지 않는다.

**변환 대상 파일 경로:**
`[여기에 Session 1에서 얻은 파일 경로 중 하나를 입력]`

**예시:**
*입력 파일 (`example.md`):*
```markdown
# 2. 주요 기능

주요 기능은 다음과 같습니다.

```javascript
function sayHello(name) {
  console.log(`Hello, ${name}!`);
}
```
이 코드는 `sayHello` 함수를 정의합니다.
자세한 내용은 [개발 가이드](./development-guide.mdx)를 참조하세요.
```
*출력 JSON:*
```json
{
  "section_title": "Key Features",
  "description": "The main feature is as follows.",
  "code_block": {
    "language": "javascript",
    "code": "function sayHello(name) {\n  console.log(`Hello, ${name}!`);\n}"
  },
  "additional_info": "This code defines the `sayHello` function.",
  "references": [
    {
      "text": "Development Guide",
      "link": "./development-guide.json.mdx"
    }
  ]
}
```
