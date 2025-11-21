확립된 패턴과 프로토콜을 따라 Caret 프로젝트 개발 작업을 진행 중입니다.

<detailed_sequence_of_steps>
# Caret 개발 워크플로우

## 1. 개발 전 분석
1. 작업 특성과 필요한 문서 식별:
   ```xml
   <ask_followup_question>
   <question>이것은 어떤 유형의 개발 작업입니까?
   
   - Frontend-Backend 상호작용
   - Cline 원본 파일 수정
   - 컴포넌트/UI 개발
   - 테스트 관련 작업
   - 기타 (명시)
   
   이것은 내가 확인해야 할 필수 문서를 결정합니다.</question>
   <options>["Frontend-Backend", "Cline 수정", "컴포넌트/UI", "테스트", "기타"]</options>
   </ask_followup_question>
   ```

2. 작업 유형에 따라 필수 문서 확인:
   - **Cline 수정**: 백업 규칙, CARET MODIFICATION 요구사항
   - **Frontend-Backend**: 상호작용 패턴, 아키텍처 가이드
   - **컴포넌트/UI**: 컴포넌트 원칙, 테마 통합
   - **테스트**: TDD 프로토콜, 테스트 가이드

## 2. TDD 구현
1. **RED Phase**: 실패하는 통합 테스트를 먼저 작성
   ```bash
   # 올바른 위치에 테스트 파일 생성
   touch src/caret/**/*.test.{ts,tsx}
   
   # 테스트 실행하여 실패 확인
   npm run test:webview
   ```

2. **GREEN Phase**: 테스트를 통과시키는 최소한의 구현
   - Cline 파일 수정이 필요한지 확인
   - 필요시: 백업 생성 `cp original.ts original.ts.cline`
   - `// CARET MODIFICATION:` 주석 추가
   - 최소한의 1-3줄 변경

3. **REFACTOR Phase**: 코드 품질 개선
   ```bash
   # 전체 시스템이 여전히 작동하는지 확인
   npm run compile
   npm run test:all
   ```

## 3. 검증 단계
1. 포괄적인 테스트 실행:
   ```bash
   # Backend 테스트
   npm run test:backend
   
   # Frontend 테스트  
   npm run test:webview
   
   # 타입 검사
   npm run check-types
   
   # 린팅
   npm run lint
   ```

2. Cline 기능이 손상되지 않았는지 확인:
   ```bash
   # 원래 Cline 기능 테스트
   npm run watch  # VS Code 확장 실행
   # 핵심 Cline 기능의 수동 테스트
   ```

## 4. 문서 업데이트
1. 새로운 패턴이 발견되면 관련 문서 업데이트
2. 개발 가이드에 예시 추가
3. 발견 사항으로 작업 로그 업데이트

## 5. 확인 요청
Cline 파일을 수정하기 전:
   ```xml
   <ask_followup_question>
   <question>Cline 원본 파일을 수정해야 합니다: {filename}
   
   이유: {modification_reason}
   영향 받는 라인: {number}
   백업이 생성될 위치: {filename}.cline
   
   이는 Level 2 조건부 통합 접근법을 따릅니다.
   
   수정을 진행하시겠습니까?</question>
   <options>["예, 백업 생성 후 수정", "아니요, 대안 접근법 찾기", "계획된 변경사항을 먼저 보여주세요"]</options>
   </ask_followup_question>
   ```
</detailed_sequence_of_steps>

<general_guidelines>
항상 TDD 사이클을 따르세요: 통합 테스트 우선, 그 다음 최소한의 구현, 그리고 리팩터링.

백업과 CARET MODIFICATION 주석 없이는 절대 Cline 파일을 수정하지 마세요.

Level 2 (조건부 통합)보다 Level 1 (독립 모듈)을 선호하세요.

발견 사항을 문서화하고 새로운 패턴이 발견되면 가이드를 업데이트하세요.
</general_guidelines>