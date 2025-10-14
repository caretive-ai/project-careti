# docs.caret.team 동기화 분석 및 작업 계획

**작성일**: 2025-10-14
**작성자**: Luke
**목적**: Cline 최신 문서를 docs.caret.team에 동기화하고 번역 작업 계획 수립

## 1. 현황 분석

### 1.1 레포지토리 구조

```
caret/
├── docs/                           # Mintlify 기반, Cline 브랜딩 (86개 .mdx 파일)
│   ├── features/
│   ├── getting-started/
│   ├── provider-config/
│   └── ...
│
docs.caret.team/
├── docs-en/                        # Docusaurus 기반, Caret 브랜딩 (80개 파일)
├── docs-ko/                        # 한국어 번역 (80개 파일)
├── docs-ja/                        # 일본어 번역 (80개 파일)
├── docs-zh/                        # 중국어 번역 (80개 파일)
└── docs-en_backup_20250911_213401/ # 백업 (마지막 동기화 시점)
```

### 1.2 비교 결과

**총 차이점**: 91개 파일/디렉토리

#### Cline에만 있는 문서 (추가 필요)
1. `features/cline-rules.mdx` → `features/caret-rules.mdx` 브랜딩 변환 필요
2. `features/dictation.mdx` ⭐ **신규 기능** (2024-10-09 추가)
3. `features/yolo-mode.mdx` ⭐ **신규 기능** (2024-10-09 추가)
4. `features/multiroot-workspace.mdx` ⭐ **신규 기능** (2024-10-09 추가)
5. `features/customization/` 디렉토리 전체
6. `getting-started/installing-cline.mdx` → `installing-caret.mdx`
7. `getting-started/what-is-cline.mdx` → `what-is-caret.mdx`
8. `prompting/cline-memory-bank.mdx` → `caret-memory-bank.mdx`
9. `provider-config/baseten.mdx`
10. `provider-config/litellm-and-cline-using-codestral.mdx` → Caret 버전

#### docs.caret.team에만 있는 문서 (이미 브랜딩 완료)
- `exploring-carets-tools/` (Cline: `exploring-clines-tools/`)
- 위 목록의 브랜딩 변환 버전들

#### 내용이 다른 문서 (업데이트 필요)
대부분의 공통 파일이 내용 차이 존재 - 총 91개 항목 중 주요 파일들 검토 필요

### 1.3 최근 Cline 문서 변경사항 (2024-10-09 이후)

**Git 로그 분석 결과**:
```
feee75b15 - Added multiroot docs (#6597)
888968d38 - Update local models docs
ba1267260 - Remove open in editor button (#6462)
246b0fa99 - Add documentation for changes introduced in 3.30 (#6512)
6c099fbe1 - docs: update documentation for Claude Sonnet 4.5 release (#6556)
c16e271c1 - Adding voice mode to Cline (#6208)
f37962bbf - Updated Baseten models to use dynamic fetching, added docs (#6148)
```

**주요 신규 기능**:
1. ✅ **YOLO Mode** - 모든 작업 자동 승인 모드
2. ✅ **Dictation** - 음성 입력 기능 (Cline 계정 전용)
3. ✅ **Multiroot Workspace** - 다중 루트 작업공간 지원
4. ✅ **Claude Sonnet 4.5** - 최신 모델 지원
5. ✅ **Baseten** - 새 프로바이더 추가

## 2. 작업 범위 정의

### 2.1 Phase 1: 신규 문서 추가 및 브랜딩 (우선순위: 높음)

**작업 대상**:
1. `features/yolo-mode.mdx` → docs-en + 번역 3개 언어
2. `features/dictation.mdx` → docs-en + 번역 3개 언어
3. `features/multiroot-workspace.mdx` → docs-en + 번역 3개 언어

**작업 프로세스**:
```bash
# 1. Cline → Caret 브랜딩 변환
- "Cline" → "Caret" 전체 교체
- "cline" → "caret" 소문자 교체 (URL, 파일명 등)
- docs.cline.bot → docs.caret.team

# 2. docs-en에 추가

# 3. 번역 작업
- docs-ko/ (한국어)
- docs-ja/ (일본어)
- docs-zh/ (중국어)

# 4. docs.json / sidebars 업데이트
```

### 2.2 Phase 2: 기존 문서 업데이트 (우선순위: 중간)

**작업 대상**:
- `features/auto-compact.mdx` - 최신 내용 반영
- `features/plan-and-act.mdx` - 업데이트 확인
- `features/focus-chain.mdx` - 변경사항 확인
- `provider-config/` 전체 - Baseten, 모델 업데이트

**검증 방법**:
```bash
# 각 파일별 diff 확인
diff docs/features/auto-compact.mdx docs.caret.team/docs-en/features/auto-compact.mdx

# 주요 변경사항만 추출하여 반영
```

