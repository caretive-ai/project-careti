# Terminal Tool 테스트 시나리오 (한글 명령 기반)

**작성일**: 2025-11-04
**목적**: Caret 대화창에서 한글 명령으로 Terminal Tool을 통해 Claude Code를 제어하는 시나리오
**대상**: Luke (개발자) - 수동 테스트용

---

## 📋 테스트 환경 준비

### 필수 조건
```bash
# 1. Claude CLI 설치 확인
claude --version

# 2. 인증 확인
claude auth status

# 3. Extension 빌드
npm run compile

# 4. 테스트 워크스페이스 준비
mkdir -p /tmp/terminal-tool-test
cd /tmp/terminal-tool-test
```

### Extension 실행
```bash
# F5로 Extension Development Host 실행
# 또는
code --extensionDevelopmentPath=/path/to/caret
```

---

## 🧪 Level 1: 기본 기능 테스트

### 테스트 1.1: Claude Code 터미널 열기

**사용자 명령**:
```
Claude Code 터미널 열어줘
```

**기대 동작**:
```
Caret: [TerminalTool.use 호출]
       action: 'open'
       command: 'claude'
       args: ['code']

Caret: "Claude Code 터미널을 시작합니다..."
       [5-10초 대기]
       "Claude Code가 준비되었습니다. (세션 ID: 01JCABCD...)"
```

**검증 포인트**:
- [ ] `TerminalTool.use` 호출 확인
- [ ] 세션 ID 생성 확인
- [ ] Claude Code 프롬프트 출력 확인 ("> ")
- [ ] 세션이 활성 상태로 유지됨

**실패 시 확인**:
- Claude CLI가 설치되어 있는가?
- PATH에 `claude` 명령이 있는가?
- 인증이 완료되어 있는가?

---

### 테스트 1.2: 명령 전송 (README 생성)

**사용자 명령**:
```
README 파일 만들어줘
```

**기대 동작**:
```
Caret: [TerminalTool.use 호출]
       action: 'send'
       sessionId: '01JCABCD...'
       input: 'Create a README.md file with a basic project description'

Caret: "Claude Code에 명령을 전달했습니다..."
       [응답 대기]
       "README.md 파일을 생성했습니다.

       Claude Code 출력:
       > Create a README.md file
       I'll create a README.md file for you.
       [Tool: Write]
       Writing to README.md...
       Done.
       > "
```

**검증 포인트**:
- [ ] 한글 명령이 영어로 변환됨
- [ ] 터미널에 입력 전송 확인
- [ ] Claude Code 응답 수신
- [ ] README.md 파일이 실제로 생성됨
- [ ] 프롬프트 복귀 확인 ("> ")

**파일 확인**:
```bash
ls -la /tmp/terminal-tool-test/
# README.md가 존재해야 함

cat /tmp/terminal-tool-test/README.md
# 내용이 있어야 함
```

---

### 테스트 1.3: 상태 확인

**사용자 명령**:
```
Claude Code가 지금 뭐하고 있어?
```

**기대 동작**:
```
Caret: [TerminalTool.use 호출]
       action: 'read'
       sessionId: '01JCABCD...'

Caret: "Claude Code 현재 상태:

       - 마지막 작업: README.md 생성
       - 상태: 대기 중 (프롬프트 표시)
       - 출력: > _

       현재 입력 가능합니다."
```

**검증 포인트**:
- [ ] 터미널 출력 읽기 성공
- [ ] 상태 해석 정확함
- [ ] 프롬프트 감지 확인

---

### 테스트 1.4: 연속 명령 (같은 세션)

**사용자 명령**:
```
이제 test.ts 파일도 만들어줘
```

**기대 동작**:
```
Caret: [같은 세션 ID 사용]
Caret: [TerminalTool.use 호출]
       action: 'send'
       sessionId: '01JCABCD...'  // 같은 ID!
       input: 'Create a test.ts file'

Caret: "test.ts 파일을 생성했습니다.

       (같은 Claude Code 세션에서 작업했습니다)"
```

