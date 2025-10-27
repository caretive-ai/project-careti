# .caretrules 구조 전수 검사 및 정리 작업

**작성일**: 2025-10-27
**작성자**: Alpha (Claude)
**목표**: .caretrules 구조를 올바르게 이해하고 정리

---

## 🎯 구조 원칙 (사용자 명시)

### 역할 구분
- **`.caretrules/*` (루트)**: 자주 보는 핵심 규칙/지식
  - "어떤 작업을 할 수 있는가?"
  - 간결한 요약
  - **workflows/ 파일이 있으면 참조 명시**

- **`.caretrules/workflows/*`**: 특정 작업의 상세 절차
  - "그 작업을 어떻게 하는가?"
  - 단계별 실행 가이드
  - 루트보다 상세함

- **`.caretrules/workflows/atoms/*`**: 재사용 가능한 최소 단위

### 문서 원칙
- AI는 작업을 할 수 있다는 것에 대한 지식이 필요
- 루트 파일에서 workflows 참조를 명시
- caret-docs와 1:1 동기화 유지
- 실제 코드와 최신성 유지

---

## 📊 현재 상태 분석

### ROOT 파일 (24개)

#### ✅ workflows 버전과 완전 동일 (6개) - **문제**
이들은 루트를 요약으로 바꾸고 workflows 참조 추가 필요:
1. `ai-feature.md` (245 lines)
2. `critical-verification.md` (93 lines)
3. `document-organization.md` (100 lines)
4. `merge-strategy.md` (87 lines)
5. `new-component.md` (180 lines)
6. `testing-work.md` (253 lines)

#### ⚠️ workflows 버전과 내용 다름 (3개) - **확인 필요**
어느 쪽이 올바른 버전인지 확인:
1. `ai-work-protocol.md` (root: 104 lines, workflows: 103 lines)
   - 차이: work log 명명 규칙 (root가 더 상세)
2. `caret-development.md` (root: 129 lines, workflows: 105 lines)
   - 차이: i18n 가이드라인 (root가 더 상세)
3. `cline-modification.md` (root: 122 lines, workflows: 146 lines)
   - 차이: backup protocol, proto 필드 규칙 (workflows가 훨씬 더 상세) ⭐

#### 📘 workflows 버전 없음 (15개) - **분류 필요**
지식 문서인지 작업 워크플로우인지 판단:

**Phase 3-4 생성 (7개)**:
1. `caret-architecture-guide.md` (179 lines) - 아키텍처 지식
2. `component-architecture.md` (173 lines) - 컴포넌트 원칙
3. `documentation-guide.md` (107 lines) - 문서화 지식
4. `frontend-backend-patterns.md` (214 lines) - 패턴 지식
5. `message-processing.md` (255 lines) - 메시지 처리 지식
6. `system-prompt.md` (252 lines) - 시스템 프롬프트 지식
7. `webview-communication.md` (273 lines) - 통신 지식

**기존 파일 (8개)**:
1. `b2b-branding-workflow.md` (138 lines) - 브랜딩 워크플로우?
2. `build-system.md` (162 lines) - 빌드 지식
3. `caret-rules.md` (169 lines) - 전역 규칙
4. `logging-rules.md` (52 lines) - 로깅 규칙
5. `prompt-management.md` (25 lines) - 프롬프트 관리
6. `ai-work-index.yaml` (123 lines) - 작업 인덱스
7. `architecture-guide.yaml` (70 lines) - 아키텍처 퀵 가이드
8. `testing-guide.yaml` (67 lines) - 테스팅 퀵 가이드

### WORKFLOWS 파일 (11개)

#### root에도 있음 (9개)
위에서 이미 분석됨

#### root에 없음 (2개) - **확인 필요**
1. `branding-and-logging.md` (157 lines) - 루트에 요약 버전 필요?
2. `i18n-static-translation-fix.md` (130 lines) - 일회성 작업? 보관?

