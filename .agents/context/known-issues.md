# Known Issues

## Active Issues

(None currently)

---

## Fixed Issues

### Provider Selection Bug - Standalone Mode (2026-01-29)
**Status**: ✅ Fixed
**Symptom**: Selecting any provider (e.g., Upstage, Gemini) results in UI showing "Anthropic"

**Root Cause**:
In standalone/Tauri mode, the stdio-adapter passes raw JSON objects to handlers.
The JSON contains string enum values (e.g., `"UPSTAGE"`) but the handler expected
numeric proto enum values (e.g., `40`). The `convertProtoToApiProvider` function's
switch statement didn't match string values, falling through to `default: return "anthropic"`.

**Fix** (in `updateApiConfigurationProto.ts`):
```typescript
// Detect JSON format (standalone mode) and normalize to proto format
if (typeof request.apiConfiguration?.planModeApiProvider === "string" ||
    typeof request.apiConfiguration?.actModeApiProvider === "string") {
    normalizedRequest = UpdateApiConfigurationRequest.fromJSON(request)
} else {
    normalizedRequest = request
}
```

**Test Coverage**:
- `api-config-json-normalization.test.ts` - Tests JSON → Proto enum conversion
- `api-provider-conversion.test.ts` - Tests Proto roundtrip conversion

---

### typeConversion.ts .length Error (2026-01-29)
**Fix**: Added optional chaining (`?.`) to 4 instances in `typeConversion.ts`
```typescript
// Before
outputPriceTiers: protoConfig.outputPriceTiers.length > 0
// After
outputPriceTiers: protoConfig.outputPriceTiers?.length > 0
```

### Mode Mapping Missing (2026-01-29)
**Fix**: Added Careti mode mapping to `providerUtils.ts`
```typescript
const modeMapping: Record<string, "plan" | "act"> = {
    chatbot: "plan",
    agent: "act",
    plan: "plan",
    act: "act",
}
```
