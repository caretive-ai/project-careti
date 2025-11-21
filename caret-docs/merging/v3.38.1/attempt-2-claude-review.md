# Phase B2 Batch 1 중간 리뷰

**리뷰어:** Claude (Sonnet 4.5)
**리뷰 일자:** 2025-11-21
**대상:** Codex Phase B2 Batch 1 작업 (2025-11-21 10:12 기록)

---

## 요약

| 항목 | 상태 | 평가 |
|------|------|------|
| 3-way 머지 접근법 | ✅ 정상 | comparison/base\|cline\|caret 로컬 diff3 사용 |
| CARET MODIFICATION 보존 | ✅ 양호 | 53개 occurrences, 9개 파일 |
| tsc --noEmit | ✅ 클린 | 타입 오류 없음 |
| B2 Batch 1 완료 | ✅ 완료 | Provider/Rule/Settings 경로 처리됨 |

**결론:** B2 Batch 1은 **정상적으로 완료**됨. 이전 실패한 시도와 달리 올바른 3-way 머지 수행. 다만 `caret-src/` 인프라 통합 계획 명확화 필요.

---

## 검증 상세

### 1. CARET MODIFICATION 보존 상태

**검증 결과:** ✅ 53개 occurrences 발견 (이전 실패 시도: 0개)

**파일별 분포:**
- `src/core/storage/disk.ts` (4개) - 브랜드 경로 설정
- `src/core/context/instructions/user-instructions/external-rules.ts` (9개) - 규칙 우선순위 시스템
- `src/core/controller/index.ts` (1개) - handleCaretSignOut
- `src/core/controller/state/updateSettings.ts` (4개)
- `src/core/controller/models/updateApiConfigurationProto.ts` (2개)
- `src/shared/CaretAccount.ts` (8개)
- `src/shared/proto/caret/*.ts` (25개+)

**결론:** CARET 수정사항이 제대로 보존됨

---

### 2. 주요 파일 검토

#### `src/core/storage/disk.ts`
**상태:** ✅ 정상 구현

**검증된 내용:**
- `resolveBrandSlug()` 함수 구현 (line 18-33)
- `BRAND_SLUG`, `BRAND_RULES_DIR`, `BRAND_WORKFLOWS_DIR`, `BRAND_MCP_SETTINGS_FILE`, `BRAND_DOCS_FOLDER` 상수
- `GlobalFileNames` 객체에 brand-aware 경로 적용:
  - `mcpSettings: BRAND_MCP_SETTINGS_FILE`
  - `caretRules: BRAND_RULES_DIR`
  - `workflows: BRAND_WORKFLOWS_DIR`
- F03 Branding / F05 RulePriority 요구사항 충족

---

#### `src/core/context/instructions/user-instructions/external-rules.ts`
**상태:** ✅ 정상 구현

**검증된 내용:**
- `RulePrioritySource` 타입 정의 (`"caret" | "cline" | "cursor" | "windsurf" | null`)
- `refreshExternalRulesToggles()` 함수 - 규칙 우선순위 시스템 구현
  - `.caretrules > .clinerules > .cursorrules > .windsurfrules` 우선순위
  - 로거 통합 (`Logger.debug`, `Logger.info`)
- `getLocalCaretRules()` 함수 - .caretrules 디렉토리/파일 처리
- F05 RulePriority 요구사항 충족

---

#### `src/core/controller/index.ts`
**상태:** ⚠️ 부분 구현

**검증된 내용:**
- `handleCaretSignOut()` 메서드 추가 (line 226-257)
- Caret 로그아웃 로직 (caretUserProfile, caretBaseUrl, caretApiKey, caretAuthToken 정리)
- 기본 provider를 "caret"으로 설정

**누락 사항:**
- `CaretGlobalManager` import 없음
- `getCurrentFeatureConfig` import 없음
- 이는 `caret-src/` 디렉토리가 아직 통합되지 않았기 때문

---

### 3. B2 Batch 1 커밋 분석

**커밋:** `0eac2a185 chore: B2 batch1 provider/rules merge and tsc clean`

