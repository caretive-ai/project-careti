# 화이트 라벨링에 대한 피드백
 * 피드백 URL : https://docs.slexn.com/s/ea9b344e-d1a6-459d-92e6-0721561e3501


## 2. 작업공간 규칙과 워크플로우 화이트 라벨링
 * 범위 : 코드센터 화이트 라벨링
 * 현상 : 작업공간 규칙/워크플로우를 만들면 .caretrules 아래 생성됩니다.
          또한 현재 규칙은 .caretrules에 만들어지는데 인식은 안 되고 있습니다.
 * 기대값 : .caretrules가 아니라 .codecenterrules 에 정상적으로 생성되고 인식도  위치에서 되야함

## 8. 챗봇 모드에서 경고 메시지 화이트라벨링 -> 재현이 어려워 확인은 못했으나 코드 확인은 했음. 테스트 코드로 테스트 해보길 희망함
  * 범위 : 캐럿, 코드센터 화이트라벨링
  * 문구 : Cline uses complex prompts and iterative -> Caret uses complex prompts and iterative -> CodeCenter uses complex prompts and iterative
  * **원인**: locale 파일에 "Caret" 하드코딩되어 동적 브랜딩 미적용
  * **수정 내용**:
    - `webview-ui/src/caret/locale/en/common.json` (line 533):
      - `"Caret uses complex prompts"` → `"{{brandName}} uses complex prompts"`
    - `webview-ui/src/caret/locale/en/settings.json` (6곳):
      - `noteText`, `noteBody`, `apiKeyHelpText`에서 모두 `{{brandName}}` 플레이스홀더 사용
      - lines 563, 645, 901, 947, 971, 986
  * **백엔드 주석 추가**: `src/core/task/index.ts` (line 1682):
    - CARET MODIFICATION 주석 추가: "Use dynamic brand name instead of hardcoded Cline"
    - `getCurrentBrandName()` 함수로 동적 브랜딩 적용됨


---

## 2025-11-03 작업 세션 2: Issue #2, #3, #5, #7 재작업

### 현재 상태 (11월 3일 오후)

**Git 상태**: 
- 마지막 커밋: `84661f61 feat: Apply dynamic brandName with Korean particle handling to all locales`
- 현재 브랜치: `main`
- Working directory: **CLEAN** ✅ (코드센터 상태를 커밋하지 않음)
- package.json: `name: "caret"`, `displayName: "Caret"` ✅

**완료된 작업**:

#### 1. Issue #7: 텔레메트리 배너 설정 페이지 숨김 ✅
- **파일**: `webview-ui/src/caret/components/CaretGeneralSettingsSection.tsx:72`
- **수정 내용**: 
  ```tsx
  {featureConfig?.showTelemetryBanner !== false && (
    <div className="mb-[5px]">
      <VSCodeCheckbox ...>
        {t("telemetry.helpImprove", "common")}
      </VSCodeCheckbox>
      ...
    </div>
  )}
  ```
- **결과**: CodeCenter의 `feature-config.json`에서 `showTelemetryBanner: false`일 때 설정 페이지에서 텔레메트리 UI 숨김

#### 2. Issue #3: MCP 파일명 시스템 프롬프트 수정 ✅
- **파일**: `slexn-codecenter/brands/brand-config.json`
- **추가 내용**:
  ```json
  "file_paths": {
    "src/core/controller/mcp/downloadMcp.ts": "downloadMcp_ts"
  },
  "brand_mappings": {
    "downloadMcp_ts": {
      "cline_mcp_settings.json": "codecenter_mcp_settings.json",
      "caret_mcp_settings.json": "codecenter_mcp_settings.json"
    }
  }
  ```
- **결과**: AI 시스템 프롬프트에서 `caret_mcp_settings.json` → `codecenter_mcp_settings.json` 자동 변환

#### 3. Issue #5: 한글 조사 파싱 - i18n.ts 수정 완료 ✅
- **파일**: `webview-ui/src/caret/utils/i18n.ts:327-375`
- **수정 내용**:
  - `{{brandName|이}}` shorthand 지원 추가
  - `brandName` → `brand.appName` 자동 매핑
  - 한글 조사 처리: 이/가, 을/를, 은/는
- **결과**: "{{brandName|이}} 이 파일을 읽으려고 합니다" → "코드센터가 이 파일을 읽으려고 합니다"

