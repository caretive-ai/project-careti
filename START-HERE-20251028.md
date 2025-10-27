# 내일(2025-10-28) 작업 시작 가이드

**작업**: Cline v3.34.0 선택적 머징
**예상 시간**: 1-2시간
**브랜치**: `merge/cline-v3.32.7-to-v3.34.0`

---

## ✅ 오늘(10-27) 완료한 작업

1. ✅ 이전 머징 방법 조사 (완전 Reset + 재구현 방식)
2. ✅ Task.ts executeCommandTool 실제 코드 검증
3. ✅ **선택적 이식 가능 확정** (구조 변경 없음!)
4. ✅ 상세 작업 계획 문서 작성

---

## 📚 필수 읽기 문서 (순서대로)

### 1. 실제 검증 결과 (⭐ 가장 중요!)
```
caret-docs/work-logs/alpha/20251027-pre-merge-verification.md
```
- Task.ts executeCommandTool 실제 비교 결과
- 선택적 이식 가능 근거
- 내일 작업 체크리스트

### 2. 작업 계획서
```
caret-docs/work-logs/alpha/20251027-cline-v3.34.0-merge-plan.md
```
- 전체 Phase별 상세 계획
- 예상 시간 및 위험도

### 3. 참고용 (필요시)
```
caret-docs/work-logs/luke/cline-merge-complexity-analysis-20251027.md
caret-docs/merging/merging-strategy-guide.md
```

---

## 🎯 내일 작업 순서

### Phase 1: 의존성 복사 (30분)

#### Step 1: StandaloneTerminalManager
```bash
cp -r cline-latest/standalone/ ./
```
- [ ] 복사 완료
- [ ] import 경로 확인

#### Step 2: Subagent 감지
```bash
mkdir -p src/integrations/cli-subagents
cp -r cline-latest/src/integrations/cli-subagents/ src/integrations/
```
- [ ] 복사 완료
- [ ] `isSubagentCommand()` 함수 확인

#### Step 3: CLI 감지 유틸
```bash
cp cline-latest/src/utils/cli-detector.ts src/utils/
```
- [ ] 복사 완료
- [ ] import 경로 확인

#### ✅ Phase 1 체크
```bash
npm run compile
```
- [ ] 빌드 성공

---

### Phase 2: Task.ts 수정 (30분)

#### Step 1: executeCommandTool 수정
```bash
# 파일: src/core/task/index.ts
# 메서드: async executeCommandTool(...)
```

**추가할 코드 (메서드 시작 부분)**:
```typescript
// CARET MODIFICATION: Subagent support from Cline v3.34.0
const isSubagent = isSubagentCommand(command)
if (transformClineCommand(command) !== command && isSubagent) {
    command = transformClineCommand(command)
}
```

**추가할 코드 (터미널 생성 전)**:
```typescript
// CARET MODIFICATION: Conditional TerminalManager selection
let terminalManager: TerminalManager
if (isSubagent) {
    try {
        const { StandaloneTerminalManager } = require(Task.STANDALONE_TERMINAL_MODULE_PATH)
        if (StandaloneTerminalManager) {
            terminalManager = new StandaloneTerminalManager()
        } else {
            terminalManager = new TerminalManager()
        }
    } catch (error) {
        console.error("[DEBUG] Failed to load standalone terminal manager", error)
        terminalManager = new TerminalManager()
    }
    terminalManager.setSubagentTerminalOutputLineLimit(
        this.terminalManager["subagentTerminalOutputLineLimit"] || 2000
    )
} else {
    // Caret 기존 로직 보존
    terminalManager = this.terminalManager
}
```

**변수 참조 수정**:
```typescript
// Before: const terminalInfo = await this.terminalManager.getOrCreateTerminal(this.cwd)
// After:
const terminalInfo = await terminalManager.getOrCreateTerminal(this.cwd)
```

