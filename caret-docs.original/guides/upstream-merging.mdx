# Cline 업스트림 병합 가이드

Caret은 Cline 프로젝트의 **Fork**로, Cline의 최신 변경사항을 지속적으로 통합하여 안정성과 기능 개선을 유지해야 합니다. 이 문서는 **AI 시대에 최적화된** Cline upstream 병합 절차를 안내합니다.

## 🎯 **핵심 원칙**

### **Fork 기반 업스트림 동기화 전략**

- **🚀 Squash Merge 우선**: 개별 commit 충돌을 피하고 깔끔한 히스토리 유지
- **🤖 AI 협업 최적화**: 의미론적 단위 작업으로 AI 도구 효율성 극대화
- **🛡️ Caret 기능 보존**: Cline 구조 우선 적용 후 Caret 고유 기능 복원
- **⚡ 에러의 구조적 해결**: 지엽적 수정 대신 근본 원인 분석 및 범위 확장
- **📋 체계적 검증**: 각 단계별 완료 기준과 롤백 지점 확보

---

## 🚀 **Squash Merge 전략** (권장 방법)

### **장점**

- ✅ **개별 commit 충돌 없음**: 200개 커밋도 한 번에 처리
- ✅ **깔끔한 git 히스토리**: 하나의 의미있는 통합 커밋
- ✅ **원작자 크레딧 보존**: 커밋 메시지에 상세 기록
- ✅ **빠른 완료**: 2-3시간 내 완료
- ✅ **향후 머징 문제 해결**: `--onto` 옵션으로 완벽 대응

### **기본 실행 절차**

```bash
# 1. 준비 작업
git fetch upstream
git checkout -b feature/cline-squash-merge
git tag backup-before-merge-$(date +%Y%m%d-%H%M%S)

# 2. Squash merge 실행
git merge upstream/main --squash --strategy-option=theirs

# 3. Caret 호환성 복원
find proto/ -name "*.proto" -exec sed -i 's/package cline;/package caret;/g' {} \;
# caretApiKey, clineApiKey 필드 확인 및 복원
# "Cline Account" → "Caret Account" 브랜딩 수정

# 4. 통합 커밋 생성
git add -A
git commit -m "Squash Merge: Cline v3.X.X → v3.Y.Y

🎯 Major upgrade via squash merge strategy

✨ Key Features Integrated:
- [주요 기능 1]
- [주요 기능 2]

🎯 Caret Customizations Preserved:
- Branding: Cline → Caret throughout UI
- API Compatibility: caretApiKey, clineApiKey maintained
- Package namespace: proto package caret

🔄 Git History Strategy:
- Squash merge preserves all Cline changes in single commit
- Full Cline commit range: https://github.com/cline/cline/compare/v3.X.X...v3.Y.Y"

# 5. 향후 rebase를 위한 기준점 설정
git tag caret-squash-baseline-v3.Y.Y -m "Baseline for future rebase with --onto"

# 6. Main 브랜치로 통합
git checkout main
git merge feature/cline-squash-merge --no-ff
```

### **Squash Merge 후 향후 업데이트 해결책**

**문제**: 다음 Cline 업데이트 시 Git이 공통 조상을 잘못 인식하여 충돌 발생

**해결**: `--onto` 옵션으로 정확한 커밋 범위 지정

```bash
# 다음 Cline 업데이트 시
git fetch upstream
git rebase --onto upstream/main caret-squash-baseline-v3.Y.Y

# 또는 HEAD 기준 범위 지정
git rebase --onto upstream/main HEAD~[Caret독자커밋수]
```

