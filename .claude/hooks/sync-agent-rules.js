#!/usr/bin/env node
/**
 * AGENTS.md <-> CLAUDE.md 동기화 hook
 * PostToolUse hook에서 Edit/Write 도구가 실행된 후 호출됨
 * 크로스 플랫폼 지원 (Windows, macOS, Linux)
 */

const fs = require('fs');
const path = require('path');

async function main() {
  // stdin에서 JSON 읽기
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    process.exit(0);
  }

  const toolName = data.tool_name || '';
  const filePath = data.tool_input?.file_path || data.parameters?.file_path || '';

  // Edit/Write 도구가 아니면 종료
  if (toolName !== 'Edit' && toolName !== 'Write') {
    process.exit(0);
  }

  // 프로젝트 루트 찾기
  let projectRoot = path.dirname(filePath);
  while (projectRoot !== path.parse(projectRoot).root) {
    if (fs.existsSync(path.join(projectRoot, 'AGENTS.md')) ||
        fs.existsSync(path.join(projectRoot, 'CLAUDE.md'))) {
      break;
    }
    projectRoot = path.dirname(projectRoot);
  }

  const agentsMd = path.join(projectRoot, 'AGENTS.md');
  const claudeMd = path.join(projectRoot, 'CLAUDE.md');

  // 동기화 잠금 파일 (무한 루프 방지)
  const lockFile = path.join(require('os').tmpdir(), '.agent-rules-sync.lock');

  // 잠금 파일이 있으면 종료
  if (fs.existsSync(lockFile)) {
    process.exit(0);
  }

  // AGENTS.md가 수정된 경우
  if (filePath === agentsMd) {
    if (fs.existsSync(agentsMd) && fs.existsSync(claudeMd)) {
      fs.writeFileSync(lockFile, '');
      fs.copyFileSync(agentsMd, claudeMd);
      fs.unlinkSync(lockFile);
      console.log('Synced: AGENTS.md -> CLAUDE.md');
    }
  }

  // CLAUDE.md가 수정된 경우
  if (filePath === claudeMd) {
    if (fs.existsSync(agentsMd) && fs.existsSync(claudeMd)) {
      fs.writeFileSync(lockFile, '');
      fs.copyFileSync(claudeMd, agentsMd);
      fs.unlinkSync(lockFile);
      console.log('Synced: CLAUDE.md -> AGENTS.md');
    }
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