### 2.3 Phase 3: customization 디렉토리 추가 (우선순위: 낮음)

**작업 대상**:
- `features/customization/` 폴더 전체 이관
- 브랜딩 변환 후 4개 언어로 번역

## 3. 번역 전략

### 3.1 번역 우선순위

**Tier 1 (즉시 번역)**:
- yolo-mode.mdx
- dictation.mdx (음성 입력은 한국어 사용자에게 중요)
- auto-compact.mdx 업데이트

**Tier 2 (2차 번역)**:
- multiroot-workspace.mdx
- provider-config 업데이트

**Tier 3 (추후 번역)**:
- customization/ 디렉토리

### 3.2 번역 품질 관리

1. **일관성 체크리스트**:
   ```
   ✓ Cline → Caret 브랜딩 완료
   ✓ 링크 docs.caret.team으로 수정
   ✓ 스크린샷 경로 확인
   ✓ 코드 블록 언어 지정
   ✓ 전문 용어 일관성 (용어집 참조)
   ```

2. **용어 통일**:
   - YOLO Mode → YOLO 모드 (한글), YOLOモード (일본어)
   - Auto Compact → 자동 압축 (한글), 自動圧縮 (일본어)
   - Dictation → 음성 입력 (한글), 音声入力 (일본語)

## 4. 작업 절차

### Step 1: 환경 준비
```bash
cd docs.caret.team
git checkout -b sync/cline-oct-2024
```

### Step 2: 신규 문서 추가 (Phase 1)
```bash
# 1. YOLO Mode
cp ../docs/features/yolo-mode.mdx docs-en/features/
# 브랜딩 변환
sed -i '' 's/Cline/Caret/g' docs-en/features/yolo-mode.mdx
sed -i '' 's/cline/caret/g' docs-en/features/yolo-mode.mdx
sed -i '' 's/docs\.cline\.bot/docs.caret.team\/en/g' docs-en/features/yolo-mode.mdx

# 2. 한국어 번역
# AI 번역 + 수동 검토
cp docs-en/features/yolo-mode.mdx docs-ko/features/

# 3. 일본어, 중국어 반복
```

### Step 3: docs.json 및 sidebars 업데이트
```typescript
// docs-en/docs.json
{
  "features": {
    "yolo-mode": "features/yolo-mode",
    "dictation": "features/dictation",
    "multiroot-workspace": "features/multiroot-workspace"
  }
}

// sidebars-en.ts, sidebars-ko.ts, sidebars-ja.ts, sidebars-zh.ts
```

### Step 4: 빌드 및 검증
```bash
npm run build
npm run start

# 각 언어별 확인
# http://localhost:3000/en/features/yolo-mode
# http://localhost:3000/ko/features/yolo-mode
# http://localhost:3000/ja/features/yolo-mode
# http://localhost:3000/zh/features/yolo-mode
```

### Step 5: 커밋 및 PR
```bash
git add .
git commit -m "feat: Add Cline 3.32+ features (YOLO Mode, Dictation, Multiroot)"
git push origin sync/cline-oct-2024
```

## 5. 예상 작업 시간

| 작업 | 예상 시간 | 비고 |
|------|----------|------|
| Phase 1-1: yolo-mode 추가 (4개 언어) | 2시간 | 브랜딩 + 번역 + 검토 |
| Phase 1-2: dictation 추가 (4개 언어) | 2시간 | 기술 용어 많음 |
| Phase 1-3: multiroot 추가 (4개 언어) | 2시간 | 비교적 간단 |
| Phase 2: 기존 문서 업데이트 | 3시간 | diff 확인 및 선택적 반영 |
| Phase 3: customization 추가 | 3시간 | 추후 진행 |
| **총 예상 시간** | **12시간** | 3일 분산 작업 권장 |

## 6. 리스크 및 대응 방안

### 리스크 1: 번역 품질 불일치
- **대응**: 각 언어별 네이티브 리뷰어 섭외 또는 AI 번역 후 크로스체크

### 리스크 2: Docusaurus 빌드 오류
- **대응**: 단계별 빌드 확인, 롤백 가능하도록 브랜치 관리

### 리스크 3: 링크 깨짐
- **대응**: 빌드 후 전체 링크 체크 스크립트 실행

## 7. 체크리스트

### 시작 전
- [ ] docs.caret.team 레포 최신 상태 확인
- [ ] 새 브랜치 생성
- [ ] Cline docs와 비교 분석 완료

### Phase 1
- [ ] yolo-mode.mdx 추가 (en, ko, ja, zh)
- [ ] dictation.mdx 추가 (en, ko, ja, zh)
- [ ] multiroot-workspace.mdx 추가 (en, ko, ja, zh)
- [ ] docs.json 업데이트
- [ ] sidebars 업데이트 (4개 언어)
- [ ] 빌드 테스트 성공
- [ ] 링크 확인 완료

