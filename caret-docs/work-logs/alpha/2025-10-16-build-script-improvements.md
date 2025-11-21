# 빌드 스크립트 근본적 개선 방안

## 현재 적용된 솔루션

### 1. tsconfig.json 수정
```json
{
  "compilerOptions": {
    "noEmit": true,  // ✅ 추가됨
    // ... 기타 옵션
  }
}
```

**효과**: TypeScript 컴파일러가 절대 .js 파일을 생성하지 않음

### 2. package.json 스크립트 정리
```json
{
  "check-types": "npm run protos && npx tsc && cd webview-ui && npx tsc -b --noEmit",
  "watch:tsc": "tsc --watch --project tsconfig.json"
}
```

**효과**: 중복 --noEmit 플래그 제거 (이제 tsconfig.json에서 관리)

## 근본적 해결 방안

### Phase 1: 자동 정리 스크립트 추가

**package.json에 추가할 스크립트**:

```json
{
  "scripts": {
    "clean:js": "find src caret-src -type f \\( -name '*.js' -o -name '*.js.map' \\) -not -path '*/node_modules/*' -delete 2>/dev/null || true",
    "precompile": "npm run clean:js",
    "postinstall": "npm run clean:js",
    "verify:no-js": "if [ $(find src caret-src -type f \\( -name '*.js' -o -name '*.js.map' \\) -not -path '*/node_modules/*' 2>/dev/null | wc -l) -gt 0 ]; then echo '❌ .js files found in source directories!'; exit 1; fi"
  }
}
```

**설명**:
- `clean:js`: 소스 디렉토리의 모든 .js/.js.map 파일 삭제
- `precompile`: 컴파일 전 자동으로 .js 파일 정리
- `postinstall`: npm install 후 자동 정리
- `verify:no-js`: .js 파일이 없는지 검증 (CI/CD용)

### Phase 2: Git Hooks 추가

**.husky/pre-commit 수정**:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 소스 디렉토리에 .js 파일이 스테이징되었는지 확인
JS_FILES=$(git diff --cached --name-only | grep -E '^(src|caret-src)/.*\.(js|js\.map)$' || true)

if [ -n "$JS_FILES" ]; then
  echo "❌ Error: .js files are not allowed in src/ or caret-src/ directories:"
  echo "$JS_FILES"
  echo ""
  echo "These files should not be committed. Running cleanup..."
  find src caret-src -type f \( -name '*.js' -o -name '*.js.map' \) -not -path '*/node_modules/*' -delete 2>/dev/null || true
  echo "✅ Cleaned up .js files. Please stage your changes again."
  exit 1
fi

npx lint-staged
```

### Phase 3: CI/CD 검증 추가

**.github/workflows/verify.yml** (또는 기존 workflow에 추가):

```yaml
name: Verify Build

on: [push, pull_request]

jobs:
  verify-no-js-files:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for .js files in source directories
        run: |
          if find src caret-src -type f \( -name '*.js' -o -name '*.js.map' \) -not -path '*/node_modules/*' | grep -q .; then
            echo "❌ .js files found in source directories!"
            find src caret-src -type f \( -name '*.js' -o -name '*.js.map' \) -not -path '*/node_modules/*'
            exit 1
          fi
          echo "✅ No .js files in source directories"
```

## 권장 적용 순서

### 즉시 적용 (Phase 1)

1. **package.json 스크립트 추가**:
   ```bash
   npm run clean:js  # 테스트
   ```

2. **clean 스크립트 확장**:
   ```json
   "clean": "npm run clean:js && rimraf dist dist-standalone webview-ui/build src/generated out/"
   ```

### 선택적 적용 (Phase 2 & 3)

**Phase 2 (Git Hooks)**: 팀 전체 적용 시 권장
**Phase 3 (CI/CD)**: 프로덕션 환경 보호에 필수

## 최종 권장 package.json 스크립트

```json
{
  "scripts": {
    "clean:js": "find src caret-src -type f \\( -name '*.js' -o -name '*.js.map' \\) -not -path '*/node_modules/*' -delete 2>/dev/null || true",
    "verify:no-js": "if [ $(find src caret-src -type f \\( -name '*.js' -o -name '*.js.map' \\) -not -path '*/node_modules/*' 2>/dev/null | wc -l) -gt 0 ]; then echo '❌ .js files found in source directories!'; find src caret-src -type f \\( -name '*.js' -o -name '*.js.map' \\); exit 1; else echo '✅ No .js files in source directories'; fi",
    
    "precompile": "npm run clean:js",
    "compile": "npm run check-types && npm run lint && node esbuild.mjs",
    "postcompile": "npm run verify:no-js",
    
    "clean": "npm run clean:js && rimraf dist dist-standalone webview-ui/build src/generated out/",
    "postinstall": "npm run clean:js"
  }
}
```

## 장점

1. **자동화**: 컴파일 전후로 자동 정리 및 검증
2. **안전성**: Git hooks로 실수 방지
3. **명확성**: CI/CD에서 명확한 실패 메시지
4. **일관성**: 팀 전체가 동일한 환경 유지

## 검증 방법

```bash
# 1. .js 파일 생성 시도 (테스트)
tsc  # noEmit: true가 있어서 생성 안됨

# 2. 강제로 .js 파일 생성 (테스트)
echo "test" > src/test.js

# 3. 검증 스크립트 실행
npm run verify:no-js  # ❌ 실패해야 함

# 4. 정리 스크립트 실행
npm run clean:js  # ✅ test.js 삭제됨

# 5. 검증 스크립트 재실행
npm run verify:no-js  # ✅ 성공해야 함
```

## 결론

- **tsconfig.json의 noEmit: true**: 근본 원인 차단 (TypeScript가 .js 생성 불가)
- **자동 정리 스크립트**: 예방 조치 (혹시 모를 .js 파일 자동 삭제)
- **검증 스크립트**: 안전장치 (CI/CD에서 문제 조기 발견)
- **Git hooks**: 실수 방지 (커밋 전 차단)

이 4단계 방어선으로 .js 파일 생성 문제를 근본적으로 해결할 수 있습니다.
