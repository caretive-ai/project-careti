# Build System Rules

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

## Reference Documents

- **Problem Analysis**: `careti-docs/work-logs/alpha/2025-10-16-js-file-generation-issue.md`
- **Improvement Plan**: `careti-docs/work-logs/alpha/2025-10-16-build-script-improvements.md`
- **Build Commands**: `careti-docs/development/build-and-test.md`
- **Developer Dashboard**: `careti-docs/development/index.md`
