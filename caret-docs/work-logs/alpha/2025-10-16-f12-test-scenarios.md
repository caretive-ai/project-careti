# F12 Claude Code Subagent Support - 테스트 시나리오

## 📋 테스트 환경 설정

### 전제 조건
1. **Claude Code CLI 설치 확인**
   ```bash
   npx @anthropic-ai/cline-code --version
   ```
   - 설치 안되어 있으면: Claude Code가 자동으로 설치 시도
   - 경로: `~/.claude/cline-code/`

2. **API Key 또는 구독 확인**
   - Anthropic API Key 등록 또는
   - Claude Code 구독 활성화

3. **확장 프로그램 빌드**
   ```bash
   npm run compile
   # 그리고 F5로 Extension Development Host 실행
   ```

---

## 🧪 테스트 시나리오

### 시나리오 1: 기본 동작 확인 (Baseline Test)

**목적**: Claude Code 프로바이더가 정상적으로 동작하는지 확인XE

**단계**:
1. **모델 선택**
   - Settings에서 API Provider: `Claude Code`
   - Model: `claude-sonnet-4-20250514` (또는 사용 가능한 모델)

2. **간단한 대화 테스트**
   - 입력: "안녕! 간단한 Python 함수 하나 만들어줘 - 두 숫자를 더하는 함수"
   - **확인 사항**:
     - ✅ 텍스트 응답이 정상적으로 출력되는가?
     - ✅ Thinking 블록이 보이는가? (Claude Code는 기본적으로 thinking 지원)
     - ✅ 오류 없이 대화가 진행되는가?

3. **파일 작성 테스트**
   - 입력: "방금 만든 함수를 add.py 파일로 저장해줘"
   - **확인 사항**:
     - ✅ 파일이 정상적으로 생성되는가?
     - ✅ Bash tool이 정상적으로 동작하는가?

**예상 결과**: ✅ 모든 기본 기능이 정상 동작

---

### 시나리오 2: Subagent 기능 테스트 (핵심)

**목적**: Task tool이 활성화되어 subagent를 생성할 수 있는지 확인

**단계**:
1. **Subagent 생성 요청**
   - 입력: "두 개의 독립적인 작업을 병렬로 처리해줘. 첫 번째 작업은 hello.txt 파일을 만들고, 두 번째 작업은 world.txt 파일을 만드는 거야. 각각 subagent로 처리해줘."
   
2. **또는 명시적 Task tool 사용 요청**
   - 입력: "Use the Task tool to create a separate subtask that will create a test.txt file with 'Hello from subtask' content."

**확인 사항**:
- ✅ **Task tool이 호출되는가?**
  - 콘솔에 tool_use 관련 로그 확인
  - UI에서 tool 사용 표시 확인
  
- ✅ **Tool use 스트림이 정상 처리되는가?**
  - 에러 없이 tool_use 블록이 처리됨
  - 이전처럼 `console.error`가 출력되지 않음
  
- ✅ **Subagent가 실제로 실행되는가?**
  - Subagent의 실행 결과가 응답에 포함됨
  - 병렬 처리가 동작함

**예상 결과**: 
- ✅ Task tool 정상 동작
- ✅ Subagent 생성 및 실행 성공
- ❌ 만약 "tool_use is not supported yet" 에러가 나면 수정 실패

---

### 시나리오 3: 복잡한 Subagent 시나리오

**목적**: 실제 사용 사례에서 subagent가 유용하게 동작하는지 확인

**단계**:
1. **복잡한 작업 요청**
   ```
   다음 세 가지 작업을 각각 독립적인 subagent로 나눠서 처리해줘:
   
   1. data_processor.py 파일을 만들어줘 - CSV 파일을 읽고 분석하는 클래스
   2. api_client.py 파일을 만들어줘 - REST API를 호출하는 클래스  
   3. main.py 파일을 만들어줘 - 위 두 개를 사용하는 메인 로직
   
   각 작업이 독립적으로 병렬 처리되도록 해줘.
   ```

**확인 사항**:
- ✅ 3개의 Task tool이 각각 호출되는가?
- ✅ 각 subagent가 독립적으로 실행되는가?
- ✅ 모든 파일이 정상적으로 생성되는가?
- ✅ 병렬 처리로 인한 성능 향상이 체감되는가?

