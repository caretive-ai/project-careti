# Cline Upstream 머징 실행 마스터 플랜

**작성일**: 2025-10-09
**프로젝트**: Caret v0.3.0 - Cline Upstream Complete Adoption
**전략**: Cline 완전 채택 + Caret Features 순차 재구현 (Adapter Pattern)
**현재 브랜치**: main v0.2.4 (커밋: 9b1094e7c)
**목표 브랜치**: merge/cline-upstream-20251009 (신규 생성)

---

## 📋 Executive Summary

### 프로젝트 목표

**Cline upstream 최신 버전 완전 채택 + Caret 11개 Features 순차 재구현**

- **현재 상태**: Caret v0.2.4 (Cline v3.x 기반, 많은 충돌)
- **목표 상태**: Caret v0.3.0 (Cline 최신 완전 채택 + 11개 Feature 재구현)
- **전략**: Phase 3 실패 교훈 반영, Feature별 최소 침습 재구현

### 진행 상황 (Overall Progress)

**Phase 0: 준비 작업** ▓▓▓▓▓▓▓▓▓▓ 100% ✅
**Phase 1: 브랜치 설정 및 백업** ▓▓▓▓▓▓▓▓▓▓ 100% ✅
**Phase 2: Upstream 완전 채택** ▓▓▓▓▓▓▓▓▓▓ 100% ✅
**Phase 3: Proto 재구현** ▓▓▓▓▓▓▓▓▓▓ 100% ✅
**Phase 4: Backend 재구현** ▓▓▓▓▓░░░░░ 50% 🔄 (F09 ✅, F03 ✅, F08 ✅, F02 ✅)
**Phase 5: Frontend 재구현** ░░░░░░░░░░ 0%
**Phase 6: 최종 검증 및 배포** ░░░░░░░░░░ 0%

**총 진행률**: ▓▓▓▓▓░░░░░ 47% (Phase 0-3 완료, Phase 4 50%)

---

## 🎯 Phase별 작업 계획

### Phase 0: 준비 작업 ✅ **완료**

**목표**: 머징 전 문서 및 환경 준비
**현재 상태**: ✅ 완료 (2025-10-09)

#### 완료된 작업
- ✅ Phase 3 실패 분석 완료
- ✅ main 브랜치 복귀 (feature/cline-merge → main)
- ✅ F01-F11 Feature 문서 보강 (Modified Files & Merge Strategy)
- ✅ 침습 현황 마스터 문서 생성 (`cline-invasion-master-status.md`)
- ✅ 머징 실행 마스터 플랜 생성 (현재 문서)
- ✅ Cline v3.32.7 빌드 오류 근본 원인 분석 완료 ⭐ **신규**
- ✅ Caret 타입 솔루션 검증 완료 (9개 오류 모두 해결됨)

#### 결과물
- [x] `caret-docs/features/f01-f11.mdx` - 11개 Feature 완전 문서화
- [x] `caret-docs/merging/cline-invasion-master-status.md` - 침습 현황 분석
- [x] `caret-docs/merging/merge-execution-master-plan.md` - 머징 실행 계획 (현재 문서)
- [x] `caret-docs/merging/cline-v3.32.7-root-cause-analysis.md` - Cline 빌드 오류 분석 ⭐ **신규**
- [x] `caret-docs/work-logs/luke/2025-10-09-features-enhancement-master.md` - 작업 로그

#### 🔍 Phase 0 핵심 발견사항

**Cline v3.32.7 빌드 실패 원인**:
- **문제**: 9개의 TypeScript 타입 오류 (VS Code API v1.84.0+ 호환성 문제)
- **Caret 솔루션**: 중앙화된 타입 확장 파일 (`src/types/vscode-extensions.d.ts`)
- **리스크**: 머징 시 Caret의 솔루션이 손상될 위험 존재
- **대응**: Phase 4.0 (타입 파일 보호) + Phase 4.12 (타입 충돌 해결) 추가

**타입 오류 요약**:
1. **vscode-lm.ts** (1개): Language Model API 타입 충돌
2. **TerminalManager.ts** (4개): Terminal API 타입 재정의
3. **distinctId.ts** (2개): node-machine-id 모듈 미설치
4. **McpHub.ts** (1개): MCP 알림 핸들러 암묵적 any
5. **vscode-context.ts** (1개): ExtensionRegistryInfo 모듈 오류

**Caret 솔루션 전략**:
- ✅ 중앙화된 타입 확장 (vscode-lm + Terminal)
- ✅ VS Code 내장 API 사용 (vscode.env.machineId)
- ✅ 명시적 타입 선언 (any)
- ✅ 하드코딩 + 함수 사용 (ExtensionRegistryInfo 제거)

---

### Phase 1: 브랜치 설정 및 백업 ✅ **완료**

**목표**: 안전한 머징을 위한 백업 및 브랜치 생성

**예상 시간**: 30분
**현재 상태**: ✅ 완료 (2025-10-09)

#### 작업 단계

##### Step 1.1: main v0.2.4 백업 브랜치 생성
```bash
# 현재 main 브랜치 상태 백업
git branch backup/main-v0.2.4-20251009

# 태그 생성 (버전 참조용)
git tag v0.2.4-pre-merge

# 백업 확인
git log backup/main-v0.2.4-20251009 --oneline -5
```

**체크리스트**:
- [ ] 백업 브랜치 생성 완료
- [ ] 태그 생성 완료
- [ ] 백업 브랜치에서 컴파일 성공 확인
- [ ] 백업 브랜치 커밋 해시 기록: `_______________`

##### Step 1.2: 새 머징 브랜치 생성
```bash
# main에서 새 브랜치 생성
git checkout -b merge/cline-upstream-20251009

# upstream remote 확인 및 업데이트
git remote -v
git fetch upstream

# upstream 최신 커밋 확인
git log upstream/main --oneline -10
```

**체크리스트**:
- [ ] 머징 브랜치 생성 완료
- [ ] upstream remote 설정 확인
- [ ] upstream/main 최신 상태 확인
- [ ] Cline 최신 버전 기록: `v________`

##### Step 1.3: 작업 환경 검증
```bash
# 의존성 설치 확인
npm install

# 컴파일 테스트
npm run compile

# 타입 체크
npm run check-types

# 테스트 환경 준비
npm run test:backend -- --run
```

**체크리스트**:
- [ ] 의존성 설치 완료
- [ ] 컴파일 성공
- [ ] 타입 체크 통과
- [ ] 테스트 환경 정상

#### 완료 기준
- ✅ 백업 브랜치 및 태그 생성
- ✅ 머징 브랜치 생성 및 upstream 최신화
- ✅ 작업 환경 검증 완료

#### 예상 위험 및 대응
- ⚠️ **위험**: upstream remote 미설정
  - **대응**: `git remote add upstream https://github.com/cline/cline.git`
- ⚠️ **위험**: 컴파일 실패 (현재 main)
  - **대응**: 백업 후 진행, 현재 상태 기록

---

### Phase 2: Upstream 완전 채택 ✅ **완료**

**목표**: Cline 최신 버전 완전 채택 (Caret 수정 모두 제거)

