# Cherry-Pick vs Squash Merge 비교 분석

**분석 대상**: main → upstream/main (Cline v3.49.0 이후)
**분석 날짜**: 2025-01-14
**변경 규모**: 4,441 커밋, 2,055 파일, ~1.2M 라인 삭제

---

## 📊 변경 규모 현황

| 항목 | 규모 | 의미 |
|------|------|------|
| **커밋 수** | 4,441 개 | 매우 대규모 변경 |
| **파일 변경** | 2,055 개 | 프로젝트 전반에 영향 |
| **추가 라인** | 118,268 라인 | 새로운 기능 많음 |
| **삭제 라인** | 1,353,537 라인 | 대규모 리팩터링 발생 |
| **주요 변경** | Skills, Hooks, Chat Streaming UI, MCP, Auth | 핵심 시스템 변화 |

---

## 🍒 방법 1: Cherry-Pick 접근

### **방식**
필요한 커밋만 선택적으로 체리픽

### **예상 소요 시간**

| 단계 | 시간 | 작업 내용 |
|------|------|----------|
| **커밋 분석** | 1-2일 | 50+ 핵심 커밋 식별 및 의존성 분석 |
| **Phase 1 (보안)** | 0.5-1일 | 인증/보안 버그 수정 체리픽 |
| **Phase 2 (Skills)** | 2-3일 | Skills 시스템 체리픽 + 통합 |
| **Phase 3 (Hooks)** | 2-3일 | Hooks 시스템 체리픽 + 통합 |
| **Phase 4 (MCP)** | 1-2일 | MCP 개선 체리픽 |
| **Phase 5 (Chat UI)** | 3-4일 | Chat Streaming UI 체리픽 + 브랜딩 |
| **통합 테스트** | 1-2일 | 전체 시스템 검증 |
| **총 예상** | **11-18일** | **평균 14일** |

### **난이도**

| 항목 | 난이도 | 이유 |
|------|--------|------|
| **의존성 파악** | 🚨 매우 어려움 | 4,441 커밋 중 어떤 것을 선택할지? |
| **순서 결정** | 🚨 어려움 | 커밋 간 의존성을 순서대로 체리픽해야 함 |
| **충돌 해결** | 🟡 중간 | 선택적이므로 충돌이 상대적으로 적음 |
| **테스트** | 🟡 중간 | 개별 기능 단위 테스트 가능 |
| **전체 난이도** | 🚨 **어려움** | 의존성 분석이 가장 큰 병목 |

### **장점**

✅ **Careti 독립성 유지**: 최소 침습 원칙 준수
✅ **선택적 통합**: 필요한 기능만 채택
✅ **충돌 최소화**: 선택적 머징으로 충돌 줄임
✅ **단계적 검증**: 각 Phase별 테스트 가능
✅ **롤백 용이**: 문제 발생 시 개별 기능만 롤백

### **단점**

❌ **의존성 악몽**: 4,441 커밋 중 의존성 파악 불가
❌ **순서 결정 어려움**: 잘못된 순서로 체리픽 시 시스템 붕괴
❌ **시간 소요**: 11-18일 소요 (매우 김)
❌ **숨겨진 버그**: 선택 안 한 커밋에 중요 수정이 있을 수 있음
❌ **향후 머징 복잡**: 부분적 통합으로 향후 머징이 더 어려워짐

### **실제 위험 사례**

```bash
# 시나리오 1: 의존성 오인
git cherry-pick <skills-commit>  # 실패!
# → 의존하는 proto 변경 없어서 컴파일 에러

# 시나리오 2: 순서 틀림
git cherry-pick <auth-fix>  # 먼저 실행
git cherry-pick <auth-loop-fix>  # 나중에 실행
# → 두 커밋이 서로 충돌로 시스템 붕괴

# 시나리오 3: 누락된 커밋
# 중요한 refactoring 커밋 누락 → 나중에 발견
# → 이미 많은 작업을 했으니 되돌리기 어려움
```

---

