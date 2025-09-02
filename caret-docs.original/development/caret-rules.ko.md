# Caret 개발 규칙

> **3단계 문서 시스템**:
> 1. **AI 읽기**: `.caretrules/caret-rules.json` (영문 JSON, 핵심 원칙)
> 2. **AI 상세**: `.caretrules/workflows/*.md` (영문 MD, 필요시 워크플로우)  
> 3. **개발자용**: 이 문서 (한글 MD, 사람이 읽는 상세 설명)
>
> AI는 JSON 규칙 → 필요시 워크플로우 → 구현 순서로 진행합니다.

## 관련 문서 링크

### 핵심 가이드
- [개발 가이드 메인](./index.mdx) - 전체 개발 가이드 시작점
- [아키텍처 및 구현 가이드](./caret-architecture-and-implementation-guide.mdx) - 상세 아키텍처 설명  
- [테스트 가이드](./testing-guide.mdx) - TDD 방법론 및 테스트 작성법
- [로깅 가이드](./logging.mdx) - 로깅 시스템 사용법
- [신규 개발자 가이드](./new-developer-guide.mdx) - 프로젝트 시작하기

### AI 작업 워크플로우 (슬래시 명령어 ↔ 대응 문서)
- `/ai-work-index` ↔ [AI 작업 인덱스 가이드](./ai-work-index.mdx) - 작업 성격별 문서 매핑
- `/ai-work-protocol` ↔ [AI 업무 방법 가이드](../guides/ai-work-method-guide.mdx) - Phase 0-3 작업 프로토콜  
- `/caret-development` ↔ 이 문서 - Caret 개발 워크플로우
- `/merge-strategy` ↔ [머징 전략 가이드](../guides/merging-strategy-guide.md) - Cline 머징 전략

### 파일 대응 관계
```
.caretrules/caret-rules.json           ↔ caret-docs/development/caret-rules.ko.md
.caretrules/workflows/ai-work-index.md ↔ caret-docs/development/ai-work-index.mdx  
.caretrules/workflows/ai-work-protocol.md ↔ caret-docs/guides/ai-work-method-guide.mdx
.caretrules/workflows/caret-development.md ↔ caret-docs/development/caret-rules.ko.md
.caretrules/workflows/merge-strategy.md ↔ caret-docs/guides/merging-strategy-guide.md
```

### 참고 문서 (선택적)
- [AI 메시지 플로우 가이드](./ai-message-flow-guide.mdx) - Frontend ↔ Backend ↔ AI 메시지 송수신 상세

## 핵심 원칙

### 프로젝트 정체성
- **이름**: Caret ('^' 기호를 의미, 당근🥕이 아님)  
- **성격**: Cline 기반 Fork 프로젝트, 최소 확장 전략
- **철학**: Cline 핵심 보존, caret-src/를 통한 확장

### 개발 원칙
- **품질 우선**: 속도보다 정확성, 완전한 작업, 기술 부채 없음
- **TDD 필수**: RED→GREEN→REFACTOR, 통합 테스트 우선
- **검증 필수**: 변경 후 항상 테스트→컴파일→실행

## 아키텍처 규칙

### 수정 레벨
1. **Level 1 - 독립 모듈**: `caret-src/`, `caret-docs/` (완전 자유)
2. **Level 2 - 조건부 통합**: Cline 최소 수정 + 백업 + 주석
3. **Level 3 - 직접 수정**: 최후의 수단, 완전한 문서화

→ [머징 전략 상세](../guides/merging-strategy-guide.md) | [워크플로우](/merge-strategy) 참조

### 보호 디렉토리
**백업 없이 절대 수정 금지**: `src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/`, 루트 설정 파일들

### 백업 프로토콜
- **형식**: `{파일명-확장자}.cline`
- **명령**: `cp original.ts original.ts.cline`
- **검증**: 수정 전 반드시 백업 존재 확인
- **절대 덮어쓰기 금지**: 기존 .cline 백업은 신성불가침