**예상 시간**: 1-2시간
**현재 상태**: ✅ 완료 (2025-10-09)
**커밋**: `03177da87`

#### 작업 전략

**핵심 원칙**: Hard Reset + Caret 디렉토리 복원

```bash
# 1. 현재 Caret 전용 디렉토리 백업
mkdir -p /tmp/caret-backup-20251009
cp -r caret-src /tmp/caret-backup-20251009/
cp -r caret-docs /tmp/caret-backup-20251009/
cp -r assets /tmp/caret-backup-20251009/
cp -r caret-scripts /tmp/caret-backup-20251009/
cp -r .caretrules /tmp/caret-backup-20251009/

# 2. Cline upstream 최신으로 Hard Reset
git reset --hard upstream/main

# 3. Caret 전용 디렉토리 복원
cp -r /tmp/caret-backup-20251009/caret-src ./
cp -r /tmp/caret-backup-20251009/caret-docs ./
cp -r /tmp/caret-backup-20251009/assets ./
cp -r /tmp/caret-backup-20251009/caret-scripts ./
cp -r /tmp/caret-backup-20251009/.caretrules ./

# 4. Git에 추가
git add caret-src/ caret-docs/ assets/ caret-scripts/ .caretrules/
git commit -m "chore: Restore Caret-specific directories after upstream reset"
```

#### 작업 단계

##### Step 2.1: Caret 전용 디렉토리 백업
**체크리스트**:
- [ ] `caret-src/` 백업 완료
- [ ] `caret-docs/` 백업 완료
- [ ] `assets/` 백업 완료
- [ ] `caret-scripts/` 백업 완료
- [ ] `.caretrules/` 백업 완료
- [ ] 백업 파일 크기 확인 (예상: ~10MB)

##### Step 2.2: Upstream Hard Reset
**체크리스트**:
- [ ] `git reset --hard upstream/main` 실행
- [ ] reset 후 커밋 해시 기록: `_______________`
- [ ] Caret 디렉토리 삭제 확인 (정상)
- [ ] Cline 원본 파일 존재 확인

##### Step 2.3: Caret 디렉토리 복원
**체크리스트**:
- [ ] 모든 Caret 디렉토리 복원 완료
- [ ] `git status` 확인 (untracked files)
- [ ] Git에 추가 및 커밋
- [ ] 커밋 메시지 확인

##### Step 2.4: 초기 상태 검증
```bash
# 컴파일 시도 (실패 예상)
npm run compile 2>&1 | tee logs/phase2-compile-errors.log

# 오류 개수 확인
grep -c "error TS" logs/phase2-compile-errors.log
```

**체크리스트**:
- [ ] 컴파일 오류 로그 저장
- [ ] 오류 개수 기록: `_____ 개`
- [ ] 오류 타입 분류 (import, type, missing 등)

#### 완료 기준
- ✅ Cline upstream 완전 채택 완료
- ✅ Caret 전용 디렉토리 복원 완료
- ✅ 초기 컴파일 오류 파악 완료

#### 예상 결과
- **컴파일 실패 예상**: Caret import 오류, proto 미생성 등
- **다음 단계**: Proto 재구현으로 해결

---

### Phase 3: Proto 재구현 ✅ **완료**

**목표**: Caret gRPC Proto 파일 재구현 및 코드 생성

**예상 시간**: 2-3시간
**현재 상태**: ✅ 완료 (2025-10-09)
**커밋**: `8716ff2b4`, `ba3afbc2f`, `edad3ac87`

#### 작업 단계

##### Step 3.1: Proto 파일 재확인
**체크리스트**:
- [ ] `proto/caret/*.proto` 파일 목록 확인
  - [ ] `account.proto`
  - [ ] `browser.proto`
  - [ ] 기타 Caret proto 파일들
- [ ] Proto 파일 문법 검증
- [ ] Cline proto와 필드 번호 충돌 확인

##### Step 3.2: Proto 코드 생성
```bash
# Proto 코드 생성
npm run protos

# 생성된 파일 확인
ls -la src/generated/caret/
```

**체크리스트**:
- [ ] Proto 코드 생성 성공
- [ ] `src/generated/caret/` 파일들 생성 확인
- [ ] TypeScript 타입 정의 생성 확인
- [ ] gRPC 서비스 코드 생성 확인

##### Step 3.3: Proto 관련 컴파일 오류 해결
**체크리스트**:
- [ ] Proto import 오류 해결
- [ ] 네임스페이스 충돌 해결 (있다면)
- [ ] Proto 관련 컴파일 오류 0개 확인

#### 완료 기준
- ✅ 모든 Caret proto 파일 정상 생성
- ✅ Proto 관련 컴파일 오류 해결
- ✅ gRPC 서비스 코드 준비 완료

---

### Phase 4: Backend 재구현 (Feature별 순차) 🔄 **40% 진행중**

**목표**: F01-F11 Backend 부분 순차 재구현 + Cline v3.32.7 타입 오류 해결

**예상 시간**: 11-15시간 (타입 충돌 해결 3시간 포함)
**현재 상태**: 🔄 진행중 (F09 ✅, F03 ✅, F08 ✅)

**⚠️ 중요**: Cline v3.32.7은 9개의 TypeScript 타입 오류로 빌드 실패합니다.
Caret은 이미 모든 오류를 해결했으므로, 머징 시 Caret의 솔루션을 보호해야 합니다.

**📚 참고 문서**: `cline-v3.32.7-root-cause-analysis.md` - 9개 오류 상세 분석 및 Caret 솔루션

#### ⭐ 모든 Phase 4.x 작업에 공통으로 포함되는 단계

**Feature 문서 복원 및 업데이트** (필수):
1. `caret-docs/features/fXX-*.mdx` 파일을 backup 브랜치에서 복원
2. Modified Files 섹션을 현재 구현 상황에 맞게 업데이트
3. Implementation Status 업데이트 (Backend ✅/🔄, Frontend ⏸️)
4. Merge Notes 추가 (특이사항, lint 오류, 보류 사항 등 기록)

**⚠️ 중요**: Feature 구현만 하고 문서를 잊으면 안됩니다! 각 Phase마다 반드시 문서 작업 포함!

#### 재구현 순서 (의존성 기반)

```
Phase 4.0: 타입 확장 파일 보호 (신규 추가) ⭐ 최우선
Phase 4.1: F09 (FeatureConfig) - 다른 Feature 의존
Phase 4.2: F03 (Branding) - disk.ts 포함
Phase 4.3: F08 (Persona) - disk.ts 공유, F03 이후
Phase 4.4: F02 (Multilingual) - **순서 변경** ⭐ UI 기능들의 기반 (F08 Persona 의존)
Phase 4.5: F06 (JSON Prompt) - system-prompt 분기
Phase 4.6: F11 (Input History) - controller/index.ts
Phase 4.7: F01 (Common Util) - 최소 침습
Phase 4.8: F04 (Caret Account) - 독립, 낮은 위험
Phase 4.9: F05 (Rule Priority) - (검증 필요)
Phase 4.10: F10 (Provider Setup) - API transform (마지막)
Phase 4.11: (미사용 - 예약)
Phase 4.12: 타입 충돌 최종 해결 (신규 추가) ⭐ 필수 검증
```

---

