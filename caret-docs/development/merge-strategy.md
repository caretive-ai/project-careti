# Caret-Cline 병합 전략 워크플로우

Caret 프로젝트 병합 전략을 도울 때, Cline 코드 수정 시 병합 전략 가이드 원칙을 따릅니다.

## 1. 수정 범위 분석
1.  필요한 변경의 성격을 식별합니다:
    ```bash
    # 어떤 파일이 수정되고 있는지 확인
    git status
    git diff --name-only
    ```

2.  수정 수준을 분류합니다:
    - **Level 1**: 독립 모듈 (`caret-src/`, `caret-docs/`) - 완전한 자유
    - **Level 2**: 조건부 통합 - 최소한의 Cline 코드 변경
    - **Level 3**: 직접 수정 - 백업과 함께 사용하는 최후의 수단

## 2. 병합 전략 적용
1.  **Level 1 (독립 모듈) 선호**:
    -   `caret-src/` 디렉토리에 새로운 기능 생성
    -   상속/합성을 사용하여 Cline 기능 확장
    -   예시: `CaretProvider extends WebviewProvider`

2.  **Level 2 (조건부 통합) 필요 시**:
    -   원본 파일 백업: `cp original.ts original.ts.cline`
    -   `// CARET MODIFICATION:` 주석 추가
    -   최소한의 1-3줄 변경
    -   조건부 로직 사용: `if (isCaretMode()) { ... }`

3.  **Level 3 (직접 수정) - 최후의 수단**:
    -   상속/합성이 불가능할 때만 사용
    -   반드시 원본 파일을 먼저 백업
    -   `CARET MODIFICATION` 주석에 이유 문서화
    -   Cline과 Caret 기능 모두 테스트

## 3. 검증 단계
1.  백업이 존재하고 복원 가능한지 확인합니다:
    ```bash
    # 백업 파일 존재 확인
    find . -name "*.cline" | head -10
    
    # 복원 과정 테스트
    cp src/extension.ts.cline src/extension.ts
    npm run compile  # 작동해야 함
    git checkout src/extension.ts  # 수정 사항 복원
    ```

2.  두 모드를 모두 테스트합니다:
    -   Cline 원본 기능이 여전히 작동함
    -   Caret 확장이 예상대로 작동함
    -   충돌이나 회귀 없음

## 4. 미래 병합 준비
1.  모든 Cline 파일 수정을 문서화합니다:
    ```bash
    # 모든 CARET MODIFICATION 주석 찾기
    grep -r "CARET MODIFICATION" src/ webview-ui/ --include="*.ts" --include="*.tsx"
    ```

2.  병합 충돌 해결 계획을 수립합니다:
    -   수정된 파일과 변경 이유 목록 작성
    -   충돌 해결 전략 준비
    -   더미 브랜치로 병합 시나리오 테스트

## 5. 사용자 확인 요청
Level 2 또는 Level 3 수정을 적용하기 전에:
   ```xml
   <ask_followup_question>
   <question>Cline 원본 파일 {filename}을(를) 수정해야 합니다.
   
   수정 이유: {reason}
   변경 범위: {number} 줄
   백업 생성 예정: {filename}.cline
   
   이 Cline 파일 수정을 진행할까요?</question>
   <options>["네, 백업과 함께 진행하세요", "아니요, 대안을 찾아보세요", "먼저 변경 사항을 검토하겠습니다"]</options>
   </ask_followup_question>
