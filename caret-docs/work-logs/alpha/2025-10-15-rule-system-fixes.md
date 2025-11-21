# 작업 로그: 규칙 시스템 버그 수정 (2025-10-15)

## 작업 개요

알파의 인계 문서를 바탕으로 규칙 우선순위 시스템의 버그를 수정하고, 추가로 발견된 규칙 로딩 문제들을 해결했습니다.

---

## 1. 규칙 우선순위 버그 수정

### 문제 상황
- `.caretrules`와 `.clinerules` 디렉토리가 모두 존재할 때, `.clinerules`가 활성화됨
- 우선순위 로직(`.caretrules` > `.clinerules`)이 작동하지 않음

### 원인 분석
알파가 발견한 가설이 정확했습니다:
- `external-rules.ts:53`에서 `synchronizeRuleToggles` 호출 시 `"*.*"` 확장자 필터 사용
- `rule-helpers.ts:20-24`의 로직에서 `"*.*"`는 문자열 리터럴로 처리되어 실제 파일 확장자(`.md`, `.yaml`)와 매치되지 않음
- 결과: **모든 파일이 필터링**되어 `.caretrules`에 파일이 없다고 판단됨

```typescript
// rule-helpers.ts:20-24
if (allowedFileExtension !== "") {
    const fileExtension = path.extname(entry)  // ".md", ".yaml" 등
    if (fileExtension !== allowedFileExtension) {  // ".md" !== "*.*" → 항상 true
        continue  // 모든 파일 건너뜀
    }
}
```

### 해결 방법

**파일**: `src/core/context/instructions/user-instructions/external-rules.ts`

**수정 내용** (라인 53-56):
```typescript
// ❌ 잘못된 코드
const updatedLocalCaretToggles = await synchronizeRuleToggles(
    localCaretRulesFilePath,
    localCaretRulesToggles,
    "*.*",  // 문제!
    [[caretDirectorySegment, "workflows"]]
)

// ✅ 올바른 코드
const updatedLocalCaretToggles = await synchronizeRuleToggles(
    localCaretRulesFilePath,
    localCaretRulesToggles,
    "",  // 빈 문자열 = 모든 파일 허용
    [[caretDirectorySegment, "workflows"]]
)
```

---

## 2. 규칙 생성 위치 버그 수정

### 문제 상황
- 새 규칙 파일 생성 시 항상 `.clinerules` 디렉토리에 생성됨
- `.caretrules`가 없는 상태에서도 `.clinerules`에 생성됨

### 원인 분석
`rule-helpers.ts:182`의 `createRuleFile` 함수가 하드코딩된 `.clinerules` 경로 사용:
```typescript
const localClineRulesFilePath = path.resolve(cwd, GlobalFileNames.clineRules)  // 항상 .clinerules
```

### 해결 방법

**파일**: `src/core/context/instructions/user-instructions/rule-helpers.ts`

**수정 내용** (라인 169-207):
```typescript
/**
 * Create a rule file or workflow file
 * CARET MODIFICATION: Use .caretrules instead of .clinerules for workspace rules
 */
export const createRuleFile = async (isGlobal: boolean, filename: string, cwd: string, type: string) => {
    // ... 생략 ...
    } else {
        // CARET MODIFICATION: Use .caretrules instead of .clinerules for workspace rules
        const localCaretRulesFilePath = path.resolve(cwd, GlobalFileNames.caretRules)

        const hasError = await ensureLocalClineDirExists(localCaretRulesFilePath, "default-rules.md")
        if (hasError === true) {
            return { filePath: null, fileExists: false }
        }

        await fs.mkdir(localCaretRulesFilePath, { recursive: true })

        if (type === "workflow") {
            const localWorkflowsFilePath = path.resolve(cwd, GlobalFileNames.workflows)
            // ... workflows 처리 ...
            filePath = path.join(localWorkflowsFilePath, filename)
        } else {
            // CARET MODIFICATION: Create in .caretrules directory
            filePath = path.join(localCaretRulesFilePath, filename)
        }
    }
    // ... 생략 ...
}
```