#### Phase 4.0: 타입 확장 파일 보호 ✅ **완료**

**목표**: Caret의 핵심 타입 솔루션 파일을 Cline upstream 머징 전에 보호

**예상 시간**: 30분
**완료 날짜**: 2025-10-09
**커밋**: `ee6af3cf3`
**위험도**: 🔴 **매우 높음** - 이 파일이 손상되면 9개 타입 오류 재발생

**배경**:
- Cline v3.32.7은 9개의 TypeScript 타입 오류로 빌드 실패
- Caret은 **중앙화된 타입 확장 파일** (`src/types/vscode-extensions.d.ts`)로 모든 오류 해결
- Cline upstream 머징 시 이 파일이 삭제되거나 덮어쓰기될 위험 존재

##### 작업 단계

**Step 1: 핵심 타입 파일 백업**
```bash
# 타입 확장 파일 백업 (최우선)
cp src/types/vscode-extensions.d.ts caret-src/types/vscode-extensions.d.ts.backup

# PostHog 솔루션 백업 (node-machine-id 대체)
cp src/services/posthog/PostHogClientProvider.ts caret-src/backup/PostHogClientProvider.ts.backup

# vscode-context.ts 백업 (ExtensionRegistryInfo 대체)
cp src/standalone/vscode-context.ts caret-src/backup/vscode-context.ts.backup
```

**체크리스트**:
- [ ] `src/types/vscode-extensions.d.ts` 백업 완료
- [ ] `PostHogClientProvider.ts` 백업 완료
- [ ] `vscode-context.ts` 백업 완료
- [ ] 백업 파일 읽기 가능 확인

**Step 2: Git Merge 전략 설정**
```bash
# .gitattributes 파일 생성 (머징 전략 설정)
cat >> .gitattributes << 'EOF'
# Caret 타입 솔루션 파일 - 충돌 시 Caret 버전 우선
src/types/vscode-extensions.d.ts merge=ours
src/core/api/providers/vscode-lm.ts merge=ours
src/integrations/terminal/TerminalManager.ts merge=ours
src/services/posthog/PostHogClientProvider.ts merge=ours
src/standalone/vscode-context.ts merge=ours
src/services/mcp/McpHub.ts merge=ours
EOF

# Git merge driver 설정
git config merge.ours.driver true
```

**체크리스트**:
- [ ] `.gitattributes` 파일 생성 완료
- [ ] `merge=ours` 전략 6개 파일 설정 확인
- [ ] Git merge driver 설정 완료

**Step 3: 타입 파일 검증**
```bash
# 타입 확장 파일 내용 확인
cat src/types/vscode-extensions.d.ts | head -20

# 파일 크기 확인 (약 108줄)
wc -l src/types/vscode-extensions.d.ts

# 핵심 타입 선언 확인
grep -E "(LanguageModelChatMessageRole|Terminal|shellIntegration)" src/types/vscode-extensions.d.ts
```

**체크리스트**:
- [ ] 타입 파일 내용 정상 (Language Model API + Terminal API 타입)
- [ ] 파일 크기 약 108줄 확인
- [ ] 핵심 타입 선언 3개 이상 존재 확인

**완료 기준**:
- ✅ 모든 핵심 타입 파일 백업 완료
- ✅ Git merge 전략 설정 완료
- ✅ 타입 파일 검증 완료

**⚠️ 절대 규칙**:
1. `src/types/vscode-extensions.d.ts` 파일은 **절대 삭제 금지**
2. Cline upstream 머징 시 이 파일에 conflict 발생하면 **무조건 Caret 버전 선택**
3. Phase 4.12에서 최종 검증 전까지 이 파일 **수정 금지**

---

#### Phase 4.1: F09 - Feature Config System ✅ **완료**

**예상 시간**: 1시간
**완료 날짜**: 2025-10-09
**커밋**: `01b96bd2e`

##### 작업 단계
1. **Caret 전용 파일 검증** (이미 복원됨)
   - [x] `caret-src/shared/FeatureConfig.ts` 존재 확인
   - [x] `caret-src/shared/feature-config.json` 존재 확인

2. **Cline 파일 최소 침습 수정**
   - [x] `src/core/storage/StateManager.ts` 수정
     - [x] FeatureConfig import 추가
     - [x] 기본 provider 설정 시 FeatureConfig 사용
     - [x] `// CARET MODIFICATION:` 주석 추가
   - [x] 컴파일 테스트

3. **검증**
   - [x] FeatureConfig 로딩 확인
   - [x] 기본 provider 설정 동작 확인
   - [x] 컴파일 성공

4. **Feature 문서 복원 및 업데이트** ⭐ **중요**
   - [x] `caret-docs/features/f09-feature-config-system.mdx` 복원
   - [ ] Modified Files 섹션 업데이트 (현재 구현 상황 반영)
   - [ ] Implementation Status 업데이트 (Backend ✅, Frontend ⏸️)
   - [ ] Merge Notes 추가 (특이사항 기록)

**완료 기준**: F09 Backend 재구현 완료, StateManager 정상 동작, Feature 문서 업데이트

---

#### Phase 4.2: F03 - Branding UI (Backend) ✅ **완료**

**예상 시간**: 2-3시간
**완료 날짜**: 2025-10-10
**커밋**: `d90c6af31`

##### 작업 단계
1. **disk.ts 수정 (1차: 브랜딩)**
   - [x] `src/core/storage/disk.ts` 파일 열기
   - [x] 브랜딩 파일 경로 관련 수정 추가 (brand resolution system)
   - [x] `// CARET MODIFICATION:` 주석 추가
   - [x] F08 Persona 파일명 함께 추가

2. **package.json 브랜딩 (자동화)** - ⏸️ **보류** (Frontend에서 처리)
   - [ ] `caret-scripts/brand-*.sh` 스크립트 실행
   - [ ] package.json 42개+ 필드 브랜딩 확인
   - [ ] 명령어 네임스페이스 변경 (`cline.*` → `caret.*`)

3. **기타 브랜딩 파일 수정** - ⏸️ **보류** (F03 문서 재확인 필요)
   - [ ] (F03 문서 재검토 후 결정)

4. **검증**
   - [x] 브랜딩 파일 경로 정상 동작
   - [ ] package.json 브랜딩 완료 (Frontend Phase)
   - [x] 컴파일 성공 (TypeScript 0 errors)

5. **Feature 문서 복원 및 업데이트** ⭐ **중요**
   - [x] `caret-docs/features/f03-branding-ui.mdx` 복원
   - [ ] Modified Files 섹션 업데이트 (disk.ts만 Backend에서 수정)
   - [ ] Implementation Status 업데이트 (Backend 부분 완료)
   - [ ] Merge Notes 추가 (package.json은 Frontend Phase로 연기)

**완료 기준**: F03 Backend 재구현 완료, disk.ts 1차 수정 완료

---

#### Phase 4.3: F08 - Persona System (Backend) ✅ **완료**

**예상 시간**: 1.5시간
**완료 날짜**: 2025-10-10
**커밋**: `d90c6af31` (F03와 함께)