**검증 포인트**:
- [ ] 새 세션이 아닌 기존 세션 재사용
- [ ] 컨텍스트 유지 (Claude Code가 이전 작업 기억)
- [ ] test.ts 파일 생성 확인

**파일 확인**:
```bash
ls -la /tmp/terminal-tool-test/
# README.md, test.ts 둘 다 존재
```

---

### 테스트 1.5: 터미널 닫기

**사용자 명령**:
```
Claude Code 터미널 닫아줘
```

**기대 동작**:
```
Caret: [TerminalTool.use 호출]
       action: 'close'
       sessionId: '01JCABCD...'

Caret: "Claude Code 터미널을 닫았습니다."
```

**검증 포인트**:
- [ ] 세션 종료 확인
- [ ] 프로세스 종료 확인
- [ ] 메모리에서 세션 제거 확인

---

## 🧪 Level 2: 조건부 제어 테스트

### 테스트 2.1: 파일 수정 카운트 후 중지

**사용자 명령**:
```
Claude Code 열어줘
```

**기대 동작**:
```
Caret: [새 세션 시작]
Caret: "Claude Code를 시작했습니다. (세션: 01JCNEW...)"
```

**사용자 명령**:
```
여러 파일 만들라고 하는데, 파일 3개 만들면 멈춰줘
```

**기대 동작**:
```
Caret: "알겠습니다. 파일 3개 생성 시 자동으로 중지하겠습니다."

Caret: [TerminalTool.use 호출]
       action: 'send'
       input: 'Create files: utils.ts, types.ts, config.ts, main.ts, index.ts'

Caret: [백그라운드 모니터링 시작]
Caret: [TerminalTool.use 반복 호출 - action: 'read']

Caret: [Write 도구 감지: 1/3] - "utils.ts 생성 중..."
Caret: [Write 도구 감지: 2/3] - "types.ts 생성 중..."
Caret: [Write 도구 감지: 3/3] - "config.ts 생성 완료!"

Caret: [조건 만족]
Caret: [TerminalTool.use 호출]
       action: 'stop'
       sessionId: '01JCNEW...'

Caret: "⚠️ 파일 3개 생성을 감지했습니다!
       Claude Code를 중지했습니다.

       생성된 파일:
       - utils.ts ✓
       - types.ts ✓
       - config.ts ✓

       (main.ts, index.ts는 생성되지 않음)"
```

**검증 포인트**:
- [ ] 출력 모니터링 작동
- [ ] `[Tool: Write]` 패턴 감지
- [ ] 카운트 정확함 (3개에서 중지)
- [ ] Ctrl+C 전송 확인
- [ ] 파일 3개만 생성됨 (나머지 없음)

**파일 확인**:
```bash
ls -la /tmp/terminal-tool-test/
# utils.ts, types.ts, config.ts만 존재
# main.ts, index.ts는 없어야 함
```

---

### 테스트 2.2: 에러 감지 후 알림

**사용자 명령**:
```
권한 없는 파일 만들라고 해봐. 에러 나면 알려줘
```

**기대 동작**:
```
Caret: [TerminalTool.use 호출]
       action: 'send'
       input: 'Create a file at /root/forbidden.txt'

Caret: [모니터링]
Caret: [에러 패턴 감지: "Permission denied"]

Caret: "⚠️ 에러 감지!

       Claude Code에서 에러가 발생했습니다:
       Permission denied: /root/forbidden.txt

       권한이 없는 경로입니다."
```

**검증 포인트**:
- [ ] 에러 패턴 감지 ("Error:", "Permission denied" 등)
- [ ] 사용자에게 즉시 알림
- [ ] 터미널 세션은 유지 (중지하지 않음)

---

### 테스트 2.3: 시간 초과 감지

**사용자 명령**:
```
복잡한 작업 시키는데, 30초 넘으면 알려줘
```

