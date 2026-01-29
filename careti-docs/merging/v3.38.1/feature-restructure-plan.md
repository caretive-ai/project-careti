# Feature 문서 재정비 및 버전 업데이트 계획

## 목표
- `careti-docs/features` 디렉토리의 파일 번호 체계 재정비
- f00 문서 수정 (터미널 버그픽스 -> Cline Bugfix/Patch)
- 각 Feature 문서 내용 보강 (Cline 대비 개선점, 코드 범위 명시)
- 모든 문서의 참조 링크 업데이트
- CHANGELOG, announcement, 버전 정보 업데이트

## 실행 단계

### 1. 파일명 변경 및 번호 이동 (Shifting)
- `f00-terminal-bugfix.md` -> `f00-cline-bugfix-patch.md`
- `f04-careti-account.md` -> `f05-careti-account.md`
- `f05-rule-priority-system.md` -> `f06-agent-standard-claude-compat.md`
- `f06-careti-prompt-system.md` -> `f07-careti-prompt-system.md`
- `f07-persona-system.md` -> `f08-persona-system.md`
- `f08-feature-config-system.md` -> `f09-feature-config-system.md`
- `f09-enhanced-provider-setup.md` -> `f10-enhanced-provider-setup.md`
- `f10-input-history-and-shortcuts.md` -> `f11-input-history-and-shortcuts.md`
- `f11-ai-developer-knowledge-parity.md` -> `f12-ai-developer-knowledge-parity.md`

### 2. 내용 수정
- **f00-cline-bugfix-patch.md**: 내용 수정 (Cline 버그 패치 위주)
- **f04-cline-compatibility-and-cli.md**: 내용 확인 및 보강
- **기타 Feature 문서**: 헤더의 Feature 번호 수정, Cline 대비 개선점 명확화

### 3. 참조 업데이트 (Global Search & Replace)
- `index.md` 업데이트
- `careti-docs` 내 모든 문서에서 이전 파일명 참조를 새 파일명으로 변경
- 소스 코드 내 참조가 있다면 변경 (주로 주석일 가능성 높음)

### 4. 메타데이터 업데이트
- `package.json`: 버전 확인 및 필요 시 업데이트
- `CHANGELOG.md`: 작업 내용 반영
- `announcement.md` (json): 작업 내용 반영
- `careti-docs/merging/v3.38.1/attempt-2-master.md`: 작업 로그 추가

## 체크리스트
- [ ] 파일명 변경 완료
- [ ] f00 내용 수정 완료
- [ ] f04 내용 확인 및 보강
- [ ] f05~f12 내용(번호) 수정 완료
- [ ] index.md 업데이트
- [ ] 전체 참조 링크 업데이트
- [ ] CHANGELOG/announcement/버전 업데이트
