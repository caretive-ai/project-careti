# Build System Rules

## Dependency Installation

### Package Manager
This project supports both **npm** and **pnpm**. Use standard `npm install` without additional flags.

### Platform-specific Dependencies (hwpjs)
HWP document parsing packages are in `optionalDependencies`:
```json
"optionalDependencies": {
  "@ohah/hwpjs-darwin-arm64": "...",
  "@ohah/hwpjs-darwin-x64": "...",
  "@ohah/hwpjs-linux-x64-gnu": "...",
  "@ohah/hwpjs-wasm32-wasi": "...",
  "@ohah/hwpjs-win32-x64-msvc": "..."
}
```

This allows `npm install` to skip incompatible platform binaries without errors.

### Installation Commands
```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Backend only
npm install

# Frontend only
cd webview-ui && npm install
```

## Build Architecture

### Core Principle: Separation of Concerns

**TypeScript (tsc)**: Type checking ONLY - No .js file generation
**esbuild**: Bundling and compilation - Single `dist/extension.js` output

### Critical Configuration

#### tsconfig.json
```json
{
  "compilerOptions": {
    "noEmit": true,  // ✅ CRITICAL: Prevents .js file generation
    "sourceMap": true,
    "rootDir": ".",
    // ... other options
  }
}
```

**Why `noEmit: true`?**
- TypeScript must NEVER generate .js files in source directories
- Only esbuild should create output files (dist/extension.js)
- Prevents old .js files from being loaded instead of bundled code

### Build Scripts

```json
{
  "compile": "GOPATH= npm run check-types:backend && npm run lint && node esbuild.mjs",
  "check-types": "npm run check-types:backend && npm run check-types:frontend",
  "check-types:backend": "npm run protos && npx tsc --noEmit",
  "check-types:frontend": "cd webview-ui && npx tsc -b --noEmit",
  "watch:tsc": "tsc --noEmit --watch --project tsconfig.json"
}
```

**Important**:
- `tsc` runs for type checking only (noEmit in tsconfig.json and/or CLI flags)
- esbuild.mjs handles all bundling

## Protected Directories

### Source Directories (NO .js files allowed)
- `src/**/*.js` - FORBIDDEN
- `src/**/*.js.map` - FORBIDDEN
- `careti-src/**/*.js` - FORBIDDEN
- `careti-src/**/*.js.map` - FORBIDDEN

### Build Output (ONLY .js files allowed)
- `dist/` - esbuild output
- `dist-standalone/` - standalone build
- `webview-ui/build/` - Vite output

## Development Rules

### Pre-Development Checklist
1. **Verify no stray .js files**: 
   ```bash
   find src careti-src -name "*.js" -o -name "*.js.map"
   # Should return nothing
   ```

2. **Clean build**:
   ```bash
   npm run clean:build
   npm run compile
   ```

3. **Verify output**:
   ```bash
   ls -la dist/extension.js  # Should exist
   find careti-src -name "*.js"  # Should be empty
   ```

### Common Issues

#### Issue: Changes not reflected after `npm run compile`
**Cause**: Old .js files in source directories being loaded
**Solution**:
```bash
# Delete all .js files in source directories
find src careti-src -name "*.js" -o -name "*.js.map" | xargs rm -f

# Reload VS Code
# Developer: Reload Window (Cmd+Shift+P)
```

#### Issue: TypeScript errors but build succeeds
**Cause**: noEmit:true in tsconfig.json - tsc only checks types
**Solution**: This is expected behavior. Fix TypeScript errors.

### Verification Commands

```bash
# Type check only (no output)
npm run check-types

# Full build (type check + lint + bundle)
npm run compile

# Verify no .js files in source
find src careti-src -name "*.js" -o -name "*.js.map"
```

## File Modification Protocol

### When modifying tsconfig.json
1. ✅ Ensure `noEmit: true` is ALWAYS present
2. ✅ Test: `tsc` should not create .js files
3. ✅ Verify: `npm run compile` still works

### When modifying esbuild.mjs
1. ✅ Test bundling: `node esbuild.mjs`
2. ✅ Verify output: `dist/extension.js` exists
3. ✅ Test in VSCode: F5 (Run Extension)

### When modifying package.json scripts
1. ✅ Ensure TypeScript does not emit JS into source directories (`src/`, `careti-src/`)
2. ✅ Keep separation: tsc for type-checking, esbuild for bundling
3. ✅ Test full build: `npm run compile`

## Integration with Development Workflow

### TDD Workflow
```bash
# 1. Write test
npm run test:webview

# 2. Implement
# (edit TypeScript files)

# 3. Type check
npm run check-types

# 4. Build
npm run compile

# 5. Test
npm run test:webview
```

### Watch Mode Development
```bash
# Terminal 1: Type checking
npm run watch:tsc

# Terminal 2: Build watching
npm run watch
```

## Package & Release

### Package Commands

```bash
# Development package (root directory, no timestamp)
npm run package

# Release package (output/ directory, with timestamp)
npm run package:release
# Output: output/careti-{version}-{YYYYMMDDHHMM}.vsix
# Example: output/careti-0.4.7-202601221424.vsix
```

### Release Workflow
```bash
# 1. Type check and build
npm run compile

# 2. Create release package
npm run package:release

# 3. Verify output
ls -la output/*.vsix
```

**Important**:
- `npm run package` - 개발용, 루트 디렉토리에 생성
- `npm run package:release` - 릴리즈용, output/ 폴더에 타임스탬프 포함하여 생성

## Reference Documents

- **Problem Analysis**: `careti-docs/work-logs/alpha/2025-10-16-js-file-generation-issue.md`
- **Improvement Plan**: `careti-docs/work-logs/alpha/2025-10-16-build-script-improvements.md`
- **Build Commands**: `careti-docs/development/build-and-test.md`
- **Developer Dashboard**: `careti-docs/development/index.md`