### ATOMS 파일 (12개)
모두 정상 (workflows/atoms/에만 존재):
1. `comment-protocol.md` (123 lines)
2. `hardcoding-prevention.md` (204 lines)
3. `i18n-dynamic-pattern.md` (119 lines)
4. `message-flow.md` (153 lines)
5. `modification-levels.md` (80 lines)
6. `modification-protocol.md` (42 lines)
7. `naming-conventions.md` (113 lines)
8. `semantic-equivalence-verification.md` (137 lines)
9. `storage-patterns.md` (136 lines)
10. `verification-steps.md` (102 lines)
11. `backup-protocol.yaml` (50 lines)
12. `tdd-cycle.yaml` (55 lines)

---

## 📋 작업 계획 (상세)

### Phase 1: 완전 동일 파일 처리 (6개)

**목표**: 루트를 요약으로 변경하고 workflows 참조 추가

**작업 파일 리스트**:

#### 1.1 ai-feature.md
- [ ] `.caretrules/ai-feature.md` 읽기 (245 lines)
- [ ] `.caretrules/workflows/ai-feature.md` 확인 (동일)
- [ ] 루트를 요약으로 축소 (목표: 50-80 lines)
  - 작업 개요 (AI 기능 개발이란?)
  - 핵심 체크리스트 (간단)
  - workflows 참조: `See .caretrules/workflows/ai-feature.md for details`
- [ ] caret-docs 대응 확인: `caret-docs/development/ai-feature.md`
- [ ] 검증: `diff` 명령으로 workflows와 다른지 확인

#### 1.2 critical-verification.md
- [ ] `.caretrules/critical-verification.md` 읽기 (93 lines)
- [ ] `.caretrules/workflows/critical-verification.md` 확인 (동일)
- [ ] 루트를 요약으로 축소 (목표: 30-50 lines)
- [ ] workflows 참조 추가
- [ ] caret-docs 대응 확인: `caret-docs/development/critical-verification.md`

#### 1.3 document-organization.md
- [ ] `.caretrules/document-organization.md` 읽기 (100 lines)
- [ ] `.caretrules/workflows/document-organization.md` 확인 (동일)
- [ ] 루트를 요약으로 축소
- [ ] workflows 참조 추가
- [ ] caret-docs 대응 확인: `caret-docs/development/document-organization.md`

#### 1.4 merge-strategy.md
- [ ] `.caretrules/merge-strategy.md` 읽기 (87 lines)
- [ ] `.caretrules/workflows/merge-strategy.md` 확인 (동일)
- [ ] 루트를 요약으로 축소
- [ ] workflows 참조 추가
- [ ] caret-docs 대응 확인: `caret-docs/merging/merging-strategy-guide.md`

#### 1.5 new-component.md
- [ ] `.caretrules/new-component.md` 읽기 (180 lines)
- [ ] `.caretrules/workflows/new-component.md` 확인 (동일)
- [ ] 루트를 요약으로 축소 (목표: 60-80 lines)
- [ ] workflows 참조 추가
- [ ] caret-docs 대응 확인: `caret-docs/development/new-component.md`

#### 1.6 testing-work.md
- [ ] `.caretrules/testing-work.md` 읽기 (253 lines)
- [ ] `.caretrules/workflows/testing-work.md` 확인 (동일)
- [ ] 루트를 요약으로 축소 (목표: 80-100 lines)
- [ ] workflows 참조 추가
- [ ] caret-docs 대응 확인: `caret-docs/development/testing-work.md`

**Phase 1 커밋**: 6개 파일 요약 완료

---

### Phase 2: 내용 다른 파일 통합 (3개)

**목표**: 올바른 버전 확정 및 루트/workflows 역할 구분

#### 2.1 ai-work-protocol.md (root: 104, workflows: 103)
- [ ] 두 버전 diff 상세 분석
- [ ] 차이점: work log 명명 규칙 (root가 더 상세)
- [ ] **판단**: workflows 버전을 상세하게 만들기
  - [ ] workflows에 root의 work log 규칙 추가
  - [ ] root는 간단 요약으로 변경
- [ ] workflows 참조 추가
- [ ] caret-docs 대응 확인: `caret-docs/development/ai-work-protocol.md`

