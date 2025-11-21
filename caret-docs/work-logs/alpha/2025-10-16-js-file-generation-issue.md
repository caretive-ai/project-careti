# .js 파일 생성 문제 분석 및 해결

## 문제 상황
- `npm run compile` 실행 시 `caret-src/` 디렉토리에 `.js` 및 `.js.map` 파일이 생성됨
- 이로 인해 VSCode가 번들된 `dist/extension.js` 대신 오래된 `.js` 파일을 로드
- 코드 변경사항이 반영되지 않는 문제 발생

## 비교 분석

### tsconfig.json 비교
**caret-main (구 레파지토리)**: 동일
**현재 레파지토리**: 동일

두 레파지토리의 `tsconfig.json`이 완전히 동일함을 확인했습니다.

### 핵심 문제

#### 현재 설정의 문제점
```json
{
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    // ❌ outDir 없음 → tsc가 소스 옆에 .js 생성
    // ❌ noEmit 없음 → tsc 직접 실행 시 .js 생성
  }
}
```

#### package.json 스크립트 분석
```json
{
  "compile": "npm run check-types && npm run lint && node esbuild.mjs",
  "check-types": "npm run protos && npx tsc --noEmit && cd webview-ui && npx tsc -b --noEmit",
  "watch:tsc": "tsc --noEmit --watch --project tsconfig.json"
}
```

- ✅ `check-types`: `--noEmit` 플래그 사용 (올바름)
- ✅ `watch:tsc`: `--noEmit` 플래그 사용 (올바름)
- ⚠️ 하지만 누군가 실수로 `tsc`를 직접 실행하면 .js 파일 생성됨

### .gitignore 확인
```gitignore
# TypeScript compiled output - DO NOT COMMIT
src/**/*.js
src/**/*.js.map
caret-src/**/*.js
caret-src/**/*.js.map
```

✅ `.gitignore`에 이미 규칙이 있어 Git 커밋은 방지되지만, 로컬 생성은 막지 못함

## 근본 원인

1. **tsconfig.json의 설계 문제**
   - `outDir` 없이 `sourceMap: true` 설정
   - TypeScript가 소스 디렉토리에 직접 .js 파일 생성 가능

2. **빌드 시스템 혼재**
   - esbuild.mjs: 번들링 담당 (dist/extension.js 생성)
   - TypeScript: 타입 체크만 해야 함
   - 하지만 TypeScript가 .js 생성 가능한 상태로 남아있음

## 해결 방안

### 방안 1: noEmit 옵션 추가 (권장) ✅

**장점**:
- TypeScript가 절대 .js 파일을 생성하지 않음
- esbuild.mjs만 번들 파일 생성 (명확한 역할 분리)
- 실수로 `tsc` 직접 실행해도 안전

**구현**:
```json
{
  "compilerOptions": {
    "noEmit": true,  // 추가
    "sourceMap": true,
    // ... 기타 옵션
  }
}
```

**주의사항**:
- `--noEmit` 플래그를 사용하는 스크립트와 충돌 가능
- package.json 스크립트에서 `--noEmit` 플래그 제거 필요

### 방안 2: outDir 옵션 추가

**장점**:
- .js 파일이 생성되더라도 dist/ 폴더에만 생성
- 소스 디렉토리는 깨끗하게 유지

**단점**:
- TypeScript와 esbuild가 모두 .js 생성 (중복)
- dist/ 폴더에 불필요한 파일 생성

**구현**:
```json
{
  "compilerOptions": {
    "outDir": "dist",
    "sourceMap": true,
    // ... 기타 옵션
  }
}
```

## 권장 솔루션

**방안 1 (noEmit)을 권장**합니다:

1. **tsconfig.json 수정**:
   ```json
   {
     "compilerOptions": {
       "noEmit": true,
       // ... 기타 설정
     }
   }
   ```

2. **package.json 스크립트 수정** (중복 제거):
   ```json
   {
     "check-types": "npm run protos && npx tsc && cd webview-ui && npx tsc -b --noEmit",
     "watch:tsc": "tsc --watch --project tsconfig.json"
   }
   ```

3. **즉시 효과**:
   - `tsc` 실행 시 .js 파일 생성되지 않음
   - esbuild.mjs만 dist/extension.js 생성
   - 로컬 파일 시스템이 깨끗하게 유지

## 검증 방법

```bash
# 1. 기존 .js 파일 삭제
find caret-src -name "*.js" -o -name "*.js.map" | xargs rm -f

# 2. 수정 적용 후 컴파일
npm run compile

# 3. .js 파일이 생성되지 않았는지 확인
find caret-src -name "*.js" -o -name "*.js.map"

# 4. 번들 파일은 정상 생성되었는지 확인
ls -la dist/extension.js
```

## 결론

- **문제**: tsconfig.json에 `noEmit` 또는 `outDir` 설정 누락
- **원인**: TypeScript가 소스 디렉토리에 직접 .js 파일 생성 가능
- **해결**: `"noEmit": true` 추가로 TypeScript의 .js 생성 완전 차단
- **효과**: esbuild만 번들링, 소스 디렉토리 깨끗하게 유지