##### 작업 단계
1. **extension.ts 수정** - ⏸️ **보류** (Frontend Phase에서 처리)
   - [ ] `src/extension.ts` 파일 열기
   - [ ] CaretProviderWrapper import 및 초기화
   - [ ] `// CARET MODIFICATION:` 주석 추가

2. **disk.ts 수정 (2차: 페르소나)**
   - [x] `src/core/storage/disk.ts` 파일 수정 (F03와 함께 완료)
   - [x] 페르소나 파일 경로 관련 수정 추가 (persona.md, customInstructions.md, templateCharacters.json)
   - [x] `// CARET MODIFICATION:` 주석 추가 (F08 부분)

3. **Caret 전용 파일 복원**
   - [x] `caret-src/core/webview/CaretProviderWrapper.ts` 복원
   - [x] `caret-src/services/persona/*.ts` 복원 (4개 파일)
   - [x] `caret-src/managers/CaretGlobalManager.ts` 복원 (F11 의존)
   - [x] `caret-src/shared/ModeSystem.ts` 복원
   - [x] 타입 오류 수정 (getClientId, getAllInstances)
   - [x] Lint 오류 수정 (forEach → for-of)

4. **검증**
   - [ ] CaretProviderWrapper 초기화 확인 (Frontend Phase)
   - [x] 페르소나 파일 경로 정상 동작
   - [x] 컴파일 성공 (TypeScript 0 errors)

5. **Feature 문서 복원 및 업데이트** ⭐ **중요**
   - [x] `caret-docs/features/f08-persona-system.mdx` 복원
   - [ ] Modified Files 섹션 업데이트 (Backend 파일 목록)
   - [ ] Implementation Status 업데이트 (Backend 부분 완료, extension.ts는 Frontend)
   - [ ] Merge Notes 추가 (Lint 오류 2개 남음)

**완료 기준**: F08 Backend 재구현 완료, disk.ts 최종 완료

**⚠️ 주의**: disk.ts는 F03 + F08 양쪽 수정 (순서 중요!)

---

#### Phase 4.4: F02 - Multilingual i18n (Backend) ⭐ **순서 변경** ✅ **완료**

**예상 시간**: 30분 → **실제**: 25분
**중요도**: 🔴 **높음** - F08 Persona 등 UI 기능들의 기반
**완료일**: 2025-10-10

##### 작업 단계
1. **Languages.ts 수정**
   - [x] `src/shared/Languages.ts` 파일 열기
   - [x] UILanguageKey 타입 추가 (ko, en, ja, zh-CN)
   - [x] LLM_TO_UI_LANGUAGE_MAP 매핑 객체 추가
   - [x] DIRECT_UI_SUPPORTED_LANGUAGES 배열 추가
   - [x] isUILanguageSupported() 유틸리티 함수 추가
   - [x] getUILanguageKey() 유틸리티 함수 추가 (보너스)
   - [x] `// CARET MODIFICATION:` 주석 추가

2. **검증**
   - [x] 언어 매핑 함수 정상 동작
   - [x] 컴파일 성공 (TypeScript: 0 errors, Lint: 0 errors)

3. **Feature 문서 복원 및 업데이트**
   - [x] `caret-docs/features/f02-multilingual-i18n.mdx` 복원
   - [x] Modified Files 확인 (Languages.ts만 Backend)
   - [x] Implementation Status 업데이트

**완료 기준**: ✅ F02 Backend 재구현 완료, 언어 유틸리티 정상 동작

**⚠️ 주의**: Frontend 파일 3개 (i18n.ts, Context, Hook)는 Phase 5에서 처리

**변경 파일**:
- `src/shared/Languages.ts` (+59 lines)
- `caret-src/core/prompts/system/adapters/CaretJsonAdapter.ts` (lint fix: -2 unused imports)

---

#### Phase 4.5: F06 - JSON System Prompt (Backend)

**예상 시간**: 1.5-2시간

##### 작업 단계
1. **system-prompt/index.ts 수정**
   - [x] `src/core/prompts/system-prompt/index.ts` 파일 열기 (F06 파일 복원 완료)
   - [x] Caret 모드 분기 로직 추가 (진입점만)
   - [x] `// CARET MODIFICATION:` 주석 추가

2. **Caret 전용 파일 복원**
   - [x] `caret-src/core/prompts/CaretPromptWrapper.ts` 복원
   - [x] `caret-src/core/modes/CaretModeManager.ts` 복원
   - [x] `caret-src/core/prompts/system/*.ts` 복원
   - [x] `caret-src/core/prompts/sections/*.json` 복원

3. **검증**
   - [ ] Caret 모드 분기 정상 동작
   - [ ] Cline 모드 영향 없음 확인
   - [ ] 컴파일 성공

4. **Feature 문서 복원 및 업데이트**
   - [x] `caret-docs/features/f06-json-system-prompt.mdx` 복원
   - [ ] Modified Files 확인
   - [ ] Implementation Status 업데이트

**완료 기준**: F06 Backend 재구현 완료, system-prompt 분기 정상

**🔗 F07 참고**: F07(Chatbot/Agent)은 F06과 구현 공유, 별도 작업 없음

---

#### Phase 4.6: F11 - Input History System (Backend)

**예상 시간**: 1시간

##### 작업 단계
1. **controller/index.ts 수정**
   - [ ] `src/core/controller/index.ts` 파일 열기
   - [ ] `getStateToPostToWebview` 함수에 inputHistory 추가
   - [ ] `// CARET MODIFICATION:` 주석 추가

2. **CaretGlobalManager 검증**
   - [ ] `caret-src/managers/CaretGlobalManager.ts` 존재 확인
   - [ ] inputHistory 관리 메서드 확인

3. **검증**
   - [ ] inputHistory 상태 전달 확인
   - [ ] 컴파일 성공

**완료 기준**: F11 Backend 재구현 완료, controller 정상

---

#### Phase 4.6: F01 - Common Util (Backend)

**예상 시간**: 30분

##### 작업 단계
1. **extract-text.ts 원본 복원**
   ```bash
   git checkout upstream/main -- src/integrations/misc/extract-text.ts
   ```
   - [ ] lint 수정 제거 (최소 침습 원칙)

2. **detect-omission.ts 확인**
   - [ ] GitHub URL 변경은 F03 브랜딩 포함됨
   - [ ] 별도 작업 불필요

3. **검증**
   - [ ] 컴파일 성공

**완료 기준**: F01 Backend 재구현 완료 (최소 작업)

---

#### Phase 4.7: F04 - Caret Account (Backend)

**예상 시간**: 30분

##### 작업 단계
1. **gRPC 핸들러 검증**
   - [ ] `src/core/controller/caretAccount/*.ts` 존재 확인 (9개)
   - [ ] CaretAccountService 존재 확인

2. **검증**
   - [ ] gRPC 서비스 등록 확인
   - [ ] 컴파일 성공

**완료 기준**: F04 Backend 재구현 완료 (거의 독립)

---

#### Phase 4.8: F05 - Rule Priority System (Backend)

**예상 시간**: 2-3시간

**⚠️ 검증 필요**: F05 문서에서 정확한 침습 파일 목록 재확인 필요

##### 작업 단계
1. **F05 문서 재검토**
   - [ ] Modified Files 섹션 확인
   - [ ] 실제 수정 파일 목록 파악

