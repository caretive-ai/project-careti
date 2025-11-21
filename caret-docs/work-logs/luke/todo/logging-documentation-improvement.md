# TODO: Logging 문서 개선 작업

**생성일**: 2025-10-16
**우선순위**: 중간
**카테고리**: 문서 개선, 토큰 최적화

## 문제 요약

### 1. CLAUDE.md 통제 불가
- **현상**: CLAUDE.md는 Caret 프로젝트 안에 있지만, 실제로는 Cline 원본 파일
- **제약**: Caret이 임의로 수정할 수 없음 (upstream merge 시 충돌)
- **영향**: Logging 관련 내용이 CLAUDE.md와 .caretrules에 중복

### 2. Claude Code 프로바이더 특수성
- **현상**: Claude Code를 subagent로 사용할 때, 전체 컨텍스트(CLAUDE.md + .caretrules)를 모두 로드
- **원인**: Subagent가 완전한 개발 환경을 필요로 하기 때문
- **결과**: Logging 관련 규칙이 약 400-600 토큰 중복 로드

### 3. Logger 시그니처 문서 불일치
- **실제 구현**:
  ```typescript
  static error(message: string, error?: Error)  // 2 params
  static debug(message: string)                  // 1 param only
  static info(message: string)                   // 1 param only
  ```
- **문서 표현**: "객체 로깅: 두 번째 매개변수로 전달" (모든 메서드가 가능한 것처럼 오해 유발)
- **실제 사용**: `JSON.stringify()`를 사용해야 함

## 상세 분석

**참고 문서**: `caret-docs/work-logs/alpha/2025-10-16-logging-documentation-analysis.md`

### 토큰 낭비 추정
- **현재**: 약 2,400 토큰/세션 (중복 포함)
- **개선 가능**: 약 1,750 토큰/세션
- **절감**: 650 토큰/세션 (27%)
- **월간** (100 작업 기준): 65,000 토큰 절감 가능

### 중복 발생 지점
1. **CLAUDE.md** - Logging Guidelines (약 200 토큰)
2. **`.caretrules/logging-rules.md`** - 상세 규칙 (약 700 토큰)
3. **`.caretrules/workflows/branding-and-logging.md`** - 시스템 설명 (약 1500 토큰)

## 가능한 해결 방안

### 방안 1: .caretrules만 정리 (현실적)
**장점**:
- CLAUDE.md 건드리지 않음 (merge 충돌 없음)
- .caretrules는 Caret가 완전 통제

**작업 내용**:
1. `.caretrules/logging-rules.md` 개선
   - Logger 시그니처 정확히 명시
   - `JSON.stringify()` 사용법 예제 추가
   
2. `.caretrules/workflows/branding-and-logging.md` 간소화
   - 중복 코드 예제 제거
   - "자세한 내용은 logging-rules.md 참조" 추가

**예상 효과**: 약 300-400 토큰 절감

### 방안 2: Logger 클래스 개선 (근본 해결)
**작업 내용**:
```typescript
// src/services/logging/Logger.ts
static debug(message: string, data?: any) {
  const fullMessage = data ? `${message} ${JSON.stringify(data)}` : message
  Logger.#output("DEBUG", fullMessage)
}

static info(message: string, data?: any) {
  const fullMessage = data ? `${message} ${JSON.stringify(data)}` : message
  Logger.#output("INFO", fullMessage)
}

static warn(message: string, data?: any) {
  const fullMessage = data ? `${message} ${JSON.stringify(data)}` : message
  Logger.#output("WARN", fullMessage)
}

// error는 이미 두 번째 파라미터 있으므로 유지
```

**장점**:
- 문서와 실제 구현 완전 일치
- 개발자 경험 향상
- 현재 작성된 코드 패턴이 표준이 됨

**주의사항**:
- Cline 원본 파일 수정 (Level 2)
- CARET MODIFICATION 주석 필수
- 최대 1-3 라인 수정 권장 → **이 경우 약 10-15라인** (권장 초과)

### 방안 3: Subagent 컨텍스트 최적화 (장기 과제)
**아이디어**:
- Claude Code subagent에게 필요한 최소 컨텍스트만 전달
- CLAUDE.md의 핵심 내용만 요약해서 전달

**문제점**:
- Claude Code SDK 구조 변경 필요
- Caret에서 직접 통제 불가능
- Upstream 기능 요청 필요

## 권장 작업 순서

### Phase 1: 즉시 가능 (이번 주)
1. `.caretrules/logging-rules.md` 개선
   - Logger 시그니처 정확히 기술
   - 예제 코드 개선

2. `.caretrules/workflows/branding-and-logging.md` 정리
   - 중복 제거
   - 참조로 대체

**예상 시간**: 1-2시간
**효과**: 약 300 토큰/세션 절감

### Phase 2: 검토 필요 (다음 스프린트)
3. Logger 클래스 개선 검토
   - Level 2 수정 규칙 준수 확인
   - 라인 수 최소화 방법 검토
   - CARET MODIFICATION 주석 계획

**예상 시간**: 4-6시간 (테스트 포함)
**효과**: 문서와 구현 완전 일치

### Phase 3: 장기 과제
4. Upstream 기능 제안
   - Cline 커뮤니티에 CLAUDE.md 커스터마이징 방법 논의
   - Subagent 컨텍스트 최적화 방안 제안

## 관련 파일

### 분석 문서
- `caret-docs/work-logs/alpha/2025-10-16-logging-documentation-analysis.md`

### 수정 대상
- `.caretrules/logging-rules.md`
- `.caretrules/workflows/branding-and-logging.md`
- `src/services/logging/Logger.ts` (Phase 2)

### 참고 파일
- `CLAUDE.md` (읽기 전용)
- `src/core/api/providers/claude-code.ts` (Logger 사용 예시)

## 추가 고려사항

### CLAUDE.md 우회 방법?
**현재 제약**:
- Merge 시 CLAUDE.md는 upstream 우선
- Caret 수정사항은 충돌 가능성

**가능한 접근**:
1. `.caretrules`를 통한 보완 (권장)
2. Cline upstream에 PR 제출 (장기)
3. Fork 유지 전략 재검토 (위험)

### Logger 개선의 trade-off
**장점**:
- DX 향상
- 문서 일관성

**단점**:
- Cline 원본 수정 (약 15라인)
- 권장 1-3라인 초과
- Merge 복잡도 증가

**결정 필요**: 
- Level 2 수정 규칙을 유연하게 적용할 것인가?
- 아니면 .caretrules 문서 개선으로 충분한가?

## 다음 작업자를 위한 메모

1. **Phase 1만 진행 권장**
   - .caretrules 문서 개선
   - Logger 클래스는 건드리지 않음

2. **Logger 개선은 신중히**
   - Level 2 규칙 검토
   - Luke와 상의 필요

3. **테스트 필수**
   - 문서 개선 후 실제 개발자 피드백
   - 토큰 절감 효과 측정

---

**생성 이유**: 2025-10-16 Task Tool 디버깅 작업 중 Logger 사용법 혼란 발견
**연관 작업**: F12 - Claude Code Subagent Support
