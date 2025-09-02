체계적인 개발 접근을 위한 상세한 AI 작업 프로토콜을 따르고 있습니다.

<detailed_sequence_of_steps>
# AI Work Protocol - 단계별 개발

## Phase 0: 필수 사전 검토 및 아키텍처 결정
1. **사용자 식별**: `git config user.name` 확인
2. **날짜 확인**: OS 명령어로 현재 날짜 확인
3. **작업 로그 확인**: `caret-docs/work-logs/{username}/{date}.md` 확인/생성

### 중요 작업 특성 분석
작업 키워드에 따라 관련 문서를 읽었는지 확인 (먼저 `/ai-work-index` 사용):

**Frontend-Backend 상호작용**:
- frontend-backend-interaction-patterns.mdx
- caret-architecture-and-implementation-guide.mdx (섹션 10-11)

**Cline 원본 수정**:
- .caretrules의 파일 수정 체크리스트
- 백업 생성 규칙 검증
- CARET MODIFICATION 주석 요구사항

**컴포넌트/UI 개발**:
- component-architecture-principles.mdx
- VSCode 테마 통합 가이드
- i18n 국제화 패턴

**테스트 관련**:
- testing-guide.mdx (Vitest mocking 패턴)
- TDD 필수 원칙 (RED → GREEN → REFACTOR)
- 테스트 우선 접근 방식 강제

## Phase 1: TDD RED - 통합 테스트 우선
🛑 **중지점**: 단위 테스트보다 통합 테스트를 먼저 작성

### 올바른 TDD 접근법:
1. **RED**: 실제 사용 시나리오에 대한 통합/E2E 테스트 작성
2. **GREEN**: 통합 테스트를 통과하도록 필요한 모든 코드 구현
3. **REFACTOR**: 통합 테스트를 통과시키면서 코드 품질 향상

### 예시:
- **WebView 기능**: "사용자가 버튼 클릭 → 예상 결과 표시" 컴포넌트 테스트
- **Backend 기능**: "설정 변경 → 시스템 동작 변경" 통합 테스트
- **금지**: `isValidInput()` 단위 테스트부터 시작

🛑 **중지점**: 테스트 파일 위치 확인
- webview: `src/caret/**/*.test.tsx`만 사용
- backend: `caret-src/__tests__/`
- 즉시 검증: 생성 후 테스트 실행

## Phase 2: TDD GREEN - 테스트 통과 구현
🛑 **중지점**: Cline 원본 파일 수정 전
- 보호되는 파일인가? (src/, webview-ui/, proto/, scripts/, evals/, docs/, locales/, root configs)
- 백업 생성: `cp filename.ts filename.ts.cline` (기존 .cline 파일 덮어쓰기 금지)
- 주석 추가: `// CARET MODIFICATION: [명확한 설명]`
- 최소 변경: 파일당 최대 1-3줄
- 완전 교체: 기존 코드 주석 처리 금지

🛑 **중지점**: 새 파일 생성 디렉토리 확인
- Caret 기능은 `caret-src/`, `caret-docs/`에 (완전 자유)
- import 경로가 올바른지 확인
- 즉시 검증: 수정 후 컴파일

## Phase 3: TDD REFACTOR - 품질 개선
- [ ] 전체 시스템 검증: 컴파일 성공
- [ ] 모든 테스트 통과
- [ ] 기존 기능에 영향 없음 확인

## 구현 실행
1. **패턴 기반 구현**: 분석된 아키텍처 패턴 적용
2. **실시간 문서화**: 체크리스트 및 보고서 업데이트
3. **검증 및 테스트**: 각 단계 완료 확인
4. **회귀 검사**: 기존 기능 정상 동작 확인

## 사용자 승인 요청
구현 시작 전:
```
마스터, {업무명} 관련 문서 분석 완료했습니다.

📚 체크한 문서:
- {문서1}: {얻은 정보 요약}
- {문서2}: {얻은 정보 요약}

🎯 작업 계획:
- Phase 1: {계획}
- Phase 2: {계획}

⚠️ 주의사항:
- {제약사항1}
- {제약사항2}

진행하겠습니다.
```
</detailed_sequence_of_steps>

<general_guidelines>
이 프로토콜은 적절한 문서 검토, TDD 접근법, Cline 원본 파일 수정을 위한 안전 조치가 포함된 체계적인 개발을 보장합니다.

Phase 0를 절대 건너뛰지 마세요 - 아키텍처 실수를 방지하고 적절한 접근법 선택을 보장합니다.

항상 단위 테스트 우선이 아닌 통합 테스트 우선 TDD 접근법을 따르세요.

올바른 계획인지 확인하기 위해 구현 시작 전 사용자 승인을 받으세요.
</general_guidelines>