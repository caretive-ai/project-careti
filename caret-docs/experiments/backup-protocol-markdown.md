You are following the backup protocol for Cline original file modifications.

<detailed_sequence_of_steps>
# Backup Protocol - Cline File Safety

## Core Principle
**Never modify Cline original files without backup + comment**

## Pre-Modification Checklist
- [ ] Is this a Cline original file? (src/, webview-ui/, proto/, scripts/, evals/, docs/, locales/, configs/)
- [ ] Does .cline backup already exist? `ls filename.ext.cline`
- [ ] If exists: **NEVER overwrite** existing .cline backup

## Backup Creation
```bash
# Format: {filename-extension}.cline
cp original.ts original.ts.cline
cp package.json package.json.cline
cp README.md README.md.cline
```

## Modification Rules
1. **Add comment**: `// CARET MODIFICATION: [clear description]`
2. **Keep minimal**: Maximum 1-3 lines per file
3. **Complete replacement**: Never comment out old code
4. **Immediate verification**: `npm run compile` after change

## Verification Steps
- [ ] Backup exists and contains original content
- [ ] CARET MODIFICATION comment present
- [ ] Code compiles successfully
- [ ] Modification is minimal and focused

## Recovery Process
```bash
# If something goes wrong
cp filename.ext.cline filename.ext
```

## Related Workflows
- Use with `/modification-levels` for L2/L3 decisions
- Use with `/comment-protocol` for proper marking
- Use with `/verification-steps` for post-change testing
</detailed_sequence_of_steps>

<general_guidelines>
This protocol ensures safe modification of Cline original files while maintaining ability to merge upstream changes.

The .cline backup format allows easy identification and recovery of original content.

Never skip backup - it prevents merge conflicts and enables safe experimentation.
</general_guidelines>