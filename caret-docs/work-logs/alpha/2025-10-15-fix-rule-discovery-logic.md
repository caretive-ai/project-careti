# 작업 계획: 규칙 파일 탐색 로직 버그 수정

## 문제점

`src/core/context/instructions/user-instructions/external-rules.ts` 파일에서 `.caretrules` 디렉토리의 규칙 파일을 탐색할 때, 파일 확장자 필터를 명시적으로 지정하지 않아 파일들을 제대로 발견하지 못하는 문제가 있습니다.

이로 인해 `.caretrules` 디렉토리가 존재함에도 불구하고 시스템이 이를 비어있는 것으로 간주하여, 다음 우선순위인 `.clinerules`를 활성화하는 버그가 발생합니다.

## 수정 목표

`synchronizeRuleToggles` 함수를 호출할 때, `.caretrules` 디렉토리 내의 모든 파일을 읽도록 확장자 필터를 명시적으로 전달하여 규칙 파일 탐색이 정상적으로 이루어지도록 수정합니다.

## 수정 내용

`src/core/context/instructions/user-instructions/external-rules.ts` 파일의 `refreshExternalRulesToggles` 함수 내 `synchronizeRuleToggles` 호출 부분을 다음과 같이 수정합니다.

**기존 코드:**
```typescript
	const updatedLocalCaretToggles = await synchronizeRuleToggles(localCaretRulesFilePath, localCaretRulesToggles, "", [
		[caretDirectorySegment, "workflows"],
	])
```

**수정 후 코드:**
```typescript
	const updatedLocalCaretToggles = await synchronizeRuleToggles(localCaretRulesFilePath, localCaretRulesToggles, "*.*", [
		[caretDirectorySegment, "workflows"],
	])
```

이렇게 수정하면 `.caretrules` 디렉토리 내의 모든 파일을 정상적으로 인식하여 우선순위 로직이 올바르게 동작하게 됩니다.
