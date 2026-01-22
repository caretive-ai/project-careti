# AI 작업 프로토콜 - 단계별 개발 (KO 우선)

체계적인 개발 접근을 위해 상세한 AI 작업 프로토콜을 따릅니다.

## 0단계: 필수 사전 검토 및 아키텍처 결정
1.  **규칙 로드**: `.agents/context/careti-rules.json` 확인(온디맨드 워크플로우 인덱스)
2.  **사용자 식별**: `git config user.name` 확인
3.  **날짜 확인**: OS 명령어로 현재 날짜 확인
4.  **작업 로그 확인**: `careti-docs/work-logs/{username}/...` 하위에 기록(프로젝트 관례에 맞춰 디렉터리 선택)

### 중요 작업 성격 분석
작업 키워드를 기반으로 관련 문서를 읽었는지 확인합니다 (`/ai-work-index` 먼저 사용):

**프론트엔드-백엔드 상호작용**:
- `frontend-backend-interaction-patterns.md`
- `careti-architecture-and-implementation-guide.md` (섹션 10-11)

**Cline 원본 수정**:
- `.agents/context`의 파일 수정 체크리스트
- `.cline` 백업 생성 규칙은 Deprecated (새로 만들지 않음)
- `CARETI MODIFICATION` 주석 요구사항

**컴포넌트/UI 개발**:
- `component-architecture-principles.md`
- VSCode 테마 통합 가이드
- i18n 국제화 패턴

**테스트 관련**:
- `testing-guide.md` (Mocha/Vitest/vscode-test 실행 가이드)
- TDD 필수 원칙 (RED → GREEN → REFACTOR)
- 테스트 우선 접근 방식 시행

## 1단계: TDD RED - 통합 테스트 우선
🛑 **중단 지점**: 단위 테스트 전에 통합 테스트를 작성합니다.

### 올바른 TDD 접근법:
1.  **RED**: 실제 사용 시나리오에 대한 통합/E2E 테스트 작성
2.  **GREEN**: 통합 테스트를 통과시키는 데 필요한 모든 코드 구현
3.  **REFACTOR**: 통합 테스트를 통과하는 상태를 유지하며 코드 품질 개선

### 예시:
- **웹뷰 기능**: "사용자가 버튼 클릭 → 예상 결과 표시" 컴포넌트 테스트
- **백엔드 기능**: "설정 변경 → 시스템 동작 변경" 통합 테스트
- **아님**: `isValidInput()` 단위 테스트로 시작

🛑 **중단 지점**: 테스트 파일 위치 확인
- 웹뷰: `src/careti/**/*.test.tsx`만
- 백엔드: `careti-src/__tests__/`
- 즉시 검증: 생성 후 테스트 실행

## 2단계: TDD GREEN - 테스트 통과 구현
🛑 **중단 지점**: Cline 원본 파일을 수정하기 전
- 보호된 파일인가? (`src/`, `webview-ui/`, `proto/`, `scripts/`, `evals/`, `docs/`, `locales/`, 루트 설정)
- `.cline` 백업 생성은 Deprecated (새로 만들지 않음)
- 주석 추가: `// CARETI MODIFICATION: [명확한 설명]`
- 최소 변경: 파일당 최대 1-3줄
- 완전 교체: 오래된 코드를 주석 처리하지 않음

🛑 **중단 지점**: 새 파일 생성 디렉토리 확인
- Careti 기능은 `careti-src/`, `careti-docs/`로 이동 (완전한 자유)
- (예외) 테스트 등으로 보호 디렉토리 내 신규 파일 추가가 불가피하면, 파일 상단에 `// CARETI MODIFICATION:`로 Careti 추가 파일임을 표기
- 임포트 경로가 올바른지 확인
- 즉시 검증: 수정 후 컴파일

## 3단계: TDD REFACTOR - 품질 개선
- [ ] 전체 시스템 검증: 컴파일 성공
- [ ] 모든 테스트 통과
- [ ] 기존 기능에 영향 없음 확인

## 구현 실행
1.  **패턴 기반 구현**: 분석된 아키텍처 패턴 적용
2.  **실시간 문서화**: 체크리스트 및 보고서 업데이트
3.  **검증 및 테스트**: 각 단계 완료 검증
4.  **회귀 확인**: 기존 기능 무결성 확인

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
