# 캐러티 개발 워크플로우

Caret 프로젝트 개발은 확립된 패턴과 프로토콜을 따릅니다.

## 1. 개발 전 분석

1. **작업 성격 및 필요 문서 파악**:
   - Frontend-Backend 상호작용
   - Cline 원본 파일 수정
   - 컴포넌트/UI 개발
   - 테스팅 관련 작업
   - 기타 (명시)

2. **작업 유형에 따른 필수 문서 확인**:
   - **Cline 수정**: 백업 규칙, CARETI MODIFICATION 요구사항
   - **Frontend-Backend**: 상호작용 패턴, 아키텍처 가이드
   - **컴포넌트/UI**: 컴포넌트 원칙, 테마 통합
   - **테스팅**: TDD 프로토콜, 테스팅 가이드

## 2. TDD 구현

### RED 단계: 실패하는 통합 테스트 먼저 작성
```bash
# 올바른 위치에 테스트 파일 생성
touch src/test/my-feature.test.ts
# 또는 webview:
# touch webview-ui/src/**/MyComponent.test.tsx

# 테스트가 실행되고 실패하는지 확인
npm run test:unit
```

### GREEN 단계: 테스트 통과를 위한 최소 구현
- Cline 파일 수정이 필요한지 확인
- `// CARETI MODIFICATION:` 주석 추가
- `.cline` 백업 파일은 생성하지 않음 (Deprecated)
- 최소 1-3줄 변경

### REFACTOR 단계: 코드 품질 개선
```bash
# 전체 시스템이 여전히 동작하는지 확인
npm run compile
npm run test:all
```

## 3. 검증 단계

1. **포괄적 테스트 실행**:
```bash
# 백엔드 테스트
npm run test:unit

# 프론트엔드 테스트
npm run test:webview

# 타입 체크
npm run check-types

# 린팅
npm run lint
```

2. **Cline 기능 손상 없음 확인**:
```bash
# 원본 Cline 기능 테스트
npm run watch  # VS Code 확장 실행
# 핵심 Cline 기능 수동 테스트
```

## 4. 문서 업데이트
1. 새로운 패턴 발견 시 관련 문서 업데이트
2. 개발 가이드에 예제 추가
3. 발견 사항으로 작업 로그 업데이트

## 4b. CLI npm 배포 (릴리스 전용)
1. 버전 동기화:
   - `cli/package.json`
   - `cli-caret/package.json`
2. npm 독립 번들 빌드:
   ```bash
   npm run compile-standalone-npm
   ```
3. 토큰 내보내기 및 배포:
   ```bash
   set -a; source .env; set +a
   bash cli-caret/scripts/publish-careti-cli.sh
   rm -f cli-caret/.npmrc
   ```
4. 확인:
   ```bash
   npm view @caretive/careti-cli version
   caret version
   ```

## 5. 수정 전 확인 요청

Cline 파일 수정 전에 반드시 확인:
- 수정할 파일명
- 수정 이유
- 영향받는 라인 수
- Level 2 조건부 통합 접근법 준수

## 일반 가이드라인

- 항상 TDD 사이클 준수: 통합 테스트 먼저, 최소 구현, 리팩터링
- `// CARETI MODIFICATION:` 주석 없이 Cline 파일 수정 금지 (백업 `.cline`은 deprecated)
- Level 2(조건부 통합)보다 Level 1(독립 모듈) 선호
- 새로운 패턴 발견 시 문서화 및 가이드 업데이트

## 국제화(i18n) 가이드라인

**네임스페이스 규칙**:
- 기능 기반 네임스페이스 사용: 각 기능별 JSON 파일
- `common.json`: 공유 UI 요소만 (`button.save`, `error.generic`)
- `settings.json`: 설정 콘텐츠 (`providers.openrouter.name`)
- 키 이름에 네임스페이스 포함 금지

**번역 사용**:
```typescript
// ✅ 올바름
t('providers.openrouter.name', 'settings')
t('button.save', 'common')

// ❌ 잘못됨
t('settings.providers.openrouter.name')
t('common.button.save')
```

**동적 패턴** (언어 전환용):
- 정적 상수를 동적 함수로 변환
- 컴포넌트에서 `useMemo(() => getFunction(), [language])` 사용
- 참조: `.agents/workflows/atoms/i18n-dynamic-pattern.md`

## 미러링 정책
`.agents/`와 `.users/`는 1:1 미러링 구조입니다.
- 이 파일 수정 시 `.agents/workflows/careti-development.md`도 동일하게 업데이트
