# 병합 워크플로우

Git 브랜치 병합 및 코드 통합 절차입니다.

## 병합 유형

### Feature 병합
- 기능 브랜치 → 개발 브랜치
- 코드 리뷰 필수
- 테스트 통과 확인

### Release 병합
- 개발 브랜치 → 메인 브랜치
- 전체 테스트 실행
- 변경 로그 업데이트

### Upstream 병합
- Cline 업스트림 → Caret
- 충돌 해결 프로토콜 준수
- 문서 참조: `merge-strategy.md`

## 병합 절차

### 1. 준비
```bash
# 최신 코드 가져오기
git fetch origin
git fetch upstream  # upstream 병합 시

# 현재 상태 확인
git status
```

### 2. 병합 실행
```bash
# Feature 병합
git checkout main
git merge feature/my-feature

# Upstream 병합
git checkout main
git merge upstream/main
```

### 3. 충돌 해결
```bash
# 충돌 파일 확인
git status

# 파일별 해결
# CARETI MODIFICATION 주석 유지 확인

# 해결 완료
git add <resolved-files>
git commit
```

### 4. 검증
```bash
npm run compile
npm run test:all
```

### 5. 푸시
```bash
git push origin main
```

## 충돌 해결 원칙

1. **Caret 기능 우선**: Caret 특화 코드 유지
2. **주석 보존**: `// CARETI MODIFICATION:` 유지
3. **테스트 확인**: 병합 후 전체 테스트 실행

## 체크리스트

- [ ] 병합 전 최신 코드 동기화
- [ ] 충돌 해결 완료
- [ ] 컴파일 성공
- [ ] 테스트 통과
- [ ] 문서 업데이트

## 미러링 정책
`.agents/`와 `.users/`는 1:1 미러링 구조입니다.
- 이 파일 수정 시 `.agents/workflows/merge-workflow.md`도 동일하게 업데이트