**기대 동작**:
```
Caret: [TerminalTool.use 호출]
       action: 'send'
       input: 'Analyze the entire codebase and refactor everything'

Caret: [타이머 시작: 30초]
Caret: [주기적으로 read하며 완료 확인]

Caret: [30초 경과]
Caret: "⏰ 30초가 경과했습니다.

       Claude Code가 아직 작업 중입니다:
       - 진행 중: 코드베이스 분석
       - 경과 시간: 30초

       계속 기다릴까요, 아니면 중지할까요?"
```

**검증 포인트**:
- [ ] 타이머 작동
- [ ] 30초 정확히 감지
- [ ] 사용자에게 선택권 제공

---

## 🧪 Level 3: 복잡한 시나리오

### 테스트 3.1: TDD 워크플로우 자동화

**사용자 명령**:
```
TDD로 개발하자. 테스트 작성 → 실패 확인 → 구현 → 통과 확인 순서로 진행해줘.
첫 테스트는 "사용자 인증 기능"으로 시작
```

**기대 동작**:
```
Caret: "TDD 워크플로우를 시작합니다.
       목표: 사용자 인증 기능 구현"

# 1단계: 테스트 작성
Caret: [TerminalTool.use - send]
       input: 'Write a failing test for user authentication in auth.test.ts'

Caret: "테스트를 작성했습니다: auth.test.ts"

# 2단계: 테스트 실행 (실패 확인)
Caret: [TerminalTool.use - send]
       input: 'Run the test: npm test auth.test.ts'

Caret: [출력에서 "FAIL" 또는 "test failed" 감지]
Caret: "✗ 테스트 실패 확인 (예상된 동작)"

# 3단계: 구현
Caret: [TerminalTool.use - send]
       input: 'Implement the authentication feature to make the test pass'

Caret: "인증 기능을 구현했습니다: auth.ts"

# 4단계: 테스트 재실행 (통과 확인)
Caret: [TerminalTool.use - send]
       input: 'Run the test again'

Caret: [출력에서 "PASS" 또는 "test passed" 감지]
Caret: "✓ 테스트 통과!

       TDD 사이클 완료:
       1. Red (실패 테스트 작성) ✓
       2. Green (구현으로 통과) ✓
       3. Refactor (준비됨)

       리팩토링을 진행할까요?"
```

**검증 포인트**:
- [ ] 순차적 명령 실행
- [ ] 테스트 결과 파싱 (FAIL/PASS)
- [ ] 조건부 로직 (실패 → 구현 → 통과)
- [ ] 각 단계마다 명확한 피드백

**파일 확인**:
```bash
ls -la /tmp/terminal-tool-test/
# auth.test.ts, auth.ts 존재

npm test auth.test.ts
# 테스트 통과 확인
```

---

### 테스트 3.2: 다중 조건 모니터링

**사용자 명령**:
```
Claude Code가 파일 5개 수정하거나, Bash 명령 실행하면 멈춰줘
```

**기대 동작**:
```
Caret: "다중 조건 모니터링을 시작합니다:
       조건 1: 파일 5개 수정
       조건 2: Bash 도구 실행

       둘 중 하나라도 만족하면 자동 중지합니다."

Caret: [TerminalTool.use - send]
       input: 'Create multiple files and run ls command'

Caret: [모니터링 루프]
Caret: [Write 카운트: 1, 2, 3...]
Caret: [또는 "[Tool: Bash]" 감지]

# 시나리오 A: Bash 먼저 실행
Caret: [Bash 도구 감지!]
Caret: [TerminalTool.use - stop]

Caret: "⚠️ Bash 명령 실행을 감지했습니다!
       조건 만족으로 Claude Code를 중지했습니다.

       감지된 이벤트:
       - Bash 도구: ls 명령 실행

       파일 수정: 3개 (조건 미달)"

# 시나리오 B: 파일 5개 먼저
Caret: [Write 카운트 = 5]
Caret: [TerminalTool.use - stop]

Caret: "⚠️ 파일 5개 수정을 감지했습니다!
       조건 만족으로 Claude Code를 중지했습니다.

       수정된 파일:
       - a.ts, b.ts, c.ts, d.ts, e.ts (5개)"
```

