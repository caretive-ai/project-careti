# Cline v3.37.1 2차 머지 계획 검토 및 분석

**작성일:** 2025-11-19
**검토자:** Claude (Anthropic AI Assistant)
**대상 문서:** `attempt-2-plan.md` (Codex/GPT-5 작성)
**목적:** 2차 시도의 타당성 평가 및 보완점 제시

---

## 📊 전체 평가

| 항목 | 점수 | 평가 |
|------|------|------|
| **전략 선택** | ⭐⭐⭐⭐⭐ | Excellent - Cline-Base 전략은 최선의 선택 |
| **구조화** | ⭐⭐⭐⭐ | Good - Phase별 분리 명확 |
| **실행 가능성** | ⭐⭐⭐ | Fair - 타임라인 낙관적, 세부 방법 불명확 |
| **리스크 관리** | ⭐⭐⭐⭐ | Good - 주요 리스크 식별됨 |
| **자동화 계획** | ⭐⭐⭐ | Fair - 스크립트 구체화 필요 |
| **검증 전략** | ⭐⭐⭐ | Fair - 기능 테스트 체크리스트 부족 |

**종합 평가:** ⭐⭐⭐⭐ (4/5) - **실행 가능하나 보완 필요**

---

## ✅ 타당성 분석 (What's Good)

### 1. 전략 선택: Cline-Base + Caret-Overlay ⭐⭐⭐⭐⭐

**평가:** 완벽한 선택입니다.

```
✅ Codex의 선택:
"Upstream 태그(cline/v3.37.1)를 그대로 가져와
 파일 누락을 허용하지 않는다"

✅ Claude의 권장 (merge-strategy-analysis):
"Cline 전체를 base로 (완전성 보장)"

→ 정확히 일치 👍
```

**왜 좋은가:**
- ✅ 1차 시도의 85% 누락 문제를 근본적으로 해결
- ✅ Cline의 모든 개선사항 자동 포함
- ✅ 정보 비대칭 문제를 "전부 가져오기"로 극복
- ✅ 검증 가능 (Cline 테스트 그대로 작동)

### 2. 변경 파일 매트릭스 작성 ⭐⭐⭐⭐

**평가:** 매우 좋은 접근입니다.

```
Phase A.3: 변경 파일 매트릭스
- Upstream-only (Cline만 변경)
- Caret-only (Caret 전용 파일)
- Both (양쪽 모두 변경)
```

**왜 좋은가:**
- ✅ 충돌 예측 가능
- ✅ 우선순위 설정 가능
- ✅ 작업 범위 명확화
- ✅ 1차 시도에서 배운 교훈 적용

**실제 효과 예상:**
```
Upstream-only (~350개): 자동 채택 ✅
Caret-only (~20개): 자동 복사 ✅
Both (~50개): 수동 머지 필요 ⚠️

→ 수동 작업을 50개로 축소 (90% 자동화)
```

### 3. Phase별 구조화 ⭐⭐⭐⭐

**평가:** 논리적이고 체계적입니다.

```
Phase A: 준비 (0.5-1일)
  → Phase B: 재적용 (2-3일)
    → Phase C: 검증 (2일)
      → Phase D: 자동화 (병행)
```

**강점:**
- ✅ 선형 의존성 명확 (A→B→C)
- ✅ Phase D 병행으로 효율 증대
- ✅ 각 Phase별 산출물 정의
- ✅ 체크포인트 설정

### 4. 누락 방지 자동화 ⭐⭐⭐⭐

**평가:** 1차 실패의 핵심 교훈을 반영했습니다.

```
Phase D.1: scripts/compare-with-cline.mjs
- git diff --name-status cline/v3.37.1..HEAD
- D(삭제) 발생 시 실패
- M(수정)/A(추가)만 허용
```

**왜 좋은가:**
- ✅ 파일 누락을 자동 탐지
- ✅ CI 통합 가능
- ✅ 실시간 검증
- ✅ 1차 시도의 348개 누락 방지

### 5. 리스크 관리 ⭐⭐⭐⭐

**평가:** 주요 리스크를 잘 식별했습니다.

| 리스크 | 완화 대책 | 평가 |
|--------|----------|------|
| 대규모 충돌 | git rerere, Phase별 커밋 | ✅ 적절 |
| Caret 자산 유실 | CARET MODIFICATION 탐색 | ✅ 적절 |
| 테스트 실패 | Node 20, 라이브러리 설치 | ✅ 적절 |
| 파일 누락 재발 | compare-with-cline 스크립트 | ✅ 적절 |

---

## ⚠️ 보완 필요 사항 (What Needs Improvement)

### 1. 타임라인 낙관적 ⭐⭐ (현실성 부족)

**문제:**
```
Codex 계획:
Phase A: 0.5-1일
Phase B: 2-3일
Phase C: 2일
────────────────
총: 4.5-6일
```

