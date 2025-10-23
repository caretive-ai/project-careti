# Claude Code CLI 방식 제약사항 문서

**작성일**: 2025-10-24  
**작성자**: Luke  
**목적**: 현재 CLI 방식의 기술적 제약사항 명확히 정리

## 1. 개요

Caret은 현재 Claude Code를 **CLI 방식**으로 통합하고 있습니다. 이 방식은 `execa`를 통해 `claude` CLI를 subprocess로 실행하는 방식입니다.

**파일**: `src/integrations/claude-code/run.ts`

이 문서는 CLI 방식의 기술적 제약사항을 명확히 정리하고, 향후 SDK 마이그레이션의 필요성을 설명합니다.

## 2. Hard-coded 제약사항

### 2.1 Timeout 제한

```typescript
const CLAUDE_CODE_TIMEOUT = 600000 // 10분 고정
```

**문제**:
- 모든 작업에 동일한 10분 제한 적용
- 복잡한 분석 작업도 10분 내 완료해야 함
- 사용자가 timeout 설정 불가

**영향**:
- 대규모 코드베이스 분석 시 timeout
- 여러 파일 처리 작업 실패 가능
- 사용자 경험 저하

**예시**:
```typescript
// 200개 파일 분석 작업
// 9분 50초 진행 중... → TIMEOUT ERROR
// 결과: 작업 전체 실패, 부분 결과도 없음
```

### 2.2 Buffer 크기 제한

```typescript
const BUFFER_SIZE = 20_000_000 // 20MB 고정
```

**문제**:
- stdout/stderr 출력이 20MB를 초과하면 에러
- 대용량 결과 반환 불가
- Buffer 크기 사용자 설정 불가

**영향**:
- 상세한 분석 결과가 잘림
- 여러 파일의 내용을 반환할 수 없음
- "maxBuffer exceeded" 에러

**예시**:
```typescript
// 50개 파일의 상세 분석 요청
// 각 파일당 500KB 분석 결과 = 25MB
// 결과: Buffer overflow, 작업 실패
```

### 2.3 Output Token 제한

```typescript
const CLAUDE_CODE_MAX_OUTPUT_TOKENS = "32000"

const env: NodeJS.ProcessEnv = {
    CLAUDE_CODE_MAX_OUTPUT_TOKENS: 
        process.env.CLAUDE_CODE_MAX_OUTPUT_TOKENS || "32000"
}
```

**문제**:
- AI 응답이 32000 tokens로 제한
- 약 128KB 텍스트 (영어 기준)
- 환경변수로 변경 가능하지만 권장하지 않음

**영향**:
- 복잡한 분석 결과가 잘림
- 여러 파일 수정 작업 시 일부만 반환
- 불완전한 코드 생성

**예시**:
```typescript
// "Refactor all TypeScript files in src/" 요청
// AI가 30개 파일 수정 계획
// 결과: 처음 10개 파일만 반환, 나머지 잘림
```

## 3. Process Management 제약

### 3.1 Subprocess 오버헤드

**구조**:
```typescript
const claudeCodeProcess = execa(claudePath, args, {
    stdin: 'pipe',
    stdout: 'pipe',
    stderr: 'pipe',
    // ...
})
```

**문제**:
- 매번 새로운 프로세스 생성
- Process 시작 overhead (~100-500ms)
- Memory 격리로 인한 context 재로딩

**영향**:
- 반복 작업 시 누적 overhead
- 메모리 사용량 증가
- Context 공유 불가

### 3.2 에러 처리의 한계

**현재 에러 처리**:
```typescript
catch (err) {
    if (err.message.includes("ENOENT")) { /* ... */ }
    if (err.message.includes("E2BIG")) { /* ... */ }
    if (err.message.includes("ENAMETOOLONG")) { /* ... */ }
    
    // Generic error
    throw new Error(`Process exited with code ${exitCode}`)
}
```

**문제**:
- Exit code만으로 에러 원인 파악 어려움
- 상세한 에러 타입 구분 불가
- Recovery 전략 수립 어려움

**영향**:
- 사용자에게 모호한 에러 메시지
- 디버깅 어려움
- 자동 recovery 불가

## 4. Progress Tracking 부재

### 4.1 Black Box 실행

**현재 구조**:
```typescript
for await (const line of rl) {
    const chunk = parseChunk(line, processState)
    yield chunk  // 무엇이 진행 중인지 모름
}
```

**문제**:
- 작업 진행 상황 알 수 없음
- 어떤 도구가 실행 중인지 불명확
- 완료 예상 시간 추정 불가