**검증 포인트**:
- [ ] 다중 조건 추적
- [ ] OR 로직 작동 (하나만 만족해도 중지)
- [ ] 정확한 조건 보고

---

### 테스트 3.3: 대화형 피드백 루프

**사용자 명령**:
```
API 엔드포인트 만들어줘. 근데 에러 나면 수정해달라고 하고,
3번 실패하면 나한테 알려줘
```

**기대 동작**:
```
Caret: "자동 수정 모드를 시작합니다.
       최대 재시도: 3번"

# 시도 1
Caret: [TerminalTool.use - send]
       input: 'Create a REST API endpoint for user registration'

Caret: [모니터링]
Caret: [에러 감지: "TypeError: ..."]

Caret: "✗ 에러 발생 (시도 1/3)
       자동으로 수정을 요청합니다..."

Caret: [TerminalTool.use - send]
       input: 'Fix the TypeError in the code you just wrote'

# 시도 2
Caret: [모니터링]
Caret: [에러 감지: "SyntaxError: ..."]

Caret: "✗ 에러 발생 (시도 2/3)
       다시 수정을 요청합니다..."

Caret: [TerminalTool.use - send]
       input: 'Fix the SyntaxError'

# 시도 3
Caret: [모니터링]
Caret: [에러 감지: "ReferenceError: ..."]

Caret: "✗ 에러 발생 (시도 3/3)
       최대 재시도 횟수에 도달했습니다.

       ⚠️ 자동 수정 실패 알림

       발생한 에러들:
       1. TypeError: ...
       2. SyntaxError: ...
       3. ReferenceError: ...

       수동 개입이 필요합니다.
       어떻게 진행할까요?"
```

**검증 포인트**:
- [ ] 재시도 카운터 작동
- [ ] 각 시도마다 피드백
- [ ] 3번 실패 후 사용자 개입 요청
- [ ] 에러 히스토리 추적

---

## 🧪 Level 4: 엣지 케이스

### 테스트 4.1: 세션 ID 분실 복구

**시나리오**: Caret이 세션 ID를 잃어버린 경우

**사용자 명령**:
```
(이미 Claude Code 세션 열린 상태)
파일 만들어줘
```

**Caret 내부 상태**: sessionId = undefined (분실)

**기대 동작**:
```
Caret: [sessionId가 없음을 감지]

# 옵션 1: 세션 목록 조회
Caret: [TerminalTool.use - list]
Caret: [활성 세션 발견: 01JCOLD...]

Caret: "기존 Claude Code 세션을 발견했습니다.
       계속 사용할까요, 아니면 새로 시작할까요?"

# 옵션 2: 새 세션 시작
Caret: [TerminalTool.use - open]
Caret: "새로운 Claude Code 세션을 시작했습니다."
```

**검증 포인트**:
- [ ] list 액션으로 기존 세션 발견
- [ ] 사용자에게 선택권 제공
- [ ] 복구 또는 새 시작 모두 가능

---

### 테스트 4.2: Claude Code 응답 없음

**시나리오**: Claude Code가 응답하지 않음

**사용자 명령**:
```
복잡한 리팩토링 해줘
```

**기대 동작**:
```
Caret: [TerminalTool.use - send]
       input: 'Refactor the entire codebase...'

Caret: [모니터링 시작]
Caret: [10초 경과]
Caret: "Claude Code 작업 중... (10초 경과)"

Caret: [30초 경과]
Caret: "아직 응답이 없습니다... (30초 경과)
       작업이 복잡한 것 같습니다."

Caret: [60초 경과]
Caret: "⚠️ 60초 동안 응답이 없습니다.

       옵션:
       1. 계속 기다리기
       2. 중지하고 다시 시도
       3. 세션 닫기

       어떻게 할까요?"
```

**검증 포인트**:
- [ ] 타임아웃 없이 무한 대기하지 않음
- [ ] 주기적 상태 업데이트
- [ ] 사용자에게 선택권 제공

---

### 테스트 4.3: 동시 요청 처리

**시나리오**: Claude Code 작업 중 새 요청

