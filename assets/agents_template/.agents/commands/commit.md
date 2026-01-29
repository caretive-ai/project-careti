---
description: Create a git commit with a well-structured message
argument-hint: "[commit message hint]"
---

# Commit Command

Create a git commit following project conventions.

## Workflow
1. Run `git status` to see changes
2. Run `git diff --staged` to review staged changes
3. If no staged changes, ask user what to stage
4. Generate commit message following conventional commits format
5. Create commit with generated message

## Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- feat: New feature
- fix: Bug fix
- docs: Documentation only
- style: Formatting, no code change
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance tasks

## Notes
- Always use conventional commits format
- Include scope when relevant
- Keep subject line under 72 characters
