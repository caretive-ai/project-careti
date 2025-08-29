# AI 에이전트 성능 비교 실험 설계서

## 1. 실험 목적

본 실험의 주요 목적은 **Caret**과 **Cline** AI 코딩 어시스턴트의 성능을 정량적으로 비교 분석하는 것입니다. Caret은 Cline을 기반으로 개선되었으며, Cline 모드를 지원하므로 두 에이전트 간의 직접적인 성능 비교가 가능합니다.

또한, **Cursor**와의 비교를 통해 외부 AI 에이전트와의 성능 차이도 함께 분석하여 Caret의 상대적 성능 수준을 파악하고자 합니다.

## 2. 실험 대상 및 변수

### 2.1. 실험 과제 (4종)

1.  **Calculator**: 간단한 웹 계산기 애플리케이션 개발 (브라우저 기반)
2.  **Markdown**: 마크다운 뷰어 애플리케이션 개발 (브라우저 기반)
3.  **Todolist**: Todo 리스트 애플리케이션 개발 (브라우저 기반)
4.  **JSON-Processor**: JSON 데이터 처리 시스템 개발 (Node.js CLI 기반, 복잡한 로직 위주)

### 2.2. 비교 대상 AI 에이전트

*   **Caret vs. Cline (주요 비교)**
    *   **AI 에이전트**: `caret`, `cline`
    *   **사용 모델**:
        *   `gemini-2.5-pro-preview-06-05 extended thinking`
        *   `gemini-2.5-flash-preview-05-20 extended thinking`
    *   **비교 조합**: 4개 과제 x 2개 모델 x 2개 AI 에이전트 = **총 16회 실험**
    *   **아래는 세션의 명령 예시**
```
@/caret-docs\reports\experiment\json_caret_performance_test_20250713\calcualtor-comparison-instructions.md  에 따라 실험 진행해줘.
AI에이전트명은 caret-gemini-2.5-pro-preview-06-05-think1024
```

```
@/caret-docs\reports\experiment\json_caret_performance_test_20250713\json-processor-comparison-instructions.md  에 따라 실험 진행해줘.
AI에이전트명은 caret-gemini-2.5-flash-preview-05-20-think1024
```

*   **Caret vs. Cursor (부가 비교)**
    *   **AI 에이전트**: `caret`, `cursor`
    *   **사용 모델**: `claude-3.7-sonet`
    *   **비교 조합**: 4개 과제 x 1개 모델 x 2개 AI 에이전트 = **총 8회 실험**
    *   **특이사항**: 공정한 비교를 위해, 이 실험에서는 Caret 에이전트도 외부 API 설정을 통해 `claude-3.7-sonet` 모델을 사용하도록 구성합니다. 이를 통해 동일한 모델 조건 하에서 각 에이전트의 순수 성능(처리 속도, API 호출 효율성 등)을 측정합니다.

## 3. 실험 수행 방법

### 3.1. 공통 수행 절차

1.  각 실험 과제에 해당하는 **작업 지시서**(`...-comparison-instructions.md`)의 5단계 절차를 정확히 따릅니다.
2.  각 단계별로 명시된 요청(prompt)을 AI 에이전트에게 전달하고, 결과물을 생성합니다.
3.  모든 단계가 완료되면, 5단계에 명시된 **성능 보고서 생성 스크립트**를 실행합니다.
    ```bash
    # 예시: calculator 과제를 caret 에이전트로 수행한 경우
    node ./generate-report.js calculator caret
    ```
4.  생성된 성능 보고서(`{AI에이전트명}-{yyyymmdd}-report.md`)를 해당 과제 폴더에 저장합니다.

### 3.2. 에이전트별 수행 환경

*   **Caret/Cline**: Caret VSCode 익스텐션 내에서 `Caret` 또는 `Cline` 모드를 선택하여 실험을 진행합니다.
    *   **Caret vs. Cursor 비교 시**: Caret의 모델 설정을 `claude-3.7-sonet`으로 변경하여 외부 API를 통해 실험을 진행합니다.
*   **Cursor**: Cursor IDE 환경에서 동일한 과제와 요청을 사용하여 실험을 진행합니다. Cursor의 경우, 성능 데이터(토큰 사용량, 비용 등)를 수동으로 기록해야 할 수 있습니다.