## 🗜️ 방법 2: Squash Merge 접근

### **방식**
전체 upstream을 squash merge 후 Careti 기능 복원

### **예상 소요 시간**

| 단계 | 시간 | 작업 내용 |
|------|------|----------|
| **준비 및 분석** | 0.5일 | 백업, 충돌 파일 식별 |
| **Squash Merge** | 0.5일 | 단일 커밋으로 머징 |
| **Proto/타입 복원** | 0.5일 | Careti 타입 보호 |
| **Critical Files 복원** | 0.5-1일 | App.tsx, Providers.tsx 등 |
| **Careti 디렉토리 복원** | 0.5일 | careti-src, careti-docs 등 |
| **브랜딩 복원** | 0.5일 | Proto package, UI 브랜딩 |
| **컴파일/런타임 검증** | 1-2일 | 전체 시스템 테스트 |
| **문제 해결** | 1-3일 | 예상되는 문제 해결 |
| **총 예상** | **5-9일** | **평균 7일** |

### **난이도**

| 항목 | 난이도 | 이유 |
|------|--------|------|
| **의존성 파악** | 🟢 쉬움 | 의존성 고려할 필요 없음 |
| **순서 결정** | 🟢 쉬움 | 한 번에 처리 |
| **충돌 해결** | 🟡 중간 | Careti 파일만 보호하면 됨 |
| **테스트** | 🟡 중간 | 전체 시스템 테스트 필요 |
| **전체 난이도** | 🟢 **쉬움** | 프로세스가 단순 |

### **장점**

✅ **의존성 무시**: 모든 커밋을 한 번에 통합
✅ **빠른 완료**: 5-9일로 체리픽의 절반
✅ **깔끔한 히스토리**: 단일 통합 커밋
✅ **전체 테스트**: 전체 시스템 검증
✅ **향후 머징 용이**: baseline 태그로 재머징 쉬움

### **단점**

❌ **Careti 파일 삭제 위험**: 백업 필수
❌ **브랜딩 복원 작업**: Proto package, UI 브랜딩 등 복원 필요
❌ **전체 테스트 부담**: 전체 시스템 검증 필요
❌ **롤백 복잡**: 문제 발생 시 전체 롤백
❌ **Cline 개선사항 강제**: 필요/불관계 모든 개선사항 적용

### **실제 위험 사례**

```bash
# 시나리오 1: 백업 누락
git reset --hard upstream/main  # careti-src 삭제!
# → 백업 없으면 Careti 기능 모두 소실

# 시나리오 2: 브랜딩 복원 누락
# Proto package "careti" → "cline"으로 변경됨
# → gRPC 서버 시작 실패

# 시나리오 3: Critical Files 누락
# App.tsx의 CaretiI18nProvider 누락
# → 전체 Context 시스템 동작 불가
```

---

## 📋 상세 비교표

| 항목 | Cherry-Pick | Squash Merge | 승자 |
|------|-------------|--------------|------|
| **예상 소요 시간** | 11-18일 (평균 14일) | 5-9일 (평균 7일) | 🗜️ Squash **2배 빠름** |
| **난이도** | 🚨 어려움 | 🟢 쉬움 | 🗜️ Squash **훨씬 쉬움** |
| **의존성 파악** | 매우 어려움 | 불필요 | 🗜️ Squash |
| **충돌 해결** | 상대적으로 적음 | Careti 파일만 보호 | 🍒 Cherry-Pick |
| **테스트 범위** | 단위 테스트 가능 | 전체 테스트 필요 | 🍒 Cherry-Pick |
| **롤백 용이성** | 개별 기능 롤백 | 전체 롤백 | 🍒 Cherry-Pick |
| **Careti 독립성** | 완전 유지 | 부분 손실 후 복원 | 🍒 Cherry-Pick |
| **향후 머징** | 복잡해짐 | baseline으로 쉬움 | 🗜️ Squash |
| **Git 히스토리** | 상세 커밋 유지 | 깔끔한 단일 커밋 | 🗜️ Squash |
| **위험도** | 높음 (의존성 실수) | 중간 (백업 누락) | 🟡 비슷함 |

