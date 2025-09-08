# t06 - Phase 3: 의미론적 검증 (Semantic Verification)

## 1. 🎯 검증 목표

`CaretJsonAdapter`와 `ClineLatestAdapter`가 생성하는 시스템 프롬프트가 각기 다른 기술 스택(JSON vs. 컴포넌트)을 사용함에도 불구하고, 최종적으로 AI 모델에게 전달되는 지시사항의 **의미론적 동등성**을 검증한다. 특히, Caret의 핵심 철학인 '작업 관리 루프'와 관련된 기능들이 두 시스템에서 동등한 역할과 의미로 구현되었는지 확인하는 것을 목표로 한다.

---

## 2. ⚖️ 프롬프트 비교 분석

이 섹션에서는 각 어댑터가 생성한 프롬프트의 주요 부분을 나란히 비교하고, 그 의미와 역할이 어떻게 동등하게 유지되는지 분석한다.

### 2.1. 작업 관리 루프 (Task Management Loop)

#### `CaretJsonAdapter` (auto_todo: true)

```
(CaretJsonAdapter의 CARET_TODO_MANAGEMENT.json 포함 프롬프트 출력 결과가 여기에 삽입될 예정입니다.)
```

#### `ClineLatestAdapter` (auto_todo 활성화)

```
(ClineLatestAdapter의 auto_todo 관련 프롬프트 출력 결과가 여기에 삽입될 예정입니다.)
```

**분석:**
*   (두 프롬프트의 내용이 어떻게 '자동 TODO 목록 관리'라는 동일한 목표를 달성하는지 여기에 분석 내용이 기록될 예정입니다.)

---

## 3. 📊 AI 시맨틱 분석 (선택사항)

`caret-scripts/ai-semantic-analyzer.js`를 사용하여 두 프롬프트 간의 의미론적 동등성 점수를 측정한다.

*   **동등성 점수:** (측정된 점수가 여기에 기록될 예정입니다) / 100
*   **기준:** 85% 이상일 경우 통과

---

## 4. ✅ 최종 결론

(두 시스템 프롬프트가 의미론적으로 동등한지, 그리고 Phase 3의 목표를 달성했는지에 대한 최종 결론이 여기에 기록될 예정입니다.)
