# 006-4 ChatRow 구조 복구 작업 계획

## 📋 개요
- **작업일**: 2025-01-22
- **상위 작업**: [006-4 컴파일 에러 트리아지 및 수정](./006-4-compile-error-triage-and-fix.md)
- **현재 상태**: 146개 컴파일 에러 발생 (주로 JSX 구조 손상)
- **복구 대상**: ChatRow.tsx, ChatView.tsx, ApiOptions.tsx, ExtensionStateContext.tsx

## 🎯 문제 분석

### 손상 원인
1. **006 upstream 머징 과정**에서 충돌 해결 실패
2. **006-5 webview 분리 작업**에서 파일 복사 중 구조 손상
3. **JSX 구문 파싱 오류**로 인한 대량 컴파일 에러

### 손상 정도
- **ChatRow.tsx**: 314번째 줄부터 JSX 태그 매칭 오류, 2000+ 라인 전반적 손상
- **ChatView.tsx**: 568번째 줄 구문 오류
- **ApiOptions.tsx**: 314번째 줄 조건부 렌더링 구문 오류
- **ExtensionStateContext.tsx**: 346번째 줄부터 함수 정의 구문 오류

## 🔍 안정적인 기준점 발견

### Git 로그 분석 결과
```bash
commit 7b22646dea05d392251ba8abfb2eac5e3c51f1bd (backup-before-webview-separation)
Author: Luke Yang <luke.yang@caretive.ai>
Date: Sat Aug 9 11:24:16 2025 +0900

docs: 006-5 webview 분리 전략 수립 완료 및 AI 가이드 업데이트
- webview 충돌 해결 완료 (ChatRow, ChatView 등) ← 중요!
```

**핵심 발견**: `backup-before-webview-separation` 커밋(7b22646d)에서 해당 파일들이 마지막으로 정상 상태였음

## 🛠️ 복구 전략

### Phase 1: 안정된 파일 복원
1. **7b22646d 커밋에서 정상 파일 복원**
   ```bash
   git checkout 7b22646d -- webview-ui/src/components/chat/ChatRow.tsx
   git checkout 7b22646d -- webview-ui/src/components/chat/ChatView.tsx
   git checkout 7b22646d -- webview-ui/src/components/settings/ApiOptions.tsx
   git checkout 7b22646d -- webview-ui/src/context/ExtensionStateContext.tsx
   ```

2. **caret-webview-ui로 복사**
   ```bash
   cp webview-ui/src/components/chat/ChatRow.tsx caret-webview-ui/src/components/chat/
   cp webview-ui/src/components/chat/ChatView.tsx caret-webview-ui/src/components/chat/
   cp webview-ui/src/components/settings/ApiOptions.tsx caret-webview-ui/src/components/settings/
   cp webview-ui/src/context/ExtensionStateContext.tsx caret-webview-ui/src/context/
   ```

### Phase 2: 구조 호환성 수정
**예상 수정 사항 (7b22646d는 006 머징 이전이므로):**

1. **Import 경로 수정**
   - `@shared/proto/*` 경로 변경사항 반영
   - 새로운 타입/인터페이스 import 추가

2. **API 호출 수정**
   - StateServiceClient 메서드 시그니처 변경 대응
   - 새로운 proto 메시지 구조 적용

3. **타입 정의 수정**
   - 006 머징으로 변경된 타입 정의 적용
   - 새로운 enum/interface 사용

4. **CARET MODIFICATION 부분 보존**
   - Caret 고유 기능은 유지하면서 구조만 수정

### Phase 3: 점진적 검증
1. **파일별 개별 검증**
   ```bash
   npm run build  # 각 파일 복원 후 즉시 확인
   ```

2. **에러 개수 추적**
   - 146개 → ? → 0개 목표
   - 각 단계별 에러 감소량 기록

3. **기능 동작 확인**
   - Extension Host 실행 테스트
   - UI 렌더링 정상 여부 확인

## 📊 성공 지표

### 1차 목표 (필수)
- [ ] `npm run build` 0 errors 달성
- [ ] Extension Host에서 UI 정상 표시
- [ ] 기본 채팅 기능 동작 확인

### 2차 목표 (권장)
- [ ] `npm run test:webview` 통과
- [ ] Caret 고유 기능 정상 작동 (페르소나, 설정 등)
- [ ] 성능 저하 없음 확인

## ⚠️ 주의사항

### 백업 원칙
- 현재 손상된 파일들도 `.damaged` 확장자로 백업
- 복원 과정에서 문제 발생 시 즉시 되돌릴 수 있도록 준비

### 수정 원칙
- JSX 구조는 7b22646d 기준을 그대로 유지
- import/타입만 현재 구조에 맞게 수정
- Caret 고유 기능 (`// CARET MODIFICATION`) 절대 삭제 금지

### 검증 원칙
- 각 파일 복원 후 즉시 컴파일 확인
- 에러 개수가 줄어드는지 확인
- 새로운 에러 패턴 발생 시 즉시 분석

## 📝 실행 로그

### 진행 상황 기록
- [ ] Phase 1 시작: 안정된 파일 복원
- [ ] Phase 2 시작: 구조 호환성 수정
- [ ] Phase 3 시작: 점진적 검증
- [ ] 작업 완료: 모든 지표 달성

### 에러 감소 추적
- 시작: 146개 에러
- Phase 1 완료: ? 개 에러
- Phase 2 완료: ? 개 에러  
- Phase 3 완료: 0개 에러 (목표)

---

**작성자**: Alpha Yang  
**검토자**: Luke Yang  
**다음 단계**: Phase 1 실행 - 안정된 파일 복원