# Cline Webview-UI 변경사항 (v3.32.7 → v3.34.0)

**날짜**: 2025-10-27
**분석 기준**: Caret 머징 커밋 `03177da87` (v3.32.7) 이후 Cline 변경사항
**총 변경 파일**: **47개**
**총 커밋 수**: 33개

---

## 📊 카테고리별 분류

### 1. Chat 컴포넌트 (15개) - 🔴 핵심 변경

**Main Components** (9개):
```
webview-ui/src/components/chat/
├── Announcement.tsx                          # 공지사항
├── BrowserSessionRow.tsx                     # 브라우저 세션 표시 (#7106 버그 수정)
├── ChatRow.tsx                               # 채팅 행 (Subagent UI 추가)
├── ErrorBlockTitle.tsx                       # 에러 제목
├── ErrorRow.test.tsx                         # 에러 행 테스트
├── ErrorRow.tsx                              # 에러 행
└── task-header/
    └── TaskHeader.tsx                        # ⭐ Expandable 디자인 (#6966)
```

**Chat View** (5개):
```
webview-ui/src/components/chat/chat-view/
├── components/
│   ├── layout/WelcomeSection.tsx             # 환영 섹션
│   └── messages/MessageRenderer.tsx          # 메시지 렌더러
├── hooks/
│   └── useMessageHandlers.ts                 # 메시지 핸들러
└── utils/
    └── messageUtils.ts                       # 메시지 유틸
```

**Auto Approve** (1개):
```
webview-ui/src/components/chat/auto-approve-menu/
└── AutoApproveSettingsAPI.ts                 # Auto approve 설정 API
```

---

### 2. Settings 컴포넌트 (20개) - 🔴 핵심 변경

**Main Settings** (6개):
```
webview-ui/src/components/settings/
├── ApiOptions.tsx                            # API 옵션
├── SettingsView.tsx                          # 설정 뷰
├── SubagentOutputLineLimitSlider.tsx         # ⭐ Subagent 출력 제한
├── BasetenModelPicker.tsx                    # Baseten 모델
├── GroqModelPicker.tsx                       # Groq 모델
└── OpenRouterModelPicker.tsx                 # OpenRouter 프리셋 (#7083)
```

**Providers** (8개):
```
webview-ui/src/components/settings/providers/
├── AnthropicProvider.tsx                     # Claude Haiku 4.5 (#6889)
├── AskSageProvider.tsx                       # AskSage
├── BedrockProvider.tsx                       # AWS SE regions (#6990)
├── DifyProvider.tsx                          # Dify.ai
├── LiteLlmProvider.tsx                       # LiteLLM
├── OpenAICompatible.tsx                      # OpenAI 호환
├── RequestyProvider.tsx                      # Requesty base URL (#6804)
├── VercelAIGatewayProvider.tsx               # Vercel AI Gateway
└── VertexProvider.tsx                        # Vertex Claude Sonnet 4 (#6904)
```

**Sections** (3개):
```
webview-ui/src/components/settings/sections/
├── FeatureSettingsSection.tsx                # ⭐ Subagent 토글, 텔레메트리
├── GeneralSettingsSection.tsx                # 일반 설정
└── TerminalSettingsSection.tsx               # ⭐ Terminal 백그라운드 실행
```

**Common** (2개):
```
webview-ui/src/components/settings/common/
├── BaseUrlField.tsx                          # Base URL 필드
└── DebouncedTextField.tsx                    # Debounced 텍스트 필드
```

---

### 3. Common 컴포넌트 (3개)

```
webview-ui/src/components/common/
├── CliInstallBanner.tsx                      # ⭐ CLI 설치 배너 (#6782)
├── CodeBlock.tsx                             # 코드 블록
└── NewModelBanner.tsx                        # 새 모델 배너
```

---

### 4. Welcome & History (3개)

```
webview-ui/src/components/
├── welcome/
│   └── HomeHeader.tsx                        # 홈 헤더
└── history/
    └── HistoryView.tsx                       # 히스토리 뷰
```

---

### 5. Account (2개)

```
webview-ui/src/components/account/
├── AccountView.tsx                           # 계정 뷰
└── AccountWelcomeView.tsx                    # 환영 뷰
```

---

### 6. MCP (1개)

```
webview-ui/src/components/mcp/configuration/
└── McpConfigurationView.tsx                  # MCP 설정 뷰
```

---

### 7. Utils & Assets (7개)

**Utils** (5개):
```
webview-ui/src/utils/
├── environmentColors.ts                      # ⭐ 환경별 색상 (#6777, #6621)
├── platformUtils.ts                          # 플랫폼 유틸
├── slash-commands.ts                         # 슬래시 명령
└── validate.ts                               # 검증
```

**Context** (1개):
```
webview-ui/src/context/
└── ExtensionStateContext.tsx                 # Extension 상태
```

**Assets** (1개):
```
webview-ui/src/assets/
└── ClineLogoVariable.tsx                     # ⭐ 환경별 로고 색상
```