---

## 🎯 추천 방식

### **추천**: 🗜️ **Squash Merge**

### **이유**

1. **시간 효율성**
   - 7일 vs 14일 → 2배 빠름
   - 의존성 분석 시간 절약

2. **난이도**
   - 프로세스가 단순
   - 이미 검증된 프로세스 (careti-docs/merging/merge-standard-guide.md)

3. **실제 경험**
   - Phase 0-5 프로세스로 여러 번 성공
   - 문서화가 잘 되어 있음

4. **4,441 커밋 현실**
   - 의존성 파악 불가능
   - 순서 결정 미궁석

---

## 🚀 Squash Merge 실행 가이드

### **Phase 0: 준비 (0.5일)**

```bash
# 1. .agents/context 우선 복구 (가장 중요!)
cp -r /tmp/careti-backup-$(date +%Y%m%d)/.agents/context ./

# 2. 백업 생성
git tag backup-before-squash-$(date +%Y%m%d-%H%M%S)
mkdir -p /tmp/careti-backup-$(date +%Y%m%d)
cp -r careti-src/ careti-docs/ assets/ careti-scripts/ /tmp/careti-backup-$(date +%Y%m%d)/

# 3. 작업 브랜치 생성
git checkout -b feature/squash-merge-cline-20260114
```

### **Phase 1: Squash Merge (0.5일)**

```bash
# 1. Upstream 최신화
git fetch upstream

# 2. Squash Merge 실행
git merge upstream/main --squash --strategy-option=theirs

# 3. Careti 디렉토리 복원
cp -r /tmp/careti-backup-$(date +%Y%m%d)/careti-src ./
cp -r /tmp/careti-backup-$(date +%Y%m%d)/careti-docs ./
cp -r /tmp/careti-backup-$(date +%Y%m%d)/assets ./
cp -r /tmp/careti-backup-$(date +%Y%m%d)/careti-scripts ./

# 4. .agents/context 복원
cp -r /tmp/careti-backup-$(date +%Y%m%d)/.agents/context ./

# 5. 통합 커밋 생성
git add -A
git commit -m "Squash Merge: Cline v3.49.0+ → Careti (2026-01-14)

🎯 Major upgrade via squash merge strategy (4,441 commits)

✨ Key Features Integrated:
- Skills system for reusable agent instructions
- Hooks system for task lifecycle management
- Chat Streaming UI refactoring (Lucide icons, grouped tools)
- MCP improvements (remote config sync, image display)
- Auth security fixes (expired token prevention)
- LiteLLM bug fixes
- Explain Changes feature
- Workflow slash command improvements

🎯 Careti Customizations Preserved:
- Branding: Cline → Careti throughout UI
- API Compatibility: caretApiKey maintained
- Package namespace: proto package careti
- Context Providers: CaretiI18nProvider, CaretStateContextProvider
- Persona system: Template characters preserved
- i18n system: 4 languages (en, ko, ja, zh)

🔄 Git History Strategy:
- Squash merge preserves all Cline changes in single commit
- Full Cline commit range: https://github.com/cline/cline/compare/v3.49.0...main

📚 Reference: careti-docs/merging/merge-standard-guide.md"

# 6. Baseline 태그 생성 (향후 rebase용)
git tag careti-squash-baseline-$(date +%Y%m%d)
```

### **Phase 2: Proto/타입 복원 (0.5일)**

```bash
# 1. Proto package 복원
find proto/ -name "*.proto" -exec sed -i 's/package cline;/package careti;/g' {} \;

# 2. Proto 재생성
npm run protos

# 3. 타입 파일 보호 (.gitattributes)
cat > .gitattributes << 'EOF'
# Careti 타입 솔루션 파일 - 충돌 시 Careti 버전 우선
src/types/vscode-extensions.d.ts merge=ours
src/core/api/providers/vscode-lm.ts merge=ours
src/integrations/terminal/TerminalManager.ts merge=ours
src/services/posthog/PostHogClientProvider.ts merge=ours
src/standalone/vscode-context.ts merge=ours
src/services/mcp/McpHub.ts merge=ours
EOF

# 4. Git merge driver 설정
git config merge.ours.driver true
```

