# Caret 개발 규칙 (한국어)

## 규칙 관리 시스템

### 문서 접근 패턴
- **AI 읽기**: `.caretrules/caret-rules.json` (영문 JSON, 핵심 원칙만)
- **AI 워크플로우**: `.caretrules/workflows/*.md` (영문 MD, 필요시 상세 절차)
- **개발자 읽기 (한국어)**: `caret-docs/development/caret-rules.ko.md` (한글 MD, 개발자 참조)
- **개발자 읽기 (영어)**: `caret-docs/development-en/caret-rules.md` (영문 MD, 개발자 참조)
- **동기화 방법**: AI가 규칙 편집시 모든 형식을 자동 동기화
- **읽기 흐름**: AI: JSON 규칙 → (필요시) 워크플로우 MD → 구현

### ⚠️ 문서 편집 가이드라인
- **AI 개발자**: 규칙에 특정 버전 번호, 타임스탬프, 스냅샷 데이터 등을 포함하지 않아야 함
- **사람 개발자**: 가급적 `.caretrules/` 파일을 직접 편집하지 말고 문서 워크플로우 업데이트를 통해 수정

### 파일 매핑
```
.caretrules/caret-rules.json           ↔ caret-docs/development-en/caret-rules.md (EN)
                                       ↔ caret-docs/development/caret-rules.ko.md (KO)
.caretrules/workflows/*.md             ↔ caret-docs/development-en/workflows/*.md
.caretrules/workflows/ai-work-index.md ↔ caret-docs/development/ai-work-index.mdx
.caretrules/workflows/ai-work-protocol.md ↔ caret-docs/guides/ai-work-method-guide.mdx
.caretrules/workflows/caret-development.md ↔ caret-docs/development/caret-rules.ko.md
.caretrules/workflows/merge-strategy.md ↔ caret-docs/guides/merging-strategy-guide.md
```

## 핵심 원칙

### 프로젝트 정체성
- **이름**: Caret ('^' 기호, 당근이 아님)
- **성격**: 최소 확장 전략을 가진 Cline 기반 포크
- **철학**: Cline 코어 보존, caret-src/를 통한 확장

