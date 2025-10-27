# 빌드 시스템 규칙

## 빌드 아키텍처

### 핵심 원칙: 관심사 분리

**TypeScript (tsc)**: 타입 검사 전용 - `.js` 파일 생성 안 함
**esbuild**: 번들링 및 컴파일 - 단일 `dist/extension.js` 출력

### 핵심 설정

#### tsconfig.json
```json
{
  "compilerOptions": {
    "noEmit": true,  // ✅ 중요: .js 파일 생성을 방지합니다
    "sourceMap": true,
    "rootDir": ".",
    // ... 기타 옵션
  }
}
```

**`noEmit: true`를 사용하는 이유?**
- TypeScript는 소스 디렉토리에 `.js` 파일을 절대 생성해서는 안 됩니다.
- 오직 esbuild만이 출력 파일(`dist/extension.js`)을 생성해야 합니다.
- 번들링된 코드가 아닌 오래된 `.js` 파일이 로드되는 것을 방지합니다.

### 빌드 스크립트

```json
{
  "compile": "npm run check-types && npm run lint && node esbuild.mjs",
  "check-types": "npm run protos && npx tsc && cd webview-ui && npx tsc -b --noEmit",
  "watch:tsc": "tsc --watch --project tsconfig.json"
}
```

**중요**:
- `tsc`는 타입 검사만을 위해 실행됩니다 (`tsconfig.json`의 `noEmit` 설정).
- 스크립트에 `--noEmit` 플래그를 추가할 필요가 없습니다 (`tsconfig.json`에 설정됨).
- `esbuild.mjs`가 모든 번들링을 처리합니다.

## 보호된 디렉토리

### 소스 디렉토리 (`.js` 파일 금지)
- `src/**/*.js` - 금지
- `src/**/*.js.map` - 금지
- `caret-src/**/*.js` - 금지
- `caret-src/**/*.js.map` - 금지

### 빌드 출력 (`.js` 파일만 허용)
- `dist/` - esbuild 출력
- `dist-standalone/` - 독립 실행형 빌드
- `webview-ui/build/` - Vite 출력

## 개발 규칙

### 개발 전 체크리스트
1.  **불필요한 `.js` 파일 없는지 확인**:
    ```bash
    find src caret-src -name "*.js" -o -name "*.js.map"
    # 아무것도 반환되지 않아야 함
    ```

2.  **클린 빌드**:
    ```bash
    npm run clean
    npm run compile
    ```

3.  **출력 확인**:
    ```bash
    ls -la dist/extension.js  # 존재해야 함
    find caret-src -name "*.js"  # 비어 있어야 함
    ```

### 일반적인 문제

#### 문제: `npm run compile` 후 변경 사항이 반영되지 않음
**원인**: 소스 디렉토리에 있는 오래된 `.js` 파일이 로드됨
**해결책**:
```bash
# 소스 디렉토리의 모든 .js 파일 삭제
find src caret-src -name "*.js" -o -name "*.js.map" | xargs rm -f

# VS Code 다시 로드
# 개발자: 창 다시 로드 (Cmd+Shift+P)
```

#### 문제: TypeScript 오류가 있지만 빌드는 성공함
**원인**: `tsconfig.json`의 `noEmit:true` - `tsc`는 타입만 검사함
**해결책**: 이는 예상된 동작입니다. TypeScript 오류를 수정하세요.

### 검증 명령어

```bash
# 타입 검사만 (출력 없음)
npm run check-types

# 전체 빌드 (타입 검사 + 린트 + 번들)
npm run compile

# 소스에 .js 파일 없는지 확인
find src caret-src -name "*.js" -o -name "*.js.map"
```

## 파일 수정 프로토콜

### `tsconfig.json` 수정 시
1.  ✅ `noEmit: true`가 항상 있는지 확인
2.  ✅ 테스트: `tsc`가 `.js` 파일을 생성하지 않아야 함
3.  ✅ 검증: `npm run compile`이 여전히 작동하는지 확인

### `esbuild.mjs` 수정 시
1.  ✅ 번들링 테스트: `node esbuild.mjs`
2.  ✅ 출력 검증: `dist/extension.js`가 존재하는지 확인
3.  ✅ VSCode에서 테스트: F5 (확장 프로그램 실행)

### `package.json` 스크립트 수정 시
1.  ✅ 스크립트에 `--noEmit`를 추가하지 말 것 (`tsconfig.json`에 설정됨)
2.  ✅ 관심사 분리 유지: `tsc`는 타입, `esbuild`는 번들링
3.  ✅ 전체 빌드 테스트: `npm run compile`

## 개발 워크플로우와의 통합

### TDD 워크플로우
```bash
# 1. 테스트 작성
npm run test:webview

# 2. 구현
# (TypeScript 파일 수정)

# 3. 타입 검사
npm run check-types

# 4. 빌드
npm run compile

# 5. 테스트
npm run test:webview
```

### Watch 모드 개발
```bash
# 터미널 1: 타입 검사
npm run watch:tsc

# 터미널 2: 빌드 감시
npm run watch

# 터미널 3: 테스트 감시 (선택 사항)
npm run test:backend:watch
```

## 참조 문서

- **문제 분석**: `caret-docs/work-logs/alpha/2025-10-16-js-file-generation-issue.md`
- **개선 계획**: `caret-docs/work-logs/alpha/2025-10-16-build-script-improvements.md`
- **빌드 명령어**: `CLAUDE.md` - Common Commands 섹션
- **아키텍처**: `CLAUDE.md` - Architecture Overview 섹션
