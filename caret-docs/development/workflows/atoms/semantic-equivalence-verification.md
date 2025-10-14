확립된 방법론을 사용하여 Markdown과 JSON 워크플로우 형식 간의 의미적 동등성을 검증하고 있습니다.

<detailed_sequence_of_steps>
# 의미적 동등성 검증 - JSON vs Markdown 유효성 검사

## 핵심 원칙
**JSON 형식이 토큰 효율성을 달성하면서 Markdown과 100% 기능적 동등성을 유지하도록 보장**

## 검증 방법론 (Caret JSON System Prompt 분석 기반)

### 1단계: 기능 커버리지 분석
**정보 완전성 비교:**
- [ ] 모든 핵심 원칙이 보존됨
- [ ] 모든 절차적 단계가 포함됨
- [ ] 모든 제약 사항과 규칙이 유지됨  
- [ ] 모든 검증 단계가 존재함
- [ ] 모든 관련 워크플로우가 참조됨

### 2단계: 실행 동등성 테스트
**두 형식이 동일한 작업을 생성하는지 검증:**
- [ ] 동일한 명령 시퀀스 생성
- [ ] 동일한 유효성 검사 단계 수행
- [ ] 동일한 오류 처리 절차
- [ ] 동일한 복구 프로세스 수행

### 3단계: AI 행동 테스트  
**실제 AI 해석 테스트:**
```
테스트 시나리오: "src/extension.ts 파일 수정"

Markdown 형식 결과:
1. Cline 원본인지 확인: ✓
2. 백업 생성: cp src/extension.ts src/extension.ts.cline  
3. 주석 추가: // CARET MODIFICATION: [설명]
4. 변경 제한: 최대 1-3줄
5. 검증: npm run compile

JSON 형식 결과:
1. protected_dirs 확인: ✓
2. backup_commands 실행: cp src/extension.ts src/extension.ts.cline
3. modification_rules.comment 적용: // CARET MODIFICATION: [설명]  
4. modification_rules.max_lines 강제: 3
5. modification_rules.verification 실행: npm run compile

예상: 동일한 실행 플로우 ✓
```

### 4단계: 정량적 분석
**효율성 향상 측정:**
```javascript
// 토큰 카운팅 (확립된 방법 사용)
const markdownTokens = approximateTokenCount(markdownContent);
const jsonTokens = approximateTokenCount(jsonContent);
const efficiency = ((markdownTokens - jsonTokens) / markdownTokens * 100);

// 목표: 기능 손실 없이 >40% 토큰 감소
```

### 5단계: 의미적 동등성 점수 계산
**Caret JSON System Prompt 방법론 기반:**

```javascript
const semanticScore = {
  functionalCoverage: (preservedFeatures / totalFeatures) * 100,
  executionEquivalence: (identicalCommands / totalCommands) * 100, 
  constraintPreservation: (preservedConstraints / totalConstraints) * 100,
  relationshipMaintenance: (preservedRelations / totalRelations) * 100
};

const overallScore = (
  semanticScore.functionalCoverage * 0.4 +
  semanticScore.executionEquivalence * 0.3 +
  semanticScore.constraintPreservation * 0.2 +
  semanticScore.relationshipMaintenance * 0.1
);

// 목표: >95% 의미적 동등성 점수
```

## 검증 결과 템플릿

### ✅ 동등성 확인 영역:
- 핵심 원칙: 100% 보존
- 명령 시퀀스: 100% 동일
- 제약 규칙: 100% 유지
- 검증 단계: 100% 보존

### ⚠️ 형식 차이 (기능에 영향 없음):
- 표현: 자연어 vs 구조화된 데이터
- 접근성: 사람이 읽기 쉬운 것 vs 기계 최적화
- 처리: 순차 읽기 vs 직접 접근

### 🎯 최종 동등성 점수: X.X%

**토큰 효율성**: X.X% 감소
**기능 보존**: X.X% 유지
**행동 일관성**: X.X% 동일

## 다른 워크플로우와의 통합
- Markdown 워크플로우를 JSON으로 변환하기 전에 적용
- 검증 결정을 위해 `/critical-verification`과 함께 사용
- 문서 조직화 품질 보증을 위해 `/document-organization`에 필수
- 아토믹 워크플로우 JSON 변환 검증에 필요

## 참조 구현
입증된 방법론 기반:
`caret-main/caret-docs/reports/json-caret/semantic-equivalence-report.md`

이 확립된 접근법은 완전한 기능 커버리지를 유지하면서 95.2% 의미적 동등성을 달성했습니다.

## 자동화된 도구 사용
자동화된 의미적 동등성 검사기 사용:
```bash
node caret-scripts/utils/semantic-equivalence-checker.js <markdown-file> <json-file>
```

예시:
```bash
node caret-scripts/utils/semantic-equivalence-checker.js .caretrules/workflows/backup-protocol.md caret-docs/experiments/backup-protocol-json.json
```

고급 분석을 위해서는 범용 분석기를 사용:
```bash
node caret-scripts/utils/universal-semantic-analyzer.js <file1> <file2> workflow markdown json
```

도구가 제공하는 기능:
- 토큰 효율성 분석 (목표: >40% 감소)
- 기능 커버리지 분석 (목표: >95%)
- 실행 동등성 테스트 (목표: >95%) 
- 전체 의미적 점수 계산 (목표: >95.2%)
</detailed_sequence_of_steps>

<general_guidelines>
이 검증 방법론은 JSON 변환이 완전한 기능적 동등성을 보존하도록 보장합니다.

정량적 접근법은 의미 보존에 대한 객관적 검증을 제공합니다.

품질과 일관성을 보장하기 위해 형식 변환 전에 이 워크플로우를 사용하세요.
</general_guidelines>