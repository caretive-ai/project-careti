#!/usr/bin/env node
/**
 * AGENTS.md <-> CLAUDE.md Sync Hook
 * Automatically syncs AGENTS.md and CLAUDE.md when either is edited
 * Cross-platform support (Windows, macOS, Linux)
 */

const fs = require('fs');
const path = require('path');

async function main() {
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

  if (toolName !== 'Edit' && toolName !== 'Write') {
    process.exit(0);
  }

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
  const lockFile = path.join(require('os').tmpdir(), '.agent-rules-sync.lock');

  if (fs.existsSync(lockFile)) {
    process.exit(0);
  }

  if (filePath === agentsMd && fs.existsSync(agentsMd) && fs.existsSync(claudeMd)) {
    fs.writeFileSync(lockFile, '');
    fs.copyFileSync(agentsMd, claudeMd);
    fs.unlinkSync(lockFile);
    console.log('Synced: AGENTS.md -> CLAUDE.md');
  }

  if (filePath === claudeMd && fs.existsSync(agentsMd) && fs.existsSync(claudeMd)) {
    fs.writeFileSync(lockFile, '');
    fs.copyFileSync(claudeMd, agentsMd);
    fs.unlinkSync(lockFile);
    console.log('Synced: CLAUDE.md -> AGENTS.md');
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
