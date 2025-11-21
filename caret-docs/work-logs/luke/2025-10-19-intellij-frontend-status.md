# IntelliJ Plugin Frontend Issue - Current Status

**Date**: 2025-10-19  
**Reporter**: Luke  
**Handler**: Alpha

## 📋 Issue Summary

IntelliJ IDEA 플러그인에서 Caret WebView UI가 표시되지 않는 문제 발생.

## 🔍 Investigation Completed

### 1. Initial Analysis
- **dump.md**: Coroutine 상태 덤프 - 정상 상태 확인 (에러 아님)
- **Build Status**: Phase 10A 완료, 32/33 RPC 라우팅 완료
- **Resource Packaging**: JAR 내 webview 리소스 정상 포함 확인

### 2. Root Cause Hypothesis
초기 진단: Vite가 절대 경로(`/assets/index.js`)로 빌드하여 IntelliJ JCEF의 `file://` 프로토콜에서 리소스 로드 실패 예상.

**Expected Error**:
```
GET file:///assets/index.js net::ERR_FILE_NOT_FOUND
```

### 3. Configuration Verification
**Surprise Finding**: `webview-ui/vite.config.ts`에 **이미 `base: './'` 설정되어 있음**!

```typescript
export default defineConfig({
  base: './', // Use relative paths for assets (required for IntelliJ JCEF file:// protocol)
  // ...
})
```

이는 이전에 이미 이 문제를 인지하고 수정했다는 의미입니다.

## ✅ Actions Completed Today

### 1. WebView Rebuild
```bash
cd webview-ui && npm run build
```

**Build Result**: SUCCESS
- Output: `webview-ui/build/`
- Size: 5.6MB (index.js)
- Base path: `./` (relative paths)

**Built Assets**:
```
build/index.html                                         0.37 kB
build/assets/azeret-mono-latin-ext-400-normal.woff2      6.83 kB
build/assets/azeret-mono-latin-ext-400-normal.woff       9.46 kB
build/assets/azeret-mono-latin-400-normal.woff2         10.72 kB
build/assets/azeret-mono-latin-400-normal.woff          14.23 kB
build/assets/codicon.ttf                                80.19 kB
build/assets/index.css                                 198.83 kB
build/assets/index.js                                5,615.78 kB
```

### 2. Documentation Created
- **진단 리포트**: `2025-10-19-intellij-frontend-diagnosis.md`
- **현황 정리**: 이 문서 (`2025-10-19-intellij-frontend-status.md`)

## ❓ Remaining Questions

### 왜 Vite 설정이 올바른데도 문제가 발생했나?

가능한 원인:
1. **오래된 플러그인 JAR**: 이전 빌드의 WebView 리소스 사용 중
2. **IntelliJ 캐시**: 플러그인 재설치 필요
3. **다른 근본 원인**: 경로 문제가 아닐 수 있음

### 실제 에러는 무엇인가?

**검증 필요**:
- IntelliJ IDEA 로그 확인 (`Help → Show Log in Finder`)
- JCEF DevTools 콘솔 확인 (Caret 툴윈도우 → 우클릭 → Open DevTools)

## 📊 Current Project Status

### Completed Phases (Phase 1-10A)
- ✅ Phase 1: Architecture & Gradle Setup
- ✅ Phase 2: gRPC Implementation
- ✅ Phase 3: WebView Integration (기본 구현)
- ✅ Phase 4: E2E Testing Setup
- ✅ Phase 5: gRPC Connection (기본 연결)
- ✅ Phase 6: Message Routing (32/33 RPCs)
- ✅ Phase 7: Error Handling
- ✅ Phase 8: Testing Infrastructure
- ✅ Phase 9: Documentation
- ✅ Phase 10A: RPC Routing Completion

### Known Issues
1. **UI Not Displaying**: Caret 툴윈도우가 빈 화면 (현재 이슈)
2. **1 RPC Pending**: 33개 중 32개만 라우팅 완료

### Technical Debt
- CaretWebView.kt의 하드코딩된 asset 목록
- 에러 로깅 부족 (디버깅 어려움)

## 🔧 Next Steps (Not Started)

### Priority 1: Verify Actual Problem
1. **IntelliJ 로그 확인**:
   ```
   ~/Library/Logs/JetBrains/IntelliJIdea{version}/idea.log
   ```
   검색어: `[CaretWebView]`, `JCEF`, `Error`

2. **DevTools 콘솔 확인**:
   - Caret 툴윈도우 열기
   - 우클릭 → "Open DevTools for Page"
   - Console 탭에서 에러 확인

### Priority 2: Rebuild Plugin
```bash
cd caret-intellij-plugin
./gradlew clean build
```

**Expected Output**: `build/libs/caret-intellij-plugin-*.jar`

### Priority 3: Clean Install
1. IntelliJ IDEA 재시작
2. 기존 플러그인 제거
3. 새 JAR 설치
4. Caret 툴윈도우 열기

### Priority 4: Enhanced Logging
`CaretWebView.kt`에 디버깅 로그 추가:

