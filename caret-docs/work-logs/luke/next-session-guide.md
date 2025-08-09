# 다음 세션 작업 가이드

## 🎯 현재 작업 컨텍스트

### 상위 작업
- **006번 업스트림 머지 작업**: Cline upstream/main 병합 및 머징 프로세스 검증/보강
- **목적**: 머지 작업 수행 + 머징 가이드 실전 검증 + 프로세스 개선

### 현재 진행 상황
- **006-4 완료**: 머지 충돌 해결 중 webview 디렉토리의 반복적 충돌 문제 발견
- **006-5 전략 수립 완료**: webview 참조 분리 전략 문서화 완료
- **006-5 실행 완료**: webview 디렉토리 분리 구현 (2025-01-22)
  - ✅ caret-webview-ui 디렉토리 생성 및 구조 변경
  - ✅ 빌드 경로 수정 (package.json, CaretProvider.ts 등)
  - ✅ 테스트 코드 경로 업데이트
  - ⚠️ TypeScript 컴파일 에러 존재 (upstream 머지 관련)

### 다음 작업
**006-4로 복귀**: upstream 머지 관련 컴파일 에러 해결
- ChatRow.tsx 등 프론트엔드 TypeScript 에러 수정  
- **백엔드**: ✅ 이미 컴파일 성공! (host-grpc-client.ts 제거로 해결)
- **프론트엔드**: ❌ 약 146개 에러 남음 (JSX 구문 관련)

## 📚 필수 참조 문서

### 반드시 읽어야 할 문서
1. **`.caretrules`** - 프로젝트 절대 규칙
2. **`caret-docs/tasks/006-5-webview-separation-strategy.md`** - 실행할 전략 문서 (체크리스트 포함)
3. **`caret-docs/tasks/006-upstream-merge-conflict-resolution-plan.md`** - 전체 작업 맥락
4. **`caret-docs/guides/upstream-merging.mdx`** - 머징 가이드 (작업 후 업데이트 필요)

### 참고 문서
- `caret-docs/tasks/006-4-merge-work-log.md` - 이전 작업 로그
- `caret-docs/development/ai-work-index.mdx` - AI 작업 가이드

## 📊 현재 상태

### Git 상태
- **브랜치**: `webview-separation` (006-5 작업 완료)
- **상태**: webview 분리 완료, 4개 커밋 생성
- **주요 변경사항**:
  - ✅ caret-webview-ui 디렉토리 생성
  - ✅ 모든 빌드 경로 변경 완료
  - ✅ .gitignore/.gitattributes 설정
  - ✅ path-migration.py 자동화 스크립트 생성

### 컴파일 상태
- **webview 분리 관련**: 성공적으로 완료
- **upstream 머지 관련 에러**: ChatRow.tsx 등 약 146개 TypeScript 에러
- **proto 관련 경고**: buf lint 경고 (package "caret" 관련)

## 🔑 핵심 결정사항 및 제약

1. **webview 분리 원칙**:
   - webview-ui/: Cline 원본 유지 (참조용, 빌드 안함)
   - caret-webview-ui/: Caret 실제 빌드용
   - .gitattributes로 자동 머지 설정

2. **작업 순서 중요**:
   - 현재 상태 커밋 → 새 브랜치 → 006-5 실행
   - 각 Phase별 검증 필수

3. **머징 가이드 업데이트 필수**:
   - 비교 기준점 변경 문서화 (분기점 → 머징 시점)
   - 실전 검증 결과 반영

## 🚀 구체적 다음 단계

### 1. 현재 작업 커밋 & 푸시
```bash
# 변경사항 확인
git status

# 모든 변경사항 커밋
git add -A
git commit -m "docs: 006-5 webview 분리 전략 수립 완료 및 AI 가이드 업데이트"

# 푸시
git push origin upstream-merge-test
```

### 2. 006-5 실행을 위한 새 브랜치 생성
```bash
# 백업 브랜치 생성
git branch backup-before-webview-separation

# 작업 브랜치 생성
git checkout -b webview-separation
```

### 3. 006-5 Phase 0 시작
```bash
# webview-ui 참조 분석 (006-5 문서의 Phase 0 참조)
grep -r "webview-ui" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.js" --include="*.mjs" . | grep -v node_modules > webview-references.txt

# 카테고리별 분류
grep -r "webview-ui" --include="*.json" . | grep -v node_modules > webview-refs-config.txt
# ... (006-5 문서 참조)
```

## ⚠️ 주의사항

1. **Git 이력 보존**: 006-5 문서의 "Git 이력 보존을 위한 복사 순서" 반드시 준수
2. **Proto 생성 경로**: scripts/build-proto.mjs 수정 시 주의
3. **테스트 경로**: 7개 테스트 파일 경로 변경 필요
4. **각 Phase별 즉시 검증**: 컴파일 → 빌드 → 테스트 순서

## 📈 예상 결과

1. **즉각적 효과**:
   - 향후 머지 시 webview 충돌 완전 제거
   - Cline 개선사항 선택적 적용 가능

2. **머징 프로세스 개선**:
   - 대규모 독립 모듈 처리 패턴 확립
   - 재사용 가능한 자동화 스크립트

## 🎓 작업 의의

이번 006-5 작업은 단순한 기술적 해결이 아닌:
- **머징 가이드 실전 검증**의 핵심 사례
- **반복 작업 제거**를 통한 개발 효율성 향상
- **Fork 프로젝트의 지속가능한 관리** 패턴 확립

---

**작성일**: 2025-01-22
**작성자**: Alpha (알파)
**검토자**: Luke