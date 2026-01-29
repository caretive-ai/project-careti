# F15 - Smart Edit Engine (스마트 편집 엔진)

**상태**: ✅ 구현 완료
**구현일**: 2026-01-24
**영향 범위**: Core Tools, Assistant Message
**우선순위**: 🟢 High
**관련 작업**: T17, T20

---

## 📊 효율 개선 요약 (실제 E2E 테스트 결과)

### 멀티 모델 벤치마크 (66회 테스트)

**테스트 환경**: 10개 테스트 케이스 × 8개 모델 (4 프로바이더 × 최고/최저)
**테스트 날짜**: 2026-01-24
**실제 테스트**: 66회 (80회 예정 중 14회 API 실패 제외)

| 모델 | 테스트 | Cline (indexOf) | Careti (SmartEdit) | 복구 | 시간 단축 |
|------|--------|-----------------|---------------------|------|-----------|
| Claude Opus 4.5 (최고) | 10 | 100% | 100% | 0 | |
| Claude Haiku 4.5 (최저) | 10 | 100% | 100% | 0 | |
| Gemini 3 Pro (최고) | 7 | 100% | 100% | 0 | |
| **Gemini 2.0 Flash Lite (최저)** | 10 | **70%** | **100%** | **3** | **~5.6초 → 2.8초 (50%↓)** |
| ZAI GLM-4.7 (최고) | 10 | 100% | 100% | 0 | |
| ZAI GLM-4.5-air (최저) | 6 | 100% | 100% | 0 | |
| Upstage Solar Pro2 (최고) | 5 | 100% | 100% | 0 | |
| **Upstage Solar Mini (최저)** | 8 | **63%** | **100%** | **3** | **~13.4초 → 6.7초 (50%↓)** |

> Claude는 API가 아닌 CLI로 호출했습니다.

**전체 통계**:
| 항목 | Cline (indexOf) | Careti (SmartEdit) | 개선 |
|------|-----------------|---------------------|------|
| 성공률 | 91% (60/66) | **100% (66/66)** | **+9%** |
| 복구된 케이스 | - | 6개 | - |
| 에러 응답 토큰 | ~5,000 tokens | ~100 tokens | **98% ↓** |

### 복구된 케이스 상세 (시간 단축율)

| 테스트 | 모델 | Cline (재시도 필요) | Careti (즉시 성공) | 단축 |
|--------|------|---------------------|--------------------|----- |
| getData vs getDataList | Gemini 2.0 Flash Lite | ~5.6초 | 2.8초 | **50%** |
| setData vs setDataList | Upstage Solar Mini | ~17.5초 | 8.7초 | **50%** |
| 한글 함수명 | Gemini 2.0 Flash Lite | ~5.5초 | 2.8초 | **50%** |
| 클래스 메서드 | Gemini 2.0 Flash Lite | ~3.2초 | 1.6초 | **50%** |
| 클래스 메서드 | Upstage Solar Mini | ~8.4초 | 4.2초 | **50%** |
| 조건문 내부 | Upstage Solar Mini | ~6.6초 | 3.3초 | **50%** |

> Cline은 indexOf 실패 시 AI에게 에러 메시지 전송 후 재시도 필요 (2배 시간)
> Careti는 SmartEdit으로 즉시 복구 (재시도 없음)

### 핵심 인사이트

1. **저성능 모델에서 효과 극대화**:
   - Gemini 2.0 Flash Lite: 70% → 100% (+30%)
   - Upstage Solar Mini: 63% → 100% (+37%)
2. **고성능 모델은 이미 정확**: Claude, Gemini Pro, ZAI GLM-4.7은 Cline도 100% 성공
3. **재시도 방지로 실제 시간 절감**: Fuzzy Matching 0.1ms vs API 재시도 1,500ms = **15,000배 빠름**
4. **비용 효율**: 저성능(저가) 모델 사용 시 SmartEdit으로 성공률 보완 가능
5. **로컬 sLLM 기대효과**: 로컬 소형 LLM은 클라우드 모델보다 성능이 낮으므로 SmartEdit 효용성이 더 증가할 것으로 예상 (추후 테스트 예정)

---

## 개요

AI가 파일 편집 시 생성하는 SEARCH 블록의 미세한 오류(공백, 들여쓰기 차이 등)를 자동으로 보정하여 편집 성공률을 높이는 9단계 Fuzzy Matching 엔진.

## Cline vs Careti 비교

