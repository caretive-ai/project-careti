# Cline 원본 파일 수정 워크플로우

Cline 원본 소스 파일 수정 시 따라야 할 절차입니다.

## 수정 레벨

### Level 1: 독립 모듈 (권장)
- `careti-src/` 디렉토리에 새 파일 생성
- Cline 파일 수정 없음
- 완전한 분리 유지

### Level 2: 조건부 통합
- Cline 파일에 최소 변경 (1-3줄)
- `// CARETI MODIFICATION:` 주석 필수
- 기능 플래그로 제어

### Level 3: 직접 수정 (피해야 함)
- 불가피한 경우만
- 상세한 문서화 필요
- 업스트림 병합 시 충돌 가능성

## 수정 프로토콜

### 1. 수정 전 확인
```
- 정말 Cline 파일 수정이 필요한가?
- Level 1 접근법으로 해결 가능한가?
- 수정 범위 최소화 가능한가?
```

### 2. 백업 규칙 (Deprecated)
**`.cline` 백업 파일 생성은 더 이상 사용하지 않음**
- 대신 Git 히스토리 활용
- 변경 전 커밋 권장

### 3. 주석 규칙
모든 수정에 다음 형식의 주석 필수:
```typescript
// CARETI MODIFICATION: [간단한 설명]
// 변경된 코드
```

예시:
```typescript
// CARETI MODIFICATION: Add persona system integration
if (caretMode) {
  await personaSystem.applyPersona();
}
```

### 4. 수정 범위
- 한 번에 1-3줄 변경 권장
- 여러 위치 수정 필요 시 각각 개별 주석
- 큰 블록 추가는 Level 1 접근법 사용

## 파일별 가이드

### src/ 디렉토리
- 핵심 Cline 기능
- 최소 변경 원칙 적용
- 기능 플래그 사용

### webview-ui/ 디렉토리
- React 컴포넌트
- 새 컴포넌트는 `careti-src/` 생성
- 기존 컴포넌트 수정 시 주석 필수

### Proto 파일
```bash
# proto 변경 시 순서대로 실행
npm run protos
npm run protos-go
```

## 체크리스트

### 수정 전
- [ ] Level 1 대안 검토 완료
- [ ] 영향 범위 분석 완료
- [ ] 테스트 계획 수립

### 수정 중
- [ ] `// CARETI MODIFICATION:` 주석 추가
- [ ] 최소 변경 원칙 준수
- [ ] 기존 테스트 통과 확인

### 수정 후
- [ ] 컴파일 성공
- [ ] 전체 테스트 통과
- [ ] Cline 기능 정상 동작

## 미러링 정책
`.agents/`와 `.users/`는 1:1 미러링 구조입니다.
- 이 파일 수정 시 `.agents/workflows/cline-modification.md`도 동일하게 업데이트