**CSS** (1개):
```
webview-ui/src/index.css                      # 글로벌 CSS
```

---

## 🎯 주요 신규/변경 기능

### 1. ⭐ CLI & Subagent 시스템 (v3.33.0)

**Backend Integration**:
```
webview-ui/src/components/chat/ChatRow.tsx
└── Subagent 명령 감지 및 UI 표시

webview-ui/src/components/settings/SubagentOutputLineLimitSlider.tsx
└── Subagent 전용 출력 제한 (2000줄) 슬라이더

webview-ui/src/components/settings/sections/FeatureSettingsSection.tsx
└── Subagent 활성화 토글

webview-ui/src/components/common/CliInstallBanner.tsx
└── CLI 설치 안내 배너 (#6782)
```

**관련 커밋**:
- `9a7c6ed20` CLI Subagents - settings & telemetry framework (#6888)
- `b351a8b92` feat: add banner to install Cline for CLI and experimental subagents feature (#6782)
- `bddbea04e` fix: Disable subagents for jetbrains (#6933)
- `c5f12b8dc` Fixing banner to not show CLI release for windows users (#6942)

---

### 2. ⭐ Terminal Background Process (v3.33.0)

```
webview-ui/src/components/settings/sections/TerminalSettingsSection.tsx
└── Terminal background execution mode 설정

webview-ui/src/components/chat/task-header/TaskHeader.tsx
└── 백그라운드 실행 상태 표시
```

**관련 커밋**:
- `4d525e065` Adding Terminal background process (#6598)
- `2ed5ce9b1` fix: new terminal design showing incorrect states when running in background

---

### 3. ⭐ Task Header Redesign (v3.33.0)

```
webview-ui/src/components/chat/task-header/TaskHeader.tsx
└── Expandable long task header (#6966)
```

**변경사항**:
- 긴 Task Header를 접을 수 있는 expandable 디자인
- 공간 절약 및 UX 개선
- 기본적으로 expanded state 스타일 사용

---

### 4. ⭐ Environment-based Visual Indicators (v3.33.0)

```
webview-ui/src/utils/environmentColors.ts                # 신규
webview-ui/src/assets/ClineLogoVariable.tsx
└── Environment 기반 색상 표시
   - Local: yellow/orange (개발)
   - Staging: blue (스테이징)
```

**관련 커밋**:
- `663e75203` feat: add environment-based visual indicators to UI (#6777)
- `0c0ba93a4` feat(config): add runtime environment switching support (#6621)

---

### 5. Browser Session 개선

```
webview-ui/src/components/chat/BrowserSessionRow.tsx
└── error_retry 메시지 처리 개선 (#7106)
```

**관련 커밋**:
- `604dbd7bb` fix: error_retry message breaking browser session row flow (#7106)

---

### 6. Auto Approve System 개선

```
webview-ui/src/components/chat/auto-approve-menu/AutoApproveSettingsAPI.ts
└── Auto approval settings 부분 업데이트
```

**관련 커밋**:
- `0d9909c80` partially update autoApprovalSettings (#6929)

---

### 7. 새 Provider 업데이트

**신규 Provider**:
```
webview-ui/src/components/settings/providers/
├── AskSageProvider.tsx                       # AskSage (신규)
└── DifyProvider.tsx                          # Dify.ai (신규)
```

**업데이트된 Provider**:
```
├── AnthropicProvider.tsx                     # Claude Haiku 4.5 지원 (#6889)
├── BedrockProvider.tsx                       # 새 AWS SE 리전 (#6990)
├── VertexProvider.tsx                        # Claude Sonnet 4 버그 수정 (#6904)
├── RequestyProvider.tsx                      # Base URL 체크박스 수정 (#6804)
└── LiteLlmProvider.tsx                       # reasoning_details 통합 (#6772)
```

---

### 8. OpenRouter 개선

```
webview-ui/src/components/settings/OpenRouterModelPicker.tsx
└── Presets entry 지원 (#7083)
```

**관련 커밋**:
- `535b29f46` Support OpenRouter presets entry (#7083)
- `65dbd85a9` Updating trending model list (#7018)

---

## 📈 버전별 변경 통계

| 버전 | 커밋 수 | 주요 변경 |
|------|---------|----------|
| **v3.32.7 → v3.33.0** | 17 | CLI/Subagent, Terminal Background, Task Header Redesign |
| **v3.33.0 → v3.33.1** | - | 버그 수정 |
| **v3.33.1 → v3.33.2** | - | 버그 수정 |
| **v3.33.2 → v3.34.0** | 16 | Browser, OpenRouter, Provider 업데이트 |
| **총계** | 33 | 47개 파일 변경 |

---

## 💥 Caret i18n과 충돌 예상 영역

### 🔴 높은 충돌 위험 (5개)

1. **ChatRow.tsx**
   - Cline: Subagent UI 추가
   - Caret: i18n 적용
   - 예상 충돌: 높음 (UI 텍스트)

2. **SettingsView.tsx**
   - Cline: Feature flags, Subagent 설정
   - Caret: i18n 적용
   - 예상 충돌: 높음 (설정 텍스트)

3. **FeatureSettingsSection.tsx**
   - Cline: Subagent 토글, 텔레메트리
   - Caret: i18n 적용
   - 예상 충돌: 높음 (설정 레이블)

4. **TerminalSettingsSection.tsx**
   - Cline: Background execution mode
   - Caret: i18n 적용
   - 예상 충돌: 중간 (새 설정 항목)

5. **TaskHeader.tsx**
   - Cline: Expandable 디자인 변경
   - Caret: i18n 적용
   - 예상 충돌: 중간 (UI 재작성)

---

### 🟡 중간 충돌 위험 (8개)

**Provider 컴포넌트들**:
- AnthropicProvider.tsx (Claude Haiku 4.5)
- BedrockProvider.tsx (AWS 리전)
- VertexProvider.tsx (Claude Sonnet 4)
- RequestyProvider.tsx (Base URL)
- LiteLlmProvider.tsx (reasoning_details)
- AskSageProvider.tsx (신규)
- DifyProvider.tsx (신규)
- VercelAIGatewayProvider.tsx

**예상 충돌**: 모델 이름, 설명 텍스트

---

### ✅ 낮은 충돌 위험 (34개)

**신규 파일**:
- CliInstallBanner.tsx (신규 - Caret에 없음)
- SubagentOutputLineLimitSlider.tsx (신규 - Caret에 없음)
- environmentColors.ts (신규 - Caret에 없음)

**유틸/컨텍스트**:
- ExtensionStateContext.tsx
- platformUtils.ts
- validate.ts
- slash-commands.ts

**기타 컴포넌트**: 대부분 마이너 업데이트

---

## 🎯 머징 전략 권장사항

### Option 1: 전체 머징 (추천 ❌)
**예상 시간**: 5-7시간
- 47개 파일 충돌 해결
- i18n 재적용
- 테스트 필수

**장점**: 모든 Cline 업데이트 반영
**단점**: 시간 소모, i18n 재작업 대량

---

### Option 2: 선택적 복사 (추천 ✅)

**우선순위 1: 신규 파일 복사 (1시간)**
```bash
# Cline에만 있는 신규 파일 복사
cp cline-latest/webview-ui/src/components/common/CliInstallBanner.tsx \
   webview-ui/src/components/common/

cp cline-latest/webview-ui/src/components/settings/SubagentOutputLineLimitSlider.tsx \
   webview-ui/src/components/settings/

cp cline-latest/webview-ui/src/utils/environmentColors.ts \
   webview-ui/src/utils/
```

**우선순위 2: 핵심 기능 수동 병합 (2-3시간)**
- ChatRow.tsx - Subagent UI 로직만 추출
- FeatureSettingsSection.tsx - Subagent 토글만 추가
- TaskHeader.tsx - Expandable 로직만 반영

**우선순위 3: Provider 업데이트 (1시간)**
- 새 모델만 추가 (Claude Haiku 4.5, AWS 리전)
- 기존 i18n 유지

**총 예상 시간**: 4-5시간

---

### Option 3: 독립 구현 후 나중에 머징 (추천 ✅)

**현재 진행**:
1. Interactive Terminal 구현 (사용자 계획대로)
2. Cline Subagent 코드는 백엔드만 선택적 복사
3. 프론트는 당분간 머징 보류

**나중에 머징** (v0.4.0 또는 v0.5.0):
- Caret 기능 완성 후
- Cline v3.35.0+ 안정화 대기
- 한 번에 큰 머징

**장점**:
- 현재 작업 집중 가능
- Cline 더 안정화 대기
- 큰 버전업에서 한 번에 처리

---

## 📊 최종 통계

| 항목 | 수치 |
|------|------|
| **총 변경 파일** | 47개 |
| **총 커밋 수** | 33개 |
| **신규 파일** | 3개 |
| **고위험 충돌** | 5개 |
| **중위험 충돌** | 8개 |
| **저위험 충돌** | 34개 |

---

## 🎯 결론

**Cline Webview 변경사항**: 47개 파일 (앞서 259개는 오분석)

**주요 신규 기능**:
- CLI/Subagent 시스템 (v3.33.0)
- Terminal Background Process (v3.33.0)
- Task Header Redesign (v3.33.0)
- Environment-based UI (v3.33.0)

**머징 복잡도**: 🟡 중간
- 259개가 아닌 47개만 변경됨
- 신규 파일 3개는 충돌 없음
- 실제 충돌 위험: 13개 (5+8)

**권장사항**:
1. **즉시**: 신규 파일 3개 복사 (30분)
2. **단기**: 핵심 기능 선택적 병합 (2-3시간)
3. **장기**: 전체 머징은 v0.4.0+ 에서