**현실적 예상:**
```
Phase A: 1-2일 (분석 + 매트릭스 작성)
Phase B: 5-7일 (50개 파일 수동 머지)
Phase C: 3-5일 (전체 테스트 + 버그 수정)
Phase D: 2-3일 (스크립트 개발)
────────────────────────────────────
총: 11-17일 (2-3배 더 소요)
```

**왜 더 오래 걸리는가:**

#### Phase B가 2-3일에 불가능한 이유:
```
Both 파일 예상: ~50개

1. Proto 파일 (16개)
   - 각 필드 충돌 해결
   - CARET 필드 복원
   - 번호 충돌 조정
   - 시간: 2-3일

2. Controller (20개)
   - RPC 핸들러 머지
   - Caret 로직 재적용
   - 시간: 2-3일

3. Webview (10개)
   - UI 컴포넌트 충돌
   - 스타일 충돌
   - 시간: 1-2일

4. Services (5개)
   - 브랜딩 로직
   - 페르소나 시스템
   - 시간: 1일

──────────────────────────
총: 6-9일 (최소)
```

**권장 조정:**
```markdown
Phase B: Caret Overlay 재적용
- Proto 병합: 2-3일
- Backend 재적용: 2-3일
- Webview 재적용: 1-2일
- 검증 및 수정: 1-2일
────────────────────────────
총: 6-10일
```

### 2. 변경 파일 매트릭스 분류 단순화 ⭐⭐⭐

**문제:**
```
현재 분류:
- Upstream-only
- Caret-only
- Both

→ 너무 단순함
```

**실제로는 더 복잡:**

```
1. Upstream-only
   a. 신규 파일 (Nous Research provider) → 자동 채택 ✅
   b. 기존 파일 업데이트 (anthropic.ts) → 자동 채택 ✅

2. Caret-only
   a. 브랜딩 (caret-src/) → 자동 유지 ✅
   b. 테스트 (caret-src/test/) → 자동 유지 ✅

3. Both (복잡함! ⚠️)
   a. CARET MODIFICATION만 있는 경우
      - Cline 변경 + Caret 주석
      - 전략: Cline 업데이트 적용 → CARET 주석 재삽입
      - 예: src/core/api/index.ts

   b. 구조적 변경 + Caret 로직
      - Cline이 함수 시그니처 변경
      - Caret이 같은 함수에 로직 추가
      - 전략: 3-way merge 필요
      - 예: src/core/controller/index.ts

   c. Proto 필드 충돌
      - Cline 필드 추가 (72까지)
      - Caret 필드 (1072+)
      - 전략: 번호 재조정
      - 예: proto/cline/models.proto

   d. UI 컴포넌트 재설계
      - Cline이 컴포넌트 리팩토링
      - Caret이 같은 컴포넌트에 기능 추가
      - 전략: 신중한 수동 머지
      - 예: webview-ui/src/components/settings/SettingsView.tsx
```

**권장 개선:**

```typescript
// scripts/classify-files.ts

enum MergeStrategy {
  AUTO_ADOPT = 'auto_adopt',        // Upstream-only → 자동
  AUTO_KEEP = 'auto_keep',          // Caret-only → 자동
  SIMPLE_MERGE = 'simple_merge',    // Both: CARET MODIFICATION만
  COMPLEX_MERGE = 'complex_merge',  // Both: 구조 변경
  PROTO_MERGE = 'proto_merge',      // Proto 필드 충돌
  UI_MERGE = 'ui_merge',            // UI 컴포넌트 충돌
  MANUAL_REVIEW = 'manual_review'   // 불확실한 경우
}

interface FileClassification {
  file: string
  strategy: MergeStrategy
  priority: 'high' | 'medium' | 'low'
  estimatedTime: string  // "30min", "2h", "1day"
  dependencies: string[]
  risks: string[]
}

// 사용 예시
const classifications: FileClassification[] = [
  {
    file: 'proto/cline/models.proto',
    strategy: MergeStrategy.PROTO_MERGE,
    priority: 'high',
    estimatedTime: '4h',
    dependencies: [],
    risks: ['필드 번호 충돌', 'CARET 필드 손실 위험']
  },
  {
    file: 'src/core/api/providers/anthropic.ts',
    strategy: MergeStrategy.AUTO_ADOPT,
    priority: 'high',
    estimatedTime: '5min',
    dependencies: [],
    risks: []
  },
  {
    file: 'src/core/controller/index.ts',
    strategy: MergeStrategy.COMPLEX_MERGE,
    priority: 'high',
    estimatedTime: '2h',
    dependencies: ['proto/cline/models.proto'],
    risks: ['Caret RPC 핸들러 손실', '타입 충돌']
  }
]
```

### 3. Phase B 실행 방법 불명확 ⭐⭐

**문제:**
```
"git diff --binary ... 패치로 저장"
"git apply + manual fix"

→ 구체적 절차 부족
→ 대규모 충돌 시 위험
```

