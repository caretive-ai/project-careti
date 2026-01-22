#!/bin/bash
# AGENTS.md <-> CLAUDE.md 동기화 hook
# PostToolUse hook에서 Edit 도구가 실행된 후 호출됨

# stdin에서 JSON 읽기
INPUT=$(cat)

# tool_name과 file_path 추출
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .parameters.file_path // empty')

# Edit 도구가 아니면 종료
if [ "$TOOL_NAME" != "Edit" ] && [ "$TOOL_NAME" != "Write" ]; then
    exit 0
fi

# 프로젝트 루트 찾기 (AGENTS.md 또는 CLAUDE.md가 있는 디렉토리)
PROJECT_ROOT=$(dirname "$FILE_PATH")
while [ "$PROJECT_ROOT" != "/" ]; do
    if [ -f "$PROJECT_ROOT/AGENTS.md" ] || [ -f "$PROJECT_ROOT/CLAUDE.md" ]; then
        break
    fi
    PROJECT_ROOT=$(dirname "$PROJECT_ROOT")
done

AGENTS_MD="$PROJECT_ROOT/AGENTS.md"
CLAUDE_MD="$PROJECT_ROOT/CLAUDE.md"

# 동기화 잠금 파일 (무한 루프 방지)
LOCK_FILE="/tmp/.agent-rules-sync.lock"

# 잠금 파일이 있으면 종료 (재귀 호출 방지)
if [ -f "$LOCK_FILE" ]; then
    exit 0
fi

# AGENTS.md가 수정된 경우
if [ "$FILE_PATH" = "$AGENTS_MD" ]; then
    if [ -f "$AGENTS_MD" ] && [ -f "$CLAUDE_MD" ]; then
        touch "$LOCK_FILE"
        cp "$AGENTS_MD" "$CLAUDE_MD"
        rm -f "$LOCK_FILE"
        echo "Synced: AGENTS.md -> CLAUDE.md"
    fi
fi

# CLAUDE.md가 수정된 경우
if [ "$FILE_PATH" = "$CLAUDE_MD" ]; then
    if [ -f "$AGENTS_MD" ] && [ -f "$CLAUDE_MD" ]; then
        touch "$LOCK_FILE"
        cp "$CLAUDE_MD" "$AGENTS_MD"
        rm -f "$LOCK_FILE"
        echo "Synced: CLAUDE.md -> AGENTS.md"
    fi
fi

exit 0