| 기능 | Cline (원본) | Careti (개선) |
|------|-------------|---------------|
| 편집 매칭 | `indexOf` 단순 매칭 | **9단계 Fuzzy Matching** |
| 공백/탭 차이 | ❌ 실패 | ✅ LineTrimmedReplacer로 복구 |
| 들여쓰기 차이 | ❌ 실패 | ✅ IndentationFlexibleReplacer로 복구 |
| 에러 응답 토큰 | 전체 파일 (5000+ tokens) | **5줄 컨텍스트 (~100 tokens)** |
| 파일 제안 | 없음 | **"Did you mean?" 유사 파일 제안** |
| 동시 편집 방지 | 없음 | **FileLock 시스템** |

---

## 성능 벤치마크 결과

### 테스트 환경
- **테스트 날짜**: 2026-01-24
- **테스트 케이스**: 8개 (AI가 생성하는 일반적인 SEARCH 블록 오류 시뮬레이션)
- **비교 대상**: Cline (indexOf) vs Careti (9단계 Fuzzy Matching)

### 성공률 비교

| 구현 | 성공 | 실패 | 성공률 |
|------|------|------|--------|
| Cline (indexOf) | 4 | 4 | **50.0%** |
| Careti (SmartEdit) | 8 | 0 | **100.0%** |

**🎯 개선율: +4개 테스트 (+50% 성공률 향상)**

### 테스트 케이스 상세

| # | 테스트 | 문제 상황 | Baseline | SmartEditEngine | 복구 방법 |
|---|--------|----------|----------|-----------------|-----------|
| 1 | 정확한 매칭 | 없음 | ✅ | ✅ | SimpleReplacer |
| 2 | 스페이스 vs 탭 | AI가 탭 대신 스페이스 출력 | ❌ | ✅ | LineTrimmedReplacer |
| 3 | 트레일링 공백 | 없음 | ✅ | ✅ | SimpleReplacer |
| 4 | 혼합 들여쓰기 | AI가 탭 대신 스페이스 출력 | ❌ | ✅ | LineTrimmedReplacer |
| 5 | 한글 콘텐츠 | 없음 | ✅ | ✅ | SimpleReplacer |
| 6 | 한글 + 공백 차이 | AI가 탭 대신 스페이스 출력 | ❌ | ✅ | LineTrimmedReplacer |
| 7 | 라인 트림 | AI가 탭 대신 스페이스 출력 | ❌ | ✅ | LineTrimmedReplacer |
| 8 | 부분 컨텍스트 | 없음 | ✅ | ✅ | SimpleReplacer |

### 처리 시간

| 측정 | Baseline | SmartEditEngine | 차이 |
|------|----------|-----------------|------|
| 총 시간 (8개 테스트) | 0.007ms | 0.212ms | +0.205ms |
| 평균 시간 (1개 테스트) | 0.001ms | 0.026ms | +0.025ms |

**왜 시간이 더 걸리는가?**
- Baseline은 `indexOf` 1번 호출
- SmartEditEngine은 최대 9단계 Replacer 체인을 순회하며 각 단계에서 문자열 정규화, 라인 분할 등 수행

**실제 영향:**
- 절대값 **0.026ms** (26마이크로초) = 사용자 체감 불가
- API 호출 시간 (수백ms~수초) 대비 무시할 수준
- **성공률 +50% 향상** 대비 충분히 가치 있음

---

## 실제 E2E 재시도 시뮬레이션 결과

### 테스트 환경
- **테스트 날짜**: 2026-01-24
- **AI 모델**: Gemini 2.0 Flash
- **시나리오**: AI가 SEARCH 블록을 생성하지만 공백/들여쓰기 오류 포함

### 시나리오 설명

```
Baseline (Cline 원본):
1. AI가 SEARCH 블록 생성 (공백/들여쓰기 오류 포함)
2. indexOf 실패 → AI에게 에러 메시지 전송
3. AI가 수정된 SEARCH 블록 재생성 → API 호출 #2
4. 반복... (최대 3회)

SmartEditEngine (Careti):
1. AI가 SEARCH 블록 생성 (공백/들여쓰기 오류 포함)
2. 9단계 Fuzzy Matching으로 복구 → 성공
3. 추가 API 호출 없음
```

### 테스트 케이스

| 테스트 | Baseline | SmartEditEngine | 절감 |
|--------|----------|-----------------|------|
| 스페이스 vs 탭 | ❌ 3회 API 호출, 3.6초 | ✅ 1회, 0.138ms | 2회, 2.1초 |
| 혼합 들여쓰기 | ✅ 2회 API 호출, 2.3초 | ✅ 1회, 0.110ms | 1회, 0.8초 |
| 한글 + 스페이스 | ❌ 3회 API 호출, 4.4초 | ✅ 1회, 0.049ms | 2회, 2.9초 |
| 라인 트림 | ❌ 3회 API 호출, 3.5초 | ✅ 1회, 0.061ms | 2회, 2.0초 |

### 종합 결과