**Phase B.1의 문제점:**

```bash
# Codex 제안
git diff --binary cline/v3.34.0..HEAD -- src caret-src webview-ui assets > caret.patch

# 문제점:
1. 413개 파일 변경사항이 하나의 patch로 뭉침
2. git apply 실패 시 전체 롤백
3. 충돌 해결이 어려움
4. 진행 상황 추적 불가
```

**권장 개선: 점진적 접근**

```bash
#!/bin/bash
# scripts/incremental-merge.sh

# Step 1: 카테고리별로 분리
categories=(
  "proto"
  "src/core/controller"
  "src/core/api"
  "src/services"
  "webview-ui"
  "caret-src"
)

for category in "${categories[@]}"; do
  echo "=== Merging $category ==="

  # 카테고리별 패치 생성
  git diff --binary cline/v3.34.0..merge/cline-v3.34.0-method3 \
    -- "$category" > "/tmp/$category.patch"

  # 적용 시도
  if git apply --check "/tmp/$category.patch" 2>/dev/null; then
    echo "  ✅ Auto-merge successful"
    git apply "/tmp/$category.patch"
  else
    echo "  ⚠️ Conflicts detected, manual merge needed"

    # 파일별로 분리
    for file in $(git diff --name-only cline/v3.34.0..merge/cline-v3.34.0-method3 -- "$category"); do
      echo "    Processing $file..."

      # 3-way diff 생성
      git show cline/v3.35.0:"$file" > /tmp/base 2>/dev/null
      git show cline/v3.37.1:"$file" > /tmp/theirs 2>/dev/null
      git show merge/cline-v3.34.0-method3:"$file" > /tmp/ours 2>/dev/null

      # CARET MODIFICATION 확인
      if grep -q "CARET MODIFICATION" /tmp/ours 2>/dev/null; then
        echo "      🔍 Caret modification detected"

        # 자동 머지 시도
        if git merge-file /tmp/ours /tmp/base /tmp/theirs 2>/dev/null; then
          echo "      ✅ Auto-merged"
          cp /tmp/ours "$file"
        else
          echo "      ❌ Manual merge required"
          code --diff /tmp/theirs /tmp/ours
          read -p "      Press Enter when done..."
        fi
      else
        # Caret 수정 없음 → Cline 버전 채택
        echo "      ℹ️ No Caret modifications, adopting Cline version"
        cp /tmp/theirs "$file"
      fi
    done
  fi

  # 각 카테고리마다 커밋
  git add "$category"
  git commit -m "merge: $category from v3.37.1"

  # 검증
  echo "  🔍 Verifying..."
  npm run compile
  if [ $? -ne 0 ]; then
    echo "  ❌ Compilation failed!"
    exit 1
  fi
  echo "  ✅ Compilation successful"

  echo ""
done

echo "✨ All categories merged!"
```

### 4. Caret 수정사항 추출 자동화 부족 ⭐⭐

**문제:**
```
Phase A.4: "CARET MODIFICATION 주석이 있는 diff를
            git grep -n "CARET"로 목록화"

→ 수동 작업
→ 누락 위험
→ 비효율적
```

**권장: 자동화 스크립트**

```typescript
// scripts/extract-caret-mods.ts

interface CaretMod {
  file: string
  type: 'comment' | 'field' | 'file' | 'import'
  lineNumber: number
  content: string
  context: string[]
  category: string
}

async function extractCaretModifications(): Promise<CaretMod[]> {
  const mods: CaretMod[] = []

  // 1. CARET MODIFICATION 주석
  const commentMods = await execCommand(
    `git grep -n "CARET MODIFICATION" merge/cline-v3.34.0-method3`
  )
  for (const line of commentMods.split('\n')) {
    const [file, lineNum, content] = line.split(':')
    mods.push({
      file,
      type: 'comment',
      lineNumber: parseInt(lineNum),
      content,
      context: await getContext(file, lineNum, 5),
      category: inferCategory(file)
    })
  }

  // 2. Proto Caret 필드 (1072+)
  const protoFiles = await glob('proto/cline/*.proto')
  for (const file of protoFiles) {
    const content = await fs.readFile(file, 'utf-8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/\s*\w+\s+\w+\s*=\s*(\d+)/)
      if (match && parseInt(match[1]) >= 1072) {
        mods.push({
          file,
          type: 'field',
          lineNumber: i + 1,
          content: lines[i],
          context: lines.slice(Math.max(0, i - 2), i + 3),
          category: 'proto'
        })
      }
    }
  }

  // 3. Caret 전용 파일
  const caretFiles = await glob('caret-src/**/*')
  for (const file of caretFiles) {
    mods.push({
      file,
      type: 'file',
      lineNumber: 0,
      content: `Entire file: ${file}`,
      context: [],
      category: 'caret-specific'
    })
  }

  // 4. Import 분석
  const imports = await findCaretImports()
  mods.push(...imports)

  return mods
}

async function generateReport(mods: CaretMod[]): Promise<string> {
  const byCategory = groupBy(mods, m => m.category)

  let report = '# Caret Modifications Extraction Report\n\n'
  report += `Total: ${mods.length} modifications\n\n`

  report += '## Summary by Category\n\n'
  for (const [category, items] of Object.entries(byCategory)) {
    report += `### ${category} (${items.length})\n\n`

    const byType = groupBy(items, m => m.type)
    for (const [type, typeItems] of Object.entries(byType)) {
      report += `- ${type}: ${typeItems.length}\n`
    }
    report += '\n'
  }

  report += '## Detailed List\n\n'
  for (const [category, items] of Object.entries(byCategory)) {
    report += `### ${category}\n\n`

    for (const mod of items) {
      report += `#### ${mod.file}:${mod.lineNumber}\n`
      report += `- Type: ${mod.type}\n`
      report += `- Content: \`${mod.content}\`\n`

      if (mod.context.length > 0) {
        report += '- Context:\n```\n'
        report += mod.context.join('\n')
        report += '\n```\n'
      }

      report += '\n'
    }
  }

  return report
}