### **Phase 3: Critical Files 복원 (0.5-1일)**

```bash
# 1. App.tsx (Context Provider 통합)
cp /tmp/careti-backup-$(date +%Y%m%d)/webview-ui/src/App.tsx \
   webview-ui/src/App.tsx

# 2. Providers.tsx (순서 확인)
cp /tmp/careti-backup-$(date +%Y%m%d)/webview-ui/src/Providers.tsx \
   webview-ui/src/Providers.tsx

# 3. WelcomeView.tsx (언어/API/Persona 플로우)
cp /tmp/careti-backup-$(date +%Y%m%d)/webview-ui/src/components/welcome/WelcomeView.tsx \
   webview-ui/src/components/welcome/

# 4. ChatView.tsx (Persona 아바타)
cp /tmp/careti-backup-$(date +%Y%m%d)/webview-ui/src/components/chat/ChatView.tsx \
   webview-ui/src/components/chat/

# 5. SettingsView.tsx + sections/ (General/About 탭)
cp /tmp/careti-backup-$(date +%Y%m%d)/webview-ui/src/components/settings/SettingsView.tsx \
   webview-ui/src/components/settings/
cp -r /tmp/careti-backup-$(date +%Y%m%d)/webview-ui/src/components/settings/sections/ \
      webview-ui/src/components/settings/

# 6. ApiOptions.tsx (Provider 필터링)
cp /tmp/careti-backup-$(date +%Y%m%d)/webview-ui/src/components/settings/ApiOptions.tsx \
   webview-ui/src/components/settings/

# 7. ClineRulesToggleModal.tsx (Persona 관리)
cp /tmp/careti-backup-$(date +%Y%m%d)/webview-ui/src/components/cline-rules/ClineRulesToggleModal.tsx \
   webview-ui/src/components/cline-rules/

# 8. task-header/ (HomeHeader, Persona 이미지)
cp -r /tmp/careti-backup-$(date +%Y%m%d)/webview-ui/src/components/chat/task-header/ \
      webview-ui/src/components/chat/

# 9. careti 디렉토리 전체 복사
cp -r /tmp/careti-backup-$(date +%Y%m%d)/webview-ui/src/careti/ \
      webview-ui/src/careti/
```

### **Phase 4: 브랜딩 복원 (0.5일)**

```bash
# 1. Cline → Careti 브랜딩 (주요 위치)
grep -rl "Cline Account" webview-ui/src/ --include="*.ts" --include="*.tsx" | \
  xargs sed -i 's/Cline Account/Careti Account/g'

grep -rl "Sign up with Cline" webview-ui/src/ --include="*.ts" --include="*.tsx" | \
  xargs sed -i 's/Sign up with Cline/Sign up with Careti/g'

# 2. URL 복원
grep -rl "cline\.bot" webview-ui/src/ --include="*.ts" --include="*.tsx" | \
  xargs sed -i 's/cline\.bot/docs\.careti\.team/g'

# 3. Logo import 검색 및 교체
grep -rl "ClineLogo" webview-ui/src/ --include="*.ts" --include="*.tsx" | \
  while read file; do
    sed -i 's/ClineLogoWhite/CaretLogoWhite/g' "$file"
    sed -i 's/ClineLogoBlack/CaretLogoBlack/g' "$file"
    sed -i 's/ClineCompactIcon/CaretCompactIcon/g' "$file"
  done
```

### **Phase 5: 컴파일/런타임 검증 (1-2일)**

