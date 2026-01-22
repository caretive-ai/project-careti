# 병합 전략

Cline 업스트림과의 병합 전략입니다.

## 병합 원칙

### 3단계 수정 레벨
1. **Level 1 (독립 모듈)**: 충돌 없음, 자동 병합
2. **Level 2 (조건부 통합)**: 최소 충돌, 수동 해결 필요
3. **Level 3 (직접 수정)**: 충돌 가능성 높음, 주의 필요

### 충돌 최소화
- `// CARETI MODIFICATION:` 주석으로 변경 영역 명확화
- 최소 변경 원칙 (1-3줄)
- 기능 플래그 사용으로 조건부 활성화

## 병합 워크플로우

### 1. 업스트림 변경 확인
```bash
# 업스트림 페치
git fetch upstream

# 변경 내용 확인
git log upstream/main --oneline -20

# 차이 확인
git diff main..upstream/main --stat
```

### 2. 병합 브랜치 생성
```bash
# 병합 브랜치 생성
git checkout -b merge/cline-upstream-YYYYMMDD

# 업스트림 병합
git merge upstream/main
```

### 3. 충돌 해결
충돌 발생 시:
1. `// CARETI MODIFICATION:` 주석 확인
2. Caret 기능 유지 우선
3. 업스트림 변경과 조화롭게 통합

```bash
# 충돌 파일 확인
git status

# 파일별 충돌 해결 후
git add <resolved-file>
```

### 4. 검증
```bash
# 컴파일 확인
npm run compile

# 전체 테스트
npm run test:all

# Cline 기능 테스트
npm run watch
```

### 5. 문서 업데이트
- `CHANGELOG.md`에 병합 내용 기록
- 주요 변경사항 문서화
- 호환성 이슈 기록

## 충돌 해결 가이드

### 일반 충돌
```
<<<<<<< HEAD
// CARETI MODIFICATION: Our feature
caretFeature();
=======
upstreamCode();
>>>>>>> upstream/main
```

해결:
```typescript
// CARETI MODIFICATION: Our feature
if (caretMode) {
  caretFeature();
}
upstreamCode();
```

### 타입 정의 충돌
- 기존 타입 확장 선호
- 새 타입 정의는 `careti-src/types/`에 배치

### 의존성 충돌
- `package.json` 변경 시 주의
- 버전 호환성 확인 필수

## 병합 후 체크리스트

- [ ] 컴파일 성공
- [ ] 모든 테스트 통과
- [ ] Cline 기능 정상 동작
- [ ] Caret 기능 정상 동작
- [ ] CHANGELOG 업데이트
- [ ] 문서 업데이트

## 미러링 정책
`.agents/`와 `.users/`는 1:1 미러링 구조입니다.
- 이 파일 수정 시 `.agents/workflows/merge-strategy.md`도 동일하게 업데이트