async function generatePatches(mods: CaretMod[]): Promise<void> {
  const byCategory = groupBy(mods, m => m.category)

  for (const [category, items] of Object.entries(byCategory)) {
    const files = [...new Set(items.map(m => m.file))]

    let patch = ''
    for (const file of files) {
      const diff = await execCommand(
        `git diff cline/v3.35.0..merge/cline-v3.34.0-method3 -- ${file}`
      )
      patch += diff + '\n'
    }

    await fs.writeFile(
      `caret-docs/merging/v3.37.1/patches/${category}.patch`,
      patch
    )
  }
}

// 실행
const mods = await extractCaretModifications()
const report = await generateReport(mods)
await fs.writeFile('caret-docs/merging/v3.37.1/caret-mods-report.md', report)
await generatePatches(mods)

console.log(`✅ Extracted ${mods.length} Caret modifications`)
console.log(`📄 Report: caret-docs/merging/v3.37.1/caret-mods-report.md`)
console.log(`📦 Patches: caret-docs/merging/v3.37.1/patches/`)
```

### 5. 검증 전략 약함 ⭐⭐⭐

**문제:**
```
Phase C: "pnpm run compile → 0 error 확보"

→ 컴파일만으로는 불충분
→ 기능 테스트 체크리스트 부족
→ 1차 시도의 실수 반복 위험
```

**1차 시도가 실패한 이유:**
```
✅ 컴파일: 성공
✅ 타입 체크: 통과
────────────────────
❌ 기능: 85% 누락

→ 컴파일 성공 ≠ 기능 동작
```

**권장: 다층 검증**

```markdown
## Phase C: 통합 및 검증 (3-5일로 확대)

### Layer 1: 컴파일 검증 (0.5일)
- [ ] npm run protos (성공)
- [ ] npx tsc --noEmit (0 errors)
- [ ] npm run lint (0 errors)
- [ ] npm run compile (성공)
- [ ] npm run build:webview (성공)

### Layer 2: Unit 테스트 (0.5일)
- [ ] npm run test:unit (전체 통과)
- [ ] 커버리지 70% 이상
- [ ] Caret 전용 테스트 통과

### Layer 3: Integration 테스트 (1일)
- [ ] Provider별 API 호출 테스트
  - [ ] Anthropic (Claude Sonnet 4.5 1M)
  - [ ] OpenAI (GPT-5.1)
  - [ ] Minimax (M2 무료 모델)
  - [ ] Nous Research (신규)
  - [ ] BizRouter (Caret 전용)
- [ ] Hook 시스템 테스트
  - [ ] PreToolUse
  - [ ] PostToolUse
  - [ ] TaskStart/Resume/Cancel
- [ ] Storage 테스트
  - [ ] Remote config
  - [ ] State persistence

### Layer 4: E2E 테스트 (1-2일)
**환경 설정:**
- [ ] Node 20 설치 (`nvm use 20`)
- [ ] 필수 라이브러리 설치
  ```bash
  npx playwright install-deps
  # libicu*, libjpeg, libwebp, libffi
  ```

**Cline 기본 플로우:**
- [ ] auth.test.ts (온보딩)
- [ ] chat.test.ts (대화)
- [ ] diff.test.ts (파일 비교)
- [ ] editor.test.ts (편집)

**Caret 전용 플로우:**
- [ ] caret-welcome
- [ ] caret-onboarding
- [ ] caret-api-setup
- [ ] caret-announcement
- [ ] caret-settings
- [ ] caret-chat (Act/Plan 모드 전환)

