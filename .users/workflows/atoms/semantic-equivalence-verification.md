# 의미적 동등성 검증 - JSON vs Markdown 검증

확립된 방법론을 사용한 Markdown과 JSON 워크플로우 형식 간의 의미적 동등성 검증입니다.

## 핵심 원칙
**JSON 형식이 토큰 효율성을 달성하면서 Markdown과 100% 기능적 동등성을 유지하는지 확인**

## 검증 방법론 (Caret JSON 시스템 프롬프트 분석 기반)

### 단계 1: 기능 커버리지 분석
**정보 완전성 비교:**
- [ ] 모든 핵심 원칙 보존
- [ ] 모든 절차적 단계 포함
- [ ] 모든 제약 조건과 규칙 유지
- [ ] 모든 검증 단계 존재
- [ ] 모든 관련 워크플로우 참조

### 단계 2: 실행 동등성 테스트
**두 형식이 동일한 동작을 생성하는지 검증:**
- [ ] 동일한 명령 시퀀스 생성
- [ ] 동일한 검증 단계 수행
- [ ] 동일한 오류 처리 절차
- [ ] 동일한 복구 프로세스

### 단계 3: AI 동작 테스트
**실제 AI 해석 테스트:**
```
테스트 시나리오: "src/extension.ts 파일 수정"

Markdown 형식 결과:
1. Cline 원본인지 확인: ✓
2. 주석 추가: // CARETI MODIFICATION: [설명]
3. 변경 제한: 최대 1-3줄
4. 검증: npm run compile

JSON 형식 결과:
1. protected_dirs 확인: ✓
2. modification_rules.comment 적용: // CARETI MODIFICATION: [설명]
3. modification_rules.max_lines 적용: 3
4. modification_rules.verification 실행: npm run compile

예상: 동일한 실행 플로우 ✓
```

### 단계 4: 정량적 분석
**효율성 향상 측정:**
```javascript
// 토큰 카운팅 (확립된 방법 사용)
const markdownTokens = approximateTokenCount(markdownContent);
const jsonTokens = approximateTokenCount(jsonContent);
const efficiency = ((markdownTokens - jsonTokens) / markdownTokens * 100);

// 목표: 기능 손실 없이 >40% 토큰 감소
```

### 단계 5: 의미적 동등성 점수 계산
**Caret JSON 시스템 프롬프트 방법론 기반:**

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

### ✅ 동등성 확인된 영역:
- 핵심 원칙: 100% 보존
- 명령 시퀀스: 100% 동일
- 제약 규칙: 100% 유지
- 검증 단계: 100% 보존

### ⚠️ 형식 차이 (비기능적):
- 표현: 자연어 vs 구조화 데이터
- 접근성: 인간 가독성 vs 기계 최적화
- 처리: 순차 읽기 vs 직접 접근

### 🎯 최종 동등성 점수: X.X%

**토큰 효율성**: X.X% 감소
**기능 보존**: X.X% 유지
**동작 일관성**: X.X% 동일

## 다른 워크플로우와의 통합
- Markdown 워크플로우를 JSON으로 변환하기 전에 적용
- 검증 결정에 `/critical-verification` 사용
- `/document-organization` 품질 보증에 필수
- 원자적 워크플로우 JSON 변환 검증에 필요

## 참조 구현
검증된 방법론 기반:
`careti-main/careti-docs/reports/json-caret/semantic-equivalence-report.md`

이 확립된 접근법은 완전한 기능 커버리지를 유지하면서 95.2% 의미적 동등성을 달성했습니다.

## 자동화 도구 사용
자동화된 의미적 동등성 검사기 사용:
```bash
node careti-scripts/utils/semantic-equivalence-checker.js <markdown-file> <json-file>
```

예시:
```bash
node careti-scripts/utils/semantic-equivalence-checker.js .agents/workflows/backup-protocol.md careti-docs/experiments/backup-protocol-json.json
```

고급 분석을 위해 유니버설 분석기 사용:
```bash
node careti-scripts/utils/universal-semantic-analyzer.js <file1> <file2> workflow markdown json
```

도구가 제공하는 것:
- 토큰 효율성 분석 (목표: >40% 감소)
- 기능 커버리지 분석 (목표: >95%)
- 실행 동등성 테스트 (목표: >95%)
- 전체 의미적 점수 계산 (목표: >95.2%)

## 일반 가이드라인
이 검증 방법론은 JSON 변환이 완전한 기능적 동등성을 유지하도록 보장합니다.

정량적 접근법은 의미적 보존에 대한 객관적인 검증을 제공합니다.

품질과 일관성을 보장하기 위해 모든 형식 변환 전에 이 워크플로우를 사용하세요.

## 미러링 정책
- 이 파일 수정 시 `.agents/workflows/atoms/semantic-equivalence-verification.md`도 동일하게 업데이트
