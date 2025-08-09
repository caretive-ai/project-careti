# 006-5: Webview 참조 분리 전략 구현

## 📋 개요
- **상위 작업**: 006-upstream-merge-conflict-resolution-plan.md
- **작업 목적**: 
  - 006번 머징 작업의 일환으로 webview 충돌 문제 근본 해결
  - 머징 프로세스 개선 및 보강
  - 머징 가이드 실전 검증 및 업데이트
- **핵심 전략**: webview-ui를 참조용으로 유지하고, caret-webview-ui를 실제 빌드용으로 분리
- **실행 시점**: 006-4 머지 작업 완료 후 별도 브랜치에서 진행
- **예상 소요 시간**: 2-3시간 (검증 포함)

## 🎯 배경
1. 현재 webview-ui 디렉토리에서 매번 충돌 발생
2. Caret의 UI는 Cline과 거의 완전히 다른 코드베이스
3. 매 업데이트마다 동일한 분석과 충돌 해결 반복
4. 머징 가이드에도 "webview-ui는 Caret 버전 우선" 원칙 확립

## 📌 전제 조건
1. **006-4 작업 완료**: 현재 머지 충돌이 모두 해결되고 컴파일 성공
2. **테스트 통과**: 기존 기능이 정상 작동하는 상태
3. **백업 완료**: 현재 상태의 전체 백업 존재
4. **팀 합의**: 이 구조 변경에 대한 팀 동의

## 📐 아키텍처 설계

### 디렉토리 구조
```
caret/
├── webview-ui/          # Cline 원본 (참조용, 빌드 제외)
│   └── [Cline의 최신 webview 코드]
├── caret-webview-ui/    # Caret 독립 webview (실제 빌드)
│   └── [Caret의 고유 UI 구현]
└── package.json         # 빌드 경로 변경
```

### 장점
- ✅ 머지 충돌 완전 제거 (webview-ui는 항상 --theirs)
- ✅ Cline의 개선사항을 선별적으로 참고 가능
- ✅ Caret UI의 독립적 발전 가능
- ✅ 백엔드 API 변경 시 양쪽 비교 가능

## 🔧 작업 범위

### Phase 0: 사전 분석 및 준비
1. **영향 범위 분석**
   ```bash
   # webview-ui 참조 전체 파악
   grep -r "webview-ui" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.js" --include="*.mjs" . | grep -v node_modules > webview-references.txt
   
   # 카테고리별 분류
   grep -r "webview-ui" --include="*.json" . | grep -v node_modules > webview-refs-config.txt
   grep -r "webview-ui" --include="*.ts" --include="*.tsx" src/ > webview-refs-source.txt
   grep -r "webview-ui" --include="*.ts" --include="*.tsx" caret-src/ > webview-refs-caret.txt
   grep -r "webview-ui" scripts/ > webview-refs-scripts.txt
   
   # 예상 변경 파일 수
   echo "설정 파일: $(wc -l < webview-refs-config.txt)"
   echo "소스 파일: $(wc -l < webview-refs-source.txt)"
   echo "Caret 파일: $(wc -l < webview-refs-caret.txt)"
   echo "스크립트: $(wc -l < webview-refs-scripts.txt)"
   ```

2. **경로 변경 자동화 스크립트 준비** (머징 가이드의 일괄 처리 전략 적용)
   
   **Step 1: 패턴 식별** - 2-3개 파일 수동 수정하여 패턴 확인
   ```bash
   # 예시 파일로 패턴 확인
   grep -n "webview-ui" package.json
   grep -n "webview-ui" caret-src/core/webview/CaretProvider.ts
   ```
   
   **Step 2: 영향 범위 분석**
   ```bash
   # 안전한 검색어로 정확한 범위 파악
   grep -r '"webview-ui/' --include="*.ts" --include="*.tsx" --include="*.json" | wc -l
   ```
   
   **Step 3: 스크립트 작성**
   ```python
   # path-migration.py 작성
   patterns = [
       (r'from\s+"\.\.\/\.\.\/webview-ui\/', r'from "../../caret-webview-ui/'),
       (r'from\s+"@\/webview-ui\/', r'from "@/caret-webview-ui/'),
       (r'\["webview-ui"', r'["caret-webview-ui"'),
       (r'cd webview-ui', r'cd caret-webview-ui'),
       (r'webview-ui/build', r'caret-webview-ui/build'),
       (r'webview-ui/node_modules', r'caret-webview-ui/node_modules'),
   ]
   ```
   
   **Step 4: 즉시 검증 계획** - 변경 후 바로 `npm run compile`