### Layer 5: 수동 스모크 테스트 (1일)
**프로바이더/모델:**
- [ ] BizRouter 프로바이더 목록에 표시
- [ ] Minimax M2 모델 피커에 표시
- [ ] GPT-5.1 모델 선택 가능
- [ ] Nous Research Hermes 4 모델 작동
- [ ] Anthropic Claude Sonnet 4.5 1M 작동

**Caret 전용 기능:**
- [ ] 페르소나 시스템 동작
- [ ] 모드 전환 (AGENT ↔ ACT) 동작
- [ ] 입력 히스토리 저장/복원
- [ ] 브랜딩 전환 (Caret ↔ CodeCenter)

**핵심 플로우:**
- [ ] 온보딩 → API 키 설정 → 모델 선택 → 채팅
- [ ] 파일 생성/편집 → Diff 확인 → 커밋
- [ ] 터미널 실행 (Background/Foreground 전환)
- [ ] MCP 서버 연결 (OAuth 포함)
- [ ] Hooks 실행 (PreToolUse 차단 확인)

**리그레션 확인:**
- [ ] LiteLLM 재시도 로그 깔끔히 표시 (UI 노출 안 됨)
- [ ] 터미널 출력 제한 (1000줄) 동작
- [ ] executeCommand 타임아웃 동작

### Layer 6: 누락 검증 (스크립트)
```bash
# 파일 누락 검사
node scripts/compare-with-cline.mjs
# → 0 deleted files

# Stub 함수 검사
node scripts/detect-stubs.mjs
# → 0 critical stubs

# Provider 존재 확인
node scripts/verify-providers.mjs
# → All providers present
```

### Layer 7: 성능 검증 (선택)
- [ ] 확장 시작 시간 < 2초
- [ ] 첫 메시지 응답 시간 측정
- [ ] 메모리 사용량 프로파일링
```

### 6. 충돌 해결 전략 불명확 ⭐⭐

**문제:**
```
리스크 표의 "대규모 충돌" 대응:
"git rerere 활성화, Phase별 커밋 분리"

→ 너무 추상적
→ 실제 충돌 시 어떻게 해결할지 불명확
```

**권장: 구체적 충돌 해결 가이드**

```markdown
## 충돌 해결 전략 (Conflict Resolution Strategy)

### 1. Proto 파일 충돌

#### 시나리오: 필드 번호 충돌
```protobuf
// Base (v3.35.0)
message ModelsApiConfiguration {
  string apiProvider = 1;
  // ... 필드 70개
}

// Theirs (v3.37.1)
message ModelsApiConfiguration {
  string apiProvider = 1;
  // ... 필드 72개 (2개 추가)
  bool enableFeatureX = 71;
  string featureXConfig = 72;
}

// Ours (Caret)
message ModelsApiConfiguration {
  string apiProvider = 1;
  // ... 필드 70개
  // CARET MODIFICATION: Caret providers (1072+)
  bool enableBizRouter = 1072;
  string bizRouterApiKey = 1073;
}
```

**해결 방법:**
```protobuf
// Merged
message ModelsApiConfiguration {
  string apiProvider = 1;
  // ... Cline 필드 72개 (그대로 채택)
  bool enableFeatureX = 71;
  string featureXConfig = 72;

  // CARET MODIFICATION: Caret providers (1072+)
  bool enableBizRouter = 1072;
  string bizRouterApiKey = 1073;
}

// 원칙: Cline 필드는 그대로, Caret 필드는 1072+ 유지
```

### 2. Controller 충돌

#### 시나리오: 함수 시그니처 변경
```typescript
// Base
async function updateApiConfiguration(config: ApiConfig) {
  await saveConfig(config)
}

// Theirs (Cline v3.37.1)
async function updateApiConfiguration(
  config: ApiConfig,
  validate: boolean = true
) {
  if (validate) await validateConfig(config)
  await saveConfig(config)
}

// Ours (Caret)
async function updateApiConfiguration(config: ApiConfig) {
  // CARET MODIFICATION: Caret branding
  if (config.provider === 'bizrouter') {
    await initBizRouter(config)
  }
  await saveConfig(config)
}
```

**해결 방법:**
```typescript
// Merged
async function updateApiConfiguration(
  config: ApiConfig,
  validate: boolean = true
) {
  if (validate) await validateConfig(config) // Cline 추가

  // CARET MODIFICATION: Caret branding
  if (config.provider === 'bizrouter') {
    await initBizRouter(config)
  }

  await saveConfig(config)
}

// 원칙: Cline 변경 수용 + Caret 로직 재삽입
```

### 3. UI 컴포넌트 충돌

#### 시나리오: 컴포넌트 리팩토링
```tsx
// Base
function SettingsView() {
  return (
    <div>
      <ApiSection />
      <ModelSection />
    </div>
  )
}

// Theirs (Cline)
function SettingsView() {
  const { settings } = useSettings()

  return (
    <SettingsContainer>
      <Tabs>
        <Tab label="API">
          <ApiSection settings={settings} />
        </Tab>
        <Tab label="Models">
          <ModelSection settings={settings} />
        </Tab>
      </Tabs>
    </SettingsContainer>
  )
}

// Ours (Caret)
function SettingsView() {
  return (
    <div>
      <ApiSection />
      <ModelSection />
      {/* CARET MODIFICATION: Persona section */}
      <PersonaSection />
    </div>
  )
}
```

