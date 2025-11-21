# 프롬프트 개선사항 검증 가이드

**날짜**: 2025-10-14
**목적**: 수정된 시스템 프롬프트가 실제로 적용되었는지 확인하는 방법
**대상**: CARET_FILE_EDITING.json, CARET_TODO_MANAGEMENT.json 수정 검증

---

## 🎯 빠른 확인 방법 (5분)

### 방법 1: Logger 출력 확인 (가장 쉬움)

**VS Code 개발자 도구 열기**:
1. Extension Development Host에서 `Cmd+Shift+P` (Mac) 또는 `Ctrl+Shift+P` (Windows)
2. "Developer: Toggle Developer Tools" 입력
3. "Console" 탭 선택

**확인할 로그**:
```javascript
// 1. JSON 템플릿 로딩 확인
[CaretJsonAdapter] ✅ CARET_FILE_EDITING: loaded (XXX chars)
[CaretJsonAdapter] ✅ CARET_TODO_MANAGEMENT: loaded (XXX chars)

// 2. Cline Tools 삽입 확인
[CaretJsonAdapter] ✅ Cline tools section inserted after CARET_USER_INSTRUCTIONS (XXXX chars)

// 3. 최종 프롬프트 생성 확인
[CaretPromptWrapper] ✅ Prompt generated: XXXXX chars in XXms
```

**예상 chars 수**:
- CARET_FILE_EDITING: ~1,200-1,400 chars (기존: ~500)
- CARET_TODO_MANAGEMENT: ~1,200-1,400 chars (기존: ~150)
- 최종 프롬프트: 100,000+ chars

---

### 방법 2: 실제 생성된 프롬프트 확인 (정확함)

**Chrome DevTools에서 프롬프트 추출**:

1. **개발자 도구 Console에서 실행**:
```javascript
// Agent 모드 프롬프트 추출
copy(localStorage.getItem('lastSystemPrompt'))
// 클립보드에 복사됨
```

2. **텍스트 에디터에 붙여넣기**:
```bash
# VS Code에서 새 파일 생성
# Cmd+V로 붙여넣기
# 저장: /tmp/caret-prompt-test.txt
```

3. **핵심 문구 검색** (Cmd+F):

**파일 1 개선사항 확인**:
```
검색어: "multiple SEARCH/REPLACE blocks"
→ 최소 3번 출현해야 함

검색어: "30-50% reduction"
→ 1번 출현해야 함

검색어: "Optimized for Claude Sonnet 4.5"
→ 1번 출현해야 함

검색어: "Apply multiple SEARCH/REPLACE blocks in single call"
→ AGENT Mode 섹션에 있어야 함

검색어: "Suggest edits with multiple SEARCH/REPLACE blocks"
→ CHATBOT Mode 섹션에 있어야 함 (Chatbot 모드일 때만)
```

**파일 2 개선사항 확인** (auto_todo 활성화 시):
```
검색어: "Every 10th API request"
→ 최소 1번 출현해야 함

검색어: "Chatbot → Agent"
→ 1번 출현해야 함

검색어: "Silent Updates"
→ 1번 출현해야 함

검색어: "Quality Standards"
→ 1번 출현해야 함

검색어: "not granular details"
→ 1번 출현해야 함
```

---

### 방법 3: 네트워크 탭에서 API 요청 확인 (고급)

**Chrome DevTools → Network 탭**:

1. **Network 탭 열기**:
   - 개발자 도구 → Network 탭
   - Filter: "Fetch/XHR"

2. **새 대화 시작**:
   - Caret 패널에서 새 태스크 시작
   - 간단한 요청 입력: "파일 2개 편집해줘"

3. **API 요청 확인**:
   - Claude API 요청 찾기 (messages 엔드포인트)
   - Request Payload → messages → system 확인

4. **프롬프트 내용 확인**:
   ```json
   {
     "role": "system",
     "content": "# FILE EDITING PROTOCOL\n\n... multiple SEARCH/REPLACE blocks ..."
   }
   ```

---

## 🧪 기능 테스트 (실전 확인)

### 테스트 1: Multiple SEARCH/REPLACE 동작 확인

