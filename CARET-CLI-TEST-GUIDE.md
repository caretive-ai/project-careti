# Caret CLI & Subagent Integration Test Guide

Cline v3.34.0의 Subagent 기능이 Caret에 성공적으로 통합되었습니다. 이제 `caret` CLI 명령어를 테스트할 수 있습니다.

## 🎯 통합 완료 사항

### ✅ 1. CLI 빌드 완료
- **위치**: `dist-standalone/`
- **실행 파일**: `~/.local/bin/caret` (전역 설치됨)
- **테스트**: `caret --help` 명령어 정상 작동

### ✅ 2. Subagent 감지 로직 통합
- **파일**: `src/core/task/index.ts:1041-1042`
- **추가 코드**:
  ```typescript
  const isSubagent = isSubagentCommand(command)
  Logger.debug(`🧪 [Subagent Test] command: "${command}", isSubagent: ${isSubagent}`)
  ```

### ✅ 3. Extension 빌드 완료
- 테스트 로그가 포함된 Extension 빌드 완료
- `dist/extension.js` 생성됨

---

## 🚀 테스트 방법

### Step 1: VSCode 리로드

1. **VSCode 열기**: Caret Extension 개발 창
2. **Command Palette**: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. **실행**: `Developer: Reload Window`

또는:
- F5 키를 눌러 새로운 Extension Development Host 창 열기

### Step 2: Output 패널 열기

1. **View → Output** 메뉴 선택
2. 드롭다운에서 **"Caret"** 선택
3. 또는 **"Log (Extension Host)"** 선택 (더 상세한 로그)

### Step 3: Subagent 명령어 테스트

Caret 채팅 UI에서 다음과 같이 요청:

#### 테스트 1: 일반 명령어 (Subagent 아님)
```
"Run the command: ls -la" 라고 입력
```

**예상 로그**:
```
🧪 [Subagent Test] command: "ls -la", isSubagent: false
```

#### 테스트 2: Caret CLI 명령어 (Subagent)
```
"Run the command: caret 'list all files'" 라고 입력
```

**예상 로그**:
```
🧪 [Subagent Test] command: "caret 'list all files'", isSubagent: true
```

#### 테스트 3: 다양한 형식
```
✅ caret "do something"        → isSubagent: true
✅ caret 'task description'    → isSubagent: true
❌ caret without quotes        → isSubagent: false
❌ ls -la                      → isSubagent: false
```

---

## 🔍 로그 확인 위치

### 1. VSCode Output 패널
- **채널**: "Caret" 또는 "Log (Extension Host)"
- **로그 레벨**: Debug 이상 (기본 활성화됨)

### 2. 터미널 실행 로그
Caret이 명령어를 실행하면 터미널 패널에서도 확인 가능

### 3. 예상 출력 예시
```
[2025-10-28T09:00:00.000Z] DEBUG 🧪 [Subagent Test] command: "caret 'test'", isSubagent: true
[2025-10-28T09:00:00.001Z] INFO  Executing command in terminal: caret 'test'
```

---

## ✅ 성공 기준

### 1. CLI 설치 확인
```bash
$ caret --help
Usage: node cline-core.js [options]
...
```

### 2. Subagent 감지 확인
- `caret "task"` → `isSubagent: true` 로그 출력
- `ls` → `isSubagent: false` 로그 출력

### 3. TerminalManager 분기 확인
- `isSubagent: true` → `StandaloneTerminalManager` 사용
- `isSubagent: false` → 기존 Caret `TerminalManager` 사용

---

## 🐛 문제 해결

### 문제 1: `caret` 명령어를 찾을 수 없음
```bash
# PATH 확인
echo $PATH | grep -o ~/.local/bin

# 없다면 추가
export PATH="$HOME/.local/bin:$PATH"

# 또는 ~/.bashrc나 ~/.zshrc에 추가
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

### 문제 2: 로그가 보이지 않음
1. **VSCode 설정 확인**:
   - `"caret.logLevel": "debug"` 설정 확인
2. **Output 채널 확인**:
   - "Caret" 채널 선택
   - "Log (Extension Host)" 채널도 확인

### 문제 3: Extension이 리로드되지 않음
1. **완전히 종료**:
   - Extension Development Host 창 닫기
   - F5 다시 실행
2. **빌드 재확인**:
   ```bash
   npm run compile
   ```

---

## 📝 테스트 체크리스트

- [ ] CLI 빌드 완료 확인 (`caret --help`)
- [ ] CLI PATH 설정 완료
- [ ] VSCode 리로드 완료
- [ ] Output 패널 열림
- [ ] 일반 명령어 테스트 (`ls` → `isSubagent: false`)
- [ ] Caret CLI 테스트 (`caret "test"` → `isSubagent: true`)
- [ ] 로그 확인 완료

---

## 🎉 완료 후

테스트가 성공하면:
1. 테스트 로그 제거 (선택):
   - `src/core/task/index.ts:1042` 줄 제거 또는 주석 처리
2. 최종 빌드:
   ```bash
   npm run compile
   ```
3. Git 커밋:
   ```bash
   git add .
   git commit -m "feat: Complete Cline v3.34.0 CLI & Subagent integration"
   ```

---

## 📚 관련 파일

- **CLI 소스**: `src/standalone/cline-core.ts`
- **감지 로직**: `src/utils/cli-detector.ts`
- **통합 코드**: `src/core/task/index.ts:1040-1084`
- **빌드 스크립트**: `esbuild.mjs`, `caret-scripts/build/package-standalone.mjs`
- **패키지 설정**: `standalone/runtime-files/package.json`

---

## 🔗 참고

- **Cline v3.34.0 머징 계획**: `caret-docs/work-logs/alpha/20251027-cline-v3.34.0-merge-plan.md`
- **검증 가이드**: `VERIFICATION-GUIDE.md`
- **완료 보고서**: `MERGE-COMPLETED.md`
