# Update Model List Skill

## Overview
Caret의 지원 모델 리스트를 자동 생성하고 관련 문서를 업데이트하는 스킬입니다.

## When to Use
- 새로운 API 프로바이더나 모델이 `src/shared/api.ts`에 추가되었을 때
- README나 문서에서 프로바이더/모델 개수를 업데이트해야 할 때
- 지원 모델 리스트 문서를 재생성해야 할 때

## Script Location
```
careti-scripts/build/generate-support-model-list.js
```

## Command
```bash
node careti-scripts/build/generate-support-model-list.js
```

## Output Files
스크립트 실행 시 다음 파일들이 자동 생성됩니다:
- `careti-docs/development/support-model-list.mdx` (한국어)
- `careti-docs/development/support-model-list.en.mdx` (영어)

## Data Source
- **API 정의 파일**: `src/shared/api.ts`
- **파싱 대상**:
  - `ApiProvider` 타입에서 프로바이더 목록 추출
  - `*Models` 객체들에서 모델 정보 추출 (maxTokens, contextWindow, supportsImages, inputPrice, outputPrice)

## Workflow

### 1. 스크립트 실행
```bash
node careti-scripts/build/generate-support-model-list.js
```

### 2. 출력 확인
```
📊 추출된 데이터:
   🔹 프로바이더: 30개
   🔹 총 모델: 349개
   🔹 유니크 모델: 266개
   🔹 모델 섹션: 30개
```

### 3. README 파일 업데이트
다음 파일들의 프로바이더/모델 개수를 업데이트해야 합니다:
- `README.md`
- `careti-docs/readme-i18n/README.ko.md`
- `careti-docs/readme-i18n/README.ja.md`
- `careti-docs/readme-i18n/README.zh-cn.md`
- `careti-docs/readme-i18n/README.fr.md`
- `careti-docs/readme-i18n/README.de.md`
- `careti-docs/readme-i18n/README.ru.md`

업데이트할 텍스트 패턴 (스크립트 출력 참조):
- 영어: `{N} providers, {M} models`
- 한국어: `{N}개 프로바이더, {M}개 모델`
- 일본어: `{N}プロバイダー、{M}モデル`
- 중국어: `{N}个提供商，{M}个模型`
- 프랑스어: `{N} fournisseurs, {M} modèles`
- 독일어: `{N} Anbieter, {M} Modelle`
- 러시아어: `{N} провайдеров, {M} моделей`

## Current Stats (2026-01)
- **프로바이더 (모델 섹션)**: 31개
- **유니크 모델**: 266개
- **총 모델 정의**: 349개

## Troubleshooting

### 프로바이더 개수가 맞지 않을 때
`extractModelData()` 함수의 ApiProvider 파싱 로직 확인:
- `api.ts`의 ApiProvider 타입 정의가 여러 줄에 걸쳐 있는지 확인
- 주석이나 `CARETI MODIFICATION` 마커가 파싱을 방해하지 않는지 확인

### 스크립트가 실행되지 않을 때
```bash
# 직접 실행
node careti-scripts/build/generate-support-model-list.js

# 또는 npm 스크립트 등록 후
npm run models:generate
```

## Notes
- 스크립트는 `api.ts`를 파싱하여 데이터를 추출하므로, `api.ts`의 형식이 변경되면 스크립트도 수정이 필요할 수 있습니다.
- 생성된 문서는 자동 생성이므로 직접 수정하지 마세요.

## Mirroring Policy
`.agents/`와 `.users/`는 1:1 미러링 구조입니다.
- 이 파일 수정 시 `.users/skills/update-model-list/SKILL.md`도 동일하게 업데이트
- `.agents/`는 영어(토큰 효율), `.users/`는 사용자/팀 언어(상세 설명)
- 참조: `assets/agents_template/AGENTS.md`의 Key Principles