#### 4. brand-config.json에 brand.appName 변환 규칙 추가 ✅
- **파일**: `slexn-codecenter/brands/brand-config.json`
- **추가 내용**:
  ```json
  "file_paths": {
    "webview-ui/src/caret/locale/ko/common.json": "common_ko_json",
    "webview-ui/src/caret/locale/en/common.json": "common_en_json",
    "webview-ui/src/caret/locale/ja/common.json": "common_ja_json",
    "webview-ui/src/caret/locale/zh/common.json": "common_zh_json"
  },
  "brand_mappings": {
    "common_ko_json": { "\"appName\": \"캐럿\"": "\"appName\": \"코드센터\"" },
    "common_en_json": { "\"appName\": \"Caret\"": "\"appName\": \"CodeCenter\"" },
    "common_ja_json": { "\"appName\": \"キャレット\"": "\"appName\": \"コードセンター\"" },
    "common_zh_json": { "\"appName\": \"Caret\"": "\"appName\": \"代码中心\"" }
  }
  ```

### 남은 작업 (집에서 할 것)

#### STEP 1: Caret 소스에 brand.appName 추가
**목표**: 각 언어별 common.json에 brand 섹션 추가

```bash
# 4개 파일 수정 필요
webview-ui/src/caret/locale/ko/common.json
webview-ui/src/caret/locale/en/common.json
webview-ui/src/caret/locale/ja/common.json
webview-ui/src/caret/locale/zh/common.json
```

**추가할 내용** (각 파일 첫 줄에 추가):
```json
{
  "brand": {
    "appName": "캐럿"  // ko: 캐럿, en: Caret, ja: キャレット, zh: Caret
  },
  "button": {
    ...
```

**편집 명령어**:
```bash
# 한국어
jq '. = {brand: {appName: "캐럿"}} + .' webview-ui/src/caret/locale/ko/common.json > tmp.json && mv tmp.json webview-ui/src/caret/locale/ko/common.json

# 영어
jq '. = {brand: {appName: "Caret"}} + .' webview-ui/src/caret/locale/en/common.json > tmp.json && mv tmp.json webview-ui/src/caret/locale/en/common.json

# 일본어
jq '. = {brand: {appName: "キャレット"}} + .' webview-ui/src/caret/locale/ja/common.json > tmp.json && mv tmp.json webview-ui/src/caret/locale/ja/common.json

# 중국어
jq '. = {brand: {appName: "Caret"}} + .' webview-ui/src/caret/locale/zh/common.json > tmp.json && mv tmp.json webview-ui/src/caret/locale/zh/common.json
```

#### STEP 2: 빌드 및 검증
```bash
npm run compile
```
- 타입 체크, 린트, 빌드 모두 통과 확인

#### STEP 3: 커밋 & 푸시
```bash
git add -A
git commit -m "feat: Add brand.appName to i18n for dynamic Korean particle handling

Issue #5 fix: {{brandName|이}} now properly resolves to brand name with correct particles

Changes:
- Added brand.appName to all 4 locale common.json files (ko/en/ja/zh)
- Added brand-config.json rules to convert brand.appName across locales
- Korean: 캐럿 → 코드센터
- English: Caret → CodeCenter  
- Japanese: キャレット → コードセンター
- Chinese: Caret → 代码中心

Technical details:
- i18n.ts already supports {{brandName|이}} shorthand (maps to brand.appName)
- Korean particle system will correctly display \"코드센터가\" instead of \"{{brandName|이}}\"
- Supports all Korean particles: 이/가, 을/를, 은/는

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

#### STEP 4: CodeCenter로 변환 및 테스트
```bash
# CodeCenter 변환
node slexn-codecenter/tools/brand-converter.js codecenter

# 변환 결과 검증
jq -r '.name, .displayName' package.json
# 예상 출력: codecenter, CodeCenter

jq '.brand.appName' webview-ui/src/caret/locale/ko/common.json
# 예상 출력: "코드센터"

jq '.brand.appName' webview-ui/src/caret/locale/en/common.json
# 예상 출력: "CodeCenter"

# VS Code 확장 테스트
code --extensionDevelopmentPath=/var/home/luke/dev/caret-slexn-whitelabeling
```

#### STEP 5: 최종 검증 (VS Code 확장에서)
1. **Issue #2**: 작업공간에서 `.codecenterrules` 표시 확인
2. **Issue #3**: MCP 서버 추가 시 `codecenter_mcp_settings.json` 언급 확인
3. **Issue #5**: 한국어 UI에서 "코드센터가 이 파일을 읽으려고 합니다" 확인 ({{brandName|이}} 대신)
4. **Issue #7**: 설정 → 일반 탭에서 텔레메트리 배너 숨김 확인

### 주의사항
- **중요**: Caret 소스 수정 → 커밋 → CodeCenter 변환 순서 엄수
- CodeCenter 상태에서 Caret 소스 수정 금지 (rollback 후 작업)
- brand-config.json은 이미 수정 완료되어 있음
- i18n.ts는 이미 수정 완료되어 있음

### 예상 결과
- Issue #2, #3, #5, #7 모두 해결 ✅
- `{{brandName|이}}` 템플릿이 정상적으로 "코드센터가"로 표시됨
- 브랜드 전환 시 모든 언어의 brand.appName이 자동 변환됨
