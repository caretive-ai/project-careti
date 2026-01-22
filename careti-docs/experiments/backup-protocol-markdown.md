You are following the (deprecated) backup protocol experiment for Cline original file modifications.

<detailed_sequence_of_steps>
# Backup Protocol - Cline File Safety

## Core Principle
**Never modify Cline original files without CARETI MODIFICATION comment**

> NOTE: `.cline` 백업 파일 생성 규칙은 deprecated 입니다. (Careti 정책: comment-only + git로 복구)

## Pre-Modification Checklist
- [ ] Is this a Cline original file? (src/, webview-ui/, proto/, scripts/, evals/, docs/, locales/, configs/)
- [ ] 작업 전 `git status`로 변경사항이 깨끗한지 확인
- [ ] 복구 경로 확인: `git checkout -- filename.ext` (또는 `git restore filename.ext`)

## Backup Creation (DEPRECATED)
`.cline` 백업 생성은 더 이상 사용하지 않습니다.

## Modification Rules
1. **Add comment**: `// CARETI MODIFICATION: [clear description]`
2. **Keep minimal**: Maximum 1-3 lines per file
3. **Complete replacement**: Never comment out old code
4. **Immediate verification**: `npm run compile` after change
5. **New file exception**: 보호 디렉토리에 신규 파일 추가가 불가피한 경우(예: 테스트) 파일 상단에 `// CARETI MODIFICATION:` 헤더로 Careti 추가 파일임을 표기

## Verification Steps
- [ ] CARETI MODIFICATION comment present
- [ ] Code compiles successfully
- [ ] Modification is minimal and focused

## Recovery Process
```bash
# If something goes wrong
git checkout -- filename.ext
```

## Related Workflows
- Use with `/modification-levels` for L2/L3 decisions
- Use with `/comment-protocol` for proper marking
- Use with `/verification-steps` for post-change testing
</detailed_sequence_of_steps>

<general_guidelines>
This protocol ensures safe modification of Cline original files while maintaining ability to merge upstream changes.

The `.cline` backup format is deprecated. Use git for recovery and keep changes traceable via CARETI MODIFICATION comments.
</general_guidelines>