3. **롤백 계획 수립**
   - 전체 백업: `git stash && git branch backup-before-webview-separation`
   - 실패 시 복구 스크립트 준비

### Phase 1: 구조 변경 (기본 설정)

⚠️ **중요: Git 이력 보존을 위한 복사 순서**
1. **먼저 Cline 최신 webview-ui로 초기화**
   ```bash
   # upstream의 최신 webview-ui 가져오기
   git checkout upstream/main -- webview-ui/
   ```

2. **caret-webview-ui 디렉토리 생성 및 복사**
   ```bash
   # Cline 최신 버전을 기준으로 복사
   cp -r webview-ui caret-webview-ui
   
   # 현재 Caret의 webview-ui 복원
   git checkout HEAD -- webview-ui/
   
   # Caret 버전을 caret-webview-ui에 덮어쓰기
   cp -r webview-ui/* caret-webview-ui/
   ```

3. **설정 파일 초기화**
   - caret-webview-ui/package.json 확인
   - caret-webview-ui/tsconfig.json 확인
   - caret-webview-ui/.env.dev, .env.prod 복사

4. **.gitignore 업데이트**
   ```gitignore
   # Cline 원본은 참조용 - 빌드하지 않음
   webview-ui/node_modules/
   webview-ui/build/
   webview-ui/package-lock.json
   ```

5. **.gitattributes 추가**
   ```gitattributes
   # webview-ui는 항상 upstream 버전 유지
   webview-ui/** merge=theirs
   ```
   
   ⚠️ **주의**: 이 설정은 Git의 자동 머지 전략을 지정합니다
   - `merge=theirs`는 충돌 시 upstream(Cline) 버전을 자동 선택
   - 수동 머지 시에도 `git checkout --theirs webview-ui/` 사용
   - Caret의 변경사항은 모두 caret-webview-ui/에만 적용

### Phase 2: 빌드 경로 수정
1. **package.json 스크립트 수정**:
   ```json
   "build:webview": "cd caret-webview-ui && npm run build",
   "dev:webview": "cd caret-webview-ui && npm run dev",
   "test:webview": "cd caret-webview-ui && npm run test",
   "install:all": "npm install && cd caret-webview-ui && npm install",
   "watch:webview": "npm run build:webview -- --watch",
   "postprotos": "prettier src/shared/proto src/core/controller src/hosts/ caret-webview-ui/src/services src/generated --write --log-level warn",
   "clean": "rimraf dist dist-standalone caret-webview-ui/build src/generated out/",
   "lint": "eslint src --ext ts && eslint caret-webview-ui/src --ext ts && buf lint && cd caret-webview-ui && npm run lint"
   ```

2. **CaretProvider.ts 경로 수정**:
   - webview-ui/build → caret-webview-ui/build
   - webview-ui/node_modules → caret-webview-ui/node_modules
   - .env 파일 경로 수정

3. **기타 설정 파일 수정**:
   - caret-src/utils/getUri.ts 주석 업데이트
   - scripts/build-proto.mjs의 prettier 경로
   - tsconfig.json의 paths 설정
   - vitest.config.ts의 exclude 경로
   - .vscode/settings.json (있을 경우)

### Phase 2.5: 테스트 코드 일괄 변경
1. **자동 변경 실행**
   ```bash
   # 테스트 파일들 일괄 변경
   python3 path-migration.py caret-src/__tests__/
   ```