→ [백업 안전 규칙](./caret-architecture-and-implementation-guide.mdx#backup-safety) 상세 참조

## 개발 환경

### 프레임워크
- **테스트**: Vitest (Jest 아님) → [테스트 환경 설정](./testing-guide.mdx#test-environment-setup)
- **포맷팅**: Biome (Prettier 아님) → [코드 스타일 가이드](./index.mdx#code-style)
- **빠른 테스트**: `npm run test:backend`, `npm run test:webview`
- **절대 사용 금지**: `npm test` (너무 느림)

### 스토리지 규칙
- **chatSettings**: workspaceState (프로젝트별) → [스토리지 패턴](./caret-architecture-and-implementation-guide.mdx#storage-patterns)
- **globalSettings**: globalState (전역)

## 파일 수정 체크리스트

### 수정 전 확인사항
- [ ] Cline 원본 파일인가?
- [ ] 백업이 존재하는가? `ls 파일명.cline`
- [ ] 백업 없으면: `cp 파일명 파일명.cline`

### 수정 중
- [ ] 주석 추가: `// CARET MODIFICATION: [명확한 설명]`
- [ ] 최소 수정 (최대 1-3줄)
- [ ] 완전 교체 (주석 처리 금지)

### 수정 후 검증
```bash
npm run compile     # 반드시 통과
npm run test:backend  # 관련 테스트 통과
npm run check-types   # 타입 검사
```

## 명명 규칙

- **유틸리티**: kebab-case (`brand-utils.ts`)
- **컴포넌트**: PascalCase (`CaretProvider.ts`)
- **테스트**: 원본과 동일 (`brand-utils.test.ts`)
- **문서**: kebab-case (`new-developer-guide.mdx`)

→ [파일 명명 규칙 상세](./new-developer-guide.mdx#file-naming-conventions) 참조

## TDD 단계

### Phase 0: 필수 사전 검토
**관련 문서 확인 없이는 코딩 시작 금지 (JSON 규칙 확인)**
- 작업 성격 파악 (아키텍처/AI/프론트엔드/UI/테스트/Cline수정)
- 해당 성격에 맞는 필수 문서 읽기
- 상세 절차는 `/ai-work-index`, `/ai-work-protocol` 워크플로우 사용

### Phase 1 (RED): 통합 테스트 작성
단위 테스트가 아닌 실제 사용 시나리오 테스트 우선 → [TDD 방법론 상세](./testing-guide.mdx#tdd-development-cycle)

### Phase 2 (GREEN): 최소 구현
테스트를 통과하는 최소한의 코드 → [구현 패턴](./caret-architecture-and-implementation-guide.mdx) 참조

### Phase 3 (REFACTOR): 품질 개선
테스트를 유지하면서 코드 구조 개선

## 금지 사항

- ❌ 백업 없이 Cline 파일 수정
- ❌ 기존 .cline 백업 덮어쓰기
- ❌ 단위 테스트부터 시작
- ❌ 기존 코드 주석 처리
- ❌ CARET MODIFICATION 주석 생략

## 규칙 관리 시스템

- **실제 규칙**: `.caretrules/caret-rules.json` (AI가 참조)
- **한글 문서**: `caret-docs/development/caret-rules.ko.md` (개발자용)
- **동기화**: AI가 규칙 편집 시 자동 동기화
- **제외**: Cursor, Windsurf 등 외부 도구 동기화 없음 (복잡성 방지)

## 추가 참고 자료

- **Claude Code 사용자**: [CLAUDE.md](../../CLAUDE.md) - Claude Code 전용 가이드
- **워크플로우**: 
  - `/merge-strategy` - 머징 전략 워크플로우
  - `/caret-development` - 개발 워크플로우
- **작업 문서**: [작업 로그](../work-logs/) - 사용자별 작업 기록
- **가이드**: [개발 방법론](../guides/) - 상세 작업 방법론