2. **(작업 내용 미정 - F05 검증 후 업데이트)**

**완료 기준**: F05 Backend 재구현 완료

---

#### Phase 4.9: F10 - Provider Setup (Backend) ⚠️

**예상 시간**: 2-3시간

**⚠️ 고위험**: API transform 파일들 - Cline 최신 변경 많을 가능성

##### 작업 단계
1. **Cline 최신 API transform 검토**
   - [ ] `src/core/api/transform/openrouter-stream.ts` 확인
   - [ ] `src/core/api/transform/vercel-ai-gateway-stream.ts` 확인
   - [ ] Cline 최신 로직 파악

2. **전략 결정**
   - [ ] Option A: Cline 최신 로직 우선 채택 (권장)
   - [ ] Option B: Caret 최적화 재적용
   - [ ] 모델별 설정 외부화 검토

3. **gRPC 프로바이더 설정 재구현**
   - [ ] (F10 문서 재확인 필요)

4. **검증**
   - [ ] API transform 정상 동작
   - [ ] 프로바이더 설정 UI 연동 확인
   - [ ] 컴파일 성공

**완료 기준**: F10 Backend 재구현 완료

---

#### Phase 4.10: F02 - Multilingual (Backend) ⚠️

**예상 시간**: 1-2시간

**⚠️ 검증 필요**: F02 정확한 침습 파일 목록 재확인 필요

##### 작업 단계
1. **F02 문서 재검토**
   - [ ] Modified Files 섹션 확인
   - [ ] Caret-specific 파일 vs Cline 수정 파일 분류
   - [ ] 침습 범위 최소화 방안 검토

2. **다국어 시스템 재구현**
   - [ ] 다국어 관련 파일 확인 및 재구현
   - [ ] 언어 설정 관련 로직 복원

3. **검증**
   - [ ] 다국어 시스템 정상 동작
   - [ ] 컴파일 성공

**완료 기준**: F02 Backend 재구현 완료

---

#### Phase 4.12: 타입 충돌 최종 해결 ⭐ **필수 검증**

**목표**: Cline v3.32.7의 9개 타입 오류가 재발생하지 않았는지 최종 검증 및 해결

**예상 시간**: 1.5-2시간
**위험도**: 🔴 **매우 높음** - 이 단계를 통과해야 빌드 가능

**배경**:
- Phase 4.1-4.11 동안 Cline upstream 코드가 머징되었음
- Cline의 타입 충돌 코드가 **재등장**했을 가능성 높음
- Caret의 중앙화된 타입 확장 솔루션을 **최종 검증** 필요

##### 작업 단계

**Step 1: 빌드 상태 확인**
```bash
# 타입 체크 실행 (오류 발생 예상)
npm run check-types 2>&1 | tee build-errors.log

# 오류 개수 확인
grep "error TS" build-errors.log | wc -l

# 오류 파일 목록 추출
grep "error TS" build-errors.log | awk -F: '{print $1}' | sort | uniq
```

**체크리스트**:
- [ ] 빌드 오류 로그 저장 완료
- [ ] 오류 개수 파악 (예상: 0-9개)
- [ ] 오류 파일 목록 추출 완료

**Step 2: 중복 타입 선언 제거 (vscode-lm.ts)**
```bash
# vscode-lm.ts에서 중복 타입 선언 확인
grep -n "declare module \"vscode\"" src/core/api/providers/vscode-lm.ts

# 중복 선언이 있으면 제거하고 reference만 유지
# ✅ 올바른 상태:
#   /// <reference path="../../../types/vscode-extensions.d.ts" />
#   (declare module "vscode" 섹션 없음)
```

**수정 필요 시**:
```typescript
// ❌ 잘못된 상태 (제거 필요)
declare module "vscode" {
	enum LanguageModelChatMessageRole { ... }
	// ...
}

// ✅ 올바른 상태 (유지)
/// <reference path="../../../types/vscode-extensions.d.ts" />
```

**체크리스트**:
- [ ] `vscode-lm.ts`에 `declare module "vscode"` 없음 확인
- [ ] `/// <reference>` 지시어 존재 확인
- [ ] 파일 저장 완료

**Step 3: Terminal 타입 선언 제거 (TerminalManager.ts)**
```bash
# TerminalManager.ts에서 중복 타입 선언 확인
grep -n "declare module \"vscode\"" src/integrations/terminal/TerminalManager.ts

# 주석 확인
grep -n "CLINE BUG FIX" src/integrations/terminal/TerminalManager.ts
```

**수정 필요 시**:
```typescript
// ❌ 잘못된 상태 (제거 필요)
declare module "vscode" {
	interface Terminal {
		shellIntegration?: { ... }
	}
}

// ✅ 올바른 상태 (유지)
// CLINE BUG FIX: VSCode type extensions moved to centralized location (src/types/vscode-extensions.d.ts)
```

**체크리스트**:
- [ ] `TerminalManager.ts`에 `declare module "vscode"` 없음 확인
- [ ] "CLINE BUG FIX" 주석 존재 확인
- [ ] 파일 저장 완료

**Step 4: distinctId.ts 파일 미생성 확인**
```bash
# distinctId.ts 파일 존재 여부 확인
ls -la src/services/logging/distinctId.ts 2>&1

# node-machine-id import 검색
grep -r "node-machine-id" src/
```

**파일이 존재하면 제거**:
```bash
# distinctId.ts 삭제
rm src/services/logging/distinctId.ts
rm src/services/logging/distinctId.test.ts 2>/dev/null || true

# PostHogClientProvider 확인
grep -n "ENV_ID" src/services/posthog/PostHogClientProvider.ts
```

**체크리스트**:
- [ ] `distinctId.ts` 파일 미존재 확인
- [ ] `PostHogClientProvider.ts`에 `ENV_ID` fallback 체인 존재 확인
- [ ] `node-machine-id` import 없음 확인

**Step 5: vscode-context.ts ExtensionRegistryInfo 제거**
```bash
# ExtensionRegistryInfo import 확인
grep -n "ExtensionRegistryInfo" src/standalone/vscode-context.ts

# getPackageVersion 함수 확인
grep -n "getPackageVersion" src/standalone/vscode-context.ts
```

**수정 필요 시**:
```typescript
// ❌ 잘못된 상태 (제거 필요)
import { ExtensionRegistryInfo } from "@/registry"
log("Running standalone cline", ExtensionRegistryInfo.version)
id: ExtensionRegistryInfo.id,

// ✅ 올바른 상태 (유지)
const VERSION = getPackageVersion()
log("Running standalone cline ", VERSION)
id: "saoudrizwan.claude-dev",
```

**체크리스트**:
- [ ] `ExtensionRegistryInfo` import 없음 확인
- [ ] `getPackageVersion()` 함수 존재 확인
- [ ] 하드코딩된 ID 사용 확인

**Step 6: McpHub.ts 타입 명시**
```bash
# MCP notification handler 타입 확인
grep -n "fallbackNotificationHandler.*async" src/services/mcp/McpHub.ts
```

**수정 필요 시**:
```typescript
// ❌ 잘못된 상태 (타입 누락)
connection.client.fallbackNotificationHandler = async (notification) => {

// ✅ 올바른 상태 (any 타입 명시)
connection.client.fallbackNotificationHandler = async (notification: any) => {
```