2. **영향받는 테스트 파일 목록**:
   - ui-language-setting-i18n.test.ts
   - integration.test.ts
   - language-settings-integration.test.ts
   - ui-color-consistency.test.ts
   - caret-cline-hybrid-mode.test.ts
   - mode-change-integration.test.ts
   - ui-language-context-integration.test.ts

### Phase 3: 검증 및 테스트

#### 3.1 빌드 검증 (각 단계별 즉시 확인)
```bash
# 1. 의존성 설치
npm run install:all
# ✅ 확인: node_modules 생성, package-lock.json 업데이트

# 2. Proto 생성  
npm run protos
# ✅ 확인: caret-webview-ui/src/services/grpc-client.ts 생성됨
# ✅ 확인: 에러 없이 완료

# 3. TypeScript 컴파일
npm run compile
# ✅ 확인: 0 errors 출력

# 4. Webview 빌드
npm run build:webview  
# ✅ 확인: caret-webview-ui/build 디렉토리 생성
# ✅ 확인: index.js, index.css 파일 존재

# 5. 개발 서버 테스트
npm run dev:webview
# ✅ 확인: 포트 3000에서 실행, 에러 없음
```

#### 3.2 테스트 실행
```bash
# 백엔드 테스트 (경로 변경 확인)
npm run test:backend -- caret-src/__tests__/
# ✅ 확인: webview-ui 참조 테스트 모두 통과

# 프론트엔드 테스트
npm run test:webview
# ✅ 확인: 테스트 통과, 경로 에러 없음

# 통합 테스트
npm run test:all
# ✅ 확인: 전체 테스트 통과
```

#### 3.3 Extension 실행 테스트
1. **VSCode에서 실행**
   - F5로 Extension Development Host 실행
   - ✅ Caret 아이콘 표시 확인
   - ✅ 사이드바 열기 가능
   - ✅ UI 정상 렌더링

2. **기능 동작 확인**
   - ✅ 채팅 입력/응답 정상
   - ✅ 설정 변경 저장됨
   - ✅ 테마 전환 동작
   - ✅ 다국어 전환 동작
   - ✅ API 통신 정상

3. **콘솔 에러 확인**
   - Developer Tools 열기 (Ctrl+Shift+I)
   - ✅ Console 탭에 에러 없음
   - ✅ Network 탭에서 404 없음

#### 3.4 패키징 테스트
```bash
# VSIX 생성
npm run package
# ✅ 확인: caret-*.vsix 파일 생성

# 패키지 크기 확인
ls -lh *.vsix
# ⚠️ 주의: 크기가 비정상적으로 크면 확인 필요
```

### Phase 4: CI/CD 업데이트
1. **GitHub Actions 워크플로우 수정**
   - 빌드 경로 변경
   - 테스트 경로 변경

2. **배포 스크립트 확인**
   - package-release.js 검토

### Phase 5: 문서 업데이트
1. 머징 가이드에 "참조 분리 전략" 섹션 추가
2. 개발자 가이드 업데이트
3. README 업데이트
4. CONTRIBUTING.md 업데이트

## 📝 체크리스트

### Phase 0: 사전 분석 및 준비
- [ ] 현재 변경사항 커밋 및 푸시
- [ ] 백업 브랜치 생성: `git branch backup-before-webview-separation`
- [ ] 작업 브랜치 생성: `git checkout -b webview-separation`
- [ ] webview-ui 참조 분석 완료 (`webview-references.txt`)
- [ ] path-migration.py 스크립트 작성 및 테스트
- [ ] 롤백 스크립트 준비

