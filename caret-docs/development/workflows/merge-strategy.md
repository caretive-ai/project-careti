Caret 프로젝트 병합 전략을 도와드립니다. Cline 코드 수정을 다룰 때 병합 전략 가이드 원칙을 따르세요.

<detailed_sequence_of_steps>
# Caret-Cline 병합 전략 워크플로우

## 1. 수정 범위 분석
1. 필요한 변경사항의 성격 파악:
   ```bash
   # 어떤 파일이 수정되고 있는지 확인
   git status
   git diff --name-only
   ```

2. 수정 수준 분류:
   - **레벨 1**: 독립 모듈 (caret-src/, caret-docs/) - 완전 자유도
   - **레벨 2**: 조건부 통합 - 최소한의 Cline 코드 변경
   - **레벨 3**: 직접 수정 - 백업과 함께 최후의 수단

## 2. 병합 전략 적용
1. **레벨 1 우선 (독립 모듈)**:
   - `caret-src/` 디렉토리에 새로운 기능 생성
   - 상속/구성을 사용하여 Cline 기능 확장
   - 예시: `CaretProvider extends WebviewProvider`

2. **레벨 2 필요 시 (조건부 통합)**:
   - 원본 파일 백업: `cp original.ts original.ts.cline`
   - `// CARET MODIFICATION:` 주석 추가
   - 최소 1-3줄 변경
   - 조건부 로직 사용: `if (isCaretMode()) { ... }`

3. **레벨 3 (직접 수정) - 최후의 수단**:
   - 상속/구성이 불가능한 경우에만 사용
   - 반드시 원본 파일 백업
   - CARET MODIFICATION 주석에 이유 문서화
   - Cline과 Caret 기능 모두 테스트

## 3. 검증 단계
1. 백업 존재 및 복원 가능성 확인:
   ```bash
   # 백업 파일 존재 확인
   find . -name "*.cline" | head -10
   
   # 복원 프로세스 테스트
   cp src/extension.ts.cline src/extension.ts
   npm run compile  # 작동해야 함
   git checkout src/extension.ts  # 수정사항 복원
   ```

2. 양쪽 모드 테스트:
   - Cline 원본 기능이 여전히 작동하는지
   - Caret 확장이 예상대로 작동하는지
   - 충돌이나 회귀 없는지

## 4. 향후 병합 준비
1. 모든 Cline 파일 수정사항 문서화:
   ```bash
   # 모든 CARET MODIFICATION 주석 찾기
   grep -r "CARET MODIFICATION" src/ webview-ui/ --include="*.ts" --include="*.tsx"
   ```

2. 병합 충돌 해결 계획 수립:
   - 수정된 파일과 변경 이유 목록화
   - 충돌 해결 전략 준비
   - 더미 브랜치로 병합 시나리오 테스트

## 5. 사용자 확인 요청
레벨 2 또는 레벨 3 수정 적용 전:
   ```xml
   <ask_followup_question>
   <question>Cline 원본 파일을 수정해야 합니다: {filename}
   
   수정 이유: {reason}
   변경 범위: {number} 줄
   백업 생성 예정: {filename}.cline
   
   이 Cline 파일 수정을 진행하시겠습니까?</question>
   <options>["예, 백업과 함께 진행", "아니요, 대안 방법 찾기", "변경사항을 먼저 검토하겠습니다"]</options>
   </ask_followup_question>
   ```
</detailed_sequence_of_steps>

<general_guidelines>
항상 계층을 따르세요: 레벨 1 → 레벨 2 → 레벨 3. 레벨 1과 2 옵션을 탐색하지 않고 레벨 3로 직접 점프하지 마세요.

Cline 파일을 수정할 때는 향후 병합 시나리오를 고려하세요. 수정되는 파일이 적을수록 업스트림 병합이 쉬워집니다.

모든 아키텍처 결정과 수정 이유를 향후 참조를 위해 문서화하세요.
</general_guidelines>