**영향**:
- 사용자는 기다리기만 함
- 작업이 멈췄는지 진행 중인지 모름
- 불안한 UX

**예시**:
```
사용자: "Analyze all files"
알파: [실행 중...]

5분 경과...
10분 경과...

사용자: "뭐 하고 있는 거야?"
알파: "..." (아무 정보 없음)
```

### 4.2 Partial Results 불가

**문제**:
- 작업이 완전히 끝나야 결과 반환
- 중간 결과 확인 불가
- 취소 후 재시작 시 처음부터 다시

**영향**:
- 긴 작업 중 progress 확인 불가
- 실패 시 전체 재작업
- 비효율적

## 5. Subagent 관리의 불투명성

### 5.1 현재 제한

**CLI 실행**:
```typescript
const args = [
    "--max-turns", "1",  // Caret가 재귀 처리
    // Subagent 설정 불가
]
```

**문제**:
- Subagent 생성/관리 불가
- Subagent 진행 상황 추적 불가
- Subagent 결과 개별 처리 불가

**영향**:
- 복잡한 작업 분해 불가
- 병렬 처리 불가
- 효율성 저하

**예시**:
```typescript
// 원하는 시나리오:
// 1. Analyzer agent: 코드 분석
// 2. Refactorer agent: 리팩토링 계획
// 3. Implementer agent: 실제 수정

// 현실:
// 하나의 agent가 모든 걸 순차적으로 처리
// 진행 상황 불명확
// 실패 시 처음부터 재시작
```

## 6. Configuration 유연성 부족

### 6.1 Hard-coded Arguments

```typescript
const args = [
    "--system-prompt", systemPrompt,
    "--verbose",
    "--output-format", "stream-json",
    "--disallowedTools", claudeCodeTools,
    "--max-turns", "1",
    "--model", modelId,
    "-p"
]
```

**문제**:
- 모든 설정이 고정
- 사용자 커스터마이제이션 불가
- 작업별 최적화 불가

**영향**:
- One-size-fits-all approach
- 유연성 부족
- 최적화 기회 상실

### 6.2 환경변수 의존

```typescript
const env: NodeJS.ProcessEnv = {
    CLAUDE_CODE_MAX_OUTPUT_TOKENS: 
        process.env.CLAUDE_CODE_MAX_OUTPUT_TOKENS || "32000",
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    // ...
}
```

**문제**:
- 환경변수로만 설정 변경 가능
- 프로그래밍 방식 제어 불가
- 작업별 다른 설정 불가

**영향**:
- 설정 관리 복잡
- 동적 조정 불가

## 7. Platform 특정 이슈

### 7.1 Windows 경로 길이 제한

**이슈**:
```typescript
if (err.message.includes("ENAMETOOLONG")) {
    throw new Error(
        `Windows has a limit of 8191 characters...`
    )
}
```

**문제**:
- System prompt를 CLI argument로 전달
- Windows: 8191 characters 제한
- 긴 prompt 사용 불가

**Workaround**:
```typescript
// 임시 파일에 저장
await fs.writeFile(tempFilePath, options.systemPrompt, "utf8")
options.systemPrompt = tempFilePath
```

**한계**:
- 여전히 복잡함
- 파일 I/O overhead
- 임시 파일 관리 필요

### 7.2 Linux Argument 제한

**이슈**:
```typescript
if (err.message.includes("E2BIG")) {
    throw new Error(
        `Maximum argument length is 131072 bytes...`
    )
}
```

**문제**:
- Linux: 131072 bytes 제한
- 긴 system prompt 사용 불가

**영향**:
- Rules, workflows 많으면 실패
- 사용자가 설정 줄여야 함

## 8. Streaming 한계

### 8.1 Line-by-line Parsing

**현재 구조**:
```typescript
const rl = readline.createInterface({
    input: cProcess.stdout
})

for await (const line of rl) {
    const chunk = parseChunk(line, processState)
}
```

**문제**:
- Line 단위로만 처리
- Incomplete JSON 처리 복잡
- Reassembly overhead

**영향**:
- Parsing 복잡도 증가
- 에러 가능성
- 대용량 메시지 처리 어려움

### 8.2 Partial Data 처리

**Partial data handling**:
```typescript
type ProcessState = {
    partialData: string | null
    // ...
}

function parseChunk(data: string, processState: ProcessState) {
    if (processState.partialData) {
        processState.partialData += data
        // 복잡한 재조립 로직
    }
}
```

**문제**:
- 수동으로 partial data 관리
- 복잡한 state 관리
- 에러 prone

## 9. SDK 방식과의 비교