#### 2.2 caret-development.md (root: 129, workflows: 105)
- [ ] 두 버전 diff 상세 분석
- [ ] 차이점: i18n 가이드라인 (root가 더 상세)
- [ ] **판단**: workflows 버전을 상세하게 만들기
  - [ ] workflows에 root의 i18n 섹션 추가
  - [ ] root는 개발 원칙 요약만
- [ ] workflows 참조 추가
- [ ] caret-docs 대응 확인: `caret-docs/development/caret-development.md`

#### 2.3 cline-modification.md (root: 122, workflows: 146) ⭐
- [ ] 두 버전 diff 상세 분석
- [ ] 차이점: workflows가 훨씬 더 상세 (backup protocol, proto 필드)
- [ ] **판단**: workflows 버전이 정답
  - [ ] workflows 내용을 정답으로 유지
  - [ ] root를 간단 요약으로 새로 작성
- [ ] workflows 참조 추가
- [ ] caret-docs 대응 확인: `caret-docs/development/cline-modification.md`
- [ ] **코드 검증**: 실제 proto 파일 필드 번호 규칙 확인
  - [ ] `proto/cline/models.proto` 읽기
  - [ ] Caret 필드가 1000+ 규칙 따르는지 확인

**Phase 2 커밋**: 내용 다른 3개 파일 통합 완료

---

### Phase 3: workflows 전용 파일 처리 (2개)

**목표**: root 요약 버전 필요 여부 판단

#### 3.1 branding-and-logging.md (workflows only, 157 lines)
- [ ] `.caretrules/workflows/branding-and-logging.md` 읽기
- [ ] 내용 분석: 브랜딩 + 로깅 통합 작업?
- [ ] **판단**:
  - 특정 작업인가? → workflows만 유지
  - 자주 참조하는 지식인가? → root 요약 추가
- [ ] 결정에 따라 root 파일 생성 또는 패스
- [ ] caret-docs 대응 확인

#### 3.2 i18n-static-translation-fix.md (workflows only, 130 lines)
- [ ] `.caretrules/workflows/i18n-static-translation-fix.md` 읽기
- [ ] 내용 분석: 정적 번역 수정 작업
- [ ] **판단**: 일회성 작업? 보관? 삭제?
- [ ] caret-docs 대응 확인

**Phase 3 커밋**: workflows 전용 파일 정리 완료

---

### Phase 4: Phase 3-4 생성 파일 검증 (7개)

**목표**: 지식 문서 vs 작업 워크플로우 구분, 코드 일치성 검증

#### 4.1 caret-architecture-guide.md (179 lines)
- [ ] 읽기 및 내용 분석
- [ ] **분류**: 지식 (아키텍처 설명) vs 작업 (아키텍처 작업 절차)?
- [ ] **판단**: 지식 → root만 유지
- [ ] **코드 검증**:
  - [ ] `CaretProviderWrapper` 코드 예제 vs 실제 `caret-src/core/webview/CaretProviderWrapper.ts`
  - [ ] 하이브리드 패턴 설명 vs 실제 구현
  - [ ] 파일 경로 정확성
- [ ] caret-docs 대응 확인: `caret-docs/development/caret-architecture-and-implementation-guide.md`
- [ ] 1:1 동기화 검증

#### 4.2 component-architecture.md (173 lines)
- [ ] 읽기 및 내용 분석
- [ ] **분류**: 컴포넌트 원칙 (지식)
- [ ] **판단**: root만 유지
- [ ] **코드 검증**:
  - [ ] React 컴포넌트 예제 vs 실제 `webview-ui/src/caret/components/` 코드
  - [ ] VSCode 테마 변수 사용법 정확성
  - [ ] 파일 구조 설명 vs 실제 구조
- [ ] caret-docs 대응: `caret-docs/development/component-architecture-principles.md`
- [ ] 1:1 동기화 검증