**해결 방법:**
```tsx
// Merged
function SettingsView() {
  const { settings } = useSettings()

  return (
    <SettingsContainer>
      <Tabs>
        <Tab label="API">
          <ApiSection settings={settings} />
        </Tab>
        <Tab label="Models">
          <ModelSection settings={settings} />
        </Tab>
        {/* CARET MODIFICATION: Persona tab */}
        <Tab label="Persona">
          <PersonaSection settings={settings} />
        </Tab>
      </Tabs>
    </SettingsContainer>
  )
}

// 원칙: Cline 구조 채택 + Caret 컴포넌트 추가
```

### 4. 충돌 해결 우선순위

```
High Priority (먼저 해결):
1. Proto 파일 (모든 것의 기반)
2. Controller (RPC 엔트리)
3. Services (비즈니스 로직)

Medium Priority:
4. Webview 컴포넌트
5. Utils/Helpers

Low Priority:
6. 문서
7. 테스트 픽스처
```

### 5. 충돌 해결 도구

```bash
# 3-way diff 시각화
git mergetool --tool=vimdiff

# 또는 VS Code
code --merge base.ts ours.ts theirs.ts merged.ts

# 충돌 마커 검색
grep -r "<<<<<<< HEAD" .

# 충돌 통계
git diff --name-only --diff-filter=U | wc -l
```
```

### 7. Phase D 자동화 스크립트 구체화 필요 ⭐⭐⭐

**문제:**
```
"scripts/compare-with-cline.mjs(신규) 작성"

→ 스크립트 명세 없음
→ 구현 방법 불명확
```

**권장: 상세 스크립트 명세**

```typescript
// scripts/compare-with-cline.mjs