**브랜드별 동적 디렉토리**:
- `GlobalFileNames.caretRules`는 `disk.ts`에서 브랜드별로 자동 설정됨
- **Caret 브랜드**: `.caretrules`
- **CodeCenter 브랜드**: `.codecenterrules` (이미 `brand-config.json`에 설정됨)

---

## 3. 규칙 생성 후 토글 업데이트 버그 수정

### 문제 상황
- 규칙 파일 생성 후 UI에 반영되지 않음
- `refreshClineRulesToggles`만 호출하여 `.caretrules` 토글이 업데이트되지 않음

### 해결 방법

**파일**: `src/core/controller/file/createRuleFile.ts`

**수정 내용** (라인 57-59):
```typescript
} else {
    if (request.type === "workflow") {
        await refreshWorkflowToggles(controller, cwd)
    } else {
        // CARET MODIFICATION: Refresh both Cline and external rules (includes .caretrules)
        const clineToggles = await refreshClineRulesToggles(controller, cwd)
        await refreshExternalRulesToggles(controller, cwd, { clineLocalToggles: clineToggles.localToggles })
    }
    await controller.postStateToWebview()
```

---

## 4. RefreshRules 누락된 caretLocalToggles 수정

### 문제 상황
- `refreshRules` 함수가 `caretLocalToggles`를 UI에 반환하지 않음
- proto에는 `local_caret_rules_toggles` 필드가 있지만 사용되지 않음

### 해결 방법

**파일**: `src/core/controller/file/refreshRules.ts`

**수정 내용** (라인 19-35):
```typescript
export async function refreshRules(controller: Controller, _request: EmptyRequest): Promise<RefreshedRules> {
    try {
        const cwd = await getCwd(getDesktopDir())
        const { globalToggles, localToggles } = await refreshClineRulesToggles(controller, cwd)

        // CARET MODIFICATION: Get caretLocalToggles from refreshExternalRulesToggles
        const { caretLocalToggles, cursorLocalToggles, windsurfLocalToggles } = await refreshExternalRulesToggles(
            controller,
            cwd,
            { clineLocalToggles: localToggles },
        )

        const { localWorkflowToggles, globalWorkflowToggles } = await refreshWorkflowToggles(controller, cwd)

        return RefreshedRules.create({
            globalClineRulesToggles: { toggles: globalToggles },
            localClineRulesToggles: { toggles: localToggles },
            localCaretRulesToggles: { toggles: caretLocalToggles },  // ← 추가!
            localCursorRulesToggles: { toggles: cursorLocalToggles },
            localWindsurfRulesToggles: { toggles: windsurfLocalToggles },
            localWorkflowToggles: { toggles: localWorkflowToggles },
            globalWorkflowToggles: { toggles: globalWorkflowToggles },
        })
    } catch (error) {
        console.error("Failed to refresh rules:", error)
        throw error
    }
}
```

---

## 5. 파일 확장자 지원 확인

### 질문
.md 파일만 읽어오는가? .json, .yaml도 읽어와야 하는가?

### 분석 결과
**이미 모든 확장자를 지원합니다!**

#### 코드 분석
1. **`getLocalCaretRules` (external-rules.ts:220)**:
   ```typescript
   const rulesFilePaths = await readDirectory(caretRulesFilePath, [
       [path.basename(GlobalFileNames.caretRules), "workflows"],
   ])
   ```
   - `readDirectory`는 확장자 필터링 없이 **모든 파일** 반환
   - `.md`, `.json`, `.yaml`, `.yml` 모두 포함

2. **`readDirectory` (fs.ts:117)**:
   - 디렉토리의 모든 파일을 재귀적으로 읽음
   - OS 생성 파일(`.DS_Store` 등)만 제외
   - **확장자 필터링 없음**

3. **비교: `.cursor/rules`는 `.mdc`만**:
   ```typescript
   await readDirectoryRecursive(cursorRulesDirPath, ".mdc")  // 특정 확장자만
   ```

