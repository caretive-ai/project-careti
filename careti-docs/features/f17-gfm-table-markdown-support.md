# F17 - GFM 테이블 및 마크다운 확장 지원

**Status**: ✅ v0.4.7 | **Scope**: Webview | **Priority**: 🟡 Medium

## 📋 개요

GitHub Flavored Markdown(GFM) 테이블, 취소선 등 확장 마크다운 문법을 ChatRow 및 CompletionOutputRow에서 렌더링할 수 있도록 지원합니다.

### Cline과의 차이점
- **Cline (ref-cline)**: GFM 테이블 미지원 - raw 텍스트로 표시
- **Careti**: GFM 테이블, 취소선, 체크박스 등 지원

## ✅ 왜 중요한가

- **가독성 향상**: AI 응답에 테이블이 포함될 때 구조화된 형태로 표시
- **정보 전달력**: 비교표, 옵션 목록 등을 시각적으로 명확하게 전달
- **개발자 경험**: 마크다운 문서 작성 시 표준 문법 사용 가능

---

## 🔧 지원 기능

### GFM 테이블

```markdown
| 이름 | 나이 | 직업 |
|------|------|------|
| 홍길동 | 25 | 개발자 |
| 김영희 | 30 | 디자이너 |
```

**렌더링 결과:**

| 이름 | 나이 | 직업 |
|------|------|------|
| 홍길동 | 25 | 개발자 |
| 김영희 | 30 | 디자이너 |

### 테이블 정렬

```markdown
| 왼쪽 정렬 | 가운데 정렬 | 오른쪽 정렬 |
|:----------|:----------:|----------:|
| Left | Center | Right |
```

- `:---` - 왼쪽 정렬
- `:---:` - 가운데 정렬
- `---:` - 오른쪽 정렬

### 취소선

```markdown
~~취소된 텍스트~~
```

**렌더링 결과:** ~~취소된 텍스트~~

---

## 🛠️ 기술 구현

### 의존성

```json
{
  "remark-gfm": "^1.0.0"
}
```

> **버전 선택 이유**: `react-remark@2.1.0`은 `micromark@2.x`를 사용하므로, `remark-gfm@1.0.0` (micromark@~2.9.0 호환)을 사용해야 합니다.

### 관련 파일

| 파일 | 설명 |
|------|------|
| `webview-ui/package.json` | remark-gfm 의존성 |
| `webview-ui/src/components/common/MarkdownBlock.tsx` | remarkGfm 플러그인 및 테이블 CSS |
| `webview-ui/src/components/common/__tests__/MarkdownBlock.test.tsx` | 단위 테스트 |

### 코드 변경사항

```typescript
// MarkdownBlock.tsx
import remarkGfm from "remark-gfm"

const [reactContent, setMarkdown] = useRemark({
  onError: (error: Error) => {
    console.error("[MarkdownBlock] Markdown parsing error:", error)
  },
  remarkPlugins: [
    remarkGfm as any,  // GFM 테이블, 취소선 지원
    // ... 기타 플러그인
  ],
})
```

### CSS 스타일

```css
table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

th, td {
  border: 1px solid var(--vscode-editorGroup-border);
  padding: 8px 12px;
  text-align: left;
}

th {
  background-color: var(--vscode-editor-background);
  font-weight: 600;
}

tr:nth-child(even) {
  background-color: var(--vscode-list-hoverBackground);
}

del {
  text-decoration: line-through;
  opacity: 0.7;
}
```

---

## 🧪 테스트

```bash
cd webview-ui
npm test -- --run src/components/common/__tests__/MarkdownBlock.test.tsx
```

### 테스트 케이스

| 테스트 | 설명 |
|--------|------|
| 기본 마크다운 테이블 렌더링 | 3열 테이블 렌더링 확인 |
| 정렬 옵션 테이블 | 좌/중/우 정렬 테이블 확인 |
| 일반 마크다운 호환성 | 기존 마크다운 기능 유지 확인 |
| 빈 마크다운 처리 | 빈 입력 시 에러 없음 확인 |
| GFM 취소선 렌더링 | `~~text~~` → `<del>` 변환 확인 |

---

## ⚠️ 주의사항

### 버전 호환성

`remark-gfm` 버전 선택 시 주의:

| remark-gfm | micromark | react-remark 호환 |
|------------|-----------|-------------------|
| v4.x | v3.x | ❌ 불가 |
| v3.x | v3.x | ❌ 불가 |
| **v1.x** | **v2.x** | ✅ 호환 |

### 개발 모드 캐시

Vite dev server 사용 시 의존성 변경 후:
1. `node_modules/.vite` 삭제
2. `.vite-port` 파일 삭제
3. VS Code 완전 재시작

---

## 📚 참고

- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
- [remark-gfm](https://github.com/remarkjs/remark-gfm)
- [react-remark](https://github.com/remarkjs/react-remark)