#### Step 2: import 추가
```typescript
// src/core/task/index.ts 상단
import { isSubagentCommand, transformClineCommand } from "@/integrations/cli-subagents/subagent_command"
```

#### ✅ Phase 2 체크
```bash
npm run compile
npm run check-types
```
- [ ] 빌드 성공
- [ ] 타입 에러 없음

---

### Phase 3: 검증 (30분)

#### Step 1: 빌드 전체 검증
```bash
npm run protos        # Proto 재생성 (필요시)
npm run compile       # TypeScript 컴파일
npm run check-types   # 타입 체크
npm run build:webview # 웹뷰 빌드
```
- [ ] 모두 성공

#### Step 2: 실행 테스트
```bash
# F5 키 - VSCode Extension 실행
```
- [ ] Extension 정상 실행
- [ ] 일반 명령 테스트 (ls, pwd 등)
- [ ] Caret 기존 기능 확인:
  - [ ] 브랜딩 시스템
  - [ ] i18n 언어 전환
  - [ ] 페르소나 시스템
  - [ ] IntelliJ gRPC 통합

#### Step 3: 문서 업데이트
```bash
# 변경 파일 목록 작성
git status > MERGE-CHANGES.txt

# 커밋 메시지 준비
```

---

## ⚠️ 주의사항

### 절대 하지 말 것
- ❌ `git reset --hard` (이번엔 Reset 방식 아님!)
- ❌ 대량 파일 복사 (필요한 것만!)
- ❌ Background command state 관련 코드 복사 (Caret 미사용)

### 반드시 할 것
- ✅ **각 단계마다 문서 업데이트** (체크박스 체크)
- ✅ 각 Phase 완료 후 빌드 테스트
- ✅ CARET MODIFICATION 주석 추가
- ✅ import 경로 확인

---

## 🚨 문제 발생 시

### 빌드 실패
1. `npm run clean`
2. `node_modules` 삭제 후 `npm install`
3. 다시 빌드

### import 에러
- `@/integrations/cli-subagents/subagent_command` 경로 확인
- `Task.STANDALONE_TERMINAL_MODULE_PATH` 경로 확인

### 막혔을 때
1. 현재 상태 커밋
2. `20251027-pre-merge-verification.md` 재확인
3. Luke에게 질문

---

## 📝 진행 상황 기록

### 시작 시간: ___:___

#### Phase 1 시작: ___:___
- [ ] standalone/ 복사
- [ ] cli-subagents/ 복사
- [ ] cli-detector.ts 복사
- [ ] 빌드 테스트

#### Phase 1 완료: ___:___

#### Phase 2 시작: ___:___
- [ ] executeCommandTool 수정
- [ ] import 추가
- [ ] 빌드 테스트

#### Phase 2 완료: ___:___

#### Phase 3 시작: ___:___
- [ ] 전체 빌드
- [ ] 실행 테스트
- [ ] 문서 업데이트

#### Phase 3 완료: ___:___

### 종료 시간: ___:___

**총 소요 시간**: ___시간 ___분

---

## 🎉 완료 후

### 커밋
```bash
git add .
git commit -m "feat: Integrate Cline v3.34.0 Subagent support (selective merge)

- Add StandaloneTerminalManager (standalone/)
- Add Subagent detection (cli-subagents/)
- Modify executeCommandTool with conditional TerminalManager
- Preserve Caret logic in else branch (no breaking changes)

CARET MODIFICATION: Selective integration from Cline v3.34.0
Time: 1-2 hours
Files changed: ~10 files
Conflicts: 0

Related docs:
- caret-docs/work-logs/alpha/20251027-pre-merge-verification.md
- caret-docs/work-logs/alpha/20251027-cline-v3.34.0-merge-plan.md"
```

### 문서 마무리
- [ ] 실제 소요 시간 기록
- [ ] 발견한 문제점 기록
- [ ] 다음 단계 제안 (Provider 추가 등)

---

**준비 완료!** 🚀

내일 이 파일을 열고 순서대로 진행하면 됩니다.
