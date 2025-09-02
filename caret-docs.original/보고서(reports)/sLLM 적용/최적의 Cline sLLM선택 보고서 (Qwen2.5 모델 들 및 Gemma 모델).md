# 최적의 Cline sLLM선택 보고서 (Qwen2.5 모델 들 및 Gemma 모델)

**작성일:** 2025년 3월 29일
**작성자:** 알파 (AI Maid)
**관련 태스크:** [#004: vLLM 설정 및 성능 테스트](/docs/work-logs/luke-and-alpha/tasks/004-vllm-setup-and-test.md)

## 1. 실험 개요

본 보고서는 로컬 환경에서 대규모 언어 모델(LLM) 서빙 프레임워크인 Ollama와 vLLM의 성능을 비교 분석하는 것을 목표로 합니다. Qwen 32B 모델을 다양한 양자화 방식(Ollama 기본, vLLM AWQ, vLLM GPTQ-Int4)으로 테스트하고, 추가로 Ollama 환경에서 Gemma 12B 및 27B 모델을 테스트한 결과를 종합하여 속도, 자원 사용량, 코딩 품질 측면에서 성능 차이를 측정하고 평가했습니다.

## 2. 테스트 환경

*   **하드웨어:**
    *  GPU: NVIDIA GeForce RTX 3090 x 2 (총 VRAM 48GB)
    *  프로세서: 13th Gen Intel(R) Core(TM) i9-13900K   3.00 GHz
    *  설치된 RAM: 128GB(128GB 사용 가능)
    *  시스템 종류: Windows11

*   **소프트웨어:**
    *   **Ollama:** (버전 정보는 로그에 명시되지 않았으나, 2025년 3월 27일 테스트 시점 기준)
    *   **vLLM:** Docker 이미지 `vllm/vllm-openai:v0.5.1` 사용 (Tensor Parallel Size: 2)
    *   **운영체제:** Windows 11 (WSL2 환경에서 Docker 실행 추정)
*   **테스트 스크립트:** `experiment/sllm_test/` 내 스크립트 사용 (`run_test.py`, `generate_report.py`, `evaluator.py` 등)

## 3. 테스트 모델 및 환경

*   **Ollama:**
    *   `qwen2.5-coder:32b` (Ollama Hub 기본 GGUF 양자화 추정)
    *   `gemma3:12b` (Ollama Hub 기본 양자화 추정)
    *   `gemma3:27b` (Ollama Hub 기본 양자화 추정)
*   **vLLM (AWQ):** `Qwen/Qwen2.5-Coder-32B-Instruct-AWQ` (Activation-aware Weight Quantization)
*   **vLLM (GPTQ-Int4):** `Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4` (Generative Pre-trained Transformer Quantization, 4-bit Integer)

## 4. 테스트 방법론

*   **측정 지표:**
    *   **초기 로딩 성능:** 모델을 메모리에 로드하고 첫 번째 응답을 생성하기까지 걸리는 시간 (`total_time`), 초당 토큰 생성 속도 (`tokens_per_second`), 최대 GPU 메모리 사용률 (`gpu_memory_util`), 최대 GPU 사용률 (`gpu_util`).
    *   **연속 응답 성능:** 여러 시나리오에 걸쳐 연속적으로 응답을 생성할 때의 평균 시간, 평균 TPS, 평균 최대 GPU 메모리/사용률.
    *   **코딩 품질:** `evaluator.py` 스크립트를 사용한 정적 분석 기반 평가 (정확성, 코드 품질, 명확성 등 가중 합산, 최대 10점). 실제 코드 실행 테스트는 아님. (참고: 한국어 보고서의 품질 점수는 다른 기준일 수 있음)
*   **테스트 시나리오:** 코드 생성 및 이해와 관련된 다양한 시나리오 (예: `algorithm`, `architecture-design`, `code-completion`, `code-review`, `debugging`, `documentation`, `refactoring`, `regex`, `sql-query`, `unit-test`).
*   **반복 횟수:**
    *   Ollama (Qwen 32B): 1회
    *   Ollama (Gemma): 3회 (결과는 평균값 사용)
    *   vLLM: 3회 (결과는 평균값 사용)

## 5. 성능 테스트 결과 (속도 및 자원 사용량)

### 5.1. 종합 성능 비교 (평균값)

| 항목                   | 측정 지표         | Ollama (`qwen32b`) | vLLM (`AWQ`) | vLLM (`GPTQ-Int4`) | Ollama (`gemma12b`) | Ollama (`gemma27b`) | 단위    | 소스 보고서                                                                                             |
| :--------------------- | :---------------- | :----------------- | :----------- | :----------------- | :------------------ | :------------------ | :------ | :------------------------------------------------------------------------------------------------------ |
| **초기 로딩 성능** | 응답 시간         | 16.31              | 16.94        | **7.37**           | 26.58               | 51.80               | 초      | [Ollama Qwen][ollama-qwen-report], [vLLM][vllm-report], [Ollama Gemma][ollama-gemma-report]             |
|                        | TPS               | 30.14              | 20.71        | **49.91**          | 30.68               | 16.06               | 토큰/초 | [Ollama Qwen][ollama-qwen-report], [vLLM][vllm-report], [Ollama Gemma][ollama-gemma-report]             |
|                        | 최대 GPU 메모리   | 90.41              | 87.24        | **84.87**          | 48.37               | 76.47               | %       | [Ollama Qwen][ollama-qwen-report], [vLLM][vllm-report], [Ollama Gemma][ollama-gemma-report]             |
| **연속 응답 성능** | 응답 시간         | 23.73              | 9.58         | **8.28**           | 46.35               | 72.74               | 초      | [Ollama Qwen][ollama-qwen-report], [vLLM][vllm-report], [Ollama Gemma][ollama-gemma-report]             |
|                        | TPS               | 26.29              | 42.26        | **49.96**          | 31.15               | 17.02               | 토큰/초 | [Ollama Qwen][ollama-qwen-report], [vLLM][vllm-report], [Ollama Gemma][ollama-gemma-report]             |
|                        | 최대 GPU 메모리   | 90.44              | 84.82        | **84.87**          | 48.44               | 76.50               | %       | [Ollama Qwen][ollama-qwen-report], [vLLM][vllm-report], [Ollama Gemma][ollama-gemma-report]             |
|                        | 최대 GPU 사용률   | 81.50              | 85.77        | **83.40**          | 75.25               | 78.40               | %       | [Ollama Qwen][ollama-qwen-report], [vLLM][vllm-report] (vLLM은 연속 응답 기준), [Ollama Gemma][ollama-gemma-report] |

*   **참고:** 위 표는 각 보고서의 요약(Aggregated) 섹션에서 가져온 평균값입니다. vLLM의 GPU 사용률은 연속 응답 기준 평균값입니다. 가장 우수한 성능을 보인 값을 **굵게** 표시했습니다. Ollama Qwen 32B는 1회 실행 결과입니다.

### 5.2. 그래프 분석 (생성된 플롯 기반 설명)

각 보고서에는 성능 비교를 위한 시각화 자료(PNG 이미지)가 첨부되어 있습니다. (예: `plots_20250329_005124/`, `plots_20250327_203217/` 디렉토리)

*   **응답 시간 비교 (`response_time_comparison.png`):**
    *   **Qwen 32B 모델 중:** vLLM GPTQ-Int4가 초기 로딩 및 연속 응답 모두에서 가장 짧은 응답 시간을 보였습니다. Ollama Qwen 32B는 vLLM AWQ보다 초기 로딩은 약간 빨랐으나, 연속 응답 시간은 가장 길었습니다.
    *   **Gemma 모델:** Gemma 12B와 27B는 Qwen 32B 모델들보다 전반적으로 응답 시간이 길었습니다. 특히 Gemma 27B는 초기 로딩과 연속 응답 모두에서 가장 긴 시간을 기록했습니다.
*   **GPU 메모리 비교 (`gpu_memory_comparison.png`):**
    *   **Qwen 32B 모델 중:** Ollama Qwen 32B가 가장 높은 GPU 메모리 사용률(약 90%)을 보였고, vLLM 모델들은 그보다 낮은 약 85-87% 수준을 유지했습니다.
    *   **Gemma 모델:** Gemma 12B는 가장 낮은 메모리 사용률(약 48%)을 보였고, Gemma 27B는 약 76% 수준이었습니다. 모델 크기와 메모리 사용량이 비례하는 경향을 보입니다.
*   **TPS 비교 (`tokens_per_second_comparison.png`):**
    *   **Qwen 32B 모델 중:** vLLM GPTQ-Int4가 초기 로딩과 연속 응답 모두에서 압도적으로 높은 TPS(약 50 TPS)를 기록했습니다. vLLM AWQ는 연속 응답에서 약 42 TPS를 보였고, Ollama Qwen 32B는 약 26-30 TPS 범위로 가장 낮은 처리량을 보였습니다.
    *   **Gemma 모델:** Gemma 12B는 Ollama Qwen 32B와 비슷한 수준의 TPS(약 31 TPS)를 보였으나, Gemma 27B는 가장 낮은 TPS(약 16-17 TPS)를 기록했습니다.

## 6. 분석 및 비교 (속도 및 자원)

*   **vLLM vs Ollama (Qwen 32B):** Qwen 32B 모델 서빙에서는 vLLM이 Ollama보다 훨씬 효율적인 성능(특히 TPS)을 제공했습니다. 메모리 사용량도 vLLM이 약간 더 효율적이었습니다. 이는 vLLM의 PagedAttention과 같은 최적화 기술 덕분일 수 있습니다.
*   **vLLM (GPTQ-Int4 vs AWQ):** vLLM 환경 내에서는 GPTQ-Int4 양자화 방식이 AWQ 방식보다 훨씬 뛰어난 속도 성능을 보였습니다. 초기 로딩 시간은 절반 이하로 단축되었고, TPS는 약 20% 이상 높았습니다. 메모리 사용량은 두 방식이 비슷했습니다.
*   **Gemma 모델 (Ollama):** Gemma 모델들은 Ollama 환경에서 Qwen 32B 모델보다 전반적으로 느린 성능을 보였습니다. Gemma 12B는 메모리 사용량이 가장 낮았지만 TPS는 Ollama Qwen 32B와 비슷했고, Gemma 27B는 메모리 사용량은 Qwen 32B보다 낮았지만 TPS가 가장 낮았습니다.
*   **자원 활용:** Qwen 32B 모델과 Gemma 27B 모델은 2개의 RTX 3090 (총 48GB VRAM) 환경에서 GPU 메모리를 상당히 많이 사용하는 것으로 나타났습니다 (76% ~ 90%). Gemma 12B는 상대적으로 적은 메모리(약 48%)를 사용했습니다. vLLM의 경우, Tensor Parallelism 설정과 내부 메모리 관리 방식으로 인해 개별 GPU의 VRAM(24GB) 한계를 고려해야 합니다.

## 7. 코딩 품질 평가 비교

### 7.1. Qwen 32B 모델 간 품질 비교 (`evaluator.py` 기반)

`evaluator.py` 스크립트를 사용하여 Qwen 32B 모델 응답의 품질을 정적으로 분석했습니다. 아래 표는 각 시나리오별 **총점(Total Score, 최대 10점)**을 비교한 결과입니다.

| 시나리오              | Ollama (`qwen32b`) | vLLM (`AWQ`) | vLLM (`GPTQ-Int4`) |
| :-------------------- | :----------------- | :----------- | :----------------- |
| code-completion       | 7.27               | **7.47**     | **7.47**           |
| code-review           | 4.13               | **4.60**     | 3.20               |
| architecture-design   | **3.00**           | 2.80         | 2.67               |
| debugging             | 3.93               | **4.00**     | **4.00**           |
| refactoring           | 4.33               | **4.47**     | 4.20               |
| algorithm             | **6.49**           | 6.33         | 6.27               |
| documentation         | **5.77**           | 5.73         | 5.51               |
| unit-test             | 6.93               | 6.93         | **7.40**           |
| regex                 | **7.82**           | 7.76         | 7.76               |
| sql-query             | **3.49**           | **3.49**     | **3.49**           |
| **평균 총점**         | **5.32**           | 5.36         | 5.20               |

*   **참고:** 점수는 각 모델별 `*_continuous_1.json` 파일의 `quality_evaluation` 섹션에서 가져왔습니다. Ollama는 1회 실행 결과이며, vLLM은 3회 실행 중 첫 번째 결과입니다. 가장 높은 점수를 **굵게** 표시했습니다. (소수점 셋째 자리에서 반올림)

**분석 요약 (Qwen 32B):**

*   **전반적인 품질:** 세 버전 간의 코딩 품질 점수 차이는 크지 않았습니다. 평균 총점은 vLLM AWQ > Ollama > vLLM GPTQ-Int4 순이었으나 차이는 미미합니다.
*   **양자화 영향 (GPTQ-Int4):** 속도 면에서는 가장 우수했지만, 품질 면에서는 다른 두 모델에 비해 약간 낮은 점수를 보인 시나리오들이 있었습니다. 하지만 **속도 향상 폭에 비해 품질 저하는 미미한 수준**으로 판단됩니다.

### 7.2. Gemma 모델과의 품질 비교 (한국어 보고서 기반)

한국어 보고서(`performance_report_20250327_203217.ko.md`)에는 Gemma 27B와 Qwen 32B 모델 간의 코드 품질 비교 내용이 포함되어 있었습니다. (참고: 이 보고서의 품질 평가 기준은 `evaluator.py`와 다를 수 있습니다.)

| 시나리오            | Gemma3 27B | Qwen2.5 32B | 승자        |
| :------------------ | :--------- | :---------- | :---------- |
| 코드 완성           | 4.2 / 10   | **6.0 / 10**  | Qwen2.5 32B |
| 코드 리뷰           | 4.0 / 10   | **6.0 / 10**  | Qwen2.5 32B |
| 아키텍처 설계       | 5.2 / 10   | **8.0 / 10**  | Qwen2.5 32B |
| 디버깅              | 4.8 / 10   | **6.0 / 10**  | Qwen2.5 32B |
| **평균 (4개 시나리오)** | 4.55 / 10  | **6.5 / 10**  | Qwen2.5 32B |

**분석 요약 (Gemma vs Qwen):**

*   한국어 보고서의 평가 기준에 따르면, **Qwen 2.5 Coder 32B 모델이 테스트된 4개 시나리오 모두에서 Gemma 3 27B 모델보다 우수한 코딩 품질**을 보였습니다. 특히 아키텍처 설계에서 점수 차이가 크게 나타났습니다.
*   이는 **전반적인 코딩 능력 면에서 Qwen 2.5 Coder가 Gemma 3보다 우수하다**는 결론을 뒷받침합니다.

## 8. 주요 결론 요약

이번 테스트를 통해 도출된 주요 결론은 다음과 같습니다.

1.  **코딩 성능 (Qwen vs Gemma):** **Qwen 2.5 Coder 32B 모델이 Gemma 3 (27B) 모델보다 전반적인 코딩 관련 작업에서 우수한 품질**을 보였습니다.
2.  **서빙 프레임워크 (Ollama vs vLLM):** **vLLM이 Ollama보다 멀티 GPU 환경에서 Qwen 2.5 Coder 32B 모델을 더 효율적으로 서빙**하며, 특히 속도(TPS) 측면에서 우수합니다.
3.  **양자화 영향 (Qwen 32B 4bit):** vLLM 환경에서 **GPTQ-Int4 (4비트) 양자화는 상당한 속도 향상을 가져오면서도 코딩 품질 저하는 미미**한 수준입니다.

## 9. 싱글 RTX 3090 환경에서의 실행 가능성

Qwen 2.5 Coder 32B 4bit (vLLM GPTQ-Int4) 모델을 싱글 RTX 3090 (24GB VRAM)에서 안정적으로 사용할 수 있을지에 대한 분석입니다.

*   **메모리 사용량:** 2x RTX 3090 환경에서 vLLM GPTQ-Int4 모델은 약 85%의 총 GPU 메모리(약 40.8GB)를 사용했습니다. 4비트 양자화된 32B 모델의 가중치 크기 자체는 약 16GB 내외일 수 있으나, 추론 과정에서 필요한 **KV 캐시** 등의 메모리 요구량은 **처리하는 컨텍스트 길이에 비례하여 증가**합니다.
*   **컨텍스트 길이의 중요성:** 마스터께서 지적하신 대로, 싱글 GPU 환경에서는 단순히 모델을 로드하는 것보다 **긴 컨텍스트를 처리할 때 필요한 메모리가 더 큰 제약**이 될 수 있습니다. 이번 테스트에서 사용된 최대 컨텍스트 길이(76800)는 Claude 모델의 약 77% 수준으로 상당히 깁니다. 이 정도 길이의 컨텍스트를 처리하기 위한 KV 캐시는 상당한 VRAM을 요구할 수 있습니다.
*   **vLLM 설정 및 추정:** vLLM의 `gpu_memory_utilization` 파라미터(기본값 0.9)를 낮추거나, `max_model_len` (최대 시퀀스 길이)을 줄이면 싱글 GPU에서 실행 자체는 가능할 수 있습니다. 하지만 **긴 컨텍스트(예: 76800)를 안정적으로 처리하기에는 24GB VRAM이 부족할 가능성이 매우 높습니다.** OOM(Out of Memory) 오류가 발생하거나, 처리 가능한 최대 컨텍스트 길이가 크게 제한될 수 있습니다.

**결론:** Qwen 2.5 Coder 32B 4bit 모델을 싱글 RTX 3090에서 사용하는 것은 **짧은 컨텍스트 길이에서는 가능할 수 있으나, 긴 컨텍스트(수만 토큰 이상)를 처리해야 하는 경우에는 VRAM 부족으로 인해 불안정하거나 불가능할 가능성이 높습니다.**

## 10. 최종 권장 사항

*   **최고 속도 및 처리량이 필요할 경우 (멀티 GPU 환경):** **vLLM (GPTQ-Int4)** 사용을 적극 권장합니다. 코딩 품질 저하 우려는 크지 않으며, Qwen 모델 서빙에 가장 효율적입니다.
*   **메모리 제약이 심하거나 싱글 GPU 환경:**
    *   **긴 컨텍스트 처리가 필요 없다면:** **vLLM (GPTQ-Int4)**를 `gpu_memory_utilization` 및 `max_model_len` 조정과 함께 시도해 볼 수 있습니다.
    *   **긴 컨텍스트 처리가 필요하다면:** **Ollama (Gemma 12B)** 또는 **더 작은 Qwen 모델(예: 14B, 추가 테스트 필요)** 사용을 권장합니다. Gemma 12B는 속도가 느릴 수 있으며, Qwen 14B의 성능 및 품질은 추가 테스트가 필요합니다.
*   **특정 작업 품질이 매우 중요할 경우 (멀티 GPU 환경):** **vLLM (AWQ)** 또는 **Ollama (Qwen 32B)**를 고려할 수 있으나, 속도 저하가 발생합니다.

실제 사용 환경에서의 요구사항(GPU 사양, 필요한 컨텍스트 길이, 속도, 품질 민감도)과 체감 성능을 종합적으로 고려하여 최종 모델 및 서빙 환경을 선택하는 것이 좋습니다.

## 11. 레퍼런스

*   **Ollama (Qwen & Gemma) 테스트 결과 보고서 (영문):** [experiment/sllm_test/experiment_results/performance_report_20250327_203217.md][ollama-gemma-report]
*   **Ollama (Qwen & Gemma) 테스트 결과 보고서 (국문):** [experiment/sllm_test/experiment_results/performance_report_20250327_203217.ko.md](/experiment/sllm_test/experiment_results/performance_report_20250327_203217.ko.md)
*   **vLLM 테스트 결과 보고서 (전체):** [experiment/sllm_test/experiment_results/performance_report_20250329_005124.md][vllm-report]
*   **Ollama (Qwen) 품질 평가 JSON:** [experiment/sllm_test/experiment_results/qwen2.5-coder_32b_ollama_20250328_211339_continuous_1.json](/experiment/sllm_test/experiment_results/qwen2.5-coder_32b_ollama_20250328_211339_continuous_1.json)
*   **vLLM AWQ 품질 평가 JSON:** [experiment/sllm_test/experiment_results/Qwen_Qwen2.5-Coder-32B-Instruct-AWQ_vllm_20250329_005124_continuous_1.json](/experiment/sllm_test/experiment_results/Qwen_Qwen2.5-Coder-32B-Instruct-AWQ_vllm_20250329_005124_continuous_1.json)
*   **vLLM GPTQ-Int4 품질 평가 JSON:** [experiment/sllm_test/experiment_results/Qwen_Qwen2.5-Coder-32B-Instruct-GPTQ-Int4_vllm_20250329_005124_continuous_1.json](/experiment/sllm_test/experiment_results/Qwen_Qwen2.5-Coder-32B-Instruct-GPTQ-Int4_vllm_20250329_005124_continuous_1.json)
*   **Ollama (Gemma 12B) 품질 평가 JSON (일부):** [experiment/sllm_test/experiment_results/gemma3_12b_ctx12800_20250327_203217_continuous_1.json](/experiment/sllm_test/experiment_results/gemma3_12b_ctx12800_20250327_203217_continuous_1.json)
*   **Ollama (Gemma 27B) 품질 평가 JSON (일부):** [experiment/sllm_test/experiment_results/gemma3_27b_ctx12800_20250327_203217_continuous_1.json](/experiment/sllm_test/experiment_results/gemma3_27b_ctx12800_20250327_203217_continuous_1.json)
*   **관련 태스크 정의:** [docs/work-logs/luke-and-alpha/tasks/004-vllm-setup-and-test.md](/docs/work-logs/luke-and-alpha/tasks/004-vllm-setup-and-test.md)
*   **관련 일일 작업 로그:** [docs/work-logs/2025-03-28.md](/docs/work-logs/2025-03-28.md)
*   **평가 스크립트:** [experiment/sllm_test/evaluator.py](/experiment/sllm_test/evaluator.py)

## 12. Cline 연동 설정 (vLLM Qwen 32B GPTQ-Int4)

권장 모델인 `Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4`를 로컬 vLLM 서버(`start_vllm_qwen2.5_4bit.bat` 스크립트 사용)로 실행한 후, Cline에서 사용하기 위한 설정 방법입니다.

1.  **기본 설정:**
    *   **API Provider:** `OpenAI Compatible`
    *   **Base URL:** `http://localhost:8000/v1`
    *   **API Key:** (비워두거나 `NA` 입력)
    *   **Model ID:** `Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4`

2.  **모델 구성 (MODEL CONFIGURATION):**
    *   **Supports Images / Supports Computer Use / Enable R1 messages format:** 모두 체크 해제합니다.
    *   **Context Window Size:** `32734` Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4에서 권장한 최대 길이는 32786이었으나, CURL로 테스트시 34를 더 작게 써야 32786으로 인지되었습니다. curl의 기본 시스템프롬프트의 토큰이 32786을 초과하여 툴에서 상세테스트는 못해봤습니다. 
    *   **Max Output Tokens:** `-1` (무제한) 또는 적절한 제한값 (예: **`4096`**)을 설정합니다.
    *   **Input Price / Output Price / 1M tokens:** 로컬 모델이므로 모두 **`0`**으로 설정합니다.
    *   **Temperature:** 일관된 코딩 결과를 위해 **`0`** 또는 낮은 값 (예: `0.2`)을 권장합니다.

## 13. Cline 연동 테스트 결과 (vLLM Qwen 32B GPTQ-Int4, 2025-03-29)

실제 Cline 연동 테스트 결과, `Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4` (4bit) 모델과의 연동은 **실패**했습니다.

*   **실패 원인:** 모델의 최대 컨텍스트 길이(32768 토큰) 초과.
    *   vLLM 서버 오류 로그(`{"object":"error","message":"This model's maximum context length is 32768 tokens. However, you requested 54692 tokens (21924 in the messages, 32768 in the completion)...","code":400}`) 확인 결과, Cline 요청 시 메시지(시스템 프롬프트 + 사용자 입력)에 사용된 토큰(21924)과 응답 생성에 요청된 최대 토큰(`max_tokens`, 32768)의 합계(54692)가 모델의 최대 컨텍스트 길이(32768)를 초과했습니다.
    *   이는 Cline이 기본적으로 사용하는 시스템 프롬프트의 크기가 매우 크기 때문에 발생하는 문제입니다.
*   **향후 조치 필요:**
    *   Cline의 시스템 프롬프트 길이를 줄이는 커스터마이징 방안을 모색하거나, API 요청 시 컨텍스트 길이를 동적으로 관리하는 로직을 확인/개선해야 합니다.
    *   더 긴 컨텍스트 길이를 지원하는 다른 모델 사용을 검토해야 합니다. 하지만, 현재 sLLM중 우수한 코딩 실력을 가진 모델이 Qwen2.5-Coder-32B-Instruct 로 대안은 없습니다.
    *   결론 : Cline에서는 멀티 gpu최적화가 덜되었으나 구동가능한 ollama를 통한 Qwen2.5-Corder-32B 사용이 현실적임. 
            코딩 최고 성능은  qwen2.5-coder-32b-instruct모델로  https://ollama.com/krith/qwen2.5-coder-32b-instruct 에 올라와 있음
            다만 성능과 속도에서 구글의 google의 gemini-2.5 pro exp와 gemini-2.0-flash 보다 크게 떨어져 온라인을 쓸 수 있다면 현실적인 대안은 아님
            현실적으로는  gemini-2.5 pro exp와 gemini-2.0-flash 사용을 권함

---
*본 보고서는 제공된 테스트 결과 로그를 바탕으로 알파가 작성했습니다.*

[ollama-qwen-report]: /experiment/sllm_test/experiment_results/performance_report_20250327_203217.md
[ollama-gemma-report]: /experiment/sllm_test/experiment_results/performance_report_20250327_203217.md
[vllm-report]: /experiment/sllm_test/experiment_results/performance_report_20250329_005124.md
