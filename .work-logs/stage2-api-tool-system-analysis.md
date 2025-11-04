# Stage 2: API & Tool System - 작업 분석

**시작 시간**: 2025-11-04
**난이도**: 🔴 Very Hard
**상태**: 분석 중

## Stage 1 완료 후 컴파일 오류 분석

### Missing Modules (새 파일 필요)

1. **@core/task/TaskLockUtils** (새 파일)
2. **@/core/api/transform/tool-use-handler** (ToolUseHandler - 새 파일)
3. **../hooks/hook-factory** (hooks 관련 - 새 파일들)

### Missing Exports (기존 파일 수정 필요)

1. **@shared/ExtensionMessage** - COMMAND_CANCEL_TOKEN
2. **@shared/mcp** - CLINE_MCP_TOOL_IDENTIFIER
3. **./utils** (src/core/task/utils.ts) - extractProviderDomainFromUrl

### Missing Properties (Type 정의 수정 필요)

1. **TaskParams**:
   - subagentTerminalOutputLineLimit
   - vscodeTerminalExecutionMode
   - taskLockAcquired

2. **TaskState**:
   - autoRetryAttempts
   - toolUseIdMap

3. **TerminalManager**:
   - setSubagentTerminalOutputLineLimit

4. **FeatureFlagsService**:
   - getHooksEnabled

### Type Mismatches

1. **ClineSay** type - error_retry 추가 필요
2. **Content block types** - tool_calls 타입 추가 필요

## Stage 2 처리 계획

### 1단계: 새 파일 복사 (Cline only)

```bash
# Cline v3.35.0에서 새로 추가된 파일들
1. src/core/api/transform/tool-use-handler.ts
2. src/core/task/TaskLockUtils.ts
3. src/core/task/hooks/* (hook 관련 파일들)
```

### 2단계: Both-modified 파일 병합

**우선순위 P0** (컴파일 에러 해결에 필수):
1. src/shared/ExtensionMessage.ts
2. src/shared/mcp.ts
3. src/core/task/utils.ts
4. src/core/task/TaskState.ts
5. src/integrations/terminal/TerminalManager.ts
6. src/services/feature-flags.ts

**우선순위 P1** (관련 API 파일들):
7. src/core/api/index.ts
8. src/core/api/transform/stream.ts

### 3단계: 검증

- TypeScript 컴파일
- 타입 체크
- 기본 테스트

## 🚨 중요: 작업 방식 (프로젝트 구조 보호)

### 하위 폴더 구조 (.gitignore 적용됨)

```
/var/home/luke/dev/caret-merging/
├── caret-main/          # Caret 최신 소스 (git clone, .gitignore에 등록)
├── cline-latest/        # Cline v3.35.0 소스 (git clone, .gitignore에 등록)
├── src/                 # 현재 작업 중인 병합 소스
└── .work-logs/          # 작업 문서
```

### 파일 복사 원칙

**❌ 절대 하지 말 것:**
- git checkout으로 브랜치 전환 (하위 폴더 날아감)
- 하위 폴더를 git add (이미 .gitignore 적용됨)

**✅ 올바른 방법:**
```bash
# Cline only 파일: cline-latest에서 직접 복사
cp cline-latest/경로/파일.ts src/경로/파일.ts

# Both-modified 파일: 3-way 비교 후 수동 병합
# 1. caret-main/경로/파일.ts (Caret 버전)
# 2. cline-latest/경로/파일.ts (Cline 버전)
# 3. src/경로/파일.ts (현재 병합 작업본)
```

### 파일 위치 확인

```bash
# 새 파일 찾기
find cline-latest/src -name "*.ts" -newer caret-main/src 2>/dev/null
# 또는
find cline-latest/src -type f -name "파일명"
```

## 작업 진행 상황

- [x] Stage 2 분석 문서 작성
- [x] 작업 방식 문서화 (.gitignore, 하위 폴더 구조)
- [x] cline-latest v3.35.0 재설치 (기존은 v3.34.0이었음)
- [x] 새 파일 복사 완료:
  - src/core/api/transform/tool-use-handler.ts
  - src/core/task/TaskLockUtils.ts
  - src/core/hooks/* (hook-factory.ts 등)
- [x] ExtensionMessage.ts 병합:
  - COMMAND_CANCEL_TOKEN 추가
  - ClineSay에 "error_retry" 추가
- [x] mcp.ts 병합:
  - CLINE_MCP_TOOL_IDENTIFIER 추가
- [x] task/utils.ts 병합:
  - extractProviderDomainFromUrl() 함수 추가
- [x] TaskState.ts 병합:
  - userMessageContent에 Anthropic.ToolResultBlockParam 추가
  - toolUseIdMap 추가
  - consecutiveAutoApprovedRequestsCount 제거
  - autoRetryAttempts 추가
- [ ] 남은 작업 (Stage 3 이후):
  - TerminalManager (setSubagentTerminalOutputLineLimit)
  - Controller (updateBackgroundCommandState등)
  - FeatureFlagsService (getHooksEnabled 등)
  - SystemPromptContext 업데이트
  - Proto 파일 (hooks)
  - 기타 타입 문제들
- [x] 컴파일 검증: 93개 에러 → ~60개 에러 (33개 해결!)
- [ ] 커밋

## 컴파일 에러 분석 (60개 남음)

### 해결된 문제 (33개)
- ✅ COMMAND_CANCEL_TOKEN
- ✅ CLINE_MCP_TOOL_IDENTIFIER
- ✅ extractProviderDomainFromUrl
- ✅ TaskState.autoRetryAttempts
- ✅ TaskState.toolUseIdMap
- ✅ error_retry (ClineSay)
- ✅ ToolUseHandler 모듈
- ✅ TaskLockUtils 모듈
- ✅ hook-factory 모듈

### 남은 문제 (60개) - Stage 3+에서 해결
1. consecutiveAutoApprovedRequestsCount 사용처 (tool handlers)
2. hooks proto 파일
3. TerminalManager.setSubagentTerminalOutputLineLimit
4. Controller 메서드들
5. Feature flags
6. GlobalState.nativeToolCallEnabled
7. TaskParams 속성들
8. shell_integration_warning_with_suggestion
9. SystemPromptContext
10. tool_calls content type

## 다음 단계

Stage 3: 나머지 core 파일들
