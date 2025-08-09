#!/usr/bin/env pwsh
Write-Host "🔄 Rolling back webview separation..." -ForegroundColor Yellow

# 1. 이전 브랜치로 복귀
Write-Host "Switching to backup branch..." -ForegroundColor Cyan
git checkout backup-before-webview-separation

# 2. caret-webview-ui 삭제
Write-Host "Removing caret-webview-ui directory..." -ForegroundColor Cyan
if (Test-Path "caret-webview-ui") {
    Remove-Item -Path "caret-webview-ui" -Recurse -Force
}

# 3. 변경된 파일들 복구
Write-Host "Restoring modified files..." -ForegroundColor Cyan
git checkout HEAD -- package.json
git checkout HEAD -- .gitignore
git checkout HEAD -- .gitattributes
git checkout HEAD -- caret-src/
git checkout HEAD -- scripts/
git checkout HEAD -- tsconfig.json
git checkout HEAD -- vitest.config.ts

Write-Host "✅ Rollback completed" -ForegroundColor Green
