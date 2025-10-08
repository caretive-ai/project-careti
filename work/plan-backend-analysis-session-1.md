# 백엔드 수정 파일 49개 분석 계획 (세션 1)

## 1. 목표
`work/analysis-of-102-modifications.md` 문서에 명시된 '추가 분석 필요 파일' 목록의 백엔드 파일 49개를 '핵심 가이드라인'에 따라 분석하고, 그 결과를 문서에 업데이트합니다.

## 2. 분석 가이드라인 준수
모든 파일은 다음 4가지 항목에 따라 분석 결과를 구체적으로 기술합니다.
1.  **수정 목적 및 기능 분석**: `caret-docs/features/index.mdx` 문서를 참고하여 변경 사항의 목적을 분석합니다.
2.  **원본 복원 권장**: 비필수적인 수정일 경우 '원본 복원 권장'을 명시합니다.
3.  **컨플릭트 위험도 분석**: (높음/중간/낮음)으로 평가하고 이유를 서술합니다.
4.  **종합 의견 및 권장 조치**: 리팩토링, `caret-src`로 이전 등 구체적인 조치를 제안합니다.

## 3. 작업 절차
1.  **계획 제출**: 현재 계획을 마스터께 제출하고 승인을 기다립니다.
2.  **컨텍스트 문서 로드**: `caret-docs/features/index.mdx` 파일을 읽어 Caret 기능 컨텍스트를 확보합니다.
3.  **파일 분석 (배치 처리)**: 컨텍스트 제한을 고려하여 49개 파일을 여러 배치로 나누어 분석을 진행합니다. 각 파일에 대해 `git diff upstream/main -- <file_path>` 명령을 실행하여 변경점을 확인하고 가이드라인에 따라 분석합니다.
4.  **분석 결과 문서화**: 각 배치의 분석 결과를 임시 마크다운 파일(`work/backend-analysis-batch-N.md`)에 정리합니다.
5.  **최종 문서 업데이트**: 모든 배치의 분석이 완료되면, `work/analysis-of-102-modifications.md` 파일의 '추가 분석 필요 파일' 섹션을 '분석 완료된 백엔드 파일 (추가 분석)' 섹션으로 교체하고, 분석 결과 테이블을 삽입합니다.

## 4. 첫 번째 배치 분석 대상 (10개 파일)
- `src/common.ts`
- `src/core/api/providers/cline.ts`
- `src/core/api/providers/doubao.ts`
- `src/core/api/providers/fireworks.ts`
- `src/core/api/providers/litellm.ts`
- `src/core/api/providers/lmstudio.ts`
- `src/core/api/providers/openai.ts`
- `src/core/api/providers/openrouter.ts`
- `src/core/api/providers/qwen.ts`
- `src/core/api/providers/requesty.ts`

이 계획에 따라 작업을 진행하겠습니다.