/**
 * Cline v3.37.1과 현재 브랜치를 비교하여 누락/삭제된 파일 검증
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface FileStatus {
  status: 'M' | 'A' | 'D' | 'R'
  file: string
}

function parseGitDiff(output: string): FileStatus[] {
  const lines = output.split('\n').filter(l => l.trim())
  return lines.map(line => {
    const [status, file] = line.split('\t')
    return { status: status as any, file }
  })
}

function isIntentionallyExcluded(file: string): boolean {
  const excludePatterns = [
    /^cli\//,           // Cline CLI (Caret은 미사용)
    /^docs\//,          // Cline docs (Caret 별도)
    /\.clinerules\//,   // Cline rules (Caret은 .caretrules)
    /^evals\//,         // Evaluation scripts
  ]

  return excludePatterns.some(pattern => pattern.test(file))
}

async function main() {
  console.log('🔍 Comparing with Cline v3.37.1...\n')

  // 1. Git diff 실행
  const diffOutput = execSync(
    'git diff --name-status cline/v3.37.1..HEAD',
    { encoding: 'utf-8' }
  )

  const files = parseGitDiff(diffOutput)

  // 2. 상태별 분류
  const byStatus = {
    M: files.filter(f => f.status === 'M'),
    A: files.filter(f => f.status === 'A'),
    D: files.filter(f => f.status === 'D'),
    R: files.filter(f => f.status === 'R'),
  }

  console.log('📊 File Status Summary:')
  console.log(`  Modified (M): ${byStatus.M.length}`)
  console.log(`  Added (A): ${byStatus.A.length}`)
  console.log(`  Deleted (D): ${byStatus.D.length}`)
  console.log(`  Renamed (R): ${byStatus.R.length}`)
  console.log()

  // 3. 삭제된 파일 검증
  const deletedFiles = byStatus.D.filter(f => !isIntentionallyExcluded(f.file))

  if (deletedFiles.length > 0) {
    console.error('❌ ERROR: Files deleted from Cline v3.37.1\n')

    for (const { file } of deletedFiles) {
      console.error(`  ❌ ${file}`)
    }

    console.error('\n⚠️ These files exist in Cline but not in current branch.')
    console.error('   Please verify this is intentional or restore them.\n')

    // 리포트 생성
    const report = generateReport(files, deletedFiles)
    fs.writeFileSync('caret-docs/merging/v3.37.1/deleted-files-report.md', report)
    console.error('📄 Report saved to: caret-docs/merging/v3.37.1/deleted-files-report.md\n')

    process.exit(1)
  }

  // 4. 추가된 파일 검증
  const caretFiles = byStatus.A.filter(f => f.file.startsWith('caret-'))

  console.log('✅ No unintentional deletions detected!')
  console.log(`\n📁 Caret-specific files added: ${caretFiles.length}`)

  for (const { file } of caretFiles.slice(0, 10)) {
    console.log(`  ✨ ${file}`)
  }

  if (caretFiles.length > 10) {
    console.log(`  ... and ${caretFiles.length - 10} more`)
  }

  // 5. 수정된 파일 샘플
  console.log(`\n📝 Modified files (sample): ${Math.min(10, byStatus.M.length)}/${byStatus.M.length}`)

  for (const { file } of byStatus.M.slice(0, 10)) {
    console.log(`  📝 ${file}`)
  }

  console.log('\n✅ Comparison complete!')
}

function generateReport(files: FileStatus[], deletedFiles: FileStatus[]): string {
  let report = '# Cline v3.37.1 Comparison Report\n\n'

  report += `**Generated:** ${new Date().toISOString()}\n\n`

  report += '## Summary\n\n'
  report += `- Modified: ${files.filter(f => f.status === 'M').length}\n`
  report += `- Added: ${files.filter(f => f.status === 'A').length}\n`
  report += `- Deleted: ${files.filter(f => f.status === 'D').length}\n`
  report += `- Renamed: ${files.filter(f => f.status === 'R').length}\n\n`

  if (deletedFiles.length > 0) {
    report += '## ❌ Deleted Files (Unintentional)\n\n'

    const byCategory = {}
    for (const { file } of deletedFiles) {
      const category = file.split('/')[0]
      if (!byCategory[category]) byCategory[category] = []
      byCategory[category].push(file)
    }

    for (const [category, categoryFiles] of Object.entries(byCategory)) {
      report += `### ${category}/ (${categoryFiles.length})\n\n`
      for (const file of categoryFiles) {
        report += `- \`${file}\`\n`
      }
      report += '\n'
    }
  }

  return report
}

main().catch(err => {
  console.error('💥 Error:', err.message)
  process.exit(1)
})
```

**사용법:**
```bash
# CI에서 실행
npm run verify:merge

# package.json에 추가
{
  "scripts": {
    "verify:merge": "node scripts/compare-with-cline.mjs"
  }
}

# PR 체크리스트에 추가
- [ ] `npm run verify:merge` passed (0 deleted files)
```

---

## 💡 추가 권장사항

### 1. 진행 상황 추적 대시보드

```markdown
## 2차 머지 진행 대시보드

### Phase A: 준비 (0/4 완료)
- [ ] Git fetch & branch 생성
- [ ] 변경 파일 매트릭스 작성
- [ ] Caret 수정사항 추출
- [ ] 검증 스크립트 작성

### Phase B: Caret Overlay (0/50 완료)
**Proto (0/16):**
- [ ] models.proto
- [ ] state.proto
- [ ] ... (나머지)

**Controller (0/20):**
- [ ] index.ts
- [ ] file/toggleAgentsRule.ts
- [ ] ... (나머지)

**Webview (0/10):**
- [ ] SettingsView.tsx
- [ ] ... (나머지)

### Phase C: 검증 (0/7 완료)
- [ ] Compile
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests (Cline)
- [ ] E2E tests (Caret)
- [ ] Manual smoke tests
- [ ] Verification scripts

### Phase D: 자동화 (0/3 완료)
- [ ] compare-with-cline.mjs
- [ ] detect-stubs.mjs
- [ ] verify-providers.mjs

### 전체 진행률: 0% (0/84 완료)
### 예상 완료일: 2025-12-06
```

### 2. Daily Checkpoint 템플릿

```markdown
## Day N Checkpoint (YYYY-MM-DD)

### 오늘 한 일
- [ ] Phase X 작업
- [ ] Y개 파일 머지 완료
- [ ] Z개 충돌 해결

### 완료된 작업
- 파일: `path/to/file.ts`
  - 충돌: 있음/없음
  - 해결 방법: ...
  - 소요 시간: Xh

### 발견된 이슈
- 이슈 1: ...
  - 해결 방법: ...
  - 상태: 해결됨/보류

### 내일 할 일
- [ ] ...
- [ ] ...

### 리스크/블로커
- 없음 / [리스크 설명]

### 메트릭
- 머지 완료: X/Y 파일
- 테스트 통과: X/Y
- 컴파일 시간: Xs
```

### 3. 롤백 전략

```bash
#!/bin/bash
# scripts/rollback-to-checkpoint.sh

# 사용법: ./rollback-to-checkpoint.sh phase-b-day-2

CHECKPOINT=$1

if [ -z "$CHECKPOINT" ]; then
  echo "Usage: $0 <checkpoint-name>"
  echo "Available checkpoints:"
  git tag | grep "checkpoint-"
  exit 1
fi

echo "🔄 Rolling back to checkpoint: $CHECKPOINT"

# 현재 상태 백업
git branch backup-before-rollback-$(date +%Y%m%d-%H%M%S)

# 체크포인트로 이동
git reset --hard "checkpoint-$CHECKPOINT"

echo "✅ Rolled back to $CHECKPOINT"
echo "⚠️  Backup created: backup-before-rollback-*"
```

### 4. PR 준비 체크리스트

```markdown
## v3.37.1 Merge PR Checklist

### 코드
- [ ] 모든 Cline v3.37.1 변경사항 포함
- [ ] 모든 Caret 수정사항 재적용
- [ ] CARET MODIFICATION 주석 유지
- [ ] 스텁 함수 없음 (detect-stubs 통과)
- [ ] 파일 누락 없음 (compare-with-cline 통과)

### 빌드
- [ ] `npm run protos` 성공
- [ ] `npm run compile` 성공
- [ ] `npm run build:webview` 성공
- [ ] `vsce package` 성공

### 테스트
- [ ] Unit tests 통과 (70%+ coverage)
- [ ] Integration tests 통과
- [ ] E2E tests (Cline) 통과
- [ ] E2E tests (Caret) 통과
- [ ] Manual smoke tests 통과

### 기능 검증
- [ ] Minimax M2 모델 작동
- [ ] GPT-5.1 개선사항 적용
- [ ] Nous Research 프로바이더 작동
- [ ] BizRouter 프로바이더 작동 (Caret)
- [ ] 페르소나 시스템 작동 (Caret)
- [ ] 모드 전환 작동 (Caret)

### 문서
- [ ] CHANGELOG.md 업데이트
- [ ] 머지 로그 작성
- [ ] 테스트 결과 문서화
- [ ] 알려진 이슈 문서화

### 회고
- [ ] 1차 시도와 비교
- [ ] 개선 사항 정리
- [ ] 다음 머지를 위한 교훈
```

---

## 🎯 최종 권고

### ✅ 계획은 전반적으로 타당함
- Cline-Base 전략 선택: ⭐⭐⭐⭐⭐
- 구조화 및 Phase 분리: ⭐⭐⭐⭐
- 리스크 인식: ⭐⭐⭐⭐

### ⚠️ 다음 항목 필수 보완

1. **타임라인 현실화** (4-6일 → 11-17일)
2. **변경 파일 분류 상세화** (7가지 전략)
3. **Phase B 실행 방법 구체화** (점진적 머지)
4. **Caret 수정사항 추출 자동화** (스크립트)
5. **검증 전략 강화** (7단계 검증)
6. **충돌 해결 가이드** (시나리오별)
7. **Phase D 스크립트 명세** (상세 코드)

### 💡 추가 권장

1. **진행 대시보드** 구축
2. **Daily checkpoint** 템플릿 사용
3. **롤백 전략** 준비
4. **PR 체크리스트** 작성

---

## 📋 수정된 타임라인 제안

```
Week 1 (Day 1-5):
├─ Day 1-2: Phase A (준비 + 분석)
├─ Day 3-5: Phase B 시작 (Proto, Controller)
└─ Checkpoint: 기본 컴파일 성공

Week 2 (Day 6-10):
├─ Day 6-8: Phase B 계속 (Services, Webview)
├─ Day 9-10: Phase B 완료 + Phase C 시작
└─ Checkpoint: 전체 컴파일 + Unit 테스트 통과

Week 3 (Day 11-15):
├─ Day 11-13: Phase C (Integration + E2E)
├─ Day 14-15: Phase C (Manual smoke tests)
└─ Checkpoint: 모든 테스트 통과

Week 4 (Day 16-17):
├─ Day 16: 최종 검증 + 문서 정리
├─ Day 17: PR 준비 + 리뷰
└─ Checkpoint: PR 제출

총: 17일 (3.4주)
```

---

## 🚀 시작하기 전 체크리스트

```
환경 준비:
- [ ] Node 20 설치 확인
- [ ] Git rerere 활성화
- [ ] 필수 라이브러리 설치
- [ ] VS Code 플러그인 준비

도구 준비:
- [ ] extract-caret-mods.ts 작성
- [ ] classify-files.ts 작성
- [ ] incremental-merge.sh 작성
- [ ] compare-with-cline.mjs 작성
- [ ] detect-stubs.mjs 작성

문서 준비:
- [ ] 진행 대시보드 생성
- [ ] Daily checkpoint 템플릿
- [ ] 충돌 해결 가이드
- [ ] PR 체크리스트

백업 준비:
- [ ] 현재 브랜치 백업
- [ ] 롤백 스크립트 테스트
- [ ] Caret 수정사항 아카이브
```

---

**결론:** Codex의 2차 계획은 **전략적으로 올바르나 실행 디테일에서 보완이 필요**합니다. 위의 보완사항을 반영하면 **성공 확률 80% 이상**으로 평가됩니다. 🎯

**핵심 메시지:**
> "Good plan, but needs more execution details and realistic timeline. With these improvements, success is highly likely." ✨

---

**작성:** Claude (Anthropic AI Assistant)
**문서 버전:** 1.0
**다음 단계:** Codex와 보완사항 협의 후 실행 개시