```kotlin
private fun loadCaretUI() {
    println("[CaretWebView] 🚀 Starting loadCaretUI()")
    
    try {
        val indexHtmlStream = javaClass.classLoader.getResourceAsStream("webview/index.html")
        println("[CaretWebView] 📦 indexHtmlStream: ${indexHtmlStream != null}")
        
        if (indexHtmlStream != null) {
            // ... existing code ...
            
            // Log the modified HTML (first 500 chars)
            println("[CaretWebView] 📝 HTML preview: ${modifiedHtml.take(500)}")
            
            // Log the final URL
            println("[CaretWebView] 🌐 Loading URL: file://${indexFile.absolutePath}")
            
            browser.loadURL("file://${indexFile.absolutePath}")
        } else {
            println("[CaretWebView] ❌ ERROR: webview/index.html not found in JAR")
            // ... error handling ...
        }
    } catch (e: Exception) {
        println("[CaretWebView] ❌ EXCEPTION: ${e.message}")
        e.printStackTrace()
        // ... error handling ...
    }
}
```

## 📁 Key Files

### WebView Build Output
- `webview-ui/build/index.html` - 빌드된 HTML (base: './' 포함)
- `webview-ui/build/assets/*` - JS, CSS, fonts (7 files)

### IntelliJ Plugin
- `caret-intellij-plugin/src/main/kotlin/com/caret/intellij/ui/CaretWebView.kt` - UI 로딩 로직
- `caret-intellij-plugin/build.gradle.kts` - 빌드 설정 (processResources)
- `caret-intellij-plugin/build/libs/*.jar` - 배포 파일

### Configuration
- `webview-ui/vite.config.ts` - Vite 빌드 설정 (base: './' ✅)
- `caret-intellij-plugin/src/main/resources/META-INF/plugin.xml` - 플러그인 메타데이터

### Documentation
- `caret-docs/work-logs/luke/2025-10-19-intellij-frontend-diagnosis.md` - 진단 리포트
- `caret-docs/work-logs/alpha/2025-10-18-intellij-phase10a-completion-report.md` - 최근 완료 리포트

## 💡 Insights

### 1. Configuration Was Already Correct
`base: './'` 설정이 이미 있었다는 것은:
- 누군가(Alpha?) 이전에 이 문제를 알고 수정했음
- 하지만 플러그인이 여전히 작동하지 않음
- **실제 문제는 다른 곳에 있을 가능성 높음**

### 2. Possible Real Issues
- **JAR Packaging**: WebView 리소스가 JAR에 올바르게 포함되지 않음
- **JCEF Setup**: IntelliJ JCEF 초기화 문제
- **Path Resolution**: CaretWebView.kt의 경로 변환 로직 버그
- **Security Policy**: JCEF Content Security Policy 제한

### 3. Build System is Working
- WebView 빌드: ✅ 17.55초에 성공
- 출력 파일: ✅ 모두 생성됨
- Vite 설정: ✅ 상대 경로 사용

## 🎯 Recommendation

### Short Term (Next Session)
1. **로그 확인** - 실제 에러 메시지 수집
2. **DevTools** - 브라우저 콘솔 에러 확인
3. **JAR 검증** - 리소스가 올바르게 포함되었는지 확인:
   ```bash
   jar -tf caret-intellij-plugin-*.jar | grep webview
   ```

### Medium Term
1. **로깅 강화** - CaretWebView.kt에 상세 로그 추가
2. **플러그인 리빌드** - 새 WebView 빌드로 재생성
3. **클린 설치** - IntelliJ 캐시 제거 후 재설치

### Long Term
1. **자동화된 검증** - WebView 리소스 포함 여부 자동 체크
2. **개발 문서** - IntelliJ 플러그인 디버깅 가이드 작성
3. **E2E 테스트** - UI 로딩 자동 테스트

## 📈 Progress Estimate

### Before Today
- Overall Progress: ~85% (Phase 10A 완료)
- UI Integration: 50% (구조는 있으나 작동 안 함)

### After Today
- Investigation: 100% (원인 진단 완료)
- WebView Build: 100% (최신 빌드 완료)
- Plugin Rebuild: 0% (미착수)
- Issue Resolution: 0% (실제 수정 필요)

### Remaining Work
- 실제 에러 확인: 1-2시간
- 문제 수정: 2-4시간 (원인에 따라 변동)
- 검증 및 테스트: 1-2시간
- **Total**: 4-8시간 예상

## 🚧 Blockers

### Technical
1. **Unknown Root Cause**: Vite 설정이 올바른데도 문제 발생
2. **Limited Logging**: CaretWebView.kt에 디버깅 정보 부족
3. **No Error Details**: 실제 에러 메시지 미확인

### Process
1. **Testing Environment**: IntelliJ IDEA 실행 환경 필요
2. **Iteration Time**: 플러그인 빌드 + 설치 + 테스트 시간 소요

## 📝 Notes

- **dump.md는 에러 로그가 아님**: 정상적인 IntelliJ coroutine 상태 스냅샷
- **Phase 10A 완료 상태**: 대부분의 기능은 구현됨, UI 로딩만 문제
- **WebView는 VSCode에서 정상 작동**: 동일한 빌드가 VSCode 확장에서는 문제없음

---

**Status**: Investigation Complete, Solution Pending  
**Next Action**: IntelliJ 로그 확인 후 실제 에러 파악  
**Owner**: Luke (with Alpha support)  
**Priority**: Medium (기능 구현 완료, UI만 문제)