#### 실제 테스트
```bash
$ ls -la /Users/luke/dev/caret-business-docs/.caretrules/
total 16
drwxr-xr-x@  5 luke  staff   160 Oct 15 03:09 .
drwxr-xr-x@ 15 luke  staff   480 Oct 15 02:29 ..
-rw-r--r--@  1 luke  staff  2037 Oct 15 03:09 a.json              ← JSON 파일
-rw-r--r--@  1 luke  staff  2037 Sep 22 11:55 project_workflow.json  ← JSON 파일
drwxr-xr-x@  3 luke  staff    96 Sep 22 11:55 workflows
```

**결론**: `.json`, `.yaml`, `.md` 모든 확장자가 이미 지원됩니다.

---

## 수정된 파일 목록

1. ✅ `src/core/context/instructions/user-instructions/external-rules.ts:53-56`
   - 확장자 필터 `"*.*"` → `""` 변경

2. ✅ `src/core/context/instructions/user-instructions/rule-helpers.ts:169-207`
   - `createRuleFile` 함수에서 `.clinerules` → `GlobalFileNames.caretRules` 변경

3. ✅ `src/core/controller/file/createRuleFile.ts:57-59`
   - 규칙 생성 후 `refreshExternalRulesToggles` 호출 추가

4. ✅ `src/core/controller/file/refreshRules.ts:19-35`
   - `caretLocalToggles` 반환 추가

5. ✅ `caret-src/__tests__/rule-discovery.test.ts:6`
   - 한글 타이핑 오류 수정 (`ㅊ` → `"vscode"`)

---

## 브랜드 변환 시스템 확인

### CodeCenter B2B 지원
**파일**: `caret-b2b/brands/codecenter/brand-config.json:80`

**확인 결과**:
```json
"disk_ts": {
    ".caretrules": ".codecenterrules",
    "Documents/Caret": "Documents/Codecenter",
    // ... 기타 브랜드 매핑
}
```

**동작 방식**:
- `disk.ts`의 `BRAND_SLUG`가 `package.json`의 `name`에서 브랜드 추출
- `BRAND_RULES_DIR = `.${BRAND_SLUG}rules``
- **Caret 브랜드** (`name: "caret"`): `.caretrules`
- **CodeCenter 브랜드** (`name: "codecenter"`): `.codecenterrules`

우리가 수정한 코드는 `GlobalFileNames.caretRules`를 사용하므로 브랜드 변환 시 **자동으로 작동합니다**.

---

## 남은 이슈 및 검증 필요 사항

### 🔍 검증 필요
1. **실제 규칙 로딩 확인**:
   - Extension을 빌드하고 실행 (F5)
   - `/Users/luke/dev/caret-business-docs` 프로젝트 열기
   - `.caretrules/project_workflow.json`이 로딩되는지 확인
   - Logger.debug 메시지로 토글 상태 확인

2. **우선순위 시스템 테스트**:
   - `.caretrules`와 `.clinerules`가 동시에 있을 때
   - `.caretrules`가 활성화되고 `.clinerules`가 비활성화되는지 확인

3. **규칙 생성 테스트**:
   - UI에서 새 규칙 파일 생성
   - `.caretrules/` 디렉토리에 생성되는지 확인
   - 생성 후 즉시 UI에 토글이 나타나는지 확인

### ⚠️ 잠재적 이슈
현재 수정으로 기본적인 버그는 해결되었으나, 실제 로딩 테스트가 필요합니다. 특히:
- `readDirectory`가 반환하는 경로가 절대 경로인지 상대 경로인지
- `path.resolve(directoryPath, filePath)` (rule-helpers.ts:59)가 올바르게 작동하는지
- UI에서 토글 목록을 표시할 때 추가 필터링이 있는지

---

## 다음 작업자에게

알파의 분석이 정확했습니다. `"*.*"` 확장자 필터가 근본 원인이었고, 추가로 규칙 생성 및 토글 업데이트 버그도 발견하여 수정했습니다.

하지만 실제 Extension을 실행하여 다음을 확인해야 합니다:
1. `.caretrules` 파일들이 실제로 로딩되는가?
2. Logger.debug 메시지가 올바른 토글 정보를 출력하는가?
3. UI에 토글 목록이 제대로 표시되는가?

Extension 실행 방법:
```bash
npm run compile  # 또는 F5 in VS Code
# Extension Development Host가 열리면 테스트 프로젝트 열기
```

수고하셨습니다!