**예상 결과**: ✅ 복잡한 작업이 효율적으로 분산 처리됨

---

### 시나리오 4: 다른 도구와의 호환성 테스트

**목적**: Task tool 활성화가 다른 도구에 영향을 주지 않는지 확인

**단계**:
1. **Bash tool 테스트**
   - 입력: "현재 디렉토리의 파일 목록을 보여줘"
   - **확인**: ✅ Bash tool 정상 동작

2. **Glob tool 테스트**
   - 입력: "현재 디렉토리에서 모든 .ts 파일을 찾아줘"
   - **확인**: ✅ Glob tool 정상 동작

3. **혼합 사용 테스트**
   - 입력: "먼저 Glob으로 .py 파일을 찾고, 그 결과를 바탕으로 subagent를 만들어서 각 파일을 분석해줘"
   - **확인**: ✅ 여러 도구가 함께 정상 동작

**예상 결과**: ✅ 모든 도구가 정상 동작하며 서로 간섭 없음

---

### 시나리오 5: 다른 프로바이더 호환성 확인

**목적**: Claude Code 수정이 다른 프로바이더에 영향을 주지 않는지 확인

**단계**:
1. **Anthropic 프로바이더로 전환**
   - Settings에서 API Provider: `Anthropic`
   - **확인**: ✅ 정상 동작

2. **OpenRouter 프로바이더로 전환**
   - Settings에서 API Provider: `OpenRouter`
   - **확인**: ✅ 정상 동작

**예상 결과**: ✅ 다른 프로바이더들이 영향받지 않고 정상 동작

---

## 🐛 디버깅 팁

### 로그 확인 방법

1. **Extension Host 콘솔**
   - View → Output → "Caret" 선택
   - Tool use 관련 로그 확인

2. **개발자 도구**
   - Help → Toggle Developer Tools
   - Console 탭에서 에러 확인

3. **확인할 로그 패턴**:
   ```
   ❌ 실패 (수정 전): "tool_use is not supported yet. Received: ..."
   ✅ 성공 (수정 후): tool_use 블록이 정상 처리됨 (에러 없음)
   ```

### 문제 발생 시 체크리스트

- [ ] `npm run compile`이 에러 없이 완료되었는가?
- [ ] Extension Development Host를 리로드했는가? (Cmd+R / Ctrl+R)
- [ ] Claude Code CLI가 정상 설치되었는가?
- [ ] API Key 또는 구독이 활성화되어 있는가?
- [ ] 모델이 Task tool을 지원하는 모델인가?

---

## 📊 테스트 결과 기록

### 체크리스트

- [ ] **시나리오 1**: 기본 동작 확인
  - [ ] 텍스트 응답
  - [ ] Thinking 블록
  - [ ] 파일 작성

- [ ] **시나리오 2**: Subagent 기능 (핵심)
  - [ ] Task tool 호출
  - [ ] Tool use 스트림 처리
  - [ ] Subagent 실행

- [ ] **시나리오 3**: 복잡한 시나리오
  - [ ] 여러 subagent 병렬 처리
  - [ ] 모든 파일 생성 완료

- [ ] **시나리오 4**: 다른 도구 호환성
  - [ ] Bash tool
  - [ ] Glob tool
  - [ ] 혼합 사용

- [ ] **시나리오 5**: 다른 프로바이더 호환성
  - [ ] Anthropic
  - [ ] OpenRouter

### 발견된 문제

```
여기에 테스트 중 발견된 문제를 기록하세요.
```

---

## 🎯 성공 기준

### 필수 (Must Have)
- ✅ Task tool이 정상적으로 호출됨
- ✅ tool_use 스트림이 에러 없이 처리됨
- ✅ Subagent가 생성되고 실행됨
- ✅ 기존 기능에 영향 없음

### 선택 (Nice to Have)
- ✅ 복잡한 병렬 처리가 효율적으로 동작
- ✅ 다른 도구와의 조합이 원활함
- ✅ 성능 향상이 체감됨

---

**작성일**: 2025-10-16  
**작성자**: Alpha  
**관련 문서**: f12-claude-code-subagent-support.md