**체크리스트**:
- [ ] `notification: any` 타입 명시 확인
- [ ] 파일 저장 완료

**Step 7: 중앙 타입 확장 파일 최종 검증**
```bash
# 타입 확장 파일 존재 확인
ls -la src/types/vscode-extensions.d.ts

# 파일 크기 확인 (약 108줄)
wc -l src/types/vscode-extensions.d.ts

# 핵심 타입 선언 확인
grep -E "(LanguageModelChatMessageRole|Terminal|shellIntegration)" src/types/vscode-extensions.d.ts | wc -l
```

**체크리스트**:
- [ ] 타입 확장 파일 존재 확인
- [ ] 파일 크기 약 108줄 확인
- [ ] 핵심 타입 선언 3개 이상 확인

**Step 8: 최종 빌드 검증**
```bash
# 타입 체크 (반드시 성공해야 함)
npm run check-types

# 컴파일 (반드시 성공해야 함)
npm run compile

# 오류가 있으면 다시 Step 1로
```

**체크리스트**:
- [ ] `npm run check-types` 성공 (0 errors)
- [ ] `npm run compile` 성공
- [ ] 생성된 `.js` 파일 확인

**완료 기준**:
- ✅ **모든 타입 오류 해결 완료** (0 errors)
- ✅ 중앙화된 타입 확장 파일 정상 작동
- ✅ Cline의 타입 충돌 코드 완전 제거
- ✅ 컴파일 성공

**⚠️ 만약 오류가 계속되면**:
1. Phase 4.0에서 백업한 파일들 복원:
   ```bash
   cp caret-src/types/vscode-extensions.d.ts.backup src/types/vscode-extensions.d.ts
   cp caret-src/backup/PostHogClientProvider.ts.backup src/services/posthog/PostHogClientProvider.ts
   cp caret-src/backup/vscode-context.ts.backup src/standalone/vscode-context.ts
   ```
2. 다시 Step 7-8 실행
3. 여전히 실패하면 **Phase 4 전체 롤백** 고려

**참고 문서**:
- `cline-v3.32.7-root-cause-analysis.md` - 9개 오류 상세 분석
- `cline-v3.32.7-quick-fixes.md` - 빠른 해결 방법 (obsolete, 참고용)

---

#### Phase 4 전체 완료 기준

- ✅ F01-F11 Backend 모두 재구현 완료
- ✅ 컴파일 성공 (`npm run compile`)
- ✅ 타입 체크 통과 (`npm run check-types`)
- ✅ Backend 테스트 통과 (`npm run test:backend`)
- ✅ 모든 CARET MODIFICATION 주석 확인

---

### Phase 5: Frontend 재구현 (Feature별 순차)

**목표**: F01-F11 Frontend 부분 순차 재구현

**예상 시간**: 8-12시간
**현재 상태**: ⏸️ 대기 중 (Phase 4 완료 후)

#### 재구현 순서

```
Phase 5.1: F01 (CommonUtil) - ExtensionStateContext
Phase 5.2: F04 (CaretAccount) - AccountView
Phase 5.3: F09 (FeatureConfig) - UI 컴포넌트들
Phase 5.4: F08 (Persona) - ChatRow 등
Phase 5.5: F11 (InputHistory) - ChatTextArea
Phase 5.6: F02 (i18n) - 다수 컴포넌트 (광범위)
Phase 5.7: F03 (Branding) - UI 컴포넌트들 (광범위)
```

#### Phase 5.1: F01 - Common Util (Frontend)

**예상 시간**: 30분

##### 작업 단계
- [ ] `webview-ui/src/context/ExtensionStateContext.tsx` 수정
  - [ ] CaretGlobalManager import 및 호출 추가
  - [ ] `// CARET MODIFICATION:` 주석 추가
- [ ] 컴파일 테스트

**완료 기준**: F01 Frontend 재구현 완료

---

#### Phase 5.2: F04 - Caret Account (Frontend)

**예상 시간**: 30분

##### 작업 단계
- [ ] `webview-ui/src/components/account/AccountView.tsx` 수정
  - [ ] caretUser 체크 및 CaretAccountView 분기
  - [ ] `// CARET MODIFICATION:` 주석 추가
- [ ] Caret UI 컴포넌트 검증
  - [ ] `webview-ui/src/caret/components/account/**/*.tsx` 존재 확인

**완료 기준**: F04 Frontend 재구현 완료

---

#### Phase 5.3: F09 - Feature Config System (Frontend)

**예상 시간**: 1.5시간

##### 작업 단계
- [ ] `webview-ui/src/components/settings/ApiOptions.tsx` 수정
  - [ ] FeatureConfig 기반 프로바이더 필터링
  - [ ] `// CARET MODIFICATION:` 주석 추가
- [ ] `webview-ui/src/components/chat/task-header/TaskHeader.tsx` 수정
  - [ ] 비용 정보 표시 제어
  - [ ] `// CARET MODIFICATION:` 주석 추가
- [ ] `webview-ui/src/components/chat/ChatRow.tsx` 수정
  - [ ] 비용 정보 표시 제어
  - [ ] `// CARET MODIFICATION:` 주석 추가

**완료 기준**: F09 Frontend 재구현 완료

---

#### Phase 5.4: F08 - Persona System (Frontend)

**예상 시간**: 1시간

##### 작업 단계
- [ ] `webview-ui/src/components/chat/ChatRow.tsx` 추가 수정
  - [ ] 페르소나 UI 통합
  - [ ] `// CARET MODIFICATION:` 주석 추가 (F08 부분)

**완료 기준**: F08 Frontend 재구현 완료

---

#### Phase 5.5: F11 - Input History System (Frontend)

**예상 시간**: 1시간

##### 작업 단계
- [ ] `webview-ui/src/components/chat/ChatTextArea.tsx` 수정
  - [ ] useInputHistory 훅 통합
  - [ ] `// CARET MODIFICATION:` 주석 추가
- [ ] Caret 훅 검증
  - [ ] `webview-ui/src/caret/hooks/usePersistentInputHistory.ts` 존재 확인
  - [ ] `webview-ui/src/caret/hooks/useInputHistory.ts` 존재 확인

**완료 기준**: F11 Frontend 재구현 완료

---

#### Phase 5.6: F02 - Multilingual i18n (Frontend) ⚠️

**예상 시간**: 3-4시간

**⚠️ 광범위**: 다수 UI 컴포넌트 i18n 적용

##### 작업 단계
1. **i18n 시스템 검증**
   - [ ] `webview-ui/src/caret/utils/i18n.ts` 존재 확인
   - [ ] 번역 파일들 존재 확인

2. **컴포넌트별 i18n 적용**
   - [ ] (F02 문서에서 목록 확인 필요)
   - [ ] 동적 번역 함수 패턴 적용
   - [ ] useMemo 의존성 추가

3. **검증**
   - [ ] 4개 언어 모두 정상 동작
   - [ ] 언어 전환 정상

**완료 기준**: F02 Frontend 재구현 완료

---

#### Phase 5.7: F03 - Branding UI (Frontend) ⚠️