### Phase 1: 구조 변경
- [ ] caret-webview-ui 디렉토리 생성
- [ ] webview-ui 내용 복사 (cp -r webview-ui/* caret-webview-ui/)
- [ ] caret-webview-ui/package.json 확인
- [ ] caret-webview-ui/tsconfig.json 확인
- [ ] .env 파일들 복사
- [ ] .gitignore 업데이트
- [ ] .gitattributes 추가
- [ ] 첫 번째 커밋: "feat: caret-webview-ui 디렉토리 생성"

### Phase 2: 빌드 경로 수정
- [ ] package.json 스크립트 8개 수정
- [ ] CaretProvider.ts 경로 3곳 수정
- [ ] getUri.ts 주석 업데이트
- [ ] scripts/build-proto.mjs 수정
- [ ] tsconfig.json paths 수정
- [ ] vitest.config.ts exclude 수정
- [ ] 두 번째 커밋: "feat: 빌드 경로를 caret-webview-ui로 변경"

### Phase 2.5: 테스트 코드 수정
- [ ] path-migration.py 실행
- [ ] 테스트 파일 변경 확인 (7개 파일)
- [ ] import 경로 검증
- [ ] 세 번째 커밋: "feat: 테스트 코드 경로 업데이트"

### Phase 3: 검증
- [ ] npm run install:all 성공
- [ ] npm run protos 성공
- [ ] npm run compile 성공
- [ ] npm run build:webview 성공
- [ ] npm run dev:webview 동작 확인
- [ ] npm run test:backend 통과
- [ ] npm run test:webview 통과
- [ ] npm run package 성공
- [ ] Extension 실행 및 UI 확인
- [ ] 네 번째 커밋: "test: webview 분리 검증 완료"

### Phase 4: CI/CD
- [ ] GitHub Actions 워크플로우 확인
- [ ] 필요시 워크플로우 수정
- [ ] package-release.js 검토

### Phase 5: 문서화
- [ ] 머징 가이드에 "참조 분리 전략" 추가
- [ ] 개발자 가이드 업데이트
- [ ] README.md 업데이트
- [ ] CONTRIBUTING.md 업데이트
- [ ] 이 작업 문서 완료 표시
- [ ] 다섯 번째 커밋: "docs: webview 분리 전략 문서화"

### 최종 검증
- [ ] upstream-merge-test 브랜치에서 테스트 머지
- [ ] webview-ui 충돌 없음 확인
- [ ] PR 생성 및 리뷰

## 📚 머징 가이드 보강 사항 (필수)

### 이번 작업 후 반드시 업데이트해야 할 내용

1. **webview 분리 전략 섹션 추가**
   - 디렉토리 구조 변경 설명
   - .gitattributes 설정 방법
   - 빌드 경로 변경 사항

2. **비교 기준점 변경 문서화**
   - **현재 (006-4)**: 분기점(merge-base) 이후 변경사항 분석
   - **향후 (006-5 이후)**: 머징 시점 기준 직접 비교
   ```bash
   # 이전: 분기점 이후 변경사항
   git diff $(git merge-base HEAD upstream/main)..upstream/main -- webview-ui/
   
   # 이후: 두 디렉토리 직접 비교 (머징 시점 기준)
   diff -r webview-ui/ caret-webview-ui/
   ```

3. **새로운 워크플로우 가이드**
   - Cline 업데이트 시 webview-ui는 자동으로 --theirs
   - caret-webview-ui는 변경 없음
   - 개선사항 선택적 적용 프로세스

4. **주의사항 및 체크리스트**
   - Proto 생성 경로 확인
   - 테스트 파일 경로 변경
   - CI/CD 설정 업데이트

### 머징 프로세스 검증 포인트
- [ ] 006-5 실행 과정에서 발견된 이슈 기록
- [ ] 예상치 못한 경로 참조 문제 문서화
- [ ] 성능 영향 (빌드 시간, 디스크 사용량) 측정
- [ ] 개발자 경험 피드백 수집

## 🚀 실행 명령어

```bash
# 1. 디렉토리 생성 및 복사
mkdir caret-webview-ui
cp -r webview-ui/* caret-webview-ui/

# 2. 의존성 설치
cd caret-webview-ui && npm install

# 3. 빌드 테스트
cd .. && npm run build:webview

# 4. 전체 테스트
npm run compile
npm run package
```

## 📊 성공 지표
1. webview-ui 디렉토리는 Cline 원본 유지
2. caret-webview-ui에서 모든 빌드 수행
3. 향후 머지 시 webview-ui 충돌 없음
4. Cline 개선사항을 쉽게 비교/적용 가능

## 🔄 향후 워크플로우

### 1. Cline 업데이트 시
```bash
# webview-ui는 항상 upstream 버전으로
git checkout --theirs -- webview-ui/

# 충돌 없이 자동 적용됨 (.gitattributes 설정 덕분)
```

### 2. 개선사항 분석

#### 2.1 분기점 이후 변경사항 파악
```bash
# 마지막 공통 조상 찾기
MERGE_BASE=$(git merge-base HEAD upstream/main)
echo "분기점: $MERGE_BASE"

# 분기 이후 Cline의 webview 커밋 목록
git log --oneline $MERGE_BASE..upstream/main -- webview-ui/

# 상세 변경 내용 확인
git diff $MERGE_BASE..upstream/main -- webview-ui/ > cline-webview-changes.diff
```

#### 2.2 주요 개선사항 카테고리
분기점(616800fc) 이후 확인된 Cline 개선사항:
- **기능 추가**: 
  - Context sending to active editor panels
  - Walkthrough button for new users
  - Prompt caching for Opus 4.1
- **서비스 통합**:
  - Posthog integration (Feature Flags, Telemetry, Error tracking)
- **클라우드 지원**:
  - Ollama key for cloud endpoint

#### 2.3 선택적 적용 기준
1. **우선 적용**: 버그 수정, 성능 개선
2. **검토 후 적용**: 새 기능 (Caret UI와 조화 확인)
3. **적용 제외**: Caret 고유 기능과 충돌하는 변경

### 3. 개선사항 상세 분석
```bash
# 전체 구조 비교
diff -r webview-ui/ caret-webview-ui/ | grep -E "^Only in" > structure-diff.txt

# 특정 컴포넌트 비교
diff -u webview-ui/src/components/chat/ChatView.tsx caret-webview-ui/src/components/chat/ChatView.tsx

# 새로운 파일 찾기
find webview-ui -name "*.tsx" -newer caret-webview-ui/package.json
```

### 3. 선별적 적용
```bash
# 버그 수정 적용
cp webview-ui/src/utils/bugfix.ts caret-webview-ui/src/utils/

# 기능 추가 검토
meld webview-ui/src/features/new-feature.tsx caret-webview-ui/src/features/
```

### 4. 파일 삭제/이동 검증
```bash
# Cline에서 삭제된 파일 확인
git log upstream/main --oneline -n 100 | grep -i "delete\|remove"

# 삭제된 파일이 Caret에 필요한지 검토
git diff --name-status upstream/main..HEAD | grep "^D"
```

## ⚠️ 위험 요소 및 완화 전략

### 위험 요소
1. **디스크 사용량 2배**
   - webview-ui와 caret-webview-ui 모두 유지
   - node_modules 중복 (약 300MB)

2. **경로 변경 누락**
   - 동적 경로 생성 코드
   - 문자열로 된 경로 참조

3. **Proto 생성 경로 문제**
   - grpc-client.ts 생성 위치
   - proto 생성 스크립트가 webview-ui와 caret-webview-ui 둘 다 처리해야 하는지 확인
   - **구체적 확인 사항**:
     - `scripts/build-proto.mjs`의 `WEBVIEW_NICE_JS_OUT_DIR` 경로 변경 필요
     - `"webview-ui/src/services"` → `"caret-webview-ui/src/services"`
     - prettier 포맷팅 경로에도 caret-webview-ui 추가
     - 생성된 파일이 올바른 위치에 있는지 검증

4. **타입 정의 참조 깨짐**
   - tsconfig paths 설정

### 완화 전략
1. **점진적 마이그레이션**
   - 한 번에 모든 것을 변경하지 않음
   - 각 Phase별 검증

2. **자동화 도구 활용**
   - path-migration.py로 일괄 변경
   - grep으로 누락 확인

3. **충분한 테스트**
   - 각 단계별 컴파일 확인
   - 기능 테스트 수행

## 📊 성능 고려사항

### 장점
- 머지 시간 대폭 단축 (충돌 해결 불필요)
- 개발 시 명확한 분리

### 단점
- 초기 설치 시간 증가 (npm install 2회)
- 디스크 사용량 증가

### 최적화 방안
- webview-ui는 shallow clone으로 유지
- 정기적으로 불필요한 파일 정리

## 🔧 자동화 스크립트

### path-migration.py
```python
#!/usr/bin/env python3
import os
import re
import sys
from pathlib import Path

def migrate_paths(file_path):
    """webview-ui 경로를 caret-webview-ui로 변경"""
    
    patterns = [
        # Import 문
        (r'from\s+"\.\.\/\.\.\/webview-ui\/', r'from "../../caret-webview-ui/'),
        (r'from\s+"\.\.\/webview-ui\/', r'from "../caret-webview-ui/'),
        (r'from\s+"\.\/webview-ui\/', r'from "./caret-webview-ui/'),
        (r'from\s+"webview-ui\/', r'from "caret-webview-ui/'),
        
        # 경로 문자열
        (r'\["webview-ui"', r'["caret-webview-ui"'),
        (r"'webview-ui/", r"'caret-webview-ui/"),
        (r'"webview-ui/', r'"caret-webview-ui/'),
        
        # 명령어
        (r'cd webview-ui', r'cd caret-webview-ui'),
        
        # 빌드 경로
        (r'webview-ui/build', r'caret-webview-ui/build'),
        (r'webview-ui/node_modules', r'caret-webview-ui/node_modules'),
        
        # Join path
        (r'join\([^,]+,\s*"webview-ui"', r'join(\1, "caret-webview-ui"'),
    ]
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Updated: {file_path}")
            return True
        else:
            print(f"⏭️  No changes: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 path-migration.py <directory_or_file>")
        sys.exit(1)
    
    target = sys.argv[1]
    updated_count = 0
    
    if os.path.isfile(target):
        if migrate_paths(target):
            updated_count += 1
    else:
        for root, dirs, files in os.walk(target):
            # node_modules 제외
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.json', '.mjs')):
                    file_path = os.path.join(root, file)
                    if migrate_paths(file_path):
                        updated_count += 1
    
    print(f"\n📊 Total files updated: {updated_count}")

if __name__ == "__main__":
    main()
```

### 롤백 스크립트 (rollback.sh)
```bash
#!/bin/bash
echo "🔄 Rolling back webview separation..."

# 1. 이전 브랜치로 복귀
git checkout backup-before-webview-separation

# 2. caret-webview-ui 삭제
rm -rf caret-webview-ui

# 3. 변경된 파일들 복구
git checkout HEAD -- package.json
git checkout HEAD -- .gitignore
git checkout HEAD -- .gitattributes
git checkout HEAD -- caret-src/
git checkout HEAD -- scripts/

echo "✅ Rollback completed"
```

## 🎯 결정 사항 기록

### 왜 이 방식을 선택했는가?
1. **완전 분리 vs 참조 분리**: 참조 분리 선택
   - 이유: Cline의 개선사항을 쉽게 비교/적용 가능

2. **webview-ui 빌드 여부**: 빌드하지 않음
   - 이유: 순수 참조용으로만 사용

3. **자동 머지 설정**: .gitattributes 사용
   - 이유: 수동 개입 최소화

## 🎓 이번 작업의 의의

### 머징 프로세스 개선
1. **반복 작업 제거**: 매번 동일한 webview 충돌 해결 불필요
2. **명확한 비교 기준**: Cline 원본과 Caret 버전을 언제든 비교 가능
3. **선택적 개선 적용**: 필요한 개선사항만 골라서 적용

### 머징 가이드 검증
- **실전 검증**: 이론이 아닌 실제 대규모 머지를 통한 가이드 검증
- **패턴 발견**: webview 같은 대규모 독립 모듈의 처리 패턴 확립
- **도구 개발**: 자동화 스크립트 등 재사용 가능한 도구 축적