#### Fork 기반 구조
Caret은 [Cline](https://github.com/cline/cline)의 완전한 Fork입니다:

- **`src/`**: Cline 원본 코드 (최대한 보존)
- **`caret-src/`**: Caret 고유 확장 기능 (최소화)
- **`webview-ui/`**: React 프론트엔드 (Cline 빌드 시스템 활용)

#### Frontend-Backend 상호작용 패턴
Caret의 webview와 Extension Host 간 통신 표준 패턴:

- **단일 필드 업데이트**: 변경된 필드만 전송하여 순환 메시지 방지
- **Optimistic Update**: 즉시 UI 업데이트 후 백엔드 동기화
- **별도 업데이트 함수**: `setUILanguage`, `setPersona` 등 전용 함수 생성

### 개발 원칙
- **품질 우선**: 정확성 > 속도, 완전한 작업, 기술부채 금지
- **TDD 필수**: RED→GREEN→REFACTOR, 통합 테스트 우선
- **검증 필수**: 모든 변경 후 Test→Compile→Execute

## 아키텍처 규칙

### 수정 레벨
- **L1 독립**: `caret-src/`, `caret-docs/` (완전한 자유)
- **L2 조건부**: 백업 + 주석과 함께 최소한의 Cline 변경
- **L3 직접**: 완전한 문서화와 함께 최후의 수단

### 보호 규칙
- **보호된 디렉토리**: `src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/`, `configs/`
- **백업 형식**: `{filename-extension}.cline`
- **주석 필수**: `// CARET MODIFICATION: [설명]`
- **최대 변경**: Cline 파일당 1-3줄

## 개발 프레임워크

### 기술 스택
- **프레임워크**: Mocha (백엔드), Vitest (프론트엔드), Biome (Prettier 아님)
- **실제 테스트 스크립트**:
  - `npm test` - 전체 테스트 스위트 (단위 + 통합)
  - `npm run test:unit` - 백엔드 단위 테스트
  - `npm run test:integration` - VSCode 통합 테스트
  - `npm run test:webview` - 프론트엔드 테스트
  - `npm run test:coverage` - 커버리지 포함 테스트
- **스토리지 규칙**: `chatSettings=workspaceState`, `globalSettings=globalState`

### 파일 수정 체크리스트
1. Cline 원본 파일인가?
2. 백업 존재하는가? `cp file file.cline`
3. CARET MODIFICATION 주석 추가했는가?
4. 최대 1-3줄인가?
5. 주석 처리가 아닌 완전한 교체인가?
6. `npm run compile` 통과하는가?

### 네이밍 컨벤션
- **유틸리티**: kebab-case (`brand-utils.ts`)
- **컴포넌트**: PascalCase (`CaretProvider.ts`)
- **테스트**: 소스와 일치 (`brand-utils.test.ts`)
- **문서**: kebab-case (`new-developer-guide.mdx`)

## 개발 지원 스크립트

### 분석 유틸리티 (`caret-scripts/utils/`)
- `semantic-equivalence-checker.js` - Markdown/JSON 형식 간 95.2% 목표 점수로 의미적 동등성 검증
- `token-efficiency-analyzer.js` - 최적화를 위한 형식 간 토큰 사용량 차이 측정
- `universal-semantic-analyzer.js` - 모든 형식 비교를 위한 범용 의미적 동등성 분석기 (특허 기술)

### 개발 도구 (`caret-scripts/tools/`)
- `caret-cline-comparison.js` - Caret vs Cline API 제공자 및 모델 커버리지 비교
- `package-release.js` - 패키지 및 릴리스 관리 유틸리티

## AI 작업 흐름

### 단계 순서
1. **1단계**: 핵심 원칙을 위해 항상 JSON 규칙을 먼저 읽기
2. **2단계**: 필요시 상세 절차를 위한 특정 워크플로우 읽기
3. **3단계**: 적절한 검증과 함께 TDD 접근법 따르기

### 지식 원칙
**AI 지식 = 개발자 지식** (1:1 패리티 필수)

### 필수 사전 체크
- 문서 검토 없이 코딩 금지
- 작업 성격 식별: architecture/ai/frontend/ui/test/cline-modification
- TDD 필수: 통합 테스트 우선, 단위 테스트 우선 절대 금지
- Cline 파일 수정: 백업 + CARET MODIFICATION 주석 필수
- AI는 워크플로우를 통해 개발자와 동일한 정보에 접근해야 함

### 사용 가능한 워크플로우
상세 절차는 `caret-docs/development-en/workflows/` 참조:

- **주요 워크플로우**: `ai-work-index.md`, `ai-work-protocol.md`, `caret-development.md`
- **중요 검증**: `critical-verification.md`
- **아키텍처**: `merge-strategy.md`, `document-organization.md`
- **시스템**: `branding-and-logging.md` - 현재 브랜딩 원칙 및 로깅 시스템
- **개발**: `cline-modification.md`, `new-component.md`, `ai-feature.md`, `testing-work.md`

### 원자 워크플로우 (`workflows/atoms/`)
- `backup-protocol.md` - Cline 파일 백업 절차
- `tdd-cycle.md` - RED→GREEN→REFACTOR 사이클
- `modification-levels.md` - L1→L2→L3 결정 프레임워크
- `verification-steps.md` - Test→Compile→Execute 순서
- `storage-patterns.md` - workspaceState vs globalState 사용법
- `naming-conventions.md` - Cline 호환 네이밍 패턴
- `comment-protocol.md` - CARET MODIFICATION 추적
- `message-flow.md` - 프론트엔드↔백엔드↔AI 통신
- `semantic-equivalence-verification.md` - JSON vs Markdown 검증

### 조합 워크플로우
- **cline-modification**: [backup-protocol, modification-levels, comment-protocol, verification-steps]
- **new-component**: [tdd-cycle, naming-conventions, storage-patterns, verification-steps]
- **ai-feature**: [message-flow, tdd-cycle, verification-steps, storage-patterns]
- **testing-work**: [tdd-cycle, verification-steps, naming-conventions]

## TDD 단계

- **단계 0**: 작업 성격에 대한 필수 문서 확인 (architecture/ai/frontend/ui/test/cline-mod)
- **단계 1 RED**: 통합 테스트를 먼저 작성 (단위 테스트 우선 절대 금지)
- **단계 2 GREEN**: 통합 테스트를 통과하는 최소한의 코드
- **단계 3 REFACTOR**: 통합 테스트를 통과시키면서 개선

## 금지 행위

- 백업 없이 Cline 파일 수정
- 기존 .cline 백업 덮어쓰기
- 단위 테스트로 시작
- 오래된 코드 주석 처리
- CARET MODIFICATION 주석 건너뛰기

---

## 이중 언어 문서 구조

이 문서는 Caret의 이중 언어 문서 시스템의 일부입니다:

- **한국어**: `caret-docs/development/` - 개발자를 위한 한국어 문서
- **영어**: `caret-docs/development-en/` - 개발자를 위한 영어 문서
- **JSON**: `.caretrules/caret-rules.json` - AI 시스템을 위한 구조화된 규칙

세 가지 형식 모두 특정 사용 사례에 최적화하면서 의미적 동등성을 유지합니다.

**상호 참조**:
- 영문 버전: [Caret Development Rules (English)](../development-en/caret-rules.md)
- AI 버전: [.caretrules/caret-rules.json](../../.caretrules/caret-rules.json)
- 워크플로우: [development-en/workflows/](../development-en/workflows/)