**Agent 모드에서 테스트**:

1. **테스트 파일 생성**:
```typescript
// test.ts
export function hello() {
  console.log("Hello");
}
```

2. **요청**:
```
test.ts 파일을 수정해줘:
1. import 문 추가: import { world } from './world'
2. hello 함수 내용 변경: console.log("Hello World")
```

3. **확인 사항**:
- ✅ AI가 **1번의 replace_in_file 호출**로 처리하는지 확인
- ✅ 응답에 "multiple SEARCH/REPLACE blocks" 또는 "single call" 언급
- ❌ **2번의 별도 replace_in_file 호출**이면 미적용

**예상 응답**:
```
I'll modify test.ts using a single replace_in_file call with multiple SEARCH/REPLACE blocks:

<replace_in_file>
<path>test.ts</path>

<<<<<<< SEARCH
export function hello() {
=======
import { world } from './world'

export function hello() {
>>>>>>> REPLACE

<<<<<<< SEARCH
  console.log("Hello");
=======
  console.log("Hello World");
>>>>>>> REPLACE
</replace_in_file>
```

---

### 테스트 2: TODO 타이밍 동작 확인 (auto_todo 활성화 시)

**Agent 모드에서 장기 작업 요청**:

1. **요청**:
```
새 기능 구현해줘: User 인증 시스템
```

2. **확인 사항**:
- ✅ 첫 응답에 TODO 리스트 생성
- ✅ 10번째 API 요청 근처에서 TODO 업데이트 프롬프트
- ✅ TODO 업데이트가 "silently" 수행됨 (사용자에게 "TODO 업데이트했습니다" 같은 메시지 없음)

**Logger에서 확인**:
```javascript
[Task] API request count: 10
[CaretJsonAdapter] ✅ CARET_TODO_MANAGEMENT: loaded
// TODO 업데이트가 자동으로 프롬프트에 포함됨
```

---

### 테스트 3: 모드 전환 시 TODO 생성 확인

**Chatbot → Agent 모드 전환 테스트**:

1. **Chatbot 모드에서 시작**:
```
복잡한 기능 구현 계획 알려줘: 실시간 채팅 시스템
```

2. **Agent 모드로 전환**:
   - Mode toggle 버튼 클릭
   - Chatbot → Agent

3. **확인 사항**:
- ✅ Agent 모드 전환 시 "comprehensive todo list" 자동 생성
- ✅ Logger: "[CaretJsonAdapter] Mode: agent, creating todo list"

---

## 📊 정량적 검증 (데이터 기반)

### API 요청 수 측정

**테스트 시나리오**:
```
같은 파일에 5개 변경사항 적용:
1. import 추가
2. 타입 정의 추가
3. 함수 시그니처 변경
4. 함수 구현 변경
5. export 추가
```

**측정 방법**:
1. Network 탭에서 Claude API 요청 개수 세기
2. 개선 전 예상: 5번 API 요청
3. 개선 후 예상: 1-2번 API 요청

**결과 기록**:
- 개선 전: ___ 번 API 요청
- 개선 후: ___ 번 API 요청
- 감소율: ____%

---

## 🔍 디버깅: 적용 안 된 경우

### 문제 1: Logger에 로그가 안 보임

**원인**: Logger 레벨이 DEBUG가 아님

**해결**:
```typescript
// src/services/logging/Logger.ts 확인
// LogLevel이 DEBUG로 설정되어 있는지 확인

// 또는 환경변수 설정
CARET_LOG_LEVEL=DEBUG
```

---

### 문제 2: 프롬프트에 개선사항이 안 보임

**체크리스트**:

1. **JSON 파일 수정 확인**:
```bash
# 파일 수정 시간 확인
ls -la caret-src/core/prompts/sections/CARET_*.json

# 내용 확인
jq -r '.file_editing.sections[0].content' caret-src/core/prompts/sections/CARET_FILE_EDITING.json | grep "multiple SEARCH/REPLACE"
```

2. **컴파일 확인**:
```bash
# 재컴파일
npm run compile

# 에러 확인
echo $?  # 0이어야 함
```