**사용자 명령**:
```
(Claude Code가 파일 10개 만드는 중)
멈춰!
```

**기대 동작**:
```
Caret: [현재 작업 중 감지]
Caret: "Claude Code가 현재 작업 중입니다.
       중지하시겠습니까?"

사용자: "응"

Caret: [TerminalTool.use - stop]
Caret: "Claude Code를 중지했습니다.

       진행 상황:
       - 완료: 파일 6개
       - 미완료: 파일 4개"
```

**검증 포인트**:
- [ ] 작업 중 상태 감지
- [ ] 우선순위 처리 (중지 우선)
- [ ] 진행 상황 보고

---

## 📊 테스트 결과 기록

### 테스트 실행 로그 템플릿

```markdown
## 테스트 실행: [날짜]

### 환경
- OS: Linux Fedora
- VS Code: 1.x.x
- Claude CLI: x.x.x
- Extension: caret-x.x.x

### Level 1: 기본 기능
- [✅] 1.1: 터미널 열기
- [✅] 1.2: 명령 전송
- [✅] 1.3: 상태 확인
- [✅] 1.4: 연속 명령
- [✅] 1.5: 터미널 닫기

### Level 2: 조건부 제어
- [✅] 2.1: 파일 카운트 후 중지
- [❌] 2.2: 에러 감지 - 실패 (패턴 감지 안됨)
- [✅] 2.3: 시간 초과 감지

### Level 3: 복잡한 시나리오
- [⏸️] 3.1: TDD 워크플로우 - 미실행
- [⏸️] 3.2: 다중 조건 - 미실행
- [⏸️] 3.3: 피드백 루프 - 미실행

### Level 4: 엣지 케이스
- [⏸️] 4.1: 세션 복구 - 미실행
- [⏸️] 4.2: 응답 없음 - 미실행
- [⏸️] 4.3: 동시 요청 - 미실행

### 발견된 이슈
1. **에러 패턴 감지 실패** (2.2)
   - 원인: 정규식이 "Error:"만 감지, "Permission denied" 감지 안됨
   - 수정 필요: 패턴 추가

2. **한글-영어 변환 품질**
   - 일부 명령어 변환이 부자연스러움
   - 예: "여러 파일 만들어줘" → 구체적인 파일명이 필요함

### 다음 액션
- [ ] 에러 패턴 정규식 개선
- [ ] Level 3 테스트 실행
- [ ] 한글 명령 변환 가이드 보완
```

---

## 🎯 테스트 성공 기준

### Phase별 성공 기준

#### Phase 1-2 완료 (MVP)
- [ ] Level 1 모든 테스트 통과 (기본 기능)
- [ ] Python REPL 제어 가능
- [ ] Claude Code 세션 열기/닫기 작동

#### Phase 3 완료 (Claude Code 통합)
- [ ] Level 1 + Level 2 통과
- [ ] 조건부 제어 작동 (파일 카운트, 에러 감지)
- [ ] 실시간 모니터링 작동

#### Phase 4 완료 (완전판)
- [ ] Level 1 + 2 + 3 통과
- [ ] 복잡한 자동화 시나리오 작동 (TDD, 피드백 루프)
- [ ] 엣지 케이스 처리

---

## 📝 테스트 실행 가이드

### 빠른 테스트 (개발 중)
```bash
# 1. Extension 실행
F5

# 2. Caret 대화창 열기
Cmd+Shift+P → "Caret: Start Chat"

# 3. Level 1 테스트 실행
# 각 명령을 순서대로 입력
```

### 전체 테스트 (릴리스 전)
```bash
# 1. 환경 준비
./scripts/prepare-test-env.sh

# 2. Extension 빌드
npm run compile

# 3. Level 1-4 순서대로 실행
# 결과를 테스트 로그에 기록

# 4. 이슈 수집 및 문서화
```

---

**작성자**: Luke
**테스트 대상**: Terminal Tool (Claude Code 제어)
**다음 작업**: Phase 1 구현 후 Level 1 테스트 실행