#### 4.3 documentation-guide.md (107 lines)
- [ ] 읽기 및 내용 분석
- [ ] **분류**: 문서화 지식
- [ ] **판단**: root만 유지
- [ ] **구조 설명 보강 필요**: ⚠️
  - [ ] 루트 vs workflows vs atoms 역할 명확히 추가
  - [ ] 언제 루트에, 언제 workflows에 두는지 기준 명시
  - [ ] 예시 추가
- [ ] caret-docs 대응: `caret-docs/development/documentation-guide.md`
- [ ] 1:1 동기화 검증

#### 4.4 frontend-backend-patterns.md (214 lines)
- [ ] 읽기 및 내용 분석
- [ ] **분류**: 패턴 지식
- [ ] **판단**: root만 유지
- [ ] **코드 검증**: (Phase 5에서 이미 수정했지만 재확인)
  - [ ] `updateSettings.ts` 실제 구현 확인
  - [ ] 순환 메시지 방지 패턴 vs 실제 코드
  - [ ] 경고 메시지가 정확한지
- [ ] caret-docs 대응: `caret-docs/development/frontend-backend-interaction-patterns.md`
- [ ] 1:1 동기화 검증

#### 4.5 message-processing.md (255 lines)
- [ ] 읽기 및 내용 분석
- [ ] **분류**: 메시지 처리 아키텍처 (지식)
- [ ] **판단**: root만 유지
- [ ] **코드 검증**:
  - [ ] gRPC 클라이언트 예제 vs 실제 `webview-ui/src/services/grpc-client.ts`
  - [ ] Controller 핸들러 예제 vs 실제 `src/core/controller/` 구조
  - [ ] proto 파일 참조 정확성
- [ ] caret-docs 대응: `caret-docs/development/message-processing-architecture.md`
- [ ] 1:1 동기화 검증

#### 4.6 system-prompt.md (252 lines)
- [ ] 읽기 및 내용 분석
- [ ] **분류**: 시스템 프롬프트 구조 (지식)
- [ ] **판단**: root만 유지
- [ ] **코드 검증**:
  - [ ] JSON 섹션 목록 vs 실제 `caret-src/core/prompts/sections/*.json`
  - [ ] 15개 파일 모두 존재하는지
  - [ ] Chatbot/Agent 모드 설명 vs 실제 구현
- [ ] caret-docs 대응: `caret-docs/development/system-prompt-implementation.md`
- [ ] 1:1 동기화 검증

#### 4.7 webview-communication.md (273 lines)
- [ ] 읽기 및 내용 분석
- [ ] **분류**: 통신 가이드 (지식)
- [ ] **판단**: root만 유지
- [ ] **코드 검증**:
  - [ ] gRPC 통신 예제 vs 실제 구현
  - [ ] proto 파일 경로 정확성
  - [ ] 구독 패턴 예제 vs 실제 코드
- [ ] caret-docs 대응: `caret-docs/development/webview-extension-communication.md`
- [ ] 1:1 동기화 검증

**Phase 4 커밋**: Phase 3-4 생성 파일 검증 및 수정 완료

---

### Phase 5: 기존 root 전용 파일 검증 (8개)

#### 5.1 b2b-branding-workflow.md (138 lines)
- [ ] 읽기 및 분석
- [ ] 지식 vs 작업 구분
- [ ] workflows 버전 필요 여부 판단
- [ ] caret-docs 대응: `caret-docs/development/b2b-branding-workflow.md`

#### 5.2 build-system.md (162 lines)
- [ ] 읽기 및 분석
- [ ] **코드 검증**: 빌드 명령어 정확성
  - [ ] `npm run` 스크립트 vs 실제 `package.json`
  - [ ] 파일 경로 정확성
- [ ] caret-docs 대응: `caret-docs/development/build-system.md`

#### 5.3 caret-rules.md (169 lines)
- [ ] 읽기 및 분석
- [ ] 전역 규칙 → root 유지 올바름
- [ ] caret-docs 대응: `caret-docs/development/caret-rules.ko.md` (한글)

#### 5.4 logging-rules.md (52 lines)
- [ ] 읽기 및 분석
- [ ] caret-docs 대응: `caret-docs/development/logging-rules.md`