3. **Extension Host 재시작**:
   - Extension Development Host 닫기
   - VS Code 재시작
   - F5로 다시 실행

4. **캐시 클리어**:
```bash
# webview 빌드 캐시 삭제
rm -rf webview-ui/dist
rm -rf webview-ui/.vite

# 재빌드
cd webview-ui && npm run build && cd ..
```

---

### 문제 3: auto_todo가 활성화 안 됨

**확인 방법**:
```typescript
// src/core/prompts/system-prompt/index.ts 확인
// context.auto_todo 값 확인

// 또는 Logger 출력:
[CaretJsonAdapter] 📋 Selected sections: [..., "CARET_TODO_MANAGEMENT", ...]
```

**활성화 조건**:
```typescript
// CaretJsonAdapter.ts:47
context.auto_todo || context.task_progress ? "CARET_TODO_MANAGEMENT" : null
```

**강제 활성화** (테스트용):
```typescript
// CaretJsonAdapter.ts:47 임시 수정
"CARET_TODO_MANAGEMENT",  // 항상 로딩
```

---

## ✅ 검증 완료 체크리스트

### Level 1: 기본 검증 (필수)
- [ ] Logger에서 JSON 로딩 확인
- [ ] 개발자 도구 Console에 에러 없음
- [ ] 프롬프트에 "multiple SEARCH/REPLACE blocks" 포함
- [ ] 프롬프트에 "Every 10th API request" 포함 (auto_todo 활성화 시)

### Level 2: 기능 검증 (권장)
- [ ] 같은 파일 여러 변경 시 1번 API 요청으로 처리
- [ ] 10번째 요청 근처에서 TODO 업데이트 프롬프트
- [ ] Chatbot → Agent 전환 시 TODO 자동 생성

### Level 3: 정량 검증 (선택)
- [ ] API 요청 수 30% 이상 감소 측정
- [ ] 응답 시간 단축 측정
- [ ] TODO 업데이트 타이밍 일관성 확인

---

## 📝 검증 결과 템플릿

```markdown
# 프롬프트 개선사항 검증 결과

**날짜**: YYYY-MM-DD
**검증자**: [이름]

## 기본 검증
- [x] Logger 로딩 확인: ✅ CARET_FILE_EDITING (1,264 chars)
- [x] Logger 로딩 확인: ✅ CARET_TODO_MANAGEMENT (1,297 chars)
- [x] Console 에러: 없음
- [x] "multiple SEARCH/REPLACE blocks": 3회 출현
- [x] "Every 10th API request": 1회 출현

## 기능 테스트
- [x] Multiple SEARCH/REPLACE: 1번 API 요청으로 처리 ✅
- [x] TODO 타이밍: 10번째 요청에 업데이트 ✅
- [x] 모드 전환 TODO: 자동 생성 ✅

## 정량 측정
- API 요청 감소: 5회 → 1회 (80% 감소) ✅
- 응답 시간: 15초 → 6초 (60% 단축) ✅

## 종합 판정
✅ **적용 완료** - 모든 검증 항목 통과
```

---

## 🎯 빠른 원라이너 검증

```bash
# 1. JSON 파일 수정 확인
jq -r '.file_editing.sections[0].content' caret-src/core/prompts/sections/CARET_FILE_EDITING.json | grep -c "multiple SEARCH/REPLACE" && echo "✅ 적용됨" || echo "❌ 미적용"

# 2. TODO 파일 수정 확인
jq -r '.todo_management.sections[0].content' caret-src/core/prompts/sections/CARET_TODO_MANAGEMENT.json | grep -c "Every 10th" && echo "✅ 적용됨" || echo "❌ 미적용"

# 3. 컴파일 상태 확인
npm run compile > /dev/null 2>&1 && echo "✅ 컴파일 성공" || echo "❌ 컴파일 실패"
```

---

**작성 완료**: 2025-10-14
**난이도**: Easy (방법 1-2) / Medium (테스트 1-3) / Hard (정량 검증)
**예상 시간**: 5분 (빠른 확인) / 15분 (기능 테스트) / 30분 (정량 검증)
