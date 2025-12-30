개발자 지식과 AI 지식 간의 1:1 패리티(AI-Developer Knowledge Parity)를 유지하기 위한 문서 정리 가이드입니다.

<detailed_sequence_of_steps>
# 문서 조직화 워크플로우 - 지식 패리티 시스템

## 핵심 원칙
- **SoT는 `.agents/context`** 입니다. (AI는 `.agents/context/caret-rules.json` → 필요한 워크플로우/원자만 온디맨드 로드)
- 개발자 문서는 **KO 우선**으로 `caret-docs/development/**`에 두고, 진입점은 `caret-docs/development/index.md`로 통일합니다.
- 기능 스펙은 **EN 중심(`caret-docs/features.en/**`)**으로 유지하고, 필요 시 KO 가이드로 링크를 연결합니다.
- `docs/`는 Cline 원문(영문)이라 **편집하지 않습니다**.
- `docs.caret.team/`는 배포용 다국어 문서로, `docs/` 복사본 + Caret 추가분으로 구성됩니다.
- 동일 내용을 여러 위치에 “복사”해 두기보다 **포인터(링크)로 연결**해 파편화를 막습니다.

## SoT(규칙/워크플로우) 구조
- 진입점: `.agents/context/caret-rules.json`
- 워크플로우: `.agents/context/workflows/*.md`
- 원자(Atoms): `.agents/context/workflows/atoms/*`

## 개발자 문서(사람용) 구조
- 개발 문서 대시보드: `caret-docs/development/index.md`
- 개발 가이드: `caret-docs/development/**`
- 기능 스펙: `caret-docs/features.en/**` (EN)
- 작업 기록: `caret-docs/work-logs/**`

## 문서 추가/수정 시 체크리스트
1) 문서 종류를 먼저 결정합니다.
- **AI가 따라야 하는 절차/규칙**: `.agents/context`에 반영(SoT 우선)
- **로컬 개발/빌드/테스트/실행 가이드**: `caret-docs/development/**`에 반영
- **제품 기능 스펙**: `caret-docs/features.en/**`에 반영
- **사용자 안내**: `caret-docs/user-guide/**` (필요 시 `.en` 별도 분리)

2) 미러링(중복) 대신 연결을 우선합니다.
- SoT workflow가 있으면, 개발 문서에서는 **핵심만 요약**하고 **SoT로 링크**합니다.
- `caret-docs/development/workflows/**` 같이 과거 미러가 남아 있다면, “Deprecated mirror”로 표기하고 SoT를 가리키도록 유지합니다.

3) 네비게이션을 갱신합니다.
- 새 문서/중요 문서는 `caret-docs/development/index.md`에서 항상 접근 가능해야 합니다.

## 문서/AI 가이드 업데이트 절차

### A) 문서 업데이트 (사람용)
1. SoT 문서를 먼저 수정합니다 (`.agents/context/**`).
2. 대응되는 한국어 가이드를 `caret-docs/development/**`에 반영합니다.
3. 기능 스펙이 사용자 대상이면 `caret-docs/features.en/**`도 갱신합니다.
4. 진입 문서(`caret-docs/development/index.md`) 링크를 최신화합니다.

### B) AI 가이드 업데이트 (시스템 프롬프트/행동 규칙)
1. `.agents/context/**`의 규칙/프롬프트 소스를 갱신합니다.
2. 사람이 읽는 프롬프트 문서(`caret-docs/system-prompts-ko/**`)를 함께 갱신합니다.
3. 개발자 영향이 있는 변화는 `caret-docs/development/**`에 요약을 추가합니다.
4. 워크플로우/카테고리가 바뀌면 `ai-work-index.yaml`도 갱신합니다.

## 워크플로우 → 스킬 후보 검토
반복적이고 결정 규칙이 명확하며, 스크립트로 자동화 가능한 작업은 스킬화 후보입니다.
- 예: 모델 리스트 갱신, proto 생성, 표준 빌드/린트 실행
- 제외: 아키텍처 판단/리뷰 등 인간 판단이 필요한 작업

## 정합성 검증(증거 기반)
```bash
# 문서/규칙에 남아있는 오래된 스크립트/경로 참조 탐지
rg -n "npm run (test:backend|clean\\b|CLAUDE\\.md)" .agents/context caret-docs/development || true
rg -n "src/caret" .agents/context caret-docs/development || true

# 실제 스크립트 SoT
cat package.json | sed -n '310,390p'
```

## 성공 기준
- `.agents/context`와 `caret-docs/development`가 동일한 현실(경로/스크립트/구조)을 설명함
- `caret-docs/development/index.md`에서 고립 문서 없이 탐색 가능
- 기능 스펙은 `caret-docs/features.en/**`에 있고, 개발 runbook과 중복되지 않음
</detailed_sequence_of_steps>

<general_guidelines>
- 삭제/이동은 합의 전 보류하고, 먼저 deprecate + 링크로 안전하게 정리합니다.
- “문서 개수/워크플로우 개수” 같은 스냅샷 수치는 워크플로우에 쓰지 않습니다(드리프트 원인).
</general_guidelines>