```bash
# 1. 의존성 설치
npm install
cd webview-ui && npm install && cd ..

# 2. Backend 컴파일
npm run compile

# 3. Frontend 빌드
cd webview-ui && npm run build

# 4. Lint
npm run lint

# 5. 런타임 테스트 (F5 실행)
# - Extension 로딩
# - Console 에러 없음
# - Careti 브랜딩 표시
# - Persona/모드 전환 가능
# - i18n 동작
# - Account 로그인/로그아웃
```

### **Phase 6: 문제 해결 (1-3일)**

**예상 문제 및 해결 방안:**

1. **Chat Streaming UI 충돌**
   - 문제: Lucide icons, 새로운 컴포넌트 구조
   - 해결: Careti 브랜딩 적용, PersonaAvatar 통합

2. **Skills/Hooks 시스템 충돌**
   - 문제: `.cline/skills` → `.careti/skills` 필요
   - 해결: 경로 수정, Careti 프롬프트 시스템 통합

3. **MCP 관련 타입 에러**
   - 문제: Proto 타입 누락
   - 해결: Proto 재생성, 타입 정의 확인

4. **Context Provider 누락**
   - 문제: App.tsx 누락으로 전체 시스템 동작 불가
   - 해결: Phase 3에서 Critical Files 복원

### **Phase 7: 최종 검증 및 Main 병합 (0.5일)**

```bash
# 1. 최종 테스트
npm run test:backend
npm run test:integration
npm run test:webview

# 2. VSIX 패키징 테스트
npm run package:release

# 3. Main 브랜치로 병합
git checkout main
git merge feature/squash-merge-cline-20260114 --no-ff

# 4. 태그 생성
git tag v0.5.0 -m "Squash Merge: Cline v3.49.0+ integration"
```

---

## ⚠️ 위험 관리

### **Cherry-Pick 위험 요소**

| 위험 | 확률 | 영향도 | 대응 |
|------|------|--------|------|
| 의존성 오인 | 🟡 높음 | 🚨 높음 | 3-way 비교 철저히 |
| 순서 틀림 | 🟡 높음 | 🚨 높음 | 커밋 그래프 분석 |
| 숨겨진 버그 | 🟡 높음 | 🟡 중간 | 전체 테스트 필수 |
| 시간 초과 | 🟡 높음 | 🟡 중간 | 기간 엄수 |

### **Squash Merge 위험 요소**

| 위험 | 확률 | 영향도 | 대응 |
|------|------|--------|------|
| 백업 누락 | 🟢 낮음 | 🚨 높음 | 백업 스크립트 자동화 |
| 브랜딩 복원 누락 | 🟡 중간 | 🚨 높음 | 체크리스트 엄수 |
| Critical Files 누락 | 🟡 중간 | 🚨 높음 | Phase 3 철저히 |
| 전체 테스트 실패 | 🟡 중간 | 🟡 중간 | 단계적 테스트 |

---

## 📚 참고 문서

| 문서 | 경로 | 내용 |
|------|------|------|
| **Squash Merge 가이드** | `careti-docs/guides/upstream-merging.md` | Squash Merge 전략 |
| **머징 표준 가이드** | `careti-docs/merging/merge-standard-guide.md` | Phase 0-5 프로세스 |
| **머징 체크리스트** | `careti-docs/merging/merge-standard-guide.md#다음-머징-회차-체크리스트` | 상세 체크리스트 |

---

## ✅ 결론

**추천**: 🗜️ **Squash Merge**

**이유**:
1. **시간**: 7일 vs 14일 → 2배 빠름
2. **난이도**: 쉬움 vs 어려움 → 훨씬 쉬움
3. **실현 가능성**: 4,441 커밋의 의존성 파악 불가
4. **검증된 프로세스**: 이미 여러 번 성공
5. **향후 머징**: baseline 태그로 쉬운 재머징

**다음 단계**:
1. Phase 0 준비 (0.5일)
2. Phase 1 Squash Merge 시작 (0.5일)
3. 각 Phase별 체크리스트 엄수
4. 문제 발생 시 즉시 보고

---

**작성자**: Luke (with Claude Code)
**마지막 업데이트**: 2025-01-14
**문서 유형**: 머징 전략 비교