#### 5.5 prompt-management.md (25 lines)
- [ ] 읽기 및 분석
- [ ] caret-docs 대응: `caret-docs/development/prompt-management.md`

#### 5.6 ai-work-index.yaml (123 lines)
- [ ] 읽기 및 분석
- [ ] 작업 인덱스 → root 유지 올바름
- [ ] 모든 참조 경로 정확성 확인

#### 5.7 architecture-guide.yaml (70 lines)
- [ ] 읽기 및 분석
- [ ] 퀵 가이드 → root 유지 올바름

#### 5.8 testing-guide.yaml (67 lines)
- [ ] 읽기 및 분석
- [ ] 퀵 가이드 → root 유지 올바름
- [ ] caret-docs 대응: `caret-docs/development/testing-guide.md`

**Phase 5 커밋**: 기존 파일 검증 완료

---

### Phase 6: atoms 참조 검증 (12개)

**목표**: 모든 atoms가 제대로 참조되고 있는지 확인

- [ ] `comment-protocol.md` - 참조하는 파일: cline-modification
- [ ] `hardcoding-prevention.md` - 참조 확인
- [ ] `i18n-dynamic-pattern.md` - 참조 확인
- [ ] `message-flow.md` - 참조 확인
- [ ] `modification-levels.md` - 참조 확인
- [ ] `modification-protocol.md` - 참조 확인
- [ ] `naming-conventions.md` - 참조하는 파일: new-component
- [ ] `semantic-equivalence-verification.md` - 참조 확인
- [ ] `storage-patterns.md` - 참조하는 파일: new-component
- [ ] `verification-steps.md` - 참조하는 파일: 여러 곳
- [ ] `backup-protocol.yaml` - 참조하는 파일: cline-modification
- [ ] `tdd-cycle.yaml` - 참조하는 파일: new-component, testing-work

**Phase 6 커밋**: atoms 참조 검증 완료

---

### Phase 7: documentation-guide.md 업데이트

- [ ] 루트 vs workflows vs atoms 구조 명확히 설명
- [ ] 역할 구분 기준:
  - 루트: 자주 보는 지식, 작업 카탈로그
  - workflows: 상세 작업 절차
  - atoms: 재사용 단위
- [ ] 언제 어디에 두는지 판단 기준 명시
- [ ] 예시 3-5개 추가
- [ ] workflows 참조 방법 설명

**Phase 7 커밋**: documentation-guide.md 업데이트 완료

---

### Phase 8: 최종 검증

- [ ] 모든 루트 파일이 workflows 참조 있는지
- [ ] 모든 caret-docs 대응이 1:1인지
- [ ] 실제 코드와 일치하는지
- [ ] 순환 참조 없는지
- [ ] `git status` 깨끗한지

**Phase 8 커밋**: 전체 구조 정리 완료

---

## 🚨 발견된 문제

1. **Phase 3-4 작업 재검증 필요**
   - 7개 AI 규칙이 루트에만 있음
   - workflows 버전 필요 여부 불명확
   - 실제 코드와 일치성 미검증

2. **중복 파일 혼란**
   - 6개 완전 동일 파일 (루트 = workflows)
   - 3개 내용 다른 파일 (어느 쪽이 정답?)

3. **구조 문서화 부족**
   - documentation-guide.md에 루트 역할 설명 없음
   - 언제 루트에, 언제 workflows에 둬야 하는지 불명확

---

## ⏭️ 다음 단계

1. **사용자 확인 필요**:
   - Phase 3-4 생성 7개 파일은 "지식"인가 "작업"인가?
   - workflows/에만 있는 2개 파일 처리 방법?
   - 내용 다른 3개 중 어느 버전이 정확한가?

2. **작업 실행**:
   - 사용자 피드백 받은 후 단계별 진행
   - 각 단계마다 검증 및 커밋
   - 최종 구조 문서화

---

## 📝 작업 로그

### 2025-10-27 21:50 - 초기 분석 완료
- 전체 파일 인벤토리 작성
- 중복 파일 9개 발견
- 구조 원칙 사용자로부터 명확히 확인
- 작업 마스터 파일 생성