### Phase 2
- [ ] auto-compact.mdx 업데이트
- [ ] plan-and-act.mdx 검토
- [ ] provider-config 업데이트
- [ ] 빌드 테스트 성공

### 완료 후
- [ ] 전체 언어 빌드 확인
- [ ] 링크 전수 조사
- [ ] PR 생성
- [ ] 문서 사이트 배포

## 8. 🌟 추가 계획: Caret Exclusive Features 섹션

### 8.1 배경 및 필요성

**현재 문제점**:
- docs.caret.team은 Cline 문서의 브랜딩 변환에 불과
- Caret만의 독자적 가치 제안이 불명확
- 강력한 독점 기능들이 숨겨져 있음

**Caret의 실제 차별화 기능**:
1. ✅ **페르소나 시스템** - AI 성격 커스터마이징
2. ✅ **듀얼 프롬프트 시스템** - Caret AGENT vs Cline ACT 모드
3. ✅ **브랜드 전환** - Caret ↔ CodeCenter 실시간 전환
4. ✅ **Caret 제공자** - 무료 Gemini 2.5 크레딧 ($10/월)
5. ✅ **완전 다국어** - ko, en, ja, zh UI 완전 번역
6. ✅ **통합 규칙 시스템** - .caretrules + .clinerules 통합

### 8.2 신규 섹션 구조

```
docs.caret.team/docs-{lang}/
├── caret-exclusive/           # 🆕 NEW SECTION
│   ├── overview.mdx           # Caret이 특별한 이유
│   ├── persona-system.mdx     # AI 페르소나 커스터마이징
│   ├── dual-prompt-modes.mdx  # Agent vs Act 모드
│   ├── brand-switching.mdx    # 브랜드 전환 시스템
│   ├── caret-provider.mdx     # 무료 Gemini 크레딧
│   ├── multilingual-ui.mdx    # 4개 언어 지원
│   └── advanced-rules.mdx     # 통합 규칙 시스템
```

### 8.3 작업 예상 시간

| 작업 단계 | 시간 | 세부 내용 |
|----------|------|----------|
| 영문 문서 작성 (7개) | 12h | overview(1h) + persona(3h) + dual-mode(2h) + brand(1.5h) + provider(2h) + multilingual(1h) + rules(1.5h) |
| 번역 (ko, ja, zh) | 9h | 각 언어 3시간 |
| 스크린샷/미디어 | 4h | UI 캡처 및 GIF 생성 |
| **총 예상 시간** | **25h** | 3-4일 분산 작업 |

### 8.4 우선순위 통합

**Phase 1-A: Cline 신규 기능 동기화** (6시간)
- yolo-mode, dictation, multiroot-workspace
- 4개 언어 번역

**Phase 1-B: Caret Exclusive Features** (25시간)
- 7개 독점 기능 문서 작성
- 4개 언어 번역
- 네비게이션 통합

**Phase 2: 기존 문서 업데이트** (3시간)
- auto-compact, provider-config 등

**Phase 3: customization 디렉토리** (3시간)
- 추후 진행

### 8.5 마케팅 임팩트

**Before**: "Caret은 Cline의 리브랜딩 버전입니다"
**After**: "Caret은 Cline + 페르소나, 듀얼 모드, 무료 크레딧을 더했습니다"

**홈페이지 Hero Section** (예시):
```markdown
# Caret: Cline, Supercharged

🎭 Customize AI personality with Persona System
🔄 Switch between Agent planning and Act execution
💎 Start free with Gemini 2.5 credits
🌍 Full multilingual support (4 languages)

[Get Started Free] [See What's Exclusive]
```

## 9. 다음 액션

### 즉시 시작 (우선순위 순)
1. **Caret Exclusive Features 섹션 시작**
   - overview.mdx 초안 작성
   - persona-system.mdx 작성 (가장 중요)

2. **Cline 신규 기능 동기화**
   - yolo-mode.mdx 브랜딩 변환
   - dictation.mdx 추가

3. **병행 작업**
   - 영문 작성과 한국어 번역 동시 진행
   - 빌드 테스트 주기적 실행

### 사용자 승인 후 진행
- Phase 1-A: Cline 기능 동기화 완료
- Phase 1-B: Exclusive Features 섹션 완성
- Phase 2: 기존 문서 업데이트
- Phase 3: customization 추가

---

**상태**: 통합 계획 수립 완료, 실행 대기 중
**예상 완료일**:
- Phase 1-A: 2025-10-16 (Cline 신규 기능)
- Phase 1-B: 2025-10-18 (Exclusive Features)
- Phase 2-3: 2025-10-20 (기존 문서 업데이트)

**총 작업량**: 37시간 (약 5일 작업)