| 측정 항목 | Baseline | SmartEditEngine | 절감 |
|-----------|----------|-----------------|------|
| 성공률 | 25% (1/4) | **100% (4/4)** | +75% |
| 총 API 호출 | 11회 | 4회 | **7회 (64% 감소)** |
| 총 소요 시간 | 13.91초 | 6.00초 | **7.91초 절감** |
| 평균/테스트 | 2.8회, 3.48초 | 1.0회, 1.50초 | 1.8회, 1.98초 |

### 왜 SmartEditEngine이 0.1ms 더 느린데도 실제로는 더 빠른가?

```
Baseline 실패 시 AI 재시도 1회 = ~1500ms (API 호출)
SmartEditEngine 9단계 Fuzzy Matching = ~0.1ms
────────────────────────────────────────
1회 재시도 방지 = 약 15,000배 시간 절약
```

---

## 9단계 Fuzzy Matching Replacers

| 단계 | Replacer | 설명 |
|------|----------|------|
| 1 | SimpleReplacer | 정확한 매칭 |
| 2 | LineTrimmedReplacer | 라인별 앞뒤 공백 무시 |
| 3 | BlockAnchorReplacer | 첫줄/끝줄 앵커 + Levenshtein 유사도 |
| 4 | WhitespaceNormalizedReplacer | 연속 공백 정규화 |
| 5 | IndentationFlexibleReplacer | 들여쓰기 패턴 매칭 |
| 6 | EscapeNormalizedReplacer | 이스케이프 시퀀스 정규화 |
| 7 | TrimmedBoundaryReplacer | 경계 트림 매칭 |
| 8 | ContextAwareReplacer | 컨텍스트 앵커 매칭 |
| 9 | MultiOccurrenceReplacer | 다중 매칭 처리 |

---

## 주요 파일

| 파일 | 설명 |
|------|------|
| `careti-src/core/editing/SmartEditEngine.ts` | 9단계 Fuzzy Matching 엔진 |
| `careti-src/core/editing/FileLock.ts` | 파일 잠금 시스템 |
| `careti-src/core/editing/utils/levenshtein.ts` | Levenshtein 유사도 계산 |
| `src/core/assistant-message/diff.ts` | 8단계 fallback 통합 |
| `src/integrations/editor/DiffViewProvider.ts` | FileLock 통합 |
| `src/integrations/misc/extract-file-content.ts` | "Did you mean?" 파일 제안 |

---

## 벤치마크 실행 방법

```bash
cd /home/luke/dev/project-careti

# 멀티 모델 벤치마크 (8개 모델, 80회 테스트)
npx ts-node --project ./tsconfig.unit-test.json scripts/run-e2e-benchmark-multi-model.ts

# 모델 API 확인 (빠른 체크)
npx ts-node --project ./tsconfig.unit-test.json scripts/run-e2e-benchmark-model-check.ts

# 퀵 테스트 (프롬프트/파싱 확인용)
npx ts-node --project ./tsconfig.unit-test.json scripts/run-e2e-benchmark-quick-test.ts
```

### Fixture 파일 위치
```
careti-src/core/editing/__tests__/fixtures/edit-targets/
├── simple-function.ts      # 기본 함수
├── whitespace-variation.ts # 공백 변형
├── indent-variation.ts     # 들여쓰기 변형
├── korean-comments.ts      # 한글 주석
└── confusing-names.ts      # 유사 이름 테스트
```

---

## 토큰 효율화

### 에러 응답 토큰 절감

| 항목 | Before | After | 절감률 |
|------|--------|-------|--------|
| 에러 시 파일 컨텍스트 | 전체 파일 (~5000 tokens) | 5줄 컨텍스트 (~100 tokens) | **98%** |

### getContextAroundError 함수
```typescript
// 매칭 실패 시 전체 파일 대신 에러 위치 주변 5줄만 반환
getContextAroundError(content, searchString, contextLines = 5)
```

---

## Cline 머징 가이드

### 수정된 Cline 파일

| 파일 | 수정 내용 | 줄 수 |
|------|----------|-------|
| `src/core/assistant-message/diff.ts` | 8단계 fallback import/사용 | ~10줄 |
| `src/integrations/editor/DiffViewProvider.ts` | FileLock import/사용 | ~5줄 |
| `src/integrations/misc/extract-file-content.ts` | 파일 제안 함수 | ~20줄 |

### 머징 시 주의사항
- 모든 수정에 `// CARETI MODIFICATION:` 주석 포함
- `careti-src/` 디렉토리는 독립적이므로 충돌 없음
- Cline 업그레이드 시 위 3개 파일만 재적용 필요

---

## 참조

- [OpenCode](https://github.com/anomalyco/opencode) - 9단계 Fuzzy Matching 원본 구현
