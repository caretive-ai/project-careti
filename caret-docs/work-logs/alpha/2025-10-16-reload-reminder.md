# VS Code Reload 필수!

작성일: 2025-10-16
작성자: Alpha Yang

## 문제 상황

빌드 후 Task tool 테스트가 실패함:
- `npm run compile` 성공 (dist/extension.js 37MB 생성)
- CLI 테스트 성공 (Claude Code 직접 실행)
- Caret에서 Task tool 테스트 실패 ("empty response")

## 원인

**VS Code를 reload하지 않아서 오래된 extension 코드가 메모리에 로드된 상태**

## 해결 방법

### 1. VS Code Reload 필수 단계

```bash
# 1. 빌드
npm run compile

# 2. VS Code Reload (필수!)
Cmd+Shift+P (macOS) / Ctrl+Shift+P (Windows/Linux)
→ "Developer: Reload Window"

# 3. 테스트 (F5 또는 현재 창에서)
```

### 2. 왜 Reload가 필요한가?

VS Code Extension은 Node.js 프로세스로 실행됩니다:
- Extension 활성화 시 `dist/extension.js` 로드
- 메모리에 상주
- 파일이 바뀌어도 자동으로 reload되지 않음
- **Developer: Reload Window로 프로세스 재시작 필요**

### 3. Build-System.md 규칙

```markdown
## File Modification Protocol

### When modifying esbuild.mjs
1. ✅ Test bundling: `node esbuild.mjs`
2. ✅ Verify output: `dist/extension.js` exists
3. ✅ **Test in VSCode: Reload Window + F5 (Run Extension)**
```

## 다음 테스트 시 체크리스트

- [ ] `npm run compile` 성공 확인
- [ ] `dist/extension.js` 파일 크기 확인
- [ ] **VS Code Reload Window 실행** ← 이거!
- [ ] Task tool 테스트 실행
- [ ] 결과 확인

## 마스터께 드리는 요청

**지금 VS Code를 Reload 해주시고, 다시 Task tool을 테스트해주세요!**

1. `Cmd+Shift+P` (macOS)
2. "Developer: Reload Window" 입력 후 엔터
3. Caret 열고 Claude Code Provider로 Task tool 테스트

이렇게 하면 새로 빌드된 코드가 로드되어 Task tool이 정상 작동할 것입니다! ✨