**변경 파일 (10개):**
1. `external-rules.ts` - 규칙 우선순위 시스템
2. `refreshRules.ts` - 규칙 새로고침
3. `refreshBasetenModels.ts` - Baseten 모델
4. `refreshGroqModels.ts` - Groq 모델
5. `refreshOcaModels.ts` - OCA 모델 (복구)
6. `refreshVercelAiGatewayModelsRpc.ts` - Vercel AI Gateway
7. `updateApiConfigurationProto.ts` - API 설정 업데이트
8. `updateSettings.ts` - 설정 업데이트
9. `disk.ts` - 브랜드 경로
10. `attempt-2-master.md` - 문서

**평가:** 마스터 문서의 B2 Batch 1 범위와 일치함

---

## 7가지 코드 리뷰 체크리스트

| # | 항목 | 평가 | 비고 |
|---|------|------|------|
| 1 | 3-way 비교 정확성 | ✅ 통과 | comparison/base\|cline\|caret 로컬 diff3 사용 |
| 2 | 버그 수정 시 3-way 추적 | ✅ 통과 | tsc 오류를 3-way로 해결 |
| 3 | 최소 침습 & CARET MODIFICATION | ✅ 통과 | 53개 주석 보존 |
| 4 | 하드코딩/정책 위반 | ✅ 통과 | i18n/브랜딩 경로 동적 처리 |
| 5 | Caret 정책 준수 | ⚠️ 부분 | RulePriority OK, 但 CaretGlobalManager 미통합 |
| 6 | 보안 위험 코드 | ✅ 통과 | 없음 |
| 7 | 더미/미완성 코드 | ✅ 통과 | 없음 |

---

## 발견된 이슈

### 1. `caret-src/` 디렉토리 미통합
**심각도:** 높음
**현상:**
- `caret-src/` 디렉토리가 현재 워킹 디렉토리에 존재하지 않음
- `@caret/*` imports 없음 (CaretGlobalManager, FeatureConfig 등)
- comparison/caret에는 `caret-src/`가 존재함 (managers/, shared/, core/ 등)

**영향:**
- F08 FeatureConfig 기능 미작동
- F07 Persona System 미작동
- F04 CaretAccount의 CaretGlobalManager 통합 불가

**권장 조치:** B2 Batch 2 또는 별도 배치로 `caret-src/` 전체 통합 계획 수립 필요

---

### 2. B2 배치 계획 명확화 필요
**심각도:** 중간
**현상:**
- 마스터 문서 B2 Batch 2가 "Controller/웹뷰 진입 – Persona/Branding 라우트"로 명시
- 하지만 Persona/Branding은 CaretGlobalManager에 의존
- CaretGlobalManager는 `caret-src/managers/` 에 위치

**권장 조치:** B2 Batch 2 시작 전에 `caret-src/` 통합 방법 결정:
1. 옵션 A: B2 Batch 2에 `caret-src/` 전체 포함
2. 옵션 B: 별도 B2.5 배치로 `caret-src/` 처리
3. 옵션 C: Persona/Branding을 `caret-src/` 없이 구현 (재작성)

---

## Gate #2 중간 판정

**상태:** ⏳ 진행 중 (Batch 1 완료, Batch 2-3 대기)

**Batch 1 평가:** ✅ **통과**
- 3-way 머지 정상 수행
- CARET MODIFICATION 보존
- tsc 클린
- 마스터 문서 범위와 일치

**다음 단계 전 필요 사항:**
1. `caret-src/` 통합 전략 결정 (Batch 2.5 제안)
2. B2 Batch 2 파일 매트릭스 확정
3. CaretGlobalManager/FeatureConfig 통합 계획

---

## 권장 사항

1. **즉시 필요:** `caret-src/` 디렉토리 통합 방안을 마스터 문서에 추가
2. **B2 Batch 2 전:** CaretGlobalManager 의존성 매핑
3. **검증:** `caret-src/` 통합 후 `extract-caret-mods.ts` 재실행하여 전체 CARET 수정 추적

---

## 총평

B2 Batch 1은 **이전 실패한 시도와 달리 올바르게 수행**되었습니다.

**장점:**
- 적절한 3-way 머지 접근법 (comparison/ 디렉토리 활용)
- CARET MODIFICATION 주석 완전 보존
- tsc 타입 체크 통과
- 마스터 문서 범위 준수

**우려 사항:**
- `caret-src/` 인프라가 B2 계획에 명시적으로 포함되어 있지 않음
- Batch 2의 Persona/Branding 작업은 CaretGlobalManager 의존성이 있음

**결론:** Batch 1은 통과. Batch 2 진행 전 `caret-src/` 통합 전략 명확화 필요.
