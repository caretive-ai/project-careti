# t00 - 빌드 에러 해결

## 🎯 목적
TypeScript 컴파일 에러들을 해결하여 정상적인 빌드 환경 구성

## 🔧 해결된 빌드 에러들

### 1. src/core/api/providers/vscode-lm.ts (TS6200)
- **에러**: VSCode 타입 정의 충돌 (User, Assistant, LanguageModelTextPart 등)
- **해결**: 중앙화된 타입 정의 파일로 분리
- **주석**: CLINE BUG FIX

### 2. src/integrations/terminal/TerminalManager.ts (TS2687, TS2717)
- **에러**: shellIntegration 프로퍼티 타입 불일치
- **해결**: 중앙 타입 정의 참조로 통일
- **주석**: CLINE BUG FIX

### 3. src/integrations/terminal/TerminalProcess.test.ts
- **에러**: 동일한 shellIntegration 타입 충돌
- **해결**: 중앙 타입 정의 참조로 수정
- **주석**: CLINE BUG FIX

### 4. src/services/mcp/McpHub.ts (TS2322)
- **에러**: Zod 스키마와 실제 타입 불일치
- **해결**: 타입 캐스팅으로 스키마 호환성 확보
- **주석**: CLINE BUG FIX

### 5. src/standalone/vscode-context.ts (TS2741)
- **에러**: ExtensionContext에서 'languageModelAccessInformation' 프로퍼티 누락
- **해결**: 선택적 프로퍼티로 추가
- **주석**: CLINE BUG FIX

### 6. webview-ui/src/careti/utils/CaretWebviewLogger.ts
- **에러**: webview 메시지 타입 제한
- **해결**: acquireVsCodeApi 타입 확장으로 postMessage 허용

## 🏗️ 핵심 해결책: 중앙화된 타입 정의

**생성 파일**: `src/types/vscode-extensions.d.ts`
```typescript
declare module "vscode" {
    enum LanguageModelChatMessageRole {
        User = 1,
        Assistant = 2,
    }
    interface Terminal {
        shellIntegration?: {
            cwd?: vscode.Uri
            executeCommand?: (command: string) => {
                read: () => AsyncIterable<string>
            }
        }
    }
    interface Window {
        onDidStartTerminalShellExecution?: (
            listener: (e: any) => any,
            thisArgs?: any,
            disposables?: vscode.Disposable[],
        ) => vscode.Disposable
    }
}
```

## ✅ 최종 결과

- **타입 체킹**: `npm run check-types` 완전 통과
- **린팅**: `npm run lint` 성공 (biome 설정 최적화)
- **번들링**: `npm run compile` 성공

**빌드 에러 해결 100% 완료! 🎉**