**참고**: [Git Squash and Merge 후 Rebase 문제 해결](https://tigris-data-science.tistory.com/entry/Git-Squash-and-Merge-%ED%9B%84-Rebase%EB%A5%BC-%ED%95%A0-%EB%95%8C-%EB%B0%9C%EC%83%9D%ED%95%98%EB%8A%94-%EB%AC%B8%EC%A0%9C)

---

## 🤖 **AI 시대 에러 분석 원칙**

### **⚠️ 지엽적 해결의 함정**

```bash
❌ 잘못된 접근:
"이 파일에서 에러가 났네? 이 파일만 수정하자"
"이 타입 에러를 빠르게 고치자"
"일단 빌드만 되게 하자"

✅ 올바른 접근:
"이 에러가 발생한 근본 원인은 무엇인가?"
"이 문제가 다른 곳에도 영향을 미치지 않을까?"
"전체 아키텍처 관점에서 어떤 의미인가?"
```

### **🔍 4단계 체계적 에러 분석**

#### **1단계: 원인 분석 (Why?)**

- 이 에러가 왜 발생했는가?
- upstream 변경사항 중 어떤 부분이 원인인가?
- Caret 고유 코드와 어떻게 충돌하는가?
- 개별 파일 문제인가, 아키텍처 문제인가?

**분석 도구:**

- 3-레포 비교: `main-caret` vs `cline-latest` vs 현재 상태
- `git blame`으로 변경 이력 추적
- 관련 시스템(Proto/gRPC/WebView/API) 식별

#### **2단계: 영향 범위 확장 (What else?)**

- 동일한 패턴의 에러가 다른 파일에도 있는가?
- 같은 시스템의 다른 컴포넌트에 영향은 없는가?
- 연관된 타입/인터페이스 변경사항은 없는가?

**확장 도구:**

- `grep`/`ripgrep`로 유사 패턴 검색
- TypeScript 컴파일러 전체 에러 리스트 확인
- 의존성 그래프 분석

#### **3단계: 결과 예측 (What if?)**

- 이것만 수정하면 다른 곳에서 에러가 날까?
- 근본 원인을 해결하면 여러 에러가 한번에 사라질까?
- 임시 수정 vs 근본 해결의 장단점은?

#### **4단계: 전략적 해결 (How?)**

1. **구조적 문제**: 아키텍처부터 정리
2. **호환성 문제**: 매핑/어댑터 레이어 구축
3. **네이밍 충돌**: 네임스페이스 정리
4. **버전 차이**: 단계적 마이그레이션

### **AI 협업 원칙**

#### **효과적인 에러 보고**

```bash
✅ 좋은 보고:
"WebView에서 AccountService 관련 TypeScript 에러 5개가 발생했는데,
 모두 Organization 관련 타입이 없다는 내용입니다.
 Cline upstream에서 Account 시스템이 확장된 것 같은데,
 전체적으로 어떻게 접근해야 할까요?"

❌ 나쁜 보고:
"AccountView.tsx 47줄에서 에러나요. 고쳐주세요."
```

#### **역할 분담**

```bash
🤖 AI가 잘하는 것:
- 패턴 인식 및 유사 문제 찾기
- 대량 파일 일괄 수정
- 코드 생성 및 리팩토링

👨‍💻 인간이 잘하는 것:
- 전체 아키텍처 설계
- 비즈니스 로직 우선순위 결정
- 장기적 전략 수립
```

---

## 📋 **실행 가이드**

### **1. 준비 작업**

#### **1.1 환경 설정 (최초 1회)**

```bash
# Cline 원본 저장소를 upstream으로 추가
git remote add upstream https://github.com/cline/cline.git
git remote -v  # 확인
```

#### **1.2 변경사항 분석**

```bash
# upstream 최신 정보 가져오기
git fetch upstream

# 변경사항 확인
git log --oneline main..upstream/main
git diff --name-only main upstream/main

# CHANGELOG 분석 (중요!)
cp cline-latest/CHANGELOG.md CHANGELOG-cline.md
grep -A 10 "^## \[3\." CHANGELOG-cline.md | head -50
```

#### **1.3 삭제된 파일 확인**

```bash
# Cline에서 삭제된 파일 확인
git diff --name-only --diff-filter=D main upstream/main

# Caret 수정사항 확인 후 처리
git log --oneline --follow <삭제된_파일_경로>
```

### **2. Squash Merge 실행**

**핵심 원칙**: 위의 "Squash Merge 전략" 섹션 참조

### **3. Caret 호환성 복원**

#### **3.1 필수 브랜딩 복원**

```bash
# Proto 패키지명 복원
find proto/ -name "*.proto" -exec sed -i 's/package cline;/package caret;/g' {} \;

# UI 브랜딩 복원 (주요 위치)
grep -r "Cline Account" webview-ui/ --include="*.ts" --include="*.tsx"
# → "Caret Account"로 수정

# API 키 필드 확인
grep -r "clineApiKey\|caretApiKey" src/ --include="*.ts"
```

#### **3.2 Proto 재생성**

```bash
npm run protos
npm run compile
```

### **4. 검증 절차**

#### **4.1 빌드 검증**

```bash
# 의존성 설치
npm install
cd webview-ui && npm install && cd ..

# 전체 빌드
npm run compile
npm run build:webview
npm run lint
```

#### **4.2 기능 검증**

```bash
# VSCode Extension Development Host 테스트
# F5로 디버그 모드 실행

# 핵심 기능 확인
- [ ] 새로운 AI 모델 선택 가능
- [ ] Account 로그인/로그아웃 동작
- [ ] Caret 브랜딩 정상 표시
- [ ] 다국어 지원 동작
```

---

## 🛠️ **주요 문제 해결**

### **충돌 유형별 해결 전략**

#### **1. TypeScript 타입 에러**

```bash
# 문제: Property 'newField' does not exist on type 'OldInterface'
# 원인: upstream에서 Interface 확장
# 해결: Interface 정의 업데이트 + 사용처 수정 (any 캐스팅 금지)
```

#### **2. gRPC 메서드 호출 에러**

```bash
# 문제: Method 'oldMethod' not found
# 원인: upstream에서 gRPC 서비스 변경
# 해결: Proto 업데이트 + 새 메서드로 마이그레이션 (주석 처리 금지)
```

#### **3. Proto 패키지 충돌**

```bash
# 문제: package cline vs package caret 혼재
# 해결:
# - proto/cline/: Cline 원본 유지 (package cline;)
# - proto/caret/: Caret 고유 기능 (package caret;)
# - buf.yaml에 except 규칙 추가
```

### **buf.yaml 설정 최적화**

```yaml
version: v1
breaking:
    use:
        - FILE
    except:
        - PACKAGE_DIRECTORY_MATCH # CARET MODIFICATION: Allow package/directory mismatch
        - PACKAGE_SAME_DIRECTORY # CARET MODIFICATION: (caret package in cline directory)
lint:
    use:
        - DEFAULT
    except:
        - PACKAGE_DIRECTORY_MATCH
        - PACKAGE_SAME_DIRECTORY
```

### **Caret 고유 필드 번호 관리**

```proto
// CARET MODIFICATION: Caret 고유 필드는 1000번부터 시작
optional string caret_api_key = 1000;
optional string caret_custom_field = 1001;
// 1000-1999: Caret 전용 범위
```

---

## 📚 **참고 자료**

### **자동화 도구**

#### **충돌 해결 스크립트**

```bash
# Python 스크립트 (크로스 플랫폼)
python3 caret-scripts/merging-task/merge-conflict-resolver.py <file_path> caret

# 모든 충돌 파일 일괄 처리
find . -name "*.orig" -delete
git status --porcelain | grep "^UU" | cut -c4- | \
  xargs -I {} python3 caret-scripts/merging-task/merge-conflict-resolver.py {} caret
```

#### **차이점 분석 도구**

```bash
# 3-레포 비교 분석
node caret-scripts/merging-task/analyze-merge-differences.js

# 특정 파일만 분석
node caret-scripts/merging-task/analyze-merge-differences.js --file src/shared/api.ts
```

### **시스템 프롬프트 검증**

```bash
# 병합 전후 검증
npm test -- --testNamePattern="ClineFeatureValidator"

# 25개 테스트 모두 통과 확인 필수
```

### **복구 방법**

```bash
# 병합 취소 (병합 직후)
git reset --hard HEAD~1

# 특정 커밋으로 되돌리기
git reset --hard <commit_hash>

# 안전한 브랜치에서 테스트
git checkout -b test-merge
# 테스트 완료 후 main에 적용
```

---

## 🚨 **중요 체크리스트**

### **머징 전 필수 확인**

- [ ] `git fetch upstream` 완료
- [ ] CHANGELOG.md 분석 완료
- [ ] 백업 태그 생성 완료
- [ ] 작업 브랜치 생성 완료

### **머징 후 필수 검증**

- [ ] `npm run compile` 성공
- [ ] `npm run build:webview` 성공
- [ ] `npm run lint` 성공
- [ ] F5 디버그 모드 정상 동작
- [ ] 새 기능 동작 확인
- [ ] Caret 브랜딩 정상 표시

### **완료 후 정리**

- [ ] `.cline` 백업 파일 업데이트
- [ ] 불필요한 백업 파일 정리
- [ ] 머징 결과 문서화
- [ ] 다음 머징을 위한 태그 생성

---

**작성자**: Alpha Yang (AI Assistant)  
**검토자**: Luke (Project Owner)  
**최종 업데이트**: 2025-08-12  
**버전**: v3.0 (AI 시대 최적화)