**예상 시간**: 3-4시간

**⚠️ 광범위**: 다수 UI 컴포넌트 브랜딩 적용

##### 작업 단계
1. **Caret UI 컴포넌트 검증**
   - [ ] CaretWelcome.tsx
   - [ ] CaretAnnouncement.tsx
   - [ ] CaretFooter.tsx
   - [ ] 기타 브랜딩 컴포넌트들

2. **기존 컴포넌트 통합**
   - [ ] (F03 문서에서 목록 확인 필요)
   - [ ] 브랜딩 요소 적용
   - [ ] 이미지 경로 확인

3. **검증**
   - [ ] Caret 로고 및 색상 정상 표시
   - [ ] 다크/라이트 모드 지원
   - [ ] 웰컴 페이지 정상 동작

**완료 기준**: F03 Frontend 재구현 완료

---

#### Phase 5 전체 완료 기준

- ✅ F01-F11 Frontend 모두 재구현 완료
- ✅ 컴파일 성공 (`npm run compile`)
- ✅ 타입 체크 통과 (`npm run check-types`)
- ✅ Frontend 테스트 통과 (`npm run test:webview`)
- ✅ 모든 CARET MODIFICATION 주석 확인

---

### Phase 6: 최종 검증 및 배포

**목표**: 통합 테스트 및 배포 준비

**예상 시간**: 4-6시간
**현재 상태**: ⏸️ 대기 중 (Phase 5 완료 후)

#### 작업 단계

##### Step 6.1: 통합 테스트
```bash
# 전체 컴파일
npm run compile

# 타입 체크
npm run check-types

# 전체 테스트
npm run test:all

# E2E 테스트
npm run test:e2e
```

**체크리스트**:
- [ ] 컴파일 성공
- [ ] 타입 체크 통과
- [ ] Backend 테스트 통과
- [ ] Frontend 테스트 통과
- [ ] E2E 테스트 통과

##### Step 6.2: 수동 기능 테스트

**F01-F11 Feature별 검증**:
- [ ] F01: CaretGlobalManager 정상 동작
- [ ] F02: 4개 언어 전환 정상
- [ ] F03: Caret 브랜딩 정상 표시
- [ ] F04: Caret 계정 시스템 정상
- [ ] F05: Rule Priority 시스템 정상
- [ ] F06: JSON System Prompt 정상
- [ ] F07: Chatbot/Agent 모드 정상
- [ ] F08: Persona 시스템 정상
- [ ] F09: Feature Config 정상 동작
- [ ] F10: 프로바이더 설정 정상
- [ ] F11: Input History 정상

##### Step 6.3: 성능 및 안정성 검증
- [ ] 메모리 누수 체크
- [ ] 로딩 성능 측정
- [ ] 오류 로그 확인
- [ ] 브라우저 콘솔 오류 확인

##### Step 6.4: 문서 업데이트
- [ ] CHANGELOG.md 업데이트 (v0.3.0)
- [ ] README.md 업데이트 (버전 정보)
- [ ] 머징 과정 로그 정리
- [ ] Feature 문서 최종 검토

##### Step 6.5: 최종 커밋 및 배포 준비
```bash
# 최종 커밋
git add .
git commit -m "feat: Caret v0.3.0 - Cline upstream complete adoption + 11 features

Cline upstream 최신 완전 채택 + Caret 11개 Features 재구현 완료

Features:
- F01: Common Util (CaretGlobalManager)
- F02: Multilingual i18n (4 languages)
- F03: Branding UI (Complete Caret branding)
- F04: Caret Account (99% independent)
- F05: Rule Priority System
- F06: JSON System Prompt (Caret mode)
- F07: Chatbot/Agent Mode (UX layer)
- F08: Persona System (Hybrid pattern)
- F09: Feature Config System (Static config)
- F10: Enhanced Provider Setup (gRPC + API)
- F11: Input History System (CaretGlobalManager)

Strategy: Adapter Pattern (Cline complete + Caret minimal invasion)
Phase 3 Failure Lessons Applied: Minimal invasion, step-by-step verification

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# main 브랜치에 머지 (또는 PR 생성)
git checkout main
git merge merge/cline-upstream-20251009

# 태그 생성
git tag v0.3.0
```

**체크리스트**:
- [ ] 최종 커밋 완료
- [ ] main 브랜치 머지 (또는 PR)
- [ ] v0.3.0 태그 생성
- [ ] 릴리스 노트 작성

#### Phase 6 완료 기준
- ✅ 모든 테스트 통과
- ✅ 11개 Feature 정상 동작
- ✅ 문서 업데이트 완료
- ✅ v0.3.0 릴리스 준비 완료

---

## 📊 리소스 계획

### 예상 시간

| Phase | 작업 내용 | 예상 시간 | 난이도 |
|---|---|---|---|
| **Phase 0** | 준비 작업 | 3.5시간 | 🟢 낮음 |
| **Phase 1** | 브랜치 설정 | 0.5시간 | 🟢 낮음 |
| **Phase 2** | Upstream 채택 | 1-2시간 | 🟡 중간 |
| **Phase 3** | Proto 재구현 | 2-3시간 | 🟡 중간 |
| **Phase 4** | Backend 재구현 | 8-12시간 | 🔴 높음 |
| **Phase 5** | Frontend 재구현 | 8-12시간 | 🔴 높음 |
| **Phase 6** | 최종 검증 | 4-6시간 | 🟡 중간 |
| **총계** | | **27-39시간** | |

### 작업 일정 (예상)

- **1일차**: Phase 0 ✅, Phase 1, Phase 2
- **2일차**: Phase 3, Phase 4.1-4.4
- **3일차**: Phase 4.5-4.9
- **4일차**: Phase 5.1-5.5
- **5일차**: Phase 5.6-5.7
- **6일차**: Phase 6

**총 예상 기간**: 5-6일 (풀타임 작업 기준)

---

## 🚨 위험 관리 계획

### 주요 위험 요소

| 위험 | 확률 | 영향도 | 완화 전략 |
|---|---|---|---|
| **disk.ts 충돌** (F03 + F08) | 높음 | 높음 | 순차 머지 + 통합 테스트 |
| **system-prompt 충돌** (F06) | 중간 | 높음 | 최소 분기만, Cline 로직 보존 |
| **API transform 변경** (F10) | 높음 | 중간 | Cline 최신 우선, 재평가 |
| **i18n 광범위 수정** (F02) | 낮음 | 중간 | 컴포넌트별 검증 |
| **Branding 광범위 수정** (F03) | 낮음 | 중간 | 자동화 스크립트 활용 |
| **Proto 코드 생성 실패** | 낮음 | 높음 | 스크립트 검증, 수동 수정 |

### 롤백 계획

**각 Phase별 롤백 포인트**:
```bash
# Phase 1 실패 시
git checkout backup/main-v0.2.4-20251009

# Phase 2-6 실패 시
git reset --hard <이전_phase_커밋_해시>

# 완전 롤백
git checkout main
git reset --hard backup/main-v0.2.4-20251009
```

**롤백 체크리스트**:
- [ ] 백업 브랜치 존재 확인
- [ ] 커밋 해시 기록 확인
- [ ] 롤백 후 컴파일 테스트
- [ ] 롤백 원인 분석 및 기록