| Issue | CLI 방식 (현재) | SDK 방식 (미래) |
|-------|----------------|----------------|
| **Timeout** | ❌ 10분 고정 | ✅ AbortController로 완전 제어 |
| **Buffer** | ❌ 20MB 고정 | ✅ Streaming으로 무제한 |
| **Output Tokens** | ❌ 32000 제한 | ✅ Model 자연 제한만 |
| **Progress** | ❌ Black box | ✅ Hook system으로 실시간 |
| **Subagents** | ❌ 불투명 | ✅ 완전 제어 가능 |
| **Error Handling** | ❌ Generic | ✅ Detailed error types |
| **Configuration** | ❌ Hard-coded | ✅ Fully configurable |
| **Platform Issues** | ❌ 여러 제약 | ✅ 플랫폼 독립적 |
| **Memory** | ❌ Buffer accumulation | ✅ Streaming processing |
| **Complexity** | ❌ Process + parsing | ✅ Direct API |

## 10. 실제 시나리오별 영향

### Scenario 1: 대규모 코드 분석

**요청**: "Analyze all TypeScript files in src/ (200+ files)"

**CLI 방식 문제**:
```
1. 10분 제한 → Timeout 가능성 높음
2. 20MB buffer → 결과가 잘릴 수 있음
3. Progress 없음 → 사용자 불안
4. 실패 시 → 처음부터 재시작
```

**SDK 방식 해결**:
```
1. Timeout 없음 → 완료까지 실행
2. Streaming → 결과 크기 제한 없음
3. Progress hooks → "File 45/200 analyzing..."
4. Partial results → 중간 결과 저장 가능
```

### Scenario 2: 복잡한 리팩토링

**요청**: "Refactor architecture following Clean Architecture"

**CLI 방식 문제**:
```
1. 32000 tokens → 수정 계획이 잘림
2. Subagent 불가 → 분석/계획/실행 분리 못함
3. 에러 시 → Generic error message
4. 재시도 → 전체 재작업
```

**SDK 방식 해결**:
```
1. Token 제한 없음 → 완전한 계획
2. Subagents:
   - Analyzer: 현재 구조 분석
   - Planner: 마이그레이션 계획
   - Implementer: 실제 수정
3. Detailed errors → 정확한 문제 파악
4. Resume → 중단 지점부터 재개
```

### Scenario 3: 긴 작업 모니터링

**요청**: "Generate comprehensive documentation"

**CLI 방식 문제**:
```
1. Progress 없음 → "무슨 일 하는지 모름"
2. 취소 불가 → 10분 기다려야 함
3. 부분 결과 없음 → All-or-nothing
```

**SDK 방식 해결**:
```
1. Real-time progress:
   "Analyzing index.ts..."
   "Generating README.md..."
   "Creating API docs..."
2. Interrupt 가능 → 언제든 중단
3. Progressive results → 즉시 확인
```

## 11. 권장사항

### 현재 (SDK 미출시)

**사용자에게**:
- 복잡한 작업은 작은 단위로 분할
- Timeout 가능성 고려
- 결과가 잘릴 수 있음을 인지

**개발자에게**:
- CLI 방식 유지 관리
- Workaround 문서화
- SDK 출시 모니터링

### 미래 (SDK 출시 후)

**즉시 실행**:
1. SDK 패키지 설치
2. ClaudeCodeSDKHandler 구현
3. Feature flag로 선택적 활성화
4. 점진적 마이그레이션

**장기 목표**:
- SDK를 기본 방식으로 전환
- CLI 방식 deprecated
- 모든 제약사항 해결

## 12. 결론

### 핵심 요약

**CLI 방식의 근본적 한계**:
- Hard-coded limits (timeout, buffer, tokens)
- Process overhead
- Limited observability
- Platform-specific issues

**SDK 방식의 이점**:
- Complete control
- Real-time monitoring
- Scalability
- Platform independence

### 마이그레이션 필요성

현재 CLI 방식은 **간단한 작업**에는 충분하지만, **복잡하고 대규모 작업**에는 근본적인 한계가 있습니다.

SDK 출시는 이러한 모든 제약을 해결하고, Caret을 **진정한 엔터프라이즈급 AI 코딩 도구**로 만들 것입니다.

## 13. 관련 문서

- `20251024-claude-code-sdk-integration-plan.md` - SDK 마이그레이션 계획
- `../alpha/2025-10-18-sdk-vs-cli-comparison.md` - 상세 비교 분석
- `references/claude-code-typescript-sdk.md` - SDK API 레퍼런스

## 14. 업데이트 이력

- **2025-10-24**: 초기 작성 (Luke)
- SDK 출시 시 업데이트 예정
