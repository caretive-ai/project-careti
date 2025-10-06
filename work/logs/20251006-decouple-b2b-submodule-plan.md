# `caret-b2b` 서브모듈 분리 및 재구성 계획

## 1. 목표
- `caret` 메인 저장소에서 `caret-b2b` 서브모듈의 공식적인 연결을 끊는다.
- `caret-b2b`를 `.gitignore`에 추가하여 로컬에서 독립적으로 관리되도록 한다.
- `git pull` 및 컴파일 문제를 해결하기 위한 사전 작업을 완료한다.

## 2. 작업 절차

### 1단계: 서브모듈 연결 해제
1.  `git rm -f caret-b2b` 명령어를 실행하여 Git 인덱스와 작업 디렉토리에서 `caret-b2b` 서브모듈을 제거한다.
2.  `.gitmodules` 파일을 열어 `[submodule "caret-b2b"]` 섹션을 완전히 삭제한다.
3.  `.gitignore` 파일을 열어 최하단에 `caret-b2b/` 한 줄을 추가한다.

### 2단계: 변경사항 커밋
1.  `git add .gitmodules .gitignore` 명령어로 변경된 파일들을 스테이징한다.
2.  `git commit -m "refactor: Decouple caret-b2b submodule from main repository"` 메시지로 변경사항을 커밋한다.

### 3단계: `caret-b2b` 독립적으로 클론
1.  `git clone https://github.com/aicoding-caret/caret-b2b.git` 명령어를 실행하여 `caret-b2b` 저장소를 현재 위치에 다시 클론한다. `.gitignore`에 의해 이 디렉토리는 추적되지 않는다.

### 4단계: Git 상태 정상화 및 컴파일 준비
1.  `main` 브랜치로 이동 (`git checkout main`).
2.  `main` 브랜치 최신화 (`git pull origin main`).
3.  작업 브랜치로 복귀 (`git checkout feature/merge-cline-upstream-latest`).
4.  작업 브랜치 재정렬 (`git rebase main`).

### 5단계: 최종 검증
1.  `npm install` 및 `npm run compile`을 실행하여 모든 문제가 해결되었는지 확인한다.