## 4. 측정 지표 및 분석 방법론

### 4.1. 핵심 측정 지표

개별 성능 보고서 생성 스크립트를 통해 다음 기본 지표를 자동으로 추출하고 기록합니다.

*   **총 입력/출력 토큰 (Total Tokens In/Out)**: API 호출에 사용된 총 토큰 수
*   **총 API 비용 (Total Cost)**: API 사용에 따른 예상 비용
*   **총 API 호출 횟수 (Total API Calls)**: 전체 과업 수행 중 API를 호출한 총 횟수
*   **총 실행 시간 (Total Latency)**: 첫 작업 시작부터 마지막 작업 완료까지의 시간

### 4.2. 종합 분석 방법론

종합 보고서(`comprehensive-performance-report.md`)는 단순 합산이 아닌, 다음과 같은 다각적인 방법론을 통해 생성됩니다.

1.  **API 호출당 효율성 분석 (Per-Call Analysis)**
    *   모든 핵심 지표(비용, 시간, 토큰)를 **총 API 호출 횟수**로 나누어, **호출 1회당 효율성**을 중심으로 분석합니다. 이를 통해 호출 횟수에 가려진 실제 성능을 파악합니다.

2.  **통계적 분석 (Statistical Analysis)**
    *   단순 평균(Average)뿐만 아니라, **중앙값(Median)**과 **표준편차(σ, Standard Deviation)**를 함께 계산합니다.
    *   **중앙값**은 극단적인 값(이상치)의 영향을 덜 받아 일반적인 성능을 파악하는 데 유용합니다.
    *   **표준편차**는 성능의 일관성과 안정성을 측정하는 지표로, 값이 낮을수록 예측 가능한 성능을 보입니다.

3.  **이상치 분석 및 제외 (Outlier Analysis & Exclusion)**
    *   **그룹별 이상치 탐지**: '같은 과업, 같은 에이전트, 같은 모델' 그룹 내에서 `평균 + 1.5 * 표준편차`를 초과하는 값을 '이상치'로 식별하고 보고합니다. 이를 통해 '어렵게 성공한 케이스'를 명확히 파악합니다.
    *   **이상치 제외 분석**: 이상치를 제거한 정제된 데이터만으로 성능을 다시 비교하는 분석을 병행하여, 소수의 실패 케이스가 전체 평균을 왜곡하는 현상을 방지하고 에이전트의 순수 성능을 비교합니다.

4.  **조건부 비교 분석 (Conditional Comparison)**
    *   **Pro 모델 한정 비교**: 성능 편차가 큰 Flash 모델을 제외하고, Pro 모델만을 사용했을 때의 성능을 별도로 비교하여 에이전트 간의 순수 성능 차이를 심층 분석합니다.

## 5. 종합 분석 도구

### 5.1. 종합 보고서 생성 스크립트

모든 개별 실험이 완료된 후, 다음 스크립트를 사용하여 상기 분석 방법론이 모두 적용된 종합 성능 분석 보고서를 생성할 수 있습니다.

```bash
node generate-comprehensive-report.js
```

**출력 파일:** `comprehensive-performance-report-YYYYMMDD.md`

### 5.3. 실험 진행 현황 추적

현재까지 진행된 실험 현황:
- **Calculator**: ✅ 완료 (12개 실험)
- **Markdown**: 🔄 진행중 (8개 실험)  
- **Todolist**: ⏳ 예정
- **JSON-Processor**: ⏳ 예정

## 6. 기대 효과

본 실험을 통해 각 AI 에이전트와 모델 조합의 성능 특성을 명확히 파악하고, Caret의 개선 방향과 성능 최적화를 위한 구체적인 데이터를 확보할 수 있을 것으로 기대합니다.

**예상 결과:**
- Caret과 Cline의 정량적 성능 차이 분석
- 각 모델(Pro/Flash)의 비용-성능 트레이드오프 파악
- 과업 유형별 최적 에이전트-모델 조합 도출
- 향후 Caret 개발 방향성에 대한 데이터 기반 인사이트