---

## 📝 진행 상황 로그 (실시간 업데이트)

### Phase 0: 준비 작업 ✅

**날짜**: 2025-10-09
**작업자**: Claude + Luke

#### 완료 작업
- ✅ Phase 3 실패 분석 완료
- ✅ main 브랜치 복귀
- ✅ F01-F11 Feature 문서 보강 (100%)
- ✅ 침습 현황 마스터 문서 생성
- ✅ 머징 실행 마스터 플랜 생성
- ✅ Cline v3.32.7 타입 오류 근본 원인 분석

#### 커밋
- `9b1094e7c` - docs(f01): Add Modified Files section
- `eba860934` - docs(merging): Add master documents

---

### Phase 1: 브랜치 설정 및 백업 ✅

**날짜**: 2025-10-09
**작업자**: Claude + Luke

#### 완료 작업
- ✅ 백업 브랜치 생성: `backup/main-v0.2.4-20251009`
- ✅ 머징 브랜치 생성: `merge/cline-upstream-20251009`
- ✅ upstream 최신 상태 확인

---

### Phase 2: Upstream 완전 채택 ✅

**날짜**: 2025-10-09
**작업자**: Claude + Luke

#### 완료 작업
- ✅ Cline upstream hard reset 완료
- ✅ Caret 전용 디렉토리 복원
- ✅ 초기 컴파일 오류 파악

#### 커밋
- `03177da87` - chore(phase2): Adopt Cline upstream v3.32.7 completely

---

### Phase 3: Proto 재구현 ✅

**날짜**: 2025-10-09
**작업자**: Claude + Luke

#### 완료 작업
- ✅ Proto 파일 복원 (3개: common.proto, models.proto, account.proto)
- ✅ Proto 코드 생성 성공
- ✅ TypeScript 컴파일 오류 수정 (9개 → 0개)
- ✅ Lint 오류 수정 (12개 → 0개)

#### 커밋
- `8716ff2b4` - feat(merge): Complete Phase 3 - Proto re-implementation and build fixes
- `ba3afbc2f` - fix(Phase 3): Fix all TypeScript compilation errors
- `edad3ac87` - fix(lint): Fix lint errors to achieve 0 errors in Phase 3

#### 해결한 주요 이슈
- DifyHandler 클래스 속성 누락
- OpenAI/xAI/Cline provider 타입 assertion
- forEach lint 오류 12개 (for-of 루프로 변경)

---

### Phase 4.0: 타입 파일 보호 ✅

**날짜**: 2025-10-09
**작업자**: Claude + Luke

#### 완료 작업
- ✅ `.gitattributes` 생성 (merge=ours 전략 설정)
- ✅ 핵심 타입 파일 6개 보호 설정
- ✅ Git merge driver 설정

#### 커밋
- `ee6af3cf3` - chore(phase4.0): Protect Caret type solutions from upstream conflicts

---

### Phase 4.1: F09 - FeatureConfig Backend ✅

**날짜**: 2025-10-09
**작업자**: Claude + Luke

#### 완료 작업
- ✅ `caret-src/shared/FeatureConfig.ts` 복원
- ✅ `caret-src/shared/feature-config.json` 복원
- ✅ `StateManager.ts` 기본 provider 설정 추가
- ✅ `tsconfig.json` @caret alias 추가
- ✅ 빌드 성공 (0 errors)

#### 커밋
- `01b96bd2e` - feat(Phase 4.1): Re-implement F09 FeatureConfig Backend

---

### Phase 4.2-4.3: F03+F08 Backend 🔄 **90% 완료**

**날짜**: 2025-10-09
**작업자**: Claude + Luke
**현재 상태**: Lint 오류 1개 남음, 커밋 대기중

#### 완료 작업
- ✅ `src/core/storage/disk.ts` 수정 (Brand resolution + Persona files)
- ✅ Caret 전용 파일 복원 (8개):
  - CaretProviderWrapper.ts
  - CaretGlobalManager.ts
  - PersonaInitializer.ts 등 4개
  - ModeSystem.ts
  - CaretAccount.ts
  - CaretAccountService.ts
- ✅ TypeScript 컴파일 성공 (0 errors)

#### 현재 블로커
- ❌ Lint 오류 1개: `persona-initializer.ts:332`
  - Custom plugin 오류: globalState.update 사용
  - biome-ignore 추가 필요

#### 구조적 변경사항 (로깅됨)
- Brand resolution system 추가
- GlobalFileNames 업데이트 (8개 필드)
- Documents 경로 브랜딩 (Cline → Caret)
- **문서**: `caret-docs/work-logs/luke/phase-4-backend-changes.md`

---

### Phase 4.4-4.9: 나머지 Backend Features ⏸️

**대기중**: F06, F11, F01, F05, F10 Backend 재구현

---

## 📚 참고 자료

### 내부 문서
- [침습 현황 마스터](./cline-invasion-master-status.md)
- [Features 문서 F01-F11](../features/)
- [Phase 3 실패 분석](../../보고서(reports)/프로젝트 개선/Cline머징 전략/session-summary-20251009-phase3-verification.md)
- [작업 로그 마스터](../work-logs/luke/2025-10-09-features-enhancement-master.md)

### 외부 참조
- [Cline GitHub](https://github.com/cline/cline)
- [Caret GitHub](https://github.com/aicoding-caret/caret)

---

## 🎯 성공 기준

### 필수 조건 (Must Have)
- ✅ Cline 최신 upstream 완전 채택
- ✅ 11개 Feature 모두 정상 동작
- ✅ 모든 테스트 통과 (컴파일, 타입, unit, E2E)
- ✅ CARET MODIFICATION 주석 일관성
- ✅ 최소 침습 원칙 준수

### 바람직한 조건 (Should Have)
- ✅ 성능 저하 없음
- ✅ 메모리 사용 증가 최소화
- ✅ 코드 품질 유지 (lint, format)
- ✅ 문서 완전성

### 선택적 조건 (Nice to Have)
- ✅ 추가 기능 개선
- ✅ 리팩토링 기회 활용
- ✅ 테스트 커버리지 향상

---

## 👥 팀 및 역할

| 역할 | 담당자 | 책임 |
|---|---|---|
| **Project Owner** | Luke | 전체 의사결정, 검토 승인 |
| **Lead Developer** | Claude (AI) | 코드 구현, 문서화, 테스트 |
| **QA** | Claude + Luke | 검증, 테스트, 버그 수정 |

---

## 📞 커뮤니케이션 계획

### 체크포인트

- **Phase별 완료 시**: 진행 상황 보고 및 검토
- **주요 문제 발생 시**: 즉시 보고 및 대응 논의
- **일일 마감**: 진행 상황 요약 및 다음 계획 공유

### 문서 업데이트

- **실시간**: 진행 상황 로그 업데이트
- **Phase 완료**: 체크리스트 업데이트
- **프로젝트 완료**: 최종 보고서 작성

---

**🚀 Let's Merge Cline Upstream Successfully!**

**마지막 업데이트**: 2025-10-10 (Phase 4.0-4.4 완료: F09, F03, F08, F02 Backend ✅)
